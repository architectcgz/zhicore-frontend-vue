import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ProfileCollectionPanelShell from '@/components/user/profile/ProfileCollectionPanelShell.vue';

describe('ProfileCollectionPanelShell', () => {
  it('does not render load more when the list is empty even if hasMore is true', () => {
    const wrapper = mount(ProfileCollectionPanelShell, {
      props: {
        loading: false,
        error: '',
        listLength: 0,
        hasMore: true,
        loadingMore: false,
        loadingText: 'loading',
        errorTitle: 'error',
        emptyTitle: 'empty',
        emptyDescription: 'empty description',
        emptyIcon: '',
      },
    });

    expect(wrapper.find('.empty-content').exists()).toBe(true);
    expect(wrapper.find('.load-more').exists()).toBe(false);
  });

  it('renders load more when there are items and more pages are available', () => {
    const wrapper = mount(ProfileCollectionPanelShell, {
      props: {
        loading: false,
        error: '',
        listLength: 2,
        hasMore: true,
        loadingMore: false,
        loadingText: 'loading',
        errorTitle: 'error',
        emptyTitle: 'empty',
        emptyDescription: 'empty description',
        emptyIcon: '',
      },
      slots: {
        default: '<div class="list-slot">items</div>',
      },
    });

    expect(wrapper.find('.list-slot').exists()).toBe(true);
    expect(wrapper.find('.load-more').exists()).toBe(true);
  });
});
