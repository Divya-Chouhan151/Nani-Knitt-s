# E-Commerce Frontend

This file guides Claude (and any dev) on conventions for this SolidJS project. Backend is Java Spring Boot (REST API). Follow these rules strictly when writing or reviewing code.

## Stack

- SolidJS (latest stable) + Vite
- TypeScript (strict mode) — no `any` unless justified with comment
- Solid Router for routing
- Solid's built-in reactivity (signals, stores) for state — no Redux/Zustand unless a real cross-cutting need appears
- CSS: Tailwind or CSS Modules (pick one, stay consistent — do not mix)
- Color tokens: see COLOR-TOKENS.md for the full CSS variable palette (light + dark mode). Load that file only when implementing UI that needs colors — do not duplicate its contents here.
- Package manager: pnpm (fast, disk-efficient)

## Core SolidJS Principles (Non-Negotiable)

1. **Fine-grained reactivity, not component-level re-render thinking.**
   Solid does NOT re-render components like React. A component function runs ONCE. Only signals/reactive expressions inside JSX re-run. Never write code assuming the whole component re-executes on state change.

2. **Never destructure props.**
   Destructuring breaks reactivity (loses the getter). Always access via `props.x`, not `const { x } = props`.
   ```tsx
   // Bad
   function Card({ title }: Props) { return <div>{title}</div>; }
   // Good
   function Card(props: Props) { return <div>{props.title}</div>; }
   ```

3. **Use fine-grained primitives to render only what's needed — not full component swaps:**
   - `<Show when={cond()}>` instead of ternary returning whole components, for conditional single elements.
   - `<For each={items()}>` instead of `.map()` — Solid's `<For>` keys by reference and only updates changed DOM nodes, doesn't re-mount the list.
   - `<Switch>` / `<Match>` for multi-branch conditionals instead of if/else chains returning JSX.
   - `<Index>` instead of `<For>` when list items are primitives or index-based identity matters more than value identity.
   - Avoid wrapping small reactive pieces in unnecessary child components — prefer inline JSX with signals so only the specific text node/attribute updates, not a full child component instance.

4. **Signals for local state, Stores (`createStore`) for nested/object state.**
   Don't put deeply nested objects in a single signal (`createSignal`) — mutations force full replace. Use `createStore` for objects/arrays needing granular field updates.

5. **Derived state = plain functions or `createMemo`, not `createEffect`.**
   Use `createEffect` only for side effects (DOM APIs, logging, syncing external systems, API calls tied to signal change). Never use it to compute a value that could be a memo.

6. **`createResource` for async/data-fetching** (product list, cart, orders) — gives loading/error state for free, integrates with `<Suspense>`.

7. **`<Suspense>` boundaries** around resource-dependent UI (e.g., product grid, cart) for clean loading states — don't hand-roll `if (loading)` everywhere.

8. **Cleanup:** any manual subscription/listener inside `createEffect` must use `onCleanup`.

## Project Structure

```
src/
  api/            # Spring Boot API clients (fetch wrappers per domain: products, cart, orders, auth)
  components/     # Reusable dumb UI pieces (Button, Price, Badge)
  features/       # Feature folders (product-catalog, cart, checkout, auth) — colocate signals/stores + components
  routes/         # Solid Router pages
  stores/         # Global stores (cart store, auth/session store)
  types/          # Shared TS types/interfaces (mirror backend DTOs)
  utils/          # Pure helper functions
```

## API Layer Rules

- All calls to Spring Boot backend go through `src/api/` — never `fetch` directly in components.
- Centralize base URL + auth headers in one client (`src/api/client.ts`).
- Type every request/response against backend DTOs in `src/types/`.
- Use `createResource` wrapping api functions for GET data; use signals + manual call for POST/PUT/DELETE (cart add, checkout submit).

## Naming & Style

- Components: PascalCase file + function (`ProductCard.tsx`).
- Signals: `camelCase`, prefix intent when helpful (`isLoading`, `cartItems`, `selectedVariant`).
- No inline `style={{}}` unless truly dynamic/computed — prefer Tailwind classes.
- Keep components small (~150 lines soft limit) — split when a component does more than one job (e.g. fetch + display + form).

## Performance Norms

- Never put large lists/objects directly in a signal without `createStore` if individual items mutate often (e.g. cart quantity change).
- Memoize expensive derived calculations (cart total, discount calc) with `createMemo`.
- Lazy-load routes with `lazy()` from solid-js for code-splitting (checkout, account pages shouldn't be in main bundle).
- Images: lazy-load below-fold product images (`loading="lazy"`).

## Testing

- Vitest + `@solidjs/testing-library`.
- Test behavior (what user sees/does), not internal signal values directly.

## Do NOT

- Do NOT use React patterns/mental models (no `useEffect`-as-default, no destructured props, no key-based full remount thinking).
- Do NOT introduce a global state library unless a documented cross-feature need exists — Solid's own primitives cover 95% of e-commerce state (cart, auth, filters).
- Do NOT fetch data inside `createEffect` when `createResource` fits — resource gives cancellation/race-condition handling for free.
- Do NOT mutate store state directly outside `setStore` producer/path syntax.

## When Writing Code (Claude, follow this checklist)

1. Props accessed via `props.x`, never destructured.
2. Conditionals use `<Show>`/`<Switch>`, not JS ternaries hiding whole component trees.
3. Lists use `<For>`/`<Index>`, never `.map()` directly in JSX.
4. Async data uses `createResource` + `<Suspense>`, not manual loading booleans.
5. Derived values use `createMemo`, not recomputed inline or via effect.
6. New API calls added to `src/api/`, typed against `src/types/`.
7. Routes lazy-loaded.