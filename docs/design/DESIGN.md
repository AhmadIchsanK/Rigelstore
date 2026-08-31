---
name: RigelStore Core
colors:
  surface: '#f8f9ff'
  surface-dim: '#d1dbec'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eef4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dfe9fa'
  surface-container-highest: '#d9e3f4'
  on-surface: '#121c28'
  on-surface-variant: '#434655'
  inverse-surface: '#27313e'
  inverse-on-surface: '#eaf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#795900'
  on-secondary: '#ffffff'
  secondary-container: '#ffc329'
  on-secondary-container: '#6f5100'
  tertiary: '#006243'
  on-tertiary: '#ffffff'
  tertiary-container: '#007d57'
  on-tertiary-container: '#bdffdc'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#ffdf9f'
  secondary-fixed-dim: '#f9bd22'
  on-secondary-fixed: '#261a00'
  on-secondary-fixed-variant: '#5c4300'
  tertiary-fixed: '#68fcbf'
  tertiary-fixed-dim: '#45dfa4'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#005137'
  background: '#f8f9ff'
  on-background: '#121c28'
  surface-variant: '#d9e3f4'
  background-surface: '#F9FAFB'
  ink-deep: '#111827'
  soft-mint: '#ECFDF5'
  warm-cream: '#FFFBEB'
  sky-tint: '#EFF6FF'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
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
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  section-gap: 80px
---

## Brand & Style

The brand personality for this design system is **Playful Professionalism**. It targets parents, educators, and caregivers looking for high-quality digital resources for children. The UI must feel approachable and imaginative while maintaining the structural integrity of a secure e-commerce platform.

The design style is a blend of **Soft Minimalism** and **Tactile Modernism**. It prioritizes generous whitespace and a "flawless" uncluttered aesthetic to reduce cognitive load. Interaction design should focus on building trust through clear visual hierarchies, using soft rounded forms and subtle depth to make digital products feel tangible and friendly.

## Colors

This design system utilizes a vibrant yet sophisticated palette. The **Primary Blue** (#2563EB) provides a sense of reliability and trust. The **Secondary Yellow** (#FBBF24) and **Tertiary Mint** (#34D399) introduce an educational, youthful energy without being overwhelming.

The background uses a near-white **Surface Gray** (#F9FAFB) to ensure a clean canvas, while **Ink Deep** (#111827) is reserved for high-contrast text to ensure accessibility. Tinted backgrounds (Soft-Mint, Warm-Cream, Sky-Tint) should be used for sectioning content or highlighting specific product categories to maintain a playful rhythm throughout the user journey.

## Typography

The typography strategy balances character with function. **Montserrat** is used for headlines to provide a bold, geometric, and friendly presence. **Inter** is used for body copy and UI labels to ensure maximum legibility at all sizes, particularly for product descriptions and checkout flows.

On mobile devices, headline scales are aggressively reduced to ensure titles do not break awkwardly or overwhelm the small viewport. Maintain a tight line height for headers and a generous line height (1.5x) for body text to improve readability for busy parents.

## Layout & Spacing

The layout utilizes a **Fluid Grid** model with a 12-column structure on desktop. To achieve the "flawless, uncluttered" look, the design system mandates a minimum section gap of 80px on desktop to allow the content to breathe.

- **Mobile (< 768px):** 4-column grid, 16px margins, 16px gutters.
- **Tablet (768px - 1024px):** 8-column grid, 24px margins, 20px gutters.
- **Desktop (> 1024px):** 12-column grid, 40px margins, 24px gutters, capped at a 1280px max-width container.

Spacing is based on an 8px rhythmic scale. Components should prioritize `padding-lg` (24px) or `padding-xl` (32px) to reinforce the sense of premium quality and openness.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and **Ambient Shadows**. Instead of harsh black shadows, this design system uses soft, diffused shadows tinted with the Primary Blue (e.g., `rgba(37, 99, 235, 0.08)`).

- **Level 0 (Base):** Surface Gray background.
- **Level 1 (Cards/Inputs):** White surface with a 1px border in a lighter neutral shade and a subtle 4px blur shadow.
- **Level 2 (Hover/Active States):** Increased shadow spread (12px blur) to simulate the element "lifting" toward the user.
- **Level 3 (Modals/Overlays):** Significant depth with a 24px blur shadow and a backdrop blur (glassmorphism) on the overlay to maintain context.

## Shapes

The shape language is defined by **Rounded** corners to evoke a sense of safety and friendliness appropriate for a children's brand. Standard components use a 0.5rem (8px) radius, but per the brand requirements, primary containers and product cards should scale up to `rounded-lg` (12px) and `rounded-xl` (16px) for a softer, more distinctive silhouette.

## Components

### Buttons
Buttons should be high-contrast and highly visible.
- **Primary:** Primary Blue background, white text, 12px-16px rounded corners. Use a slight "squish" effect (0.98 scale) on active press.
- **Secondary:** Secondary Yellow background with Ink Deep text for a playful alternative CTA.

### Cards
Product cards are the centerpiece. Use a white background, 16px corner radius, and an 8px "soft shadow." Ensure images have a 12px internal radius to follow the container's shape.

### Input Fields
Fields should have a 12px radius and a 2px border that transitions from a light gray to Primary Blue on focus. Use "Inter" at 16px to prevent auto-zooming on iOS devices.

### Chips & Tags
Use soft-tinted backgrounds (Soft-Mint for "New", Sky-Tint for "Digital") with 32px (pill-shaped) roundedness and semi-bold labels.

### Progress & Feedback
For download or purchase indicators, use the Tertiary Mint color to provide positive reinforcement and build trust during the transaction process.