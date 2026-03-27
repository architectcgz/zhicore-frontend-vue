import type { Post } from '@/types';
import type { TocItem } from '@/types/post/detail';

export interface ArticlePresentation {
  html: string;
  toc: TocItem[];
}

const slugifyHeading = (value: string): string => {
  return value
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

export const extractPlainText = (value: string): string => {
  if (!value.trim()) {
    return '';
  }

  if (typeof DOMParser === 'undefined') {
    return value
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(value, 'text/html');
  return doc.body.textContent?.replace(/\s+/g, ' ').trim() ?? '';
};

export const buildArticlePresentation = (
  rawHtml: string,
  sanitizeHtml: (value: string) => string
): ArticlePresentation => {
  const cleanHtml = sanitizeHtml(rawHtml);

  if (!cleanHtml.trim() || typeof DOMParser === 'undefined') {
    return {
      html: cleanHtml,
      toc: [],
    };
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(cleanHtml, 'text/html');
  const toc: TocItem[] = [];
  const anchorCounter = new Map<string, number>();
  const headings = Array.from(doc.body.querySelectorAll('h2, h3'));

  headings.forEach((heading, index) => {
    const title = heading.textContent?.trim();

    if (!title) {
      return;
    }

    const baseAnchor = slugifyHeading(title) || `section-${index + 1}`;
    const currentCount = anchorCounter.get(baseAnchor) ?? 0;
    anchorCounter.set(baseAnchor, currentCount + 1);

    const anchor = currentCount === 0 ? baseAnchor : `${baseAnchor}-${currentCount + 1}`;
    heading.id = anchor;
    heading.classList.add('article-heading-anchor');

    toc.push({
      level: Number.parseInt(heading.tagName.slice(1), 10),
      title,
      anchor,
    });
  });

  return {
    html: doc.body.innerHTML,
    toc,
  };
};

export const getPostPreview = (
  entry: Post,
  generateExcerpt: (value: string, maxLength?: number) => string
): string => {
  if (entry.excerpt?.trim()) {
    return entry.excerpt;
  }

  const plainText = extractPlainText(entry.htmlContent || entry.content || '');

  if (!plainText) {
    return '继续阅读这篇内容，查看完整观点与上下文。';
  }

  return generateExcerpt(plainText, 88);
};

export const getPostReadingMinutes = (
  entry: Post,
  calculateReadingTime: (value: string) => number
): number => calculateReadingTime(entry.content || entry.excerpt || '');
