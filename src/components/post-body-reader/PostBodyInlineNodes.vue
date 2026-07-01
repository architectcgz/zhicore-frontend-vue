<template>
  <template
    v-for="(segment, segmentIndex) in segments"
    :key="`${segmentIndex}-${segment.text}-${segment.tags.join('-')}`"
  >
    <template
      v-for="(textFragment, fragmentIndex) in segment.textFragments"
      :key="`${segmentIndex}-${fragmentIndex}-${segment.tags.join('-')}`"
    >
      <br v-if="fragmentIndex > 0" />
      <a
        v-if="segment.href"
        class="reader-preview__link"
        :class="segment.classes"
        :href="segment.href"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ textFragment }}
      </a>
      <component v-else :is="segment.tag" :class="segment.classes">
        {{ textFragment }}
      </component>
    </template>
  </template>
</template>

<script setup lang="ts">
import { computed } from "vue";

import {
  sanitizePostBodyExternalUrl,
  type PostBodyInlineMark,
  type PostBodyInlineNode,
} from "@/entities/post-body";

type InlineTag = "span" | "strong" | "em" | "del" | "code";

interface RenderedInlineSegment {
  text: string;
  textFragments: string[];
  tag: InlineTag;
  href?: string;
  classes: string[];
  tags: string[];
}

const props = defineProps<{
  nodes: PostBodyInlineNode[];
}>();

function getLinkMark(marks: PostBodyInlineMark[] = []) {
  return marks.find((mark) => mark.type === "link");
}

function getInlineTag(marks: PostBodyInlineMark[] = []): InlineTag {
  if (marks.some((mark) => mark.type === "inline_code")) return "code";
  if (marks.some((mark) => mark.type === "bold")) return "strong";
  if (marks.some((mark) => mark.type === "italic")) return "em";
  if (marks.some((mark) => mark.type === "strike")) return "del";
  return "span";
}

function getInlineClasses(marks: PostBodyInlineMark[] = []): string[] {
  return marks.map((mark) => `reader-preview__inline--${mark.type}`);
}

const segments = computed<RenderedInlineSegment[]>(() =>
  props.nodes.map((node) => {
    const marks = node.marks ?? [];
    const linkMark = getLinkMark(marks);
    const href = linkMark ? sanitizePostBodyExternalUrl(linkMark.href) : null;

    return {
      text: node.text,
      // 正文文本允许包含用户输入的空行，显式 br 比依赖 white-space CSS 更稳定。
      textFragments: node.text.split("\n"),
      tag: getInlineTag(marks),
      href: href ?? undefined,
      classes: getInlineClasses(marks),
      tags: marks.map((mark) => mark.type),
    };
  }),
);
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

.reader-preview__inline--bold {
  color: var(--reader-strong);
  font-weight: 760;
}

.reader-preview__inline--italic {
  color: var(--reader-emphasis);
  font-style: italic;
}

.reader-preview__inline--underline {
  text-decoration: underline;
  text-underline-offset: 3px;
}

.reader-preview__inline--strike {
  color: var(--reader-strikethrough);
  text-decoration: line-through;
}

.reader-preview__inline--inline_code {
  padding: 1px 5px;
  border-radius: 5px;
  background: var(--reader-code-bg);
  color: var(--reader-code-text);
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 0.92em;
}
</style>
