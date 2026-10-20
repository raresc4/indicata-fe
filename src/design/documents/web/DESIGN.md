---
name: Calm Academic Flow
colors:
  surface: '#faf9f6'
  surface-dim: '#dbdad7'
  surface-bright: '#faf9f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f0'
  surface-container: '#efeeeb'
  surface-container-high: '#e9e8e5'
  surface-container-highest: '#e3e2df'
  on-surface: '#1b1c1a'
  on-surface-variant: '#43474f'
  inverse-surface: '#2f312f'
  inverse-on-surface: '#f2f1ee'
  outline: '#747780'
  outline-variant: '#c3c6d0'
  surface-tint: '#3f5f92'
  primary: '#0e3566'
  on-primary: '#ffffff'
  primary-container: '#2b4c7e'
  on-primary-container: '#9ebdf7'
  inverse-primary: '#a9c7ff'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e2dfde'
  on-secondary-container: '#636262'
  tertiary: '#363531'
  on-tertiary: '#ffffff'
  tertiary-container: '#4d4c48'
  on-tertiary-container: '#bfbcb6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#a9c7ff'
  on-primary-fixed: '#001b3d'
  on-primary-fixed-variant: '#254778'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1b1b1c'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#e5e2dc'
  tertiary-fixed-dim: '#c9c6c0'
  on-tertiary-fixed: '#1c1c18'
  on-tertiary-fixed-variant: '#474742'
  background: '#faf9f6'
  on-background: '#1b1c1a'
  surface-variant: '#e3e2df'
typography:
  display:
    fontFamily: Newsreader
    fontSize: 2.25rem
    fontWeight: '400'
    lineHeight: 2.75rem
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Newsreader
    fontSize: 1.75rem
    fontWeight: '400'
    lineHeight: 2.25rem
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Newsreader
    fontSize: 1.5rem
    fontWeight: '400'
    lineHeight: 2rem
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Newsreader
    fontSize: 1.25rem
    fontWeight: '500'
    lineHeight: 1.75rem
  body-lg:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.6rem
  body-md:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.45rem
  body-sm:
    fontFamily: Inter
    fontSize: 0.8125rem
    fontWeight: '400'
    lineHeight: 1.35rem
  label-md:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '500'
    lineHeight: 1.25rem
  label-sm:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '500'
    lineHeight: 1rem
    letterSpacing: 0.02em
  caption:
    fontFamily: Inter
    fontSize: 0.6875rem
    fontWeight: '400'
    lineHeight: 1rem
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system embodies a scholarly, contemplative, and hyper-minimalist philosophy. Inspired by the quiet dignity of research libraries, editorial craft, and modern knowledge tools like Notion and Elicit, the environment rejects noise, marketing distraction, and high-frequency visual stimulation.

The target audience consists of researchers, academics, writers, and thoughtful professionals who value deep work and quiet utility. The UI should evoke calmness, mental clarity, and implicit trust—treating authentication and interaction not as sales funnels, but as a quiet threshold into a focused workspace.

The core aesthetic combines **Editorial Minimalism** with **Warm Tactile Precision**:
- Single-focus layouts centered with purposeful negative space.
- Subtle editorial paper tones replacing harsh digital grays.
- An interplay between a refined literary serif and a utilitarian, crystal-clear sans-serif.
- Restrained interactions with subtle micro-transitions that never demand undue attention.

## Colors

The palette is rooted in archival paper and classic printer’s ink, punctuated by an understated scholar blue.

- **Background Canvas (`#F7F6F3`)**: A warm, tactile paper ground reminiscent of archival book stock and editorial notebooks, preventing screen glare.
- **Surface Card (`#FFFFFF`)**: Pure, unadorned white reserved strictly for interaction containers, elevating focus naturally above the canvas.
- **Primary Ink (`#1E1E1E`)**: A softened carbon black used for titles, heavy headers, and authoritative text, avoiding the synthetic harshness of `#000000`.
- **Secondary / Muted Text (`#6E6D68`)**: A neutral stone-gray balancing contrast and calm, deployed for subtitles, microcopy, and form labels.
- **Borders & Dividers (`#E8E6E1`)**: Whisper-soft warm boundaries that separate elements structurally without visual weight.
- **Accent Scholar Blue (`#2B4C7E`)**: An Oxford-inspired navy used selectively for primary actions, active input focus states, and text links.

## Typography

The typography establishes an intentional dialogue between classical scholarship and technical utility.

- **Newsreader** serves as the primary editorial voice. Set at regular and medium weights with slight negative tracking, it introduces a humanistic, contemplative cadence to page headers, branding marks, and modal titles.
- **Inter** provides neutral functional efficiency for form inputs, interactive controls, legal disclaimers, and metadata. It prevents the editorial tone from turning ornate or archaic, anchoring the system firmly within contemporary software craftsmanship.
- Generous line heights are enforced across all levels to preserve breathing room and readability.

## Layout & Spacing

The layout philosophy rejects split-screen marketing layouts, side banners, and promotional UI ornamentation. Instead, it relies on a focused single-column architecture centered within the viewport.

- **Container Constraints**: The main interactive surface adheres to a strict maximum width of `420px` to `440px`, ensuring optimal reading length and immediate form scanning.
- **Rhythm**: Spacing follows an 8pt modular scale with 4pt half-steps (`0.25rem`). Inputs and structural elements use comfortable internal breathing space (`space-md` to `space-lg`), separating actions cleanly without dense stacking.
- **Responsive Adaptations**:
  - **Mobile (<640px)**: The container fills the horizontal safe area minus `margin` (1rem), resting as an organic panel or borderless card on the warm canvas.
  - **Tablet & Desktop (≥640px)**: The card floats precisely in the center of the viewport, surrounded by abundant, calming negative space (`margin-desktop`), with subtle utility items (such as the language switcher `RO / EN` and subtle copyright links) anchored cleanly at the periphery.

## Elevation & Depth

Visual hierarchy avoids heavy shadows, saturated glows, or glossy multi-tier glassmorphism. Depth is achieved through gentle atmospheric separation and delicate line work:

- **Ambient Grounding**: Surfaces use a bespoke, ultra-soft shadow: `0 4px 20px -2px rgba(30, 30, 30, 0.03), 0 2px 6px -1px rgba(30, 30, 30, 0.02)`. This anchors the white card gently above the `#F7F6F3` canvas like a pristine sheet of paper resting on an oak desk.
- **Low-Contrast Outlines**: Cards and inputs leverage a crisp 1px border colored in `#E8E6E1`. There are no high-contrast dark borders; structural delineation remains quiet and refined.
- **Focus Elevation**: Active or focused elements do not jump upward in z-space. Focus states transition smoothly to an accent hairline ring (`1px solid #2B4C7E` accompanied by `0 0 0 3px rgba(43, 76, 126, 0.08)`), preserving total spatial stillness.

## Shapes

The geometric approach follows subtle softening (`roundedness: 1`). 

- Default inputs, secondary auth buttons, and interactive containers use `0.375rem` (6px) or `0.25rem` (4px) radii, avoiding both rigid, harsh brutalist corners and overly rounded casual pill aesthetics.
- The primary surface container applies a restrained `0.5rem` to `0.75rem` radius, mirroring the subtle cut of fine bookbinding and stationery.
- Micro-elements such as badge counters, selection indicators, and language toggles conform to the same soft, orderly profile.

## Components

### Buttons
- **Primary Action**: Solid `#2B4C7E` background with pure `#FFFFFF` typography (`label-md`). Hover state gently shifts to `#233E67`. Micro-transitions are set to `150ms ease-in-out`.
- **Secondary & OAuth Buttons**: Pure `#FFFFFF` surface with a 1px `#E8E6E1` border and `#1E1E1E` text. Hover introduces a whisper of `#F7F6F3` fill and `#DDD9D2` border. Icons (Google, Apple, ORCID, GitHub) are restrained to monochrome or desaturated authentic marks.
- **Tertiary / Text Link**: Clean inline text with `#2B4C7E` or `#6E6D68`, transitioning with an understated underline decoration on hover.

### Input Fields
- Built on a crisp `#FFFFFF` background with a subtle `#E8E6E1` resting border and `0.875rem` font size.
- Generous vertical padding (`0.75rem` top and bottom) for calm ergonomics.
- Placeholder text sits quietly in `#A8A6A1`.
- Focused state applies a defined `#2B4C7E` border and a delicate tint ring (`rgba(43, 76, 126, 0.08)`).

### Cards & Containers
- The central auth container features an immaculate `#FFFFFF` fill, 1px `#E8E6E1` perimeter stroke, and `space-xl` (2.5rem) internal padding.
- Internal dividers (e.g., "or continue with") utilize a single 1px hairline in `#E8E6E1` flanked by centered `#6E6D68` microcopy with comfortable margin.

### Checkboxes & Radios
- Small, precise 16px squares with `0.25rem` rounded corners.
- Resting border in `#D4D1CA`, checked state filled with `#2B4C7E` displaying a pure white check icon.

### Language & Utility Switchers
- Quiet, borderless segmented controls (e.g., `RO | EN`) situated in the header or footer. Inactive options rest at `#6E6D68`; the active language is highlighted in `#1E1E1E` with medium weight.

### Academic Badges & Metadata
- Subtle stone-tinted tags with `#F0EFEA` background, `#6E6D68` text, and delicate padding (`0.125rem 0.5rem`) for institutional affiliations or workspace IDs.