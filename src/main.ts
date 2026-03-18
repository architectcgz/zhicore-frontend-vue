import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { VueQueryPlugin } from '@tanstack/vue-query';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import './assets/styles/main.css';
import './assets/styles/accessibility.css';
import App from './App.vue';
import router from './router';
import { useThemeStore } from './stores/theme';
import { registerLazyImageDirective } from './directives/lazyImage';
import { vFocusIndicator, vFocusVisible } from './directives/focusIndicator';
import { setupErrorHandler } from './utils/errorHandler';
import { createQueryClient, setupQueryErrorHandler } from './plugins/vue-query';
import { migrateStorage } from './utils/storageMigration';
import { IconsPlugin } from './plugins/icons';

// 执行存储迁移（从 blog- 前缀迁移到 zhicore- 前缀）
migrateStorage();

const app = createApp(App);
const pinia = createPinia();
const queryClient = createQueryClient();

// 配置 TanStack Query 全局错误处理
setupQueryErrorHandler(queryClient);

app.use(pinia);

// 在挂载前初始化主题，避免认证页首屏出现主题错位
const themeStore = useThemeStore();
themeStore.initTheme();

app.use(router);
app.use(ElementPlus);
app.use(VueQueryPlugin, { queryClient });
app.use(IconsPlugin);

// 注册懒加载指令
registerLazyImageDirective(app);

// 注册焦点指示器指令
app.directive('focus-indicator', vFocusIndicator);
app.directive('focus-visible', vFocusVisible);

// 配置全局错误处理
setupErrorHandler(app, {
  enableReporting: import.meta.env.PROD, // 仅在生产环境启用错误上报
  reportUrl: import.meta.env.VITE_ERROR_REPORT_URL, // 从环境变量读取上报地址
  showInConsole: true,
  showUserMessage: true,
});

app.mount('#app');

// 在开发环境中启用 TanStack Query DevTools
if (import.meta.env.DEV) {
  import('@tanstack/vue-query-devtools').then(({ VueQueryDevtools }) => {
    app.component('VueQueryDevtools', VueQueryDevtools);
  });
}
