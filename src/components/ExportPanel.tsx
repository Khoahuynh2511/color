import { useState } from 'react';
import { Download, Copy, Check, Share, ChevronDown, Heart } from 'lucide-react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { saveAs } from 'file-saver';
import { exportToScss } from '../utils/scssExporter';
import { exportToCssVars } from '../utils/cssVarExporter';
import { generateShareUrl } from '../utils/urlEncoder';
import { cn } from '../lib/utils';

interface ExportPanelProps {
  colors: string[];
  onSave?: (colors: string[]) => void;
  className?: string;
}

type ExportFormat = 'scss' | 'css' | 'json';

export function ExportPanel({ colors, onSave, className }: ExportPanelProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleCopyAllHex = () => {
    setCopied('hex');
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSave = () => {
    onSave?.(colors);
    setCopied('save');
    setTimeout(() => setCopied(null), 2000);
  };

  const handleShare = async () => {
    const shareUrl = generateShareUrl(colors);
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied('share');
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Error copying share URL:', error);
    }
  };

  const handleExport = (format: ExportFormat) => {
    if (colors.length === 0) return;

    let content = '';
    let filename = '';
    let mimeType = 'text/plain';

    switch (format) {
      case 'scss':
        content = exportToScss(colors);
        filename = 'palette.scss';
        mimeType = 'text/scss';
        break;
      case 'css':
        content = exportToCssVars(colors);
        filename = 'palette.css';
        mimeType = 'text/css';
        break;
      case 'json':
        content = JSON.stringify({
          name: 'Generated Palette',
          colors: colors.map((color, index) => ({
            name: `color-${index + 1}`,
            hex: color,
            rgb: hexToRgb(color),
          })),
          generatedAt: new Date().toISOString(),
        }, null, 2);
        filename = 'palette.json';
        mimeType = 'application/json';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    saveAs(blob, filename);
    setIsDropdownOpen(false);
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  if (colors.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {/* Save to Gallery */}
      {onSave && (
        <button
          onClick={handleSave}
          className="export-button bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-200 hover:bg-pink-200 dark:hover:bg-pink-800 px-4 py-2"
        >
          {copied === 'save' ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Đã lưu!
            </>
          ) : (
            <>
              <Heart className="w-4 h-4 mr-2" />
              Lưu vào Gallery
            </>
          )}
        </button>
      )}

      {/* Copy All HEX */}
      <CopyToClipboard text={colors.join(', ')} onCopy={handleCopyAllHex}>
        <button className="export-button bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2">
          {copied === 'hex' ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Đã sao chép!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Sao chép tất cả HEX
            </>
          )}
        </button>
      </CopyToClipboard>

      {/* Share URL */}
      <button
        onClick={handleShare}
        className="export-button bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2"
      >
        {copied === 'share' ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            Đã sao chép link!
          </>
        ) : (
          <>
            <Share className="w-4 h-4 mr-2" />
            Chia sẻ
          </>
        )}
      </button>

      {/* Export Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="export-button bg-accent text-accent-foreground hover:bg-accent/80 px-4 py-2"
        >
          <Download className="w-4 h-4 mr-2" />
          Tải xuống
          <ChevronDown className={cn(
            "w-4 h-4 ml-1 transition-transform",
            isDropdownOpen && "rotate-180"
          )} />
        </button>

        {isDropdownOpen && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-popover border border-border rounded-md shadow-lg z-50">
            <div className="py-1">
              <button
                onClick={() => handleExport('scss')}
                className="w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors"
              >
                SCSS Variables (.scss)
              </button>
              <button
                onClick={() => handleExport('css')}
                className="w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors"
              >
                CSS Variables (.css)
              </button>
              <button
                onClick={() => handleExport('json')}
                className="w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors"
              >
                JSON Format (.json)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
}