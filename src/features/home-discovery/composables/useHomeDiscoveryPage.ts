import { reactive, readonly, ref } from "vue";

import {
  favoritePost as requestFavoritePost,
  getPostEngagementBatchStatus,
  likePost as requestLikePost,
  listPosts,
  listTags,
} from "@/api/post";

import { homeDiscoveryMock } from "../config/homeDiscoveryMock";
import { mapPostSummaryToHomePost } from "../lib/homeDiscoveryMapper";
import type { HomeDiscoveryData } from "../types";

export interface HomeDiscoveryPageOptions {
  isLoggedIn?: () => boolean;
  redirectToLogin?: () => void | Promise<void>;
  restoreSession?: () => Promise<void>;
}

const allContentCategory = "全部";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "公开内容加载失败";
}

function createDiscoveryWithPosts(
  posts: HomeDiscoveryData["posts"],
  contentCategories: readonly string[] = [allContentCategory],
): HomeDiscoveryData {
  return {
    ...homeDiscoveryMock,
    contentCategories,
    posts,
  };
}

export function useHomeDiscoveryPage(options: HomeDiscoveryPageOptions = {}) {
  const discovery = reactive<HomeDiscoveryData>(createDiscoveryWithPosts([]));
  const feedState = ref<"loading" | "ready" | "empty" | "error">("loading");
  const feedError = ref("");
  const engagementActionError = ref("");
  const activeContentCategory = ref(allContentCategory);
  const tagSlugByLabel = new Map<string, string>();
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
      const activeTagSlug = tagSlugByLabel.get(activeContentCategory.value);
      const postsResp = await listPosts({
        ...(activeTagSlug ? { tag: activeTagSlug } : {}),
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

  async function loadContentCategories(): Promise<void> {
    try {
      const tagsResp = await listTags({ limit: 20 });
      tagSlugByLabel.clear();
      const tagLabels = tagsResp.items.map((tag) => {
        tagSlugByLabel.set(tag.name, tag.slug);
        return tag.name;
      });
      discovery.contentCategories = [allContentCategory, ...tagLabels];
      if (!discovery.contentCategories.includes(activeContentCategory.value)) {
        activeContentCategory.value = allContentCategory;
      }
    } catch {
      discovery.contentCategories = [allContentCategory];
      activeContentCategory.value = allContentCategory;
      tagSlugByLabel.clear();
    }
  }

  function selectContentCategory(category: string): void {
    // 分类只能来自当前后端标签列表或 demo 配置，避免组件发出脏值后进入不可恢复筛选态。
    if (!discovery.contentCategories.includes(category)) {
      return;
    }

    activeContentCategory.value = category;
    void loadPublicPosts();
  }

  function retry(): void {
    void loadPublicPosts();
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

  void loadContentCategories();
  void loadPublicPosts();

  return {
    discovery,
    feedState: readonly(feedState),
    feedError: readonly(feedError),
    engagementActionError: readonly(engagementActionError),
    activeContentCategory: readonly(activeContentCategory),
    selectContentCategory,
    retry,
    likePost,
    favoritePost,
  };
}
