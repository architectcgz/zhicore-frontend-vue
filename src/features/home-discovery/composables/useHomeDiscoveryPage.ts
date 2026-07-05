import { reactive, readonly, ref } from "vue";

import {
  favoritePost as requestFavoritePost,
  getPostEngagementBatchStatus,
  likePost as requestLikePost,
  listPosts,
} from "@/api/post";
import { isLocalDemoModeEnabled } from "@/runtime/localDemoMode";

import { homeDiscoveryMock } from "../config/homeDiscoveryMock";
import { mapPostSummaryToHomePost } from "../lib/homeDiscoveryMapper";
import type { HomeDiscoveryData } from "../types";

export interface HomeDiscoveryPageOptions {
  isLoggedIn?: () => boolean;
  localDemoEnabled?: boolean;
  redirectToLogin?: () => void | Promise<void>;
  restoreSession?: () => Promise<void>;
}

const categoryIdByLabel: Record<string, string | undefined> = {
  全部: undefined,
  前端: "frontend",
  架构: "architecture",
  后端: "backend",
  写作体验: "writing-experience",
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "公开内容加载失败";
}

function createDiscoveryWithPosts(
  posts: HomeDiscoveryData["posts"],
): HomeDiscoveryData {
  return {
    ...homeDiscoveryMock,
    posts,
  };
}

export function useHomeDiscoveryPage(options: HomeDiscoveryPageOptions = {}) {
  const localDemoEnabled =
    options.localDemoEnabled ?? isLocalDemoModeEnabled();
  const discovery = reactive<HomeDiscoveryData>(
    localDemoEnabled ? homeDiscoveryMock : createDiscoveryWithPosts([]),
  );
  const feedState = ref<"loading" | "ready" | "empty" | "error">(
    localDemoEnabled ? "ready" : "loading",
  );
  const feedError = ref("");
  const engagementActionError = ref("");
  const activeContentCategory = ref(
    homeDiscoveryMock.contentCategories[0] ?? "",
  );
  // 搜索提示是占位文案，不进入状态，避免初始态被误判为已有查询。
  const searchQuery = ref("");
  let requestId = 0;
  let restoreSessionPromise: Promise<void> | null = null;
  const submittingLikes = new Set<string>();
  const submittingFavorites = new Set<string>();

  async function restoreSessionOnce(): Promise<void> {
    if (!options.restoreSession) {
      return;
    }
    if (!restoreSessionPromise) {
      restoreSessionPromise = options.restoreSession().finally(() => {
        restoreSessionPromise = null;
      });
    }
    await restoreSessionPromise;
  }

  function isLoggedIn(): boolean {
    return options.isLoggedIn?.() === true;
  }

  function updatePost(
    postId: string,
    updater: (
      post: HomeDiscoveryData["posts"][number],
    ) => HomeDiscoveryData["posts"][number],
  ): void {
    discovery.posts = discovery.posts.map((post) =>
      post.id === postId ? updater(post) : post,
    );
  }

  function applyDegradedEngagement(postIds: string[]): void {
    discovery.posts = discovery.posts.map((post) =>
      post.id && postIds.includes(post.id)
        ? {
            ...post,
            liked: null,
            favorited: null,
            engagementUnavailable: true,
          }
        : post,
    );
  }

  async function loadViewerEngagement(
    currentRequestId: number,
    postIds: string[],
  ): Promise<void> {
    await restoreSessionOnce();
    if (currentRequestId !== requestId || !isLoggedIn()) {
      return;
    }

    // 登录用户的 viewer engagement 是附加事实；失败或超时不能挡住主列表。
    applyDegradedEngagement(postIds);
    try {
      const engagementResp = await getPostEngagementBatchStatus(postIds);
      if (currentRequestId !== requestId) {
        return;
      }

      discovery.posts = discovery.posts.map((post) => {
        if (!post.id) {
          return post;
        }
        const engagement = engagementResp.items.find(
          (item) => item.postId === post.id,
        );
        return {
          ...post,
          liked: engagement?.liked,
          favorited: engagement?.favorited,
          engagementUnavailable:
            !engagement ||
            engagement.degraded === true ||
            engagement?.liked === null ||
            engagement?.favorited === null,
        };
      });
    } catch {
      if (currentRequestId !== requestId) {
        return;
      }
      applyDegradedEngagement(postIds);
    }
  }

  async function loadPublicPosts(): Promise<void> {
    const currentRequestId = ++requestId;
    feedState.value = "loading";
    feedError.value = "";

    try {
      const categoryId = categoryIdByLabel[activeContentCategory.value];
      const trimmedSearch = searchQuery.value.trim();
      const postsResp = await listPosts({
        ...(categoryId ? { categoryId } : {}),
        ...(trimmedSearch ? { tag: trimmedSearch } : {}),
        limit: 20,
        sort: "latest",
      });
      if (currentRequestId !== requestId) {
        return;
      }

      if (postsResp.items.length === 0) {
        discovery.posts = [];
        feedState.value = "empty";
        return;
      }

      discovery.posts = postsResp.items.map((post) =>
        mapPostSummaryToHomePost(post),
      );
      feedState.value = "ready";
      void loadViewerEngagement(
        currentRequestId,
        postsResp.items.map((post) => post.postId),
      );
    } catch (error) {
      if (currentRequestId !== requestId) {
        return;
      }

      discovery.posts = [];
      feedError.value = getErrorMessage(error);
      feedState.value = "error";
    }
  }

  function selectContentCategory(category: string): void {
    // 分类只能来自服务端/配置给出的候选，避免组件发出脏值后进入不可恢复筛选态。
    if (!homeDiscoveryMock.contentCategories.includes(category)) {
      return;
    }

    activeContentCategory.value = category;
    if (!localDemoEnabled) {
      void loadPublicPosts();
    }
  }

  function updateSearchQuery(nextQuery: string): void {
    searchQuery.value = nextQuery;
    if (!localDemoEnabled) {
      void loadPublicPosts();
    }
  }

  function retry(): void {
    if (!localDemoEnabled) {
      void loadPublicPosts();
    }
  }

  async function likePost(postId: string): Promise<void> {
    if (submittingLikes.has(postId)) {
      return;
    }
    submittingLikes.add(postId);
    engagementActionError.value = "";
    await restoreSessionOnce();
    if (!isLoggedIn()) {
      await options.redirectToLogin?.();
      submittingLikes.delete(postId);
      return;
    }

    try {
      const response = await requestLikePost(postId);
      updatePost(postId, (post) => ({
        ...post,
        liked: response.liked,
        likes: response.likeCount,
        engagementUnavailable: false,
      }));
    } catch (error) {
      engagementActionError.value = getErrorMessage(error);
    } finally {
      submittingLikes.delete(postId);
    }
  }

  async function favoritePost(postId: string): Promise<void> {
    if (submittingFavorites.has(postId)) {
      return;
    }
    submittingFavorites.add(postId);
    engagementActionError.value = "";
    await restoreSessionOnce();
    if (!isLoggedIn()) {
      await options.redirectToLogin?.();
      submittingFavorites.delete(postId);
      return;
    }

    try {
      const response = await requestFavoritePost(postId);
      updatePost(postId, (post) => ({
        ...post,
        favorited: response.favorited,
        engagementUnavailable: false,
      }));
    } catch (error) {
      engagementActionError.value = getErrorMessage(error);
    } finally {
      submittingFavorites.delete(postId);
    }
  }

  if (!localDemoEnabled) {
    void loadPublicPosts();
  }

  return {
    discovery,
    feedState: readonly(feedState),
    feedError: readonly(feedError),
    engagementActionError: readonly(engagementActionError),
    showSupplementarySidebar: localDemoEnabled,
    activeContentCategory: readonly(activeContentCategory),
    searchQuery: readonly(searchQuery),
    selectContentCategory,
    updateSearchQuery,
    retry,
    likePost,
    favoritePost,
  };
}
