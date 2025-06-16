# 🎨 Color Palette Generator

[![Demo](https://img.shields.io/badge/demo-live-green.svg)](https://palette-generator-demo.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-purple.svg)](https://vitejs.dev/)

**AI-powered color palette generator** with drag-drop support, PWA ready, and modern UI/UX.

![Color Palette Generator Screenshot](./public/screenshot.png)

## ✨ Tính năng

### 🖼️ Trích xuất màu từ ảnh
- **Drag & Drop**: Kéo thả ảnh dễ dàng
- **Auto Extract**: Tự động trích xuất màu chủ đạo bằng react-palette
- **Smart Algorithm**: Thuật toán thông minh loại bỏ màu trùng lặp

### 🎯 Color Picker Realtime
- **Hover để xem màu**: Di chuyển chuột trên ảnh để xem mã màu realtime
- **Click để chọn**: Click vào pixel để thêm màu vào palette
- **Double-click để copy**: Copy mã HEX nhanh chóng
- **Thông tin đầy đủ**: Hiển thị HEX, RGB, HSL và tọa độ pixel

### 🎯 Tạo bảng màu thông minh
- Trích xuất 6 màu chính từ ảnh (vibrant, muted, light, dark)
- Tự động tạo **5 shade** cho mỗi màu gốc
- Loại bỏ màu trùng lặp
- **Drag-and-drop reorder** các ô màu

### 📋 Copy & Export
- **1-click copy** từng màu HEX
- **Copy tất cả** màu (format: `#FF5733, #33FF57, ...`)
- **Xuất file**: SCSS variables, CSS custom properties, JSON
- **Share URL**: Encode bảng màu vào URL hash

### 💾 Gallery & Lưu trữ
- **LocalStorage gallery** - lưu palette offline
- **Random tên** cho palette (VD: "Sunset Glow", "Ocean Wave")
- **Pin/Unpin** palette quan trọng
- **Rename** palette
- **Load** palette từ gallery

### 🌓 Modern UI/UX
- **Dark/Light mode** tự động theo hệ thống
- **Responsive design** (mobile-first)
- **Tailwind CSS** + **shadcn/ui** components
- **Smooth animations** với CSS transitions
- **PWA ready** - cài đặt như native app

## 🚀 Cài đặt & Chạy

### Prerequisites
- Node.js 18+ và npm/pnpm/yarn

### Quick Start

```bash
# Clone repository
git clone https://github.com/Khoahuynh2511/color.git
cd palette-generator

# Cài dependencies
npm install
# hoặc
pnpm install

# Chạy development server
npm run dev
# hoặc
pnpm dev

# Mở http://localhost:5173
```

### Build cho Production

```bash
# Build static files
npm run build

# Preview build
npm run preview

# Deploy lên Vercel/Netlify
npm run build && npx vercel --prod
```

## 🏗️ Kiến trúc & Tech Stack

### Frontend Stack
| Layer | Technology | Mục đích |
|-------|------------|----------|
| **Build** | Vite 6.x + React 18 + TypeScript | Fast dev, HMR, type safety |
| **Styling** | Tailwind CSS + shadcn/ui | Modern design system |
| **Color Processing** | chroma-js + react-palette | Extract & manipulate colors |
| **Drag & Drop** | @dnd-kit/core + @dnd-kit/sortable | Smooth reordering |
| **File Operations** | react-dropzone + file-saver | Upload & download |
| **PWA** | vite-plugin-pwa | Offline-first, installable |

### Cấu trúc thư mục

```
src/
├── components/          # React components
│   ├── ImageDropzone.tsx    # Drag-drop upload
│   ├── PaletteExtractor.tsx # Color extraction logic
│   ├── ShadeGenerator.tsx   # Generate color shades
│   ├── PaletteBoard.tsx     # Display & reorder colors
│   ├── Swatch.tsx          # Individual color tile
│   ├── ExportPanel.tsx     # Export functionality
│   └── Gallery.tsx         # Saved palettes gallery
├── hooks/
│   └── useLocalGallery.ts  # LocalStorage CRUD
├── utils/
│   ├── contrast.ts         # WCAG contrast calculations
│   ├── scssExporter.ts     # SCSS variables export
│   ├── cssVarExporter.ts   # CSS custom properties
│   └── urlEncoder.ts       # URL hash encode/decode
├── lib/
│   └── utils.ts           # Utility functions (cn, etc.)
└── App.tsx               # Main application
```

## 📱 PWA Features

### Cài đặt
- **Add to Home Screen** trên mobile
- **Desktop installation** từ browser
- **Offline-first** với service worker

### Manifest
```json
{
  "name": "Color Palette Generator",
  "short_name": "Palette Gen",
  "description": "AI-powered color palette generator",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff"
}
```

## 🎨 Cách sử dụng

### 1. Tải ảnh lên
- **Drag & drop** ảnh vào vùng upload
- **Click** để mở file picker
- **Ctrl+V** để paste từ clipboard

### 2. Trích xuất màu
- Ứng dụng tự động phân tích ảnh
- Lấy 6 màu chính (vibrant, muted variations)
- Tạo 5 shade cho mỗi màu

### 3. Chỉnh sửa bảng màu
- **Drag** để sắp xếp lại màu
- **Hover** để xem HEX code
- **Click copy** để sao chép màu
- **Click X** để xóa màu

### 4. Xuất & Chia sẻ
- **Copy all HEX**: Sao chép tất cả màu
- **Download**: SCSS/CSS/JSON file
- **Share**: URL với palette encoded

### 5. Gallery
- **Save current**: Lưu palette hiện tại
- **Pin**: Ghim palette quan trọng
- **Rename**: Đổi tên palette
- **Load**: Tải palette từ gallery

## 🛠️ Development

### Scripts có sẵn

```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run test       # Run Vitest tests
```

### Thêm component mới

```bash
# Tạo component với shadcn
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add tooltip
```

### Cấu hình Tailwind

File `tailwind.config.js` đã setup:
- **Dark mode** với class strategy
- **Custom animations** (fade-in, palette-slide)
- **CSS utilities** (.swatch-container, .palette-grid)

## 🔧 Tùy chỉnh

### Thêm export format mới

```typescript
// src/utils/customExporter.ts
export function exportToCustomFormat(colors: string[]): string {
  return colors.map(color => `--custom-${color}: ${color};`).join('\n');
}

// src/components/ExportPanel.tsx
const handleExport = (format: ExportFormat) => {
  switch (format) {
    case 'custom':
      content = exportToCustomFormat(colors);
      filename = 'palette.custom';
      break;
  }
};
```

### Thêm thuật toán trích màu

```typescript
// src/components/PaletteExtractor.tsx
const extractColors = async (imageSrc: string) => {
  // Sử dụng custom color extraction
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  // ... custom logic
};
```

## 📊 Performance

### Lighthouse Scores (Target ≥ 90)
- **Performance**: 95+
- **Accessibility**: 100
- **Best Practices**: 95+
- **PWA**: 95+

### Tối ưu hóa
- **Code splitting** với Vite chunks
- **Image optimization** với canvas resize
- **Lazy loading** components
- **Service Worker** caching

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Mở Pull Request

### Coding Standards
- **TypeScript strict mode**
- **ESLint + Prettier**
- **Conventional Commits**
- **Component-driven development**

## 📄 License

Dự án này sử dụng [MIT License](LICENSE).

## 🙏 Credits

- **react-palette** - Color extraction từ ảnh
- **chroma-js** - Color manipulation & scales
- **@dnd-kit** - Smooth drag & drop
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Beautiful UI components
- **Lucide React** - Consistent icon set

---

