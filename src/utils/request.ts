/**
 * HTTP 请求工具类
 * 基于 Axios 封装，提供统一的请求配置、拦截器和错误处理
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '@/stores/auth';
import { API_BASE_URL } from '@/utils/constants';
import type { ApiResponse, ApiError, RequestConfig } from '@/types';
import type { AppError } from '@/types/errors';
import type { UploadProgressHandler } from '@/types/events';

/**
 * 请求参数类型
 * 
 * 用于 GET 请求的查询参数。接受任何对象类型。
 */
export type RequestParams = Record<string, any>;

/**
 * 请求体类型
 * 
 * 用于 POST/PUT/PATCH 请求的请求体。接受任何对象类型或 FormData。
 */
export type RequestBody = Record<string, any> | FormData;

// 请求超时时间（毫秒）
const REQUEST_TIMEOUT = 10000;

// 最大重试次数（暂未使用，保留供将来使用）
// const MAX_RETRIES = 3;

// Token 刷新状态管理
class TokenRefreshManager {
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: AppError) => void;
  }> = [];

  /**
   * Single-Flight Token 刷新机制
   * 确保同时只有一个刷新请求，其他请求等待
   */
  async refreshToken(): Promise<string> {
    const authStore = useAuthStore();

    // 如果正在刷新，将请求加入队列
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;

    try {
      // 调用刷新 Token 接口
      const newToken = await authStore.refreshAccessToken();
      
      // 处理队列中的请求
      this.processQueue(null, newToken);
      
      return newToken;
    } catch (error: unknown) {
      // 刷新失败，处理队列中的请求
      this.processQueue(error as AppError, null);
      
      // 清除认证信息并跳转到登录页
      authStore.logout();
      
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * 处理等待队列中的请求
   */
  private processQueue(error: AppError | null, token: string | null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token!);
      }
    });

    this.failedQueue = [];
  }
}

// Token 刷新管理器实例
const tokenRefreshManager = new TokenRefreshManager();

/**
 * 生成请求 ID
 * 用于请求追踪和去重
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 创建 Axios 实例
 */
function createAxiosInstance(): AxiosInstance {
  const instance = axios.create({
    baseURL: API_BASE_URL || 'http://localhost:8100/api/v1',
    timeout: REQUEST_TIMEOUT,
    withCredentials: true, // Enable credentials for CORS requests
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  // 请求拦截器
  instance.interceptors.request.use(
    (config) => {
      // 添加请求 ID
      config.headers['X-Request-ID'] = generateRequestId();

      // 添加时间戳（防止缓存）
      config.headers['X-Timestamp'] = Date.now().toString();

      // 添加认证 Token
      const authStore = useAuthStore();
      const token = authStore.accessToken;
      
      if (token && !config.headers['skip-auth']) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // 记录请求日志（开发环境）
      if (import.meta.env.DEV) {
        console.log(`[HTTP Request] ${config.method?.toUpperCase()} ${config.url}`, {
          headers: config.headers,
          data: config.data,
          params: config.params,
        });
      }

      return config;
    },
    (error) => {
      console.error('[HTTP Request Error]', error);
      return Promise.reject(error);
    }
  );

  // 响应拦截器
  instance.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
      // 记录响应日志（开发环境）
      if (import.meta.env.DEV) {
        console.log(`[HTTP Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
          status: response.status,
          data: response.data,
        });
      }

      // 检查业务状态码
      const { code, message } = response.data;
      
      if (code === 200 || code === 0) {
        // 成功响应，返回数据
        return response;
      } else {
        // 业务错误
        const error = new Error(message || '请求失败') as any;
        error.code = code;
        error.response = response;
        return Promise.reject(error);
      }
    },
    async (error: AxiosError<ApiResponse>) => {
      const { config, response } = error;

      // 记录错误日志
      console.error('[HTTP Response Error]', {
        url: config?.url,
        status: response?.status,
        data: response?.data,
        message: error.message,
      });

      // Token 过期处理
      if (response?.status === 401 && !config?.headers['skip-auth']) {
        try {
          // 尝试刷新 Token
          const newToken = await tokenRefreshManager.refreshToken();
          
          // 重新发送原请求
          if (config && newToken) {
            config.headers.Authorization = `Bearer ${newToken}`;
            return instance.request(config);
          }
        } catch (refreshError) {
          // Token 刷新失败，跳转到登录页
          console.error('[Token Refresh Failed]', refreshError);
          return Promise.reject(error);
        }
      }

      // 网络错误处理
      if (!response) {
        // CORS 错误检测
        if (error.message.includes('CORS') || 
            error.message.includes('cross-origin') ||
            (error.code === 'ERR_NETWORK' && !navigator.onLine === false)) {
          ElMessage.error('跨域请求失败，请检查服务器 CORS 配置');
          console.error('[CORS Error]', {
            message: error.message,
            config: config?.url,
            origin: window.location.origin,
          });
        } else if (error.code === 'ECONNABORTED') {
          ElMessage.error('请求超时，请检查网络连接');
        } else if (error.message.includes('Network Error')) {
          ElMessage.error('网络连接失败，请检查网络设置');
        } else {
          ElMessage.error('网络异常，请稍后重试');
        }
        return Promise.reject(error);
      }

      // HTTP 状态码错误处理
      const status = response.status;
      const apiError: ApiError = {
        code: status,
        message: response.data?.message || '请求失败',
        timestamp: Date.now(),
        stack: error.stack,
      };

      // 根据状态码显示不同错误信息
      switch (status) {
        case 400:
          ElMessage.error(apiError.message || '请求参数错误');
          break;
        case 401:
          ElMessage.error('登录已过期，请重新登录');
          break;
        case 403:
          ElMessage.error('没有权限访问该资源');
          break;
        case 404:
          ElMessage.error('请求的资源不存在');
          break;
        case 409:
          ElMessage.error(apiError.message || '数据冲突');
          break;
        case 422:
          ElMessage.error(apiError.message || '数据验证失败');
          break;
        case 429:
          ElMessage.error('请求过于频繁，请稍后重试');
          break;
        case 500:
          ElMessage.error('服务器内部错误');
          break;
        case 502:
          ElMessage.error('网关错误');
          break;
        case 503:
          ElMessage.error('服务暂时不可用');
          break;
        default:
          ElMessage.error(apiError.message || `请求失败 (${status})`);
      }

      return Promise.reject(error);
    }
  );

  return instance;
}

// 创建默认实例
const request = createAxiosInstance();

/**
 * 通用请求方法
 */
export class HttpClient {
  private instance: AxiosInstance;

  constructor(instance?: AxiosInstance) {
    this.instance = instance || request;
  }

  /**
   * GET 请求
   */
  async get<T = any>(
    url: string,
    params?: RequestParams,
    config?: RequestConfig
  ): Promise<T> {
    const response = await this.instance.get<ApiResponse<T>>(url, {
      params,
      ...this.buildConfig(config),
    });
    return response.data.data;
  }

  /**
   * POST 请求
   */
  async post<T = any>(
    url: string,
    data?: RequestBody,
    config?: RequestConfig
  ): Promise<T> {
    const response = await this.instance.post<ApiResponse<T>>(url, data, {
      ...this.buildConfig(config),
    });
    return response.data.data;
  }

  /**
   * PUT 请求
   */
  async put<T = any>(
    url: string,
    data?: RequestBody,
    config?: RequestConfig
  ): Promise<T> {
    const response = await this.instance.put<ApiResponse<T>>(url, data, {
      ...this.buildConfig(config),
    });
    return response.data.data;
  }

  /**
   * PATCH 请求
   */
  async patch<T = any>(
    url: string,
    data?: RequestBody,
    config?: RequestConfig
  ): Promise<T> {
    const response = await this.instance.patch<ApiResponse<T>>(url, data, {
      ...this.buildConfig(config),
    });
    return response.data.data;
  }

  /**
   * DELETE 请求
   */
  async delete<T = any>(
    url: string,
    config?: RequestConfig
  ): Promise<T> {
    const response = await this.instance.delete<ApiResponse<T>>(url, {
      ...this.buildConfig(config),
    });
    return response.data.data;
  }

  /**
   * 文件上传
   */
  async upload<T = any>(
    url: string,
    formData: FormData,
    config?: RequestConfig & {
      onUploadProgress?: UploadProgressHandler;
    }
  ): Promise<T> {
    const response = await this.instance.post<ApiResponse<T>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...this.buildConfig(config),
      onUploadProgress: config?.onUploadProgress,
    });
    return response.data.data;
  }

  /**
   * 构建请求配置
   */
  private buildConfig(config?: RequestConfig): AxiosRequestConfig {
    const axiosConfig: AxiosRequestConfig = {};

    if (config?.timeout) {
      axiosConfig.timeout = config.timeout;
    }

    if (config?.skipAuth) {
      axiosConfig.headers = { 'skip-auth': 'true' };
    }

    if (config?.skipErrorHandler) {
      axiosConfig.headers = { 
        ...axiosConfig.headers,
        'skip-error-handler': 'true' 
      };
    }

    return axiosConfig;
  }
}

// 创建默认 HTTP 客户端实例
export const httpClient = new HttpClient();

// 导出便捷方法
export const { get, post, put, patch, delete: del, upload } = httpClient;

// 导出 Axios 实例（用于特殊需求）
export { request };

// 导出类型
export type { RequestConfig };