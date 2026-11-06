# DESIGN.md — Noto PATI

> **Sistem Desain Visual · Compatible dengan Google Stitch & Impeccable**

Dokumen ini menangkap sistem desain visual Noto PATI yang telah diterapkan dalam codebase. Setiap keputusan desain mengikuti prinsip aksesibilitas WCAG AA, mobile-first, dan bahasa Indonesia sebagai prioritas.

---

## Atmosfer & Karakter Visual

### Kepribadian Brand

**Bersih, Sipil, Berakar Indonesia, Berfokus Komunitas**

Noto PATI menggunakan bahasa visual yang:
- **Modern tapi tidak korporat** — Terasa segar dan up-to-date tanpa kehilangan kehangatan lokal
- **Serius tapi tidak dingin** — Kredibel untuk urusan pemerintahan tapi tetap ramah dan approachable
- **Lokal tapi tidak kampungan** — Bangga dengan identitas Pati tanpa terlihat amatir
- **Kaya data tapi tidak membingungkan** — Informasi lengkap tersaji dengan hierarki yang jelas

### Suasana Emosional

- **Kepercayaan** — Warna biru soft yang menenangkan, sistem status yang transparan
- **Pemberdayaan** — Aksen terracotta hangat memberikan energi dan percaya diri
- **Kejelasan** — Kontras tinggi, tipografi readable, informasi terstruktur
- **Keseriusan yang ramah** — Profesional namun tidak mengintimidasi

---

## Palet Warna

### Brand Colors

#### Primary Blue — Kepercayaan & Otoritas Sipil

```
Primary/Default
#3B6EA5
--color-primary
```
**Penggunaan:** Tombol utama, link, header, elemen interaktif primer
**Karakter:** Biru soft yang menenangkan, melambangkan kepercayaan institusi sipil

```
Primary/Dark
#2F5F95
--color-primary-dark
```
**Penggunaan:** Hover state tombol primary, emphasis, CTA kuat
**Karakter:** Lebih pekat, lebih assertive untuk aksi penting

```
Primary/Soft
#E3EEF8
--color-primary-soft
```
**Penggunaan:** Background informasi, chip sekunder, highlight block, hover state subtle
**Karakter:** Lembut, tidak dominan, untuk konteks pendukung

#### Accent Terracotta — Kehangatan & Fokus

```
Accent/Default
#A8532E
--color-accent
```
**Penggunaan:** Icon penting, badge khusus, aksen hemat untuk menarik perhatian
**Karakter:** Terracotta hangat, nada tanah Indonesia, energi tanpa agresi

```
Accent/Soft
#FCEBDF
--color-accent-soft
```
**Penggunaan:** Background alert ringan, badge accent, subtle emphasis
**Karakter:** Sangat lembut, kehangatan tanpa dominasi

### Neutral Colors

#### Backgrounds

```
Background/Page
#F6F9FC
--color-background
```
**Penggunaan:** Latar utama halaman, canvas aplikasi
**Karakter:** Off-white dengan hint biru, memberikan ruang bernapas

```
Background/Surface
#FFFFFF
--color-surface
```
**Penggunaan:** Kartu, dialog, panel, elemen melayang
**Karakter:** Putih murni untuk permukaan yang bersih

#### Borders & Dividers

```
Border/Default
#DCE5EE
--color-border
```
**Penggunaan:** Garis pemisah kartu, tabel, input field, divider
**Karakter:** Subtle, cukup terlihat tanpa harsh

#### Text Colors

```
Text/Primary
#1F2D3D
--color-text
```
**Penggunaan:** Judul, body text, konten utama
**Karakter:** Dark blue-gray, readable dengan kontras tinggi
**Kontras:** ~14:1 dengan background putih (AAA)

```
Text/Secondary
#556577
--color-text-muted
```
**Penggunaan:** Label tanggal, keterangan pendukung, metadata
**Karakter:** Medium gray-blue, jelas tapi tidak dominan
**Kontras:** ~7:1 dengan background putih (AAA)

```
Text/On-Primary
#FFFFFF
--color-text-on-primary
```
**Penggunaan:** Teks di atas tombol primary/accent
**Karakter:** Putih murni untuk maximum contrast

### Status Colors — WCAG AA Compliant (≥4.5:1)

Setiap status memiliki pasangan warna text dan background yang memenuhi standar aksesibilitas WCAG AA.

#### Status Utama (Alur Normal)

**Diterima** — Tahap awal penerimaan
```
Text:       #2C6A93 (status-diterima-text)
Background: #E1F0F8 (status-diterima-bg)
Kontras:    4.7:1 ✓
Karakter:   Biru tenang, menandakan laporan masuk sistem
```

**Diverifikasi** — Sudah diverifikasi petugas
```
Text:       #2F6568 (status-diverifikasi-text)
Background: #DDEFEF (status-diverifikasi-bg)
Kontras:    4.8:1 ✓
Karakter:   Teal profesional, konfirmasi validitas
```

**Diproses** — Sedang ditangani
```
Text:       #7A5A12 (status-diproses-text)
Background: #FBF0D2 (status-diproses-bg)
Kontras:    5.1:1 ✓
Karakter:   Kuning-amber, menandakan aktivitas sedang berjalan
```

**Selesai** — Masalah telah diselesaikan
```
Text:       #2E6B45 (status-selesai-text)
Background: #DDEFE2 (status-selesai-bg)
Kontras:    4.9:1 ✓
Karakter:   Hijau positif, menandakan keberhasilan penyelesaian
```

#### Status Lainnya (Kondisi Khusus)

**Dibuka Kembali** — Laporan dibuka lagi setelah selesai
```
Text:       #9A4D22 (status-dibuka-kembali-text)
Background: #FBE6D6 (status-dibuka-kembali-bg)
Kontras:    5.2:1 ✓
Karakter:   Orange hangat, menandakan iterasi ulang
```

**Ditolak** — Laporan tidak dapat diproses
```
Text:       #8F3A3A (status-ditolak-text)
Background: #F7DEDE (status-ditolak-bg)
Kontras:    5.5:1 ✓
Karakter:   Merah lembut tapi jelas, menandakan penolakan
```

**Digabung** — Laporan digabungkan dengan laporan lain
```
Text:       #594B86 (status-digabung-text)
Background: #E9E5F3 (status-digabung-bg)
Kontras:    5.8:1 ✓
Karakter:   Ungu netral, menandakan konsolidasi
```

**Ditutup** — Laporan ditutup tanpa penyelesaian
```
Text:       #5A5953 (status-ditutup-text)
Background: #ECEBE8 (status-ditutup-bg)
Kontras:    4.6:1 ✓
Karakter:   Gray netral, menandakan penutupan permanen
```

---

## Tipografi

### Font Family

```
Primary Font: Poppins
Fallback:     system-ui, -apple-system, sans-serif
```

**Karakter:** Geometric sans-serif modern dengan rounded terminals, sangat readable di layar kecil, mendukung diakritik Indonesia dengan baik.

**Alasan Pemilihan:**
- Readable di berbagai ukuran (dari mobile hingga desktop)
- Friendly namun tetap professional
- Excellent x-height untuk readability
- Weights yang jelas untuk hierarki

### Type Scale & Hierarchy

#### Heading Levels

**H1 — Hero & Page Title**
```
Font size:      clamp(2.5rem, 6vw, 5.5rem)
                Desktop: 88px / Mobile: 40px
Font weight:    600 (Semibold)
Line height:    1.05
Letter spacing: -0.03em (tight)
Color:          --color-text (#1F2D3D)
```
**Penggunaan:** Landing hero, page heading utama
**Karakter:** Dramatis, commanding attention, responsive scale

**H2 — Section Heading**
```
Font size:      clamp(1.5rem, 3vw, 2.4rem)
                Desktop: 38px / Mobile: 24px
Font weight:    600 (Semibold)
Line height:    1.15
Color:          --color-text (#1F2D3D)
```
**Penggunaan:** Section heading, card group title

**H3 — Card Title / Subsection**
```
Font size:      1.125rem (18px)
Font weight:    600 (Semibold)
Line height:    1.4
Color:          --color-text (#1F2D3D)
```
**Penggunaan:** Report card title, component heading

#### Body Text

**Body Large**
```
Font size:      1.05rem (16.8px)
Font weight:    400 (Regular)
Line height:    1.7
Color:          --color-text-muted (#556577)
```
**Penggunaan:** Hero description, intro paragraph

**Body Default**
```
Font size:      0.875rem (14px)
Font weight:    400 (Regular)
Line height:    1.6
Color:          --color-text (#1F2D3D)
```
**Penggunaan:** Report description, form labels, body copy

**Body Small**
```
Font size:      0.75rem (12px)
Font weight:    400 (Regular)
Line height:    1.5
Color:          --color-text-muted (#556577)
```
**Penggunaan:** Metadata, captions, secondary info

#### Special Text Styles

**Eyebrow / Overline**
```
Font size:      0.75rem (12px)
Font weight:    700 (Bold)
Text transform: uppercase
Letter spacing: 0.16em (wide)
Color:          --color-accent (#A8532E)
```
**Penggunaan:** Section labels, category tags
**Karakter:** Small but mighty, menarik perhatian tanpa dominan

**Label / Form Input**
```
Font size:      0.875rem (14px)
Font weight:    500 (Medium)
Color:          --color-text (#1F2D3D)
```
**Penggunaan:** Form labels, input field labels

---

## Spacing & Layout

### Spacing Scale

Menggunakan Tailwind default scale dengan beberapa custom values:

```
xs:   0.25rem (4px)
sm:   0.5rem (8px)
base: 0.75rem (12px)
md:   1rem (16px)
lg:   1.5rem (24px)
xl:   2rem (32px)
2xl:  3rem (48px)
3xl:  4rem (64px)
```

### Layout Patterns

**Page Shell**
```
Max width: 1180px
Padding:   Desktop: 6vw
           Mobile:  1rem (16px)
Margin:    Centered with auto
```

**Hero Section**
```
Grid:      Desktop: 1fr 380px (content + visual)
           Mobile:  1fr (stacked)
Gap:       Desktop: 8vw
           Mobile:  3rem
Alignment: center
```

**Card Grid**
```
Grid:      Desktop: 2 columns
           Mobile:  1 column
Gap:       1.5rem (24px)
```

---

## Border Radius

```
--radius:    0.625rem (10px) — base
--radius-sm: 0.375rem (6px)  — small elements
--radius-md: 0.5rem (8px)    — buttons
--radius-lg: 0.625rem (10px) — cards
--radius-xl: 0.875rem (14px) — large cards
--radius-2xl: 1.125rem (18px) — hero cards
```

**Karakter:** Soft rounded, modern tanpa terlalu playful

---

## Shadows

### Shadow Scale

**shadow-xs** — Subtle elevation
```
box-shadow: 0 1px 2px rgba(31, 45, 61, 0.04)
```
**Penggunaan:** Input fields, badges

**shadow-sm** — Card default
```
box-shadow: 0 1px 3px rgba(31, 45, 61, 0.08),
            0 1px 2px rgba(31, 45, 61, 0.04)
```
**Penggunaan:** Cards, buttons

**shadow-md** — Card hover / focus
```
box-shadow: 0 4px 12px rgba(31, 45, 61, 0.08),
            0 2px 4px rgba(31, 45, 61, 0.04)
```
**Penggunaan:** Card hover state, dropdown

**shadow-lg** — Modal / dialog
```
box-shadow: 0 12px 32px rgba(31, 45, 61, 0.12),
            0 4px 12px rgba(31, 45, 61, 0.06)
```
**Penggunaan:** Modal, dialog, floating panel

---

## Komponen Utama

### Button

**Variants:**

**Primary** (default)
```
Background: --color-primary (#3B6EA5)
Text:       --color-text-on-primary (#FFFFFF)
Hover:      --color-primary-dark (#2F5F95)
Shadow:     shadow-sm
```

**Primary Dark**
```
Background: --color-primary-dark (#2F5F95)
Text:       --color-text-on-primary (#FFFFFF)
Hover:      --color-primary (#3B6EA5)
```

**Accent**
```
Background: --color-accent (#A8532E)
Text:       #FFFFFF
Hover:      opacity 90%
```

**Outline**
```
Background: --color-surface (#FFFFFF)
Border:     --color-border (#DCE5EE)
Text:       --color-text (#1F2D3D)
Hover:      bg-primary-soft, text-primary-dark
```

**Ghost**
```
Background: transparent
Text:       --color-text (#1F2D3D)
Hover:      bg-primary-soft, text-primary-dark
```

**Sizes:**
- `xs`: h-6 (24px), text-xs, px-2
- `sm`: h-8 (32px), text-xs, px-2.5
- `default`: h-9 (36px), text-sm, px-3
- `lg`: h-11 (44px), text-base, px-5

**Border radius:** rounded-lg (0.5rem)

### Status Badge

**Anatomy:**
```
Display:     inline-flex, items-center
Padding:     sm: px-2 py-0.5
             md: px-2.5 py-1
             lg: px-3 py-1.5
Border:      1px solid (15% opacity of text color)
Radius:      rounded-full
Font:        font-medium
Icon:        Phosphor icons, bold weight
```

**States:**
- Diterima — ClipboardText icon
- Diverifikasi — Eye icon
- Diproses — Hammer icon
- Selesai — CheckCircle icon
- Dibuka Kembali — ArrowClockwise icon
- Ditolak — XCircle icon
- Digabung — GitMerge icon
- Ditutup — LockSimple icon

### Report Card

**Structure:**
```
Container:   rounded-xl border bg-surface p-5 shadow-xs
Hover:       border-primary/40, shadow-md, scale-[1.01]
Grid:        flex flex-col justify-between
```

**Sections:**
1. **Image** (optional) — aspect-video, rounded-lg, border
2. **Header** — StatusBadge + category + date
3. **Title** — text-lg font-semibold, line-clamp-2
4. **Description** — text-sm text-muted, line-clamp-3
5. **Location** — MapPin icon + text-xs
6. **Official Note** (optional) — bg-primary-soft, rounded-lg, border-primary/20
7. **Actions** — border-top, flex justify-between

**Interactive elements:**
- Support button dengan counter
- View on map link
- Rate/reopen (conditional)
- Detail button (primary dark)

### Form Input

```
Height:      3rem (48px)
Padding:     0 1rem
Border:      1px solid --color-border
Radius:      rounded-lg (0.5rem)
Font size:   0.875rem (14px)
Transition:  border-color, box-shadow

Focus state:
  Border:    --color-primary
  Shadow:    0 0 0 3px rgba(59, 110, 165, 0.1)
```

---

## Iconography

### Icon Libraries

**Primary:** Lucide React (outline style, stroke-width 2)
**Secondary:** Phosphor Icons (bold weight for status badges)

### Icon Sizes

```
xs:  12px (h-3 w-3)
sm:  14px (h-3.5 w-3.5)
md:  16px (h-4 w-4)
lg:  20px (h-5 w-5)
xl:  24px (h-6 w-6)
```

### Usage Guidelines

- Status badges: Phosphor icons, bold weight, 12-16px
- Buttons: Lucide icons, 14-16px
- Navigation: Lucide icons, 16-20px
- Hero/large: Lucide icons, 24px+

### Color Usage

- Primary actions: text-primary atau inherit dari button
- Accent marks: text-accent
- Metadata: text-text-muted
- On primary: text-white

---

## Motion & Animation

### Timing Functions

```
Default:  cubic-bezier(0.4, 0, 0.2, 1)
Ease-in:  cubic-bezier(0.4, 0, 1, 1)
Ease-out: cubic-bezier(0, 0, 0.2, 1)
```

### Duration

```
Fast:     150ms — micro-interactions (hover, focus)
Normal:   200ms — buttons, cards
Medium:   300ms — page transitions
Slow:     400ms — complex animations
```

### Common Transitions

**Card Hover**
```css
transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
hover: border-primary/40, shadow-md, translateY(-2px)
```

**Button State**
```css
transition: all 0.2s ease-in-out;
active: translateY(1px)
```

**Focus Ring**
```css
transition: border-color 0.2s, box-shadow 0.2s;
focus: ring-3, ring-primary/50
```

---

## Responsive Breakpoints

```
Mobile:  < 640px  (default design baseline)
Tablet:  640px+   (sm)
Desktop: 1024px+  (lg)
Wide:    1280px+  (xl)
```

### Mobile-First Strategy

- Desain default untuk mobile (touch-first, simplified)
- Progressive enhancement untuk tablet dan desktop
- Clamp typography untuk smooth scaling
- Grid yang collapse gracefully

---

## Accessibility Guidelines

### WCAG AA Compliance

✓ All text contrast ≥ 4.5:1 (body text)
✓ All large text contrast ≥ 3:1 (18pt+ or 14pt bold)
✓ Interactive elements ≥ 44×44px touch target (mobile)
✓ Focus indicators visible and clear
✓ Status communicated via icon + text + color
✓ Semantic HTML structure

### Focus States

```
Default focus ring:
  outline: none
  ring-3 ring-ring/50 (primary blue, 50% opacity)
  border: border-ring

Destructive focus:
  ring-3 ring-destructive/20
  border: border-destructive
```

### Screen Reader Support

- Semantic HTML elements (button, nav, main, article)
- ARIA labels untuk icon-only buttons
- Status badges include text labels, not just colors
- Form inputs dengan proper labels
- Skip links untuk navigasi keyboard

---

## Dark Mode (Prepared)

Dark mode tokens sudah tersedia di `globals.css` dengan prefix `.dark`:

**Primary colors adjusted:**
- Primary: #4A82BF (brighter)
- Background: #0F1722 (deep blue-black)
- Surface: #162232 (elevated)
- Text: #F6F9FC (inverted, high contrast)

**Status colors:** Warna lebih cerah dengan background lebih gelap untuk maintain contrast ratio

**Implementation:** Belum aktif di UI, perlu toggle theme switcher

---

## Design Tokens Reference

### CSS Variables

Semua design tokens tersedia sebagai CSS custom properties:

**Brand:**
- `--color-primary`
- `--color-primary-dark`
- `--color-primary-soft`
- `--color-accent`
- `--color-accent-soft`

**Neutral:**
- `--color-background`
- `--color-surface`
- `--color-border`
- `--color-text`
- `--color-text-muted`
- `--color-text-on-primary`

**Status:** (8 status × 2 tokens each)
- `--color-status-{status}-text`
- `--color-status-{status}-bg`

**Layout:**
- `--radius` (base radius)
- `--font-sans` (Poppins)

### Tailwind Extensions

Status colors dapat diakses via Tailwind utilities:
- `text-status-diterima-text`
- `bg-status-diterima-bg`
- (dan seterusnya untuk semua status)

---

## Component Patterns

### Information Hierarchy

1. **Page Title (H1)** — Apa halaman ini
2. **Section Title (H2)** — Bagian-bagian utama
3. **Card Title (H3)** — Item individual
4. **Body Text** — Konten detail
5. **Metadata** — Supporting information (small, muted)

### Color Usage Priority

1. **Primary Blue** — Main actions, links, active states
2. **Accent Terracotta** — Special emphasis, alerts, important metadata
3. **Status Colors** — Status badges only
4. **Neutral** — All other UI (text, borders, backgrounds)

### Spacing Consistency

- Card padding: 1.25rem (20px) mobile, 1.5rem (24px) desktop
- Section gap: 4rem (64px) desktop, 3rem (48px) mobile
- Component gap: 1rem (16px) default
- Inline elements: 0.5rem (8px) gap

---

## File References

**Implementation:**
- Colors: `src/app/globals.css` (CSS variables)
- Theme config: `src/config/theme.ts` (TypeScript constants)
- Components: `src/components/ui/` dan `src/components/shared/`

**Documentation:**
- Product vision: [`PRODUCT.md`](./PRODUCT.md)
- Architecture: [`ARCHITECTURE.md`](./ARCHITECTURE.md)
- Development: [`DEVELOPMENT.md`](./DEVELOPMENT.md)

---

*Sistem desain ini hidup dan berkembang. Update dokumen ini saat menambahkan komponen atau pattern baru.*
