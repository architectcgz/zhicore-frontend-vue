/**
 * Vue 组件类型声明
 * 
 * 为 .vue 文件提供 TypeScript 类型支持
 */
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, never>, Record<string, never>, any>;
  export default component;
}
