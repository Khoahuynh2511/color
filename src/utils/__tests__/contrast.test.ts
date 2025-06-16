import { describe, it, expect } from 'vitest';
import { getContrastRatio, getTextColor, hasGoodContrast, getOptimalTextColor } from '../contrast';

describe('contrast utils', () => {
  describe('getContrastRatio', () => {
    it('should return contrast ratio between black and white', () => {
      const ratio = getContrastRatio('#000000', '#ffffff');
      expect(ratio).toBe(21); // Maximum contrast ratio
    });

    it('should return 1 for same colors', () => {
      const ratio = getContrastRatio('#ff0000', '#ff0000');
      expect(ratio).toBe(1);
    });

    it('should handle invalid colors gracefully', () => {
      const ratio = getContrastRatio('invalid', '#ffffff');
      expect(ratio).toBe(1);
    });
  });

  describe('getTextColor', () => {
    it('should return white text for dark backgrounds', () => {
      const textColor = getTextColor('#000000');
      expect(textColor).toBe('#ffffff');
    });

    it('should return black text for light backgrounds', () => {
      const textColor = getTextColor('#ffffff');
      expect(textColor).toBe('#000000');
    });

    it('should handle invalid colors gracefully', () => {
      const textColor = getTextColor('invalid');
      expect(textColor).toBe('#000000');
    });
  });

  describe('hasGoodContrast', () => {
    it('should return true for good contrast combinations', () => {
      const goodContrast = hasGoodContrast('#000000', '#ffffff');
      expect(goodContrast).toBe(true);
    });

    it('should return false for poor contrast combinations', () => {
      const poorContrast = hasGoodContrast('#888888', '#999999');
      expect(poorContrast).toBe(false);
    });
  });

  describe('getOptimalTextColor', () => {
    it('should return the color with better contrast', () => {
      // For a very dark background, white should be optimal
      const textColor = getOptimalTextColor('#000000');
      expect(textColor).toBe('#ffffff');
      
      // For a very light background, black should be optimal
      const textColor2 = getOptimalTextColor('#ffffff');
      expect(textColor2).toBe('#000000');
    });
  });
}); 