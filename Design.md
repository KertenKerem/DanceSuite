# 💃 Dans Okulu Yönetim Paneli - Tasarım Standartları

> **Estetik Yön:** Dinamik Elegans — Hareketin akışkanlığını minimalist lüks ile birleştiren, profesyonel ama enerjik bir tasarım dili.

---

## 1. Tasarım Felsefesi

### Temel Prensipler
- **Akışkanlık**: Dansın doğasını yansıtan yumuşak geçişler ve organik formlar
- **Netlik**: Yönetim paneli olarak fonksiyonellik öncelikli, karmaşıklıktan kaçınma
- **Enerji**: Canlı vurgular ve mikro animasyonlarla dinamik bir deneyim
- **Tutarlılık**: Her ekranda aynı tasarım dilini koruma

### Hedef Kullanıcılar
- Dans okulu yöneticileri ve sekreterler
- Dans eğitmenleri
- Muhasebe personeli

---

## 2. Renk Paleti

### Ana Renkler (CSS Variables)

```css
:root {
  /* Primary - Derin Mor (Zarafet & Hareket) */
  --color-primary-50: #faf5ff;
  --color-primary-100: #f3e8ff;
  --color-primary-200: #e9d5ff;
  --color-primary-300: #d8b4fe;
  --color-primary-400: #c084fc;
  --color-primary-500: #a855f7;
  --color-primary-600: #9333ea;
  --color-primary-700: #7e22ce;
  --color-primary-800: #6b21a8;
  --color-primary-900: #581c87;

  /* Secondary - Mercan Turuncu (Enerji & Tutku) */
  --color-secondary-50: #fff7ed;
  --color-secondary-100: #ffedd5;
  --color-secondary-200: #fed7aa;
  --color-secondary-300: #fdba74;
  --color-secondary-400: #fb923c;
  --color-secondary-500: #f97316;
  --color-secondary-600: #ea580c;
  --color-secondary-700: #c2410c;
  --color-secondary-800: #9a3412;
  --color-secondary-900: #7c2d12;

  /* Accent - Altın (Başarı & Premium) */
  --color-accent-light: #fef3c7;
  --color-accent: #f59e0b;
  --color-accent-dark: #b45309;

  /* Nötr - Grayscale */
  --color-neutral-0: #ffffff;
  --color-neutral-50: #fafafa;
  --color-neutral-100: #f4f4f5;
  --color-neutral-200: #e4e4e7;
  --color-neutral-300: #d4d4d8;
  --color-neutral-400: #a1a1aa;
  --color-neutral-500: #71717a;
  --color-neutral-600: #52525b;
  --color-neutral-700: #3f3f46;
  --color-neutral-800: #27272a;
  --color-neutral-900: #18181b;
  --color-neutral-950: #09090b;

  /* Semantic Renkler */
  --color-success: #10b981;
  --color-success-light: #d1fae5;
  --color-warning: #f59e0b;
  --color-warning-light: #fef3c7;
  --color-error: #ef4444;
  --color-error-light: #fee2e2;
  --color-info: #3b82f6;
  --color-info-light: #dbeafe;
}
```

### Tema Modları

#### Light Mode (Varsayılan)
```css
[data-theme="light"] {
  --bg-primary: var(--color-neutral-0);
  --bg-secondary: var(--color-neutral-50);
  --bg-tertiary: var(--color-neutral-100);
  --bg-sidebar: linear-gradient(180deg, var(--color-primary-900) 0%, var(--color-primary-800) 100%);
  
  --text-primary: var(--color-neutral-900);
  --text-secondary: var(--color-neutral-600);
  --text-tertiary: var(--color-neutral-400);
  --text-inverse: var(--color-neutral-0);
  
  --border-default: var(--color-neutral-200);
  --border-subtle: var(--color-neutral-100);
}
```

#### Dark Mode
```css
[data-theme="dark"] {
  --bg-primary: var(--color-neutral-950);
  --bg-secondary: var(--color-neutral-900);
  --bg-tertiary: var(--color-neutral-800);
  --bg-sidebar: linear-gradient(180deg, var(--color-neutral-950) 0%, var(--color-primary-900) 100%);
  
  --text-primary: var(--color-neutral-50);
  --text-secondary: var(--color-neutral-400);
  --text-tertiary: var(--color-neutral-500);
  --text-inverse: var(--color-neutral-900);
  
  --border-default: var(--color-neutral-700);
  --border-subtle: var(--color-neutral-800);
}
```

---

## 3. Tipografi

### Font Ailesi

```css
:root {
  /* Display & Başlıklar - Karakterli ve Zarif */
  --font-display: 'Playfair Display', Georgia, serif;
  
  /* Body & UI - Modern ve Okunabilir */
  --font-body: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  
  /* Mono - Kod ve Sayılar */
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

### Google Fonts Import
```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### Tipografi Ölçeği

```css
:root {
  /* Font Sizes */
  --text-xs: 0.75rem;      /* 12px */
  --text-sm: 0.875rem;     /* 14px */
  --text-base: 1rem;       /* 16px */
  --text-lg: 1.125rem;     /* 18px */
  --text-xl: 1.25rem;      /* 20px */
  --text-2xl: 1.5rem;      /* 24px */
  --text-3xl: 1.875rem;    /* 30px */
  --text-4xl: 2.25rem;     /* 36px */
  --text-5xl: 3rem;        /* 48px */

  /* Font Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* Line Heights */
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;

  /* Letter Spacing */
  --tracking-tighter: -0.05em;
  --tracking-tight: -0.025em;
  --tracking-normal: 0;
  --tracking-wide: 0.025em;
  --tracking-wider: 0.05em;
}
```

### Tipografi Bileşenleri

```css
/* Sayfa Başlığı */
.heading-page {
  font-family: var(--font-display);
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  color: var(--text-primary);
}

/* Bölüm Başlığı */
.heading-section {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
  color: var(--text-primary);
}

/* Kart Başlığı */
.heading-card {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
  color: var(--text-primary);
}

/* Body Text */
.text-body {
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--text-secondary);
}

/* Small / Caption */
.text-caption {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--text-tertiary);
}

/* Label */
.text-label {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  line-height: var(--leading-normal);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--text-tertiary);
}
```

---

## 4. Spacing Sistemi

### Base Spacing (8px Grid)

```css
:root {
  --space-0: 0;
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
  --space-24: 6rem;     /* 96px */
}
```

### Kullanım Kuralları

| Kullanım Alanı | Spacing Token |
|----------------|---------------|
| Icon ile metin arası | `--space-2` |
| Form elemanları arası | `--space-4` |
| Kart içi padding | `--space-5` veya `--space-6` |
| Bölümler arası | `--space-8` veya `--space-10` |
| Sayfa kenar boşlukları | `--space-6` (mobil) / `--space-8` (desktop) |
| Sidebar padding | `--space-4` |

---

## 5. Border & Radius

```css
:root {
  /* Border Radius */
  --radius-none: 0;
  --radius-sm: 0.25rem;    /* 4px - Küçük elemanlar */
  --radius-md: 0.5rem;     /* 8px - Butonlar, inputlar */
  --radius-lg: 0.75rem;    /* 12px - Kartlar */
  --radius-xl: 1rem;       /* 16px - Modal, dropdown */
  --radius-2xl: 1.5rem;    /* 24px - Büyük kartlar */
  --radius-full: 9999px;   /* Pill shape */

  /* Border Width */
  --border-width-thin: 1px;
  --border-width-medium: 2px;
  --border-width-thick: 3px;
}
```

---

## 6. Gölge Sistemi

```css
:root {
  /* Elevation Shadows */
  --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);

  /* Colored Shadows (Hover states için) */
  --shadow-primary: 0 4px 14px 0 rgb(168 85 247 / 0.3);
  --shadow-secondary: 0 4px 14px 0 rgb(249 115 22 / 0.3);

  /* Inner Shadow */
  --shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
}
```

### Kullanım Kuralları

| Eleman | Gölge |
|--------|-------|
| Kart (varsayılan) | `--shadow-sm` |
| Kart (hover) | `--shadow-md` |
| Dropdown / Popover | `--shadow-lg` |
| Modal | `--shadow-xl` |
| Floating Action Button | `--shadow-lg` + `--shadow-primary` |

---

## 7. Animasyon & Geçişler

### Timing Functions

```css
:root {
  /* Easing Curves */
  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --ease-smooth: cubic-bezier(0.25, 0.1, 0.25, 1);

  /* Durations */
  --duration-instant: 75ms;
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 500ms;
}
```

### Standart Geçişler

```css
/* Varsayılan Geçiş */
.transition-default {
  transition: all var(--duration-normal) var(--ease-smooth);
}

/* Renk Geçişi */
.transition-colors {
  transition: color var(--duration-fast) var(--ease-out),
              background-color var(--duration-fast) var(--ease-out),
              border-color var(--duration-fast) var(--ease-out);
}

/* Transform Geçişi */
.transition-transform {
  transition: transform var(--duration-normal) var(--ease-out);
}

/* Opacity Geçişi */
.transition-opacity {
  transition: opacity var(--duration-normal) var(--ease-out);
}
```

### Animasyon Keyframes

```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide In Up */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Slide In Right (Sidebar için) */
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Scale In */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Pulse (Bildirim için) */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Spin (Loading için) */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Shimmer (Skeleton loading için) */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Dans Dalgası (Özel dekoratif) */
@keyframes danceWave {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-5px) rotate(2deg); }
  75% { transform: translateY(5px) rotate(-2deg); }
}
```

### Sayfa Yükleme Animasyonları

```css
/* Staggered Reveal - Elemanlar sırayla belirir */
.stagger-reveal > * {
  animation: slideInUp var(--duration-slow) var(--ease-out) both;
}

.stagger-reveal > *:nth-child(1) { animation-delay: 0ms; }
.stagger-reveal > *:nth-child(2) { animation-delay: 50ms; }
.stagger-reveal > *:nth-child(3) { animation-delay: 100ms; }
.stagger-reveal > *:nth-child(4) { animation-delay: 150ms; }
.stagger-reveal > *:nth-child(5) { animation-delay: 200ms; }
.stagger-reveal > *:nth-child(6) { animation-delay: 250ms; }
```

---

## 8. Bileşen Standartları

### 8.1 Butonlar

```css
/* Base Button */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  line-height: 1;
  border-radius: var(--radius-md);
  border: var(--border-width-thin) solid transparent;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

/* Primary Button */
.btn-primary {
  background: linear-gradient(135deg, var(--color-primary-600) 0%, var(--color-primary-700) 100%);
  color: var(--color-neutral-0);
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%);
  box-shadow: var(--shadow-primary);
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: translateY(0);
}

/* Secondary Button */
.btn-secondary {
  background: var(--color-neutral-0);
  color: var(--color-primary-700);
  border-color: var(--color-primary-300);
}

.btn-secondary:hover {
  background: var(--color-primary-50);
  border-color: var(--color-primary-400);
}

/* Ghost Button */
.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
}

.btn-ghost:hover {
  background: var(--color-neutral-100);
  color: var(--text-primary);
}

/* Danger Button */
.btn-danger {
  background: var(--color-error);
  color: var(--color-neutral-0);
}

.btn-danger:hover {
  background: #dc2626;
}

/* Button Sizes */
.btn-sm {
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-xs);
}

.btn-lg {
  padding: var(--space-4) var(--space-6);
  font-size: var(--text-base);
}

/* Icon Button */
.btn-icon {
  padding: var(--space-2);
  aspect-ratio: 1;
}

/* Disabled State */
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}
```

### 8.2 Form Elemanları

```css
/* Input Base */
.input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  font-family: var(--font-body);
  font-size: var(--text-base);
  color: var(--text-primary);
  background: var(--bg-primary);
  border: var(--border-width-thin) solid var(--border-default);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-out);
}

.input::placeholder {
  color: var(--text-tertiary);
}

.input:hover {
  border-color: var(--color-neutral-300);
}

.input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.input:disabled {
  background: var(--color-neutral-100);
  cursor: not-allowed;
}

/* Input Error State */
.input-error {
  border-color: var(--color-error);
}

.input-error:focus {
  box-shadow: 0 0 0 3px var(--color-error-light);
}

/* Input Success State */
.input-success {
  border-color: var(--color-success);
}

/* Label */
.label {
  display: block;
  margin-bottom: var(--space-2);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

/* Helper Text */
.helper-text {
  margin-top: var(--space-1);
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

.helper-text-error {
  color: var(--color-error);
}

/* Select */
.select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right var(--space-3) center;
  padding-right: var(--space-10);
}

/* Checkbox & Radio Base */
.checkbox,
.radio {
  width: 1.125rem;
  height: 1.125rem;
  accent-color: var(--color-primary-600);
  cursor: pointer;
}

/* Textarea */
.textarea {
  min-height: 120px;
  resize: vertical;
}
```

### 8.3 Kartlar

```css
/* Base Card */
.card {
  background: var(--bg-primary);
  border: var(--border-width-thin) solid var(--border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: all var(--duration-normal) var(--ease-out);
}

.card:hover {
  box-shadow: var(--shadow-md);
}

/* Interactive Card */
.card-interactive {
  cursor: pointer;
}

.card-interactive:hover {
  transform: translateY(-2px);
  border-color: var(--color-primary-200);
}

/* Card Sections */
.card-header {
  padding: var(--space-5);
  border-bottom: var(--border-width-thin) solid var(--border-subtle);
}

.card-body {
  padding: var(--space-5);
}

.card-footer {
  padding: var(--space-4) var(--space-5);
  background: var(--bg-secondary);
  border-top: var(--border-width-thin) solid var(--border-subtle);
}

/* Stat Card (Dashboard için) */
.card-stat {
  position: relative;
  overflow: hidden;
}

.card-stat::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, var(--color-primary-100) 0%, transparent 60%);
  border-radius: 0 0 0 100%;
  opacity: 0.5;
}
```

### 8.4 Tablo

```css
/* Table Container */
.table-container {
  overflow-x: auto;
  border: var(--border-width-thin) solid var(--border-default);
  border-radius: var(--radius-lg);
}

/* Table */
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);
}

/* Table Header */
.table thead {
  background: var(--bg-secondary);
}

.table th {
  padding: var(--space-3) var(--space-4);
  font-weight: var(--font-semibold);
  text-align: left;
  color: var(--text-secondary);
  white-space: nowrap;
}

/* Table Body */
.table td {
  padding: var(--space-4);
  border-top: var(--border-width-thin) solid var(--border-subtle);
  color: var(--text-primary);
}

/* Table Row Hover */
.table tbody tr {
  transition: background var(--duration-fast) var(--ease-out);
}

.table tbody tr:hover {
  background: var(--color-primary-50);
}

/* Table Row Selected */
.table tbody tr.selected {
  background: var(--color-primary-100);
}
```

### 8.5 Modal

```css
/* Modal Overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgb(0 0 0 / 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  z-index: 50;
  animation: fadeIn var(--duration-normal) var(--ease-out);
}

/* Modal Content */
.modal {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-2xl);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  animation: scaleIn var(--duration-normal) var(--ease-out);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-5);
  border-bottom: var(--border-width-thin) solid var(--border-subtle);
}

.modal-body {
  padding: var(--space-5);
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  background: var(--bg-secondary);
  border-top: var(--border-width-thin) solid var(--border-subtle);
}
```

### 8.6 Sidebar Navigasyon

```css
/* Sidebar */
.sidebar {
  width: 260px;
  min-height: 100vh;
  background: var(--bg-sidebar);
  color: var(--text-inverse);
  display: flex;
  flex-direction: column;
  transition: width var(--duration-slow) var(--ease-smooth);
}

.sidebar-collapsed {
  width: 72px;
}

/* Sidebar Logo */
.sidebar-logo {
  padding: var(--space-5);
  border-bottom: 1px solid rgb(255 255 255 / 0.1);
}

/* Sidebar Nav */
.sidebar-nav {
  flex: 1;
  padding: var(--space-4);
  overflow-y: auto;
}

/* Nav Item */
.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  color: rgb(255 255 255 / 0.7);
  text-decoration: none;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: all var(--duration-fast) var(--ease-out);
}

.nav-item:hover {
  background: rgb(255 255 255 / 0.1);
  color: var(--color-neutral-0);
}

.nav-item.active {
  background: rgb(255 255 255 / 0.15);
  color: var(--color-neutral-0);
}

/* Nav Group */
.nav-group-label {
  padding: var(--space-4) var(--space-4) var(--space-2);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wider);
  color: rgb(255 255 255 / 0.4);
}
```

### 8.7 Badge & Tag

```css
/* Badge Base */
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-2);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  border-radius: var(--radius-full);
}

/* Badge Variants */
.badge-primary {
  background: var(--color-primary-100);
  color: var(--color-primary-700);
}

.badge-secondary {
  background: var(--color-secondary-100);
  color: var(--color-secondary-700);
}

.badge-success {
  background: var(--color-success-light);
  color: var(--color-success);
}

.badge-warning {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.badge-error {
  background: var(--color-error-light);
  color: var(--color-error);
}

.badge-neutral {
  background: var(--color-neutral-100);
  color: var(--color-neutral-600);
}

/* Dans Türü Etiketleri */
.tag-salsa { background: #fee2e2; color: #b91c1c; }
.tag-bachata { background: #fef3c7; color: #b45309; }
.tag-tango { background: #fce7f3; color: #be185d; }
.tag-hiphop { background: #e0e7ff; color: #4338ca; }
.tag-bale { background: #f3e8ff; color: #7e22ce; }
.tag-modern { background: #d1fae5; color: #047857; }
```

### 8.8 Avatar

```css
/* Avatar Base */
.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--color-primary-400) 0%, var(--color-primary-600) 100%);
  color: var(--color-neutral-0);
  font-weight: var(--font-semibold);
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Avatar Sizes */
.avatar-xs { width: 24px; height: 24px; font-size: 10px; }
.avatar-sm { width: 32px; height: 32px; font-size: var(--text-xs); }
.avatar-md { width: 40px; height: 40px; font-size: var(--text-sm); }
.avatar-lg { width: 48px; height: 48px; font-size: var(--text-base); }
.avatar-xl { width: 64px; height: 64px; font-size: var(--text-lg); }
.avatar-2xl { width: 96px; height: 96px; font-size: var(--text-2xl); }

/* Avatar Group */
.avatar-group {
  display: flex;
}

.avatar-group .avatar {
  border: 2px solid var(--bg-primary);
  margin-left: -8px;
}

.avatar-group .avatar:first-child {
  margin-left: 0;
}
```

### 8.9 Toast / Notification

```css
/* Toast Container */
.toast-container {
  position: fixed;
  bottom: var(--space-6);
  right: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  z-index: 100;
}

/* Toast */
.toast {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  min-width: 320px;
  max-width: 420px;
  animation: slideInUp var(--duration-normal) var(--ease-out);
}

.toast-success { border-left: 4px solid var(--color-success); }
.toast-error { border-left: 4px solid var(--color-error); }
.toast-warning { border-left: 4px solid var(--color-warning); }
.toast-info { border-left: 4px solid var(--color-info); }
```

### 8.10 Loading States

```css
/* Spinner */
.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid var(--color-neutral-200);
  border-top-color: var(--color-primary-600);
  border-radius: var(--radius-full);
  animation: spin var(--duration-slower) linear infinite;
}

.spinner-sm { width: 16px; height: 16px; border-width: 2px; }
.spinner-lg { width: 32px; height: 32px; border-width: 4px; }

/* Skeleton */
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-neutral-200) 25%,
    var(--color-neutral-100) 50%,
    var(--color-neutral-200) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-md);
}

.skeleton-text {
  height: 1em;
  margin-bottom: var(--space-2);
}

.skeleton-title {
  height: 1.5em;
  width: 60%;
  margin-bottom: var(--space-3);
}

.skeleton-avatar {
  border-radius: var(--radius-full);
}
```

---

## 9. Layout Sistemi

### Container

```css
.container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}

@media (min-width: 1536px) {
  .container {
    max-width: 1400px;
  }
}
```

### Sayfa Yapısı

```css
/* App Layout */
.app-layout {
  display: flex;
  min-height: 100vh;
}

/* Main Content Area */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

/* Top Header */
.top-header {
  height: 64px;
  padding: 0 var(--space-6);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-primary);
  border-bottom: var(--border-width-thin) solid var(--border-default);
  position: sticky;
  top: 0;
  z-index: 10;
}

/* Page Content */
.page-content {
  flex: 1;
  padding: var(--space-6);
  background: var(--bg-secondary);
}

/* Page Header */
.page-header {
  margin-bottom: var(--space-6);
}

.page-header-actions {
  display: flex;
  gap: var(--space-3);
}
```

### Grid Sistemi

```css
/* Responsive Grid */
.grid {
  display: grid;
  gap: var(--space-6);
}

.grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }

@media (max-width: 768px) {
  .md\:grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
  .md\:grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .sm\:grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
}

/* Dashboard Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--space-5);
}
```

---

## 10. Responsive Breakpoints

```css
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}

/* Mobile First Approach */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

### Mobile Adaptasyonları

```css
@media (max-width: 768px) {
  /* Sidebar mobile'da gizlenir, hamburger menu ile açılır */
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    transform: translateX(-100%);
    z-index: 50;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  /* Modal full-screen olur */
  .modal {
    max-width: 100%;
    max-height: 100%;
    border-radius: 0;
  }

  /* Tablo scroll edilebilir */
  .table-container {
    margin: 0 calc(-1 * var(--space-4));
    border-radius: 0;
  }
}
```

---

## 11. İkonlar

### Icon Kütüphanesi
**Lucide React** kullanılacaktır.

```jsx
import { 
  Home, Users, Calendar, DollarSign, Settings, 
  Music, Award, BarChart, Bell, Search, Menu,
  Plus, Edit, Trash2, Eye, Download, Upload,
  ChevronRight, ChevronDown, X, Check, AlertCircle
} from 'lucide-react';
```

### Icon Boyutları

```css
.icon-xs { width: 14px; height: 14px; }
.icon-sm { width: 16px; height: 16px; }
.icon-md { width: 20px; height: 20px; }
.icon-lg { width: 24px; height: 24px; }
.icon-xl { width: 32px; height: 32px; }
```

### Dans Türü İkonları (Custom SVG)
Her dans türü için özel ikon tasarlanabilir veya emoji kullanılabilir:
- 💃 Salsa
- 🌹 Tango
- 🎭 Bachata
- 🎤 Hip Hop
- 🩰 Bale
- 🌊 Modern

---

## 12. Z-Index Sistemi

```css
:root {
  --z-base: 0;
  --z-dropdown: 10;
  --z-sticky: 20;
  --z-fixed: 30;
  --z-modal-backdrop: 40;
  --z-modal: 50;
  --z-popover: 60;
  --z-tooltip: 70;
  --z-toast: 100;
}
```

---

## 13. Erişilebilirlik (Accessibility)

### Focus States

```css
/* Focus Visible Ring */
*:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--bg-primary), 0 0 0 4px var(--color-primary-500);
}

/* Skip Link */
.skip-link {
  position: absolute;
  top: -100%;
  left: 0;
  padding: var(--space-2) var(--space-4);
  background: var(--color-primary-600);
  color: var(--color-neutral-0);
  z-index: 1000;
}

.skip-link:focus {
  top: 0;
}
```

### ARIA Patterns
- Tüm interaktif elementler için `aria-label` kullanılmalı
- Modal açıldığında `aria-hidden` ile arka plan gizlenmeli
- Loading state'ler için `aria-busy` kullanılmalı
- Form hataları `aria-invalid` ve `aria-describedby` ile bağlanmalı

### Renk Kontrastı
- Normal metin: minimum 4.5:1 kontrast oranı
- Büyük metin: minimum 3:1 kontrast oranı
- UI bileşenleri: minimum 3:1 kontrast oranı

---

## 14. Data Visualization

### Grafik Renk Paleti

```css
:root {
  --chart-1: #a855f7;  /* Primary Purple */
  --chart-2: #f97316;  /* Secondary Orange */
  --chart-3: #10b981;  /* Success Green */
  --chart-4: #3b82f6;  /* Info Blue */
  --chart-5: #f59e0b;  /* Warning Yellow */
  --chart-6: #ec4899;  /* Pink */
  --chart-7: #06b6d4;  /* Cyan */
  --chart-8: #84cc16;  /* Lime */
}
```

### Grafik Stilleri (Recharts için)

```jsx
const chartConfig = {
  tooltip: {
    contentStyle: {
      background: 'var(--bg-primary)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-lg)',
    },
  },
  grid: {
    stroke: 'var(--border-subtle)',
    strokeDasharray: '3 3',
  },
  axis: {
    fontSize: 12,
    fontFamily: 'var(--font-body)',
    fill: 'var(--text-tertiary)',
  },
};
```

---

## 15. Sayfa Spesifik Stilleri

### Dashboard
- 4 adet stat kartı üstte
- Sol alt: Gelir grafiği (area chart)
- Sağ alt: Yaklaşan dersler listesi
- Widget'lar arasında `--space-6` boşluk

### Öğrenci Listesi
- Filtreleme toolbar'ı (arama, dans türü, durum)
- Tablo görünümü
- Bulk action toolbar (seçim yapıldığında)
- Pagination alt kısımda

### Ders Takvimi
- Haftalık/Aylık görünüm toggle
- Renk kodlu dans türleri
- Drag & drop desteği (ileri seviye)
- Sağ panel: ders detayları

### Öğretmen Profili
- Sol: Avatar ve temel bilgiler
- Sağ: Uzmanlık alanları, ders programı, performans metrikleri

---

## 16. Dosya Yapısı Önerisi

```
src/
├── styles/
│   ├── variables.css      # CSS custom properties
│   ├── base.css           # Reset ve base styles
│   ├── typography.css     # Font stilleri
│   ├── components/
│   │   ├── button.css
│   │   ├── card.css
│   │   ├── form.css
│   │   ├── table.css
│   │   ├── modal.css
│   │   └── ...
│   ├── layouts/
│   │   ├── sidebar.css
│   │   ├── header.css
│   │   └── page.css
│   └── utilities.css      # Helper classes
├── components/
│   ├── ui/                # Reusable UI components
│   └── features/          # Feature-specific components
└── pages/
```

---

## 17. Performans Rehberi

### CSS Optimizasyonu
- Critical CSS inline edilmeli
- Kullanılmayan CSS kaldırılmalı
- CSS custom properties ile runtime theming

### Animasyon Performansı
- `transform` ve `opacity` dışında animasyon kullanmaktan kaçın
- `will-change` dikkatli kullanılmalı
- `prefers-reduced-motion` medya query'si ile animasyonlar disable edilebilmeli

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 18. Versiyon & Güncelleme

| Versiyon | Tarih | Değişiklikler |
|----------|-------|---------------|
| 1.0.0 | Ocak 2026 | İlk sürüm |

---

> **Not**: Bu doküman, sistemin tutarlılığını sağlamak için tek kaynak olarak kullanılmalıdır. Herhangi bir tasarım kararı bu standartlara uygun olmalı veya bu doküman güncellenmelidir.
