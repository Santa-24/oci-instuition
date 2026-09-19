# OCI Platform Design System Specification

## 1. Design Philosophy
The OCI Mobile App design system is engineered to provide an **Awwwards-caliber**, high-density, ultra-responsive experience for education management across Students, Teachers, and Institute Admins.

---

## 2. Color Palette & Semantics

### Primary Brand Scale (Deep Slate Indigo)
- `AppColors.primary950` (`#1E1B4B`): Deep midnight canvas
- `AppColors.primary900` (`#312E81`): Rich navy
- `AppColors.primary800` (`#3730A3`): Container accents
- `AppColors.primary600` (`#4F46E5`): Core interactive CTA (Light theme)
- `AppColors.primary500` (`#6366F1`): Core interactive CTA (Dark theme)
- `AppColors.primary400` (`#818CF8`): Glows and dark-mode highlights
- `AppColors.primary100` (`#E0E7FF`): Soft light tinted surfaces

### Energetic Accents
- `AppColors.accentRose` (`#F43F5E`): Live badges, critical notifications, high priority CTAs
- `AppColors.accentAmber` (`#F59E0B`): Fee due alerts, test countdowns, warning highlights
- `AppColors.accentCyan` (`#06B6D4`): Academic analytics, study progress rings
- `AppColors.accentPurple` (`#8B5CF6`): Doubt inbox categories, teacher badges

### Semantic States
| Token | Hex | Role |
|---|---|---|
| `success` | `#10B981` | Paid fees, passed exams, active status |
| `warning` | `#F59E0B` | Due installments, pending reviews, upcoming exams |
| `error` | `#EF4444` | Overdue fees, failed tests, rejected submissions |
| `info` | `#3B82F6` | General announcements, batch notes |
| `liveRed` | `#FF2E4D` | Pulsing Live class indicators |

---

## 3. Typography Hierarchy

Fonts: **Outfit** for Display/Headlines & **Plus Jakarta Sans** for UI/Body.

| Style Token | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| `displayLarge` | 34pt | 700 (Bold) | 1.2 | Hero metrics, Welcome screens |
| `displayMedium` | 28pt | 700 (Bold) | 1.25 | Major dashboard headings |
| `displaySmall` | 24pt | 600 (SemiBold)| 1.3 | Module headers, Exam titles |
| `headlineLarge` | 22pt | 600 (SemiBold)| 1.35 | Section headers |
| `headlineMedium`| 18pt | 600 (SemiBold)| 1.4 | Card headers, Modal titles |
| `headlineSmall` | 16pt | 600 (SemiBold)| 1.4 | List item titles |
| `titleLarge` | 16pt | 600 (SemiBold)| 1.4 | Action bar titles |
| `titleMedium` | 14pt | 600 (SemiBold)| 1.4 | Form section subtitles |
| `bodyLarge` | 15pt | 400 (Regular) | 1.5 | Article text, Descriptions |
| `bodyMedium` | 14pt | 400 (Regular) | 1.5 | Default body text, Inputs |
| `bodySmall` | 12pt | 400 (Regular) | 1.4 | Captions, Metadata timestamps |
| `labelLarge` | 14pt | 600 (SemiBold)| 1.0 | Buttons, Tabs, Chips |
| `labelMedium` | 12pt | 500 (Medium) | 1.0 | Status pills, Small tags |
| `labelSmall` | 11pt | 600 (SemiBold)| 1.0 | Overline badges, Timers |

---

## 4. Spacing, Radii & Shadows

- **Grid Base**: 4pt / 8pt standard (`xxs: 4`, `xs: 8`, `sm: 12`, `md: 16`, `lg: 20`, `xl: 24`, `xxl: 32`, `huge: 48`).
- **Border Radii**:
  - `radiusSm` (8pt): Buttons, text fields, chips
  - `radiusMd` (12pt): Form containers, dialogs
  - `radiusLg` (16pt): Standard content cards
  - `radiusXxl` (24pt): Bottom sheets, hero banners
- **Elevation**:
  - Layered ambient shadows (`AppSpacing.shadowSm`, `shadowMd`, `shadowLg`).
  - Dark mode substitutes shadows with subtle border outlines (`#2E3A52`) and surface luminance levels.

---

## 5. Motion & Micro-Interactions

- **Live Pulse**: Pulsing glow effect on ongoing live classes with animated ring expansion.
- **Hero Transitions**: Smooth expansion between Course Card → Course Hub and Exam Card → Exam Room.
- **Staggered Entrances**: 50ms interval cascade for dashboard cards and lists.
- **Auto-Dismiss Feedback**: Floating Snackbars with interactive action dismissals.
