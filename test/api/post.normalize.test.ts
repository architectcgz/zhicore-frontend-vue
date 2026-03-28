import { describe, expect, it } from 'vitest';
import { normalizePost } from '@/api/post';

describe('normalizePost', () => {
  it('maps tags and category when backend summary provides them', () => {
    const post = normalizePost({
      id: 'post-1',
      title: 'Posts list page',
      excerpt: 'summary',
      ownerId: 'user-1',
      ownerName: 'Alice',
      ownerAvatar: '/avatar.png',
      tags: [
        { id: 'tag-1', name: 'Vue', slug: 'vue' },
        { id: 'tag-2', name: 'TypeScript', slug: 'typescript' },
      ],
      categoryId: 'cat-1',
      categoryName: 'Frontend',
      categorySlug: 'frontend',
    });

    expect(post.tags).toHaveLength(2);
    expect(post.tags[0]).toMatchObject({
      id: 'tag-1',
      name: 'Vue',
      slug: 'vue',
    });
    expect(post.category).toMatchObject({
      id: 'cat-1',
      name: 'Frontend',
      slug: 'frontend',
    });
  });
});
