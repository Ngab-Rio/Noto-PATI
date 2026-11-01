# Asset Management Guide

Dokumentasi lengkap untuk mengelola asset visual dalam project Noto PATI.

## Struktur Folder

```
public/images/
├── icons/           # Icon SVG untuk UI (24x24, 32x32)
├── illustrations/   # Ilustrasi SVG/PNG besar
├── logos/           # Logo brand dan partner
└── photos/          # Foto dalam format optimized
```

## Quick Reference

### Import & Usage

```tsx
import Image from 'next/image';

// Icon
<Image 
  src="/images/icons/file.svg" 
  alt="File icon" 
  width={24} 
  height={24} 
/>

// Illustration
<Image 
  src="/images/illustrations/pati-map.svg" 
  alt="Peta Kabupaten Pati" 
  width={800} 
  height={600} 
/>

// Photo
<Image 
  src="/images/photos/hero-bg.avif" 
  alt="Background" 
  width={1920} 
  height={1080}
  quality={85}
  priority
/>
```

## Format Guidelines

### 1. SVG (Vector Graphics)

**Kapan menggunakan**:
- Icons (UI elements, navigation)
- Logos (scalable brand assets)
- Simple illustrations (flat design, line art)
- Infographics

**Optimasi**:
- Gunakan [SVGOMG](https://jakearchibald.github.io/svgomg/)
- Remove metadata, comments
- Precision: 1-2 decimal places
- Minify colors: enabled

**Inline vs External**:
```tsx
// ✅ External - untuk static assets
<Image src="/images/icons/search.svg" />

// ✅ Inline - untuk interactive/animated
<svg className="animated-icon">
  {/* SVG content with animations */}
</svg>
```

### 2. AVIF (Modern Photo Format)

**Kapan menggunakan**:
- Hero backgrounds
- Report photos
- Gallery images
- Any photographic content

**Keuntungan**:
- 50% lebih kecil dari WebP
- 80% lebih kecil dari JPG
- Better quality per byte
- Support di Chrome, Firefox, Safari 16+

**Optimasi dengan Sharp**:
```bash
npm install sharp-cli -g
sharp -i input.jpg -o output.avif --avif-quality 85
```

**Next.js auto-optimize**:
```tsx
<Image 
  src="/images/photos/report.avif"
  alt="Foto laporan"
  width={1200}
  height={800}
  quality={85}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### 3. WebP (Fallback Format)

**Kapan menggunakan**:
- Fallback untuk AVIF
- Browser yang tidak support AVIF
- Support di semua modern browsers

**Optimasi**:
```bash
# Using cwebp (Google WebP tools)
cwebp -q 85 input.jpg -o output.webp

# Using Squoosh (web-based)
# https://squoosh.app/
```

### 4. JPG/PNG (Legacy)

**JPG**:
- Photographic content dengan banyak warna
- No transparency needed
- Quality: 80-85% untuk web

**PNG**:
- Transparency needed
- Screenshots, UI elements
- Use PNG-8 untuk simple graphics
- Use PNG-24 untuk photos dengan alpha

## Naming Convention

### Format
```
{category}-{description}-{variant}.{ext}

Examples:
✅ icon-search-outline.svg
✅ logo-noto-pati-primary.svg
✅ illustration-map-hero.svg
✅ photo-report-001.avif
✅ photo-profile-placeholder.png
```

### Rules
- Gunakan **kebab-case** (lowercase, hyphen-separated)
- Descriptive dan meaningful
- Include variant jika ada (primary, secondary, light, dark)
- Suffix dengan size jika perlu (@2x, @3x, -lg, -sm)

```
❌ Bad
PatiMap.svg
heroBackground.avif
user_profile.png

✅ Good
pati-map-illustration.svg
hero-background.avif
profile-placeholder.png
```

## Size Guidelines

| Asset Type | Recommended Size | Max Size |
|------------|------------------|----------|
| Icons | < 10 KB | 20 KB |
| Logos | < 50 KB | 100 KB |
| Illustrations | < 200 KB | 500 KB |
| Photos (AVIF) | < 300 KB | 500 KB |
| Photos (WebP) | < 400 KB | 800 KB |

## Responsive Images

### Sizes Attribute

```tsx
<Image
  src="/images/photos/hero.avif"
  alt="Hero"
  width={1920}
  height={1080}
  sizes="(max-width: 640px) 100vw,
         (max-width: 1024px) 80vw,
         1200px"
/>
```

### Breakpoint Strategy

```tsx
// Mobile First
sizes="
  (max-width: 640px) 100vw,   // Mobile: full width
  (max-width: 1024px) 80vw,   // Tablet: 80% width
  1200px                       // Desktop: fixed 1200px
"
```

## Multiple Formats Strategy

```tsx
// Browser will auto-select best format
<picture>
  <source 
    srcSet="/images/photos/hero.avif" 
    type="image/avif" 
  />
  <source 
    srcSet="/images/photos/hero.webp" 
    type="image/webp" 
  />
  <img 
    src="/images/photos/hero.jpg" 
    alt="Hero background"
  />
</picture>
```

## Lazy Loading

```tsx
// Lazy load (default)
<Image 
  src="/images/photos/gallery-01.avif"
  alt="Gallery"
  width={800}
  height={600}
  loading="lazy"
/>

// Priority load (above fold)
<Image 
  src="/images/photos/hero.avif"
  alt="Hero"
  width={1920}
  height={1080}
  priority
/>
```

## Placeholder Strategies

### 1. Blur Placeholder (Recommended)

```tsx
<Image
  src="/images/photos/hero.avif"
  alt="Hero"
  width={1920}
  height={1080}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..."
/>
```

Generate blur data URL:
```bash
# Using Plaiceholder
npm install plaiceholder
```

```tsx
import { getPlaiceholder } from 'plaiceholder';

const { base64 } = await getPlaiceholder('/path/to/image.jpg');
```

### 2. Empty Placeholder

```tsx
<Image
  src="/images/photos/hero.avif"
  alt="Hero"
  width={1920}
  height={1080}
  placeholder="empty"
/>
```

## Accessibility

### Alt Text Best Practices

```tsx
// ✅ Good - Descriptive
<Image 
  src="/images/photos/pati-city-hall.avif" 
  alt="Kantor Bupati Kabupaten Pati dengan bendera merah putih" 
/>

// ✅ Good - Context-aware
<Image 
  src="/images/icons/search.svg" 
  alt="Cari laporan" 
/>

// ⚠️ OK - Decorative (empty alt)
<Image 
  src="/images/illustrations/bg-pattern.svg" 
  alt="" 
  aria-hidden="true"
/>

// ❌ Bad - Too generic
<Image 
  src="/images/photos/building.avif" 
  alt="building" 
/>

// ❌ Bad - Missing
<Image 
  src="/images/icons/close.svg" 
/>
```

## Performance Optimization

### 1. Next.js Image Optimization

Next.js automatically:
- Converts images to WebP/AVIF
- Generates multiple sizes
- Lazy loads images
- Prevents Cumulative Layout Shift (CLS)

### 2. Manual Optimization Tools

**Online Tools**:
- [Squoosh](https://squoosh.app/) - Image compression
- [SVGOMG](https://jakearchibald.github.io/svgomg/) - SVG optimization
- [TinyPNG](https://tinypng.com/) - PNG/JPG compression

**CLI Tools**:
```bash
# Sharp (Node.js)
npm install sharp

# ImageMagick
choco install imagemagick  # Windows
brew install imagemagick   # macOS

# svgo (SVG Optimizer)
npm install -g svgo
```

### 3. Batch Optimization Script

```bash
# Optimize all JPG to AVIF
for file in *.jpg; do
  sharp -i "$file" -o "${file%.jpg}.avif" --avif-quality 85
done

# Optimize all SVG
svgo -f ./public/images/icons/ -o ./public/images/icons/
```

## CDN Configuration (Production)

### Vercel (Default)

Next.js Image Optimization works out of the box on Vercel.

### Custom CDN

```js
// next.config.js
module.exports = {
  images: {
    loader: 'custom',
    loaderFile: './lib/image-loader.js',
  },
}
```

```js
// lib/image-loader.js
export default function myImageLoader({ src, width, quality }) {
  return `https://cdn.noto-pati.id/${src}?w=${width}&q=${quality || 75}`
}
```

## Git LFS (Large File Storage)

Untuk files > 1 MB, pertimbangkan Git LFS:

```bash
# Install Git LFS
git lfs install

# Track large images
git lfs track "*.avif"
git lfs track "*.png"

# Commit .gitattributes
git add .gitattributes
git commit -m "chore: configure Git LFS for images"
```

## Checklist Before Commit

- [ ] Image di-optimize (check file size)
- [ ] Nama file mengikuti naming convention
- [ ] File ada di folder yang benar
- [ ] Alt text sudah descriptive
- [ ] Responsive sizes sudah dikonfigurasi
- [ ] Loading strategy sesuai (lazy/priority)
- [ ] Build berhasil tanpa error

## Examples

### Hero Background

```tsx
<div className="hero-section">
  <Image
    src="/images/photos/pati-hero-bg.avif"
    alt="Pemandangan Kabupaten Pati dengan sawah hijau"
    fill
    style={{ objectFit: 'cover' }}
    quality={90}
    priority
    sizes="100vw"
  />
</div>
```

### Report Gallery

```tsx
<div className="report-gallery">
  {images.map((img, i) => (
    <Image
      key={img.id}
      src={`/images/photos/reports/${img.filename}`}
      alt={img.description}
      width={400}
      height={300}
      quality={85}
      loading="lazy"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
    />
  ))}
</div>
```

### Icon with Fallback

```tsx
<Image
  src="/images/icons/map-pin.svg"
  alt="Lokasi"
  width={24}
  height={24}
  onError={(e) => {
    e.currentTarget.src = '/images/icons/fallback.svg';
  }}
/>
```

## Troubleshooting

### Issue: Image tidak muncul

**Check**:
1. Path correct? (case-sensitive!)
2. File exists di `public/images/`?
3. Next.js dev server restarted?
4. Browser cache cleared?

### Issue: Image blur/low quality

**Solutions**:
```tsx
// Increase quality
<Image quality={90} />

// Use original size
<Image unoptimized />

// Check source image resolution
```

### Issue: Slow loading

**Solutions**:
- Reduce image size
- Enable lazy loading
- Use progressive JPG
- Implement blur placeholder
- Check CDN configuration

## Resources

- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Web.dev Image Performance](https://web.dev/fast/#optimize-your-images)
- [AVIF Format Guide](https://jakearchibald.com/2020/avif-has-landed/)
- [Responsive Images Guide](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)
