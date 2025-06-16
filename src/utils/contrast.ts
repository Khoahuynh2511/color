import chroma from 'chroma-js';

/**
 * Tính toán contrast ratio giữa hai màu
 */
export function getContrastRatio(color1: string, color2: string): number {
  try {
    return chroma.contrast(color1, color2);
  } catch {
    return 1;
  }
}

/**
 * Lấy màu text (đen hoặc trắng) phù hợp với background
 */
export function getTextColor(backgroundColor: string): string {
  try {
    const bg = chroma(backgroundColor);
    const luminance = bg.luminance();
    
    // Sử dụng WCAG standard: > 0.5 = dark text, <= 0.5 = light text
    return luminance > 0.5 ? '#000000' : '#ffffff';
  } catch {
    return '#000000';
  }
}

/**
 * Kiểm tra xem màu text có đủ contrast không (WCAG AA standard)
 */
export function hasGoodContrast(textColor: string, backgroundColor: string): boolean {
  const ratio = getContrastRatio(textColor, backgroundColor);
  return ratio >= 4.5; // WCAG AA standard
}

/**
 * Lấy màu text tối ưu với contrast tốt nhất
 */
export function getOptimalTextColor(backgroundColor: string): string {
  const whiteContrast = getContrastRatio('#ffffff', backgroundColor);
  const blackContrast = getContrastRatio('#000000', backgroundColor);
  
  return whiteContrast > blackContrast ? '#ffffff' : '#000000';
} 