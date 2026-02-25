/**
 * 颜色对比度检查脚本
 * 检查 CSS 变量中定义的颜色是否符合 WCAG AA 标准
 */


// 颜色转换和对比度计算函数
interface RGB {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): RGB | null {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  if (hex.length !== 6) return null;

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  return { r, g, b };
}

function getLuminance(rgb: RGB): number {
  const rsRGB = rgb.r / 255;
  const gsRGB = rgb.g / 255;
  const bsRGB = rgb.b / 255;

  const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getContrastRatio(color1: RGB, color2: RGB): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

// 定义需要检查的颜色组合
interface ColorPair {
  name: string;
  foreground: string;
  background: string;
  minRatio: number; // 最小对比度要求
}

const colorPairs: ColorPair[] = [
  // 亮色主题
  {
    name: '亮色主题 - 主要文本',
    foreground: '#18181B', // --color-primary
    background: '#FFFFFF', // --color-bg-primary (light)
    minRatio: 4.5,
  },
  {
    name: '亮色主题 - 次要文本',
    foreground: '#3F3F46', // --color-secondary
    background: '#FFFFFF',
    minRatio: 4.5,
  },
  {
    name: '亮色主题 - CTA 按钮文本',
    foreground: '#FFFFFF',
    background: '#2563EB', // --color-cta
    minRatio: 4.5,
  },
  {
    name: '亮色主题 - 链接',
    foreground: '#2563EB',
    background: '#FFFFFF',
    minRatio: 4.5,
  },
  {
    name: '亮色主题 - 成功文本',
    foreground: '#047857',  // 调整后的颜色
    background: '#FFFFFF',
    minRatio: 4.5,
  },
  {
    name: '亮色主题 - 警告文本',
    foreground: '#b45309',  // 调整后的颜色
    background: '#FFFFFF',
    minRatio: 4.5,
  },
  {
    name: '亮色主题 - 错误文本',
    foreground: '#dc2626',  // 调整后的颜色
    background: '#FFFFFF',
    minRatio: 4.5,
  },
  
  // 暗色主题
  {
    name: '暗色主题 - 主要文本',
    foreground: '#F4F4F5', // --color-text-primary (dark)
    background: '#18181B', // --color-bg-primary (dark)
    minRatio: 4.5,
  },
  {
    name: '暗色主题 - 次要文本',
    foreground: '#A1A1AA', // --color-text-secondary (dark)
    background: '#18181B',
    minRatio: 4.5,
  },
  {
    name: '暗色主题 - CTA 按钮文本',
    foreground: '#FFFFFF',
    background: '#2563EB',
    minRatio: 4.5,
  },
  {
    name: '暗色主题 - 链接',
    foreground: '#60A5FA', // 亮蓝色
    background: '#18181B',
    minRatio: 4.5,
  },
];

// 检查对比度
function checkColorPairs() {
  console.log('🎨 检查颜色对比度...\n');

  let passCount = 0;
  let failCount = 0;
  const failures: string[] = [];

  colorPairs.forEach(pair => {
    const fgRgb = hexToRgb(pair.foreground);
    const bgRgb = hexToRgb(pair.background);

    if (!fgRgb || !bgRgb) {
      console.error(`❌ ${pair.name}: 无效的颜色值`);
      failCount++;
      return;
    }

    const ratio = getContrastRatio(fgRgb, bgRgb);
    const passed = ratio >= pair.minRatio;

    if (passed) {
      console.log(`✅ ${pair.name}`);
      console.log(`   对比度: ${ratio.toFixed(2)}:1 (要求: ${pair.minRatio}:1)`);
      passCount++;
    } else {
      console.log(`❌ ${pair.name}`);
      console.log(`   对比度: ${ratio.toFixed(2)}:1 (要求: ${pair.minRatio}:1)`);
      console.log(`   前景色: ${pair.foreground}`);
      console.log(`   背景色: ${pair.background}`);
      failCount++;
      failures.push(pair.name);
    }
    console.log('');
  });

  // 总结
  console.log('━'.repeat(50));
  console.log(`\n📊 检查结果:`);
  console.log(`   总计: ${colorPairs.length} 个颜色组合`);
  console.log(`   通过: ${passCount} 个 ✅`);
  console.log(`   失败: ${failCount} 个 ❌\n`);

  if (failures.length > 0) {
    console.log('⚠️  以下颜色组合不符合 WCAG AA 标准:');
    failures.forEach(name => console.log(`   - ${name}`));
    console.log('');
    process.exit(1);
  } else {
    console.log('🎉 所有颜色组合都符合 WCAG AA 标准！\n');
    process.exit(0);
  }
}

// 运行检查
checkColorPairs();
