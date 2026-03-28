import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, reactive, ref } from 'vue';
import { usePostReadingPresence } from '@/composables/usePostReadingPresence';

const { registerPostReadingSession, leavePostReadingSession } = vi.hoisted(() => ({
  registerPostReadingSession: vi.fn(),
  leavePostReadingSession: vi.fn(),
}));
const authStore = reactive({
  user: null as { id: string } | null,
  accessToken: null as string | null,
});

let hidden = false;

vi.mock('@/api/post', () => ({
  postApi: {
    registerPostReadingSession,
    leavePostReadingSession,
  },
}));

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => authStore,
}));

describe('usePostReadingPresence', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    hidden = false;
    authStore.user = null;
    authStore.accessToken = null;
    registerPostReadingSession.mockResolvedValue({
      readingCount: 2,
      avatars: [],
    });
    leavePostReadingSession.mockResolvedValue(undefined);
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true })));
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => hidden,
    });
    Object.defineProperty(window.navigator, 'sendBeacon', {
      configurable: true,
      value: vi.fn(() => true),
    });
  });

  const createHarness = () => {
    const postId = ref('1001');
    const enabled = ref(true);

    const wrapper = mount(
      defineComponent({
        name: 'UsePostReadingPresenceHarness',
        setup() {
          return {
            postId,
            enabled,
            ...usePostReadingPresence({
              postId,
              enabled,
            }),
          };
        },
        template: '<div />',
      })
    );

    return {
      wrapper,
      postId,
      enabled,
    };
  };

  it('registers immediately and refreshes presence on heartbeat', async () => {
    const { wrapper } = createHarness();

    await flushPromises();

    expect(registerPostReadingSession).toHaveBeenCalledTimes(1);
    expect(registerPostReadingSession).toHaveBeenCalledWith('1001', expect.any(String));

    await vi.advanceTimersByTimeAsync(25_000);
    await flushPromises();

    expect(registerPostReadingSession).toHaveBeenCalledTimes(2);

    wrapper.unmount();
  });

  it('leaves on hidden and starts a new session when visible again', async () => {
    const { wrapper } = createHarness();

    await flushPromises();

    const firstSessionId = registerPostReadingSession.mock.calls[0][1];

    hidden = true;
    document.dispatchEvent(new Event('visibilitychange'));
    await flushPromises();

    expect(leavePostReadingSession).toHaveBeenCalledWith('1001', firstSessionId);

    hidden = false;
    document.dispatchEvent(new Event('visibilitychange'));
    await flushPromises();

    expect(registerPostReadingSession).toHaveBeenCalledTimes(2);
    expect(registerPostReadingSession.mock.calls[1][1]).not.toBe(firstSessionId);

    wrapper.unmount();
  });

  it('rebuilds the session after login so avatars can switch to authenticated readers', async () => {
    const { wrapper } = createHarness();

    await flushPromises();

    const anonymousSessionId = registerPostReadingSession.mock.calls[0][1];

    authStore.user = { id: '2001' };
    authStore.accessToken = 'token-1';
    await flushPromises();

    expect(leavePostReadingSession).toHaveBeenCalledWith('1001', anonymousSessionId);
    expect(registerPostReadingSession).toHaveBeenCalledTimes(2);
    expect(registerPostReadingSession.mock.calls[1][1]).not.toBe(anonymousSessionId);

    wrapper.unmount();
  });
});
