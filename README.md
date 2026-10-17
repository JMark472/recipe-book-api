# Recipe Book API

A TypeScript + Express 5 REST API for the Full-Stack Recipe Book. Authentication uses
JWT access/refresh tokens stored in **HttpOnly cookies**, with **refresh-token rotation**
and **CSRF protection** for browser writes. Data is stored in PostgreSQL through
**Drizzle ORM**.

## Stack

| Layer | Choice |
| --- | --- |
| Runtime | Node.js 22+ |
| Language | TypeScript |
| Server | Express 5 |
| Database | PostgreSQL (Neon in production) |
| ORM / migrations | Drizzle ORM + Drizzle Kit |
| Auth | `jsonwebtoken` + `bcrypt` + HttpOnly cookies |
| CSRF | `csrf-csrf` (signed double-submit cookie) |
| Validation | Zod |
| Build | `tsdown` (production) / `tsx` (development) |

## Architecture

Requests flow through well-separated layers:

```
routes → controllers → services → repositories → db (Drizzle) → PostgreSQL
```

- `src/routes` declares endpoints and attaches middleware.
- `src/controllers` reads the request and returns `res.status(result.code).json(result)`.
- `src/services` holds business rules and permission checks.
- `src/repositories` holds the SQL/Drizzle queries (ownership filters included).
- `src/db/schema.ts` is the single source of truth for the database structure.

> **Never change tables by hand.** Edit `src/db/schema.ts`, then run
> `npm run db:plan` (generate) and `npm run db:migrate` (apply).

## Local setup

```bash
# 1. Install dependencies
npm install

# 2. Create your environment file
Copy-Item .env.example .env      # PowerShell
# cp .env.example .env           # macOS / Linux

# 3. Fill in .env (see the table below), especially DATABASE_URL

# 4. Create the tables
npm run db:migrate

# 5. (Optional) Create demo accounts + sample recipes
npm run db:seed

# 6. Start the dev server (http://localhost:7000)
npm run dev
```

Check it is alive: `GET http://localhost:7000/api/health` → `{ "status": "success" }`.

### Demo accounts created by `npm run db:seed`

| Role | Email | Password |
| --- | --- | --- |
| ADMIN | `admin@recipebook.dev` | `Admin1234` |
| USER | `chef@recipebook.dev` | `Chef12345` |

## Environment variables

| Variable | Purpose |
| --- | --- |
| `APP_NAME` | Display name used in logs and the root route. |
| `PORT` | Port the server listens on (Render injects its own). |
| `NODE_ENV` | `development` or `production`. Controls cookie `secure`/`sameSite`. |
| `JWT_SECRET` | Signs access and refresh tokens. Long random string. |
| `CSRF_SECRET` | Signs CSRF cookies. A **different** long random string. Required in production. |
| `BACKEND_URL` | Public URL of this API. |
| `FRONTEND_URL` | Exact browser origin of the frontend. Controls CORS and cookies. No trailing slash. |
| `DATABASE_URL` | PostgreSQL connection string. |

Generate secrets with:

```bash
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

## Database workflow (Drizzle)

```bash
npm run db:plan     # generate SQL from schema changes (no changes to the DB)
npm run db:migrate  # apply pending migrations to DATABASE_URL
npm run db:studio   # browse the database (development)
npm run db:seed     # insert demo records (safe to re-run)
```

Migration files live in `drizzle/` and are committed to Git.

## API endpoints

Base path: `/api`. Recipe routes need a valid access token; browser writes also need the
`x-csrf-token` header.

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/health` | Public | Health check. |
| GET | `/auth/v1/csrf-token` | Public | Fetch a CSRF token. |
| POST | `/auth/v1/signup` | Public | Create a USER account. |
| POST | `/auth/v1/login` | Public | Sign in and set auth cookies. |
| POST | `/auth/v1/refresh-token` | Cookie | Rotate the refresh token. |
| POST | `/auth/v1/logout` | Cookie | Revoke the refresh token. |
| GET | `/auth/v1/session` | Auth | Current user. |
| GET | `/recipes/v1/get-recipes` | USER | Own recipes. |
| GET | `/recipes/v1/get-recipe/:id` | USER | One owned recipe. |
| POST | `/recipes/v1/create-recipe` | USER | Create a recipe. |
| POST | `/recipes/v1/update-recipe/:id` | USER | Update an owned recipe. |
| POST | `/recipes/v1/delete-recipe/:id` | USER | Delete an owned recipe. |
| GET | `/recipes/v1/get-all-recipes` | ADMIN | Every recipe with its owner. |

## Production build

```bash
npm run build   # bundles to dist/server.mjs
npm start       # runs the bundled server
npm run lint    # ESLint
```

## Deploy to Render

See the top-level **DEPLOYMENT-GUIDE.md**. In short: create a Web Service from this repo
with build command `npm ci --include=dev && npm run db:migrate && npm run build` and start command
`npm start`, then set the environment variables above. A ready-made `render.yaml`
blueprint is included.
