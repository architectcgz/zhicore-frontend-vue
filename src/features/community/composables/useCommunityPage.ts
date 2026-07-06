import { reactive, readonly, ref } from "vue";

import { listPosts, listTags, type PostSummaryResp } from "@/api/post";

import type {
  CommunityLoadState,
  CommunityPost,
  CommunityTopic,
} from "../types";

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function mapPostSummary(post: PostSummaryResp): CommunityPost {
  return {
    id: post.postId,
    href: `/posts/${post.postId}`,
    title: post.title,
    summary: post.summary ?? "这篇内容暂未提供摘要。",
    author: post.authorName ?? "社区成员",
    publishedAt: post.publishedAt ?? post.updatedAt,
    commentCount: post.stats.commentCount,
  };
}

export function useCommunityPage() {
  const topics = reactive<CommunityTopic[]>([]);
  const posts = reactive<CommunityPost[]>([]);
  const topicState = ref<CommunityLoadState>("loading");
  const feedState = ref<CommunityLoadState>("loading");
  const topicError = ref("");
  const feedError = ref("");
  const activeTopicSlug = ref("");
  let postsRequestId = 0;

  async function loadTopics(): Promise<void> {
    topicState.value = "loading";
    topicError.value = "";

    try {
      const response = await listTags({ limit: 24 });
      const nextTopics = response.items.map((tag) => ({
        id: tag.tagId,
        label: tag.name,
        slug: tag.slug,
      }));
      topics.splice(0, topics.length, ...nextTopics);
      topicState.value = nextTopics.length > 0 ? "ready" : "empty";
    } catch (error) {
      topics.splice(0, topics.length);
      topicError.value = errorMessage(error, "主题社区加载失败");
      topicState.value = "error";
    }
  }

  async function loadPosts(): Promise<void> {
    const currentRequestId = ++postsRequestId;
    feedState.value = "loading";
    feedError.value = "";

    try {
      const response = await listPosts({
        ...(activeTopicSlug.value ? { tag: activeTopicSlug.value } : {}),
        limit: 10,
        sort: "latest",
      });
      if (currentRequestId !== postsRequestId) {
        return;
      }

      const nextPosts = response.items.map((post) => mapPostSummary(post));
      posts.splice(0, posts.length, ...nextPosts);
      feedState.value = nextPosts.length > 0 ? "ready" : "empty";
    } catch (error) {
      if (currentRequestId !== postsRequestId) {
        return;
      }

      posts.splice(0, posts.length);
      feedError.value = errorMessage(error, "社区内容加载失败");
      feedState.value = "error";
    }
  }

  function selectTopic(slug: string): void {
    if (slug && !topics.some((topic) => topic.slug === slug)) {
      return;
    }

    activeTopicSlug.value = slug;
    void loadPosts();
  }

  function retryTopics(): void {
    void loadTopics();
  }

  function retryPosts(): void {
    void loadPosts();
  }

  void loadTopics();
  void loadPosts();

  return {
    topics,
    posts,
    topicState: readonly(topicState),
    feedState: readonly(feedState),
    topicError: readonly(topicError),
    feedError: readonly(feedError),
    activeTopicSlug: readonly(activeTopicSlug),
    selectTopic,
    retryTopics,
    retryPosts,
  };
}
