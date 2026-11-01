# Tasks

## 1. Task data and feedback states

- [x] 1.1 Add frontend API support for full task updates and wire app-owned loading, retry, and error state; verify task loading distinguishes pending, success, and failure.
- [x] 1.2 Update task types and mutation callbacks to preserve server task fields; verify completion requests send the full task model expected by PUT.

## 2. Task interactions

- [x] 2.1 Implement add, completion toggle, and deletion actions with pending/error feedback; verify each successful action is reflected after reloading from the API and failed actions preserve a usable list.
- [x] 2.2 Add All, Active, and Completed filters with contextual empty states and task counts; verify each view contains only its matching tasks and All restores the full list.

## 3. Responsive interface and accessibility

- [x] 3.1 Replace the starter layout with a focused todo workspace and consistent CSS tokens, typography, color, spacing, and task-state styling; verify the layout at narrow and wide viewport sizes without horizontal scrolling.
- [x] 3.2 Make the form, filters, completion controls, and deletion controls keyboard-operable with accessible names and visible focus; verify navigation and activation using only a keyboard.

## 4. Frontend cleanup and integration

- [x] 4.1 Remove conflicting Vite starter styles and branding and set app-specific document metadata; verify no Vite branding remains in the rendered page or document title.
- [x] 4.2 Run the frontend production build and manually verify initial load, retry, add, complete/reactivate, filter, delete, and empty states against the running API.
