<template>
  <div
    class="search-bar"
    :class="{ 'search-bar--focused': isFocused }"
  >
    <!-- 搜索输入框 -->
    <div class="search-bar__input-wrapper">
      <i class="search-bar__icon el-icon-search" />
      <input
        ref="searchInputRef"
        v-model="searchQuery"
        type="text"
        class="search-bar__input"
        :placeholder="placeholder"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown.enter="handleSearch"
        @keydown.down.prevent="handleArrowDown"
        @keydown.up.prevent="handleArrowUp"
        @keydown.esc="handleEscape"
      >
      <button
        v-if="searchQuery"
        class="search-bar__clear"
        @click="handleClear"
      >
        <i class="el-icon-close" />
      </button>
    </div>

    <!-- 搜索建议下拉框 -->
    <transition name="fade-slide">
      <div
        v-if="showDropdown && (suggestions.length > 0 || searchHistory.length > 0 || hotSearches.length > 0)"
        class="search-bar__dropdown"
      >
        <!-- 搜索建议 -->
        <div
          v-if="suggestions.length > 0"
          class="search-bar__section"
        >
          <div class="search-bar__section-title">
            搜索建议
          </div>
          <div
            v-for="(suggestion, index) in suggestions"
            :key="`suggestion-${index}`"
            class="search-bar__item"
            :class="{ 'search-bar__item--active': activeIndex === index }"
            @click="handleSelectSuggestion(suggestion)"
            @mouseenter="activeIndex = index"
          >
            <i class="search-bar__item-icon el-icon-search" />
            <span class="search-bar__item-text">{{ suggestion }}</span>
          </div>
        </div>

        <!-- 搜索历史 -->
        <div
          v-if="searchHistory.length > 0 && !searchQuery"
          class="search-bar__section"
        >
          <div class="search-bar__section-header">
            <div class="search-bar__section-title">
              搜索历史
            </div>
            <button
              class="search-bar__clear-history"
              @click="handleClearHistory"
            >
              <i class="el-icon-delete" />
              清空
            </button>
          </div>
          <div
            v-for="(history, index) in searchHistory"
            :key="`history-${history}`"
            class="search-bar__item"
            :class="{ 'search-bar__item--active': activeIndex === suggestions.length + index }"
            @click="handleSelectSuggestion(history)"
            @mouseenter="activeIndex = suggestions.length + index"
          >
            <i class="search-bar__item-icon el-icon-time" />
            <span class="search-bar__item-text">{{ history }}</span>
            <button
              v-if="!useRemoteHistory"
              class="search-bar__item-remove"
              @click.stop="handleRemoveHistory(history)"
            >
              <i class="el-icon-close" />
            </button>
          </div>
        </div>

        <!-- 热门搜索 -->
        <div
          v-if="hotSearches.length > 0 && !searchQuery"
          class="search-bar__section"
        >
          <div class="search-bar__section-title">
            热门搜索
          </div>
          <div
            v-for="(hotSearch, index) in hotSearches"
            :key="`hot-${hotSearch}`"
            class="search-bar__item"
            :class="{ 'search-bar__item--active': activeIndex === suggestions.length + searchHistory.length + index }"
            @click="handleSelectSuggestion(hotSearch)"
            @mouseenter="activeIndex = suggestions.length + searchHistory.length + index"
          >
            <span
              class="search-bar__item-rank"
              :class="{
                'search-bar__item-rank--top': index < 3,
              }"
            >
              {{ index + 1 }}
            </span>
            <span class="search-bar__item-text">{{ hotSearch }}</span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { searchApi } from '@/api/search';
import { useDebounceFn } from '@/composables/useDebounce';
import { useAuthStore } from '@/stores/auth';

/**
 * Props 定义
 */
interface Props {
  placeholder?: string;
  maxHistory?: number;
  maxSuggestions?: number;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '搜索文章...',
  maxHistory: 10,
  maxSuggestions: 8,
});

/**
 * Emits 定义
 */
const emit = defineEmits<{
  search: [query: string];
}>();

// Router
const router = useRouter();
const authStore = useAuthStore();

// 搜索输入框引用
const searchInputRef = ref<HTMLInputElement | null>(null);

// 搜索关键词
const searchQuery = ref('');

// 焦点状态
const isFocused = ref(false);

// 显示下拉框
const showDropdown = ref(false);

// 当前激活的索引
const activeIndex = ref(-1);

// 搜索建议
const suggestions = ref<string[]>([]);

// 搜索历史
const searchHistory = ref<string[]>([]);

// 热门搜索
const hotSearches = ref<string[]>([]);
const useRemoteHistory = computed(() => authStore.isAuthenticated);

/**
 * 本地存储键名
 */
const STORAGE_KEY = 'blog_search_history';

/**
 * 加载搜索历史
 */
const loadLocalSearchHistory = () => {
  try {
    const history = localStorage.getItem(STORAGE_KEY);
    if (history) {
      searchHistory.value = JSON.parse(history);
      return;
    }

    searchHistory.value = [];
  } catch (error) {
    console.error('Failed to load search history:', error);
    searchHistory.value = [];
  }
};

const loadSearchHistory = async () => {
  if (useRemoteHistory.value) {
    try {
      const history = await searchApi.getSearchHistory(props.maxHistory);
      searchHistory.value = history.slice(0, props.maxHistory);
    } catch (error) {
      console.error('Failed to load remote search history:', error);
      searchHistory.value = [];
    }
    return;
  }

  loadLocalSearchHistory();
};

/**
 * 保存搜索历史
 */
const saveSearchHistory = (query: string) => {
  const filtered = searchHistory.value.filter((item) => item !== query);
  searchHistory.value = [query, ...filtered].slice(0, props.maxHistory);

  if (useRemoteHistory.value) {
    return;
  }

  try {
    // 保存到本地存储
    localStorage.setItem(STORAGE_KEY, JSON.stringify(searchHistory.value));
  } catch (error) {
    console.error('Failed to save search history:', error);
  }
};

/**
 * 移除搜索历史项
 */
const handleRemoveHistory = (query: string) => {
  if (useRemoteHistory.value) {
    return;
  }

  searchHistory.value = searchHistory.value.filter((item) => item !== query);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(searchHistory.value));
  } catch (error) {
    console.error('Failed to remove search history:', error);
  }
};

/**
 * 清空搜索历史
 */
const handleClearHistory = async () => {
  searchHistory.value = [];

  if (useRemoteHistory.value) {
    try {
      await searchApi.clearSearchHistory();
    } catch (error) {
      console.error('Failed to clear remote search history:', error);
      await loadSearchHistory();
    }
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear search history:', error);
  }
};

/**
 * 加载热门搜索
 */
const loadHotSearches = async () => {
  try {
    hotSearches.value = await searchApi.getHotSearches(10);
  } catch (error) {
    console.error('Failed to load hot searches:', error);
  }
};

/**
 * 获取搜索建议
 */
const fetchSuggestions = async (query: string) => {
  if (!query.trim()) {
    suggestions.value = [];
    return;
  }

  try {
    const result = await searchApi.getSuggestions(query, props.maxSuggestions);
    suggestions.value = result.slice(0, props.maxSuggestions);
  } catch (error) {
    console.error('Failed to fetch suggestions:', error);
    suggestions.value = [];
  }
};

/**
 * 防抖获取搜索建议
 */
const { debouncedFn: debouncedFetchSuggestions } = useDebounceFn(
  fetchSuggestions,
  300
);

/**
 * 监听搜索关键词变化
 */
watch(searchQuery, (newQuery) => {
  if (newQuery.trim()) {
    debouncedFetchSuggestions(newQuery);
  } else {
    suggestions.value = [];
  }
  activeIndex.value = -1;
});

watch(useRemoteHistory, () => {
  void loadSearchHistory();
});

/**
 * 处理焦点
 */
const handleFocus = () => {
  isFocused.value = true;
  showDropdown.value = true;

  // 如果没有搜索关键词，加载热门搜索
  if (!searchQuery.value.trim() && hotSearches.value.length === 0) {
    loadHotSearches();
  }

  if (!searchQuery.value.trim()) {
    void loadSearchHistory();
  }
};

/**
 * 处理失焦
 */
const handleBlur = () => {
  isFocused.value = false;
  // 延迟隐藏下拉框，以便点击事件能够触发
  setTimeout(() => {
    showDropdown.value = false;
  }, 200);
};

/**
 * 处理清空
 */
const handleClear = () => {
  searchQuery.value = '';
  suggestions.value = [];
  activeIndex.value = -1;
  searchInputRef.value?.focus();
};

/**
 * 处理搜索
 */
const handleSearch = () => {
  const query = searchQuery.value.trim();
  if (!query) return;

  // 保存搜索历史
  saveSearchHistory(query);

  // 隐藏下拉框
  showDropdown.value = false;

  // 触发搜索事件
  emit('search', query);

  // 导航到搜索结果页
  router.push({
    path: '/search',
    query: { q: query },
  });
};

/**
 * 选择搜索建议
 */
const handleSelectSuggestion = (text: string) => {
  searchQuery.value = text;
  handleSearch();
};

/**
 * 处理向下箭头
 */
const handleArrowDown = () => {
  const totalItems =
    suggestions.value.length + searchHistory.value.length + hotSearches.value.length;
  if (totalItems === 0) return;

  activeIndex.value = (activeIndex.value + 1) % totalItems;
};

/**
 * 处理向上箭头
 */
const handleArrowUp = () => {
  const totalItems =
    suggestions.value.length + searchHistory.value.length + hotSearches.value.length;
  if (totalItems === 0) return;

  activeIndex.value = activeIndex.value <= 0 ? totalItems - 1 : activeIndex.value - 1;
};

/**
 * 处理 ESC 键
 */
const handleEscape = () => {
  showDropdown.value = false;
  searchInputRef.value?.blur();
};

/**
 * 处理全局快捷键
 */
const handleGlobalKeydown = (event: KeyboardEvent) => {
  // Ctrl+K 或 Cmd+K
  if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
    event.preventDefault();
    searchInputRef.value?.focus();
  }
};

/**
 * 组件挂载
 */
onMounted(() => {
  // 加载搜索历史
  void loadSearchHistory();
  
  // 注册全局快捷键
  window.addEventListener('keydown', handleGlobalKeydown);
});

/**
 * 组件卸载
 */
onUnmounted(() => {
  // 移除全局快捷键
  window.removeEventListener('keydown', handleGlobalKeydown);
});
</script>

<style scoped>
.search-bar {
  position: relative;
  width: 100%;
  max-width: 600px;

  &--focused {
    .search-bar__input-wrapper {
      border-color: var(--color-cta);
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
  }
}

.search-bar__input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--color-border-hover);
  }
}

.search-bar__icon {
  position: absolute;
  left: 12px;
  color: var(--color-text-secondary);
  font-size: 18px;
  pointer-events: none;
}

.search-bar__input {
  flex: 1;
  padding: 10px 40px 10px 40px;
  background: transparent;
  border: none;
  outline: none;
  font-size: 14px;
  color: var(--color-text-primary);

  &::placeholder {
    color: var(--color-text-tertiary);
  }
}

.search-bar__clear {
  position: absolute;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-bg-hover);
    color: var(--color-text-primary);
  }
}

.search-bar__dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  max-height: 400px;
  overflow-y: auto;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.search-bar__section {
  padding: 8px 0;

  & + & {
    border-top: 1px solid var(--color-border);
  }
}

.search-bar__section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
}

.search-bar__section-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.search-bar__clear-history {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: transparent;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-bg-hover);
    color: var(--color-danger);
  }
}

.search-bar__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover,
  &--active {
    background: var(--color-bg-hover);
  }
}

.search-bar__item-icon {
  flex-shrink: 0;
  font-size: 16px;
  color: var(--color-text-secondary);
}

.search-bar__item-rank {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);

  &--top {
    color: var(--color-cta);
  }
}

.search-bar__item-text {
  flex: 1;
  font-size: 14px;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-bar__item-count {
  flex-shrink: 0;
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.search-bar__item-trend {
  flex-shrink: 0;
  font-size: 14px;

  &.el-icon-top {
    color: var(--color-success);
  }

  &.el-icon-bottom {
    color: var(--color-danger);
  }
}

.search-bar__item-remove {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--color-text-secondary);
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;

  .search-bar__item:hover & {
    opacity: 1;
  }

  &:hover {
    background: var(--color-bg-hover);
    color: var(--color-danger);
  }
}

// 动画
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
