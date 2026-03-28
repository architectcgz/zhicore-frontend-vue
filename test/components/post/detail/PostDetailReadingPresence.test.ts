import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PostDetailReadingPresence from '@/components/post/detail/PostDetailReadingPresence.vue';

describe('PostDetailReadingPresence', () => {
  it('renders reading count and up to three non-clickable avatars', () => {
    const wrapper = mount(PostDetailReadingPresence, {
      props: {
        defaultAvatar: '/images/default-avatar.svg',
        presence: {
          readingCount: 5,
          avatars: [
            { userId: '1', nickname: '读者一', avatarUrl: 'https://cdn.example/1.png' },
            { userId: '2', nickname: '读者二', avatarUrl: 'https://cdn.example/2.png' },
            { userId: '3', nickname: '读者三', avatarUrl: 'https://cdn.example/3.png' },
          ],
        },
      },
    });

    expect(wrapper.find('.reading-presence__count').text()).toBe('5 人在读');
    expect(wrapper.findAll('img')).toHaveLength(3);
    expect(wrapper.findAll('a')).toHaveLength(0);
    expect(wrapper.text()).toContain('5 人在读');
  });

  it('falls back to the default avatar when image loading fails', async () => {
    const wrapper = mount(PostDetailReadingPresence, {
      props: {
        defaultAvatar: '/images/default-avatar.svg',
        presence: {
          readingCount: 1,
          avatars: [
            { userId: '1', nickname: '读者一', avatarUrl: 'https://cdn.example/broken.png' },
          ],
        },
      },
    });

    const avatar = wrapper.find('img');
    await avatar.trigger('error');

    expect(avatar.attributes('src')).toContain('/images/default-avatar.svg');
  });
});
