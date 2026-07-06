<script setup lang="ts">
import {
  Book,
  Bookmark,
  FileText,
  Folder,
  Image as ImageIcon,
  Sparkles,
} from "@lucide/vue";
import type { Component } from "vue";

interface ResourceCategory {
  title: string;
  description: string;
  icon: Component;
  status: string;
}

const resourceCategories: ResourceCategory[] = [
  {
    title: "文件",
    description: "上传与管理各类文档，集中存储，便于查找。",
    icon: FileText,
    status: "即将推出",
  },
  {
    title: "资料",
    description: "沉淀学习资料与参考内容，构建你的知识库。",
    icon: Book,
    status: "即将推出",
  },
  {
    title: "素材",
    description: "管理图片、图表、代码片段等创作所需素材。",
    icon: ImageIcon,
    status: "即将推出",
  },
  {
    title: "收藏",
    description: "收藏优质资源与内容，随时回顾与复用。",
    icon: Bookmark,
    status: "即将推出",
  },
];
</script>

<template>
  <section class="resources-route" aria-labelledby="resources-route-title">
    <div class="resources-route__ambient" aria-hidden="true">
      <span class="resources-route__aurora resources-route__aurora--left" />
      <span class="resources-route__aurora resources-route__aurora--right" />
      <span class="resources-route__halo" />
    </div>

    <div class="resources-route__layout">
      <div class="resources-route__hero-card">
        <div class="resources-route__hero-icon-wrapper">
          <Folder class="resources-route__hero-icon" />
          <Sparkles class="resources-route__hero-spark" aria-hidden="true" />
        </div>
        <h1 id="resources-route-title" class="resources-route__hero-title">
          资源中心暂未接入
        </h1>
        <p class="resources-route__hero-desc">
          文件、资料与内容资产服务仍在准备中，未来将支持创作者沉淀、整理和分享知识资源。
        </p>
      </div>

      <div class="resources-route__features">
        <article
          v-for="category in resourceCategories"
          :key="category.title"
          class="resources-route__feature-card"
        >
          <div class="resources-route__feature-icon-wrapper">
            <component
              :is="category.icon"
              class="resources-route__feature-icon"
            />
          </div>
          <h2 class="resources-route__feature-title">{{ category.title }}</h2>
          <p class="resources-route__feature-desc">
            {{ category.description }}
          </p>
          <div class="resources-route__feature-badge">
            {{ category.status }}
          </div>
        </article>
      </div>

      <div class="resources-route__footer">
        <Sparkles class="resources-route__footer-icon" />
        <span class="resources-route__footer-text"
          >敬请期待，未来将作为内容沉淀的入口。</span
        >
        <Sparkles class="resources-route__footer-icon" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.resources-route {
  min-height: calc(100vh - 74px);
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  isolation: isolate;
  overflow: hidden;
  padding: var(--space-12) var(--space-8);
  background:
    radial-gradient(
      circle at 50% 42%,
      color-mix(in srgb, var(--color-primary) 12%, transparent),
      transparent 28rem
    ),
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--color-bg-elevated) 18%, transparent),
      transparent 36%
    );
}

.resources-route::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -3;
  background-image:
    radial-gradient(
      circle at 13% 18%,
      color-mix(in srgb, var(--color-primary-soft) 55%, transparent) 0 1px,
      transparent 1px
    ),
    radial-gradient(
      circle at 78% 16%,
      color-mix(in srgb, var(--color-primary-soft-2) 40%, transparent) 0 1px,
      transparent 1px
    ),
    radial-gradient(
      circle at 61% 72%,
      color-mix(in srgb, var(--color-text-soft) 35%, transparent) 0 1px,
      transparent 1px
    );
  background-size:
    11rem 9rem,
    14rem 12rem,
    17rem 15rem;
  opacity: 0.34;
  pointer-events: none;
}

.resources-route__ambient {
  position: absolute;
  inset: 0;
  z-index: -2;
  pointer-events: none;
}

.resources-route__aurora,
.resources-route__halo {
  position: absolute;
  display: block;
  pointer-events: none;
}

.resources-route__aurora {
  bottom: 5%;
  width: min(22rem, 34vw);
  height: min(32rem, 58vh);
  border-radius: var(--radius-pill);
  background:
    radial-gradient(
      ellipse at 50% 55%,
      color-mix(in srgb, var(--color-primary-soft) 34%, transparent),
      transparent 64%
    ),
    linear-gradient(
      180deg,
      transparent,
      color-mix(in srgb, var(--color-primary) 18%, transparent) 38%,
      transparent 76%
    );
  filter: blur(28px);
  opacity: 0.64;
  transform-origin: bottom center;
}

.resources-route__aurora--left {
  left: 17%;
  transform: rotate(-12deg) skewX(-9deg);
}

.resources-route__aurora--right {
  right: 17%;
  transform: rotate(12deg) skewX(9deg);
}

.resources-route__halo {
  top: 22%;
  left: 50%;
  width: min(36rem, 72vw);
  aspect-ratio: 1;
  border-radius: var(--radius-pill);
  border: 1px solid
    color-mix(in srgb, var(--color-primary-soft) 14%, transparent);
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--color-primary) 12%, transparent),
    transparent 58%
  );
  filter: blur(2px);
  opacity: 0.38;
  transform: translateX(-50%);
}

.resources-route__layout {
  width: 100%;
  max-width: 66rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-8);
  position: relative;
  z-index: 1;
}

.resources-route__hero-card {
  width: min(100%, 39rem);
  min-height: 19.5rem;
  padding: var(--space-10) var(--space-8);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  overflow: hidden;
  border: 1px solid
    color-mix(in srgb, var(--color-primary-soft) 36%, var(--color-border));
  border-radius: var(--radius-lg);
  background:
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--color-text-strong) 8%, transparent),
      transparent 46%
    ),
    color-mix(in srgb, var(--color-bg-elevated) 62%, transparent);
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--color-primary) 8%, transparent),
    var(--shadow-panel);
  backdrop-filter: blur(24px);
}

.resources-route__hero-card::before {
  content: "";
  position: absolute;
  top: 38%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 18rem;
  height: 18rem;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--color-primary-soft) 22%, transparent) 0%,
    transparent 60%
  );
  filter: blur(18px);
  pointer-events: none;
}

.resources-route__hero-card::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--color-primary-soft) 14%, transparent),
    transparent 34%,
    color-mix(in srgb, var(--color-text-strong) 6%, transparent)
  );
  opacity: 0.42;
  pointer-events: none;
}

.resources-route__hero-icon-wrapper {
  width: 5.25rem;
  height: 5.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  margin-bottom: var(--space-5);
  position: relative;
  z-index: 1;
}

.resources-route__hero-icon {
  width: 4.75rem;
  height: 4.75rem;
  stroke-width: 1.5;
}

.resources-route__hero-spark {
  position: absolute;
  right: 1.35rem;
  bottom: 1.45rem;
  width: 1.15rem;
  height: 1.15rem;
  color: var(--color-primary-soft-2);
  fill: color-mix(in srgb, var(--color-primary-soft-2) 32%, transparent);
  stroke-width: 1.8;
}

.resources-route__hero-title {
  margin: 0 0 var(--space-3);
  color: var(--color-text-strong);
  font-size: var(--font-size-32, 2rem);
  font-weight: var(--font-weight-h1);
  line-height: var(--line-height-label);
  letter-spacing: 0;
  position: relative;
  z-index: 1;
}

.resources-route__hero-desc {
  max-width: 33rem;
  margin: 0;
  color: var(--color-text-soft);
  font-size: var(--font-size-16, 1rem);
  line-height: var(--line-height-desc);
  position: relative;
  z-index: 1;
}

.resources-route__features {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-5);
  width: 100%;
}

@media (max-width: 1024px) {
  .resources-route__features {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .resources-route__features {
    grid-template-columns: 1fr;
  }
}

.resources-route__feature-card {
  min-height: 16.5rem;
  padding: var(--space-8) var(--space-5);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background:
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--color-text-strong) 7%, transparent),
      transparent 40%
    ),
    color-mix(in srgb, var(--color-bg-elevated) 54%, transparent);
  border: 1px solid
    color-mix(in srgb, var(--color-text-strong) 16%, var(--color-border));
  border-radius: var(--radius-lg);
  box-shadow: 0 1px 0
    color-mix(in srgb, var(--color-text-strong) 6%, transparent) inset;
  backdrop-filter: blur(18px);
  opacity: 0.86;
}

.resources-route__feature-icon-wrapper {
  min-height: 3.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: color-mix(in srgb, var(--color-text-soft) 72%, var(--color-text));
  margin-bottom: var(--space-4);
}

.resources-route__feature-icon {
  width: 3rem;
  height: 3rem;
  stroke-width: 1.5;
}

.resources-route__feature-title {
  margin: 0 0 var(--space-2);
  color: color-mix(
    in srgb,
    var(--color-text-strong) 84%,
    var(--color-text-soft)
  );
  font-size: var(--font-size-20, 1.25rem);
  font-weight: var(--font-weight-h3);
  line-height: var(--line-height-label);
}

.resources-route__feature-desc {
  max-width: 11rem;
  margin: 0 0 var(--space-5);
  color: var(--color-text-soft);
  font-size: var(--font-size-14, 0.875rem);
  line-height: var(--line-height-desc);
  flex-grow: 1;
}

.resources-route__feature-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 1.75rem;
  padding: var(--space-1) var(--space-3);
  background: color-mix(in srgb, var(--color-panel-glass) 78%, transparent);
  color: color-mix(in srgb, var(--color-text-soft) 78%, var(--color-text));
  font-size: var(--font-size-12, 0.75rem);
  line-height: var(--line-height-label);
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-border);
}

.resources-route__footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  width: min(100%, 34rem);
  margin-top: var(--space-3);
  color: var(--color-primary-strong);
  opacity: 0.8;
}

.resources-route__footer::before,
.resources-route__footer::after {
  content: "";
  flex: 1;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    color-mix(in srgb, var(--color-border-strong) 72%, transparent)
  );
}

.resources-route__footer::after {
  transform: rotate(180deg);
}

.resources-route__footer-icon {
  width: 1.125rem;
  height: 1.125rem;
  stroke-width: 1.5;
}

.resources-route__footer-text {
  font-size: var(--font-size-14, 0.875rem);
  letter-spacing: 0.04em;
  text-align: center;
}

@media (max-width: 768px) {
  .resources-route {
    min-height: calc(100vh - 128px);
    align-items: flex-start;
    padding: var(--space-8) var(--space-4);
  }

  .resources-route__layout {
    gap: var(--space-6);
  }

  .resources-route__hero-card {
    min-height: auto;
    padding: var(--space-8) var(--space-5);
  }

  .resources-route__hero-title {
    font-size: var(--font-size-28, 1.75rem);
  }

  .resources-route__feature-card {
    min-height: 14rem;
  }

  .resources-route__aurora {
    width: 13rem;
    height: 24rem;
    opacity: 0.42;
  }

  .resources-route__aurora--left {
    left: -7%;
  }

  .resources-route__aurora--right {
    right: -7%;
  }
}

@media (max-width: 640px) {
  .resources-route__features {
    gap: var(--space-4);
  }

  .resources-route__feature-card {
    min-height: auto;
    padding: var(--space-6) var(--space-5);
  }

  .resources-route__footer {
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .resources-route__footer::before,
  .resources-route__footer::after {
    flex-basis: 4rem;
  }
}
</style>
