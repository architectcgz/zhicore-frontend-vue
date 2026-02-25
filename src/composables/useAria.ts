/**
 * ARIA 属性管理组合式函数
 * 提供 ARIA 属性的辅助功能
 */
import { computed, ref } from 'vue';

/**
 * ARIA 实时区域 Hook
 */
export function useAriaLive() {
  const message = ref('');
  const politeness = ref<'polite' | 'assertive'>('polite');

  /**
   * 宣布消息（屏幕阅读器会读出）
   */
  const announce = (text: string, level: 'polite' | 'assertive' = 'polite') => {
    message.value = '';
    politeness.value = level;
    
    // 使用 setTimeout 确保屏幕阅读器能检测到变化
    setTimeout(() => {
      message.value = text;
    }, 100);
  };

  /**
   * 清除消息
   */
  const clear = () => {
    message.value = '';
  };

  return {
    message,
    politeness,
    announce,
    clear,
  };
}

/**
 * ARIA 标签 Hook
 */
export function useAriaLabel(defaultLabel?: string) {
  const label = ref(defaultLabel || '');

  const ariaLabel = computed(() => label.value);

  const setLabel = (newLabel: string) => {
    label.value = newLabel;
  };

  return {
    ariaLabel,
    setLabel,
  };
}

/**
 * ARIA 描述 Hook
 */
export function useAriaDescription(defaultDescription?: string) {
  const description = ref(defaultDescription || '');
  const descriptionId = ref(`aria-desc-${Math.random().toString(36).substr(2, 9)}`);

  const ariaDescribedBy = computed(() => descriptionId.value);

  const setDescription = (newDescription: string) => {
    description.value = newDescription;
  };

  return {
    description,
    descriptionId,
    ariaDescribedBy,
    setDescription,
  };
}

/**
 * ARIA 展开/折叠状态 Hook
 */
export function useAriaExpanded(initialExpanded = false) {
  const expanded = ref(initialExpanded);

  const ariaExpanded = computed(() => expanded.value.toString());

  const toggle = () => {
    expanded.value = !expanded.value;
  };

  const setExpanded = (value: boolean) => {
    expanded.value = value;
  };

  return {
    expanded,
    ariaExpanded,
    toggle,
    setExpanded,
  };
}

/**
 * ARIA 选中状态 Hook
 */
export function useAriaSelected(initialSelected = false) {
  const selected = ref(initialSelected);

  const ariaSelected = computed(() => selected.value.toString());

  const toggle = () => {
    selected.value = !selected.value;
  };

  const setSelected = (value: boolean) => {
    selected.value = value;
  };

  return {
    selected,
    ariaSelected,
    toggle,
    setSelected,
  };
}

/**
 * ARIA 禁用状态 Hook
 */
export function useAriaDisabled(initialDisabled = false) {
  const disabled = ref(initialDisabled);

  const ariaDisabled = computed(() => disabled.value.toString());

  const setDisabled = (value: boolean) => {
    disabled.value = value;
  };

  return {
    disabled,
    ariaDisabled,
    setDisabled,
  };
}

/**
 * ARIA 加载状态 Hook
 */
export function useAriaBusy(initialBusy = false) {
  const busy = ref(initialBusy);

  const ariaBusy = computed(() => busy.value.toString());

  const setBusy = (value: boolean) => {
    busy.value = value;
  };

  return {
    busy,
    ariaBusy,
    setBusy,
  };
}

/**
 * ARIA 模态框 Hook
 */
export function useAriaModal() {
  const isOpen = ref(false);
  const modalId = ref(`modal-${Math.random().toString(36).substr(2, 9)}`);
  const labelId = ref(`modal-label-${Math.random().toString(36).substr(2, 9)}`);
  const descId = ref(`modal-desc-${Math.random().toString(36).substr(2, 9)}`);

  const ariaModal = computed(() => 'true');
  const role = computed(() => 'dialog');
  const ariaLabelledBy = computed(() => labelId.value);
  const ariaDescribedBy = computed(() => descId.value);

  const open = () => {
    isOpen.value = true;
  };

  const close = () => {
    isOpen.value = false;
  };

  return {
    isOpen,
    modalId,
    labelId,
    descId,
    ariaModal,
    role,
    ariaLabelledBy,
    ariaDescribedBy,
    open,
    close,
  };
}

/**
 * ARIA 菜单 Hook
 */
export function useAriaMenu() {
  const isOpen = ref(false);
  const activeIndex = ref(-1);
  const menuId = ref(`menu-${Math.random().toString(36).substr(2, 9)}`);

  const role = computed(() => 'menu');
  const ariaExpanded = computed(() => isOpen.value.toString());
  const ariaActivedescendant = computed(() => 
    activeIndex.value >= 0 ? `${menuId.value}-item-${activeIndex.value}` : undefined
  );

  const open = () => {
    isOpen.value = true;
    activeIndex.value = 0;
  };

  const close = () => {
    isOpen.value = false;
    activeIndex.value = -1;
  };

  const setActiveIndex = (index: number) => {
    activeIndex.value = index;
  };

  return {
    isOpen,
    activeIndex,
    menuId,
    role,
    ariaExpanded,
    ariaActivedescendant,
    open,
    close,
    setActiveIndex,
  };
}

/**
 * ARIA 标签页 Hook
 */
export function useAriaTabs(initialTab = 0) {
  const activeTab = ref(initialTab);
  const tabsId = ref(`tabs-${Math.random().toString(36).substr(2, 9)}`);

  const getTabId = (index: number) => `${tabsId.value}-tab-${index}`;
  const getPanelId = (index: number) => `${tabsId.value}-panel-${index}`;

  const getTabAttrs = (index: number) => ({
    id: getTabId(index),
    role: 'tab',
    'aria-selected': (activeTab.value === index).toString(),
    'aria-controls': getPanelId(index),
    tabindex: activeTab.value === index ? 0 : -1,
  });

  const getPanelAttrs = (index: number) => ({
    id: getPanelId(index),
    role: 'tabpanel',
    'aria-labelledby': getTabId(index),
    hidden: activeTab.value !== index,
  });

  const setActiveTab = (index: number) => {
    activeTab.value = index;
  };

  return {
    activeTab,
    tabsId,
    getTabId,
    getPanelId,
    getTabAttrs,
    getPanelAttrs,
    setActiveTab,
  };
}

/**
 * ARIA 进度条 Hook
 */
export function useAriaProgress(initialValue = 0, max = 100) {
  const value = ref(initialValue);
  const maxValue = ref(max);

  const role = computed(() => 'progressbar');
  const ariaValuenow = computed(() => value.value);
  const ariaValuemin = computed(() => 0);
  const ariaValuemax = computed(() => maxValue.value);
  const ariaValuetext = computed(() => `${Math.round((value.value / maxValue.value) * 100)}%`);

  const setValue = (newValue: number) => {
    value.value = Math.max(0, Math.min(newValue, maxValue.value));
  };

  const setMax = (newMax: number) => {
    maxValue.value = newMax;
  };

  return {
    value,
    maxValue,
    role,
    ariaValuenow,
    ariaValuemin,
    ariaValuemax,
    ariaValuetext,
    setValue,
    setMax,
  };
}

/**
 * ARIA 通知 Hook
 */
export function useAriaAlert() {
  const message = ref('');
  const type = ref<'success' | 'error' | 'warning' | 'info'>('info');

  const role = computed(() => 'alert');
  const ariaLive = computed(() => type.value === 'error' ? 'assertive' : 'polite');

  const show = (text: string, alertType: typeof type.value = 'info') => {
    message.value = text;
    type.value = alertType;
  };

  const clear = () => {
    message.value = '';
  };

  return {
    message,
    type,
    role,
    ariaLive,
    show,
    clear,
  };
}
