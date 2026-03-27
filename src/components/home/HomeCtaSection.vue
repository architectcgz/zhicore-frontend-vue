<template>
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
</template>

<style scoped>
.home-page__cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-lg);
  padding: var(--space-lg);
  border-radius: 0;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  background: transparent;
}

.home-page__block-kicker {
  display: inline-flex;
  align-items: center;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-size: 0.74rem;
  color: var(--color-text-tertiary);
}

.home-page__cta-copy {
  max-width: 48rem;
}

.home-page__cta-title {
  margin: 8px 0 12px;
  color: var(--color-text);
  font-size: clamp(1.7rem, 3vw, 2.4rem);
  line-height: 1.2;
}

.home-page__cta-description {
  color: var(--color-text-secondary);
  line-height: 1.75;
}

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

@media (max-width: 1023px) {
  .home-page__cta {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 767px) {
  .home-page__cta {
    padding: var(--space-lg);
    border-radius: 0;
  }

  .home-page__cta-actions {
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
