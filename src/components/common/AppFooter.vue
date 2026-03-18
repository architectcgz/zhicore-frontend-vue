<!--
  应用页脚组件
  包含链接、版权信息、社交媒体链接等
  支持响应式设计
-->

<script setup lang="ts">
import { computed } from 'vue';

// 当前年份
const currentYear = computed(() => new Date().getFullYear());

// 页脚链接配置
const footerLinks = {
  product: {
    title: '产品',
    links: [
      { name: '首页', path: '/' },
      { name: '文章', path: '/posts' },
      { name: '标签', path: '/tags' },
      { name: '排行榜', path: '/ranking' },
      { name: '搜索', path: '/search' },
    ],
  },
  community: {
    title: '社区',
    links: [
      { name: '用户指南', path: '/guide' },
      { name: '写作规范', path: '/writing-guide' },
      { name: '社区规则', path: '/community-rules' },
      { name: '反馈建议', path: '/feedback' },
      { name: '开发者API', path: '/api-docs' },
    ],
  },
  support: {
    title: '支持',
    links: [
      { name: '帮助中心', path: '/help' },
      { name: '联系我们', path: '/contact' },
      { name: '问题反馈', path: '/issues' },
      { name: '功能建议', path: '/suggestions' },
      { name: '状态页面', path: '/status' },
    ],
  },
  legal: {
    title: '法律',
    links: [
      { name: '服务条款', path: '/terms' },
      { name: '隐私政策', path: '/privacy' },
      { name: 'Cookie政策', path: '/cookies' },
      { name: '版权声明', path: '/copyright' },
      { name: '免责声明', path: '/disclaimer' },
    ],
  },
};

// 社交媒体链接
const socialLinks = [
  {
    name: 'GitHub',
    icon: '🐙',
    url: 'https://github.com',
    color: '#333',
  },
  {
    name: '微博',
    icon: '📱',
    url: 'https://weibo.com',
    color: '#e6162d',
  },
  {
    name: '微信',
    icon: '💬',
    url: '#',
    color: '#07c160',
  },
  {
    name: 'QQ',
    icon: '🐧',
    url: '#',
    color: '#12b7f5',
  },
  {
    name: '邮箱',
    icon: '📧',
    url: 'mailto:contact@zhicore.com',
    color: '#ea4335',
  },
];

/**
 * 处理社交链接点击
 */
const handleSocialClick = (link: typeof socialLinks[0]) => {
  if (link.name === '微信') {
    // 显示微信二维码弹窗
    alert('微信二维码功能待实现');
  } else {
    window.open(link.url, '_blank');
  }
};
</script>

<template>
  <footer class="app-footer">
    <div class="app-footer__container">
      <!-- 主要内容区域 -->
      <div class="app-footer__main">
        <!-- 品牌信息 -->
        <div class="app-footer__brand">
          <div class="app-footer__logo">
            <h2 class="app-footer__logo-text">
              知构
            </h2>
            <p class="app-footer__tagline">
              分享知识，连接世界
            </p>
          </div>
          
          <p class="app-footer__description">
            一个专注于技术分享和知识交流的现代化内容社区平台。
            我们致力于为开发者和创作者提供优质的内容创作和阅读体验。
          </p>
          
          <!-- 社交媒体链接 -->
          <div class="app-footer__social">
            <h3 class="app-footer__social-title">
              关注我们
            </h3>
            <div class="app-footer__social-links">
              <button
                v-for="social in socialLinks"
                :key="social.name"
                class="app-footer__social-link"
                :title="social.name"
                @click="handleSocialClick(social)"
              >
                <span class="app-footer__social-icon">{{ social.icon }}</span>
                <span class="app-footer__social-name">{{ social.name }}</span>
              </button>
            </div>
          </div>
        </div>
        
        <!-- 链接区域 -->
        <div class="app-footer__links">
          <div
            v-for="(section, key) in footerLinks"
            :key="key"
            class="app-footer__link-section"
          >
            <h3 class="app-footer__link-title">
              {{ section.title }}
            </h3>
            <ul class="app-footer__link-list">
              <li
                v-for="link in section.links"
                :key="link.path"
                class="app-footer__link-item"
              >
                <router-link
                  :to="link.path"
                  class="app-footer__link"
                >
                  {{ link.name }}
                </router-link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <!-- 分隔线 -->
      <div class="app-footer__divider" />
      
      <!-- 底部信息 -->
      <div class="app-footer__bottom">
        <div class="app-footer__copyright">
          <p class="app-footer__copyright-text">
            © {{ currentYear }} 知构. 保留所有权利.
          </p>
          <p class="app-footer__icp">
            <a 
              href="https://beian.miit.gov.cn/" 
              target="_blank"
              class="app-footer__icp-link"
            >
              京ICP备12345678号-1
            </a>
          </p>
        </div>
        
        <div class="app-footer__meta">
          <div class="app-footer__tech">
            <span class="app-footer__tech-text">
              Powered by 
              <a 
                href="https://vuejs.org" 
                target="_blank"
                class="app-footer__tech-link"
              >
                Vue.js
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background-color: var(--color-bg-secondary);
  border-top: 1px solid var(--color-border);
  margin-top: auto;
}

.app-footer__container {
  max-width: 1440px;
  margin: 0 auto;
  padding: var(--space-3xl) var(--space-lg) var(--space-xl);
}

/* ========== 主要内容区域 ========== */

.app-footer__main {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: var(--space-3xl);
  margin-bottom: var(--space-2xl);
}

/* ========== 品牌信息 ========== */

.app-footer__brand {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.app-footer__logo-text {
  font-family: var(--font-heading);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin: 0 0 var(--space-sm) 0;
  background: linear-gradient(135deg, var(--color-primary), var(--color-cta));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.app-footer__tagline {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: 0;
  font-weight: var(--font-weight-medium);
}

.app-footer__description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
  margin: 0;
}

/* ========== 社交媒体 ========== */

.app-footer__social-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin: 0 0 var(--space-md) 0;
}

.app-footer__social-links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.app-footer__social-link {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-base);
  text-decoration: none;
}

.app-footer__social-link:hover {
  background-color: var(--color-hover);
  border-color: var(--color-cta);
  color: var(--color-text);
  transform: translateY(-2px);
}

.app-footer__social-icon {
  font-size: var(--font-size-base);
}

.app-footer__social-name {
  font-weight: var(--font-weight-medium);
}

/* ========== 链接区域 ========== */

.app-footer__links {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-xl);
}

.app-footer__link-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.app-footer__link-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin: 0;
}

.app-footer__link-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.app-footer__link-item {
  margin: 0;
}

.app-footer__link {
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: var(--font-size-sm);
  transition: color var(--transition-base);
  display: block;
  padding: var(--space-xs) 0;
}

.app-footer__link:hover {
  color: var(--color-cta);
}

/* ========== 分隔线 ========== */

.app-footer__divider {
  height: 1px;
  background-color: var(--color-border);
  margin: var(--space-xl) 0;
}

/* ========== 底部信息 ========== */

.app-footer__bottom {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: var(--space-lg);
}

.app-footer__copyright {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.app-footer__copyright-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

.app-footer__icp {
  margin: 0;
}

.app-footer__icp-link {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  text-decoration: none;
  transition: color var(--transition-base);
}

.app-footer__icp-link:hover {
  color: var(--color-text-secondary);
}

.app-footer__meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-md);
}

.app-footer__tech-text {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.app-footer__tech-link {
  color: var(--color-cta);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  transition: color var(--transition-base);
}

.app-footer__tech-link:hover {
  color: var(--color-primary);
}

/* ========== 响应式设计 ========== */

/* 平板设备 (768px - 1023px) */
@media (max-width: 1023px) {
  .app-footer__container {
    padding: var(--space-2xl) var(--space-md) var(--space-lg);
  }
  
  .app-footer__main {
    grid-template-columns: 1fr;
    gap: var(--space-2xl);
  }
  
  .app-footer__links {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-lg);
  }
  
  .app-footer__bottom {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: var(--space-md);
  }
  
  .app-footer__meta {
    align-items: center;
  }
}

/* 移动设备 (< 768px) */
@media (max-width: 767px) {
  .app-footer__container {
    padding: var(--space-xl) var(--space-sm) var(--space-md);
  }
  
  .app-footer__main {
    gap: var(--space-xl);
  }
  
  .app-footer__brand {
    gap: var(--space-lg);
    text-align: center;
  }
  
  .app-footer__logo-text {
    font-size: var(--font-size-xl);
  }
  
  .app-footer__social-links {
    justify-content: center;
  }
  
  .app-footer__social-link {
    padding: var(--space-xs) var(--space-sm);
  }
  
  .app-footer__social-name {
    display: none;
  }
  
  .app-footer__links {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
    text-align: center;
  }
  
  .app-footer__link-list {
    align-items: center;
  }
  
  .app-footer__bottom {
    gap: var(--space-sm);
  }
}

/* 小屏移动设备 (< 480px) */
@media (max-width: 479px) {
  .app-footer__container {
    padding: var(--space-lg) var(--space-sm) var(--space-sm);
  }
  
  .app-footer__social-links {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-xs);
  }
  
  .app-footer__social-link {
    flex-direction: column;
    padding: var(--space-sm);
    gap: var(--space-xs);
  }
  
  .app-footer__social-icon {
    font-size: var(--font-size-lg);
  }
  
  .app-footer__links {
    gap: var(--space-md);
  }
  
  .app-footer__link-section {
    gap: var(--space-sm);
  }
}

/* 暗色主题特殊处理 */
[data-theme='dark'] .app-footer__social-link {
  background-color: var(--color-bg-tertiary);
  border-color: var(--color-border-dark);
}

[data-theme='dark'] .app-footer__social-link:hover {
  background-color: var(--color-hover);
  border-color: var(--color-cta);
}
</style>
