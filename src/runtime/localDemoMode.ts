export interface LocalDemoEnv {
  DEV?: boolean;
  VITE_ZHICORE_LOCAL_MOCK?: string;
}

export function isLocalDemoModeEnabled(
  env: LocalDemoEnv = import.meta.env,
): boolean {
  return env.DEV === true && env.VITE_ZHICORE_LOCAL_MOCK !== "false";
}
