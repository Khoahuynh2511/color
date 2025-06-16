import { useState } from 'react';
import { useLocalGallery, PaletteItem } from '../hooks/useLocalGallery';
import { Swatch } from './Swatch';
import { Trash2, Pin, PinOff, Plus, FolderOpen, Edit2, Check, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface GalleryProps {
  currentColors: string[];
  onLoadPalette: (colors: string[]) => void;
  className?: string;
}

interface PaletteCardProps {
  palette: PaletteItem;
  onLoad: () => void;
  onRemove: () => void;
  onTogglePin: () => void;
  onRename: (newName: string) => void;
}

function PaletteCard({ palette, onLoad, onRemove, onTogglePin, onRename }: PaletteCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(palette.name);

  const handleSaveEdit = () => {
    if (editName.trim()) {
      onRename(editName.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(palette.name);
    setIsEditing(false);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        {isEditing ? (
          <div className="flex items-center space-x-2 flex-1">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="flex-1 text-sm font-medium bg-background border border-border rounded px-2 py-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEdit();
                if (e.key === 'Escape') handleCancelEdit();
              }}
              autoFocus
            />
            <button
              onClick={handleSaveEdit}
              className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={handleCancelEdit}
              className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium text-foreground">{palette.name}</h3>
              {palette.pinned && <Pin className="w-3 h-3 text-yellow-500" />}
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded"
                title="Đổi tên"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button
                onClick={onTogglePin}
                className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded"
                title={palette.pinned ? "Bỏ ghim" : "Ghim"}
              >
                {palette.pinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
              </button>
              <button
                onClick={onRemove}
                className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                title="Xóa"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Mini Palette */}
      <div className="grid grid-cols-6 gap-1 mb-3">
        {palette.colors.map((color, index) => (
          <Swatch
            key={index}
            color={color}
            size="sm"
            showHex={false}
            className="w-8 h-8"
          />
        ))}
      </div>

      {/* Info */}
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
        <span>{palette.colors.length} màu</span>
        <span>{new Date(palette.createdAt).toLocaleDateString('vi-VN')}</span>
      </div>

      {/* Load Button */}
      <button
        onClick={onLoad}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-md py-2 text-sm font-medium transition-colors"
      >
        Tải palette này
      </button>
    </div>
  );
}

export function Gallery({ currentColors, onLoadPalette, className }: GalleryProps) {
  const { gallery, addPalette, removePalette, updatePalette, togglePin, clearGallery, totalCount } = useLocalGallery();

  const handleSaveCurrent = () => {
    if (currentColors.length > 0) {
      addPalette(currentColors);
    }
  };

  const handleLoadPalette = (palette: PaletteItem) => {
    onLoadPalette(palette.colors);
  };

  const handleRemovePalette = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa palette này?')) {
      removePalette(id);
    }
  };

  const handleTogglePin = (id: string) => {
    togglePin(id);
  };

  const handleRenamePalette = (id: string, newName: string) => {
    updatePalette(id, { name: newName });
  };

  const handleClearAll = () => {
    if (confirm('Bạn có chắc muốn xóa toàn bộ gallery? Hành động này không thể hoàn tác.')) {
      clearGallery();
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FolderOpen className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">
            Gallery ({totalCount})
          </h2>
        </div>
        
        <div className="flex space-x-2">
          {/* Save Current */}
          {currentColors.length > 0 && (
            <button
              onClick={handleSaveCurrent}
              className="flex items-center space-x-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-3 py-1 rounded-md text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Lưu hiện tại</span>
            </button>
          )}
          
          {/* Clear All */}
          {totalCount > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center space-x-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 px-3 py-1 rounded-md text-sm"
            >
              <Trash2 className="w-4 h-4" />
              <span>Xóa tất cả</span>
            </button>
          )}
        </div>
      </div>

      {/* Gallery Grid */}
      {gallery.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Chưa có palette nào được lưu.</p>
          <p className="text-sm mt-1">Tạo bảng màu và nhấn "Lưu hiện tại" để bắt đầu!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gallery.map((palette) => (
            <PaletteCard
              key={palette.id}
              palette={palette}
              onLoad={() => handleLoadPalette(palette)}
              onRemove={() => handleRemovePalette(palette.id)}
              onTogglePin={() => handleTogglePin(palette.id)}
              onRename={(newName) => handleRenamePalette(palette.id, newName)}
            />
          ))}
        </div>
      )}
    </div>
  );
} 