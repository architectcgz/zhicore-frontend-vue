import type { RouteRecordRaw } from "vue-router";

export const legalRoutes: RouteRecordRaw[] = [
  {
    path: "legal/privacy",
    name: "PrivacyPolicy",
    component: () => import("@/pages/legal/LegalDocumentRoutePage.vue"),
  },
  {
    path: "legal/terms",
    name: "TermsOfService",
    component: () => import("@/pages/legal/LegalDocumentRoutePage.vue"),
  },
];
