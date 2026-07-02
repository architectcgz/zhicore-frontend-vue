import type { RouteRecordRaw } from "vue-router";

export const editorRoutes: RouteRecordRaw[] = [
  {
    path: "/editor",
    name: "Editor",
    component: () => import("@/pages/editor/EditorRoutePage.vue"),
  },
  {
    path: "/editor-document-showcase",
    name: "EditorDocumentShowcase",
    component: () =>
      import("@/pages/editor/EditorDocumentShowcaseRoutePage.vue"),
  },
];
