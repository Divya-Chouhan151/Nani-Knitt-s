# Color tokens — e-commerce UI

Base palette: Petal Frost, Mauve, Periwinkle (pastel family). Extended with a darker CTA shade and standard semantic colors for accessibility. Use CSS variables below — never hardcode hex in components.

## CSS variables

```css
:root {
  /* surfaces */
  --bg-page: #FFFFFF;
  --bg-surface: #FFF3FF;      /* card, petal frost tint */
  --bg-section-a: #FFD6FF;    /* petal frost — hero/section fill */
  --bg-section-b: #E7C6FF;    /* mauve — alt section fill */
  --bg-info: #BBD0FF;         /* periwinkle — info fill */

  /* brand / actions */
  --brand-100: #C8B6FF;       /* mauve — badges, chips, light accents */
  --brand-500: #B8C0FF;       /* periwinkle — links, secondary actions */
  --brand-600: #6E63D6;       /* primary button / CTA */
  --brand-700: #5A4FC4;       /* primary button hover/active */

  /* text */
  --text-primary: #2B2438;
  --text-secondary: #6B637D;
  --text-on-brand: #FFFFFF;   /* text on --brand-600/700 */

  /* border */
  --border: #E5DFF5;

  /* semantic */
  --success: #A8D5BA;
  --success-text: #2F6B47;
  --warning: #F5D7A1;
  --warning-text: #8A5A00;
  --danger: #F3B8C4;
  --danger-text: #A13049;
  --info-text: #3B4E9E;
}

[data-theme="dark"] {
  --bg-page: #16121F;
  --bg-surface: #211A30;
  --bg-section-a: #2E2440;
  --bg-section-b: #372B4D;
  --bg-info: #2A2D4D;

  --brand-100: #D8C4FF;
  --brand-500: #9AA8F2;
  --brand-600: #A79CF0;
  --brand-700: #8F82E8;

  --text-primary: #F1EAFB;
  --text-secondary: #B7AECF;
  --text-on-brand: #16121F;   /* dark text on light brand-600/700 in dark mode */

  --border: #3A3350;

  --success: #7FBE95;
  --success-text: #16121F;
  --warning: #E0B15E;
  --warning-text: #16121F;
  --danger: #E58AA0;
  --danger-text: #16121F;
  --info-text: #C7D0FA;
}
```

## Usage rules

- Primary CTA button: `background: var(--brand-600)`, `color: var(--text-on-brand)`, hover → `var(--brand-700)`.
- Badges/chips/secondary accents: `background: var(--brand-100)`, text `var(--text-primary)`.
- Links / secondary actions: `color: var(--brand-500)` (light mode), `var(--brand-500)` also works dark mode as-is or swap to `--brand-600` if contrast fails against `--bg-page`.
- Hero/section backgrounds: rotate `--bg-section-a` / `--bg-section-b` / `--bg-info` — decorative only, never place body text directly on them without a surface card underneath.
- Status/stock indicators: `success` = in stock, `warning` = low stock, `danger` = out of stock/error. Always pair color with an icon or label text — never color alone.
- Toggle dark mode via `[data-theme="dark"]` attribute on `<html>` or root container — do not use a separate class-based system.
- Never hardcode hex values in component files; reference the variable name only.f