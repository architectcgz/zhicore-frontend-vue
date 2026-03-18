<!--
  主题切换组件
  提供亮色、暗色和自动三种模式切换
-->

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useTheme } from '@/composables/useTheme';
import type { Theme } from '@/stores/theme';

const {
  theme,
  systemTheme,
  getThemeLabel,
  getThemeIcon,
  setTheme,
} = useTheme();

const isOpen = ref(false);
const dropdownRef = ref<HTMLDivElement | null>(null);

const themeOptions: Array<{ value: Theme; label: string; description: string }> = [
  {
    value: 'light',
    label: '亮色',
    description: '明亮阅读',
  },
  {
    value: 'dark',
    label: '暗色',
    description: '夜间浏览',
  },
  {
    value: 'auto',
    label: '自动',
    description: '跟随系统',
  },
];

const currentIcon = computed(() => getThemeIcon.value);

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const selectTheme = (selectedTheme: Theme) => {
  setTheme(selectedTheme);
  isOpen.value = false;
};

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
};

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) {
    isOpen.value = false;
  }
};

const getAutoDescription = () => {
  return `当前系统为${systemTheme.value === 'dark' ? '暗色' : '亮色'}`;
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleEscape);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleEscape);
});
</script>

<template>
  <div
    ref="dropdownRef"
    class="theme-toggle"
  >
    <button
      class="theme-toggle__button soft-pill"
      :class="{ 'theme-toggle__button--active': isOpen }"
      :aria-label="`切换主题，当前为${getThemeLabel}`"
      :aria-expanded="isOpen"
      type="button"
      @click="toggleDropdown"
    >
      <span class="theme-toggle__icon">
        <svg
          v-if="currentIcon === 'sun'"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="4.5"
          />
          <path d="M12 2.75v2.5M12 18.75v2.5M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2.75 12h2.5M18.75 12h2.5M4.93 19.07l1.77-1.77M17.3 6.7l1.77-1.77" />
        </svg>
        <svg
          v-else-if="currentIcon === 'moon'"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M20.58 14.16A8.98 8.98 0 0 1 9.84 3.42a9 9 0 1 0 10.74 10.74Z" />
        </svg>
        <svg
          v-else
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <rect
            x="4"
            y="5"
            width="16"
            height="11"
            rx="2.5"
          />
          <path d="M8 19h8M12 16v3" />
        </svg>
      </span>
      <span class="theme-toggle__label">{{ getThemeLabel }}</span>
      <span
        class="theme-toggle__arrow"
        :class="{ 'theme-toggle__arrow--up': isOpen }"
      >
        <svg
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="m5 7.5 5 5 5-5" />
        </svg>
      </span>
    </button>

    <Transition name="theme-toggle-dropdown">
      <div
        v-if="isOpen"
        class="theme-toggle__dropdown surface-panel"
        role="menu"
      >
        <button
          v-for="option in themeOptions"
          :key="option.value"
          class="theme-toggle__option"
          :class="{ 'theme-toggle__option--active': theme === option.value }"
          role="menuitem"
          type="button"
          @click="selectTheme(option.value)"
        >
          <div class="theme-toggle__option-copy">
            <span class="theme-toggle__option-label">{{ option.label }}</span>
            <span class="theme-toggle__option-description">
              {{ option.value === 'auto' ? getAutoDescription() : option.description }}
            </span>
          </div>
          <span
            v-if="theme === option.value"
            class="theme-toggle__option-check"
            aria-hidden="true"
          >
            <svg viewBox="0 0 20 20">
              <path d="m4.5 10.5 3.25 3.25L15.5 6" />
            </svg>
          </span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.theme-toggle {
  position: relative;
  z-index: 40;
}

.theme-toggle__button {
  gap: 10px;
  min-width: 112px;
  padding: 10px 14px;
  color: var(--color-text);
  transition:
    transform var(--transition-base),
    border-color var(--transition-base),
    background-color var(--transition-base);
}

.theme-toggle__button:hover,
.theme-toggle__button--active {
  border-color: var(--color-border-dark);
  background: var(--color-bg-secondary);
}

.theme-toggle__icon,
.theme-toggle__arrow,
.theme-toggle__option-check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.theme-toggle__icon svg,
.theme-toggle__arrow svg,
.theme-toggle__option-check svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.theme-toggle__label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.theme-toggle__arrow {
  color: var(--color-text-secondary);
  transition: transform var(--transition-base);
}

.theme-toggle__arrow--up {
  transform: rotate(180deg);
}

.theme-toggle__dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  min-width: 220px;
  padding: 10px;
  border-radius: var(--radius-lg);
  z-index: 60;
}

.theme-toggle__option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text);
  transition: background-color var(--transition-base);
}

.theme-toggle__option:hover,
.theme-toggle__option--active {
  background: var(--color-hover);
}

.theme-toggle__option-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-align: left;
}

.theme-toggle__option-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.theme-toggle__option-description {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.theme-toggle__option-check {
  color: var(--color-cta);
}

.theme-toggle-dropdown-enter-active,
.theme-toggle-dropdown-leave-active {
  transition:
    opacity var(--transition-base),
    transform var(--transition-base);
}

.theme-toggle-dropdown-enter-from,
.theme-toggle-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 767px) {
  .theme-toggle__button {
    min-width: auto;
    padding: 10px 12px;
  }

  .theme-toggle__label {
    display: none;
  }
}
</style>
