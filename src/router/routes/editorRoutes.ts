import type { RouteRecordRaw } from "vue-router";

export const editorRoutes: RouteRecordRaw[] = [
  {
    path: "/editor-showcase",
    name: "EditorShowcase",
    component: () => import("@/pages/editor/EditorShowcaseRoutePage.vue"),
  },
  {
    path: "/editor-document-showcase",
    name: "EditorDocumentShowcase",
    component: () =>
      import("@/pages/editor/EditorDocumentShowcaseRoutePage.vue"),
  },
];
