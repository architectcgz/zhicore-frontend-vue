import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PostListFilter from '@/components/post/PostListFilter.vue';

describe('PostListFilter', () => {
  it('emits merged filter state when sort, tags, or time range changes', async () => {
    const wrapper = mount(PostListFilter, {
      props: {
        sort: 'latest',
        tagIds: [],
        timeRange: 'all',
        availableTags: [
          { id: 'tag-1', name: 'Vue', slug: 'vue', postCount: 1, createdAt: '', updatedAt: '' },
          { id: 'tag-2', name: 'TypeScript', slug: 'typescript', postCount: 1, createdAt: '', updatedAt: '' },
        ],
      },
    });

    await wrapper.get('[data-test="sort-popular"]').trigger('click');
    await wrapper.get('[data-test="tag-select"]').setValue(['tag-1']);
    await wrapper.get('[data-test="time-range"]').setValue('week');

    expect(wrapper.emitted('change')?.at(-1)?.[0]).toEqual({
      sort: 'popular',
      tagIds: ['tag-1'],
      timeRange: 'week',
    });
  });
});
