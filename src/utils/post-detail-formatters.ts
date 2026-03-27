export const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}万`;
  }

  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }

  return num.toString();
};

export const formatDate = (dateString?: string): string => {
  if (!dateString) {
    return '日期待补充';
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return '日期待补充';
  }

  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const getPostDetailErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return '加载文章时发生错误，请稍后重试';
};
