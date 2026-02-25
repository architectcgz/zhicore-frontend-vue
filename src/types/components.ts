/**
 * 组件特定类型
 *
 * 本模块定义 Vue 组件 props、事件和组件特定数据结构的类型安全结构。
 *
 * @module types/components
 */

import type { Component } from 'vue';

/**
 * 菜单项和 UI 组件的图标类型
 *
 * 支持 Element Plus 图标组件和字符串图标名称。
 * 字符串名称通常用于图标字体或 SVG sprite 引用。
 *
 * @example
 * ```typescript
 * import { User } from '@element-plus/icons-vue';
 *
 * // 使用组件
 * const icon1: IconType = User;
 *
 * // 使用字符串
 * const icon2: IconType = 'el-icon-user';
 * ```
 */
export type IconType = Component | string;

/**
 * 菜单项接口
 *
 * 表示导航菜单项，支持嵌套子项和可选徽章。
 *
 * @property path - 导航的路由路径
 * @property title - 菜单项的显示标题
 * @property icon - 图标组件或图标名称
 * @property badge - 可选的徽章计数（例如未读通知）
 * @property children - 可选的嵌套菜单项
 */
export interface MenuItem {
  path: string;
  title: string;
  icon: IconType;
  badge?: number;
  children?: MenuItem[];
}

/**
 * 组件错误信息
 *
 * 增强的 Vue 组件错误信息，包含强类型的 props 数据。
 *
 * @property componentName - 发生错误的 Vue 组件名称
 * @property propsData - 错误发生时的组件 props（强类型）
 * @property error - 错误对象
 */
export interface ComponentErrorInfo {
  componentName: string;
  propsData: Record<string, unknown>;
  error: Error;
}

/**
 * 按钮变体类型
 *
 * 应用程序中使用的常见按钮样式变体。
 */
export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'text';

/**
 * 按钮尺寸类型
 *
 * 用于一致 UI 的标准按钮尺寸。
 */
export type ButtonSize = 'large' | 'default' | 'small';

/**
 * 模态框尺寸类型
 *
 * 标准模态框/对话框尺寸。
 */
export type ModalSize = 'small' | 'medium' | 'large' | 'full';

/**
 * 加载状态
 *
 * 表示异步操作的加载状态。
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Toast/通知位置
 *
 * Toast 通知的位置选项。
 */
export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

/**
 * Toast/通知类型
 *
 * Toast 通知的类型，用于样式和图标。
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * 表单字段验证状态
 *
 * 表单字段的验证状态。
 */
export type ValidationState = 'valid' | 'invalid' | 'validating' | 'pending';

/**
 * 下拉菜单项
 *
 * 下拉菜单中的项，包含可选的分隔符和禁用状态。
 *
 * @property label - 显示标签
 * @property value - 项值
 * @property icon - 可选图标
 * @property disabled - 项是否禁用
 * @property divider - 是否在此项后显示分隔符
 * @property onClick - 可选的点击处理器
 */
export interface DropdownMenuItem {
  label: string;
  value: string | number;
  icon?: IconType;
  disabled?: boolean;
  divider?: boolean;
  onClick?: () => void;
}

/**
 * 标签页项
 *
 * 标签页导航组件中的项。
 *
 * @property key - 标签页的唯一键
 * @property label - 显示标签
 * @property icon - 可选图标
 * @property badge - 可选徽章计数
 * @property disabled - 标签页是否禁用
 */
export interface TabItem {
  key: string;
  label: string;
  icon?: IconType;
  badge?: number;
  disabled?: boolean;
}

/**
 * 面包屑项
 *
 * 面包屑导航组件中的项。
 *
 * @property label - 显示标签
 * @property path - 可选的路由路径（当前页面省略）
 * @property icon - 可选图标
 */
export interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: IconType;
}

/**
 * 分页配置
 *
 * 分页组件的配置。
 *
 * @property page - 当前页码（从 1 开始）
 * @property size - 每页项数
 * @property total - 总项数
 * @property pageSizes - 可用的每页大小选项
 */
export interface PaginationConfig {
  page: number;
  size: number;
  total: number;
  pageSizes?: number[];
}

/**
 * 排序配置
 *
 * 可排序表格/列表的配置。
 *
 * @property field - 排序字段名
 * @property order - 排序顺序
 */
export interface SortConfig {
  field: string;
  order: 'asc' | 'desc';
}

/**
 * 筛选配置
 *
 * 可筛选表格/列表的配置。
 *
 * @property field - 筛选字段名
 * @property operator - 筛选操作符
 * @property value - 筛选值
 */
export interface FilterConfig {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in';
  value: unknown;
}

/**
 * 表格列定义
 *
 * 表格列的配置。
 *
 * @property key - 唯一列键
 * @property label - 列标题标签
 * @property field - 数据字段名
 * @property width - 可选的列宽度
 * @property sortable - 列是否可排序
 * @property filterable - 列是否可筛选
 * @property align - 文本对齐方式
 * @property formatter - 可选的值格式化函数
 */
export interface TableColumn {
  key: string;
  label: string;
  field: string;
  width?: string | number;
  sortable?: boolean;
  filterable?: boolean;
  align?: 'left' | 'center' | 'right';
  formatter?: (value: unknown, row: Record<string, unknown>) => string;
}
