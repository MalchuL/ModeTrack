# Neuromorphic UI Plan

## Goals
- Give the productivity app a soft, tactile feel while keeping clarity and accessibility.
- Reuse shared tokens (colors, radii, shadows) so features stay consistent across tasks, pomodoro, music, and cycles.
- Keep dark-mode support with equivalent depth cues (dual shadows and subtle gradients).

## Design Language
- **Surfaces**
  - Base: calm neutral (`#e8edf5`) with a faint radial glow; dark: `#0b1220`.
  - Raised: slightly brighter highlight (`rgba(255,255,255,0.65)`) with a soft shadow (`rgba(13,32,74,0.18)`); dark uses `rgba(255,255,255,0.06)` and deep shadow (`rgba(0,0,0,0.55)`).
  - Sunken/inset: inner shadow for pressed states.
- **Depth**
  - Primary drop shadow: `12px 12px 28px rgba(15,23,42,0.18)`.
  - Primary highlight: `-10px -10px 24px rgba(255,255,255,0.8)`.
  - Inset shadow: `inset 6px 6px 16px rgba(15,23,42,0.15), inset -6px -6px 16px rgba(255,255,255,0.7)`.
- **Radii & Spacing**
  - Radii: 16px for cards/panels, 12px for inputs/buttons, 9999px for pills.
  - Gaps: prefer 12/16/24px rhythm; keep touch targets ≥40px.
- **Color Accents**
  - Primary: deep slate (`#1f2a44`) with gradient hover to `#2d3a5c`.
  - Accent/glow: soft cyan (`#7bdff2`) for focus rings and icons.
  - Destructive: `#ef4444` untouched for clarity.

## Interaction Patterns
- **Hover (raised)**: brighten background + add dual shadow.
- **Active/Pressed**: switch to inset shadow + compress translateY(1px).
- **Focus**: outer ring using accent glow + maintain dual shadows.
- **Disabled**: reduce contrast, remove shadows to flatten.

## Component Treatment
- **Global background**: layered radial gradient with subtle noise texture (if available) to reinforce depth.
- **Cards & panels**: raised neuromorphic shell; sections split with soft dividers (`border-transparent` + inset highlight).
- **Buttons**: pill-ish radii, gradient fills for primary/secondary, inset shadow on press; ghost buttons keep text color but add light hover shadow.
- **Inputs/Selects**: recessed fields with inset shadows; focus adds cyan ring and lifts slightly.
- **Sidebar**: frosted neuromorphic block with floating nav items; active item gets inset state.
- **Lists (tasks)**: each item as a raised tile; status chips pill-shaped with soft shadow; empty states in soft, recessed container.
- **Modals**: glassy backdrop blur + raised card with stronger shadow to stand above background.

## Implementation Plan
1. Add theme tokens in `globals.css` for light/dark neuromorphic backgrounds, shadow presets, and radii.
2. Extend Tailwind utility helpers (via `globals.css` classes) for `neu-surface`, `neu-pressed`, `neu-input`.
3. Update UI primitives (`card`, `button`, `input`, `select`, `modal`, `toast`) to use neuromorphic tokens and states.
4. Apply to feature surfaces: sidebar shell, task list container and items, filters bar, empty state blocks.
5. Verify dark-mode contrast, focus visibility, and drag/drop feedback for tasks; adjust as needed.

## Risks & Checks
- Ensure shadow stacks stay performant; avoid excessive blur on large lists.
- Keep focus states WCAG-visible; do not rely solely on shadow.
- Drag handles should remain clear (add subtle contrast to prevent disappearing on raised backgrounds).

