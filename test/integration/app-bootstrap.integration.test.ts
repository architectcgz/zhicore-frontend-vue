import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('应用启动集成测试', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('应该在安装 router 前恢复认证状态', async () => {
    const order: string[] = [];

    const piniaPlugin = { name: 'pinia-plugin' };
    const routerPlugin = { name: 'router-plugin' };
    const queryPlugin = { name: 'query-plugin' };
    const elementPlusPlugin = { name: 'element-plus-plugin' };
    const iconsPlugin = { name: 'icons-plugin' };

    const initTheme = vi.fn(() => {
      order.push('theme-init');
    });
    const initAuth = vi.fn(async () => {
      order.push('auth-init');
    });
    const migrateStorage = vi.fn(() => {
      order.push('migrate-storage');
    });

    const app: any = {};
    app.use = vi.fn((plugin: unknown) => {
      if (plugin === piniaPlugin) order.push('use-pinia');
      if (plugin === routerPlugin) order.push('use-router');
      if (plugin === queryPlugin) order.push('use-query');
      if (plugin === elementPlusPlugin) order.push('use-element-plus');
      if (plugin === iconsPlugin) order.push('use-icons');
      return app;
    });
    app.directive = vi.fn(() => app);
    app.mount = vi.fn(() => {
      order.push('mount-app');
    });
    app.component = vi.fn(() => app);

    vi.doMock('vue', () => ({
      createApp: vi.fn(() => app),
    }));
    vi.doMock('pinia', () => ({
      createPinia: vi.fn(() => piniaPlugin),
    }));
    vi.doMock('@tanstack/vue-query', () => ({
      VueQueryPlugin: queryPlugin,
    }));
    vi.doMock('element-plus', () => ({
      default: elementPlusPlugin,
    }));
    vi.doMock('../../src/App.vue', () => ({
      default: {},
    }));
    vi.doMock('../../src/router', () => ({
      default: routerPlugin,
    }));
    vi.doMock('../../src/stores/theme', () => ({
      useThemeStore: vi.fn(() => ({
        initTheme,
      })),
    }));
    vi.doMock('../../src/stores/auth', () => ({
      useAuthStore: vi.fn(() => ({
        initAuth,
      })),
    }));
    vi.doMock('../../src/directives/lazyImage', () => ({
      registerLazyImageDirective: vi.fn(),
    }));
    vi.doMock('../../src/directives/focusIndicator', () => ({
      vFocusIndicator: {},
      vFocusVisible: {},
    }));
    vi.doMock('../../src/utils/errorHandler', () => ({
      setupErrorHandler: vi.fn(),
    }));
    vi.doMock('../../src/plugins/vue-query', () => ({
      createQueryClient: vi.fn(() => ({})),
      setupQueryErrorHandler: vi.fn(),
    }));
    vi.doMock('../../src/utils/storageMigration', () => ({
      migrateStorage,
    }));
    vi.doMock('../../src/plugins/icons', () => ({
      IconsPlugin: iconsPlugin,
    }));
    vi.doMock('@tanstack/vue-query-devtools', () => ({
      VueQueryDevtools: {},
    }));

    await import('../../src/main');

    expect(migrateStorage).toHaveBeenCalledOnce();
    expect(initTheme).toHaveBeenCalledOnce();
    expect(initAuth).toHaveBeenCalledOnce();
    expect(order.indexOf('auth-init')).toBeGreaterThan(order.indexOf('theme-init'));
    expect(order.indexOf('use-router')).toBeGreaterThan(order.indexOf('auth-init'));
    expect(app.mount).toHaveBeenCalledWith('#app');
  });
});
