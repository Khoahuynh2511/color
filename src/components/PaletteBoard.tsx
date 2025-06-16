
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Swatch } from './Swatch';
import { Trash2, GripVertical } from 'lucide-react';
import { cn } from '../lib/utils';

interface PaletteBoardProps {
  colors: string[];
  onColorsReorder: (colors: string[]) => void;
  onColorRemove?: (index: number) => void;
  onColorCopy?: (color: string) => void;
  className?: string;
}

interface SortableSwatchProps {
  color: string;
  id: string;
  onRemove?: () => void;
  onCopy?: (color: string) => void;
}

function SortableSwatch({ color, id, onRemove, onCopy }: SortableSwatchProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative group',
        isDragging && 'z-50 opacity-50'
      )}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1 right-1 z-10 w-6 h-6 bg-black/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-3 h-3 text-white" />
      </div>

      {/* Remove button */}
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-1 left-1 z-10 w-6 h-6 bg-red-500/80 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
        >
          <Trash2 className="w-3 h-3 text-white" />
        </button>
      )}

      <Swatch
        color={color}
        size="md"
        onCopy={onCopy}
        className="transition-transform duration-200"
      />
    </div>
  );
}

export function PaletteBoard({
  colors,
  onColorsReorder,
  onColorRemove,
  onColorCopy,
  className
}: PaletteBoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = colors.findIndex((_, index) => index.toString() === active.id);
      const newIndex = colors.findIndex((_, index) => index.toString() === over?.id);
      
      const newColors = arrayMove(colors, oldIndex, newIndex);
      onColorsReorder(newColors);
    }
  }

  const handleRemove = (index: number) => {
    if (onColorRemove) {
      onColorRemove(index);
    }
  };

  if (colors.length === 0) {
    return (
      <div className={cn(
        "flex items-center justify-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg",
        className
      )}>
        <p className="text-muted-foreground text-center">
          Chưa có màu nào. Hãy tải ảnh lên để bắt đầu!
        </p>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={colors.map((_, index) => index.toString())}
          strategy={rectSortingStrategy}
        >
          <div className="palette-grid">
            {colors.map((color, index) => (
              <SortableSwatch
                key={`${color}-${index}`}
                id={index.toString()}
                color={color}
                onRemove={() => handleRemove(index)}
                onCopy={onColorCopy}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
} 