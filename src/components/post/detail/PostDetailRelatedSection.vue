<script setup lang="ts">
import { formatNumber } from '@/utils/post-detail-formatters';
import type { RelatedPostCard } from '@/types/post/detail';

interface Props {
  kicker: string;
  title: string;
  isLoading: boolean;
  cards: RelatedPostCard[];
}

const props = defineProps<Props>();
</script>

<template>
  <section class="post-related-section">
    <div class="post-related-section__inner">
      <div class="post-related-section__header">
        <div>
          <p class="post-related-section__kicker">
            {{ props.kicker }}
          </p>
          <h2 class="post-related-section__title">
            {{ props.title }}
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
        v-if="props.isLoading"
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
        v-else-if="props.cards.length > 0"
        class="post-related-grid"
      >
        <router-link
          v-for="card in props.cards"
          :key="card.id"
          :to="`/posts/${card.id}`"
          class="post-related-card"
        >
          <div class="post-related-card__meta">
            <span class="post-related-card__eyebrow">
              {{ card.eyebrow }}
            </span>
            <span class="post-related-card__time">{{ card.readingMinutes }} 分钟</span>
          </div>

          <h3 class="post-related-card__title">
            {{ card.title }}
          </h3>

          <p class="post-related-card__excerpt">
            {{ card.excerpt }}
          </p>

          <div class="post-related-card__footer">
            <span class="post-related-card__author">
              {{ card.authorName }}
            </span>
            <span class="post-related-card__stats">
              {{ formatNumber(card.commentCount) }} 评论
            </span>
          </div>
        </router-link>
      </div>
    </div>
  </section>
</template>

<style scoped>
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
  width: 78%;
  height: 20px;
}

.post-related-card__placeholder-line--short {
  width: 62%;
}

.post-related-section__more:focus-visible,
.post-related-card:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus);
}

@media (max-width: 1180px) {
  .post-related-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .post-related-section {
    padding-left: var(--space-md);
    padding-right: var(--space-md);
  }

  .post-related-section__inner {
    width: 100%;
  }

  .post-related-section__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .post-related-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
