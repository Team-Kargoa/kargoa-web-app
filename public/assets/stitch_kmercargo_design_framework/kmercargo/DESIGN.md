---
name: KmerCargo
colors:
  surface: '#fff8f4'
  surface-dim: '#e8d7ca'
  surface-bright: '#fff8f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff1e7'
  surface-container: '#fcebdd'
  surface-container-high: '#f6e5d7'
  surface-container-highest: '#f0e0d2'
  on-surface: '#221a12'
  on-surface-variant: '#544434'
  inverse-surface: '#382f25'
  inverse-on-surface: '#ffeee0'
  outline: '#877462'
  outline-variant: '#dac2ae'
  surface-tint: '#895100'
  primary: '#895100'
  on-primary: '#ffffff'
  primary-container: '#ff9f1c'
  on-primary-container: '#683c00'
  inverse-primary: '#ffb86b'
  secondary: '#4059aa'
  on-secondary: '#ffffff'
  secondary-container: '#8fa7fe'
  on-secondary-container: '#1d3989'
  tertiary: '#006686'
  on-tertiary: '#ffffff'
  tertiary-container: '#00c3fd'
  on-tertiary-container: '#004d66'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdcbc'
  primary-fixed-dim: '#ffb86b'
  on-primary-fixed: '#2c1700'
  on-primary-fixed-variant: '#683d00'
  secondary-fixed: '#dce1ff'
  secondary-fixed-dim: '#b6c4ff'
  on-secondary-fixed: '#00164e'
  on-secondary-fixed-variant: '#264191'
  tertiary-fixed: '#c0e8ff'
  tertiary-fixed-dim: '#70d2ff'
  on-tertiary-fixed: '#001e2b'
  on-tertiary-fixed-variant: '#004d66'
  background: '#fff8f4'
  on-background: '#221a12'
  surface-variant: '#f0e0d2'
  success-momo: '#10B981'
  bg-light: '#F8FAFC'
  bg-dark: '#0F172A'
  text-primary-light: '#0F172A'
  text-secondary-light: '#64748B'
  text-primary-dark: '#F8FAFC'
  text-secondary-dark: '#94A3B8'
  border-light: '#E2E8F0'
  border-dark: '#334155'
typography:
  h1:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  h1-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  h2:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  h2-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  data-display:
    fontFamily: JetBrains Mono
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
    letterSpacing: -0.02em
  data-label:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  button:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  touch-target-min: 56px
---

# KmerCargo Design System

## Brand Identity & Personality
KmerCargo is a high-visibility, reliable, and trustworthy logistics platform for Yaoundé. The design system bridges professional heavy-utility logistics with a vibrant Cameroonian market context, optimized for high-glare outdoor environments and low-bandwidth utility.

## Color Palette

### Core Brand Colors
- **Primary (Safety Amber):** `#FF9F1C` - Commands attention, signifies moving freight and transport. High visibility on low-brightness screens.
- **Secondary (Trust Blue):** `#1E3A8A` - Deep Navy. Establishes institutional trust and security. Matches banking app psychological branding.
- **Success (MoMo Green):** `#10B981` - Emerald Green. Signifies completed trips and digital wallet approvals.

### Neutral Palette (Light Mode)
- **Background:** `#F8FAFC` (Slate Off-White) - Reduces eye strain.
- **Surface:** `#FFFFFF` (Pure White) - For cards and elevated elements.
- **Text Primary:** `#0F172A` (Deep Slate) - High contrast for titles and headers.
- **Text Secondary:** `#64748B` (Muted Grey) - For subtitles and metadata.
- **Border:** `#E2E8F0` (Light Grey) - For subtle dividers.

### Neutral Palette (Dark Mode)
- **Background:** `#0F172A` (Deep Slate) - Mandatory for Driver App to save battery.
- **Surface:** `#1E293B` (Elevated Slate) - For cards and elevated elements.
- **Text Primary:** `#F8FAFC` (Slate White) - High contrast for readability.
- **Text Secondary:** `#94A3B8` (Light Grey) - Muted text.
- **Border:** `#334155` (Dark Grey) - For dividers.

## Typography
- **Primary System Font:** `Inter` - For UI labels, buttons, and body copy. High readability at small sizes.
- **Secondary/Header Font:** `Plus Jakarta Sans` - Modern, tech-forward identity for headers and screen titles.
- **Monospace Font:** `JetBrains Mono` - For prices (XAF), tracking numbers, license plates, and OTP codes.

## UI Components & Design Rules
- **Corner Radius:** `12px` for buttons and cards.
- **Primary Button Height:** `56px` (minimum touch target of 56dp).
- **Iconography:** Phosphor Icons (Bold Style) or Lucide. Minimum 2px line weight.
- **Navigation Rule:** Icons must always be accompanied by a text label.
- **Accessibility:** High contrast for outdoor use. Primary buttons use Safety Amber (`#FF9F1C`) with Deep Slate (`#0F172A`) text for maximum contrast.

## Application Strategy
- **Customer App:** Navy structure with Amber CTAs.
- **Driver App:** Locked to Dark Mode for battery efficiency and glare reduction. Amber for critical alerts and route polylines.
- **Admin Dashboard:** Default Light Mode with high-density data tables.
