# Tasks

## 1. Theme preference state

- [x] 1.1 Initialize the theme from a valid saved choice or the device preference, and verify startup selects the expected theme in each case.
- [x] 1.2 Persist user selections and track device preference changes only when there is no saved choice; verify changes survive reload and device changes do not override an explicit selection.

## 2. Theme palettes

- [x] 2.1 Add light and dark semantic CSS token values for page, panels, text, borders, accents, and status surfaces; verify all existing task states remain legible in both palettes.
- [x] 2.2 Replace theme-dependent hard-coded colors in the frontend styles with tokens and set the document color scheme; verify the full task interface renders consistently in light and dark modes at narrow and wide viewports.

## 3. Accessible theme control

- [x] 3.1 Add a labeled light/dark toggle to the page heading whose visible label and icon reflect the current appearance, with accessible state and visible keyboard focus; verify keyboard operation and announced state.

## 4. Integration

- [ ] 4.1 Verify system default, saved override, immediate switching, reload persistence, task form/list/error states, and responsive layout in the running frontend, and confirm the production build succeeds.
