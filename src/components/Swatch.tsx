import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { getOptimalTextColor } from '../utils/contrast';
import { cn } from '../lib/utils';

interface SwatchProps {
  color: string;
  size?: 'sm' | 'md' | 'lg';
  showHex?: boolean;
  className?: string;
  onClick?: () => void;
  onCopy?: (color: string) => void;
}

export function Swatch({ 
  color, 
  size = 'md', 
  showHex = true, 
  className,
  onClick,
  onCopy 
}: SwatchProps) {
  const [copied, setCopied] = useState(false);
  const textColor = getOptimalTextColor(color);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32'
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(color);
      setCopied(true);
      onCopy?.(color);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy color:', err);
    }
  };

  return (
    <div
      className={cn(
        'swatch-container rounded-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden',
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: color }}
      onClick={onClick}
    >
      {/* Overlay với hex code và copy button */}
      <div
        className={cn(
          'swatch-hex flex flex-col items-center justify-center h-full text-xs font-mono font-bold tracking-wider',
          'opacity-0 group-hover:opacity-100 transition-all duration-200',
          'bg-black/20 backdrop-blur-sm'
        )}
        style={{ color: textColor }}
      >
        {showHex && (
          <span className="mb-1 text-center">
            {color.toUpperCase()}
          </span>
        )}
        
        <button
          className={cn(
            'flex items-center justify-center w-6 h-6 rounded-full',
            'bg-white/20 hover:bg-white/30 transition-colors duration-200',
            'border border-white/30'
          )}
          onClick={(e) => {
            e.stopPropagation();
            handleCopy();
          }}
        >
          {copied ? (
            <Check className="w-3 h-3" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
        </button>
      </div>
    </div>
  );
}
