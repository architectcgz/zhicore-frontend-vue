<!--
  首页组件
  显示最新文章列表、热门标签和热门文章
-->

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import type { CreatorRankingItem, TopicRankingItem } from '@/api/ranking';
import SiteErrorState from '@/components/common/SiteErrorState.vue';
import HomeSidebar from '@/components/home/HomeSidebar.vue';
import PostCard from '@/components/post/PostCard.vue';
import { useHotPostsQuery } from '@/queries/posts/useHotPostsQuery';
import { usePostsQuery } from '@/queries/posts/usePostsQuery';
import { useHotCreatorsQuery } from '@/queries/ranking/useHotCreatorsQuery';
import { useHotTopicsQuery } from '@/queries/ranking/useHotTopicsQuery';
import { useHotTagsQuery } from '@/queries/tags/useHotTagsQuery';
import type { Post, Tag } from '@/types';

type TopicHighlight = {
  id: string;
  name: string;
  slug: string;
  description: string;
  posts: number;
  views: number;
  likes: number;
  growth: number;
};

type CreatorHighlight = {
  id: string;
  nickname: string;
  avatar: string;
  bio: string;
  posts: number;
  followers: number;
  views: number;
  score: number;
};

const isMounted = ref(false);
const postOverrides = ref<Record<string, Partial<Post>>>({});
const featuredIndex = ref(0);
let featuredTimer: ReturnType<typeof setInterval> | null = null;
const homeSecondaryPostLimit = 4;
const creatorRankingParams = ref({
  page: 1,
  size: 3,
  period: 'monthly' as const,
});
const topicRankingParams = ref({
  page: 1,
  size: 6,
  period: 'weekly' as const,
});

const quickLinks = [
  {
    title: '进入标签广场',
    description: '按主题寻找正在增长的内容脉络。',
    to: '/tags',
    kicker: 'Topics',
  },
  {
    title: '查看趋势榜单',
    description: '快速定位本周最有讨论度的内容与作者。',
    to: '/ranking',
    kicker: 'Ranking',
  },
  {
    title: '开始发布内容',
    description: '把你的笔记、观察和方案整理成可读文章。',
    to: '/posts/create',
    kicker: 'Create',
  },
] as const;

const postsQueryParams = {
  size: 20,
  sort: 'latest',
} as const;

const {
  data: postsData,
  isLoading: postsLoading,
  isFetching: postsFetching,
  error: postsError,
  refetch: refetchPosts,
} = usePostsQuery({
  ...postsQueryParams,
});

const {
  data: tagsData,
  isLoading: tagsLoading,
} = useHotTagsQuery();

const {
  data: trendingData,
  isLoading: trendingLoading,
  error: trendingError,
} = useHotPostsQuery({
  page: 0,
  size: 5,
});

const {
  data: hotCreatorsData,
  isLoading: creatorsLoading,
} = useHotCreatorsQuery(creatorRankingParams);

const {
  data: hotTopicsData,
  isLoading: topicsLoading,
} = useHotTopicsQuery(topicRankingParams);

const posts = computed<Post[]>(() => postsData.value?.items || []);

const displayPosts = computed<Post[]>(() => {
  const overrides = postOverrides.value;
  return posts.value.map((post) => {
    const patch = overrides[post.id];
    return patch ? ({ ...post, ...patch } as Post) : post;
  });
});

const featuredCandidates = computed<Post[]>(() => displayPosts.value.slice(0, 5));
const featuredPost = computed<Post | null>(() => {
  if (!featuredCandidates.value.length) {
    return null;
  }

  return featuredCandidates.value[featuredIndex.value] ?? featuredCandidates.value[0];
});
const secondaryPosts = computed<Post[]>(() => {
  if (!featuredPost.value) {
    return displayPosts.value.slice(0, homeSecondaryPostLimit);
  }

  return displayPosts.value
    .filter((post) => post.id !== featuredPost.value?.id)
    .slice(0, homeSecondaryPostLimit);
});
const tags = computed<Tag[]>(() => tagsData.value || []);
const trendingPosts = computed<Post[]>(() => trendingData.value?.items || []);
const heroTags = computed<Tag[]>(() => tags.value.slice(0, 4));
const creatorItems = computed<CreatorRankingItem[]>(() => hotCreatorsData.value?.items || []);
const topicItems = computed<TopicRankingItem[]>(() => hotTopicsData.value?.items || []);

const topicHighlights = computed<TopicHighlight[]>(() => {
  if (topicItems.value.length > 0) {
    return topicItems.value.slice(0, 6).map((item) => ({
      id: item.id,
      name: item.tag.name,
      slug: item.tag.slug,
      description: item.tag.description || '持续增长中的讨论主题',
      posts: item.metrics.posts,
      views: item.metrics.totalViews,
      likes: item.metrics.totalLikes,
      growth: item.metrics.growth,
    }));
  }

  return tags.value.slice(0, 6).map((tag) => ({
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    description: tag.description || '等待更多创作者加入这个主题。',
    posts: tag.postCount || 0,
    views: 0,
    likes: 0,
    growth: 0,
  }));
});

const creatorHighlights = computed<CreatorHighlight[]>(() => {
  if (creatorItems.value.length > 0) {
    return creatorItems.value.slice(0, 3).map((item) => ({
      id: item.user.id,
      nickname: item.user.nickname,
      avatar: item.user.avatar,
      bio: item.user.bio || '持续分享技术与创作观察。',
      posts: item.metrics.posts,
      followers: item.metrics.followers,
      views: item.metrics.totalViews,
      score: item.score,
    }));
  }

  return displayPosts.value
    .filter((post): post is Post & { author: NonNullable<Post['author']> } => Boolean(post.author))
    .slice(0, 3)
    .map((post) => ({
      id: post.author.id,
      nickname: post.author.nickname,
      avatar: post.author.avatar,
      bio: post.author.bio || '从最新文章中被识别出的活跃作者。',
      posts: post.author.postsCount || 0,
      followers: post.author.followersCount || 0,
      views: post.viewCount || 0,
      score: post.likeCount || 0,
    }));
});

const summaryStats = computed(() => [
  {
    label: '最新内容',
    value: `${postsData.value?.total ?? displayPosts.value.length}`,
    detail: '持续更新的创作者文章',
  },
  {
    label: '热议标签',
    value: `${tags.value.length}`,
    detail: '高频参与的主题讨论',
  },
  {
    label: '趋势观察',
    value: `${trendingPosts.value.length}`,
    detail: '社区关注较高的热门内容',
  },
]);

const totalViews = computed(() => {
  return displayPosts.value.reduce((sum, post) => sum + (post.viewCount || 0), 0);
});

const insightLine = computed(() => {
  if (!displayPosts.value.length) {
    return '新内容发布后，这里会展示社区里的最新动态。';
  }

  return `当前内容已累计 ${formatCompactNumber(totalViews.value)} 次浏览，覆盖创作、工程与社区讨论。`;
});

const curationNotes = computed(() => [
  `热门主题下已有 ${formatCompactNumber(topicHighlights.value.reduce((sum, topic) => sum + topic.posts, 0))} 篇内容`,
  `${creatorHighlights.value.length} 位活跃作者正在持续更新`,
  `${trendingPosts.value.length} 篇热门文章值得优先阅读`,
]);

onMounted(() => {
  isMounted.value = true;

  if (featuredCandidates.value.length <= 1) {
    return;
  }

  featuredTimer = setInterval(() => {
    featuredIndex.value = (featuredIndex.value + 1) % featuredCandidates.value.length;
  }, 6000);
});

onUnmounted(() => {
  if (!featuredTimer) {
    return;
  }

  clearInterval(featuredTimer);
  featuredTimer = null;
});

watch(featuredCandidates, (list) => {
  if (featuredIndex.value >= list.length) {
    featuredIndex.value = 0;
  }

  if (featuredTimer) {
    clearInterval(featuredTimer);
    featuredTimer = null;
  }

  if (list.length > 1) {
    featuredTimer = setInterval(() => {
      featuredIndex.value = (featuredIndex.value + 1) % list.length;
    }, 6000);
  }
});

const isLoading = computed(() => postsLoading.value || (postsFetching.value && !postsData.value));
const isSidebarLoading = computed(() => tagsLoading.value || trendingLoading.value);
const showDiscoverySkeleton = computed(() => topicsLoading.value || creatorsLoading.value);
const error = computed(() => postsError.value);

const getErrorMessage = (err: unknown): string => {
  if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
    return err.message;
  }

  if (typeof err === 'string') {
    return err;
  }

  return '加载数据时发生错误，请稍后重试';
};

const formatCompactNumber = (value: number): string => {
  if (value >= 10000) {
    return `${(value / 10000).toFixed(1)}万`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }

  return `${value}`;
};

const formatGrowth = (value: number): string => {
  if (value > 0) {
    return `+${value.toFixed(1)}%`;
  }

  if (value < 0) {
    return `${value.toFixed(1)}%`;
  }

  return '平稳';
};

const handleHomeRetry = () => {
  void refetchPosts();
};

const switchFeatured = (nextIndex: number) => {
  if (!featuredCandidates.value.length) {
    return;
  }

  const maxIndex = featuredCandidates.value.length - 1;
  featuredIndex.value = Math.min(maxIndex, Math.max(0, nextIndex));
};

const handleFeaturedWheel = (event: WheelEvent) => {
  if (featuredCandidates.value.length <= 1) {
    return;
  }

  if (event.deltaY > 0) {
    switchFeatured((featuredIndex.value + 1) % featuredCandidates.value.length);
    return;
  }

  if (event.deltaY < 0) {
    switchFeatured(
      (featuredIndex.value - 1 + featuredCandidates.value.length) % featuredCandidates.value.length
    );
  }
};

const handleLikeChange = (data: { postId: string; isLiked: boolean; likeCount: number }) => {
  const current = postOverrides.value[data.postId] || {};
  postOverrides.value = {
    ...postOverrides.value,
    [data.postId]: { ...current, isLiked: data.isLiked, likeCount: data.likeCount },
  };
};

const handleFavoriteChange = (data: { postId: string; isFavorited: boolean; favoriteCount: number }) => {
  const current = postOverrides.value[data.postId] || {};
  postOverrides.value = {
    ...postOverrides.value,
    [data.postId]: { ...current, isFavorited: data.isFavorited, favoriteCount: data.favoriteCount },
  };
};
</script>

<template>
  <div class="home-page">
    <section class="home-page__hero">
      <div class="home-page__hero-copy">
        <span class="home-page__eyebrow">今日推荐</span>
        <h1 class="page-title">
          发现精彩内容
        </h1>
        <p class="page-description">
          在这里浏览创作者最新观点、技术文章与社区热议，快速找到值得阅读和参与的话题。
        </p>

        <div class="home-page__actions">
          <router-link
            to="/posts"
            class="home-page__primary-action"
          >
            开始阅读
          </router-link>
          <router-link
            to="/posts/create"
            class="home-page__secondary-action"
          >
            发布内容
          </router-link>
        </div>

        <div class="home-page__signals">
          <span class="home-page__signal">{{ insightLine }}</span>
          <span
            v-for="tag in heroTags"
            :key="tag.id"
            class="home-page__signal home-page__signal--tag"
          >
            #{{ tag.name }}
          </span>
        </div>
      </div>

      <div class="home-page__hero-panel">
        <div class="home-page__stats">
          <article
            v-for="stat in summaryStats"
            :key="stat.label"
            class="home-page__stat-card"
          >
            <span class="home-page__stat-label">{{ stat.label }}</span>
            <strong class="home-page__stat-value">{{ stat.value }}</strong>
            <span class="home-page__stat-detail">{{ stat.detail }}</span>
          </article>
        </div>

        <article
          v-if="featuredPost"
          class="home-page__feature"
          @wheel.prevent="handleFeaturedWheel"
        >
          <span class="home-page__feature-label">编辑精选</span>
          <h2 class="home-page__feature-title">
            {{ featuredPost.title }}
          </h2>
          <p class="home-page__feature-text">
            {{ featuredPost.excerpt || featuredPost.content.slice(0, 110) }}
          </p>
          <router-link
            :to="`/posts/${featuredPost.id}`"
            class="home-page__feature-link"
          >
            查看全文
          </router-link>
          <div
            v-if="featuredCandidates.length > 1"
            class="home-page__feature-switch"
          >
            <button
              v-for="(item, index) in featuredCandidates"
              :key="item.id"
              class="home-page__feature-dot"
              :class="{ 'home-page__feature-dot--active': index === featuredIndex }"
              type="button"
              :aria-label="`切换到第 ${index + 1} 条精彩内容`"
              @click="switchFeatured(index)"
            />
          </div>
        </article>

        <div class="home-page__note-strip">
          <span
            v-for="note in curationNotes"
            :key="note"
            class="home-page__note-pill"
          >
            {{ note }}
          </span>
        </div>
      </div>
    </section>

    <section class="home-page__quick-grid">
      <router-link
        v-for="link in quickLinks"
        :key="link.to"
        :to="link.to"
        class="home-page__quick-card"
      >
        <span class="home-page__quick-kicker">
          {{ link.kicker === 'Topics' ? '主题' : link.kicker === 'Ranking' ? '榜单' : '写作' }}
        </span>
        <h2 class="home-page__quick-title">
          {{ link.title }}
        </h2>
        <p class="home-page__quick-description">
          {{ link.description }}
        </p>
      </router-link>
    </section>

    <div class="content-container">
      <section class="home-page__discovery">
        <div class="home-page__section-head home-page__section-head--discovery">
          <div>
            <span class="home-page__section-kicker">热门看点</span>
            <h2 class="home-page__section-title">
              先看方向，再进入内容流
            </h2>
          </div>
          <p class="home-page__section-description">
            先了解热门主题与活跃作者，再进入你感兴趣的文章内容。
          </p>
        </div>

        <div
          v-if="showDiscoverySkeleton"
          class="home-page__discovery-skeleton"
        >
          <div
            v-for="i in 5"
            :key="i"
            class="home-page__discovery-skeleton-card"
          />
        </div>

        <div
          v-else
          class="home-page__discovery-grid"
        >
          <section class="home-page__topics">
            <div class="home-page__block-head">
              <div>
                <span class="home-page__block-kicker">主题趋势</span>
                <h3 class="home-page__block-title">
                  热门主题
                </h3>
              </div>
              <router-link
                to="/tags"
                class="home-page__block-link"
              >
                查看全部
              </router-link>
            </div>

            <div class="home-page__topic-grid">
              <router-link
                v-for="topic in topicHighlights"
                :key="topic.id"
                :to="`/tags/${topic.slug}`"
                class="home-page__topic-card"
              >
                <div class="home-page__topic-top">
                  <span class="home-page__topic-name">#{{ topic.name }}</span>
                  <span class="home-page__topic-growth">
                    {{ formatGrowth(topic.growth) }}
                  </span>
                </div>
                <p class="home-page__topic-description">
                  {{ topic.description }}
                </p>
                <div class="home-page__topic-meta">
                  <span>{{ formatCompactNumber(topic.posts) }} 篇文章</span>
                  <span>{{ formatCompactNumber(topic.views) }} 阅读</span>
                </div>
              </router-link>
            </div>
          </section>

          <section class="home-page__creators">
            <div class="home-page__block-head">
              <div>
                <span class="home-page__block-kicker">活跃作者</span>
                <h3 class="home-page__block-title">
                  本周作者
                </h3>
              </div>
              <router-link
                to="/ranking"
                class="home-page__block-link"
              >
                查看榜单
              </router-link>
            </div>

            <div class="home-page__creator-list">
              <router-link
                v-for="creator in creatorHighlights"
                :key="creator.id"
                :to="`/users/${creator.id}`"
                class="home-page__creator-card"
              >
                <img
                  :src="creator.avatar || '/images/default-avatar.svg'"
                  :alt="creator.nickname"
                  class="home-page__creator-avatar"
                >
                <div class="home-page__creator-copy">
                  <div class="home-page__creator-name-row">
                    <strong class="home-page__creator-name">{{ creator.nickname }}</strong>
                    <span class="home-page__creator-score">{{ formatCompactNumber(creator.score) }}</span>
                  </div>
                  <p class="home-page__creator-bio">
                    {{ creator.bio }}
                  </p>
                  <div class="home-page__creator-meta">
                    <span>{{ formatCompactNumber(creator.posts) }} 篇文章</span>
                    <span>{{ formatCompactNumber(creator.followers) }} 关注</span>
                    <span>{{ formatCompactNumber(creator.views) }} 阅读</span>
                  </div>
                </div>
              </router-link>
            </div>
          </section>
        </div>
      </section>

      <main class="posts-section">
        <div class="home-page__section-head">
          <div>
            <span class="home-page__section-kicker">最新更新</span>
            <h2 class="home-page__section-title">
              最新发布
            </h2>
          </div>
          <p class="home-page__section-description">
            按最新发布时间浏览内容，第一时间跟进社区里的新观点与新文章。
          </p>
        </div>

        <div
          v-if="isLoading"
          class="home-page__skeleton-grid"
        >
          <div class="home-page__skeleton-card home-page__skeleton-card--large" />
          <div
            v-for="i in 3"
            :key="i"
            class="home-page__skeleton-card"
          />
        </div>

        <div
          v-else-if="error"
          class="home-page__error-inline"
        >
          <SiteErrorState
            title="首页内容暂时不可用"
            :message="getErrorMessage(error)"
            mode="section"
            retry-text="重新加载"
            @retry="handleHomeRetry"
          />
        </div>

        <div
          v-else-if="displayPosts.length === 0"
          class="home-page__empty"
        >
          <div class="home-page__empty-card">
            <h3>暂时还没有内容</h3>
            <p>还没有发布任何文章，欢迎来写下第一篇内容。</p>
            <router-link
              to="/posts/create"
              class="home-page__primary-action"
            >
              写第一篇文章
            </router-link>
          </div>
        </div>

        <div
          v-else
          class="posts-list"
        >
          <PostCard
            v-if="featuredPost"
            :post="featuredPost"
            size="large"
            variant="plain"
            class="home-page__feed-post-card home-page__feed-post-card--featured"
            :show-placeholder-title="false"
            @like-change="handleLikeChange"
            @favorite-change="handleFavoriteChange"
          />

          <div
            v-if="secondaryPosts.length > 0"
            class="home-page__post-grid"
          >
            <PostCard
              v-for="post in secondaryPosts"
              :key="post.id"
              :post="post"
              variant="plain"
              class="home-page__feed-post-card home-page__feed-post-card--compact"
              :show-placeholder-title="false"
              @like-change="handleLikeChange"
              @favorite-change="handleFavoriteChange"
            />
          </div>
        </div>
      </main>

      <section class="home-page__cta">
        <div class="home-page__cta-copy">
          <span class="home-page__block-kicker">开始创作</span>
          <h2 class="home-page__cta-title">
            分享你的观察、经验与教程
          </h2>
          <p class="home-page__cta-description">
            开始发布你的观察、教程和经验，让更多读者在这里看到你的内容。
          </p>
        </div>
        <div class="home-page__cta-actions">
          <router-link
            to="/posts/create"
            class="home-page__primary-action"
          >
            立即写作
          </router-link>
          <router-link
            to="/drafts"
            class="home-page__secondary-action home-page__secondary-action--light"
          >
            查看草稿
          </router-link>
        </div>
      </section>
    </div>

    <Teleport
      to="#home-sidebar-slot"
      :disabled="!isMounted"
    >
      <HomeSidebar
        :trending-posts="trendingPosts"
        :is-loading="isSidebarLoading"
        :posts-error="trendingError"
      />
    </Teleport>
  </div>
</template>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.home-page__hero {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(320px, 0.9fr);
  gap: var(--space-xl);
  padding: var(--space-2xl);
  border-radius: var(--radius-home-hero);
  background:
    radial-gradient(circle at top left, rgba(244, 223, 191, 0.18), transparent 24%),
    var(--gradient-hero);
  color: var(--color-text-inverse);
  border: none;
}

.home-page__hero-copy,
.home-page__hero-panel {
  position: relative;
  z-index: 1;
}

.home-page__eyebrow,
.home-page__section-kicker,
.home-page__block-kicker,
.home-page__quick-kicker {
  display: inline-flex;
  align-items: center;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-size: 0.74rem;
}

.home-page__eyebrow {
  margin-bottom: 14px;
  color: rgba(255, 255, 255, 0.72);
}

.page-title {
  max-width: 11ch;
  margin-bottom: 18px;
  font-size: clamp(2.7rem, 5vw, 4.7rem);
  line-height: 1.05;
  color: #fffdf9;
  text-shadow: 0 10px 34px rgba(0, 0, 0, 0.24);
}

.page-description {
  max-width: 58ch;
  margin-bottom: var(--space-xl);
  color: rgba(255, 250, 242, 0.8);
  font-size: 1.05rem;
  line-height: 1.9;
}

.home-page__actions,
.home-page__signals,
.home-page__stats,
.home-page__cta-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.home-page__primary-action,
.home-page__secondary-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 0 18px;
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-semibold);
}

.home-page__primary-action {
  background: #fff8ef;
  color: #12314c;
}

.home-page__secondary-action {
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(255, 255, 255, 0.08);
  color: #fff8ef;
  backdrop-filter: blur(10px);
}

.home-page__secondary-action--light {
  border-color: var(--color-border);
  background: transparent;
  color: var(--color-text);
}

.home-page__signals {
  margin-top: var(--space-lg);
}

.home-page__signal,
.home-page__note-pill {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 0 14px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 250, 242, 0.82);
  font-size: 0.86rem;
  backdrop-filter: blur(8px);
}

.home-page__signal--tag {
  color: #fff8ef;
}

.home-page__hero-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.home-page__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.home-page__stat-card,
.home-page__feature {
  border-radius: 0;
  backdrop-filter: none;
}

.home-page__stat-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 0 14px;
  background: transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.16);
}

.home-page__stat-label {
  color: rgba(255, 250, 242, 0.72);
  font-size: 0.8rem;
}

.home-page__stat-value {
  font-size: clamp(1.5rem, 3vw, 2.3rem);
}

.home-page__stat-detail {
  color: rgba(255, 250, 242, 0.72);
  font-size: 0.82rem;
  line-height: 1.6;
}

.home-page__feature {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 0;
  background: transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.16);
}

.home-page__feature-label {
  display: inline-flex;
  width: fit-content;
  padding: 0;
  border-radius: 0;
  background: transparent;
  color: #fff8ef;
  font-size: 0.76rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.home-page__feature-title {
  font-size: 1.5rem;
  line-height: 1.35;
  color: #fff8ef;
}

.home-page__feature-text,
.home-page__feature-link {
  color: rgba(255, 250, 242, 0.82);
}

.home-page__feature-text {
  line-height: 1.75;
}

.home-page__feature-link {
  width: fit-content;
  font-weight: var(--font-weight-semibold);
}

.home-page__feature-switch {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.home-page__feature-dot {
  width: 8px;
  height: 8px;
  border: none;
  border-radius: 999px;
  background: rgba(255, 248, 239, 0.35);
}

.home-page__feature-dot--active {
  width: 20px;
  background: #fff8ef;
}

.home-page__note-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.home-page__quick-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-lg);
}

.home-page__quick-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: var(--space-md) 0 var(--space-lg);
  border-radius: 0;
  border-bottom: 1px solid var(--color-border);
  transition:
    background-color var(--transition-base);
}

.home-page__quick-card:hover {
  background: var(--color-bg-hover);
}

.home-page__quick-kicker,
.home-page__block-kicker,
.home-page__section-kicker {
  color: var(--color-text-tertiary);
}

.home-page__quick-title,
.home-page__section-title,
.home-page__block-title,
.home-page__cta-title {
  color: var(--color-text);
}

.home-page__quick-title {
  font-size: 1.3rem;
  line-height: 1.35;
}

.home-page__quick-description,
.home-page__section-description,
.home-page__topic-description,
.home-page__creator-bio,
.home-page__cta-description {
  color: var(--color-text-secondary);
  line-height: 1.75;
}

.content-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.home-page__discovery,
.posts-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.home-page__section-head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: var(--space-lg);
  padding: 0 6px;
}

.home-page__section-head--discovery {
  align-items: flex-start;
}

.home-page__section-kicker {
  margin-bottom: 10px;
}

.home-page__section-title {
  font-size: clamp(1.8rem, 3vw, 2.3rem);
}

.home-page__section-description {
  max-width: 40ch;
  text-align: right;
}

.home-page__discovery-skeleton,
.home-page__discovery-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(320px, 0.9fr);
  gap: var(--space-lg);
}

.home-page__discovery-skeleton-card {
  min-height: 180px;
  border-radius: var(--radius-xl);
  background: linear-gradient(90deg, rgba(18, 49, 76, 0.05), rgba(18, 49, 76, 0.12), rgba(18, 49, 76, 0.05));
  background-size: 200% 100%;
  animation: home-skeleton 1.4s ease-in-out infinite;
}

.home-page__topics,
.home-page__creators,
.home-page__cta {
  padding: var(--space-lg);
  border-radius: 0;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  background: transparent;
}

.home-page__block-head {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: var(--space-lg);
}

.home-page__block-title {
  margin-top: 6px;
  font-size: 1.45rem;
}

.home-page__block-link {
  color: var(--color-cta);
  font-weight: var(--font-weight-semibold);
}

.home-page__topic-grid,
.home-page__creator-list,
.posts-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.home-page__feed-post-card {
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--color-border-light);
  background: var(--color-bg-secondary);
}

.home-page__feed-post-card--featured {
  border-color: var(--color-border);
  background: var(--color-surface-overlay);
}

.home-page__feed-post-card--featured.post-card--large :deep(.post-card__media) {
  border-radius: var(--radius-md);
  overflow: hidden;
  border-bottom: none;
}

.home-page__feed-post-card--featured :deep(.post-card__body) {
  padding: var(--space-lg) var(--space-lg) var(--space-md);
  gap: 12px;
}

.home-page__feed-post-card--featured :deep(.post-card__title) {
  font-size: clamp(1.55rem, 2.3vw, 1.95rem);
}

.home-page__feed-post-card--featured :deep(.post-card__excerpt) {
  -webkit-line-clamp: 2;
}

.home-page__feed-post-card--compact :deep(.post-card__media) {
  min-height: 188px;
}

.home-page__feed-post-card--compact :deep(.post-card__body) {
  padding: var(--space-md);
  gap: 10px;
}

.home-page__feed-post-card--compact :deep(.post-card__title) {
  font-size: 1.15rem;
}

.home-page__feed-post-card--compact :deep(.post-card__excerpt) {
  font-size: 0.92rem;
  -webkit-line-clamp: 2;
}

.home-page__feed-post-card--compact :deep(.post-card__tags) {
  display: none;
}

.home-page__feed-post-card--compact :deep(.post-card__actions) {
  padding-top: var(--space-xs);
}

.home-page__topic-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.home-page__topic-card,
.home-page__creator-card {
  display: flex;
  border: none;
  border-bottom: 1px solid var(--color-border-light);
  border-radius: 0;
  background: transparent;
  transition:
    border-color var(--transition-base),
    background-color var(--transition-base);
}

[data-theme='dark'] .home-page__topic-card,
[data-theme='dark'] .home-page__creator-card {
  background: transparent;
}

.home-page__topic-card {
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}

.home-page__creator-card {
  align-items: center;
  gap: 14px;
  padding: 14px;
}

.home-page__topic-card:hover,
.home-page__creator-card:hover {
  border-color: var(--color-border-dark);
  background: var(--color-bg-secondary);
}

.home-page__topic-top,
.home-page__creator-name-row,
.home-page__topic-meta,
.home-page__creator-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.home-page__topic-name,
.home-page__creator-name {
  color: var(--color-text);
}

.home-page__topic-name {
  font-size: 1rem;
  font-weight: var(--font-weight-semibold);
}

.home-page__topic-growth,
.home-page__creator-score {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: var(--radius-full);
  background: var(--color-hover);
  color: var(--color-cta);
  font-size: 0.78rem;
  font-weight: var(--font-weight-semibold);
}

.home-page__topic-meta,
.home-page__creator-meta {
  color: var(--color-text-secondary);
  font-size: 0.8rem;
}

.home-page__creator-avatar {
  width: 60px;
  height: 60px;
  border-radius: 18px;
  object-fit: cover;
  background: var(--color-bg-tertiary);
}

.home-page__creator-copy {
  flex: 1;
  min-width: 0;
}

.home-page__creator-bio {
  margin: 6px 0 10px;
  font-size: 0.9rem;
}

.home-page__post-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-md);
}

.home-page__skeleton-grid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-lg);
}

.home-page__skeleton-card {
  min-height: 320px;
  border-radius: var(--radius-2xl);
  background: linear-gradient(90deg, rgba(18, 49, 76, 0.05), rgba(18, 49, 76, 0.12), rgba(18, 49, 76, 0.05));
  background-size: 200% 100%;
  animation: home-skeleton 1.4s ease-in-out infinite;
}

.home-page__skeleton-card--large {
  min-height: 420px;
}

.home-page__error-inline {
  display: flex;
}

.home-page__empty-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: var(--space-xl);
  border-radius: 0;
  background: transparent;
  border: 1px solid var(--color-border);
  text-align: center;
  box-shadow: none;
  backdrop-filter: none;
}

[data-theme='dark'] .page-title {
  color: #ffffff;
  text-shadow: 0 12px 36px rgba(0, 0, 0, 0.42);
}

[data-theme='dark'] .home-page__empty-card {
  background: transparent;
}

.home-page__empty {
  display: grid;
  place-items: center;
  min-height: 360px;
}

.home-page__empty-card h3 {
  color: var(--color-text);
  font-size: 1.5rem;
}

.home-page__cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-lg);
}

.home-page__cta-copy {
  max-width: 48rem;
}

.home-page__cta-title {
  margin: 8px 0 12px;
  font-size: clamp(1.7rem, 3vw, 2.4rem);
  line-height: 1.2;
}

@keyframes home-skeleton {
  0% {
    background-position: 100% 0;
  }

  100% {
    background-position: -100% 0;
  }
}

@media (max-width: 1199px) {
  .home-page__hero,
  .home-page__discovery-skeleton,
  .home-page__discovery-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .home-page__quick-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .home-page__stats {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1023px) {
  .home-page__section-head,
  .home-page__cta {
    align-items: flex-start;
    flex-direction: column;
  }

  .home-page__section-description {
    text-align: left;
  }

  .home-page__topic-grid,
  .home-page__post-grid,
  .home-page__skeleton-grid,
  .home-page__quick-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .home-page__feed-post-card--featured :deep(.post-card__body) {
    padding: var(--space-md);
  }
}

@media (max-width: 767px) {
  .home-page {
    gap: var(--space-lg);
  }

  .home-page__topics,
  .home-page__creators,
  .home-page__cta {
    padding: var(--space-lg);
    border-radius: 0;
  }

  .home-page__hero {
    padding: var(--space-lg);
    border-radius: var(--radius-home-hero-mobile);
  }

  .page-title {
    font-size: 2.45rem;
  }

  .home-page__stats {
    grid-template-columns: minmax(0, 1fr);
  }

  .home-page__actions,
  .home-page__cta-actions {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
  }

  .home-page__primary-action,
  .home-page__secondary-action {
    width: 100%;
  }

  .home-page__creator-card {
    align-items: flex-start;
  }

  .home-page__feed-post-card--compact :deep(.post-card__media) {
    min-height: 168px;
  }
}
</style>
