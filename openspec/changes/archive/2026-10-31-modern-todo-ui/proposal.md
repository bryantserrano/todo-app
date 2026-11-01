# Proposal

## Why

The todo frontend is currently a bare form and list with no clear task states, feedback, or responsive visual hierarchy. A focused refresh will make the everyday workflow easier to scan and use while fixing the existing completion interaction, which currently calls an undefined function.

## What Changes

- Replace the starter page presentation with a polished, responsive todo workspace using a restrained modern visual style.
- Make task creation, completion, deletion, and filtering clear and accessible, including useful loading, error, and empty states.
- Connect completion toggling to the existing task update API.
- Remove leftover Vite starter branding and styles that conflict with the app.

## Capabilities

### New Capabilities
- `todo-interaction`: User-facing task list interactions, status filtering, and feedback states.

### Modified Capabilities
- None.

## Impact

- Frontend: `todo-frontend/src/App.tsx`, components, styles, API client, types, and `index.html`.
- Backend: no new endpoint is expected; the existing `PUT /tasks/{task_id}` supports completion updates.
- Dependencies: no additional UI dependency is assumed.
