/**
 * Encode palette thành URL hash
 */
export function encodePaletteToUrl(colors: string[]): string {
  // Loại bỏ ký tự # và join với dấu -
  const encoded = colors
    .map(color => color.replace('#', ''))
    .join('-');
  
  return `#${encoded}`;
}

/**
 * Decode URL hash thành palette colors
 */
export function decodePaletteFromUrl(hash: string): string[] {
  if (!hash || hash.length < 2) return [];
  
  // Bỏ ký tự # đầu tiên
  const encoded = hash.substring(1);
  
  // Split theo dấu - và thêm # vào trước mỗi màu
  const colors = encoded
    .split('-')
    .filter(color => color.length === 6) // Chỉ lấy hex colors hợp lệ
    .map(color => `#${color}`);
  
  return colors;
}

/**
 * Validate hex color format
 */
export function isValidHexColor(color: string): boolean {
  const hexRegex = /^#[0-9A-Fa-f]{6}$/;
  return hexRegex.test(color);
}

/**
 * Generate shareable URL với palette hiện tại
 */
export function generateShareUrl(colors: string[], baseUrl?: string): string {
  const validColors = colors.filter(isValidHexColor);
  if (validColors.length === 0) return baseUrl || window.location.origin;
  
  const hash = encodePaletteToUrl(validColors);
  const url = baseUrl || window.location.origin + window.location.pathname;
  
  return url + hash;
} 