/**
 * 知构平台用户角色。
 *
 * - admin:  平台管理员，可访问管理后台
 * - author: 内容创作者，可发布 / 编辑文章
 * - user:   普通注册用户，可评论 / 收藏 / 点赞
 */
export type UserRole = 'admin' | 'author' | 'user'

export interface AuthUser {
  id: string
  username: string
  role: UserRole
  displayName?: string
  avatar?: string
}

/**
 * 获取用户展示名，优先 displayName，其次 username。
 */
export function getUserDisplayName(user: AuthUser | null): string {
  if (!user) {
    return '未登录'
  }
  return user.displayName || user.username
}
