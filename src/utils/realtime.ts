export function isRealtimeEnabled(): boolean {
  return import.meta.env.VITE_ENABLE_REALTIME === 'true';
}
