import { useEffect, useState } from 'react';
import { Loader2, Palette, AlertCircle } from 'lucide-react';
import { extractColorsFromImage, ExtractedColors } from '../utils/colorExtractor';

interface PaletteExtractorProps {
  imageSrc: string | null;
  onColorsExtracted: (colors: string[]) => void;
}

export function PaletteExtractor({ imageSrc, onColorsExtracted }: PaletteExtractorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedColors | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Thuật toán đơn giản để lấy thêm màu từ ảnh
  const extractAdditionalColors = (imageUrl: string): Promise<string[]> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            resolve([]);
            return;
          }

          // Resize nhỏ để xử lý nhanh
          const size = 100;
          canvas.width = size;
          canvas.height = size;
          
          ctx.drawImage(img, 0, 0, size, size);
          const imageData = ctx.getImageData(0, 0, size, size);
          const { data } = imageData;
          
          // Đếm màu đơn giản
          const colorCount = new Map<string, number>();
          
          // Lấy mỗi pixel thứ 10 để nhanh
          for (let i = 0; i < data.length; i += 40) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];
            
            if (a < 128) continue; // Bỏ qua pixel trong suốt
            
            // Làm tròn màu để group
            const rRounded = Math.round(r / 20) * 20;
            const gRounded = Math.round(g / 20) * 20;
            const bRounded = Math.round(b / 20) * 20;
            
            const colorKey = `rgb(${rRounded},${gRounded},${bRounded})`;
            colorCount.set(colorKey, (colorCount.get(colorKey) || 0) + 1);
          }
          
          // Lấy top 8 màu phổ biến
          const sortedColors = Array.from(colorCount.entries())
            .sort(([,a], [,b]) => b - a)
            .slice(0, 8)
            .map(([color]) => color);
          
          resolve(sortedColors);
        } catch {
          resolve([]);
        }
      };
      
      img.onerror = () => resolve([]);
      img.src = imageUrl;
    });
  };



  // Hàm tính khoảng cách màu đơn giản
  const getColorDistance = (color1: string, color2: string): number => {
    // Chuyển hex/rgb về RGB values
    const getRGB = (color: string) => {
      if (color.startsWith('#')) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return [r, g, b];
      } else if (color.startsWith('rgb')) {
        const matches = color.match(/\d+/g);
        return matches ? [parseInt(matches[0]), parseInt(matches[1]), parseInt(matches[2])] : [0, 0, 0];
      }
      return [0, 0, 0];
    };

    const [r1, g1, b1] = getRGB(color1);
    const [r2, g2, b2] = getRGB(color2);
    
    // Euclidean distance đơn giản
    return Math.sqrt(
      Math.pow(r1 - r2, 2) + 
      Math.pow(g1 - g2, 2) + 
      Math.pow(b1 - b2, 2)
    );
  };

  // Loại bỏ màu trùng lặp thông minh với ưu tiên
  const removeSimilarColors = (colors: string[], paletteColors: string[]): string[] => {
    const filtered: string[] = [];
    const minDistance = 40; // Khoảng cách tối thiểu giữa 2 màu
    
    // Sắp xếp theo độ ưu tiên: màu từ react-palette trước, rồi đến màu bổ sung
    const prioritizedColors = [
      ...paletteColors, // Ưu tiên màu từ react-palette
      ...colors.filter(color => !paletteColors.includes(color)) // Màu bổ sung
    ];
    
    for (const color of prioritizedColors) {
      // Kiểm tra xem màu này có quá gần với màu đã chọn không
      const isSimilar = filtered.some(existingColor => 
        getColorDistance(color, existingColor) < minDistance
      );
      
      if (!isSimilar) {
        filtered.push(color);
      }
    }
    
    return filtered;
  };

  // Extract màu bằng thuật toán mới
  useEffect(() => {
    if (!imageSrc) return;
    
    setLoading(true);
    setError(null);
    setIsProcessing(true);
    
    Promise.all([
      extractColorsFromImage(imageSrc),
      extractAdditionalColors(imageSrc)
    ])
    .then(([extracted, additional]) => {
      setExtractedData(extracted);
      
      // Màu từ thuật toán chính
      const paletteColors = [
        extracted.vibrant,
        extracted.darkVibrant,
        extracted.lightVibrant,
        extracted.muted,
        extracted.darkMuted,
        extracted.lightMuted
      ].filter((color): color is string => color !== null && color !== undefined);

      // Combine với màu bổ sung
      const allColors = [...paletteColors, ...additional];
      
      // Loại bỏ trùng lặp cơ bản trước
      const basicUnique = Array.from(new Set(allColors));
      
      // Loại bỏ màu tương tự
      const finalColors = removeSimilarColors(basicUnique, paletteColors);
      
      if (finalColors.length > 0) {
        onColorsExtracted(finalColors);
      }
      
      setLoading(false);
      setIsProcessing(false);
    })
    .catch((err) => {
      setError('Lỗi khi trích xuất màu');
      setLoading(false);
      setIsProcessing(false);
      console.error('Error extracting colors:', err);
    });
  }, [imageSrc, onColorsExtracted]);



  if (!imageSrc) {
    return null;
  }

  return (
    <div className="w-full">
      {(loading || isProcessing) && (
        <div className="flex items-center justify-center p-6 bg-card rounded-lg border">
          <Loader2 className="w-6 h-6 animate-spin text-primary mr-3" />
          <span className="text-foreground">
            Đang trích xuất bảng màu từ ảnh...
          </span>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center p-6 bg-destructive/10 rounded-lg border border-destructive/20">
          <AlertCircle className="w-6 h-6 text-destructive mr-3" />
          <span className="text-destructive">
            Lỗi khi trích xuất màu sắc. Vui lòng thử ảnh khác.
          </span>
        </div>
      )}

      {extractedData && !loading && !error && (
        <div className="flex items-center justify-center p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
          <Palette className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
          <span className="text-green-700 dark:text-green-300 text-sm">
            Đã trích xuất thành công màu sắc từ ảnh!
          </span>
        </div>
      )}
    </div>
  );
}