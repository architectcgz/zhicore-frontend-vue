<template>
  <component :is="readerComponentByType[block.type]" :block="block" />
</template>

<script setup lang="ts">
import type { Component } from "vue";

import type { PostBodyBlock } from "@/entities/post-body";

import PostBodyAttachmentGalleryBlock from "./blocks/PostBodyAttachmentGalleryBlock.vue";
import PostBodyCodeBlock from "./blocks/PostBodyCodeBlock.vue";
import PostBodyCollapsibleBlock from "./blocks/PostBodyCollapsibleBlock.vue";
import PostBodyExternalEmbedBlock from "./blocks/PostBodyExternalEmbedBlock.vue";
import PostBodyHeadingBlock from "./blocks/PostBodyHeadingBlock.vue";
import PostBodyImageBlock from "./blocks/PostBodyImageBlock.vue";
import PostBodyListBlock from "./blocks/PostBodyListBlock.vue";
import PostBodyMathBlock from "./blocks/PostBodyMathBlock.vue";
import PostBodyParagraphBlock from "./blocks/PostBodyParagraphBlock.vue";
import PostBodyQuoteBlock from "./blocks/PostBodyQuoteBlock.vue";
import PostBodyTableBlock from "./blocks/PostBodyTableBlock.vue";

defineProps<{
  block: PostBodyBlock;
}>();

const readerComponentByType: Record<PostBodyBlock["type"], Component> = {
  paragraph: PostBodyParagraphBlock,
  heading: PostBodyHeadingBlock,
  quote: PostBodyQuoteBlock,
  list: PostBodyListBlock,
  code_block: PostBodyCodeBlock,
  table: PostBodyTableBlock,
  collapsible: PostBodyCollapsibleBlock,
  math: PostBodyMathBlock,
  image: PostBodyImageBlock,
  external_embed: PostBodyExternalEmbedBlock,
  attachment_gallery: PostBodyAttachmentGalleryBlock,
};
</script>
