import type { RouteRecordRaw } from "vue-router";

export const editorRoutes: RouteRecordRaw[] = [
  {
    path: "/editor",
    name: "Editor",
    component: () => import("@/pages/editor/EditorRoutePage.vue"),
    meta: { appShellFlush: true },
  },
  {
    path: "/editor-document",
    name: "EditorDocument",
    component: () => import("@/pages/editor/EditorDocumentRoutePage.vue"),
    meta: { appShellFlush: true },
  },
];
