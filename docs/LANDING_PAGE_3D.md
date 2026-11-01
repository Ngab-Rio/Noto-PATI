# Landing Page 3D Hero Visual

Dokumentasi untuk implementasi 3D interactive hero visual pada landing page Noto PATI.

## Overview

Landing page telah diperbarui dengan visualisasi 3D interaktif yang merepresentasikan Kabupaten Pati secara real dengan elemen-elemen:
- Sawah dan lahan pertanian
- Jaringan jalan infrastruktur
- Bangunan dan landmark
- Marker laporan warga yang animated
- Interactive mouse parallax effect

## Features

### 🎨 3D Visual Elements

#### 1. **Platform Base**
- Grid pattern dengan perspektif isometrik
- Landmass berbentuk organik menyerupai wilayah geografis
- Transform 3D dengan rotasi 60° dan -45°

#### 2. **Rice Fields (Sawah)**
- 4 area persawahan dengan warna hijau gradasi
- Border dan shadow untuk depth effect
- Positioned strategically untuk representasi area pertanian

#### 3. **Road Network**
- Jalan horizontal dan vertikal yang bersilangan
- Gradasi warna abu-abu untuk realistic road effect
- Elevated dengan `translateZ` untuk 3D depth

#### 4. **Buildings & Landmarks**
- 3 bangunan dengan icon berbeda:
  - `Building2`: Gedung perkantoran
  - `Landmark`: Monument/landmark khas
  - `Home`: Perumahan warga
- Floating animation untuk dynamic feel
- Primary color gradient untuk brand consistency

#### 5. **Trees**
- 3 pohon dengan `TreePine` icon
- Gentle wave animation (rotasi subtle)
- Green color untuk natural representation

#### 6. **Report Markers**
- Animated pin markers dengan accent color
- Pulse effect untuk menarik perhatian
- Bounce animation untuk dynamic feel
- 3 markers di posisi strategis

### 🎭 Interactive Animations

#### Mouse Parallax
```typescript
const handleMouseMove = (e: MouseEvent) => {
  const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
  const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
  scene.style.setProperty("--mouse-x", `${x}deg`);
  scene.style.setProperty("--mouse-y", `${y}deg`);
};
```

Mouse movement creates subtle 3D rotation effect:
- X-axis: ±20° rotation
- Y-axis: ±20° rotation
- Smooth transition with ease-out

#### Keyframe Animations

1. **Float** (Background Orbs)
   - Duration: 8s
   - Effect: Vertical movement ±20px + scale 1.05
   - Staggered delays: 0s, 2s, 4s

2. **Building Float**
   - Duration: 4s
   - Effect: Z-axis elevation + translateY
   - Creates floating building effect

3. **Tree Wave**
   - Duration: 3s
   - Effect: Gentle rotation ±2°
   - Natural swaying motion

4. **Marker Bounce**
   - Duration: 2s
   - Effect: Vertical bounce -8px
   - Continuous loop

5. **Pulse** (Marker Ripple)
   - Duration: 2s
   - Effect: Scale 1 → 2, opacity 0.4 → 0
   - Radar-like pulse effect

6. **Label Float**
   - Duration: 4s
   - Effect: Vertical movement ±10px
   - Staggered for each label

7. **Dot Pulse** (Caption)
   - Duration: 2s
   - Effect: Box-shadow expansion
   - Breathing effect

### 🏷️ Information Labels

3 floating labels dengan backdrop blur dan shadow:

1. **Reports Label** (Top Right)
   - 1.248 Laporan Warga
   - MapPin icon
   - Accent color theme

2. **Budget Label** (Left Center)
   - APBD Lebih Terbuka
   - Landmark icon
   - Accent color theme

3. **Location Label** (Bottom Right)
   - Pati, Jawa Tengah
   - Waves icon
   - Primary color theme

### 📱 Responsive Design

**Desktop (> 700px)**
- Platform: 280x280px
- Land: 240x240px
- Buildings: 40x35px
- Full animations enabled
- Optimal label positioning

**Mobile (≤ 700px)**
- Platform: 220x220px
- Land: 190x190px
- Buildings: 32x28px
- Reduced icon sizes
- Adjusted label positions
- Maintained animation performance

## Technical Implementation

### CSS 3D Transforms

```css
.pati-3d-scene {
  transform: translate(-50%, -50%) 
             rotateX(var(--mouse-y, 0deg)) 
             rotateY(var(--mouse-x, 0deg));
  transform-style: preserve-3d;
  perspective: 1200px;
}

.pati-3d-platform {
  transform: translate(-50%, -50%) 
             rotateX(60deg) 
             rotateZ(-45deg);
  transform-style: preserve-3d;
}
```

### Z-Index Layering

```
Background Orbs: -1 (blur backdrop)
Grid: translateZ(-10px)
Land: translateZ(5px)
Rice Fields: translateZ(8px)
Roads: translateZ(10px)
Trees: translateZ(15px)
Buildings: translateZ(30px)
Markers: translateZ(40px)
Labels: translateZ(100px) (floating above)
```

### Color Palette

**Land & Nature:**
- Land: `#E3EEF8` → `#B9D2E8` (primary soft gradient)
- Rice Fields: `#B7D99A` → `#A4CB86` (green gradients)
- Trees: `#2E6B45` (dark green)

**Infrastructure:**
- Roads: `#8FA2B6` ↔ `#DCE5EE` (gray gradient)
- Buildings: Primary color gradient
- Markers: Accent color (`#A8532E`)

**UI Elements:**
- Labels: White 92% opacity + backdrop blur
- Borders: Primary color with transparency
- Shadows: Primary dark with opacity

## Performance Considerations

### Optimizations Applied

1. **CSS Animations Only**
   - Hardware-accelerated transforms
   - No JavaScript animation loops
   - GPU-optimized rendering

2. **Backdrop Blur**
   - Used sparingly (only on labels)
   - Alternative: solid colors for low-end devices

3. **Animation Staggering**
   - Prevents all animations syncing
   - Creates more natural, organic feel
   - Reduces perception of repetition

4. **Transform Efficiency**
   - Uses `translate3d` and `translateZ`
   - Triggers GPU acceleration
   - Avoids layout recalculations

### Browser Support

**Full Support:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Graceful Degradation:**
- Older browsers: Static view without parallax
- No JavaScript required for basic display
- Progressive enhancement approach

## Customization

### Adjusting Parallax Sensitivity

In `pati-hero-visual.tsx`:
```typescript
const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20; // Change 20 to adjust
const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20; // Change 20 to adjust
```

Lower values = less movement  
Higher values = more dramatic effect

### Changing Animation Duration

In `globals.css`:
```css
@keyframes float {
  /* Change 8s to adjust speed */
}
.pati-3d-orb {
  animation: float 8s ease-in-out infinite;
}
```

### Adding More Elements

Follow the pattern:
1. Add JSX element in component
2. Apply `translateZ()` for depth
3. Position with absolute/relative
4. Add animation keyframe if needed
5. Update responsive styles

## Future Enhancements

### Potential Additions

1. **Weather Effect**
   - Animated clouds
   - Rain particles
   - Day/night cycle

2. **Real Data Integration**
   - Dynamic marker count from API
   - Real report locations
   - Live updates

3. **Interactive Elements**
   - Clickable buildings
   - Hoverable regions
   - Tooltip on markers

4. **Performance Mode**
   - Reduced motion preference detection
   - Low-power mode for mobile
   - Animation toggle

5. **Accessibility**
   - Prefers-reduced-motion support
   - Keyboard navigation
   - Screen reader enhancements

## Testing Checklist

- [ ] Desktop Chrome - Parallax works smoothly
- [ ] Desktop Firefox - Animations render correctly
- [ ] Desktop Safari - 3D transforms display properly
- [ ] Mobile iOS Safari - Performance acceptable
- [ ] Mobile Android Chrome - Touch doesn't break layout
- [ ] Tablet - Responsive breakpoints work
- [ ] Dark mode - Colors remain visible
- [ ] Reduced motion - Respects user preference
- [ ] Screen readers - Proper aria labels

## Credits

Design inspired by modern 3D web experiences with Kabupaten Pati cultural context.
Built with CSS3 transforms, React hooks, and Tailwind CSS.

## References

- [CSS 3D Transforms - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/transform)
- [Transform Style: preserve-3d](https://developer.mozilla.org/en-US/docs/Web/CSS/transform-style)
- [Prefers Reduced Motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- [Lucide Icons](https://lucide.dev/)
