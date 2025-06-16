import { useState, useEffect } from 'react';
import { ImageDropzone } from './components/ImageDropzone';
import { PaletteExtractor } from './components/PaletteExtractor';
import { ColorPicker } from './components/ColorPicker';
import { ShadeGenerator } from './components/ShadeGenerator';
import { PaletteBoard } from './components/PaletteBoard';
import { ExportPanel } from './components/ExportPanel';
import { Gallery } from './components/Gallery';
import { useLocalGallery } from './hooks/useLocalGallery';
import { decodePaletteFromUrl } from './utils/urlEncoder';
import { Moon, Sun, Palette as PaletteIcon } from 'lucide-react';
import { cn } from './lib/utils';

function App() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [finalColors, setFinalColors] = useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'generator' | 'gallery'>('generator');
  
  const { addPalette } = useLocalGallery();

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark' || 
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    setIsDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  // Load palette from URL hash on mount
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const colorsFromUrl = decodePaletteFromUrl(hash);
      if (colorsFromUrl.length > 0) {
        setFinalColors(colorsFromUrl);
      }
    }
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    document.documentElement.classList.toggle('dark', newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
  };

  const handleImageLoad = (src: string) => {
    setImageSrc(src);
  };

  const handleColorsExtracted = (colors: string[]) => {
    setExtractedColors(colors);
  };

  const handleShadesGenerated = (allShades: string[]) => {
    setFinalColors(allShades);
  };

  const handleColorsReorder = (colors: string[]) => {
    setFinalColors(colors);
  };

  const handleColorRemove = (index: number) => {
    const newColors = finalColors.filter((_, i) => i !== index);
    setFinalColors(newColors);
  };

  const handleColorCopy = (color: string) => {
    console.log('Color copied:', color);
  };

  const handleColorPicked = (color: string) => {
    // Thêm màu được chọn vào palette
    if (!finalColors.includes(color)) {
      setFinalColors(prev => [...prev, color]);
    }
  };

  const handleLoadPalette = (colors: string[]) => {
    setFinalColors(colors);
    setActiveTab('generator');
    
    // Clear current image to show the loaded palette
    setImageSrc(null);
    setExtractedColors([]);
  };

  const handleSavePalette = (colors: string[]) => {
    addPalette(colors);
    // Chuyển sang tab Gallery để user thấy palette vừa lưu
    setActiveTab('gallery');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <PaletteIcon className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Color Palette Generator</h1>
                <p className="text-sm text-muted-foreground">Trích xuất và tạo bảng màu từ ảnh</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Tab Navigation */}
              <nav className="flex space-x-1 bg-muted p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('generator')}
                  className={cn(
                    "px-3 py-1 text-sm font-medium rounded-md transition-colors",
                    activeTab === 'generator'
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Generator
                </button>
                <button
                  onClick={() => setActiveTab('gallery')}
                  className={cn(
                    "px-3 py-1 text-sm font-medium rounded-md transition-colors",
                    activeTab === 'gallery'
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Gallery
                </button>
              </nav>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md hover:bg-muted transition-colors"
                title={isDarkMode ? "Chuyển sang light mode" : "Chuyển sang dark mode"}
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'generator' ? (
          <div className="space-y-8">
            {/* Image Upload Section */}
            <section>
              <h2 className="text-lg font-semibold mb-4">1. Tải ảnh lên</h2>
              <ImageDropzone onImageLoad={handleImageLoad} />
            </section>

            {/* Image Preview & Extraction */}
            {imageSrc && (
              <section>
                <h2 className="text-lg font-semibold mb-4">2. Xem trước và trích xuất màu</h2>
                <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
                  <div className="lg:col-span-2">
                    <h3 className="text-md font-medium mb-3">Color Picker - Di chuột để lấy màu</h3>
                    <ColorPicker
                      imageSrc={imageSrc}
                      onColorPicked={handleColorPicked}
                    />
                  </div>
                  <div>
                    <h3 className="text-md font-medium mb-3">Auto Extract</h3>
                    <PaletteExtractor
                      imageSrc={imageSrc}
                      onColorsExtracted={handleColorsExtracted}
                    />
                  </div>
                </div>
              </section>
            )}

            {/* Shade Generation */}
            {extractedColors.length > 0 && (
              <ShadeGenerator
                baseColors={extractedColors}
                onShadesGenerated={handleShadesGenerated}
              />
            )}

            {/* Palette Display */}
            {finalColors.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-4">3. Bảng màu đã tạo</h2>
                <div className="space-y-4">
                  <PaletteBoard
                    colors={finalColors}
                    onColorsReorder={handleColorsReorder}
                    onColorRemove={handleColorRemove}
                    onColorCopy={handleColorCopy}
                  />
                  
                  <ExportPanel 
                    colors={finalColors} 
                    onSave={handleSavePalette}
                  />
                </div>
              </section>
            )}
          </div>
        ) : (
          /* Gallery Tab */
          <Gallery
            currentColors={finalColors}
            onLoadPalette={handleLoadPalette}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/50 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>Color Palette Generator • Tạo bởi AI • Open Source</p>
            <p className="mt-1">Kéo thả ảnh, trích xuất màu, xuất SCSS/CSS, chia sẻ URL</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
