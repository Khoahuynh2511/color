/**
 * Xuất mảng màu thành CSS custom properties
 */
export function exportToCssVars(colors: string[], prefix: string = 'color'): string {
  const cssLines = colors.map((color, index) => {
    const variableName = `--${prefix}-${index + 1}`;
    return `  ${variableName}: ${color};`;
  });

  const header = `/* Generated Color Palette - ${new Date().toLocaleDateString()} */\n/* Total colors: ${colors.length} */\n\n:root {\n`;
  const footer = `}\n`;
  
  return header + cssLines.join('\n') + '\n' + footer;
}

/**
 * Xuất theo tên màu semantic
 */
export function exportToCssVarsWithNames(
  colorData: Array<{ color: string; name?: string }>,
  prefix: string = 'color'
): string {
  const cssLines = colorData.map((item, index) => {
    const colorName = item.name || `${prefix}-${index + 1}`;
    const variableName = `--${colorName.toLowerCase().replace(/\s+/g, '-')}`;
    return `  ${variableName}: ${item.color};`;
  });

  const header = `/* Generated Color Palette - ${new Date().toLocaleDateString()} */\n/* Total colors: ${colorData.length} */\n\n:root {\n`;
  const footer = `}\n`;
  
  return header + cssLines.join('\n') + '\n' + footer;
} 