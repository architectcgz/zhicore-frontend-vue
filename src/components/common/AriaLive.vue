<!--
  ARIA 实时区域组件
  用于向屏幕阅读器宣布动态内容变化
-->
<template>
  <div
    class="sr-only"
    role="status"
    :aria-live="politeness"
    aria-atomic="true"
  >
    {{ message }}
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
  message?: string;
  politeness?: 'polite' | 'assertive';
}

const props = withDefaults(defineProps<Props>(), {
  message: '',
  politeness: 'polite',
});

const message = ref(props.message);
const politeness = ref(props.politeness);

// 监听 props 变化
watch(() => props.message, (newMessage) => {
  // 清空后再设置，确保屏幕阅读器能检测到变化
  message.value = '';
  setTimeout(() => {
    message.value = newMessage;
  }, 100);
});

watch(() => props.politeness, (newPoliteness) => {
  politeness.value = newPoliteness;
});
</script>

<style scoped>
/* sr-only 样式在 accessibility.css 中定义 */
</style>
