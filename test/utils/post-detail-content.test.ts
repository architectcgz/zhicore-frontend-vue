import { describe, expect, it } from 'vitest';
import type { Post } from '@/types';
import {
  buildArticlePresentation,
  extractPlainText,
  getPostPreview,
  getPostReadingMinutes,
} from '@/utils/post-detail-content';

const createPost = (overrides: Partial<Post> = {}): Post => ({
  id: 'post-1',
  title: '文章标题',
  content: '# Heading\n\n正文内容',
  htmlContent: '<h2>Heading</h2><p>正文内容</p>',
  excerpt: '',
  author: {
    id: 'user-1',
    nickname: '作者',
    username: 'author',
    email: 'author@example.com',
    avatar: '',
    bio: '',
    role: 'USER',
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  tags: [],
  status: 'PUBLISHED',
  viewCount: 0,
  likeCount: 0,
  commentCount: 0,
  favoriteCount: 0,
  isLiked: false,
  isFavorited: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

describe('post-detail-content utils', () => {
  it('应提取纯文本并压缩空白', () => {
    expect(extractPlainText('<p>Hello</p><p>  Vue   World </p>')).toBe('Hello Vue World');
  });

  it('应为文章构建目录并注入锚点', () => {
    const result = buildArticlePresentation(
      '<h2>概览</h2><h3>细节</h3><h2>概览</h2>',
      (value) => value
    );

    expect(result.toc).toEqual([
      { level: 2, title: '概览', anchor: '概览' },
      { level: 3, title: '细节', anchor: '细节' },
      { level: 2, title: '概览', anchor: '概览-2' },
    ]);
    expect(result.html).toContain('id="概览"');
    expect(result.html).toContain('id="概览-2"');
    expect(result.html).toContain('article-heading-anchor');
  });

  it('应优先使用摘要，否则退化为正文摘录', () => {
    const withExcerpt = createPost({ excerpt: '已提供摘要' });
    const withoutExcerpt = createPost({
      excerpt: '',
      htmlContent: '<p>这是正文内容，会被截取为摘要。</p>',
    });

    expect(getPostPreview(withExcerpt, () => '不会被调用')).toBe('已提供摘要');
    expect(
      getPostPreview(withoutExcerpt, (value, maxLength = 0) => `${value.slice(0, maxLength)}...`)
    ).toBe('这是正文内容，会被截取为摘要。...');
  });

  it('应使用阅读时长计算函数计算相关文章时长', () => {
    const post = createPost({ content: '12345' });

    expect(getPostReadingMinutes(post, (value) => value.length)).toBe(5);
  });
});
