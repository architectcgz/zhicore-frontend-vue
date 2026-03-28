<script setup lang="ts">
interface Props {
  readingProgressPercent: number;
  readingTime: number;
  sectionCount: number;
}

const props = defineProps<Props>();

const RADIUS = 30;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
</script>

<template>
  <section
    class="post-rail-section post-rail-section--reading"
    role="progressbar"
    aria-label="阅读进度"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-valuenow="props.readingProgressPercent"
  >
    <p class="post-rail-section__kicker">
      阅读线索
    </p>

    <div class="post-reading-overview">
      <!-- 圆弧进度环 -->
      <div class="post-reading-ring-wrap">
        <svg
          class="post-reading-ring"
          viewBox="0 0 80 80"
          aria-hidden="true"
        >
          <circle
            class="post-reading-ring__track"
            cx="40"
            cy="40"
            :r="RADIUS"
            fill="none"
            stroke-width="5"
          />
          <circle
            class="post-reading-ring__fill"
            cx="40"
            cy="40"
            :r="RADIUS"
            fill="none"
            stroke-width="5"
            stroke-linecap="round"
            :stroke-dasharray="CIRCUMFERENCE"
            :stroke-dashoffset="CIRCUMFERENCE * (1 - props.readingProgressPercent / 100)"
          />
        </svg>
        <div class="post-reading-ring__center">
          <span class="post-reading-ring__value">{{ props.readingProgressPercent }}</span>
          <span class="post-reading-ring__unit">%</span>
        </div>
      </div>

      <!-- 元数据 -->
      <div class="post-reading-facts">
        <div class="post-reading-facts__item">
          <span class="post-reading-facts__label">时长</span>
          <strong class="post-reading-facts__value">{{ props.readingTime }} 分</strong>
        </div>
        <div class="post-reading-facts__item">
          <span class="post-reading-facts__label">章节</span>
          <strong class="post-reading-facts__value">{{ props.sectionCount || '—' }}</strong>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.post-rail-section {
  padding: 16px 18px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--color-surface-overlay) 88%, rgba(255, 255, 255, 0.24) 12%),
    color-mix(in srgb, var(--color-surface-overlay) 96%, transparent)
  );
  box-shadow: var(--shadow-sm);
}

.post-rail-section--reading {
  padding: 18px;
}

.post-rail-section__kicker {
  margin: 0 0 14px;
  color: var(--color-text-tertiary);
  font-size: 0.76rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.post-reading-overview {
  display: grid;
  gap: 14px;
}

/* ── 圆弧进度环 ── */
.post-reading-ring-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  margin: 0 auto;
}

.post-reading-ring {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.post-reading-ring__track {
  stroke: color-mix(in srgb, var(--color-border) 80%, transparent);
}

.post-reading-ring__fill {
  stroke: url(#reading-ring-gradient);
  stroke: var(--color-accent, #34d399);
  transition: stroke-dashoffset 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.post-reading-ring__center {
  position: relative;
  display: flex;
  align-items: baseline;
  gap: 1px;
  line-height: 1;
}

.post-reading-ring__value {
  font-size: 1.4rem;
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
}

.post-reading-ring__unit {
  font-size: 0.7rem;
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

/* ── 元数据行 ── */
.post-reading-facts {
  display: grid;
  gap: 8px;
}

.post-reading-facts__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--color-surface-overlay) 60%, transparent);
}

.post-reading-facts__label {
  color: var(--color-text-secondary);
  font-size: 0.82rem;
}

.post-reading-facts__value {
  color: var(--color-text);
  font-size: 0.88rem;
  font-weight: var(--font-weight-semibold);
}
</style>
