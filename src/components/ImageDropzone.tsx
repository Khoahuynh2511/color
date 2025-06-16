import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, Clipboard } from 'lucide-react';
import { cn } from '../lib/utils';

interface ImageDropzoneProps {
  onImageLoad: (imageSrc: string) => void;
  className?: string;
}

// Resize ảnh nếu quá lớn
function resizeImage(file: File, maxWidth: number = 1280): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new window.Image();
    
    img.onload = () => {
      const { width, height } = img;
      
      // Tính toán kích thước mới
      let newWidth = width;
      let newHeight = height;
      
      if (width > maxWidth) {
        newWidth = maxWidth;
        newHeight = (height * maxWidth) / width;
      }
      
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      ctx?.drawImage(img, 0, 0, newWidth, newHeight);
      
      // Convert thành data URL
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      resolve(dataUrl);
    };
    
    img.src = URL.createObjectURL(file);
  });
}

export function ImageDropzone({ onImageLoad, className }: ImageDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith('image/')) {
      try {
        const imageSrc = await resizeImage(file);
        onImageLoad(imageSrc);
      } catch (error) {
        console.error('Error processing image:', error);
      }
    }
  }, [onImageLoad]);

  const { getRootProps, getInputProps, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp']
    },
    multiple: false,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false)
  });

  // Handle paste từ clipboard
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            try {
              const imageSrc = await resizeImage(file);
              onImageLoad(imageSrc);
            } catch (error) {
              console.error('Error processing pasted image:', error);
            }
          }
          break;
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [onImageLoad]);

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200',
        'hover:border-primary hover:bg-primary/5',
        isDragAccept && 'border-green-500 bg-green-50 dark:bg-green-950',
        isDragReject && 'border-red-500 bg-red-50 dark:bg-red-950',
        isDragActive && 'scale-105',
        'border-gray-300 dark:border-gray-600',
        className
      )}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
          {isDragActive ? (
            <Upload className="w-8 h-8 text-primary animate-bounce" />
          ) : (
            <ImageIcon className="w-8 h-8 text-primary" />
          )}
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {isDragActive ? 'Thả ảnh vào đây!' : 'Tải ảnh lên'}
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            Kéo thả ảnh vào đây, click để chọn, hoặc
          </p>
          <div className="flex items-center justify-center mt-2 text-sm text-muted-foreground">
            <Clipboard className="w-4 h-4 mr-1" />
            <span>Ctrl+V để paste từ clipboard</span>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          Hỗ trợ: PNG, JPG, JPEG, GIF, BMP, WebP
        </div>
      </div>
    </div>
  );
} 