/**
 * 颜色对比度检查工具
 * 基于 WCAG 2.1 标准检查颜色对比度
 */

/**
 * RGB 颜色接口
 */
interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * 对比度等级
 */
export enum ContrastLevel {
  AAA = 'AAA', // 7:1 (正常文本) 或 4.5:1 (大文本)
  AA = 'AA',   // 4.5:1 (正常文本) 或 3:1 (大文本)
  FAIL = 'FAIL', // 不符合标准
}

/**
 * 对比度检查结果
 */
export interface ContrastResult {
  ratio: number;
  level: ContrastLevel;
  normalText: {
    aa: boolean;
    aaa: boolean;
  };
  largeText: {
    aa: boolean;
    aaa: boolean;
  };
}

/**
 * 将十六进制颜色转换为 RGB
 */
export function hexToRgb(hex: string): RGB | null {
  // 移除 # 号
  hex = hex.replace(/^#/, '');

  // 支持简写形式 (#RGB)
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }

  if (hex.length !== 6) {
    return null;
  }

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return null;
  }

  return { r, g, b };
}

/**
 * 将 RGB 颜色转换为相对亮度
 * 基于 WCAG 2.1 公式
 */
export function getLuminance(rgb: RGB): number {
  // 将 RGB 值转换为 0-1 范围
  const rsRGB = rgb.r / 255;
  const gsRGB = rgb.g / 255;
  const bsRGB = rgb.b / 255;

  // 应用 gamma 校正
  const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  // 计算相对亮度
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * 计算两个颜色之间的对比度
 * 基于 WCAG 2.1 公式
 */
export function getContrastRatio(color1: RGB, color2: RGB): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * 检查对比度是否符合 WCAG 标准
 */
export function checkContrast(foreground: string, background: string): ContrastResult | null {
  const fgRgb = hexToRgb(foreground);
  const bgRgb = hexToRgb(background);

  if (!fgRgb || !bgRgb) {
    return null;
  }

  const ratio = getContrastRatio(fgRgb, bgRgb);

  // WCAG 2.1 标准
  // 正常文本：AA = 4.5:1, AAA = 7:1
  // 大文本（18pt+ 或 14pt+ 粗体）：AA = 3:1, AAA = 4.5:1
  const normalTextAA = ratio >= 4.5;
  const normalTextAAA = ratio >= 7;
  const largeTextAA = ratio >= 3;
  const largeTextAAA = ratio >= 4.5;

  let level: ContrastLevel;
  if (normalTextAAA) {
    level = ContrastLevel.AAA;
  } else if (normalTextAA) {
    level = ContrastLevel.AA;
  } else {
    level = ContrastLevel.FAIL;
  }

  return {
    ratio: Math.round(ratio * 100) / 100,
    level,
    normalText: {
      aa: normalTextAA,
      aaa: normalTextAAA,
    },
    largeText: {
      aa: largeTextAA,
      aaa: largeTextAAA,
    },
  };
}

/**
 * 获取建议的前景色
 * 如果对比度不足，返回调整后的颜色
 */
export function getSuggestedForeground(
  foreground: string,
  background: string,
  targetRatio = 4.5
): string | null {
  const fgRgb = hexToRgb(foreground);
  const bgRgb = hexToRgb(background);

  if (!fgRgb || !bgRgb) {
    return null;
  }

  const currentRatio = getContrastRatio(fgRgb, bgRgb);

  if (currentRatio >= targetRatio) {
    return foreground; // 已经符合标准
  }

  // 判断背景是亮色还是暗色
  const bgLuminance = getLuminance(bgRgb);
  const isLightBackground = bgLuminance > 0.5;

  // 如果背景是亮色，使前景色更暗；反之亦然
  let adjustedRgb: RGB;
  if (isLightBackground) {
    // 使前景色更暗
    const factor = Math.sqrt(targetRatio / currentRatio);
    adjustedRgb = {
      r: Math.max(0, Math.floor(fgRgb.r / factor)),
      g: Math.max(0, Math.floor(fgRgb.g / factor)),
      b: Math.max(0, Math.floor(fgRgb.b / factor)),
    };
  } else {
    // 使前景色更亮
    const factor = Math.sqrt(targetRatio / currentRatio);
    adjustedRgb = {
      r: Math.min(255, Math.floor(fgRgb.r * factor)),
      g: Math.min(255, Math.floor(fgRgb.g * factor)),
      b: Math.min(255, Math.floor(fgRgb.b * factor)),
    };
  }

  // 转换回十六进制
  return rgbToHex(adjustedRgb);
}

/**
 * 将 RGB 转换为十六进制
 */
export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * 检查 CSS 变量的对比度
 */
export function checkCssVariableContrast(
  foregroundVar: string,
  backgroundVar: string
): ContrastResult | null {
  const root = document.documentElement;
  const foreground = getComputedStyle(root).getPropertyValue(foregroundVar).trim();
  const background = getComputedStyle(root).getPropertyValue(backgroundVar).trim();

  if (!foreground || !background) {
    return null;
  }

  return checkContrast(foreground, background);
}

/**
 * 批量检查颜色对比度
 */
export interface ColorPair {
  name: string;
  foreground: string;
  background: string;
}

export interface BatchCheckResult {
  pair: ColorPair;
  result: ContrastResult | null;
}

export function batchCheckContrast(pairs: ColorPair[]): BatchCheckResult[] {
  return pairs.map(pair => ({
    pair,
    result: checkContrast(pair.foreground, pair.background),
  }));
}

/**
 * 生成对比度报告
 */
export function generateContrastReport(results: BatchCheckResult[]): string {
  let report = '# 颜色对比度检查报告\n\n';
  report += `检查时间: ${new Date().toLocaleString()}\n\n`;

  const passed = results.filter(r => r.result && r.result.level !== ContrastLevel.FAIL);
  const failed = results.filter(r => !r.result || r.result.level === ContrastLevel.FAIL);

  report += `## 总结\n\n`;
  report += `- 总计: ${results.length} 个颜色组合\n`;
  report += `- 通过: ${passed.length} 个\n`;
  report += `- 失败: ${failed.length} 个\n\n`;

  if (failed.length > 0) {
    report += `## 不符合标准的颜色组合\n\n`;
    failed.forEach(({ pair, result }) => {
      report += `### ${pair.name}\n`;
      report += `- 前景色: ${pair.foreground}\n`;
      report += `- 背景色: ${pair.background}\n`;
      if (result) {
        report += `- 对比度: ${result.ratio}:1\n`;
        report += `- 等级: ${result.level}\n`;
      } else {
        report += `- 错误: 无法计算对比度\n`;
      }
      report += `\n`;
    });
  }

  if (passed.length > 0) {
    report += `## 符合标准的颜色组合\n\n`;
    passed.forEach(({ pair, result }) => {
      if (result) {
        report += `### ${pair.name}\n`;
        report += `- 前景色: ${pair.foreground}\n`;
        report += `- 背景色: ${pair.background}\n`;
        report += `- 对比度: ${result.ratio}:1\n`;
        report += `- 等级: ${result.level}\n`;
        report += `\n`;
      }
    });
  }

  return report;
}

/**
 * 在开发环境中检查颜色对比度
 */
export function devCheckContrast() {
  if (import.meta.env.DEV) {
    // 定义需要检查的颜色组合
    const colorPairs: ColorPair[] = [
      {
        name: '主要文本',
        foreground: getComputedStyle(document.documentElement).getPropertyValue('--color-text-primary').trim(),
        background: getComputedStyle(document.documentElement).getPropertyValue('--color-bg-primary').trim(),
      },
      {
        name: '次要文本',
        foreground: getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary').trim(),
        background: getComputedStyle(document.documentElement).getPropertyValue('--color-bg-primary').trim(),
      },
      {
        name: 'CTA 按钮',
        foreground: '#FFFFFF',
        background: getComputedStyle(document.documentElement).getPropertyValue('--color-cta').trim(),
      },
      {
        name: '链接',
        foreground: getComputedStyle(document.documentElement).getPropertyValue('--color-cta').trim(),
        background: getComputedStyle(document.documentElement).getPropertyValue('--color-bg-primary').trim(),
      },
    ];

    const results = batchCheckContrast(colorPairs);
    const report = generateContrastReport(results);

    console.group('🎨 颜色对比度检查');
    console.log(report);
    console.groupEnd();

    // 如果有失败的组合，在控制台警告
    const failed = results.filter(r => !r.result || r.result.level === ContrastLevel.FAIL);
    if (failed.length > 0) {
      console.warn(`⚠️ 发现 ${failed.length} 个不符合 WCAG AA 标准的颜色组合`);
    }
  }
}
