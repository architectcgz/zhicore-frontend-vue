<script setup lang="ts">
import type { Post, Tag } from '@/types';
import type { HomeSummaryStat } from '@/types/home';

interface Props {
  insightLine: string;
  heroTags: Tag[];
  summaryStats: HomeSummaryStat[];
  featuredPost: Post | null;
  featuredCandidates: Post[];
  featuredIndex: number;
  curationNotes: string[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'switch-featured': [index: number];
  'featured-wheel': [event: WheelEvent];
}>();

const getFeatureExcerpt = (post: Post): string => {
  return post.excerpt || post.content.slice(0, 110);
};
</script>

<template>
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
        <span class="home-page__signal">{{ props.insightLine }}</span>
        <span
          v-for="tag in props.heroTags"
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
          v-for="stat in props.summaryStats"
          :key="stat.label"
          class="home-page__stat-card"
        >
          <span class="home-page__stat-label">{{ stat.label }}</span>
          <strong class="home-page__stat-value">{{ stat.value }}</strong>
          <span class="home-page__stat-detail">{{ stat.detail }}</span>
        </article>
      </div>

      <article
        v-if="props.featuredPost"
        class="home-page__feature"
        @wheel.prevent="emit('featured-wheel', $event)"
      >
        <span class="home-page__feature-label">编辑精选</span>
        <h2 class="home-page__feature-title">
          {{ props.featuredPost.title }}
        </h2>
        <p class="home-page__feature-text">
          {{ getFeatureExcerpt(props.featuredPost) }}
        </p>
        <router-link
          :to="`/posts/${props.featuredPost.id}`"
          class="home-page__feature-link"
        >
          查看全文
        </router-link>
        <div
          v-if="props.featuredCandidates.length > 1"
          class="home-page__feature-switch"
        >
          <button
            v-for="(item, index) in props.featuredCandidates"
            :key="item.id"
            class="home-page__feature-dot"
            :class="{ 'home-page__feature-dot--active': index === props.featuredIndex }"
            type="button"
            :aria-label="`切换到第 ${index + 1} 条精彩内容`"
            @click="emit('switch-featured', index)"
          />
        </div>
      </article>

      <div class="home-page__note-strip">
        <span
          v-for="note in props.curationNotes"
          :key="note"
          class="home-page__note-pill"
        >
          {{ note }}
        </span>
      </div>
    </div>
  </section>
</template>

<style scoped>
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

.home-page__eyebrow {
  display: inline-flex;
  align-items: center;
  margin-bottom: 14px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-size: 0.74rem;
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
.home-page__stats {
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

[data-theme='dark'] .page-title {
  color: #ffffff;
  text-shadow: 0 12px 36px rgba(0, 0, 0, 0.42);
}

@media (max-width: 1199px) {
  .home-page__hero {
    grid-template-columns: minmax(0, 1fr);
  }

  .home-page__stats {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 767px) {
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

  .home-page__actions {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
  }

  .home-page__primary-action,
  .home-page__secondary-action {
    width: 100%;
  }
}
</style>
