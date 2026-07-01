/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
  readonly VITE_DEV_PROXY_TARGET?: string;
  readonly VITE_ZHICORE_EDITOR_DEBUG?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
