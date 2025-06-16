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

export function useLocalGallery() {
  const [gallery, setGallery] = useState<PaletteItem[]>([]);

  // Load từ localStorage khi component mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setGallery(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error('Error loading gallery from localStorage:', error);
      setGallery([]);
    }
  }, []);

  // Save vào localStorage khi gallery thay đổi
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gallery));
    } catch (error) {
      console.error('Error saving gallery to localStorage:', error);
    }
  }, [gallery]);

  // Thêm palette mới
  const addPalette = (colors: string[], customName?: string): PaletteItem => {
    const newItem: PaletteItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: customName || generateRandomName(),
      colors: [...colors],
      createdAt: Date.now(),
      pinned: false
    };

    setGallery(prev => [newItem, ...prev]);
    return newItem;
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