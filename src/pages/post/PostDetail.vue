<!--
  文章详情页面
  目标：强化阅读主线，建立正文与辅助信息的分轨布局
-->

<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faBookmark, faCommentDots, faHeart, faLink } from '@fortawesome/free-solid-svg-icons';
import { computed, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { postApi } from '@/api/post';
import CommentList from '@/components/comment/CommentList.vue';
import SiteErrorState from '@/components/common/SiteErrorState.vue';
import { useMarkdown } from '@/composables/useMarkdown';
import { usePostReadingState } from '@/composables/usePostReadingState';
import { usePostQuery } from '@/queries/posts/usePostQuery';
import { useRecommendedPostsQuery } from '@/queries/posts/useRecommendedPostsQuery';
import { useRelatedPostsQuery } from '@/queries/posts/useRelatedPostsQuery';
import type { Post } from '@/types';

interface Props {
  id: string;
}

type TocItem = {
  level: number;
  title: string;
  anchor: string;
};

const props = defineProps<Props>();
const route = useRoute();
const postId = computed(() => String(props.id ?? route.params.id ?? '').trim());

const { renderMarkdown, sanitizeHtml, generateExcerpt, calculateReadingTime } = useMarkdown();

const defaultAvatar = '/images/default-avatar.svg';

const { data: postData, isLoading, error, refetch } = usePostQuery(postId);
const { data: relatedPostsData, isLoading: relatedPostsLoading } = useRelatedPostsQuery(postId, {
  size: 3,
});
const { data: recommendedPostsData, isLoading: recommendedPostsLoading } = useRecommendedPostsQuery(
  {
    page: 1,
    size: 4,
  }
);

const postOverrides = ref<Partial<Post>>({});
const commentsSectionRef = ref<HTMLElement | null>(null);
const articleBodyRef = ref<HTMLElement | null>(null);
const loadedCommentCount = ref<number | null>(null);
const likeLoading = ref(false);
const favoriteLoading = ref(false);
const linkCopied = ref(false);
let copyResetTimer: ReturnType<typeof setTimeout> | null = null;

const post = computed<Post | undefined>(() => {
  if (!postData.value) {
    return undefined;
  }

  return {
    ...postData.value,
    ...postOverrides.value,
  };
});

const articleSource = computed(() => {
  if (!post.value) {
    return '';
  }

  if (post.value.htmlContent?.trim()) {
    return post.value.htmlContent;
  }

  return renderMarkdown(post.value.content || '');
});

const slugifyHeading = (value: string): string => {
  return value
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

const extractPlainText = (value: string): string => {
  if (!value.trim()) {
    return '';
  }

  if (typeof DOMParser === 'undefined') {
    return value
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(value, 'text/html');
  return doc.body.textContent?.replace(/\s+/g, ' ').trim() ?? '';
};

const buildArticlePresentation = (rawHtml: string): { html: string; toc: TocItem[] } => {
  const cleanHtml = sanitizeHtml(rawHtml);

  if (!cleanHtml.trim() || typeof DOMParser === 'undefined') {
    return {
      html: cleanHtml,
      toc: [],
    };
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(cleanHtml, 'text/html');
  const toc: TocItem[] = [];
  const anchorCounter = new Map<string, number>();
  const headings = Array.from(doc.body.querySelectorAll('h2, h3'));

  headings.forEach((heading, index) => {
    const title = heading.textContent?.trim();

    if (!title) {
      return;
    }

    const baseAnchor = slugifyHeading(title) || `section-${index + 1}`;
    const currentCount = anchorCounter.get(baseAnchor) ?? 0;
    anchorCounter.set(baseAnchor, currentCount + 1);

    const anchor = currentCount === 0 ? baseAnchor : `${baseAnchor}-${currentCount + 1}`;

    heading.id = anchor;
    heading.classList.add('article-heading-anchor');

    toc.push({
      level: Number.parseInt(heading.tagName.slice(1), 10),
      title,
      anchor,
    });
  });

  return {
    html: doc.body.innerHTML,
    toc,
  };
};

const articlePresentation = computed(() => buildArticlePresentation(articleSource.value));
const articleHtml = computed(() => articlePresentation.value.html);
const tocItems = computed(() => articlePresentation.value.toc);
const commentCount = computed(() => loadedCommentCount.value ?? post.value?.commentCount ?? 0);
const articleText = computed(() => extractPlainText(articleHtml.value));
const articleSummary = computed(() => {
  if (post.value?.excerpt?.trim()) {
    return post.value.excerpt;
  }

  if (!articleText.value) {
    return '';
  }

  return generateExcerpt(articleText.value, 120);
});
const readingTime = computed(() => calculateReadingTime(post.value?.content || articleText.value));
const headerTags = computed(() => post.value?.tags?.slice(0, 4) ?? []);
const sectionCount = computed(() => tocItems.value.length);
const copyLabel = computed(() => (linkCopied.value ? '已复制' : '复制链接'));
const relatedPosts = computed<Post[]>(() => {
  const currentPostId = post.value?.id;
  const directMatches = (relatedPostsData.value ?? [])
    .filter((item): item is Post => Boolean(item?.id && item.id !== currentPostId))
    .slice(0, 3);

  if (directMatches.length > 0) {
    return directMatches;
  }

  return (recommendedPostsData.value?.items ?? [])
    .filter((item): item is Post => Boolean(item?.id && item.id !== currentPostId))
    .slice(0, 3);
});
const isRelatedLoading = computed(
  () =>
    (relatedPostsLoading.value && relatedPosts.value.length === 0) ||
    (recommendedPostsLoading.value && relatedPosts.value.length === 0)
);
const relatedSectionKicker = computed(() =>
  relatedPostsData.value?.length ? '相关文章' : '继续阅读'
);
const relatedSectionTitle = computed(() =>
  relatedPostsData.value?.length ? '沿着相近主题继续读下去' : '这些内容也值得继续打开'
);
const { readingProgress, activeHeading, scrollToHeading } = usePostReadingState({
  articleBody: articleBodyRef,
  tocItems,
  contentVersion: articleHtml,
});
const normalizedReadingProgress = computed(() => {
  if (!Number.isFinite(readingProgress.value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, readingProgress.value));
});
const readingProgressPercent = computed(() => Math.round(normalizedReadingProgress.value));
const readingBatteryStyle = computed(() => ({
  '--reading-progress-angle': `${(normalizedReadingProgress.value / 100) * 360}deg`,
  '--reading-progress-percent': `${normalizedReadingProgress.value}%`,
}));

const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}万`;
  }

  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }

  return num.toString();
};

const formatDate = (dateString?: string): string => {
  if (!dateString) {
    return '日期待补充';
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return '日期待补充';
  }

  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getPostPreview = (entry: Post): string => {
  if (entry.excerpt?.trim()) {
    return entry.excerpt;
  }

  const plainText = extractPlainText(entry.htmlContent || entry.content || '');

  if (!plainText) {
    return '继续阅读这篇内容，查看完整观点与上下文。';
  }

  return generateExcerpt(plainText, 88);
};

const getPostReadingMinutes = (entry: Post): number =>
  calculateReadingTime(entry.content || entry.excerpt || '');

const getErrorMessage = (err: unknown): string => {
  if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
    return err.message;
  }

  if (typeof err === 'string') {
    return err;
  }

  return '加载文章时发生错误，请稍后重试';
};

const errorPresentation = computed(() => {
  const rawMessage = getErrorMessage(error.value).trim();
  const normalizedMessage = rawMessage.toLowerCase();

  if (
    normalizedMessage.includes('404') ||
    normalizedMessage.includes('not found') ||
    rawMessage.includes('不存在')
  ) {
    return {
      title: '文章不存在或已下线',
      message: '当前文章可能已被删除，或暂时不可访问。',
      detail: '',
    };
  }

  if (
    normalizedMessage.includes('401') ||
    normalizedMessage.includes('403') ||
    rawMessage.includes('未授权') ||
    rawMessage.includes('没有权限') ||
    rawMessage.includes('登录')
  ) {
    return {
      title: '当前账号暂时无法查看',
      message: '请先登录或切换到有权限的账号后再试。',
      detail: '',
    };
  }

  return {
    title: '暂时无法加载文章',
    message: '网络波动或服务繁忙导致加载失败，请稍后重试。',
    detail: rawMessage,
  };
});

const handleRetry = () => {
  void refetch();
};

const handleLike = async () => {
  if (!post.value || likeLoading.value) {
    return;
  }

  likeLoading.value = true;

  try {
    const nextIsLiked = !post.value.isLiked;

    if (post.value.isLiked) {
      await postApi.unlikePost(post.value.id);
    } else {
      await postApi.likePost(post.value.id);
    }

    postOverrides.value = {
      ...postOverrides.value,
      isLiked: nextIsLiked,
      likeCount: Math.max(0, post.value.likeCount + (nextIsLiked ? 1 : -1)),
    };
  } catch (requestError) {
    console.error('点赞操作失败:', requestError);
  } finally {
    likeLoading.value = false;
  }
};

const handleFavorite = async () => {
  if (!post.value || favoriteLoading.value) {
    return;
  }

  favoriteLoading.value = true;

  try {
    const nextIsFavorited = !post.value.isFavorited;

    if (post.value.isFavorited) {
      await postApi.unfavoritePost(post.value.id);
    } else {
      await postApi.favoritePost(post.value.id);
    }

    postOverrides.value = {
      ...postOverrides.value,
      isFavorited: nextIsFavorited,
      favoriteCount: Math.max(0, post.value.favoriteCount + (nextIsFavorited ? 1 : -1)),
    };
  } catch (requestError) {
    console.error('收藏操作失败:', requestError);
  } finally {
    favoriteLoading.value = false;
  }
};

const scrollToComments = () => {
  commentsSectionRef.value?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
};

const handleCopyLink = async () => {
  if (typeof window === 'undefined') {
    return;
  }

  const url = window.location.href;

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
    } else {
      const helperTextarea = document.createElement('textarea');
      helperTextarea.value = url;
      helperTextarea.setAttribute('readonly', 'true');
      helperTextarea.style.position = 'absolute';
      helperTextarea.style.left = '-9999px';
      document.body.appendChild(helperTextarea);
      helperTextarea.select();
      document.execCommand('copy');
      document.body.removeChild(helperTextarea);
    }

    linkCopied.value = true;

    if (copyResetTimer) {
      clearTimeout(copyResetTimer);
    }

    copyResetTimer = setTimeout(() => {
      linkCopied.value = false;
    }, 2200);
  } catch (requestError) {
    console.error('复制链接失败:', requestError);
  }
};

const handleCommentCountChange = (count: number) => {
  loadedCommentCount.value = count;
  postOverrides.value = {
    ...postOverrides.value,
    commentCount: count,
  };
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.onerror = null;
  img.src = '/images/default-post-cover.svg';
};

const handleAvatarError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.onerror = null;
  img.src = defaultAvatar;
};

onUnmounted(() => {
  if (copyResetTimer) {
    clearTimeout(copyResetTimer);
  }
});
</script>

<template>
  <div class="post-detail-page">
    <section
      v-if="post && !error"
      class="post-content-header"
    >
      <div class="post-content-header__inner">
        <div class="breadcrumb">
          <router-link
            to="/"
            class="breadcrumb-link"
          >
            首页
          </router-link>
          <span class="breadcrumb-separator">/</span>
          <router-link
            to="/posts"
            class="breadcrumb-link"
          >
            内容
          </router-link>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-current">文章详情</span>
        </div>

        <div class="post-content-header__eyebrow">
          <span
            v-if="sectionCount > 0"
            class="post-content-header__eyebrow-text"
          >
            {{ sectionCount }} 个章节
          </span>
        </div>

        <h1 class="post-title">
          {{ post?.title || '加载中...' }}
        </h1>

        <p
          v-if="post && articleSummary"
          class="post-summary"
        >
          {{ articleSummary }}
        </p>

        <div
          v-if="post"
          class="post-content-header__meta"
        >
          <router-link
            :to="post.author.id ? `/users/${post.author.id}` : '/posts'"
            class="post-author"
          >
            <img
              :src="post.author.avatar || defaultAvatar"
              :alt="post.author.nickname"
              class="post-author__avatar"
              @error="handleAvatarError"
            >
            <div class="post-author__info">
              <span class="post-author__name">{{ post.author.nickname }}</span>
              <span class="post-author__date">{{
                formatDate(post.publishedAt || post.createdAt)
              }}</span>
            </div>
          </router-link>

          <div class="post-meta-pills">
            <span class="post-meta-pill soft-pill"> {{ readingTime }} 分钟阅读 </span>
            <span class="post-meta-pill soft-pill">
              {{ formatNumber(post.viewCount) }} 次浏览
            </span>
            <span class="post-meta-pill soft-pill"> {{ formatNumber(commentCount) }} 条评论 </span>
            <span class="post-meta-pill soft-pill">
              {{ formatNumber(post.likeCount) }} 次点赞
            </span>
          </div>
        </div>

        <div
          v-if="headerTags.length > 0"
          class="post-content-header__tags"
        >
          <router-link
            v-for="tag in headerTags"
            :key="tag.id"
            :to="`/tags/${tag.slug}`"
            class="post-content-header__tag"
          >
            #{{ tag.name }}
          </router-link>
        </div>
      </div>
    </section>

    <div
      v-if="error || post"
      class="post-shell"
    >
      <div class="post-shell__inner">
        <div
          v-if="error"
          class="error-state"
        >
          <SiteErrorState
            :title="errorPresentation.title"
            :message="errorPresentation.message"
            :detail="errorPresentation.detail"
            mode="page"
            retry-text="重试加载"
            @retry="handleRetry"
          >
            <template #actions>
              <router-link
                to="/posts"
                class="btn-secondary"
              >
                返回文章列表
              </router-link>
            </template>
          </SiteErrorState>
        </div>

        <div
          v-else-if="post"
          class="post-shell__frame"
        >
          <Teleport to="#post-detail-reading-slot">
            <aside class="post-reading-rail">
              <section class="post-rail-section post-rail-section--reading">
                <p class="post-rail-section__kicker">
                  阅读线索
                </p>
                <div class="post-reading-overview">
                  <div
                    class="post-reading-overview__hero"
                    :style="readingBatteryStyle"
                    role="progressbar"
                    aria-label="阅读进度"
                    aria-valuemin="0"
                    aria-valuemax="100"
                    :aria-valuenow="readingProgressPercent"
                  >
                    <span
                      class="post-reading-overview__charge"
                      aria-hidden="true"
                    />
                    <span class="post-reading-overview__progress">
                      {{ readingProgressPercent }}%
                    </span>
                    <span class="post-reading-overview__caption"> 阅读进度 </span>
                  </div>

                  <div class="post-reading-facts">
                    <div class="post-reading-facts__item">
                      <span class="post-reading-facts__label">时长</span>
                      <strong class="post-reading-facts__value">{{ readingTime }} 分钟</strong>
                    </div>
                    <div class="post-reading-facts__item">
                      <span class="post-reading-facts__label">章节</span>
                      <strong class="post-reading-facts__value">{{ sectionCount || '无' }}</strong>
                    </div>
                  </div>
                </div>
              </section>

              <nav
                v-if="tocItems.length > 0"
                class="post-rail-section post-toc"
                aria-label="文章目录"
              >
                <p class="post-rail-section__kicker">
                  目录导航
                </p>
                <button
                  v-for="(item, index) in tocItems"
                  :key="item.anchor"
                  type="button"
                  class="post-toc__item"
                  :class="{
                    'post-toc__item--nested': item.level > 2,
                    'post-toc__item--active': activeHeading === item.anchor,
                  }"
                  @click="scrollToHeading(item.anchor)"
                >
                  <span class="post-toc__index">
                    {{ String(index + 1).padStart(2, '0') }}
                  </span>
                  <span class="post-toc__title">
                    {{ item.title }}
                  </span>
                </button>
              </nav>
            </aside>
          </Teleport>

          <main class="post-layout">
            <article class="post-article">
              <div
                v-if="post.coverImage"
                class="cover-image-wrapper"
              >
                <img
                  :src="post.coverImage"
                  :alt="post.title"
                  class="cover-image"
                  @error="handleImageError"
                >
              </div>

              <!-- eslint-disable vue/no-v-html -->
              <div
                ref="articleBodyRef"
                class="article-body"
                v-html="articleHtml"
              />
              <!-- eslint-enable vue/no-v-html -->
            </article>

            <section class="post-conclusion">
              <div class="post-conclusion__content">
                <p class="post-conclusion__kicker">
                  阅读结束
                </p>
                <h2 class="post-conclusion__title">
                  继续沿着这个主题展开讨论
                </h2>
                <p class="post-conclusion__text">
                  收藏这篇文章，或直接进入评论区补充你的观察和问题。
                </p>
              </div>

              <div
                v-if="post.tags.length > 0"
                class="post-tags"
              >
                <router-link
                  v-for="tag in post.tags"
                  :key="tag.id"
                  :to="`/tags/${tag.slug}`"
                  class="post-tags__item"
                >
                  #{{ tag.name }}
                </router-link>
              </div>
            </section>
          </main>

          <Teleport to="#post-detail-action-slot">
            <aside class="post-action-rail">
              <section class="post-rail-section post-rail-section--actions">
                <p class="post-rail-section__kicker">
                  工具轨
                </p>

                <div class="post-side-actions">
                  <button
                    class="side-action-btn"
                    type="button"
                    :class="{ 'side-action-btn--active': post.isLiked }"
                    :disabled="likeLoading"
                    :aria-pressed="post.isLiked"
                    @click="handleLike"
                  >
                    <span class="side-action-btn__icon-wrap">
                      <FontAwesomeIcon
                        :icon="faHeart"
                        class="side-action-btn__icon"
                      />
                    </span>
                    <span class="side-action-btn__copy">
                      <span class="side-action-btn__label">{{
                        post.isLiked ? '已点赞' : '点赞文章'
                      }}</span>
                      <span class="side-action-btn__value">{{ formatNumber(post.likeCount) }}</span>
                    </span>
                  </button>

                  <button
                    class="side-action-btn"
                    type="button"
                    :class="{ 'side-action-btn--active': post.isFavorited }"
                    :disabled="favoriteLoading"
                    :aria-pressed="post.isFavorited"
                    @click="handleFavorite"
                  >
                    <span class="side-action-btn__icon-wrap">
                      <FontAwesomeIcon
                        :icon="faBookmark"
                        class="side-action-btn__icon"
                      />
                    </span>
                    <span class="side-action-btn__copy">
                      <span class="side-action-btn__label">{{
                        post.isFavorited ? '已收藏' : '收藏文章'
                      }}</span>
                      <span class="side-action-btn__value">{{
                        formatNumber(post.favoriteCount)
                      }}</span>
                    </span>
                  </button>

                  <button
                    class="side-action-btn"
                    type="button"
                    @click="scrollToComments"
                  >
                    <span class="side-action-btn__icon-wrap">
                      <FontAwesomeIcon
                        :icon="faCommentDots"
                        class="side-action-btn__icon"
                      />
                    </span>
                    <span class="side-action-btn__copy">
                      <span class="side-action-btn__label">查看评论</span>
                      <span class="side-action-btn__value">{{ formatNumber(commentCount) }}</span>
                    </span>
                  </button>

                  <button
                    class="side-action-btn"
                    type="button"
                    @click="handleCopyLink"
                  >
                    <span class="side-action-btn__icon-wrap">
                      <FontAwesomeIcon
                        :icon="faLink"
                        class="side-action-btn__icon"
                      />
                    </span>
                    <span class="side-action-btn__copy">
                      <span class="side-action-btn__label">{{ copyLabel }}</span>
                      <span class="side-action-btn__value">链接操作</span>
                    </span>
                  </button>
                </div>
              </section>
            </aside>
          </Teleport>
        </div>
      </div>
    </div>

    <section
      v-if="post && !isLoading && !error"
      class="post-related-section"
    >
      <div class="post-related-section__inner">
        <div class="post-related-section__header">
          <div>
            <p class="post-related-section__kicker">
              {{ relatedSectionKicker }}
            </p>
            <h2 class="post-related-section__title">
              {{ relatedSectionTitle }}
            </h2>
          </div>
          <router-link
            to="/posts"
            class="post-related-section__more"
          >
            浏览更多内容
          </router-link>
        </div>

        <div
          v-if="isRelatedLoading"
          class="post-related-grid post-related-grid--loading"
        >
          <article
            v-for="placeholder in 3"
            :key="placeholder"
            class="post-related-card post-related-card--placeholder"
            aria-hidden="true"
          >
            <span class="post-related-card__eyebrow">准备内容中</span>
            <div
              class="post-related-card__placeholder-line post-related-card__placeholder-line--title"
            />
            <div class="post-related-card__placeholder-line" />
            <div
              class="post-related-card__placeholder-line post-related-card__placeholder-line--short"
            />
          </article>
        </div>

        <div
          v-else-if="relatedPosts.length > 0"
          class="post-related-grid"
        >
          <router-link
            v-for="entry in relatedPosts"
            :key="entry.id"
            :to="`/posts/${entry.id}`"
            class="post-related-card"
          >
            <div class="post-related-card__meta">
              <span class="post-related-card__eyebrow">
                {{ entry.tags[0]?.name || '继续阅读' }}
              </span>
              <span class="post-related-card__time"> {{ getPostReadingMinutes(entry) }} 分钟 </span>
            </div>

            <h3 class="post-related-card__title">
              {{ entry.title }}
            </h3>

            <p class="post-related-card__excerpt">
              {{ getPostPreview(entry) }}
            </p>

            <div class="post-related-card__footer">
              <span class="post-related-card__author">
                {{ entry.author?.nickname || '匿名用户' }}
              </span>
              <span class="post-related-card__stats">
                {{ formatNumber(entry.commentCount || 0) }} 评论
              </span>
            </div>
          </router-link>
        </div>
      </div>
    </section>

    <section
      v-if="post && !isLoading && !error"
      ref="commentsSectionRef"
      class="comments-section"
    >
      <div class="comments-section__inner">
        <div class="comments-section__header">
          <div>
            <p class="comments-section__kicker">
              参与讨论
            </p>
            <h2 class="comments-section__title">
              评论
            </h2>
          </div>
          <span class="comments-section__count">
            {{ formatNumber(commentCount) }}
          </span>
        </div>

        <CommentList
          :post-id="post.id"
          @comment-count-change="handleCommentCountChange"
        />
      </div>
    </section>

    <div
      v-if="post && !isLoading && !error"
      class="mobile-action-bar"
    >
      <button
        class="mobile-action-bar__item"
        type="button"
        :class="{ 'mobile-action-bar__item--active': post.isLiked }"
        :disabled="likeLoading"
        @click="handleLike"
      >
        <FontAwesomeIcon
          :icon="faHeart"
          class="mobile-action-bar__icon"
        />
        <span>{{ post.isLiked ? '已赞' : '点赞' }}</span>
        <strong>{{ formatNumber(post.likeCount) }}</strong>
      </button>
      <button
        class="mobile-action-bar__item"
        type="button"
        :class="{ 'mobile-action-bar__item--active': post.isFavorited }"
        :disabled="favoriteLoading"
        @click="handleFavorite"
      >
        <FontAwesomeIcon
          :icon="faBookmark"
          class="mobile-action-bar__icon"
        />
        <span>{{ post.isFavorited ? '已藏' : '收藏' }}</span>
        <strong>{{ formatNumber(post.favoriteCount) }}</strong>
      </button>
      <button
        class="mobile-action-bar__item"
        type="button"
        @click="scrollToComments"
      >
        <FontAwesomeIcon
          :icon="faCommentDots"
          class="mobile-action-bar__icon"
        />
        <span>评论</span>
        <strong>{{ formatNumber(commentCount) }}</strong>
      </button>
      <button
        class="mobile-action-bar__item"
        type="button"
        @click="handleCopyLink"
      >
        <FontAwesomeIcon
          :icon="faLink"
          class="mobile-action-bar__icon"
        />
        <span>{{ copyLabel }}</span>
        <strong>链接</strong>
      </button>
    </div>
  </div>
</template>

<style scoped>
.post-detail-page {
  min-height: 100vh;
  background: transparent;
}

.post-content-header {
  position: relative;
  z-index: 1;
  isolation: isolate;
  overflow: visible;
  width: 100%;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color-text);
  box-shadow: none;
}

.post-content-header__inner {
  width: min(1580px, calc(100% - 40px));
  margin: 0 auto;
  padding: calc(var(--space-lg) + 12px) var(--space-md) calc(var(--space-3xl) - 10px);
}

.post-content-header::before {
  content: none;
}

.post-content-header::after {
  content: none;
}

.breadcrumb {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: var(--space-lg);
  padding: 8px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: var(--color-surface-overlay);
  color: var(--color-text-secondary);
  font-size: 0.88rem;
}

.breadcrumb-link {
  transition: color var(--transition-base);
}

.breadcrumb-link:hover {
  color: var(--color-text);
}

.breadcrumb-separator {
  color: var(--color-text-tertiary);
}

.breadcrumb-current {
  color: var(--color-text);
}

.post-content-header__eyebrow {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}

.post-content-header__eyebrow-text {
  color: var(--color-text-secondary);
  font-size: 0.92rem;
  letter-spacing: 0.04em;
}

.post-title {
  max-width: 100%;
  margin: 0;
  font-size: clamp(1.8rem, 3vw, 3rem);
  font-family: var(--font-heading);
  color: var(--color-text);
  line-height: 1.04;
  letter-spacing: -0.02em;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.post-summary {
  max-width: 760px;
  margin-top: 18px;
  font-size: 1.05rem;
  line-height: 1.9;
  color: var(--color-text-secondary);
}

.post-content-header__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-lg);
  margin-top: 26px;
  padding-top: 18px;
  border-top: 1px solid var(--color-border);
}

.post-author {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  padding: 0;
  border: none;
  border-radius: 0;
  background: transparent;
  text-decoration: none;
}

.post-author__avatar {
  width: 52px;
  height: 52px;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  object-fit: cover;
  background: var(--color-surface-overlay);
}

.post-author__info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.post-author__name {
  font-size: 1rem;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  transition: color var(--transition-base);
}

.post-author__date {
  color: var(--color-text-secondary);
  font-size: 0.92rem;
}

.post-author:hover .post-author__name {
  color: var(--color-cta);
}

.post-meta-pills {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 10px;
}

.post-meta-pill {
  min-height: 40px;
  padding: 0 14px;
  color: var(--color-text);
  border-color: var(--color-border);
  background: var(--color-surface-overlay);
}

.post-content-header__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.post-content-header__tag {
  display: inline-flex;
  align-items: center;
  min-height: 38px;
  padding: 0 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: var(--color-surface-overlay);
  color: var(--color-cta);
  font-size: 0.88rem;
  transition:
    transform var(--transition-base),
    background-color var(--transition-base),
    border-color var(--transition-base);
}

.post-content-header__tag:hover {
  transform: translateY(-1px);
  background: var(--color-bg-hover);
  border-color: var(--color-border-dark);
}

.post-shell {
  margin-top: 0;
  padding: var(--space-xl) var(--space-lg) var(--space-3xl);
}

.post-shell__inner {
  width: min(1580px, calc(100% - 40px));
  margin: 0 auto;
}

.post-shell__frame {
  min-width: 0;
}

.post-reading-rail {
  min-width: 0;
  width: 208px;
  margin-top: 18px;
}

.post-reading-rail,
.post-action-rail {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.post-action-rail {
  width: 96px;
  box-sizing: border-box;
  align-self: start;
  margin-left: auto;
  padding: 8px;
  border: 1px solid var(--color-border);
  border-radius: calc(var(--radius-xl) + 4px);
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--color-surface-overlay) 88%, rgba(255, 255, 255, 0.24) 12%),
    color-mix(in srgb, var(--color-surface-overlay) 96%, transparent)
  );
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(12px);
}

.post-layout {
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
}

.post-rail-section {
  border-radius: var(--radius-xl);
}

.post-rail-section {
  padding: 16px 18px;
  border: 1px solid var(--color-border);
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--color-surface-overlay) 88%, rgba(255, 255, 255, 0.24) 12%),
    color-mix(in srgb, var(--color-surface-overlay) 96%, transparent)
  );
  box-shadow: var(--shadow-sm);
}

.post-rail-section--actions {
  z-index: 5;
  align-self: stretch;
  width: 100%;
  margin-left: 0;
  padding: 10px 0;
  border: none;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  backdrop-filter: none;
}

.post-rail-section__kicker,
.comments-section__kicker,
.post-conclusion__kicker {
  margin: 0 0 12px;
  color: var(--color-text-tertiary);
  font-size: 0.76rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.post-rail-section--actions .post-rail-section__kicker {
  margin-bottom: 10px;
  text-align: center;
}

.post-rail-section--reading {
  padding: 18px;
}

.post-reading-overview {
  display: grid;
  gap: 14px;
}

.post-reading-overview__hero {
  --reading-progress-angle: 0deg;
  --reading-progress-percent: 0%;
  --reading-shell-border: rgba(173, 216, 230, 0.26);
  --reading-shell-bg-top: color-mix(in srgb, var(--color-surface-overlay) 84%, transparent);
  --reading-shell-bg-bottom: color-mix(in srgb, var(--color-surface-overlay) 92%, transparent);
  --reading-grid-line: rgba(173, 216, 230, 0.12);
  --reading-shell-inner: rgba(173, 216, 230, 0.16);
  --reading-cap-bg: rgba(16, 33, 49, 0.92);
  --reading-text-main: var(--color-text);
  --reading-text-sub: var(--color-text-secondary);
  --reading-charge-start: #f6c778;
  --reading-charge-end: #34d399;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 5px;
  position: relative;
  isolation: isolate;
  overflow: visible;
  min-height: 76px;
  padding: 16px 22px 16px 18px;
  border: 1px solid var(--reading-shell-border);
  border-radius: calc(var(--radius-lg) + 2px);
  overflow: hidden;
  background:
    linear-gradient(
      180deg,
      var(--reading-shell-bg-top),
      var(--reading-shell-bg-bottom)
    ),
    repeating-linear-gradient(
      90deg,
      transparent 0 18px,
      var(--reading-grid-line) 18px 20px
    );
  box-shadow: inset 0 0 0 1px var(--reading-shell-inner);
}

[data-theme='dark'] .post-reading-overview__hero {
  --reading-shell-bg-top: rgba(16, 33, 49, 0.9);
  --reading-shell-bg-bottom: rgba(8, 19, 31, 0.94);
  --reading-text-main: #edf3f8;
  --reading-text-sub: rgba(237, 243, 248, 0.76);
}

.post-reading-overview__hero::after {
  content: '';
  position: absolute;
  top: 50%;
  right: -7px;
  width: 7px;
  height: 24px;
  border: 1px solid var(--reading-shell-border);
  border-left: none;
  border-radius: 0 6px 6px 0;
  background: var(--reading-cap-bg);
  transform: translateY(-50%);
}

.post-reading-overview__charge {
  position: absolute;
  inset: 0 auto 0 0;
  width: var(--reading-progress-percent);
  min-width: 0;
  border-radius: calc(var(--radius-lg) + 1px) 0 0 calc(var(--radius-lg) + 1px);
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.24), transparent 38%),
    linear-gradient(
      var(--reading-progress-angle),
      var(--reading-charge-start),
      var(--reading-charge-end)
    ),
    repeating-linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.22) 0 16px,
      rgba(255, 255, 255, 0) 16px 20px
    );
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.28),
    inset 0 -1px 0 rgba(8, 30, 24, 0.14),
    0 0 22px rgba(15, 118, 98, 0.2);
  transition:
    width 180ms ease-out,
    background 180ms ease-out;
  z-index: 0;
}

.post-reading-overview__progress {
  position: relative;
  z-index: 1;
  color: var(--reading-text-main);
  font-size: clamp(1.8rem, 2vw, 2.3rem);
  font-weight: var(--font-weight-bold);
  line-height: 1;
  text-shadow: 0 1px 14px rgba(255, 255, 255, 0.12);
}

.post-reading-overview__caption {
  position: relative;
  z-index: 1;
  color: var(--reading-text-sub);
  font-size: 0.82rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.post-reading-facts {
  display: grid;
  gap: 12px;
}

.post-reading-facts__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--color-surface-overlay) 84%, transparent);
}

.post-reading-facts__label {
  color: var(--color-text-secondary);
  font-size: 0.88rem;
}

.post-reading-facts__value {
  color: var(--color-text);
  font-size: 0.94rem;
}

.post-toc {
  max-height: calc(100vh - 132px);
  overflow-y: auto;
}

.post-toc__item {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  align-items: start;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 0.92rem;
  line-height: 1.5;
  text-align: left;
  transition:
    background-color var(--transition-base),
    color var(--transition-base),
    transform var(--transition-base);
}

.post-toc__item + .post-toc__item {
  margin-top: 6px;
}

.post-toc__index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  padding: 0 8px;
  border: 1px solid color-mix(in srgb, var(--color-border) 80%, white 20%);
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--color-surface-overlay) 86%, transparent);
  color: var(--color-text-tertiary);
  font-size: 0.74rem;
  font-variant-numeric: tabular-nums;
}

.post-toc__title {
  display: block;
  min-width: 0;
}

.post-toc__item:hover {
  background: var(--color-bg-hover);
  color: var(--color-text);
  transform: translateX(2px);
}

.post-toc__item--nested {
  padding-left: 22px;
  font-size: 0.88rem;
}

.post-toc__item--active {
  background: var(--color-hover);
  color: var(--color-cta);
}

.post-toc__item--active .post-toc__index {
  border-color: color-mix(in srgb, var(--color-accent) 24%, transparent);
  background: color-mix(in srgb, var(--color-accent) 14%, white 86%);
  color: var(--color-cta);
}

.post-article {
  padding: clamp(10px, 1.8vw, 18px) 0 0;
  background: transparent;
}

.cover-image-wrapper {
  overflow: hidden;
  margin-bottom: var(--space-2xl);
  border-radius: calc(var(--radius-xl) - 6px);
  box-shadow: var(--shadow-md);
}

.cover-image {
  width: 100%;
  height: auto;
  object-fit: cover;
}

.post-conclusion {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  padding: 28px 0 0;
  border-top: 1px solid var(--color-border);
}

.post-conclusion__content {
  max-width: 420px;
}

.post-conclusion__title {
  margin: 0;
  color: var(--color-text);
  font-size: 1.5rem;
}

.post-conclusion__text {
  margin-top: 10px;
  color: var(--color-text-secondary);
  line-height: 1.75;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}

.post-tags__item {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 0 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: var(--color-surface-overlay);
  color: var(--color-cta);
  font-size: 0.88rem;
  transition:
    transform var(--transition-base),
    border-color var(--transition-base),
    background-color var(--transition-base);
}

.post-tags__item:hover {
  transform: translateY(-1px);
  border-color: var(--color-border-dark);
  background: var(--color-bg-hover);
}

.post-side-actions {
  display: grid;
  gap: 0;
}

.side-action-btn {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  justify-items: center;
  gap: 8px;
  min-height: 76px;
  padding: 12px 0;
  border: none;
  border-radius: 0;
  background: transparent;
  color: var(--color-text);
  transition:
    color var(--transition-base),
    opacity var(--transition-base);
}

.side-action-btn + .side-action-btn {
  border-top: 1px solid var(--color-border-light);
}

.side-action-btn:hover:not(:disabled) {
  color: var(--color-cta);
}

.side-action-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.side-action-btn--active {
  border-color: transparent;
  background: transparent;
  color: var(--color-cta);
}

.side-action-btn__icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 14px;
  background:
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.35), transparent 65%),
    color-mix(in srgb, var(--color-bg-secondary) 90%, transparent);
  box-shadow:
    var(--shadow-inner),
    0 10px 22px rgba(15, 23, 42, 0.06);
}

.side-action-btn__icon {
  width: 16px;
  height: 16px;
}

.side-action-btn__copy {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
  text-align: center;
}

.side-action-btn__label {
  color: currentColor;
  font-size: 0.76rem;
  font-weight: var(--font-weight-medium);
  line-height: 1.25;
}

.side-action-btn__value {
  margin-top: 4px;
  color: var(--color-text-secondary);
  font-size: 0.74rem;
}

.post-related-section {
  padding: 0 var(--space-lg) var(--space-3xl);
}

.post-related-section__inner {
  width: min(1580px, calc(100% - 40px));
  margin: 0 auto;
}

.post-related-section__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  padding: 0 0 20px;
}

.post-related-section__kicker {
  margin: 0 0 10px;
  color: var(--color-text-tertiary);
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.post-related-section__title {
  margin: 0;
  color: var(--color-text);
  font-size: clamp(1.7rem, 2vw, 2.2rem);
  line-height: 1.12;
}

.post-related-section__more {
  display: inline-flex;
  align-items: center;
  min-height: 42px;
  padding: 0 16px;
  border-radius: var(--radius-full);
  color: var(--color-text-secondary);
  transition:
    transform var(--transition-base),
    color var(--transition-base),
    background-color var(--transition-base);
}

.post-related-section__more:hover {
  transform: translateX(2px);
  color: var(--color-text);
  background: var(--color-bg-hover);
}

.post-related-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.post-related-card {
  display: grid;
  gap: 18px;
  min-height: 240px;
  padding: 22px;
  border: 1px solid var(--color-border);
  border-radius: calc(var(--radius-xl) + 2px);
  background:
    radial-gradient(circle at top right, rgba(15, 118, 98, 0.08), transparent 34%),
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--color-surface-overlay) 82%, rgba(255, 255, 255, 0.18) 18%),
      color-mix(in srgb, var(--color-surface) 94%, transparent)
    );
  box-shadow: var(--shadow-sm);
  transition:
    transform var(--transition-base),
    border-color var(--transition-base),
    box-shadow var(--transition-base);
}

.post-related-card:hover {
  transform: translateY(-3px);
  border-color: var(--color-border-dark);
  box-shadow: var(--shadow-lg);
}

.post-related-card__meta,
.post-related-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.post-related-card__eyebrow {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 10px;
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--color-hover) 72%, white 28%);
  color: var(--color-cta);
  font-size: 0.78rem;
  font-weight: var(--font-weight-medium);
}

.post-related-card__time,
.post-related-card__stats {
  color: var(--color-text-tertiary);
  font-size: 0.82rem;
}

.post-related-card__title {
  margin: 0;
  color: var(--color-text);
  font-size: 1.34rem;
  line-height: 1.3;
}

.post-related-card__excerpt {
  margin: 0;
  color: var(--color-text-secondary);
  line-height: 1.76;
}

.post-related-card__author {
  color: var(--color-text);
  font-size: 0.92rem;
  font-weight: var(--font-weight-medium);
}

.post-related-card--placeholder {
  pointer-events: none;
}

.post-related-card__placeholder-line {
  height: 12px;
  border-radius: var(--radius-full);
  background: linear-gradient(90deg, rgba(226, 232, 240, 0.72), rgba(255, 255, 255, 0.96));
}

.post-related-card__placeholder-line--title {
  height: 20px;
  width: 78%;
}

.post-related-card__placeholder-line--short {
  width: 62%;
}

.comments-section {
  padding: 0 var(--space-lg) calc(var(--space-3xl) + 96px);
}

.comments-section__inner {
  width: min(1580px, calc(100% - 40px));
  margin: 0 auto;
  padding: 0 clamp(18px, 2.5vw, 28px) clamp(24px, 4vw, 36px);
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border-light);
  background: transparent;
}

.comments-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 24px 0 18px;
  border-bottom: 1px solid var(--color-border);
}

.comments-section__title {
  margin: 0;
  color: var(--color-text);
  font-size: 1.7rem;
}

.comments-section__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  min-height: 0;
  padding: 0;
  border: none;
  border-radius: var(--radius-full);
  color: var(--color-text);
  font-size: 1.6rem;
  font-weight: var(--font-weight-semibold);
}

.loading-state,
.error-state {
  display: flex;
  align-items: center;
  min-height: 320px;
  padding: 0 clamp(18px, 2.5vw, 28px);
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border-light);
  border-radius: 0;
  background: transparent;
}

.error-card {
  width: min(760px, 100%);
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: clamp(20px, 3vw, 30px) 0;
  text-align: left;
}

.loading-state {
  justify-content: center;
}

.error-state {
  justify-content: center;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0 18px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text);
  font-size: 0.98rem;
  font-weight: var(--font-weight-medium);
  transition:
    background-color var(--transition-base),
    border-color var(--transition-base);
}

.btn-secondary:hover {
  border-color: var(--color-border-dark);
  background: var(--color-bg-hover);
}

.article-body {
  max-width: min(100%, 78ch);
  color: var(--color-text);
  font-size: 1.08rem;
  line-height: var(--line-height-relaxed);
}

.article-body :deep(*) {
  max-width: 100%;
}

.article-body :deep(h2) {
  margin-top: var(--space-3xl);
  margin-bottom: var(--space-lg);
  color: var(--color-text);
  font-size: clamp(1.7rem, 2vw, 2.1rem);
  line-height: 1.2;
}

.article-body :deep(h3) {
  margin-top: var(--space-2xl);
  margin-bottom: var(--space-md);
  color: var(--color-text);
  font-size: clamp(1.3rem, 1.6vw, 1.55rem);
  line-height: 1.28;
}

.article-body :deep(.article-heading-anchor) {
  scroll-margin-top: 112px;
}

.article-body :deep(p),
.article-body :deep(ul),
.article-body :deep(ol),
.article-body :deep(blockquote),
.article-body :deep(pre),
.article-body :deep(table) {
  margin-bottom: var(--space-lg);
}

.article-body :deep(ul),
.article-body :deep(ol) {
  padding-left: 1.3em;
}

.article-body :deep(li + li) {
  margin-top: 0.35em;
}

.article-body :deep(a) {
  color: var(--color-cta);
  text-decoration: underline;
  text-underline-offset: 0.18em;
}

.article-body :deep(a:hover) {
  color: var(--color-cta-hover);
}

.article-body :deep(blockquote) {
  padding: 16px 18px;
  border-left: 3px solid var(--color-accent);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  background: var(--color-surface-overlay);
  color: var(--color-text-secondary);
}

.article-body :deep(img) {
  width: 100%;
  height: auto;
  margin: var(--space-xl) 0;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.article-body :deep(hr) {
  height: 1px;
  margin: var(--space-2xl) 0;
  border: 0;
  background: var(--color-border);
}

.article-body :deep(code) {
  padding: 0.18em 0.44em;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface-overlay);
  color: var(--color-text);
  font-size: 0.92em;
  font-family: var(--font-mono);
}

.article-body :deep(pre) {
  overflow-x: auto;
  padding: 18px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.article-body :deep(pre code) {
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color-text-inverse);
}

.article-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.article-body :deep(th),
.article-body :deep(td) {
  padding: 12px 14px;
  border-bottom: 1px solid var(--color-border-light);
  text-align: left;
}

.article-body :deep(th) {
  background: var(--color-surface-overlay);
  color: var(--color-text);
}

.mobile-action-bar {
  position: fixed;
  right: 12px;
  bottom: 12px;
  left: 12px;
  z-index: 65;
  display: none;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  padding: 10px;
  border: 1px solid var(--color-border);
  border-radius: calc(var(--radius-xl) - 4px);
  background: var(--gradient-card);
  box-shadow: var(--shadow-xl);
  backdrop-filter: blur(18px);
}

.mobile-action-bar__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  min-height: 54px;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text);
  font-size: 0.8rem;
}

.mobile-action-bar__icon {
  width: 15px;
  height: 15px;
}

.mobile-action-bar__item strong {
  font-size: 0.88rem;
}

.mobile-action-bar__item--active {
  background: var(--color-hover);
  color: var(--color-cta);
}

.breadcrumb-link:focus-visible,
.post-content-header__tag:focus-visible,
.post-toc__item:focus-visible,
.post-related-card:focus-visible,
.post-related-section__more:focus-visible,
.side-action-btn:focus-visible,
.mobile-action-bar__item:focus-visible,
.btn-secondary:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus);
}

@media (max-width: 1180px) {
  .post-reading-rail {
    display: none;
  }

  .post-related-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .post-content-header__inner {
    padding: calc(var(--space-md) + 10px) var(--space-sm) calc(var(--space-2xl) - 8px);
  }

  .post-title {
    max-width: none;
  }

  .post-content-header__meta {
    flex-direction: column;
    align-items: flex-start;
  }

  .post-meta-pills {
    justify-content: flex-start;
  }

  .post-shell,
  .comments-section {
    padding-left: var(--space-md);
    padding-right: var(--space-md);
  }

  .post-shell__inner,
  .comments-section__inner {
    width: 100%;
  }

  .post-action-rail {
    position: static;
    order: 3;
    width: 100%;
    margin-left: 0;
    padding: 0;
    border: none;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
    backdrop-filter: none;
  }

  .post-rail-section--actions {
    position: static;
    width: 100%;
    margin-left: 0;
    padding: 10px 0 0;
  }

  .post-rail-section--actions .post-rail-section__kicker {
    text-align: left;
  }

  .side-action-btn {
    grid-template-columns: 44px minmax(0, 1fr);
    justify-items: stretch;
    align-items: center;
    gap: 12px;
    min-height: 64px;
    padding: 10px 0;
    border-radius: 0;
  }

  .side-action-btn__icon-wrap {
    border-radius: 14px;
  }

  .side-action-btn__copy {
    align-items: flex-start;
    text-align: left;
  }

  .side-action-btn__label,
  .side-action-btn__value {
    font-size: inherit;
  }

  .article-body {
    max-width: 100%;
  }

  .post-conclusion {
    flex-direction: column;
  }

  .post-tags {
    justify-content: flex-start;
  }

  .post-related-section__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .post-related-grid {
    grid-template-columns: minmax(0, 1fr);
  }

}

@media (max-width: 768px) {
  .post-detail-page {
    background: transparent;
  }

  .post-title {
    font-size: clamp(1.45rem, 5.2vw, 2.05rem);
  }

  .post-summary {
    font-size: 1rem;
  }

  .post-article {
    padding: 12px 0 0;
  }

  .comments-section {
    padding-bottom: calc(var(--space-3xl) + 112px);
  }

  .mobile-action-bar {
    display: grid;
  }

}

@media (max-width: 480px) {
  .post-meta-pills {
    gap: 8px;
  }

  .post-meta-pill {
    min-height: 36px;
    padding: 0 12px;
    font-size: 0.82rem;
  }

  .post-author__avatar {
    width: 48px;
    height: 48px;
  }

  .article-body {
    font-size: 1rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
</style>
