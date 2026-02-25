/**
 * 本地存储迁移工具
 * 用于清理旧的 blog- 前缀的存储键，迁移到新的 zhicore- 前缀
 */

/**
 * 旧的存储键名（blog- 前缀）
 */
const OLD_KEYS = {
  ACCESS_TOKEN: 'blog-access-token',
  REFRESH_TOKEN: 'blog-refresh-token',
  USER_INFO: 'blog-user-info',
  TOKEN_EXPIRES_AT: 'blog-token-expires-at',
} as const;

/**
 * 新的存储键名（zhicore- 前缀）
 */
const NEW_KEYS = {
  ACCESS_TOKEN: 'zhicore-access-token',
  REFRESH_TOKEN: 'zhicore-refresh-token',
  USER_INFO: 'zhicore-user-info',
  TOKEN_EXPIRES_AT: 'zhicore-token-expires-at',
} as const;

/**
 * 迁移标记键名
 */
const MIGRATION_FLAG_KEY = 'zhicore-storage-migrated';

/**
 * 检查是否已经执行过迁移
 */
function isMigrated(): boolean {
  try {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(MIGRATION_FLAG_KEY) === 'true';
  } catch (error) {
    console.error('Failed to check migration status:', error);
    return true; // 出错时假设已迁移，避免重复执行
  }
}

/**
 * 标记迁移已完成
 */
function markMigrated(): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(MIGRATION_FLAG_KEY, 'true');
    }
  } catch (error) {
    console.error('Failed to mark migration as completed:', error);
  }
}

/**
 * 迁移单个存储项
 * @param oldKey 旧键名
 * @param newKey 新键名
 * @returns 是否成功迁移
 */
function migrateItem(oldKey: string, newKey: string): boolean {
  try {
    if (typeof window === 'undefined') return false;

    const oldValue = localStorage.getItem(oldKey);
    
    // 如果旧键存在值
    if (oldValue !== null) {
      // 检查新键是否已有值
      const newValue = localStorage.getItem(newKey);
      
      if (newValue === null) {
        // 新键没有值，迁移旧值
        localStorage.setItem(newKey, oldValue);
        console.log(`Migrated: ${oldKey} → ${newKey}`);
      } else {
        // 新键已有值，保留新值，只删除旧键
        console.log(`Skipped migration (new key exists): ${oldKey} → ${newKey}`);
      }
      
      // 删除旧键
      localStorage.removeItem(oldKey);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Failed to migrate ${oldKey} to ${newKey}:`, error);
    return false;
  }
}

/**
 * 执行存储迁移
 * 将旧的 blog- 前缀的键迁移到新的 zhicore- 前缀
 * 
 * @returns 迁移结果统计
 */
export function migrateStorage(): {
  success: boolean;
  migratedCount: number;
  totalCount: number;
} {
  // 检查是否已迁移
  if (isMigrated()) {
    console.log('Storage migration already completed, skipping...');
    return {
      success: true,
      migratedCount: 0,
      totalCount: 0,
    };
  }

  console.log('Starting storage migration from blog- to zhicore- prefix...');

  let migratedCount = 0;
  const totalCount = Object.keys(OLD_KEYS).length;

  try {
    // 迁移所有键
    if (migrateItem(OLD_KEYS.ACCESS_TOKEN, NEW_KEYS.ACCESS_TOKEN)) migratedCount++;
    if (migrateItem(OLD_KEYS.REFRESH_TOKEN, NEW_KEYS.REFRESH_TOKEN)) migratedCount++;
    if (migrateItem(OLD_KEYS.USER_INFO, NEW_KEYS.USER_INFO)) migratedCount++;
    if (migrateItem(OLD_KEYS.TOKEN_EXPIRES_AT, NEW_KEYS.TOKEN_EXPIRES_AT)) migratedCount++;

    // 标记迁移完成
    markMigrated();

    console.log(`Storage migration completed: ${migratedCount}/${totalCount} items migrated`);

    return {
      success: true,
      migratedCount,
      totalCount,
    };
  } catch (error) {
    console.error('Storage migration failed:', error);
    return {
      success: false,
      migratedCount,
      totalCount,
    };
  }
}

/**
 * 清理所有旧的存储键（不迁移数据）
 * 仅用于开发环境或需要强制清理的场景
 */
export function cleanupOldStorage(): void {
  try {
    if (typeof window === 'undefined') return;

    console.log('Cleaning up old storage keys...');

    Object.values(OLD_KEYS).forEach(key => {
      localStorage.removeItem(key);
      console.log(`Removed: ${key}`);
    });

    console.log('Old storage keys cleaned up');
  } catch (error) {
    console.error('Failed to cleanup old storage:', error);
  }
}

/**
 * 重置迁移状态（仅用于测试）
 */
export function resetMigrationFlag(): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(MIGRATION_FLAG_KEY);
    console.log('Migration flag reset');
  } catch (error) {
    console.error('Failed to reset migration flag:', error);
  }
}
