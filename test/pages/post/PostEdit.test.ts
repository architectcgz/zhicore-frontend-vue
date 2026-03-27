/* eslint-disable vue/one-component-per-file */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, reactive, ref, type Ref } from 'vue';
import PostEdit from '@/pages/post/PostEdit.vue';

const usePostEditContent = vi.fn();

vi.mock('@/composables/usePostEditContent', () => ({
  usePostEditContent: () => usePostEditContent(),
}));

vi.mock('@/components/common/LoadingSpinner.vue', () => ({
  default: defineComponent({
    name: 'LoadingSpinnerStub',
    template: '<div class="loading-spinner-stub">loading</div>',
  }),
}));

vi.mock('@/components/common/SiteErrorState.vue', () => ({
  default: defineComponent({
    name: 'SiteErrorStateStub',
    props: {
      message: {
        type: String,
        default: '',
      },
    },
    emits: ['retry'],
    template: '<div class="site-error-state-stub">{{ message }}<button class="retry-btn" @click="$emit(\'retry\')">retry</button></div>',
  }),
}));

vi.mock('@/components/post/editor/PostEditorHeader.vue', () => ({
  default: defineComponent({
    name: 'PostEditorHeaderStub',
    props: {
      title: {
        type: String,
        default: '',
      },
      primaryActionText: {
        type: String,
        default: '',
      },
      status: {
        type: String,
        default: '',
      },
      saving: {
        type: Boolean,
        default: false,
      },
      lastSaveTimeText: {
        type: String,
        default: '',
      },
    },
    emits: ['save-draft', 'primary-action', 'menu-command'],
    template: `
      <div class="post-editor-header-stub">
        <span class="save-time">{{ lastSaveTimeText }}</span>
        <button class="save-draft-btn" @click="$emit('save-draft')">save</button>
        <button class="primary-action-btn" @click="$emit('primary-action')">primary</button>
        <button class="menu-preview-btn" @click="$emit('menu-command', 'preview')">preview</button>
      </div>
    `,
  }),
}));

vi.mock('@/components/post/editor/PostEditorWorkspace.vue', () => ({
  default: defineComponent({
    name: 'PostEditorWorkspaceStub',
    props: {
      showPreview: {
        type: Boolean,
        default: true,
      },
    },
    emits: [
      'update:title',
      'update:content',
      'update:tags',
      'update:category-id',
      'tag-search',
      'content-change',
      'cover-upload',
      'cover-change',
      'cover-remove',
      'toggle-preview',
    ],
    methods: {
      emitCoverUpload() {
        this.$emit('cover-upload', new File(['cover'], 'cover.png', { type: 'image/png' }));
      },
    },
    template: `
      <div class="post-edit-shell-stub">
        <button class="title-update-btn" @click="$emit('update:title', '新标题')">title</button>
        <button class="content-update-btn" @click="$emit('update:content', '新内容')">content</button>
        <button class="tags-update-btn" @click="$emit('update:tags', ['Vue'])">tags</button>
        <button class="category-update-btn" @click="$emit('update:category-id', 'cat-1')">category</button>
        <button class="tag-search-btn" @click="$emit('tag-search', '前端')">search</button>
        <button class="content-change-btn" @click="$emit('content-change')">change</button>
        <button class="cover-upload-btn" @click="emitCoverUpload">cover upload</button>
        <button class="cover-change-btn" @click="$emit('cover-change')">cover change</button>
        <button class="cover-remove-btn" @click="$emit('cover-remove')">cover remove</button>
        <button class="toggle-preview-btn" @click="$emit('toggle-preview')">toggle</button>
      </div>
    `,
  }),
}));

const createContentState = () => ({
  post: ref<{ id: string; status: string } | null>({ id: 'post-1', status: 'DRAFT' }) as Ref<{
    id: string;
    status: string;
  } | null>,
  loading: ref(false),
  saving: ref(false),
  errorMessage: ref(''),
  autoSave: {
    lastSaveTime: ref(new Date('2024-01-01T10:00:00.000Z')),
  },
  formatSaveTime: vi.fn(() => '刚刚'),
  editorState: reactive({
    title: '旧标题',
    content: '旧内容',
    excerpt: '',
    coverImage: undefined,
    coverImageId: undefined,
    tags: [],
    categoryId: undefined,
    status: 'DRAFT',
  }),
  showPreview: ref(true),
  categories: ref([]),
  tagSearch: {
    suggestions: ref([]),
    loading: ref(false),
  },
  coverUploader: {
    uploading: ref(false),
    progress: ref(0),
  },
  editorImageUploader: {
    uploading: ref(false),
    progress: ref(0),
  },
  handleRetry: vi.fn(),
  handleTitleUpdate: vi.fn(),
  handleContentUpdate: vi.fn(),
  handleTagsUpdate: vi.fn(),
  handleCategoryUpdate: vi.fn(),
  handleContentChange: vi.fn(),
  handleTagSearch: vi.fn(),
  handleCoverUpload: vi.fn(),
  handleCoverChange: vi.fn(),
  handleCoverRemove: vi.fn(),
  handleImageUpload: vi.fn(),
  handleSaveDraft: vi.fn(),
  handlePublish: vi.fn(),
  handleUpdate: vi.fn(),
  handleMenuCommand: vi.fn(),
  togglePreview: vi.fn(),
});

describe('PostEdit 页面交互', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应显示加载态', () => {
    const state = createContentState();
    state.loading = ref(true);
    state.post = ref(null);
    usePostEditContent.mockReturnValue(state);

    const wrapper = mount(PostEdit);

    expect(wrapper.find('.loading-container').exists()).toBe(true);
    expect(wrapper.find('.loading-spinner-stub').exists()).toBe(true);
    expect(wrapper.text()).toContain('正在加载文章');
  });

  it('应显示错误态并支持重试', async () => {
    const state = createContentState();
    state.post = ref(null);
    state.errorMessage = ref('加载失败');
    usePostEditContent.mockReturnValue(state);

    const wrapper = mount(PostEdit);
    await wrapper.find('.retry-btn').trigger('click');

    expect(wrapper.find('.site-error-state-stub').exists()).toBe(true);
    expect(wrapper.text()).toContain('加载失败');
    expect(state.handleRetry).toHaveBeenCalledTimes(1);
  });

  it('应将头部和编辑区事件转发给 composable', async () => {
    const state = createContentState();
    usePostEditContent.mockReturnValue(state);

    const wrapper = mount(PostEdit);

    expect(wrapper.find('.post-editor-header-stub .save-time').text()).toBe('刚刚');

    await wrapper.find('.save-draft-btn').trigger('click');
    await wrapper.find('.primary-action-btn').trigger('click');
    await wrapper.find('.menu-preview-btn').trigger('click');
    await wrapper.find('.title-update-btn').trigger('click');
    await wrapper.find('.content-update-btn').trigger('click');
    await wrapper.find('.tags-update-btn').trigger('click');
    await wrapper.find('.category-update-btn').trigger('click');
    await wrapper.find('.tag-search-btn').trigger('click');
    await wrapper.find('.content-change-btn').trigger('click');
    await wrapper.find('.cover-upload-btn').trigger('click');
    await wrapper.find('.cover-change-btn').trigger('click');
    await wrapper.find('.cover-remove-btn').trigger('click');
    await wrapper.find('.toggle-preview-btn').trigger('click');

    expect(state.handleSaveDraft).toHaveBeenCalledTimes(1);
    expect(state.handlePublish).toHaveBeenCalledTimes(1);
    expect(state.handleUpdate).toHaveBeenCalledTimes(0);
    expect(state.handleMenuCommand).toHaveBeenCalledWith('preview');
    expect(state.handleTitleUpdate).toHaveBeenCalledWith('新标题');
    expect(state.handleContentUpdate).toHaveBeenCalledWith('新内容');
    expect(state.handleTagsUpdate).toHaveBeenCalledWith(['Vue']);
    expect(state.handleCategoryUpdate).toHaveBeenCalledWith('cat-1');
    expect(state.handleTagSearch).toHaveBeenCalledWith('前端');
    expect(state.handleContentChange).toHaveBeenCalledTimes(1);
    expect(state.handleCoverUpload).toHaveBeenCalledTimes(1);
    expect(state.handleCoverChange).toHaveBeenCalledTimes(1);
    expect(state.handleCoverRemove).toHaveBeenCalledTimes(1);
    expect(state.togglePreview).toHaveBeenCalledTimes(1);
  });
});
