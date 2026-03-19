# UI Design System

## Purpose

This project uses a deliberately small UI system so future Cursor or Codex sessions can continue it without having to reverse-engineer visual intent.

The system is built from:

- Pico.css as the default styling foundation
- `app/tokens.css` as the central token layer
- `app/globals.css` for shared app-level layout and reusable structural classes

## Design Intent

The interface should feel:

- calm
- clear
- sober
- accessible
- trustworthy

The intended tone is similar in spirit to Dutch public-service software:

- light backgrounds
- dark readable text
- deep blue primary accents
- neutral borders and structural surfaces
- restrained feedback colours

Do not copy official government branding, logos, emblems, or protected identity elements.

## Core Conventions

### 1. Pico First

Use Pico.css as the first styling choice.

Prefer:

- `button`
- `input`
- `select`
- `textarea`
- `table`
- `details`
- `nav`
- `article`
- `section`
- `header`
- `footer`

Only add custom classes when Pico alone is not enough for layout, grouping, or consistent state display.

### 2. Token First

Do not invent one-off values in component files.

Use tokens from `app/tokens.css` for:

- colours
- spacing
- typography
- border radius
- border definitions
- focus states
- success, warning, and error states

If a new design value is needed repeatedly, add a token first.

### 3. Shared Styling Only

Keep reusable UI styling in:

- `app/tokens.css`
- `app/globals.css`

Avoid:

- inline styles
- scattered page-specific CSS
- component-local styling unless there is a strong structural reason

## Token Categories

`app/tokens.css` currently defines and centralizes:

- colour tokens
- spacing scale
- typography tokens
- radius tokens
- border tokens
- focus tokens
- feedback colours
- Pico variable mappings

When extending the system:

- prefer extending the existing scale
- avoid adding near-duplicate tokens
- name tokens by role, not by raw appearance where possible

## Layout Rules

- Mobile first
- Content separated by spacing and borders rather than decoration
- Surfaces should be light and restrained
- Avoid oversized cards and loud dashboard blocks
- Keep panels simple and rectangular or slightly rounded

## Interaction Rules

- All controls must have explicit labels
- Focus states must remain visible
- Disabled states must remain legible
- Validation and feedback text should appear near the relevant field
- Hover states should clarify interactivity, not add flourish

## Accessibility Rules

- Maintain strong contrast
- Use semantic heading hierarchy
- Keep forms easy to scan
- Prefer conventional interaction patterns
- Avoid hiding important information in visual-only treatments

## Visual Anti-Patterns To Avoid

- gradients
- glassmorphism
- decorative illustrations
- heavy shadows
- startup SaaS styling
- inconsistent button treatments
- inconsistent form layouts
- one-off spacing values

## Recommended Workflow For UI Changes

1. Start with semantic HTML.
2. See whether Pico already provides a suitable default.
3. Use existing tokens.
4. Reuse an existing shared class if possible.
5. If a new rule is needed, add it centrally.
6. Keep the result plain, accessible, and easy to continue.

## Current Files

- `app/layout.tsx`: imports Pico and the shared CSS layers
- `app/tokens.css`: design tokens and Pico variable mappings
- `app/globals.css`: app layout and shared reusable structural classes
- `app/page.tsx`: current application page using the shared system
