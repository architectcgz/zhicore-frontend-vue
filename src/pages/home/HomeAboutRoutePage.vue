<template>
  <section class="about-page" aria-labelledby="about-title">
    <div class="about-page__stars" aria-hidden="true"></div>
    <div class="about-page__aurora" aria-hidden="true"></div>

    <div class="about-page__content">
      <header class="about-page__hero">
        <h1 id="about-title" class="about-page__title">
          Technical Content Community<br />
          for Builders and Learners
        </h1>
        <p class="about-page__subtitle">
          ZhiCore 是一个用于技术创作、知识沉淀与可靠阅读体验的内容社区。
        </p>
      </header>

      <div class="about-page__principles" aria-label="ZhiCore 核心能力">
        <article
          v-for="principle in principles"
          :key="principle.title"
          class="about-principle"
        >
          <component
            :is="principle.icon"
            class="about-principle__icon"
            aria-hidden="true"
          />
          <div class="about-principle__body">
            <h2 class="about-principle__title">
              {{ principle.order }}. {{ principle.title }}
            </h2>
            <p class="about-principle__description">
              {{ principle.description }}
            </p>
          </div>
        </article>
      </div>

      <p class="about-page__statement">
        <Sparkles class="about-page__statement-icon" aria-hidden="true" />
        <span>
          Built for thoughtful creators, technical readers, and long-term
          knowledge sharing.
        </span>
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { FileText, Layers, Sparkles, SquarePen, UsersRound } from "@lucide/vue";
import type { Component } from "vue";

interface AboutPrinciple {
  order: number;
  title: string;
  description: string;
  icon: Component;
}

const principles: AboutPrinciple[] = [
  {
    order: 1,
    title: "结构化知识",
    description: "帮助创作者沉淀清晰、可复用的技术内容。",
    icon: Layers,
  },
  {
    order: 2,
    title: "创作者友好",
    description: "提供写作、发布、整理和反馈入口。",
    icon: SquarePen,
  },
  {
    order: 3,
    title: "可靠阅读体验",
    description: "清晰排版、标签、目录与阅读进度，专注于深度阅读。",
    icon: FileText,
  },
  {
    order: 4,
    title: "共同成长社区",
    description: "围绕主题社区展开讨论、收藏和评论，彼此启发，一起成长。",
    icon: UsersRound,
  },
];
</script>

<style scoped>
.about-page {
  position: relative;
  isolation: isolate;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 4.5rem);
  overflow: hidden;
  padding: var(--space-12) var(--space-6);
  background:
    radial-gradient(
      circle at 50% 38%,
      color-mix(in srgb, var(--color-primary) 10%, transparent),
      transparent 34rem
    ),
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--color-bg) 94%, #05070b),
      #06090d 62%,
      var(--color-bg)
    );
}

.about-page__stars,
.about-page__aurora {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.about-page__stars {
  z-index: -3;
  opacity: 0.72;
  background-image:
    radial-gradient(
      circle,
      color-mix(in srgb, var(--color-text-strong) 72%, transparent) 0.0625rem,
      transparent 0.075rem
    ),
    radial-gradient(
      circle,
      color-mix(in srgb, var(--color-primary-soft) 48%, transparent) 0.0625rem,
      transparent 0.0875rem
    );
  background-position:
    0 0,
    var(--space-10) var(--space-8);
  background-size:
    8rem 7rem,
    13rem 11rem;
  mask-image: radial-gradient(circle at center, #000 0 54%, transparent 82%);
}

.about-page__aurora {
  z-index: -2;
  opacity: 0.9;
  background:
    radial-gradient(
      ellipse at 27% 56%,
      color-mix(in srgb, #7c5cff 48%, transparent),
      transparent 17rem
    ),
    radial-gradient(
      ellipse at 70% 48%,
      color-mix(in srgb, var(--color-primary) 44%, transparent),
      transparent 24rem
    );
  filter: blur(1.25rem);
  transform: translateY(var(--space-6)) scale(1.08);
  mask-image: radial-gradient(
    ellipse at 50% 60%,
    transparent 0 18%,
    #000 31%,
    transparent 70%
  );
}

.about-page::before {
  content: "";
  position: absolute;
  z-index: -1;
  inset: var(--space-6);
  border: 1px solid color-mix(in srgb, var(--color-border-strong) 72%, white);
  border-radius: var(--radius-lg);
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--color-text-strong) 7%, transparent),
    0 1.5rem 4rem rgba(0, 0, 0, 0.28);
  pointer-events: none;
}

.about-page__content {
  width: min(100%, 52rem);
  margin: 0 auto;
}

.about-page__hero {
  display: grid;
  gap: var(--space-6);
  margin-bottom: var(--space-10);
  text-align: center;
}

.about-page__title {
  margin: 0;
  color: var(--color-text-strong);
  font-family: "Outfit", "Inter", "Noto Sans SC", sans-serif;
  font-size: 2.5rem;
  font-weight: 850;
  line-height: var(--line-height-label);
  letter-spacing: 0;
  text-transform: uppercase;
  text-shadow: 0 0 1.5rem rgba(255, 255, 255, 0.16);
}

.about-page__subtitle {
  margin: 0;
  color: color-mix(in srgb, var(--color-text) 90%, var(--color-text-strong));
  font-size: 1.125rem;
  line-height: var(--line-height-desc);
}

.about-page__principles {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-5);
}

.about-principle {
  display: grid;
  grid-template-columns: 4.25rem 1fr;
  align-items: center;
  min-height: 10.25rem;
  padding: var(--space-8);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  background: linear-gradient(
    145deg,
    color-mix(in srgb, var(--color-panel) 76%, transparent),
    color-mix(in srgb, var(--color-bg-elevated) 60%, transparent)
  );
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, var(--color-text-strong) 5%, transparent),
    0 var(--space-4) var(--space-10) rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(1.125rem);
}

.about-principle__icon {
  width: 3rem;
  height: 3rem;
  color: var(--color-primary-soft);
  filter: drop-shadow(0 0 0.75rem rgba(0, 229, 181, 0.22));
  stroke-width: 1.75;
}

.about-principle__body {
  display: grid;
  gap: var(--space-3);
}

.about-principle__title {
  margin: 0;
  color: var(--color-text-strong);
  font-size: 1.25rem;
  font-weight: var(--font-weight-h3);
  line-height: 1.35;
  letter-spacing: 0;
}

.about-principle__description {
  margin: 0;
  color: color-mix(in srgb, var(--color-text) 82%, var(--color-text-soft));
  font-size: 1rem;
  line-height: var(--line-height-desc);
}

.about-page__statement {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  min-height: 5.75rem;
  margin: var(--space-8) 0 0;
  padding: var(--space-6) var(--space-8);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--color-panel) 66%, transparent);
  color: var(--color-text);
  font-size: 1rem;
  line-height: var(--line-height-desc);
  backdrop-filter: blur(1rem);
}

.about-page__statement-icon {
  flex: 0 0 auto;
  width: 1.625rem;
  height: 1.625rem;
  color: var(--color-primary-soft);
  filter: drop-shadow(0 0 0.625rem rgba(0, 229, 181, 0.26));
}

@media (max-width: 900px) {
  .about-page {
    align-items: flex-start;
    min-height: calc(100vh - 4rem);
    padding: var(--space-10) var(--space-5);
  }

  .about-page::before {
    inset: var(--space-4);
  }

  .about-page__content {
    width: min(100%, 42rem);
  }

  .about-page__title {
    font-size: 2rem;
  }

  .about-page__principles {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .about-page {
    padding: var(--space-8) var(--space-4);
  }

  .about-page::before {
    inset: var(--space-3);
    border-radius: var(--radius-md);
  }

  .about-page__hero {
    gap: var(--space-4);
    margin-bottom: var(--space-8);
    text-align: left;
  }

  .about-page__title {
    font-size: 1.75rem;
  }

  .about-page__subtitle {
    font-size: 1rem;
  }

  .about-principle {
    grid-template-columns: 1fr;
    gap: var(--space-5);
    min-height: auto;
    padding: var(--space-6);
  }

  .about-page__statement {
    align-items: flex-start;
    padding: var(--space-5);
  }
}
</style>
