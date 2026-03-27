import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, nextTick, type ComponentPublicInstance } from 'vue';
import { ElMessage } from 'element-plus';
import { usePostCreateContent } from '@/composables/usePostCreateContent';

const routerPush = vi.fn();
const createPostMutateAsync = vi.fn();
const saveDraftMutateAsync = vi.fn();
const fetchHotTags = vi.fn();
const searchTagSuggestions = vi.fn();
const startAutoSave = vi.fn();
const stopAutoSave = vi.fn();
const triggerDebouncedSave = vi.fn();

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: routerPush,
  }),
}));

vi.mock('element-plus', () => ({
  ElMessage: {
    warning: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('@/composables/usePost', () => ({
  usePost: () => ({
    createPost: {
      mutateAsync: createPostMutateAsync,
    },
    saveDraft: {
      mutateAsync: saveDraftMutateAsync,
    },
    isSaving: { value: false },
  }),
  useTagSearch: () => ({
    loading: { value: false },
    suggestions: { value: ['Vue', 'TypeScript'] },
    fetchHotTags,
    searchTagSuggestions,
  }),
  useAutoSave: () => ({
    isSaving: { value: false },
    lastSaveTime: { value: null },
    saveError: { value: null },
    save: vi.fn(),
    startAutoSave,
    stopAutoSave,
    triggerDebouncedSave,
    reset: vi.fn(),
  }),
}));

vi.mock('@/composables/useImageUpload', () => ({
  useImageUpload: () => ({
    uploadImage: vi.fn(),
    uploading: { value: false },
    progress: { value: 0 },
  }),
}));

type HarnessVm = ComponentPublicInstance & ReturnType<typeof usePostCreateContent>;

const createWrapper = () =>
  mount(
    defineComponent({
      name: 'UsePostCreateContentHarness',
      setup() {
        return usePostCreateContent();
      },
      template: '<div />',
    })
  );

describe('usePostCreateContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createPostMutateAsync.mockResolvedValue({ id: 'published-post' });
    saveDraftMutateAsync.mockResolvedValue({ id: 'draft-post' });
  });

  it('挂载后应初始化标签和自动保存，卸载时停止自动保存', () => {
    const wrapper = createWrapper();

    expect(fetchHotTags).toHaveBeenCalledTimes(1);
    expect(startAutoSave).toHaveBeenCalledTimes(1);

    wrapper.unmount();

    expect(stopAutoSave).toHaveBeenCalledTimes(1);
  });

  it('保存草稿前应校验标题', async () => {
    const wrapper = createWrapper();
    const vm = wrapper.vm as unknown as HarnessVm;

    await vm.handleSaveDraft();

    expect(ElMessage.warning).toHaveBeenCalledWith('请输入文章标题');
    expect(saveDraftMutateAsync).not.toHaveBeenCalled();
  });

  it('输入标题和内容后应保存草稿并跳转编辑页', async () => {
    const wrapper = createWrapper();
    const vm = wrapper.vm as unknown as HarnessVm;

    vm.handleTitleUpdate('草稿标题');
    vm.handleContentUpdate('# 草稿内容\n正文**加粗**');
    await nextTick();

    await vm.handleSaveDraft();
    await flushPromises();

    expect(saveDraftMutateAsync).toHaveBeenCalledWith({
      title: '草稿标题',
      content: '# 草稿内容\n正文**加粗**',
      excerpt: '草稿内容 正文加粗',
      coverImageId: undefined,
      tags: [],
      categoryId: undefined,
      status: 'DRAFT',
    });
    expect(routerPush).toHaveBeenCalledWith('/posts/draft-post/edit');
  });

  it('发布前应校验正文内容', async () => {
    const wrapper = createWrapper();
    const vm = wrapper.vm as unknown as HarnessVm;

    vm.handleTitleUpdate('待发布标题');
    await nextTick();

    await vm.handlePublish();

    expect(ElMessage.warning).toHaveBeenCalledWith('请输入文章内容');
    expect(createPostMutateAsync).not.toHaveBeenCalled();
  });

  it('输入标题和内容后应发布文章并跳转详情页', async () => {
    const wrapper = createWrapper();
    const vm = wrapper.vm as unknown as HarnessVm;

    vm.handleTitleUpdate('发布标题');
    vm.handleContentUpdate('发布内容');
    await nextTick();

    await vm.handlePublish();
    await flushPromises();

    expect(createPostMutateAsync).toHaveBeenCalledWith({
      title: '发布标题',
      content: '发布内容',
      excerpt: '发布内容',
      coverImageId: undefined,
      tags: [],
      categoryId: undefined,
      status: 'PUBLISHED',
    });
    expect(routerPush).toHaveBeenCalledWith('/posts/published-post');
  });

  it('标题和正文变化时应触发防抖自动保存', async () => {
    const wrapper = createWrapper();
    const vm = wrapper.vm as unknown as HarnessVm;

    vm.handleTitleUpdate('自动保存标题');
    vm.handleContentChange();
    vm.handleContentUpdate('自动保存内容');
    vm.handleContentChange();

    expect(triggerDebouncedSave).toHaveBeenCalledTimes(2);
  });
});
