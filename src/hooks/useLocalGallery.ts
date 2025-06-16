import { useState, useEffect } from 'react';

export interface PaletteItem {
  id: string;
  name: string;
  colors: string[];
  createdAt: number;
  pinned?: boolean;
}

const STORAGE_KEY = 'color-palette-gallery';

// Adjectives và nouns để tạo tên random
const adjectives = [
  'Sunset', 'Ocean', 'Forest', 'Mountain', 'Desert', 'Aurora', 'Cosmic', 'Vintage',
  'Modern', 'Pastel', 'Vibrant', 'Muted', 'Bold', 'Soft', 'Warm', 'Cool',
  'Elegant', 'Rustic', 'Fresh', 'Deep', 'Bright', 'Dark', 'Light', 'Rich'
];

const nouns = [
  'Glow', 'Dream', 'Wave', 'Breeze', 'Storm', 'Mist', 'Fire', 'Ice',
  'Bloom', 'Shadow', 'Dawn', 'Dusk', 'Rain', 'Snow', 'Sun', 'Moon',
  'Star', 'Cloud', 'Sky', 'Earth', 'Wind', 'Stone', 'Garden', 'Valley'
];

function generateRandomName(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj} ${noun}`;
}

// Kiểm tra localStorage availability
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__';
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

export function useLocalGallery() {
  const [gallery, setGallery] = useState<PaletteItem[]>([]);
  const [isStorageAvailable] = useState(isLocalStorageAvailable());

  // Load từ localStorage khi component mount
  useEffect(() => {
    if (!isStorageAvailable) {
      console.warn('localStorage not available, gallery will not persist');
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setGallery(parsed);
        } else {
          console.warn('Invalid gallery data format, resetting');
          setGallery([]);
        }
      }
    } catch (error) {
      console.error('Error loading gallery from localStorage:', error);
      setGallery([]);
      // Try to clear corrupted data
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        console.error('Failed to clear corrupted data:', e);
      }
    }
  }, [isStorageAvailable]);

  // Save vào localStorage khi gallery thay đổi
  useEffect(() => {
    if (!isStorageAvailable || gallery.length === 0 && !localStorage.getItem(STORAGE_KEY)) {
      return; // Không save nếu localStorage không khả dụng hoặc gallery empty và chưa có data
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gallery));
    } catch (error) {
      console.error('Error saving gallery to localStorage:', error);
      // Thử xóa data cũ nếu hết storage space
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.warn('Storage quota exceeded, trying to clear space');
        try {
          // Giữ lại chỉ 10 items gần nhất
          const trimmedGallery = gallery.slice(0, 10);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedGallery));
          setGallery(trimmedGallery);
        } catch (e) {
          console.error('Failed to trim gallery:', e);
        }
      }
    }
  }, [gallery, isStorageAvailable]);

  // Thêm palette mới
  const addPalette = (colors: string[], customName?: string): PaletteItem | null => {
    try {
      if (!colors || colors.length === 0) {
        console.warn('Cannot add palette: no colors provided');
        return null;
      }

      const newItem: PaletteItem = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        name: customName || generateRandomName(),
        colors: [...colors],
        createdAt: Date.now(),
        pinned: false
      };

      setGallery(prev => [newItem, ...prev]);
      return newItem;
    } catch (error) {
      console.error('Error adding palette:', error);
      return null;
    }
  };

  // Xóa palette
  const removePalette = (id: string) => {
    setGallery(prev => prev.filter(item => item.id !== id));
  };

  // Update palette
  const updatePalette = (id: string, updates: Partial<PaletteItem>) => {
    setGallery(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  // Pin/unpin palette
  const togglePin = (id: string) => {
    setGallery(prev => prev.map(item => 
      item.id === id ? { ...item, pinned: !item.pinned } : item
    ));
  };

  // Sắp xếp gallery (pinned trước, sau đó theo thời gian)
  const sortedGallery = [...gallery].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.createdAt - a.createdAt;
  });

  // Clear toàn bộ gallery
  const clearGallery = () => {
    setGallery([]);
  };

  return {
    gallery: sortedGallery,
    addPalette,
    removePalette,
    updatePalette,
    togglePin,
    clearGallery,
    totalCount: gallery.length
  };
} 