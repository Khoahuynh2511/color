/**
 * Xuất mảng màu thành SCSS variables
 */
export function exportToScss(colors: string[], prefix: string = 'color'): string {
  const scssLines = colors.map((color, index) => {
    const variableName = `$${prefix}-${index + 1}`;
    return `${variableName}: ${color};`;
  });

  const header = `// Generated Color Palette - ${new Date().toLocaleDateString()}\n// Total colors: ${colors.length}\n\n`;
  
  return header + scssLines.join('\n') + '\n';
}

/**
 * Xuất theo tên màu semantic
 */
export function exportToScssWithNames(
  colorData: Array<{ color: string; name?: string }>,
  prefix: string = 'color'
): string {
  const scssLines = colorData.map((item, index) => {
    const colorName = item.name || `${prefix}-${index + 1}`;
    const variableName = `$${colorName.toLowerCase().replace(/\s+/g, '-')}`;
    return `${variableName}: ${item.color};`;
  });

  const header = `// Generated Color Palette - ${new Date().toLocaleDateString()}\n// Total colors: ${colorData.length}\n\n`;
  
  return header + scssLines.join('\n') + '\n';
} 