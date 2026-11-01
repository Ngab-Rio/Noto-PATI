# Public Images Directory

Folder ini berisi semua asset visual yang digunakan dalam aplikasi Noto PATI.

## Struktur Folder

```
public/images/
├── icons/           # Icon SVG untuk UI (file, globe, window, dll)
├── illustrations/   # Ilustrasi SVG (map, hero visuals, infographics)
├── logos/           # Logo brand (Next.js, Vercel, Noto PATI logo)
└── photos/          # Foto dalam format optimized (AVIF, WebP, JPG)
```

## Panduan Penggunaan

### 1. Icons (`/images/icons/`)
**Format**: SVG  
**Gunakan untuk**: Icon UI, button icons, navigation icons

**Contoh**:
```tsx
<Image src="/images/icons/file.svg" alt="File icon" width={24} height={24} />
```

### 2. Illustrations (`/images/illustrations/`)
**Format**: SVG, PNG (untuk complex illustrations)  
**Gunakan untuk**: Hero visuals, decorative graphics, infographics, map illustrations

**Contoh**:
```tsx
<Image 
  src="/images/illustrations/pati-map.svg" 
  alt="Peta Kabupaten Pati" 
  width={800} 
  height={600} 
/>
```

**Note**: Untuk ilustrasi interaktif dengan animasi, pertimbangkan menggunakan inline SVG di component daripada file terpisah.

### 3. Logos (`/images/logos/`)
**Format**: SVG (preferred), PNG (dengan transparent background)  
**Gunakan untuk**: Brand logos, partner logos, platform logos

**Contoh**:
```tsx
<Image 
  src="/images/logos/noto-pati-logo.svg" 
  alt="Noto PATI Logo" 
  width={200} 
  height={50} 
/>
```

### 4. Photos (`/images/photos/`)
**Format**: AVIF (primary), WebP (fallback), JPG (legacy)  
**Gunakan untuk**: Foto laporan, foto profil, background images, gallery

**Contoh menggunakan Next.js Image dengan multiple formats**:
```tsx
<Image
  src="/images/photos/hero-bg.avif"
  alt="Kabupaten Pati"
  width={1920}
  height={1080}
  quality={90}
  priority
/>
```

## Best Practices

### Optimasi Format
- **SVG**: Untuk vector graphics (icons, logos, simple illustrations)
- **AVIF**: Untuk photos (file size terkecil, quality terbaik)
- **WebP**: Fallback untuk browser yang tidak support AVIF
- **JPG**: Legacy fallback untuk compatibility

### Naming Convention
Gunakan kebab-case untuk nama file:
```
✅ pati-map-illustration.svg
✅ hero-background.avif
✅ user-profile-placeholder.png

❌ PatiMap.svg
❌ heroBackground.avif
❌ user_profile_placeholder.png
```

### Ukuran File
- **Icons**: < 10 KB
- **Logos**: < 50 KB
- **Illustrations**: < 200 KB
- **Photos**: < 500 KB (setelah optimasi)

### Optimasi Tools
- **SVG**: [SVGOMG](https://jakearchibald.github.io/svgomg/)
- **PNG/JPG**: [Squoosh](https://squoosh.app/)
- **AVIF/WebP**: [Sharp](https://sharp.pixelplumbing.com/) atau Next.js Image Optimization

## Responsive Images

Gunakan Next.js Image component untuk automatic optimization:

```tsx
import Image from 'next/image';

<Image
  src="/images/photos/hero.avif"
  alt="Description"
  width={1200}
  height={800}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  quality={85}
/>
```

## Accessibility

Selalu sertakan `alt` text yang descriptive:

```tsx
// ✅ Good
<Image src="/images/icons/search.svg" alt="Cari laporan" />

// ❌ Bad
<Image src="/images/icons/search.svg" alt="icon" />
<Image src="/images/icons/search.svg" alt="" /> // kecuali decorative
```

## Git & Version Control

- File `.gitkeep` digunakan untuk track folder kosong
- Commit asset baru dengan message yang jelas
- Gunakan Git LFS untuk file > 1 MB (opsional)

## Notes

- Semua asset di folder `public/` dapat diakses langsung via URL
- Next.js akan automatically optimize images yang diload via `<Image>` component
- Untuk production, pertimbangkan menggunakan CDN untuk serve images
