# Design

## Context

See `proposal.md` for motivation and `specs/todo-interaction/spec.md` for observable requirements. The frontend is a small React/Vite app with `App`, `TodoForm`, and `TodoList`; it currently fetches the list on mount and after mutations. The task API supports GET, POST, PUT, and DELETE. PUT accepts the full task model, so an update must preserve the title and optional description while changing `completed`.

## Goals / Non-Goals

**Goals:**
- Keep the existing app architecture and REST API.
- Establish a consistent visual system with semantic CSS variables, clear typography, restrained color, and responsive spacing.
- Make load and mutation states explicit so the UI does not silently fail or imply an empty list while loading.

**Non-Goals:**
- Add authentication, due dates, categories, drag-and-drop, or cross-device synchronization.
- Add a component library or change the backend API contract.

## Decisions

- **Use app-owned state for loading, errors, tasks, and the selected filter.** `App` already owns the fetched task array and can coordinate retry and mutation refreshes; children should receive data and callbacks. This avoids duplicating server state across components. A separate state-management library would add complexity for this single screen.
- **Derive the visible list from All / Active / Completed selection.** Keep the full server result in state and filter it at render time, so changing filters never mutates or loses tasks.
- **Persist mutations, then refresh from the server.** Add, completion, and delete actions should await the API operation and refresh the list on success. This follows the existing data flow and avoids optimistic rollback logic. Show an actionable error if the operation fails.
- **Send complete task fields for completion updates.** The current PUT endpoint accepts the full `Task` model rather than a partial patch. Preserve title and description and change only the completion value in the request.
- **Use semantic HTML and native CSS with design tokens.** Build the visual refresh with labeled form controls, buttons, list semantics, visible focus styles, and CSS custom properties. This fits the app's size and avoids adding a dependency or coupling the design to the current Tailwind/PostCSS setup.
- **Keep the page focused on the task workflow.** Use a compact header, task-entry area, filter/count row, and list. Make empty states contextual to the selected filter, with responsive spacing and touch-sized controls on narrow screens.

## Risks / Trade-offs

- [Refreshing after each mutation adds a request and may feel slower on a poor connection] → Keep pending feedback local to the affected action and retain the current list until the refreshed response arrives.
- [The API can return errors with inconsistent detail, and the update route currently formats an exception message incorrectly] → Present a stable, user-friendly frontend error with a retry path; backend error cleanup remains outside this change.
- [Tailwind 4 is installed while the current stylesheet uses older Tailwind directives] → Avoid relying on utility generation for the refreshed layout; use app-scoped CSS and remove conflicting starter rules.

## Migration Plan

No data migration or backend deployment is required. Replace the frontend presentation and wire its task actions to the existing endpoints; rollback consists of reverting the frontend change.
