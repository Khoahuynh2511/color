import React from 'react';
import chroma from 'chroma-js';

interface ShadeGeneratorProps {
  baseColors: string[];
  onShadesGenerated: (allShades: string[]) => void;
}

/**
 * Tạo 5 shade từ màu gốc (bao gồm cả màu gốc)
 */
function generateShades(baseColor: string): string[] {
  try {
    // Tạo scale từ màu gốc đến trắng với 5 bước
    const scale = chroma.scale([baseColor, '#ffffff']).mode('lch').colors(5);
    return scale;
  } catch (error) {
    console.error('Error generating shades for color:', baseColor, error);
    return [baseColor]; // Fallback về màu gốc nếu có lỗi
  }
}

export function ShadeGenerator({ baseColors, onShadesGenerated }: ShadeGeneratorProps) {
  React.useEffect(() => {
    if (baseColors.length === 0) return;

    const allShades: string[] = [];
    
    baseColors.forEach(baseColor => {
      const shades = generateShades(baseColor);
      allShades.push(...shades);
    });

    // Loại bỏ màu trùng lặp
    const uniqueShades = Array.from(new Set(allShades));
    
    onShadesGenerated(uniqueShades);
  }, [baseColors, onShadesGenerated]);

  // Component này không render gì, chỉ xử lý logic
  return null;
} 