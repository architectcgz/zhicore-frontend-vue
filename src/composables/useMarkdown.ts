/**
 * Markdown 处理组合式函数
 * 提供 Markdown 渲染、语法高亮、内容清理等功能
 */
import { ref, nextTick } from 'vue';
import MarkdownIt from 'markdown-it';
import DOMPurify from 'dompurify';

// Markdown-it 实例配置
const md = new MarkdownIt({
  html: false, // 禁用原始 HTML（安全考虑）
  linkify: true, // 自动识别链接
  typographer: true, // 启用智能引号和其他排版功能
  breaks: true, // 将换行符转换为 <br>
});

// 配置 DOMPurify 安全选项
const purifyConfig = {
  ALLOWED_TAGS: [
    // 基础文本标签
    'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre',
    // 标题标签
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    // 列表标签
    'ul', 'ol', 'li',
    // 其他标签
    'blockquote', 'a', 'img', 'hr',
    // 表格标签
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    // 语法高亮需要的标签
    'span', 'div',
  ],
  ALLOWED_ATTR: [
    'href', 'src', 'alt', 'title', 'class', 'style',
    'target', 'rel', 'width', 'height',
  ],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  ALLOW_DATA_ATTR: false,
  ALLOW_UNKNOWN_PROTOCOLS: false,
};

// 语法高亮状态
const isHighlightLoaded = ref(false);
type ShikiThemeName = 'github-light' | 'github-dark';

type MarkdownHighlighter = {
  codeToHtml: (code: string, options: { lang: string; theme: ShikiThemeName }) => string;
};

const SHIKI_LANGUAGE_ALIASES: Record<string, string> = {
  react: 'jsx',
  js: 'javascript',
  ts: 'typescript',
  py: 'python',
  yml: 'yaml',
  docker: 'dockerfile',
  sh: 'shellscript',
  shell: 'shellscript',
  bash: 'shellscript',
};

let highlighter: MarkdownHighlighter | null = null;

const normalizeCodeLanguage = (language: string): string => {
  const normalized = language.toLowerCase();
  return SHIKI_LANGUAGE_ALIASES[normalized] ?? normalized;
};

const loadHighlighter = async (): Promise<MarkdownHighlighter> => {
  if (highlighter) {
    return highlighter;
  }

  // Avoid `import('shiki')`, which pulls Shiki's full language/theme bundle into the build.
  const [
    { createHighlighterCore },
    { createOnigurumaEngine },
    { default: getWasmInstance },
    { default: githubLight },
    { default: githubDark },
    { default: javascript },
    { default: jsx },
    { default: typescript },
    { default: tsx },
    { default: html },
    { default: css },
    { default: scss },
    { default: less },
    { default: vue },
    { default: json },
    { default: markdown },
    { default: shellscript },
    { default: python },
    { default: java },
    { default: go },
    { default: rust },
    { default: cpp },
    { default: c },
    { default: csharp },
    { default: php },
    { default: ruby },
    { default: sql },
    { default: yaml },
    { default: xml },
    { default: dockerfile },
  ] = await Promise.all([
    import('shiki/core'),
    import('shiki/engine/oniguruma'),
    import('shiki/wasm'),
    import('@shikijs/themes/github-light'),
    import('@shikijs/themes/github-dark'),
    import('@shikijs/langs/javascript'),
    import('@shikijs/langs/jsx'),
    import('@shikijs/langs/typescript'),
    import('@shikijs/langs/tsx'),
    import('@shikijs/langs/html'),
    import('@shikijs/langs/css'),
    import('@shikijs/langs/scss'),
    import('@shikijs/langs/less'),
    import('@shikijs/langs/vue'),
    import('@shikijs/langs/json'),
    import('@shikijs/langs/markdown'),
    import('@shikijs/langs/shellscript'),
    import('@shikijs/langs/python'),
    import('@shikijs/langs/java'),
    import('@shikijs/langs/go'),
    import('@shikijs/langs/rust'),
    import('@shikijs/langs/cpp'),
    import('@shikijs/langs/c'),
    import('@shikijs/langs/csharp'),
    import('@shikijs/langs/php'),
    import('@shikijs/langs/ruby'),
    import('@shikijs/langs/sql'),
    import('@shikijs/langs/yaml'),
    import('@shikijs/langs/xml'),
    import('@shikijs/langs/dockerfile'),
  ]);

  highlighter = await createHighlighterCore({
    themes: [githubLight, githubDark],
    langs: [
      ...javascript,
      ...jsx,
      ...typescript,
      ...tsx,
      ...html,
      ...css,
      ...scss,
      ...less,
      ...vue,
      ...json,
      ...markdown,
      ...shellscript,
      ...python,
      ...java,
      ...go,
      ...rust,
      ...cpp,
      ...c,
      ...csharp,
      ...php,
      ...ruby,
      ...sql,
      ...yaml,
      ...xml,
      ...dockerfile,
    ],
    engine: await createOnigurumaEngine(getWasmInstance),
  });
  isHighlightLoaded.value = true;

  return highlighter;
};

/**
 * Markdown 处理组合式函数
 */
export function useMarkdown() {
  /**
   * 渲染 Markdown 为 HTML
   */
  const renderMarkdown = (content: string): string => {
    if (!content.trim()) {
      return '';
    }

    try {
      // 1. 渲染 Markdown 为 HTML
      const html = md.render(content);
      
      // 2. 清理 HTML（防止 XSS 攻击）
      const cleanHtml = DOMPurify.sanitize(html, purifyConfig);
      
      return cleanHtml;
    } catch (error) {
      console.error('Markdown 渲染失败:', error);
      return '<p>内容渲染失败</p>';
    }
  };

  /**
   * 异步加载并应用语法高亮
   */
  const highlightCodeBlocks = async (): Promise<void> => {
    try {
      // 查找所有未高亮的代码块
      const codeBlocks = document.querySelectorAll('pre code:not(.highlighted)');
      
      if (codeBlocks.length === 0) {
        return;
      }

      // 懒加载 Shiki 高亮器
      if (!highlighter) {
        await loadHighlighter();
      }

      // 使用 Intersection Observer 实现懒加载高亮
      const observer = new IntersectionObserver(
        async (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              const codeBlock = entry.target as HTMLElement;
              await highlightCodeBlock(codeBlock);
              observer.unobserve(codeBlock);
            }
          }
        },
        {
          rootMargin: '100px', // 提前 100px 开始加载
          threshold: 0.1,
        }
      );

      // 观察所有代码块
      codeBlocks.forEach(block => observer.observe(block));
    } catch (error) {
      console.error('语法高亮加载失败:', error);
    }
  };

  /**
   * 高亮单个代码块
   */
  const highlightCodeBlock = async (codeBlock: HTMLElement): Promise<void> => {
    if (!highlighter || codeBlock.classList.contains('highlighted')) {
      return;
    }

    try {
      // 获取语言和代码内容
      const language = normalizeCodeLanguage(getLanguageFromClassName(codeBlock.className) || 'text');
      const code = codeBlock.textContent || '';

      // 获取当前主题
      const isDark = document.documentElement.classList.contains('dark') ||
                    window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = isDark ? 'github-dark' : 'github-light';

      // 高亮代码
      const html = highlighter.codeToHtml(code, {
        lang: language,
        theme: theme,
      });

      // 提取高亮后的内容
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      const highlightedCode = tempDiv.querySelector('code');

      if (highlightedCode) {
        // 替换原始代码块内容
        codeBlock.innerHTML = highlightedCode.innerHTML;
        codeBlock.classList.add('highlighted');
        codeBlock.classList.add(`language-${language}`);
      }
    } catch (error) {
      console.error(`代码块高亮失败 (${codeBlock.className}):`, error);
      // 高亮失败时仍然标记为已处理，避免重复尝试
      codeBlock.classList.add('highlighted');
    }
  };

  /**
   * 从 className 中提取语言
   */
  const getLanguageFromClassName = (className: string): string | null => {
    const match = className.match(/language-(\w+)/);
    return match ? match[1] : null;
  };

  /**
   * 生成文章摘要
   */
  const generateExcerpt = (content: string, maxLength: number = 200): string => {
    if (!content.trim()) {
      return '';
    }

    // 移除 Markdown 标记，提取纯文本
    const plainText = content
      .replace(/[#*`_~[\]()]/g, '') // 移除 Markdown 符号
      .replace(/!\[.*?\]\(.*?\)/g, '') // 移除图片
      .replace(/\[.*?\]\(.*?\)/g, '') // 移除链接
      .replace(/```[\s\S]*?```/g, '') // 移除代码块
      .replace(/`.*?`/g, '') // 移除行内代码
      .replace(/\n+/g, ' ') // 替换换行为空格
      .replace(/\s+/g, ' ') // 合并多个空格
      .trim();

    // 截取指定长度
    return plainText.length > maxLength 
      ? plainText.substring(0, maxLength) + '...' 
      : plainText;
  };

  /**
   * 计算阅读时间（分钟）
   */
  const calculateReadingTime = (content: string): number => {
    if (!content.trim()) {
      return 0;
    }

    // 移除 Markdown 标记，计算字数
    const plainText = content
      .replace(/[#*`_~[\]()]/g, '')
      .replace(/!\[.*?\]\(.*?\)/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`.*?`/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // 中文字符数
    const chineseChars = (plainText.match(/[\u4e00-\u9fa5]/g) || []).length;
    // 英文单词数
    const englishWords = plainText.replace(/[\u4e00-\u9fa5]/g, '').split(/\s+/).filter(word => word.length > 0).length;

    // 中文按 300 字/分钟，英文按 200 词/分钟计算
    const readingTime = Math.ceil((chineseChars / 300) + (englishWords / 200));
    
    return Math.max(1, readingTime); // 至少 1 分钟
  };

  /**
   * 提取文章目录
   */
  const extractToc = (content: string): Array<{ level: number; title: string; anchor: string }> => {
    const toc: Array<{ level: number; title: string; anchor: string }> = [];
    
    // 匹配标题行
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const title = match[2].trim();
      const anchor = title
        .toLowerCase()
        .replace(/[^\w\u4e00-\u9fa5\s-]/g, '') // 移除特殊字符
        .replace(/\s+/g, '-') // 空格替换为连字符
        .replace(/-+/g, '-') // 合并多个连字符
        .replace(/^-|-$/g, ''); // 移除首尾连字符

      toc.push({ level, title, anchor });
    }

    return toc;
  };

  /**
   * 清理 HTML 内容
   */
  const sanitizeHtml = (html: string): string => {
    return DOMPurify.sanitize(html, purifyConfig);
  };

  /**
   * 检查是否为有效的 Markdown 内容
   */
  const isValidMarkdown = (content: string): boolean => {
    if (!content.trim()) {
      return false;
    }

    // 检查是否包含 Markdown 语法
    const markdownPatterns = [
      /^#{1,6}\s+/, // 标题
      /\*\*.*?\*\*/, // 粗体
      /\*.*?\*/, // 斜体
      /`.*?`/, // 行内代码
      /```[\s\S]*?```/, // 代码块
      /^\s*[-*+]\s+/m, // 无序列表
      /^\s*\d+\.\s+/m, // 有序列表
      /^\s*>\s+/m, // 引用
      /\[.*?\]\(.*?\)/, // 链接
      /!\[.*?\]\(.*?\)/, // 图片
    ];

    return markdownPatterns.some(pattern => pattern.test(content));
  };

  return {
    renderMarkdown,
    highlightCodeBlocks,
    generateExcerpt,
    calculateReadingTime,
    extractToc,
    sanitizeHtml,
    isValidMarkdown,
    isHighlightLoaded,
  };
}

/**
 * 主题切换时重新高亮代码块
 */
export function useMarkdownTheme() {
  const refreshHighlight = async () => {
    if (!isHighlightLoaded.value) {
      return;
    }

    // 移除所有高亮标记
    const highlightedBlocks = document.querySelectorAll('pre code.highlighted');
    highlightedBlocks.forEach(block => {
      block.classList.remove('highlighted');
    });

    // 等待 DOM 更新
    await nextTick();

    // 重新高亮
    const { highlightCodeBlocks } = useMarkdown();
    await highlightCodeBlocks();
  };

  return {
    refreshHighlight,
  };
}
