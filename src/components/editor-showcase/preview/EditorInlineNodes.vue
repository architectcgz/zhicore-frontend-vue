<template>
  <template
    v-for="(node, nodeIndex) in nodes"
    :key="`${nodeIndex}-${node.type}-${node.text}`"
  >
    <component
      :is="inlineTagByType[node.type]"
      :class="inlineClassByType[node.type]"
      v-bind="getInlineAttrs(node)"
    >
      {{ node.text }}
    </component>
  </template>
</template>

<script setup lang="ts">
import type { EditorShowcaseInlineNode } from "@/features/editor-showcase/model/useEditorShowcaseDraft";

type InlineNodeType = EditorShowcaseInlineNode["type"];
type InlineTag = "span" | "a" | "strong" | "em" | "del" | "code";

defineProps<{
  nodes: EditorShowcaseInlineNode[];
}>();

const inlineTagByType = {
  text: "span",
  link: "a",
  strong: "strong",
  emphasis: "em",
  strikethrough: "del",
  inlineCode: "code",
} satisfies Record<InlineNodeType, InlineTag>;

const inlineClassByType = {
  text: "",
  link: "reader-preview__link",
  strong: "reader-preview__strong",
  emphasis: "reader-preview__emphasis",
  strikethrough: "reader-preview__strikethrough",
  inlineCode: "reader-preview__inline-code",
} satisfies Record<InlineNodeType, string>;

function getInlineAttrs(
  node: EditorShowcaseInlineNode,
): Record<string, string> {
  if (node.type !== "link") {
    return {};
  }

  return {
    href: node.href,
    target: "_blank",
    rel: "noreferrer",
  };
}
</script>

<style scoped>
.reader-preview__link {
  color: var(--reader-link);
  font-weight: 720;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.reader-preview__link:hover,
.reader-preview__link:focus-visible {
  color: var(--reader-link-hover);
}

.reader-preview__strong {
  color: var(--reader-strong);
  font-weight: 760;
}

.reader-preview__emphasis {
  color: var(--reader-emphasis);
}

.reader-preview__strikethrough {
  color: var(--reader-strikethrough);
}

.reader-preview__inline-code {
  padding: 1px 5px;
  border-radius: 5px;
  background: var(--reader-code-bg);
  color: var(--reader-code-text);
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 0.92em;
}
</style>
