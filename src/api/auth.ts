import type { AuthUser } from '@/entities/user/model/user'

import { getAxiosInstance } from './request'

/**
 * 获取当前登录用户信息。
 * 后端通过 cookie / session 识别身份，无需传参。
 */
export async function getProfile(): Promise<AuthUser> {
  const response = await getAxiosInstance().get<AuthUser>('/auth/profile')
  return response.data
}

/**
 * 用户名 + 密码登录。
 * 登录成功后后端设置 session cookie，后续请求自动携带。
 */
export async function login(input: { username: string; password: string }): Promise<AuthUser> {
  const response = await getAxiosInstance().post<AuthUser>('/auth/login', input)
  return response.data
}

/**
 * 登出，清除服务端 session。
 */
export async function logout(): Promise<void> {
  await getAxiosInstance().post('/auth/logout')
}
