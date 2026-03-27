<script setup lang="ts">
import type { CreatorHighlight, TopicHighlight } from '@/types/home';
import { formatCompactNumber, formatGrowth } from '@/utils/home-formatters';

interface Props {
  isLoading: boolean;
  topicHighlights: TopicHighlight[];
  creatorHighlights: CreatorHighlight[];
}

const props = defineProps<Props>();
</script>

<template>
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
      v-if="props.isLoading"
      class="home-page__discovery-skeleton"
    >
      <div
        v-for="index in 5"
        :key="index"
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
            v-for="topic in props.topicHighlights"
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
            v-for="creator in props.creatorHighlights"
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
</template>

<style scoped>
.home-page__discovery {
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

.home-page__section-kicker,
.home-page__block-kicker {
  display: inline-flex;
  align-items: center;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-size: 0.74rem;
  color: var(--color-text-tertiary);
}

.home-page__section-kicker {
  margin-bottom: 10px;
}

.home-page__section-title {
  color: var(--color-text);
  font-size: clamp(1.8rem, 3vw, 2.3rem);
}

.home-page__section-description,
.home-page__topic-description,
.home-page__creator-bio {
  color: var(--color-text-secondary);
  line-height: 1.75;
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
.home-page__creators {
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
  color: var(--color-text);
  font-size: 1.45rem;
}

.home-page__block-link {
  color: var(--color-cta);
  font-weight: var(--font-weight-semibold);
}

.home-page__topic-grid,
.home-page__creator-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
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

@keyframes home-skeleton {
  0% {
    background-position: 100% 0;
  }

  100% {
    background-position: -100% 0;
  }
}

@media (max-width: 1199px) {
  .home-page__discovery-skeleton,
  .home-page__discovery-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 1023px) {
  .home-page__section-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .home-page__section-description {
    text-align: left;
  }

  .home-page__topic-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 767px) {
  .home-page__topics,
  .home-page__creators {
    padding: var(--space-lg);
    border-radius: 0;
  }

  .home-page__creator-card {
    align-items: flex-start;
  }
}
</style>
