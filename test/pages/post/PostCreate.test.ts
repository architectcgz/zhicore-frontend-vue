/* eslint-disable vue/one-component-per-file */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, reactive, ref } from 'vue';
import PostCreate from '@/pages/post/PostCreate.vue';

const usePostCreateContent = vi.fn();

vi.mock('@/composables/usePostCreateContent', () => ({
  usePostCreateContent: () => usePostCreateContent(),
}));

vi.mock('@/components/post/editor/PostEditorHeader.vue', () => ({
  default: defineComponent({
    name: 'PostEditorHeaderStub',
    props: {
      title: {
        type: String,
        default: '',
      },
      saving: {
        type: Boolean,
        default: false,
      },
      primaryActionText: {
        type: String,
        default: '',
      },
      lastSaveTimeText: {
        type: String,
        default: '',
      },
    },
    emits: ['save-draft', 'primary-action'],
    template: `
      <div class="post-editor-header-stub">
        <span class="save-time">{{ lastSaveTimeText }}</span>
        <button class="save-draft-btn" @click="$emit('save-draft')">save</button>
        <button class="primary-action-btn" @click="$emit('primary-action')">publish</button>
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
      <div class="post-create-shell-stub">
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
  autoSave: {
    lastSaveTime: ref(new Date('2024-01-01T10:00:00.000Z')),
  },
  saving: ref(false),
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
  togglePreview: vi.fn(),
  formatSaveTime: vi.fn(() => '刚刚'),
});

describe('PostCreate 页面装配', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应渲染头部保存时间', () => {
    const state = createContentState();
    usePostCreateContent.mockReturnValue(state);

    const wrapper = mount(PostCreate);

    expect(wrapper.find('.post-editor-header-stub .save-time').text()).toBe('刚刚');
    expect(state.formatSaveTime).toHaveBeenCalledTimes(1);
  });

  it('应将头部和编辑器事件转发给 composable', async () => {
    const state = createContentState();
    usePostCreateContent.mockReturnValue(state);

    const wrapper = mount(PostCreate);

    await wrapper.find('.save-draft-btn').trigger('click');
    await wrapper.find('.primary-action-btn').trigger('click');
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
