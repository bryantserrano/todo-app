# Todo App

A Todo app with two web data modes: a local Docker stack for development and a
Supabase-backed web app for staging. The repository also includes a FastAPI
backend, MongoDB, a React + Vite frontend, and an Expo mobile app.

## How the two web modes work

| Mode | Web data source | Authentication | Where data lives |
| --- | --- | --- | --- |
| Local development | FastAPI JSON API | None; local development only | MongoDB in the Docker volume |
| Staging | Supabase client API | Supabase email/password and TOTP MFA | Supabase Postgres, with per-user RLS |

Docker Compose sets `VITE_TODO_DATA_SOURCE=api`, so the local web app sends JSON
requests to FastAPI, which reads and writes MongoDB. The GitHub Pages workflow
sets `VITE_TODO_DATA_SOURCE=supabase`, so the staged web app uses Supabase Auth
and the `public.tasks` table directly. Vite embeds this setting at build time.

The mobile app uses Supabase Auth and the same Supabase `public.tasks` table as
the staged web app. It does not need FastAPI or MongoDB running.

## Local development with Docker

Install Docker Desktop (or Docker Engine with the Compose plugin), then run from
the repository root:

```bash
docker compose up --build --detach
```

Open the local web app at [http://localhost:5173](http://localhost:5173), the
FastAPI health check at [http://localhost:8000/](http://localhost:8000/), and
the interactive API docs at [http://localhost:8000/docs](http://localhost:8000/docs).
The API returns task data as JSON. MongoDB is reachable from the host at
`mongodb://localhost:27017` and from the backend container at
`mongodb://mongodb:27017`.

Useful Compose commands:

```bash
docker compose logs --follow          # View all service logs
docker compose logs --follow backend  # View FastAPI logs
docker compose down                   # Stop services; keep MongoDB data
docker compose down --volumes         # Stop services and delete MongoDB data
```

MongoDB data persists in the `mongodb-data` Docker volume across restarts. The
last command permanently deletes that local database volume.

### Run the web frontend outside Docker

The frontend defaults to Supabase mode when run directly with Vite. To use the
local FastAPI API instead, set these in `todo-frontend/.env.local`:

```env
VITE_TODO_DATA_SOURCE=api
VITE_API_URL=http://localhost:8000
```

Then start MongoDB and FastAPI using Compose, or start them separately as
described below. The Docker Compose frontend receives these API settings
automatically.

### Run MongoDB and FastAPI separately

You can use Compose for the database and run FastAPI on your host, or run a
MongoDB container manually:

```bash
docker run -d -p 27017:27017 --name mongodb mongo:8
```

Create `todo-app/.env` with a MongoDB URL appropriate to where FastAPI runs:

```env
MONGO_URI=mongodb://localhost:27017
ENVIRONMENT=development
```

From `todo-backend`, install dependencies and start the API:

```bash
uv venv
uv pip install --python .venv/bin/python -r requirements.txt
.venv/bin/python -m uvicorn main:app --reload
```

When FastAPI runs inside Compose, it uses the hostname `mongodb`; when it runs
directly on your machine, use `localhost`.

## Staging web app with Supabase

The staged site is hosted at
[https://bryantserrano.github.io/todo-app/](https://bryantserrano.github.io/todo-app/).
It uses Supabase Auth and Postgres; it does not need the FastAPI or MongoDB
services running.

### Supabase project setup

The `public.tasks` table needs `id`, `created_at`, `user_id`, `title`,
`description`, and `completed` columns. Set `user_id` to UUID referencing
`auth.users.id`, and enable Row Level Security with owner policies that compare
`user_id` to `auth.uid()`.

The web app requires each signed-in user to enroll a TOTP authenticator and
verify a code on later sign-ins. In Supabase **Authentication → Multi-Factor
Authentication**, set TOTP to **Enabled**. **Verify Enabled** allows verification
but disables new factor enrollment. To enforce MFA at the database as well, run
[`todo-frontend/supabase/require-aal2.sql`](todo-frontend/supabase/require-aal2.sql)
once in the Supabase SQL Editor. TOTP MFA is free to use.

### GitHub Pages configuration

The deployment workflow builds the web app whenever changes reach `main`. Add
these repository variables in GitHub under **Settings → Secrets and variables →
Actions → Variables**:

| Variable | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Publishable key for that same project |

The publishable key is meant for browser code. Do not use a Supabase secret or
`service_role` key in the frontend or GitHub Pages build.

In Supabase **Authentication → URL Configuration**, set the Site URL to the
GitHub Pages URL and add that URL plus `http://localhost:5173/` to Redirect URLs.
After setting the GitHub variables, push the workflow changes to `main` or run
the **Deploy static site to GitHub Pages** workflow manually.

For local Vite development against Supabase instead of the Docker API, copy
`todo-frontend/.env.example` to `todo-frontend/.env.local` and fill in the
Supabase URL and publishable key. Set `VITE_TODO_DATA_SOURCE=supabase`.

## API endpoints

- `GET /` — backend health check
- `GET /tasks` — list tasks
- `POST /tasks` — create a task
- `GET /tasks/{task_id}` — fetch one task
- `PUT /tasks/{task_id}` — update a task
- `DELETE /tasks/{task_id}` — delete a task

## Tests

The FastAPI endpoint tests are in `todo-backend/test_api.py`. The Playwright API
checks are in `todo-frontend/tests/api.spec.ts`. The Playwright UI tests still
expect browser-local task storage and need updating for the API/Supabase modes
before they can validate the current web data flows.

## Mobile app

The Expo app is in `todo-mobile` and uses Expo SDK 58. It reads and writes todos
through Supabase, so FastAPI and MongoDB are not needed to run the mobile app.

### Prerequisites

- Node.js 22.13 or newer
- Expo Go installed on your iPhone
- A Supabase project with the `public.tasks` table and owner-based Row Level
  Security (RLS) policies

### Configure Supabase

Create `todo-mobile/.env.local` from `todo-mobile/.env.example` and set the URL
and publishable key from the Supabase project's **Connect** panel:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

The `public.tasks` table needs `id`, `created_at`, `user_id`, `title`,
`description`, and `completed` columns. Enable RLS and policies that restrict
each user's operations to rows where `user_id = auth.uid()`. Never put a
Supabase secret or service-role key in this mobile app.

The app requires TOTP MFA: users enroll an authenticator on first sign-in and
enter a code on later sign-ins. In Supabase **Authentication → Multi-Factor
Authentication**, enable TOTP enrollment and verification. To enforce the same
requirement at the database level, run
[`todo-frontend/supabase/require-aal2.sql`](todo-frontend/supabase/require-aal2.sql)
in the Supabase SQL Editor.

If email confirmation is enabled in Supabase Auth, confirm the signup email
before signing in.

### Start the app

In a terminal, from the repository root:

```bash
cd todo-mobile
npm install
npx expo login
npm start
```

`npx expo login` opens a browser so you can sign in to the Expo account used by
Expo Go. On a physical iPhone, Expo Go and the Expo CLI must be signed in to the
same account. Then scan the QR code with the iPhone Camera app and open it in
Expo Go. Keep the iPhone and computer on the same Wi-Fi network.

After changing `.env.local`, restart the Expo server so it picks up the new
Supabase settings.
