export const formatCompactNumber = (value: number): string => {
  if (value >= 10000) {
    return `${(value / 10000).toFixed(1)}万`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }

  return `${value}`;
};

export const formatGrowth = (value: number): string => {
  if (value > 0) {
    return `+${value.toFixed(1)}%`;
  }

  if (value < 0) {
    return `${value.toFixed(1)}%`;
  }

  return '平稳';
};

export const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return '加载数据时发生错误，请稍后重试';
};
