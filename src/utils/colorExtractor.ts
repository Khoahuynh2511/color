// Color extraction utility thay thế react-palette
export interface ExtractedColors {
  vibrant: string | null;
  darkVibrant: string | null;
  lightVibrant: string | null;
  muted: string | null;
  darkMuted: string | null;
  lightMuted: string | null;
}

interface ColorData {
  r: number;
  g: number;
  b: number;
  count: number;
  saturation: number;
  lightness: number;
}

// Chuyển RGB sang HSL
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
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

  return [h * 360, s, l];
}

// Chuyển RGB sang Hex
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

// Tính khoảng cách màu trong không gian RGB
function colorDistance(c1: ColorData, c2: ColorData): number {
  return Math.sqrt(
    Math.pow(c1.r - c2.r, 2) +
    Math.pow(c1.g - c2.g, 2) +
    Math.pow(c1.b - c2.b, 2)
  );
}

// K-means clustering đơn giản cho màu
function clusterColors(colors: ColorData[], k: number): ColorData[] {
  if (colors.length <= k) return colors;

  // Initialize centroids randomly
  let centroids = colors.slice(0, k);
  let iterations = 0;
  const maxIterations = 10;

  while (iterations < maxIterations) {
    const clusters: ColorData[][] = Array(k).fill(null).map(() => []);
    
    // Assign colors to nearest centroid
    colors.forEach(color => {
      let minDistance = Infinity;
      let closestCentroid = 0;
      
      centroids.forEach((centroid, i) => {
        const distance = colorDistance(color, centroid);
        if (distance < minDistance) {
          minDistance = distance;
          closestCentroid = i;
        }
      });
      
      clusters[closestCentroid].push(color);
    });

    // Update centroids
    const newCentroids = clusters.map(cluster => {
      if (cluster.length === 0) return centroids[0]; // fallback
      
      const totalCount = cluster.reduce((sum, c) => sum + c.count, 0);
      return {
        r: cluster.reduce((sum, c) => sum + c.r * c.count, 0) / totalCount,
        g: cluster.reduce((sum, c) => sum + c.g * c.count, 0) / totalCount,
        b: cluster.reduce((sum, c) => sum + c.b * c.count, 0) / totalCount,
        count: totalCount,
        saturation: cluster.reduce((sum, c) => sum + c.saturation * c.count, 0) / totalCount,
        lightness: cluster.reduce((sum, c) => sum + c.lightness * c.count, 0) / totalCount,
      };
    });

    // Check convergence
    const converged = centroids.every((centroid, i) => 
      colorDistance(centroid, newCentroids[i]) < 5
    );

    centroids = newCentroids;
    iterations++;

    if (converged) break;
  }

  return centroids.sort((a, b) => b.count - a.count);
}

// Trích xuất màu từ ảnh
export async function extractColorsFromImage(imageUrl: string): Promise<ExtractedColors> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          resolve({
            vibrant: null,
            darkVibrant: null,
            lightVibrant: null,
            muted: null,
            darkMuted: null,
            lightMuted: null,
          });
          return;
        }

        // Resize để tăng tốc xử lý
        const maxSize = 150;
        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        const imageData = ctx.getImageData(0, 0, width, height);
        const { data } = imageData;
        
        // Đếm màu và làm tròn để giảm noise
        const colorCount = new Map<string, ColorData>();
        
        for (let i = 0; i < data.length; i += 16) { // Skip pixels để tăng tốc
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          
          if (a < 128) continue; // Bỏ qua pixel trong suốt
          
          // Làm tròn màu để group tương tự
          const rRounded = Math.round(r / 8) * 8;
          const gRounded = Math.round(g / 8) * 8;
          const bRounded = Math.round(b / 8) * 8;
          
          const [h, s, l] = rgbToHsl(rRounded, gRounded, bRounded);
          const key = `${rRounded},${gRounded},${bRounded}`;
          
          if (colorCount.has(key)) {
            colorCount.get(key)!.count++;
          } else {
            colorCount.set(key, {
              r: rRounded,
              g: gRounded,
              b: bRounded,
              count: 1,
              saturation: s,
              lightness: l,
            });
          }
        }
        
        // Lọc màu có ít nhất 3 pixels và không quá xám
        const significantColors = Array.from(colorCount.values())
          .filter(color => color.count >= 3 && color.saturation > 0.1);
        
        if (significantColors.length === 0) {
          resolve({
            vibrant: null,
            darkVibrant: null,
            lightVibrant: null,
            muted: null,
            darkMuted: null,
            lightMuted: null,
          });
          return;
        }
        
        // Clustering để tìm màu đại diện
        const clusters = clusterColors(significantColors, Math.min(8, significantColors.length));
        
        // Phân loại màu theo vibrant/muted và light/dark
        let vibrant: string | null = null;
        let darkVibrant: string | null = null;
        let lightVibrant: string | null = null;
        let muted: string | null = null;
        let darkMuted: string | null = null;
        let lightMuted: string | null = null;
        
        // Sắp xếp theo độ nổi bật
        const vibrantColors = clusters
          .filter(c => c.saturation > 0.4)
          .sort((a, b) => b.saturation * b.count - a.saturation * a.count);
        
        const mutedColors = clusters
          .filter(c => c.saturation <= 0.4)
          .sort((a, b) => b.count - a.count);
        
        // Chọn vibrant colors
        for (const color of vibrantColors) {
          if (!vibrant) {
            vibrant = rgbToHex(color.r, color.g, color.b);
          } else if (!darkVibrant && color.lightness < 0.45) {
            darkVibrant = rgbToHex(color.r, color.g, color.b);
          } else if (!lightVibrant && color.lightness > 0.55) {
            lightVibrant = rgbToHex(color.r, color.g, color.b);
          }
        }
        
        // Chọn muted colors
        for (const color of mutedColors) {
          if (!muted) {
            muted = rgbToHex(color.r, color.g, color.b);
          } else if (!darkMuted && color.lightness < 0.45) {
            darkMuted = rgbToHex(color.r, color.g, color.b);
          } else if (!lightMuted && color.lightness > 0.55) {
            lightMuted = rgbToHex(color.r, color.g, color.b);
          }
        }
        
        resolve({
          vibrant,
          darkVibrant,
          lightVibrant,
          muted,
          darkMuted,
          lightMuted,
        });
        
      } catch (error) {
        console.error('Error extracting colors:', error);
        resolve({
          vibrant: null,
          darkVibrant: null,
          lightVibrant: null,
          muted: null,
          darkMuted: null,
          lightMuted: null,
        });
      }
    };
    
    img.onerror = () => {
      resolve({
        vibrant: null,
        darkVibrant: null,
        lightVibrant: null,
        muted: null,
        darkMuted: null,
        lightMuted: null,
      });
    };
    
    img.src = imageUrl;
  });
} 