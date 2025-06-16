import { useEffect, useRef, useState } from 'react';
import { Pipette, Copy, Check } from 'lucide-react';

interface ColorPickerProps {
  imageSrc: string | null;
  onColorPicked?: (color: string) => void;
}

export function ColorPicker({ imageSrc, onColorPicked }: ColorPickerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [currentColor, setCurrentColor] = useState<string>('');
  const [currentRgb, setCurrentRgb] = useState<string>('');
  const [currentHsl, setCurrentHsl] = useState<string>('');
  const [pixelPosition, setPixelPosition] = useState<{ x: number; y: number } | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

  // Chuyển đổi RGB sang Hex
  const rgbToHex = (r: number, g: number, b: number): string => {
    const toHex = (n: number) => {
      const hex = n.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // Chuyển đổi RGB sang HSL
  const rgbToHsl = (r: number, g: number, b: number): string => {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  };

  // Load ảnh vào canvas
  useEffect(() => {
    if (!imageSrc || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const image = new Image();

    image.crossOrigin = 'anonymous';
    image.onload = () => {
      if (!ctx) return;

      // Tính toán kích thước hiển thị
      const maxWidth = 600;
      const maxHeight = 400;
      let { width, height } = image;

      // Scale ảnh nếu quá lớn
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;
      
      ctx.drawImage(image, 0, 0, width, height);
      setIsLoaded(true);
    };

    image.onerror = () => {
      console.error('Không thể load ảnh cho color picker');
      setIsLoaded(false);
    };

    image.src = imageSrc;
    imageRef.current = image;
  }, [imageSrc]);

  // Xử lý di chuyển chuột trên canvas
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !isLoaded) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((event.clientX - rect.left) * scaleX);
    const y = Math.floor((event.clientY - rect.top) * scaleY);

    // Đảm bảo tọa độ trong phạm vi canvas
    if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
      const imageData = ctx.getImageData(x, y, 1, 1);
      const [r, g, b, a] = imageData.data;

      if (a > 0) { // Chỉ hiển thị nếu pixel không trong suốt
        const hexColor = rgbToHex(r, g, b);
        const rgbColor = `rgb(${r}, ${g}, ${b})`;
        const hslColor = rgbToHsl(r, g, b);
        
        setCurrentColor(hexColor);
        setCurrentRgb(rgbColor);
        setCurrentHsl(hslColor);
        setPixelPosition({ x, y });
        setMousePosition({ 
          x: event.clientX - rect.left, 
          y: event.clientY - rect.top 
        });
      }
    }
  };

  // Xử lý rời chuột khỏi canvas
  const handleMouseLeave = () => {
    setMousePosition(null);
    setPixelPosition(null);
    setCurrentColor('');
    setCurrentRgb('');
    setCurrentHsl('');
  };

  // Xử lý click để chọn màu
  const handleClick = (_: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentColor && onColorPicked) {
      onColorPicked(currentColor);
    }
  };

  // Xử lý double-click để copy màu
  const handleDoubleClick = async (_: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentColor) {
      await copyColor();
    }
  };

  // Copy màu vào clipboard
  const copyColor = async () => {
    if (!currentColor) return;
    
    try {
      await navigator.clipboard.writeText(currentColor);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Không thể copy màu:', err);
    }
  };

  if (!imageSrc) {
    return (
      <div className="flex items-center justify-center p-8 bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/25">
        <div className="text-center">
          <Pipette className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            Tải ảnh lên để sử dụng color picker
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Pipette className="w-4 h-4" />
        <span>Di chuyển chuột để xem màu • Click để chọn • Double-click để copy</span>
      </div>

      <div className="relative inline-block">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          className="border rounded-lg cursor-crosshair shadow-lg"
          style={{ maxWidth: '100%', height: 'auto' }}
        />

        {/* Tooltip hiển thị màu */}
        {mousePosition && currentColor && (
          <div
            className="absolute z-10 pointer-events-none"
            style={{
              left: mousePosition.x + 15,
              top: mousePosition.y - 60,
              transform: mousePosition.x > 500 ? 'translateX(-100%)' : 'none'
            }}
          >
            <div className="bg-background border border-border rounded-lg shadow-lg p-3 flex items-center gap-3">
              {/* Ô màu preview */}
              <div
                className="w-8 h-8 rounded border-2 border-border flex-shrink-0"
                style={{ backgroundColor: currentColor }}
              />
              
              {/* Thông tin màu */}
              <div className="flex flex-col gap-1">
                <div className="text-sm font-mono font-semibold">
                  {currentColor}
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  {currentRgb}
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  {currentHsl}
                </div>
                {pixelPosition && (
                  <div className="text-xs text-muted-foreground">
                    Pixel: ({pixelPosition.x}, {pixelPosition.y})
                  </div>
                )}
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  {copied ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Đã copy!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Double-click để copy</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hiển thị màu hiện tại */}
      {currentColor && (
        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
          <div
            className="w-8 h-8 rounded border-2 border-border flex-shrink-0"
            style={{ backgroundColor: currentColor }}
          />
          <div className="flex-1">
            <div className="font-mono text-sm font-semibold">{currentColor}</div>
            <div className="font-mono text-xs text-muted-foreground">{currentRgb}</div>
            <div className="font-mono text-xs text-muted-foreground">{currentHsl}</div>
            {pixelPosition && (
              <div className="text-xs text-muted-foreground mt-1">
                📍 Pixel: ({pixelPosition.x}, {pixelPosition.y})
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground px-3 py-2">
            {copied ? (
              <>
                <Check className="w-3 h-3 text-green-500" />
                <span className="text-green-600">Đã copy!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Double-click trên ảnh</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 