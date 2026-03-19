<!--
  用户主页
  显示用户信息、文章列表、收藏列表、关注列表等
-->
<template>
  <div class="user-profile-page">
    <!-- 加载状态 -->
    <div
      v-if="loading"
      class="loading-container"
    >
      <LoadingSpinner size="large" />
      <p>正在加载用户信息...</p>
    </div>

    <!-- 错误状态 -->
    <div
      v-else-if="error"
      class="error-container"
    >
      <div
        v-if="isUnauthorizedError"
        class="auth-required-state"
      >
        <div
          class="auth-required-icon"
          aria-hidden="true"
        >
          401
        </div>
        <h2 class="auth-required-title">
          请先登录
        </h2>
        <p class="auth-required-description">
          当前页面需要登录后访问。登录后可查看完整的用户资料、收藏和关注信息。
        </p>
        <div class="auth-required-actions">
          <el-button
            type="primary"
            @click="handleGoLogin"
          >
            去登录
          </el-button>
          <el-button @click="handleGoHome">
            返回首页
          </el-button>
          <el-button
            text
            @click="handleRetry"
          >
            重新加载
          </el-button>
        </div>
      </div>
      <div
        v-else
      >
        <SiteErrorState
          title="加载用户信息失败"
          :message="displayErrorMessage"
          mode="section"
          retry-text="重试加载"
          @retry="handleRetry"
        />
      </div>
    </div>

    <!-- 用户信息 -->
    <div
      v-else-if="userProfile"
      class="profile-container"
    >
      <!-- 用户信息头部 -->
      <div class="profile-header">
        <div class="header-background" />
        <div class="header-content">
          <div class="user-info">
            <div class="avatar-section">
              <img 
                :src="userProfile.avatar || '/images/default-avatar.svg'" 
                :alt="userProfile.nickname"
                class="user-avatar"
              >
            </div>
            <div class="info-section">
              <h1 class="user-name">
                {{ userProfile.nickname }}
              </h1>
              <p class="user-username">
                @{{ userProfile.username }}
              </p>
              <p
                v-if="userProfile.bio"
                class="user-bio"
              >
                {{ userProfile.bio }}
              </p>
              <div class="user-stats">
                <div class="stat-item">
                  <span class="stat-number">{{ userProfile.postsCount }}</span>
                  <span class="stat-label">文章</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">{{ userProfile.followersCount }}</span>
                  <span class="stat-label">粉丝</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">{{ userProfile.followingCount }}</span>
                  <span class="stat-label">关注</span>
                </div>
              </div>
            </div>
          </div>
          <div class="action-section">
            <!-- 如果是当前用户，显示编辑按钮 -->
            <el-button 
              v-if="isCurrentUser" 
              type="primary" 
              @click="handleEditProfile"
            >
              编辑资料
            </el-button>
            <!-- 如果是其他用户，显示关注/取消关注按钮 -->
            <el-button 
              v-else
              :type="isFollowing ? 'default' : 'primary'"
              :loading="followLoading"
              @click="handleFollowToggle"
            >
              {{ isFollowing ? '取消关注' : '关注' }}
            </el-button>
            <!-- 发私信按钮 -->
            <el-button 
              v-if="!isCurrentUser"
              :loading="isCreatingConversation"
              @click="handleSendMessage"
            >
              发私信
            </el-button>
          </div>
        </div>
      </div>

      <!-- 签到组件（仅当前用户可见） -->
      <div
        v-if="isCurrentUser"
        class="check-in-section"
      >
        <CheckInWidget :user-id="userId" />
      </div>

      <!-- 标签页导航 -->
      <div class="profile-tabs">
        <el-tabs
          v-model="activeTab"
          @tab-change="handleTabChange"
        >
          <el-tab-pane
            label="文章"
            name="posts"
          >
            <div class="tab-content">
              <div
                v-if="posts.loading"
                class="loading-content"
              >
                <LoadingSpinner />
                <p>正在加载文章...</p>
              </div>
              <div
                v-else-if="posts.error"
                class="error-content"
              >
                <SiteErrorState
                  title="加载文章失败"
                  :message="posts.error"
                  mode="section"
                  retry-text="重试加载"
                  @retry="loadUserPosts"
                />
              </div>
              <div
                v-else-if="posts.list.length === 0"
                class="empty-content"
              >
                <EmptyState 
                  icon="el-icon-document"
                  :title="isCurrentUser ? '还没有发布文章' : '该用户还没有发布文章'"
                  :description="isCurrentUser ? '开始创作你的第一篇文章吧' : ''"
                >
                  <el-button 
                    v-if="isCurrentUser" 
                    type="primary" 
                    @click="handleCreatePost"
                  >
                    写文章
                  </el-button>
                </EmptyState>
              </div>
              <div
                v-else
                class="posts-grid"
              >
                <PostCard
                  v-for="post in posts.list"
                  :key="post.id"
                  :post="post"
                  @click="handlePostClick(post.id)"
                  @like-change="handleLikeChange"
                  @favorite-change="handleFavoriteChange"
                />
              </div>
              <!-- 加载更多 -->
              <div
                v-if="posts.hasMore"
                class="load-more"
              >
                <el-button 
                  :loading="posts.loadingMore" 
                  @click="loadMorePosts"
                >
                  加载更多
                </el-button>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane
            label="收藏"
            name="favorites"
          >
            <div class="tab-content">
              <div
                v-if="favorites.loading"
                class="loading-content"
              >
                <LoadingSpinner />
                <p>正在加载收藏...</p>
              </div>
              <div
                v-else-if="favorites.error"
                class="error-content"
              >
                <SiteErrorState
                  title="加载收藏失败"
                  :message="favorites.error"
                  mode="section"
                  retry-text="重试加载"
                  @retry="loadUserFavorites"
                />
              </div>
              <div
                v-else-if="favorites.list.length === 0"
                class="empty-content"
              >
                <EmptyState 
                  icon="el-icon-star-off"
                  title="还没有收藏文章"
                  description="收藏喜欢的文章，方便以后查看"
                />
              </div>
              <div
                v-else
                class="posts-grid"
              >
                <PostCard
                  v-for="post in favorites.list"
                  :key="post.id"
                  :post="post"
                  @click="handlePostClick(post.id)"
                  @like-change="handleLikeChange"
                  @favorite-change="handleFavoriteChange"
                />
              </div>
              <!-- 加载更多 -->
              <div
                v-if="favorites.hasMore"
                class="load-more"
              >
                <el-button 
                  :loading="favorites.loadingMore" 
                  @click="loadMoreFavorites"
                >
                  加载更多
                </el-button>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane
            label="关注"
            name="following"
          >
            <div class="tab-content">
              <div
                v-if="following.loading"
                class="loading-content"
              >
                <LoadingSpinner />
                <p>正在加载关注列表...</p>
              </div>
              <div
                v-else-if="following.error"
                class="error-content"
              >
                <SiteErrorState
                  title="加载关注失败"
                  :message="following.error"
                  mode="section"
                  retry-text="重试加载"
                  @retry="loadUserFollowing"
                />
              </div>
              <div
                v-else-if="following.list.length === 0"
                class="empty-content"
              >
                <EmptyState 
                  icon="el-icon-user"
                  title="还没有关注任何人"
                  description="关注感兴趣的作者，获取最新动态"
                />
              </div>
              <div
                v-else
                class="users-list"
              >
                <UserCard
                  v-for="user in following.list"
                  :key="user.id"
                  :user="user"
                  variant="plain"
                  @click="handleUserClick(user.id)"
                />
              </div>
              <!-- 加载更多 -->
              <div
                v-if="following.hasMore"
                class="load-more"
              >
                <el-button 
                  :loading="following.loadingMore" 
                  @click="loadMoreFollowing"
                >
                  加载更多
                </el-button>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane
            label="粉丝"
            name="followers"
          >
            <div class="tab-content">
              <div
                v-if="followers.loading"
                class="loading-content"
              >
                <LoadingSpinner />
                <p>正在加载粉丝列表...</p>
              </div>
              <div
                v-else-if="followers.error"
                class="error-content"
              >
                <SiteErrorState
                  title="加载粉丝失败"
                  :message="followers.error"
                  mode="section"
                  retry-text="重试加载"
                  @retry="loadUserFollowers"
                />
              </div>
              <div
                v-else-if="followers.list.length === 0"
                class="empty-content"
              >
                <EmptyState 
                  icon="el-icon-user"
                  title="还没有粉丝"
                  description="创作优质内容，吸引更多关注者"
                />
              </div>
              <div
                v-else
                class="users-list"
              >
                <UserCard
                  v-for="user in followers.list"
                  :key="user.id"
                  :user="user"
                  variant="plain"
                  @click="handleUserClick(user.id)"
                />
              </div>
              <!-- 加载更多 -->
              <div
                v-if="followers.hasMore"
                class="load-more"
              >
                <el-button 
                  :loading="followers.loadingMore" 
                  @click="loadMoreFollowers"
                >
                  加载更多
                </el-button>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '@/stores/auth';
import { useUser } from '@/composables/useUser';
import { useCreateConversationMutation } from '@/queries/messages';
import type { User, Post } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import SiteErrorState from '@/components/common/SiteErrorState.vue';
import PostCard from '@/components/post/PostCard.vue';
import UserCard from '@/components/user/UserCard.vue';
import CheckInWidget from '@/components/user/CheckInWidget.vue';

// 路由
const router = useRouter();
const route = useRoute();

// 获取用户 ID
const userId = computed(() => route.params.id as string);

// 认证状态
const authStore = useAuthStore();

// 组合式函数
const { 
  userProfile, 
  loading, 
  error, 
  errorStatus,
  followLoading,
  isFollowing,
  fetchUserProfile, 
  followUser, 
  unfollowUser,
  getUserPosts,
  getUserFavorites,
  getUserFollowing,
  getUserFollowers
} = useUser();

// TanStack Query mutations
const { mutate: createConversation, isPending: isCreatingConversation } = useCreateConversationMutation();

// 响应式状态
const activeTab = ref('posts');

// 内容列表状态
const posts = ref({
  list: [] as Post[],
  loading: false,
  loadingMore: false,
  error: '',
  hasMore: true,
  page: 1,
});

const favorites = ref({
  list: [] as Post[],
  loading: false,
  loadingMore: false,
  error: '',
  hasMore: true,
  page: 1,
});

const following = ref({
  list: [] as User[],
  loading: false,
  loadingMore: false,
  error: '',
  hasMore: true,
  page: 1,
});

const followers = ref({
  list: [] as User[],
  loading: false,
  loadingMore: false,
  error: '',
  hasMore: true,
  page: 1,
});

// 计算属性
const isCurrentUser = computed(() => {
  return authStore.user?.id === userId.value;
});

const isUnauthorizedError = computed(() => errorStatus.value === 401);

const displayErrorMessage = computed(() => {
  if (isUnauthorizedError.value) {
    return '请先登录后再试。';
  }

  return error.value || '加载用户信息失败，请稍后重试';
});

// 生命周期
onMounted(() => {
  loadUserProfile();
  loadTabContent();
});

// 监听路由参数变化
watch(userId, () => {
  loadUserProfile();
  resetTabsData();
  loadTabContent();
});

// 监听标签页切换
watch(activeTab, () => {
  loadTabContent();
});

/**
 * 加载用户资料
 */
const loadUserProfile = async () => {
  await fetchUserProfile(userId.value);
};

/**
 * 处理重试
 */
const handleRetry = () => {
  loadUserProfile();
};

const handleGoLogin = () => {
  router.push({
    path: '/auth/login',
    query: { redirect: route.fullPath },
  });
};

const handleGoHome = () => {
  router.push('/');
};

/**
 * 处理编辑资料
 */
const handleEditProfile = () => {
  router.push('/settings');
};

/**
 * 处理关注/取消关注
 */
const handleFollowToggle = async () => {
  if (!userProfile.value) return;

  try {
    if (isFollowing.value) {
      await unfollowUser(userProfile.value.id);
    } else {
      await followUser(userProfile.value.id);
    }
    // 重新加载用户资料以更新统计数据
    await loadUserProfile();
  } catch (error) {
    console.error('关注操作失败:', error);
  }
};

/**
 * 处理发私信
 */
const handleSendMessage = () => {
  if (!userProfile.value) return;
  
  // 使用 TanStack Query mutation 创建会话
  createConversation(userProfile.value.id, {
    onSuccess: (conversation) => {
      // 导航到消息页面，并传递会话 ID
      router.push(`/messages?conversation=${conversation.id}`);
    },
    onError: (error) => {
      console.error('创建会话失败:', error);
      ElMessage.error('创建会话失败，请稍后重试');
    },
  });
};

/**
 * 处理标签页切换
 */
const handleTabChange = (tabName: string) => {
  activeTab.value = tabName;
};

/**
 * 加载标签页内容
 */
const loadTabContent = () => {
  switch (activeTab.value) {
    case 'posts':
      if (posts.value.list.length === 0) {
        loadUserPosts();
      }
      break;
    case 'favorites':
      if (favorites.value.list.length === 0) {
        loadUserFavorites();
      }
      break;
    case 'following':
      if (following.value.list.length === 0) {
        loadUserFollowing();
      }
      break;
    case 'followers':
      if (followers.value.list.length === 0) {
        loadUserFollowers();
      }
      break;
  }
};

/**
 * 重置标签页数据
 */
const resetTabsData = () => {
  posts.value = { list: [], loading: false, loadingMore: false, error: '', hasMore: true, page: 1 };
  favorites.value = { list: [], loading: false, loadingMore: false, error: '', hasMore: true, page: 1 };
  following.value = { list: [], loading: false, loadingMore: false, error: '', hasMore: true, page: 1 };
  followers.value = { list: [], loading: false, loadingMore: false, error: '', hasMore: true, page: 1 };
};

/**
 * 加载用户文章
 */
const loadUserPosts = async () => {
  posts.value.loading = true;
  posts.value.error = '';
  
  try {
    const result = await getUserPosts(userId.value, 1, 20);
    posts.value.list = result.items;
    posts.value.hasMore = result.hasMore;
    posts.value.page = 1;
  } catch (error) {
    posts.value.error = '加载文章失败';
    console.error('加载用户文章失败:', error);
  } finally {
    posts.value.loading = false;
  }
};

/**
 * 加载更多文章
 */
const loadMorePosts = async () => {
  if (posts.value.loadingMore || !posts.value.hasMore) return;

  posts.value.loadingMore = true;
  
  try {
    const nextPage = posts.value.page + 1;
    const result = await getUserPosts(userId.value, nextPage, 20);
    posts.value.list.push(...result.items);
    posts.value.hasMore = result.hasMore;
    posts.value.page = nextPage;
  } catch (error) {
    ElMessage.error('加载更多文章失败');
    console.error('加载更多文章失败:', error);
  } finally {
    posts.value.loadingMore = false;
  }
};

/**
 * 加载用户收藏
 */
const loadUserFavorites = async () => {
  favorites.value.loading = true;
  favorites.value.error = '';
  
  try {
    const result = await getUserFavorites(userId.value, 1, 20);
    favorites.value.list = result.items;
    favorites.value.hasMore = result.hasMore;
    favorites.value.page = 1;
  } catch (error) {
    favorites.value.error = '加载收藏失败';
    console.error('加载用户收藏失败:', error);
  } finally {
    favorites.value.loading = false;
  }
};

/**
 * 加载更多收藏
 */
const loadMoreFavorites = async () => {
  if (favorites.value.loadingMore || !favorites.value.hasMore) return;

  favorites.value.loadingMore = true;
  
  try {
    const nextPage = favorites.value.page + 1;
    const result = await getUserFavorites(userId.value, nextPage, 20);
    favorites.value.list.push(...result.items);
    favorites.value.hasMore = result.hasMore;
    favorites.value.page = nextPage;
  } catch (error) {
    ElMessage.error('加载更多收藏失败');
    console.error('加载更多收藏失败:', error);
  } finally {
    favorites.value.loadingMore = false;
  }
};

/**
 * 加载用户关注列表
 */
const loadUserFollowing = async () => {
  following.value.loading = true;
  following.value.error = '';
  
  try {
    const result = await getUserFollowing(userId.value, 1, 20);
    following.value.list = result.items;
    following.value.hasMore = result.hasMore;
    following.value.page = 1;
  } catch (error) {
    following.value.error = '加载关注列表失败';
    console.error('加载用户关注列表失败:', error);
  } finally {
    following.value.loading = false;
  }
};

/**
 * 加载更多关注
 */
const loadMoreFollowing = async () => {
  if (following.value.loadingMore || !following.value.hasMore) return;

  following.value.loadingMore = true;
  
  try {
    const nextPage = following.value.page + 1;
    const result = await getUserFollowing(userId.value, nextPage, 20);
    following.value.list.push(...result.items);
    following.value.hasMore = result.hasMore;
    following.value.page = nextPage;
  } catch (error) {
    ElMessage.error('加载更多关注失败');
    console.error('加载更多关注失败:', error);
  } finally {
    following.value.loadingMore = false;
  }
};

/**
 * 加载用户粉丝列表
 */
const loadUserFollowers = async () => {
  followers.value.loading = true;
  followers.value.error = '';
  
  try {
    const result = await getUserFollowers(userId.value, 1, 20);
    followers.value.list = result.items;
    followers.value.hasMore = result.hasMore;
    followers.value.page = 1;
  } catch (error) {
    followers.value.error = '加载粉丝列表失败';
    console.error('加载用户粉丝列表失败:', error);
  } finally {
    followers.value.loading = false;
  }
};

/**
 * 加载更多粉丝
 */
const loadMoreFollowers = async () => {
  if (followers.value.loadingMore || !followers.value.hasMore) return;

  followers.value.loadingMore = true;
  
  try {
    const nextPage = followers.value.page + 1;
    const result = await getUserFollowers(userId.value, nextPage, 20);
    followers.value.list.push(...result.items);
    followers.value.hasMore = result.hasMore;
    followers.value.page = nextPage;
  } catch (error) {
    ElMessage.error('加载更多粉丝失败');
    console.error('加载更多粉丝失败:', error);
  } finally {
    followers.value.loadingMore = false;
  }
};

/**
 * 处理文章点击
 */
const handlePostClick = (postId: string) => {
  router.push(`/posts/${postId}`);
};

/**
 * 点赞/收藏状态变化：更新本地列表（避免 PostCard 直接修改 props）
 */
const handleLikeChange = (data: { postId: string; isLiked: boolean; likeCount: number }) => {
  posts.value.list = posts.value.list.map((post) =>
    post.id === data.postId ? { ...post, isLiked: data.isLiked, likeCount: data.likeCount } : post
  );
  favorites.value.list = favorites.value.list.map((post) =>
    post.id === data.postId ? { ...post, isLiked: data.isLiked, likeCount: data.likeCount } : post
  );
};

const handleFavoriteChange = (data: { postId: string; isFavorited: boolean; favoriteCount: number }) => {
  posts.value.list = posts.value.list.map((post) =>
    post.id === data.postId
      ? { ...post, isFavorited: data.isFavorited, favoriteCount: data.favoriteCount }
      : post
  );
  favorites.value.list = favorites.value.list.map((post) =>
    post.id === data.postId
      ? { ...post, isFavorited: data.isFavorited, favoriteCount: data.favoriteCount }
      : post
  );
};

/**
 * 处理用户点击
 */
const handleUserClick = (userId: string) => {
  router.push(`/users/${userId}`);
};

/**
 * 处理创建文章
 */
const handleCreatePost = () => {
  router.push('/posts/create');
};
</script>

<style scoped>
.user-profile-page {
  min-height: 100vh;
  background-color: var(--color-bg-primary);
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  color: var(--color-text-secondary);
}

.loading-container p,
.error-container p {
  margin: var(--space-md) 0;
  font-size: 1rem;
}

.auth-required-state {
  width: min(560px, 100%);
  padding: var(--space-lg) 0;
  text-align: center;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
}

.auth-required-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto var(--space-md);
  border-radius: 50%;
  border: 1px solid var(--color-warning);
  background: var(--color-warning-light);
  color: var(--color-warning-dark);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
}

.auth-required-title {
  margin: 0 0 var(--space-sm) 0;
  font-size: 1.5rem;
  color: var(--color-text-primary);
}

.auth-required-description {
  margin: 0 0 var(--space-lg) 0;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

.auth-required-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-sm);
}

.profile-container {
  max-width: 1200px;
  margin: 0 auto;
}

.profile-header {
  position: relative;
  margin-bottom: var(--space-xl);
}

.header-background {
  height: 200px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  border-radius: 0 0 var(--border-radius-lg) var(--border-radius-lg);
}

.header-content {
  position: relative;
  padding: 0 var(--space-lg);
  margin-top: -100px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: var(--space-lg);
}

.user-info {
  display: flex;
  gap: var(--space-lg);
  flex: 1;
}

.avatar-section {
  flex-shrink: 0;
}

.user-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid var(--color-bg-primary);
  object-fit: cover;
  box-shadow: var(--shadow-lg);
}

.info-section {
  flex: 1;
  padding-top: var(--space-md);
}

.user-name {
  margin: 0 0 var(--space-xs) 0;
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.user-username {
  margin: 0 0 var(--space-sm) 0;
  font-size: 1rem;
  color: var(--color-text-secondary);
}

.user-bio {
  margin: 0 0 var(--space-md) 0;
  font-size: 1rem;
  line-height: 1.5;
  color: var(--color-text-primary);
}

.user-stats {
  display: flex;
  gap: var(--space-lg);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-top: var(--space-xs);
}

.action-section {
  display: flex;
  gap: var(--space-sm);
  padding-top: var(--space-md);
}

.check-in-section {
  padding: 0 var(--space-lg);
  margin-bottom: var(--space-lg);
}

.profile-tabs {
  padding: 0 var(--space-lg);
}

.tab-content {
  padding: var(--space-lg) 0;
}

.loading-content,
.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl);
  color: var(--color-text-secondary);
}

.loading-content p,
.error-content p {
  margin: var(--space-md) 0;
}

.empty-content {
  padding: var(--space-xl);
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-lg);
  margin-bottom: var(--space-lg);
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-bottom: var(--space-lg);
}

.load-more {
  display: flex;
  justify-content: center;
  padding: var(--space-lg);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 0 var(--space-md);
    margin-top: -60px;
  }

  .user-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .user-avatar {
    width: 80px;
    height: 80px;
  }

  .user-name {
    font-size: 1.5rem;
  }

  .user-stats {
    justify-content: center;
  }

  .action-section {
    width: 100%;
    justify-content: center;
  }

  .profile-tabs {
    padding: 0 var(--space-md);
  }

  .check-in-section {
    padding: 0 var(--space-md);
  }

  .posts-grid {
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }

  .users-list {
    margin-bottom: var(--space-md);
  }
}

@media (max-width: 480px) {
  .auth-required-state {
    padding: var(--space-md) 0;
  }

  .auth-required-actions {
    flex-direction: column;
  }

  .header-background {
    height: 150px;
  }

  .user-stats {
    gap: var(--space-md);
  }

  .stat-number {
    font-size: 1.25rem;
  }

  .action-section {
    flex-direction: column;
    gap: var(--space-xs);
  }
}
</style>
