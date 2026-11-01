# Design

## Context

See `proposal.md` for motivation and `specs/todo-interaction/spec.md` for user-visible requirements. The frontend is a single React screen with global CSS custom properties in `index.css` and component styles in `App.css`; it has no theme state or appearance setting today.

## Goals / Non-Goals

**Goals:**
- Keep light and dark palettes within the current CSS token system.
- Respect device appearance until the user makes an explicit choice.
- Apply and retain an explicit choice without adding a service or dependency.
- Make the appearance control understandable and operable with assistive technology and a keyboard.

**Non-Goals:**
- Add additional themes, per-account synchronization, or a backend preference endpoint.
- Redesign task interactions as part of the theme work.

## Decisions

- **Represent the explicit choice as `light` or `dark`, with no saved value meaning system preference.** Read and write this value in browser local storage. This distinguishes an intentional choice from the current device setting and allows the app to fall back to the system when there is no choice. An in-memory-only selection would be lost on reload; a backend preference would require accounts and API changes that this app does not have.
- **Subscribe to the device color scheme only while there is no explicit choice.** Initialize from `prefers-color-scheme`, then respond to media-query changes. Once a user chooses a theme, keep that theme stable across device setting changes. This matches the stated preference behavior without adding a separate “system” mode to the toggle.
- **Expose the active theme on the document root and define both palettes with CSS custom properties.** Add dark values for page, panel, text, muted text, borders, accents, and status/error surfaces, then use the tokens throughout existing styles. A small head script applies the saved or device theme before styles render, avoiding a flash when an explicit saved choice differs from the device. This keeps component styling consistent and lets CSS `color-scheme` inform native controls. Duplicating complete styles under separate selectors would make future visual updates easier to miss.
- **Place a labeled button in the page heading.** The button switches directly between light and dark, has an accessible name that describes the action and an exposed state, and retains visible focus styling. A menu or a new preferences screen would add interaction for only two options.

## Risks / Trade-offs

- [Stored values can be unavailable or malformed] → Treat unknown values as no explicit choice and continue with the device preference; keep the theme control usable for the session.
- [The browser can block local storage] → Let CSS and the React initializer fall back to the device color preference when the early theme bootstrap cannot read storage.
- [Some existing component colors may be hard-coded rather than tokenized] → Audit the frontend styles while implementing and convert theme-dependent colors to tokens; preserve colors that intentionally represent a fixed semantic status only when contrast remains sufficient in both palettes.

## Migration Plan

No server or data migration is needed. On startup, use a valid saved choice if present; otherwise use the current device preference. Rolling back the frontend removes theme switching while leaving any local storage value unused.
