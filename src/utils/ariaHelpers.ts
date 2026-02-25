/**
 * ARIA 辅助工具函数
 * 提供常用的 ARIA 属性生成和管理功能
 */

/**
 * 生成唯一 ID
 */
export function generateId(prefix = 'aria'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 为图片生成 alt 文本
 */
export function generateImageAlt(context: {
  type?: 'avatar' | 'cover' | 'content' | 'icon' | 'logo';
  username?: string;
  title?: string;
  description?: string;
}): string {
  const { type, username, title, description } = context;

  switch (type) {
    case 'avatar':
      return username ? `${username}的头像` : '用户头像';
    case 'cover':
      return title ? `${title}的封面图` : '封面图';
    case 'content':
      return description || '文章配图';
    case 'icon':
      return '图标';
    case 'logo':
      return '网站Logo';
    default:
      return description || '图片';
  }
}

/**
 * 为按钮生成 aria-label
 */
export function generateButtonLabel(context: {
  action: 'like' | 'favorite' | 'share' | 'comment' | 'follow' | 'edit' | 'delete' | 'close' | 'menu' | 'search';
  target?: string;
  state?: boolean;
}): string {
  const { action, target, state } = context;

  const actionLabels: Record<string, string> = {
    like: state ? '取消点赞' : '点赞',
    favorite: state ? '取消收藏' : '收藏',
    share: '分享',
    comment: '评论',
    follow: state ? '取消关注' : '关注',
    edit: '编辑',
    delete: '删除',
    close: '关闭',
    menu: '菜单',
    search: '搜索',
  };

  const label = actionLabels[action] || action;
  return target ? `${label}${target}` : label;
}

/**
 * 为表单字段生成 aria-label
 */
export function generateFormLabel(context: {
  field: 'username' | 'email' | 'password' | 'title' | 'content' | 'search' | 'comment';
  required?: boolean;
  placeholder?: string;
}): string {
  const { field, required, placeholder } = context;

  const fieldLabels: Record<string, string> = {
    username: '用户名',
    email: '邮箱',
    password: '密码',
    title: '标题',
    content: '内容',
    search: '搜索',
    comment: '评论',
  };

  let label = fieldLabels[field] || field;
  
  if (required) {
    label += '（必填）';
  }
  
  if (placeholder) {
    label += `，${placeholder}`;
  }

  return label;
}

/**
 * 为链接生成 aria-label
 */
export function generateLinkLabel(context: {
  type: 'post' | 'user' | 'tag' | 'external';
  title?: string;
  username?: string;
  tagName?: string;
  url?: string;
}): string {
  const { type, title, username, tagName, url } = context;

  switch (type) {
    case 'post':
      return title ? `查看文章：${title}` : '查看文章';
    case 'user':
      return username ? `访问${username}的主页` : '访问用户主页';
    case 'tag':
      return tagName ? `查看标签：${tagName}` : '查看标签';
    case 'external':
      return url ? `打开外部链接：${url}` : '打开外部链接';
    default:
      return '链接';
  }
}

/**
 * 为状态生成 aria-label
 */
export function generateStatusLabel(context: {
  type: 'loading' | 'success' | 'error' | 'empty';
  message?: string;
}): string {
  const { type, message } = context;

  const statusLabels: Record<string, string> = {
    loading: '加载中',
    success: '操作成功',
    error: '操作失败',
    empty: '暂无数据',
  };

  const label = statusLabels[type] || type;
  return message ? `${label}：${message}` : label;
}

/**
 * 为通知生成 aria-label
 */
export function generateNotificationLabel(context: {
  type: 'like' | 'comment' | 'follow' | 'system';
  username?: string;
  content?: string;
  time?: string;
}): string {
  const { type, username, content, time } = context;

  let label = '';

  switch (type) {
    case 'like':
      label = username ? `${username}点赞了你的内容` : '有人点赞了你的内容';
      break;
    case 'comment':
      label = username ? `${username}评论了你的内容` : '有人评论了你的内容';
      break;
    case 'follow':
      label = username ? `${username}关注了你` : '有人关注了你';
      break;
    case 'system':
      label = '系统通知';
      break;
  }

  if (content) {
    label += `：${content}`;
  }

  if (time) {
    label += `，${time}`;
  }

  return label;
}

/**
 * 为进度生成 aria-valuetext
 */
export function generateProgressText(current: number, total: number, unit = '个'): string {
  return `已完成 ${current} ${unit}，共 ${total} ${unit}`;
}

/**
 * 为分页生成 aria-label
 */
export function generatePaginationLabel(context: {
  type: 'page' | 'prev' | 'next' | 'first' | 'last';
  current?: number;
  total?: number;
}): string {
  const { type, current, total } = context;

  switch (type) {
    case 'page':
      return current ? `第 ${current} 页` : '页码';
    case 'prev':
      return '上一页';
    case 'next':
      return '下一页';
    case 'first':
      return '第一页';
    case 'last':
      return total ? `最后一页（第 ${total} 页）` : '最后一页';
    default:
      return '分页';
  }
}

/**
 * 为排序生成 aria-label
 */
export function generateSortLabel(context: {
  field: string;
  order?: 'asc' | 'desc';
}): string {
  const { field, order } = context;

  const orderLabels = {
    asc: '升序',
    desc: '降序',
  };

  const orderText = order ? orderLabels[order] : '未排序';
  return `按${field}${orderText}`;
}

/**
 * 为筛选生成 aria-label
 */
export function generateFilterLabel(context: {
  field: string;
  value?: string | number;
  active?: boolean;
}): string {
  const { field, value, active } = context;

  let label = `筛选${field}`;
  
  if (value) {
    label += `：${value}`;
  }
  
  if (active) {
    label += '（已激活）';
  }

  return label;
}

/**
 * 为标签页生成 aria-label
 */
export function generateTabLabel(context: {
  name: string;
  count?: number;
  active?: boolean;
}): string {
  const { name, count, active } = context;

  let label = name;
  
  if (count !== undefined) {
    label += `（${count}）`;
  }
  
  if (active) {
    label += '，当前标签页';
  }

  return label;
}

/**
 * 为模态框生成 aria-label
 */
export function generateModalLabel(context: {
  type: 'dialog' | 'alert' | 'confirm';
  title?: string;
}): string {
  const { type, title } = context;

  const typeLabels: Record<string, string> = {
    dialog: '对话框',
    alert: '警告',
    confirm: '确认',
  };

  const typeLabel = typeLabels[type] || '弹窗';
  return title ? `${title} - ${typeLabel}` : typeLabel;
}

/**
 * 为下拉菜单生成 aria-label
 */
export function generateMenuLabel(context: {
  type: 'user' | 'notification' | 'settings' | 'more';
  username?: string;
}): string {
  const { type, username } = context;

  const menuLabels: Record<string, string> = {
    user: username ? `${username}的菜单` : '用户菜单',
    notification: '通知菜单',
    settings: '设置菜单',
    more: '更多选项',
  };

  return menuLabels[type] || '菜单';
}

/**
 * 为列表项生成 aria-label
 */
export function generateListItemLabel(context: {
  type: 'post' | 'comment' | 'user' | 'notification';
  index: number;
  total?: number;
  title?: string;
}): string {
  const { type, index, total, title } = context;

  const typeLabels: Record<string, string> = {
    post: '文章',
    comment: '评论',
    user: '用户',
    notification: '通知',
  };

  const typeLabel = typeLabels[type] || '项目';
  let label = `第 ${index + 1} 个${typeLabel}`;
  
  if (total) {
    label += `，共 ${total} 个`;
  }
  
  if (title) {
    label += `：${title}`;
  }

  return label;
}
