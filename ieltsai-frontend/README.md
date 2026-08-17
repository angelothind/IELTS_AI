# IELTS AI — Frontend

React + Vite frontend for an IELTS-style essay writing experience. The core feature is a paginated editor: text flows across fixed-size “pages” as the user types, similar to a word processor.

## Quick start

```bash
npm install
npm run dev
```

Other scripts:

| Command | Description |
|---------|-------------|
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

## Tech stack

- **React 19** with functional components and hooks
- **Vite 8** for dev server and bundling
- **MUI Icons** (`@mui/icons-material`) for the submit/back button icon
- Plain CSS per component (no CSS-in-JS in use yet)

## App structure

```
src/
├── main.jsx       # React entry point
├── App.jsx        # Layout: Toolbar + Pages
├── toolbar.jsx    # Timer, prompt text, submit button
├── timer.jsx      # 40-minute countdown
├── button.jsx     # Submit / back toggle
├── pages.jsx      # Multi-page state container
├── page.jsx       # Single page editor + reflow logic
└── *.css          # Component styles
```

### Component overview

| Component | Role |
|-----------|------|
| `App` | Renders the toolbar and paginated editor |
| `Toolbar` | Holds the timer, “Please write your essay below” prompt, and submit button |
| `Timer` | Counts down from 40 minutes; sets `isFinished` when time runs out |
| `Button` | Shows “Submit” while writing; shows a back arrow after submit |
| `Pages` | Owns the list of pages and all cross-page state updates |
| `Page` | One US Letter–sized textarea; runs reflow on every edit and resize |

## Page layout

Each page is styled as an 8.5 × 11 inch sheet (`page.css`) with 1 inch padding. The textarea fills the page, does not scroll, and uses a fixed font (18px Arial). Overflow is detected by comparing `scrollHeight` to `clientHeight`, not by counting characters — so line breaks and wrapping behave like real layout.

## State model

`Pages` keeps an array of page objects:

```js
{ id: string, text: string, excess: [string, caret?] }
```

- **`id`** — stable UUID used for React keys, textarea refs, and updates
- **`text`** — the content currently displayed on that page
- **`excess`** — overflow waiting to flow to the next page. Stored as `[text]` or `[text, caretOffset]` when the caret should move with the overflowed text

`Pages` also maintains a `Map` of textarea DOM refs for programmatic focus (e.g. after deleting an empty trailing page).

## Reflow — how text moves between pages

All text changes on a page go through `reflow` in `page.jsx`. There are two directions:

### Push down (typing / growing)

When the user types and the content no longer fits:

1. `splitAtOverflow` binary-searches for the longest prefix that still fits in the textarea
2. `wordSafeSplit` adjusts the break to a word boundary when possible
3. The kept prefix is written to the current page via `writing`
4. The excess is sent to the next page via `writingToExcess` on the *previous* page index (the producing page’s excess slot)
5. The next page picks up excess in a `useLayoutEffect` and merges it into its own text
6. If the current page is the last page and overflow exists, `createPage` adds a new blank page

Caret handling: if the caret was inside the overflowed portion, its offset is stored in the excess tuple so the receiving page can restore it.

### Pull up (deleting / shrinking)

When the edited value is shorter than the stored `pageText` and a next page exists:

1. Current text and `nextPageText` are concatenated and measured together
2. If everything fits → current page gets the combined string, next page is cleared
3. If only part fits → current page gets `split.kept`, next page gets `split.excess`
4. Caret position is clamped to the new kept length

### Resize

A `ResizeObserver` on each textarea re-runs reflow when the page dimensions change (e.g. window resize), so text is re-split without requiring a keystroke.

### Empty page removal

On the bottom non-first page, Backspace/Delete on empty content removes that page and returns focus to the end of the previous page.

## Key implementation details

- **Controlled textareas** — `value={pageText}` from parent state; the browser caret is restored manually via `caretRef` after React re-renders
- **No-op guards** — `writing` and `writingToExcess` skip updates when the new value equals the current value, preventing infinite reflow loops
- **Layout timing** — reflow and caret restoration use `useLayoutEffect` so measurements and DOM updates happen before paint
- **Unlaid-out guard** — `splitAtOverflow` returns `null` when `clientHeight === 0` to avoid spawning endless empty pages before layout

## Current scope and limitations

Implemented today:

- Paginated essay editor with automatic page breaks
- Push overflow to the next page; pull text back when deleting
- Word-safe splitting at page boundaries
- 40-minute exam timer and submit UI shell
- Remove empty trailing pages with Backspace

Not yet implemented:

- Submit does not send essay text anywhere (UI toggle only)
- No persistence (refresh clears content)
- No connection to a backend or LLM grading API
- Pull-up only runs on shrink edits (`value.length < pageText.length`), not on resize when extra vertical space appears
- No dark mode (wireframe exists in Figma; see root `README.md`)

## Related

Project-wide context and the Figma wireframe link live in the [repository root README](../README.md).
