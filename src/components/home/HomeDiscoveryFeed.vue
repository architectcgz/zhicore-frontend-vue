<template>
  <section class="home-discovery" aria-labelledby="home-discovery-title">
    <header class="home-discovery__hero">
      <h1 id="home-discovery-title" class="home-discovery__hero-title">
        结构化知识，<br />
        无限洞察。
      </h1>
      <p class="home-discovery__hero-desc">
        知构：致力于培育结构化知识、分享洞见，<br />
        并通过优质内容共同成长的首选社区。
      </p>
      <div class="home-discovery__hero-actions">
        <RouterLink
          class="home-discovery__btn home-discovery__btn--primary"
          to="/auth/login"
        >
          免费开始
        </RouterLink>
        <RouterLink
          class="home-discovery__btn home-discovery__btn--secondary"
          to="/structure"
        >
          探索社区
        </RouterLink>
      </div>
    </header>

    <div class="home-discovery__feed-nav-wrapper">
      <nav class="home-discovery__feed-nav" aria-label="内容分类">
        <button
          v-for="category in discovery?.contentCategories ?? []"
          :key="category"
          type="button"
          class="home-discovery__nav-item"
          :class="{
            'home-discovery__nav-item--active':
              category === activeContentCategory,
          }"
          :aria-selected="category === activeContentCategory"
          @click="emit('selectContentCategory', category)"
        >
          {{ category }}
        </button>
      </nav>
    </div>

    <section class="home-discovery__content">
      <main class="home-discovery__main-feed">
        <div
          v-if="engagementActionError"
          class="home-discovery__engagement-error"
          role="alert"
          data-testid="home-engagement-error"
        >
          {{ engagementActionError }}
        </div>

        <div
          v-if="feedState === 'loading'"
          class="home-discovery__feed-state glass-panel"
          data-testid="home-feed-loading"
        >
          正在加载公开内容
        </div>

        <div
          v-else-if="feedState === 'error'"
          class="home-discovery__feed-state glass-panel"
          data-testid="home-feed-error"
        >
          <span>{{ feedError || "公开内容加载失败" }}</span>
          <button
            type="button"
            class="home-discovery__state-action"
            data-testid="home-feed-retry"
            @click="emit('retry')"
          >
            重试
          </button>
        </div>

        <div
          v-else-if="feedState === 'empty'"
          class="home-discovery__feed-state glass-panel"
          data-testid="home-feed-empty"
        >
          暂无内容
        </div>

        <template v-else>
          <article
            v-for="article in articleCards"
            :key="article.id ?? article.href ?? article.title"
            class="home-discovery__article glass-panel"
          >
            <div class="home-discovery__article-content">
              <header class="home-discovery__article-header">
                <span class="home-discovery__article-category">{{
                  article.category
                }}</span>
                <div class="home-discovery__article-meta-right">
                  <span class="home-discovery__icon-text">
                    <Clock class="icon-sm" />
                    {{ article.publishedAt }}
                  </span>
                  <span class="home-discovery__icon-text">
                    <MessageSquare class="icon-sm" />
                    {{ article.comments }}
                  </span>
                </div>
              </header>

              <h2 class="home-discovery__article-title">
                <RouterLink
                  v-if="article.href"
                  class="home-discovery__article-title-link"
                  :to="article.href"
                  data-testid="home-post-title-link"
                >
                  {{ article.title }}
                </RouterLink>
                <span v-else data-testid="home-post-title-static">
                  {{ article.title }}
                </span>
              </h2>

              <p class="home-discovery__article-excerpt">
                {{ article.summary }}
              </p>

              <div class="home-discovery__article-tags">
                <span
                  v-for="tag in article.tags"
                  :key="tag"
                  class="home-discovery__tag"
                >
                  {{ tag }}
                </span>
              </div>

              <footer class="home-discovery__article-footer">
                <div class="home-discovery__author-info-bottom">
                  <div class="home-discovery__avatar icon-sm-avatar">
                    <img
                      v-if="article.authorAvatarUrl"
                      :src="article.authorAvatarUrl"
                      :alt="article.author"
                    />
                    <span v-else class="home-discovery__avatar-fallback">
                      {{ article.authorInitial }}
                    </span>
                  </div>
                  <span class="home-discovery__author-name-small">{{
                    article.author
                  }}</span>
                </div>
                <div class="home-discovery__article-actions">
                  <button
                    v-if="article.id && !article.engagementUnavailable"
                    type="button"
                    class="home-discovery__action-btn"
                    :class="{
                      'home-discovery__action-btn--active':
                        article.liked === true,
                    }"
                    :aria-label="article.actionLabels.like"
                    :aria-pressed="article.liked === true"
                    data-testid="home-post-like"
                    @click="emit('likePost', article.id)"
                  >
                    <Heart class="icon-md" />
                  </button>
                  <button
                    v-else
                    type="button"
                    class="home-discovery__action-btn"
                    :aria-label="article.actionLabels.like"
                    data-testid="home-post-like-disabled"
                    disabled
                  >
                    <Heart class="icon-md" />
                  </button>
                  <RouterLink
                    v-if="article.href"
                    class="home-discovery__action-btn"
                    :to="`${article.href}#comments`"
                    :aria-label="article.actionLabels.comment"
                    data-testid="home-post-comments-link"
                  >
                    <MessageSquare class="icon-md" />
                  </RouterLink>
                  <button
                    v-else
                    type="button"
                    class="home-discovery__action-btn"
                    :aria-label="article.actionLabels.comment"
                    disabled
                  >
                    <MessageSquare class="icon-md" />
                  </button>
                  <button
                    v-if="article.id && !article.engagementUnavailable"
                    type="button"
                    class="home-discovery__action-btn"
                    :class="{
                      'home-discovery__action-btn--active':
                        article.favorited === true,
                    }"
                    :aria-label="article.actionLabels.bookmark"
                    :aria-pressed="article.favorited === true"
                    data-testid="home-post-favorite"
                    @click="emit('favoritePost', article.id)"
                  >
                    <Bookmark class="icon-md" />
                  </button>
                  <button
                    v-else
                    type="button"
                    class="home-discovery__action-btn"
                    :aria-label="article.actionLabels.bookmark"
                    data-testid="home-post-favorite-disabled"
                    disabled
                  >
                    <Bookmark class="icon-md" />
                  </button>
                </div>
              </footer>
            </div>

            <div class="home-discovery__article-image">
              <div
                class="home-discovery__image-placeholder"
                :class="article.imageClass"
              ></div>
            </div>
          </article>
        </template>
      </main>

      <aside v-if="showSupplementarySidebar" class="home-discovery__sidebar">
        <div class="home-discovery__widget glass-panel">
          <h3 class="home-discovery__widget-title">热门话题</h3>
          <ul class="home-discovery__topic-list">
            <li>
              <span class="home-discovery__topic-num">1.</span>
              <span class="home-discovery__topic-name">前端架构</span>
            </li>
            <li>
              <span class="home-discovery__topic-num">2.</span>
              <span class="home-discovery__topic-name">交互设计</span>
            </li>
            <li>
              <span class="home-discovery__topic-num">3.</span>
              <span class="home-discovery__topic-name">状态管理</span>
            </li>
            <li>
              <span class="home-discovery__topic-num">4.</span>
              <span class="home-discovery__topic-name">用户体验</span>
            </li>
            <li>
              <span class="home-discovery__topic-num">5.</span>
              <span class="home-discovery__topic-name">性能优化</span>
            </li>
          </ul>
        </div>

        <div class="home-discovery__widget glass-panel">
          <h3 class="home-discovery__widget-title">热门社区</h3>
          <ul class="home-discovery__community-list">
            <li class="home-discovery__community-item">
              <div class="home-discovery__community-icon zhi-icon">Z</div>
              <div class="home-discovery__community-info">
                <h4>知构</h4>
                <span>4.8万 成员</span>
              </div>
            </li>
            <li class="home-discovery__community-item">
              <div class="home-discovery__community-icon community-icon">C</div>
              <div class="home-discovery__community-info">
                <h4>设计</h4>
                <span>563 成员</span>
              </div>
            </li>
            <li class="home-discovery__community-item">
              <div class="home-discovery__community-icon scientioc-icon">S</div>
              <div class="home-discovery__community-info">
                <h4>科学</h4>
                <span>1.12万 成员</span>
              </div>
            </li>
            <li class="home-discovery__community-item">
              <div class="home-discovery__community-icon zhi-icon-dark">Z</div>
              <div class="home-discovery__community-info">
                <h4>知构</h4>
                <span>3.3万 成员</span>
              </div>
            </li>
          </ul>
        </div>
      </aside>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Heart, MessageSquare, Bookmark, Clock } from "@lucide/vue";
import { RouterLink } from "vue-router";
import type { HomeDiscoveryData } from "@/features/home-discovery";

const props = defineProps<{
  discovery?: HomeDiscoveryData;
  activeContentCategory?: string;
  searchQuery?: string;
  feedState?: "loading" | "ready" | "empty" | "error";
  feedError?: string;
  engagementActionError?: string;
  showSupplementarySidebar?: boolean;
}>();

const emit = defineEmits<{
  selectContentCategory: [category: string];
  "update:searchQuery": [query: string];
  retry: [];
  likePost: [postId: string];
  favoritePost: [postId: string];
}>();

// 卡片默认对象只承载第二张文章的展示参数；作者等发帖者信息从文章数据派生，避免同一卡片维护两套来源。
const defaultArticleCardPresentation = {
  imageClass: "dark-bg",
  actionLabels: {
    like: "Like",
    comment: "Comment",
    bookmark: "Bookmark",
  },
} as const;

const articleCards = computed(() =>
  (props.discovery?.posts ?? []).map((post) => ({
    ...defaultArticleCardPresentation,
    ...post,
    authorInitial: post.author.slice(0, 1) || "知",
  })),
);
</script>

<style scoped>
.home-discovery {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 75rem;
  margin: 0 auto;
  padding: var(--space-12) var(--space-6) var(--space-12);
}

.home-discovery__hero {
  text-align: center;
  margin-bottom: var(--space-12);
  animation: fadeUp 0.8s ease-out forwards;
}

.home-discovery__hero-title {
  margin: 0 0 var(--space-6);
  color: var(--color-text-strong);
  font-size: 3.25rem;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.02em;
  text-wrap: balance;
}

.home-discovery__hero-desc {
  max-width: 44rem;
  margin: 0 auto var(--space-10);
  color: var(--color-text-soft);
  font-size: 1.125rem;
  line-height: 1.6;
  text-wrap: pretty;
}

.home-discovery__hero-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.home-discovery__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 3rem;
  padding: 0 var(--space-6);
  border-radius: var(--radius-pill);
  font-weight: 600;
  font-size: 1rem;
  text-decoration: none;
  transition: all 0.2s ease;
}

.home-discovery__btn:focus-visible,
.home-discovery__nav-item:focus-visible,
.home-discovery__state-action:focus-visible,
.home-discovery__article-title-link:focus-visible,
.home-discovery__action-btn:focus-visible {
  outline: 0.125rem solid var(--color-primary);
  outline-offset: var(--space-1);
}

.home-discovery__btn--primary {
  background: var(--color-primary);
  color: #000;
  box-shadow: 0 4px 14px rgba(0, 229, 181, 0.3);
}

.home-discovery__btn--primary:hover {
  background: var(--color-primary-soft);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 229, 181, 0.4);
}

.home-discovery__btn--secondary {
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text-strong);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.home-discovery__btn--secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.home-discovery__feed-nav-wrapper {
  display: inline-flex;
  max-width: 100%;
  margin-bottom: var(--space-10);
  padding: var(--space-1);
  overflow-x: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  background: var(--color-panel-glass);
  scrollbar-width: none;
}

.home-discovery__feed-nav-wrapper::-webkit-scrollbar {
  display: none;
}

.home-discovery__feed-nav {
  display: flex;
  gap: var(--space-2);
}

.home-discovery__nav-item {
  flex: 0 0 auto;
  min-height: 2.75rem;
  padding: 0 var(--space-5);
  background: transparent;
  border: none;
  color: var(--color-text-soft);
  border-radius: var(--radius-pill);
  font-size: var(--font-size-ui-meta);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.home-discovery__nav-item:hover {
  color: var(--color-text-strong);
}

.home-discovery__nav-item--active {
  background: color-mix(in srgb, var(--color-text-strong) 10%, transparent);
  color: var(--color-text-strong);
}

.home-discovery__content {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 20rem;
  gap: var(--space-6);
  width: 100%;
}

.home-discovery__main-feed {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  min-width: 0;
}

.home-discovery__feed-state {
  display: flex;
  min-height: 10rem;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  padding: var(--space-6);
  color: var(--color-text-soft);
  font-size: var(--font-size-ui-body);
}

.home-discovery__engagement-error {
  border: 1px solid color-mix(in srgb, var(--color-primary) 35%, transparent);
  border-radius: 12px;
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  color: var(--color-text-strong);
  font-size: 14px;
  padding: 12px 16px;
}

.home-discovery__state-action {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text-strong);
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  padding: 8px 16px;
}

.home-discovery__state-action:hover {
  color: var(--color-primary);
}

.home-discovery__article {
  display: flex;
  gap: var(--space-6);
  padding: var(--space-6);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.home-discovery__article:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.15);
}

.home-discovery__article-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.home-discovery__article-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 13px;
  color: var(--color-text-soft);
}

.home-discovery__article-meta-right {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  align-items: center;
  justify-content: flex-end;
}

.home-discovery__icon-text {
  display: flex;
  align-items: center;
  gap: 6px;
}

.icon-sm {
  width: 14px;
  height: 14px;
}

.icon-md {
  width: 18px;
  height: 18px;
}

.home-discovery__article-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-strong);
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.home-discovery__article-title-link {
  color: inherit;
  text-decoration: none;
}

.home-discovery__article-title-link:hover {
  color: var(--color-primary);
}

.home-discovery__avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--color-bg-elevated);
}

.home-discovery__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.home-discovery__avatar-fallback {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  color: var(--color-text-soft);
  font-size: 10px;
  font-weight: 700;
}

.icon-sm-avatar {
  width: 16px;
  height: 16px;
}

.home-discovery__article-excerpt {
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-soft);
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.home-discovery__article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-6);
}

.home-discovery__tag {
  font-size: 12px;
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 100px;
  color: var(--color-text-soft);
}

.home-discovery__article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.home-discovery__author-info-bottom {
  display: flex;
  align-items: center;
  gap: 8px;
}

.home-discovery__author-name-small {
  font-size: 13px;
  color: var(--color-text);
}

.home-discovery__article-actions {
  display: flex;
  gap: var(--space-2);
}

.home-discovery__action-btn {
  width: 2.75rem;
  min-width: 2.75rem;
  height: 2.75rem;
  justify-content: center;
  background: color-mix(in srgb, var(--color-text-strong) 5%, transparent);
  border: none;
  border-radius: var(--radius-pill);
  color: var(--color-text-soft);
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: color 0.2s ease;
  text-decoration: none;
}

.home-discovery__action-btn:hover {
  color: var(--color-primary);
}

.home-discovery__action-btn--active {
  color: var(--color-primary);
}

.home-discovery__action-btn:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.home-discovery__article-image {
  flex: 0 0 15rem;
  border-radius: var(--radius-md);
  overflow: hidden;
}

.home-discovery__image-placeholder {
  width: 100%;
  height: 100%;
  min-height: 10rem;
  border-radius: var(--radius-md);
}

.dark-bg {
  background: linear-gradient(135deg, #16222a 0%, #3a6073 100%);
}

.home-discovery__sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.home-discovery__widget {
  padding: 20px;
}

.home-discovery__widget-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-strong);
  margin: 0 0 16px 0;
}

.home-discovery__topic-list,
.home-discovery__community-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.home-discovery__topic-list li {
  font-size: 14px;
  color: var(--color-text-soft);
  display: flex;
  gap: 8px;
}

.home-discovery__topic-num {
  color: var(--color-text-soft);
  opacity: 0.7;
}

.home-discovery__topic-name {
  color: var(--color-text);
  transition: color 0.2s ease;
  cursor: pointer;
}

.home-discovery__topic-name:hover {
  color: var(--color-text-strong);
}

.home-discovery__community-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.home-discovery__community-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  color: white;
}

.zhi-icon {
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--color-primary);
}
.community-icon {
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
}
.scientioc-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.zhi-icon-dark {
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--color-primary);
}

.home-discovery__community-info h4 {
  margin: 0 0 2px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.home-discovery__community-info span {
  font-size: 12px;
  color: var(--color-text-soft);
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1024px) {
  .home-discovery__content {
    grid-template-columns: 1fr;
  }

  .home-discovery__sidebar {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .home-discovery {
    align-items: stretch;
    padding: var(--space-10) var(--space-4)
      calc(var(--space-12) + 4rem + env(safe-area-inset-bottom, 0px));
  }

  .home-discovery__hero {
    margin-bottom: var(--space-8);
    text-align: left;
  }

  .home-discovery__hero-title {
    margin-bottom: var(--space-4);
    font-size: 2.375rem;
  }

  .home-discovery__hero-desc {
    margin-bottom: var(--space-6);
    font-size: 1rem;
  }

  .home-discovery__hero-desc br {
    display: none;
  }

  .home-discovery__hero-actions {
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .home-discovery__btn {
    flex: 0 0 auto;
    min-width: 7.25rem;
    padding: 0 var(--space-4);
  }

  .home-discovery__feed-nav-wrapper {
    width: 100%;
    margin-bottom: var(--space-6);
    border-radius: var(--radius-md);
  }

  .home-discovery__article-header,
  .home-discovery__article-footer {
    align-items: flex-start;
    gap: var(--space-3);
  }

  .home-discovery__article-meta-right {
    gap: var(--space-3);
  }

  .home-discovery__article {
    flex-direction: column;
    gap: var(--space-4);
    padding: var(--space-4);
  }

  .home-discovery__article-title {
    font-size: 1.125rem;
  }

  .home-discovery__article-tags {
    margin-bottom: var(--space-5);
  }

  .home-discovery__article-image {
    flex: none;
    width: 100%;
    height: 9rem;
  }

  .home-discovery__image-placeholder {
    min-height: 9rem;
  }

  .home-discovery__sidebar {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .home-discovery__article-footer,
  .home-discovery__article-header {
    flex-direction: column;
  }

  .home-discovery__btn {
    min-width: 6.75rem;
  }

  .home-discovery__article-actions {
    width: 100%;
    justify-content: space-between;
  }

  .home-discovery__action-btn {
    flex: 1 1 0;
  }
}

@media (hover: none) {
  .home-discovery__article:hover,
  .home-discovery__btn:hover {
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-discovery__hero,
  .home-discovery__article,
  .home-discovery__btn {
    animation: none;
    transition: none;
  }

  .home-discovery__article:hover,
  .home-discovery__btn:hover {
    transform: none;
  }
}
</style>
