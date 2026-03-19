# AGENTS

## Scope

These instructions apply to the whole repository unless a deeper `AGENTS.md` overrides them.

## General

- Keep project documentation in English by default.
- Preserve existing functionality when refactoring the application.
- Prefer straightforward, maintainable solutions over clever ones.

## UI System

- Use Pico.css as the default UI foundation.
- Prefer semantic HTML and native elements before introducing custom abstractions.
- Use the token system in `app/tokens.css` for colours, spacing, typography, borders, radius, focus states, and feedback states.
- Keep shared application styling in `app/globals.css`.
- Avoid inline styles.
- Avoid one-off colours, spacing values, or radius values in components.
- Avoid page-specific visual logic unless it is necessary for layout.

## Bilingual UI

- The application UI must remain bilingual in English and Dutch.
- Any user-facing UI text added or changed in the app must be provided in both languages.
- Preserve the language switch in the top UI and ensure users can switch language at any time.
- Preserve the selected language across navigation, form submissions, mutations, and redirects.
- Prefer one central translation structure per page or feature over scattered inline string handling.
- Internal identifiers, stored data keys, and domain codes do not need to be translated unless they are directly presented as UI labels.
- If new validation or feedback messages become visible in the UI, provide both English and Dutch versions.

## Design Intent

- Keep the interface calm, clear, sober, accessible, and trustworthy.
- Aim for a Dutch public-service feel without copying protected government branding.
- Prefer functional clarity over visual flourish.

## Visual Rules

- Light background.
- Dark, high-contrast text.
- Deep blue as the main accent colour.
- Neutral greys for borders and structural surfaces.
- Status colours only for success, warning, and error feedback.
- Use whitespace and borders for separation.
- Prefer rectangular or slightly rounded components.
- No gradients.
- No glassmorphism.
- No decorative dashboard styling.
- No unnecessary shadows.

## Component Rules

- Start with Pico defaults.
- Add custom classes only when needed for layout or reusable state styling.
- Keep class names descriptive and reusable.
- Buttons, forms, tables, filters, alerts, and navigation must follow the same token-driven visual logic.
- Labels must stay explicit.
- Validation and error text should appear near the relevant field.
- All interactive elements must have visible hover, focus, and disabled states.

## Accessibility

- Maintain strong contrast.
- Preserve visible keyboard focus states.
- Keep layouts responsive and mobile-first.
- Use clear heading hierarchy.
- Prefer conventional patterns over clever patterns.

## Working Rules For Future Changes

- Before adding new styling, check whether an existing token or shared class already fits.
- If a new visual rule is genuinely needed, add it centrally in `app/tokens.css` or document it in `docs/ui-design-system.md`.
- Do not introduce a separate visual style for a new page.
- Choose the plainer, more accessible, and more consistent option when in doubt.
