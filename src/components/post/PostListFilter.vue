<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Tag } from '@/types';
import type { PostListFilters, PostListSort, PostListTimeRange } from '@/composables/usePostsListPage';

interface Props {
  sort: PostListSort;
  tagIds: string[];
  timeRange: PostListTimeRange;
  availableTags: Tag[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  change: [filters: PostListFilters];
}>();

const draftSort = ref<PostListSort>(props.sort);
const draftTagIds = ref<string[]>([...props.tagIds]);
const draftTimeRange = ref<PostListTimeRange>(props.timeRange);

watch(
  () => props.sort,
  (value) => {
    draftSort.value = value;
  },
);

watch(
  () => props.tagIds,
  (value) => {
    draftTagIds.value = [...value];
  },
);

watch(
  () => props.timeRange,
  (value) => {
    draftTimeRange.value = value;
  },
);

const emitChange = () => {
  emit('change', {
    sort: draftSort.value,
    tagIds: [...draftTagIds.value],
    timeRange: draftTimeRange.value,
  });
};

const setSort = (sort: PostListSort) => {
  draftSort.value = sort;
  emitChange();
};

const handleTagChange = (event: Event) => {
  const select = event.target as HTMLSelectElement;
  draftTagIds.value = Array.from(select.selectedOptions).map((option) => option.value);
  emitChange();
};

const handleTimeRangeChange = (event: Event) => {
  draftTimeRange.value = (event.target as HTMLSelectElement).value as PostListTimeRange;
  emitChange();
};
</script>

<template>
  <section class="post-list-filter">
    <div class="post-list-filter__sorts">
      <button
        data-test="sort-latest"
        class="post-list-filter__sort"
        :class="{ 'post-list-filter__sort--active': draftSort === 'latest' }"
        type="button"
        @click="setSort('latest')"
      >
        最新
      </button>
      <button
        data-test="sort-popular"
        class="post-list-filter__sort"
        :class="{ 'post-list-filter__sort--active': draftSort === 'popular' }"
        type="button"
        @click="setSort('popular')"
      >
        最热
      </button>
      <button
        data-test="sort-hot"
        class="post-list-filter__sort"
        :class="{ 'post-list-filter__sort--active': draftSort === 'hot' }"
        type="button"
        @click="setSort('hot')"
      >
        最多评论
      </button>
    </div>

    <div class="post-list-filter__controls">
      <label class="post-list-filter__label">
        标签
        <select
          data-test="tag-select"
          class="post-list-filter__select post-list-filter__select--tags"
          multiple
          :value="draftTagIds"
          @change="handleTagChange"
        >
          <option
            v-for="tag in props.availableTags"
            :key="tag.id"
            :value="tag.id"
          >
            {{ tag.name }}
          </option>
        </select>
      </label>

      <label class="post-list-filter__label">
        时间范围
        <select
          data-test="time-range"
          class="post-list-filter__select"
          :value="draftTimeRange"
          @change="handleTimeRangeChange"
        >
          <option value="all">
            全部
          </option>
          <option value="today">
            今天
          </option>
          <option value="week">
            本周
          </option>
          <option value="month">
            本月
          </option>
        </select>
      </label>
    </div>
  </section>
</template>

<style scoped>
.post-list-filter {
  display: flex;
  flex-wrap: wrap;
  align-items: start;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-secondary);
}

.post-list-filter__sorts {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.post-list-filter__sort {
  padding: 10px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.post-list-filter__sort--active {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

.post-list-filter__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.post-list-filter__label {
  display: grid;
  gap: 6px;
  color: var(--color-text-secondary);
  font-size: 0.92rem;
}

.post-list-filter__select {
  min-width: 140px;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-primary);
  color: var(--color-text);
}

.post-list-filter__select--tags {
  min-width: 180px;
  min-height: 110px;
}

@media (max-width: 767px) {
  .post-list-filter {
    flex-direction: column;
  }

  .post-list-filter__controls {
    width: 100%;
  }

  .post-list-filter__label {
    width: 100%;
  }

  .post-list-filter__select,
  .post-list-filter__select--tags {
    width: 100%;
    min-width: 0;
  }
}
</style>
