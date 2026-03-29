import { effectScope, nextTick, reactive, ref } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useProfilePageContent } from '@/composables/useProfilePageContent';
import type { Post, User } from '@/types';
import type { ProfileCollectionState } from '@/types/user/profile';

const route = reactive({
  params: {
    id: 'user-1',
  },
  fullPath: '/users/user-1',
});

const routerPush = vi.fn();

vi.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({
    push: routerPush,
  }),
}));

const authStore = reactive({
  isAuthenticated: true,
  user: {
    id: 'viewer-1',
  },
});

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => authStore,
}));

const createUser = (id: string): User => ({
  id,
  username: `${id}-username`,
  email: `${id}@example.com`,
  nickname: `${id}-nickname`,
  avatar: null,
  bio: null,
  role: 'USER',
  followersCount: 0,
  followingCount: 0,
  postsCount: 0,
  createdAt: '2026-03-28T00:00:00.000Z',
  updatedAt: '2026-03-28T00:00:00.000Z',
});

const userProfile = ref<User | null>(null);
const loading = ref(false);
const error = ref('');
const errorStatus = ref<number | null>(null);
const followLoading = ref(false);
const isFollowing = ref(false);
const fetchUserProfile = vi.fn(async (userId: string) => {
  userProfile.value = createUser(userId);
  error.value = '';
  errorStatus.value = null;
});

vi.mock('@/composables/useUser', () => ({
  useUser: () => ({
    userProfile,
    loading,
    error,
    errorStatus,
    followLoading,
    isFollowing,
    fetchUserProfile,
    followUser: vi.fn(),
    unfollowUser: vi.fn(),
    getUserPosts: vi.fn(),
    getUserFavorites: vi.fn(),
    getUserFollowing: vi.fn(),
    getUserFollowers: vi.fn(),
    uploadAvatar: vi.fn(),
  }),
}));

const createCollectionState = <T>(): ProfileCollectionState<T> => ({
  list: [],
  loading: false,
  loadingMore: false,
  error: '',
  hasMore: false,
  page: 1,
});

const posts = ref<ProfileCollectionState<Post>>(createCollectionState<Post>());
const favorites = ref<ProfileCollectionState<Post>>(createCollectionState<Post>());
const following = ref<ProfileCollectionState<User>>(createCollectionState<User>());
const followers = ref<ProfileCollectionState<User>>(createCollectionState<User>());

const resetCollectionStates = vi.fn(() => {
  posts.value = createCollectionState<Post>();
  favorites.value = createCollectionState<Post>();
  following.value = createCollectionState<User>();
  followers.value = createCollectionState<User>();
});

const loadPostsPage = vi.fn(async () => {
  posts.value.error = '';
});

const loadFavoritesPage = vi.fn(async () => {
  favorites.value.error = '';
});

const loadFollowingPage = vi.fn(async () => {
  following.value.error = '';
});

const loadFollowersPage = vi.fn(async () => {
  followers.value.error = '';
});

vi.mock('@/composables/useProfileCollections', () => ({
  useProfileCollections: () => ({
    posts,
    favorites,
    following,
    followers,
    resetCollectionStates,
    loadPostsPage,
    loadFavoritesPage,
    loadFollowingPage,
    loadFollowersPage,
    handleLikeChange: vi.fn(),
    handleFavoriteChange: vi.fn(),
  }),
}));

vi.mock('@/queries/messages', () => ({
  useCreateConversationMutation: () => ({
    mutate: vi.fn(),
    isPending: ref(false),
  }),
}));

async function flushProfileEffects() {
  await Promise.resolve();
  await nextTick();
  await Promise.resolve();
}

describe('useProfilePageContent', () => {
  const cleanup: Array<() => void> = [];

  beforeEach(() => {
    vi.clearAllMocks();
    route.params.id = 'user-1';
    route.fullPath = '/users/user-1';
    authStore.isAuthenticated = true;
    authStore.user = { id: 'viewer-1' };
    userProfile.value = null;
    loading.value = false;
    error.value = '';
    errorStatus.value = null;
    followLoading.value = false;
    isFollowing.value = false;
    resetCollectionStates();
  });

  afterEach(() => {
    cleanup.splice(0).forEach((stop) => stop());
  });

  it('loads profile and posts on first entry without preloading other tabs', async () => {
    const scope = effectScope();
    const state = scope.run(() => useProfilePageContent())!;
    cleanup.push(() => scope.stop());

    await flushProfileEffects();

    expect(state.activeTab.value).toBe('posts');
    expect(fetchUserProfile).toHaveBeenCalledWith('user-1');
    expect(loadPostsPage).toHaveBeenCalledTimes(1);
    expect(loadFavoritesPage).not.toHaveBeenCalled();
    expect(loadFollowingPage).not.toHaveBeenCalled();
    expect(loadFollowersPage).not.toHaveBeenCalled();
  });

  it('does not refetch an already loaded tab when returning to it even if the list is empty', async () => {
    const scope = effectScope();
    const state = scope.run(() => useProfilePageContent())!;
    cleanup.push(() => scope.stop());

    await flushProfileEffects();

    state.activeTab.value = 'following';
    await flushProfileEffects();

    state.activeTab.value = 'posts';
    await flushProfileEffects();

    state.activeTab.value = 'following';
    await flushProfileEffects();

    expect(loadFollowingPage).toHaveBeenCalledTimes(1);
  });

  it('still loads published posts for unauthenticated viewers on first entry', async () => {
    authStore.isAuthenticated = false;
    authStore.user = null;

    const scope = effectScope();
    scope.run(() => useProfilePageContent());
    cleanup.push(() => scope.stop());

    await flushProfileEffects();

    expect(fetchUserProfile).toHaveBeenCalledWith('user-1');
    expect(loadPostsPage).toHaveBeenCalledTimes(1);
    expect(loadFavoritesPage).not.toHaveBeenCalled();
    expect(loadFollowingPage).not.toHaveBeenCalled();
    expect(loadFollowersPage).not.toHaveBeenCalled();
  });
});
