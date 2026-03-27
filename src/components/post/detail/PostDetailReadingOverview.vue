<script setup lang="ts">
import type { CSSProperties } from 'vue';

interface Props {
  readingBatteryStyle: CSSProperties;
  readingProgressPercent: number;
  readingTime: number;
  sectionCount: number;
}

const props = defineProps<Props>();
</script>

<template>
  <section class="post-rail-section post-rail-section--reading">
    <p class="post-rail-section__kicker">阅读线索</p>
    <div class="post-reading-overview">
      <div
        class="post-reading-overview__hero"
        :style="props.readingBatteryStyle"
        role="progressbar"
        aria-label="阅读进度"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-valuenow="props.readingProgressPercent"
      >
        <span class="post-reading-overview__charge" aria-hidden="true" />
        <span class="post-reading-overview__progress"> {{ props.readingProgressPercent }}% </span>
        <span class="post-reading-overview__caption">阅读进度</span>
      </div>

      <div class="post-reading-facts">
        <div class="post-reading-facts__item">
          <span class="post-reading-facts__label">时长</span>
          <strong class="post-reading-facts__value">{{ props.readingTime }} 分钟</strong>
        </div>
        <div class="post-reading-facts__item">
          <span class="post-reading-facts__label">章节</span>
          <strong class="post-reading-facts__value">{{ props.sectionCount || '无' }}</strong>
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

.post-rail-section__kicker {
  margin: 0 0 12px;
  color: var(--color-text-tertiary);
  font-size: 0.76rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
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
  min-height: 76px;
  padding: 16px 22px 16px 18px;
  border: 1px solid var(--reading-shell-border);
  border-radius: calc(var(--radius-lg) + 2px);
  overflow: hidden;
  background:
    linear-gradient(180deg, var(--reading-shell-bg-top), var(--reading-shell-bg-bottom)),
    repeating-linear-gradient(90deg, transparent 0 18px, var(--reading-grid-line) 18px 20px);
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
</style>
