import { computed, onBeforeUnmount, onMounted, ref, toValue, watch, type MaybeRefOrGetter } from 'vue';
import { postApi } from '@/api/post';
import { useAuthStore } from '@/stores/auth';
import { API_BASE_URL } from '@/utils/constants';
import type { PostReadingPresence } from '@/types';

interface UsePostReadingPresenceOptions {
  postId: MaybeRefOrGetter<string | null | undefined>;
  enabled?: MaybeRefOrGetter<boolean | null | undefined>;
}

const HEARTBEAT_INTERVAL_MS = 25_000;

function createEmptyPresence(): PostReadingPresence {
  return {
    readingCount: 0,
    avatars: [],
  };
}

function createSessionId(): string {
  return `presence_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function getErrorStatus(error: unknown): number | null {
  const candidate = error as {
    response?: {
      status?: number;
    };
  };

  return candidate.response?.status ?? null;
}

function buildLeaveUrl(postId: string): string {
  const baseUrl = (API_BASE_URL || '/api/v1').replace(/\/$/, '');
  return `${baseUrl}/posts/${encodeURIComponent(postId)}/readers/session/leave`;
}

export function usePostReadingPresence(options: UsePostReadingPresenceOptions) {
  const authStore = useAuthStore();
  const presence = ref<PostReadingPresence>(createEmptyPresence());
  const resolvedPostId = computed(() => String(toValue(options.postId) ?? '').trim());
  const isEnabled = computed(() => Boolean(toValue(options.enabled) ?? true));
  const authIdentity = computed(() => authStore.user?.id || 'anonymous');
  const isVisible = () => typeof document === 'undefined' || !document.hidden;

  const currentSessionId = ref<string | null>(null);
  const activePostId = ref<string | null>(null);

  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

  const clearHeartbeat = () => {
    if (heartbeatTimer !== null) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
  };

  const resetPresence = () => {
    presence.value = createEmptyPresence();
  };

  const syncSession = async (postId: string, sessionId: string) => {
    try {
      const nextPresence = await postApi.registerPostReadingSession(postId, sessionId);
      if (activePostId.value !== postId || currentSessionId.value !== sessionId) {
        return false;
      }
      presence.value = nextPresence;
      return true;
    } catch (error) {
      if (activePostId.value === postId && currentSessionId.value === sessionId) {
        resetPresence();
      }

      const status = getErrorStatus(error);
      if (status === 403 || status === 404) {
        clearHeartbeat();
      }

      return false;
    }
  };

  const leaveWithKeepalive = (postId: string, sessionId: string) => {
    if (typeof window === 'undefined') {
      return;
    }

    const body = JSON.stringify({ sessionId });
    const url = buildLeaveUrl(postId);

    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const payload = new Blob([body], { type: 'application/json' });
      if (navigator.sendBeacon(url, payload)) {
        return;
      }
    }

    void fetch(url, {
      method: 'POST',
      body,
      credentials: 'include',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
      },
    }).catch(() => undefined);
  };

  const leaveCurrentSession = async (mode: 'default' | 'keepalive' = 'default') => {
    const postId = activePostId.value;
    const sessionId = currentSessionId.value;

    clearHeartbeat();

    if (!postId || !sessionId) {
      activePostId.value = null;
      currentSessionId.value = null;
      resetPresence();
      return;
    }

    activePostId.value = null;
    currentSessionId.value = null;
    resetPresence();

    if (mode === 'keepalive') {
      leaveWithKeepalive(postId, sessionId);
      return;
    }

    try {
      await postApi.leavePostReadingSession(postId, sessionId);
    } catch {
      // Presence failure must not interrupt article detail interactions.
    }
  };

  const startSession = async () => {
    const postId = resolvedPostId.value;
    if (!isEnabled.value || !postId || !isVisible()) {
      await leaveCurrentSession();
      return;
    }

    await leaveCurrentSession();

    const sessionId = createSessionId();
    activePostId.value = postId;
    currentSessionId.value = sessionId;

    const synced = await syncSession(postId, sessionId);
    if (!synced || activePostId.value !== postId || currentSessionId.value !== sessionId) {
      return;
    }

    heartbeatTimer = setInterval(() => {
      if (!activePostId.value || !currentSessionId.value) {
        clearHeartbeat();
        return;
      }

      void syncSession(activePostId.value, currentSessionId.value);
    }, HEARTBEAT_INTERVAL_MS);
  };

  const handleVisibilityChange = () => {
    if (!isVisible()) {
      void leaveCurrentSession();
      return;
    }

    void startSession();
  };

  const handlePageHide = () => {
    void leaveCurrentSession('keepalive');
  };

  onMounted(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
  });

  onBeforeUnmount(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('pagehide', handlePageHide);
    void leaveCurrentSession('keepalive');
  });

  watch([resolvedPostId, isEnabled], () => {
    void startSession();
  }, { immediate: true });

  watch(authIdentity, (nextIdentity, previousIdentity) => {
    if (previousIdentity == null || nextIdentity === previousIdentity) {
      return;
    }

    void startSession();
  });

  return {
    readingPresence: computed(() => presence.value),
  };
}
