# React + TypeScript + Vite

## Data source modes

The web client selects its task backend with `VITE_TODO_DATA_SOURCE`:

- `api` calls the FastAPI JSON API. Docker Compose sets this for local development.
- `supabase` uses Supabase Auth and the `public.tasks` table. This is the staging
  mode used by GitHub Pages and the default when running Vite directly.

To point a local Vite server at the Docker backend, set these in `.env.local`:

```env
VITE_TODO_DATA_SOURCE=api
VITE_API_URL=http://localhost:8000
```

## Supabase setup

Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and
`VITE_SUPABASE_PUBLISHABLE_KEY` from the Supabase project's Connect panel. Never
use the service-role or secret key in this client app. Restart Vite after changing
the environment file.

In `supabase` mode, the web app uses Supabase Auth and the `public.tasks` table. The table must have
`user_id` as a UUID referencing `auth.users.id`, and Row Level Security policies
that restrict each operation to `user_id = auth.uid()`. Existing tasks in browser
localStorage are offered for import after sign-in.

### Require authenticator MFA

The web sign-in flow requires users to enroll a TOTP authenticator and enter a
code on later sign-ins. Enable TOTP and verification in Supabase Auth's MFA
settings. To require AAL2 at the database as well, run
`supabase/require-aal2.sql` once in the Supabase SQL Editor. It adds a restrictive
policy alongside the existing owner policy.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
