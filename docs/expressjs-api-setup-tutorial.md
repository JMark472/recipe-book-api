# Express.js API Setup Tutorial

This guide explains how to create the TypeScript and Express API starter used in this project. At the end, you will have a development server running on port `7000`, environment-based configuration, basic security middleware, a health-check endpoint, and a folder structure ready for larger features.

## Before you begin

Install a current Node.js LTS release, at least Node.js v24+. Verify that Node.js and npm are available:

```bash
node --version
npm --version
```

You will also need a code editor such as Visual Studio Code. PostgreSQL is only required once you begin using the database features.

## 1. Create the project

Create and open a new folder. This example uses `D:\Development\appsdev-api-tutorial`:

```bash
mkdir appsdev-api-tutorial
cd appsdev-api-tutorial
npm init -y
```

Open this folder in your editor, then open its integrated terminal.

## 2. Install dependencies

Install the packages used by the API:

```bash
npm install cookie-parser cors dotenv express helmet hpp jsonwebtoken nodemailer zod csrf-csrf bcrypt
```

Install the TypeScript, build, linting, and type-definition packages:

```bash
npm install -D jiti @eslint/js @types/cookie-parser @types/cors @types/express @types/hpp @types/jsonwebtoken @types/node @types/nodemailer @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint tsdown tsx typescript typescript-eslint @types/bcrypt
```

## 3. Configure TypeScript and ESLint

This project uses `eslint.config.ts`, a TypeScript configuration file. ESLint needs the `jiti` development dependency from section 2 to load it. If you already installed the other packages but missed `jiti`, run:

```bash
npm install -D jiti
```

Without it, `npm run lint` stops with **The 'jiti' library is required for loading TypeScript configuration files**. After installing it, run `npm run lint` again.

Copy [tsconfig.json](../tsconfig.json) and [eslint.config.ts](../eslint.config.ts) into the project root. The TypeScript configuration defines the `@/` import alias, so this import:

```ts
import app from "@/app";
```

means `src/app.ts`.

Add these scripts to the `scripts` section of [package.json](../package.json):

```json
"scripts": {
  "build": "tsdown src/server.ts --format esm --clean --minify",
  "dev": "tsx watch src/server.ts",
  "start": "node dist/server.mjs",
  "db:studio": "drizzle-kit studio",
  "db:plan": "drizzle-kit generate",
  "db:migrate": "drizzle-kit migrate",
  "lint": "eslint ."
},
```

Use `npm run dev` while developing. It restarts the server when you save a TypeScript file. Use `npm run build` followed by `npm start` to test the production build.

## 4. Create the source structure

Create the following folders inside `src`:

```text
src/
├── config/        # Environment configuration
├── controllers/   # Request handlers
├── db/            # Drizzle schema and database connection
├── lib/           # Shared integrations and helpers
├── middlewares/   # Express middleware
├── repositories/  # Database access
├── routes/        # Route definitions
├── schema/        # Validation schemas
├── services/      # Application business logic
└── utils/         # Small reusable utilities
```

For the complete project, also copy its feature files under controllers, routes, services, repositories, schema, middlewares, and lib; app.ts imports those routes. The complete API requires the database setup in section 8 before startup. For a database-free health-check lesson, omit the feature route import and registration until section 8.

Then copy [src/app.ts](../src/app.ts) and [src/server.ts](../src/server.ts) into their matching locations. Git does not store empty folders, so add a `.gitkeep` file to any folder that is intentionally empty for now.

## 5. Add environment variables

Copy [.env.example](../.env.example) to `.env` in the project root. Do not commit `.env`, because it may later contain real credentials.

```env
APP_NAME=AppsDev API Tutorial
PORT=7000
NODE_ENV=development
JWT_SECRET=fallback_secret_change_me
BACKEND_URL=http://localhost:7000
FRONTEND_URL=http://localhost:5173
CSRF_SECRET=replace_with_a_separate_random_secret
DATABASE_URL=
```

Copy [src/config/env.ts](../src/config/env.ts); it loads these variables and provides defaults for local development. Before deployment, replace `JWT_SECRET` with a strong, private value and set all URLs to the deployed services.

## 6. Build the Express application

[src/app.ts](../src/app.ts) creates the Express application and configures its middleware:

- `helmet` adds common HTTP security headers.
- `cors` allows the configured frontend origin to call the API with cookies.
- `express.json()` and `express.urlencoded()` parse request bodies.
- `cookie-parser` reads cookies from incoming requests.
- `hpp` helps protect against HTTP parameter pollution.

Keep endpoint handlers above the 404 middleware. Express evaluates middleware in registration order. If the 404 handler is registered first, it will respond before a later route such as `/api/health` can run.

The starter provides these endpoints:

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/` | Confirms that the application instance is running. |
| `GET` | `/api/health` | Confirms that the API route layer is running. |

Each endpoint returns JSON with a success status and timestamp.

## 7. Start and verify the API

For the complete API, finish section 8 and configure DATABASE_URL first. Then run the development server:

```bash
npm run dev
```

You should see the API URL and environment in the terminal. Test the API with Postman:

1. Open Postman and select **New** → **HTTP Request**.
2. Set the method to `GET`.
3. Enter `http://localhost:7000/api/health` as the request URL.
4. Select **Send**.

Postman should show a `200 OK` response with this JSON body:

Expected response:

```json
{
  "status": "success",
  "message": "API is healthy",
  "timestamp": "2026-09-18T00:00:00.000Z"
}
```

The timestamp will be different on your machine. If you receive `Cannot GET /api/health`, check that the route is defined before the 404 handler in [src/app.ts](../src/app.ts), then restart the development server.

## 8. Add Drizzle ORM and PostgreSQL

Drizzle ORM builds typed SQL queries in your application. The `pg` package connects to PostgreSQL through a connection pool. Drizzle Kit is the command-line tool that generates and applies SQL migrations. Read the [official PostgreSQL setup guide](https://orm.drizzle.team/docs/get-started/postgresql-new) alongside this section.

### 8.1 Install the database packages

```bash
npm install drizzle-orm@latest pg@latest
npm install -D drizzle-kit@latest @types/pg@latest
```

`@latest` selects the current stable npm release when students install. Commit `package-lock.json` so classmates can reproduce the resolved versions using `npm ci`.

Create an empty PostgreSQL database locally or through your database provider. Put its connection string in `.env`:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/recipe_book
```

Replace the placeholders with your own values. For hosted databases, use the provider's connection string and required SSL settings. Do not put credentials directly into TypeScript or commit them to Git.

### 8.2 Define your database tables

Copy [src/db/schema.ts](../src/db/schema.ts). This file defines this project's `user`, `recipe`, and `token` tables, their columns, indexes, enum values, and foreign keys. It is different from `src/schema/`: those Zod schemas validate incoming HTTP data, while `src/db/schema.ts` describes database storage.

This simplified example illustrates the syntax; the linked project file contains the complete schema:

```ts
import { pgTable, uuid, text } from "drizzle-orm/pg-core";

export const users = pgTable("user", {
  id: uuid().defaultRandom().primaryKey(),
  email: text().unique(),
  name: text(),
});
```

`pgTable` names a SQL table. `uuid`, `text`, and `integer` describe column types. `.notNull()`, `.unique()`, and `.references()` describe constraints. Read [PostgreSQL column types](https://orm.drizzle.team/docs/column-types/pg) and [indexes and constraints](https://orm.drizzle.team/docs/indexes-constraints) when adding fields or relationships.

### 8.3 Configure migration generation

Copy [drizzle.config.ts](../drizzle.config.ts) into the project root:

```ts
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: process.env.DATABASE_URL
    ? { url: process.env.DATABASE_URL }
    : undefined,
  strict: true,
  verbose: true,
});
```

`schema` tells the CLI where to read table definitions; `out` is where it writes SQL and migration metadata. `dbCredentials` supplies the connection when applying migrations. See the [Drizzle configuration reference](https://orm.drizzle.team/docs/drizzle-config-file).

### 8.4 Create the runtime connection

Copy [src/db/index.ts](../src/db/index.ts). Repositories import this shared connection:

```ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { ENV } from "@/config/env";
import * as schema from "./schema";

if (!ENV.DATABASE_URL) throw new Error("DATABASE_URL is required");

export const pool = new Pool({ connectionString: ENV.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
```

A pool reuses database connections. Create it once for the application rather than inside every controller or request. The API needs a valid DATABASE_URL at startup because its repositories import this module.

### 8.5 Generate, review, and apply migrations

```bash
npm run db:plan
```

This runs `drizzle-kit generate`: it compares your TypeScript schema with the saved migration snapshots and writes SQL into `drizzle/`. It does not apply SQL to the database. The project already includes an initial migration; generating without schema changes may report that no changes are needed.

Open and review the generated `.sql` file. When you are ready to create or update your database tables, run:

```bash
npm run db:migrate
```

This runs `drizzle-kit migrate` against DATABASE_URL. It applies pending migrations and records their application. Commit the entire `drizzle/` folder, including SQL, snapshots, and the journal. Keep these files when adding later migrations.

For each future database change: edit `src/db/schema.ts`, generate a migration, review the SQL, and apply it. No client-generation command is required. See the [migration workflow](https://orm.drizzle.team/docs/migrations), [generate command](https://orm.drizzle.team/docs/drizzle-kit-generate), and [migrate command](https://orm.drizzle.team/docs/drizzle-kit-migrate).

To browse the configured database during development:

```bash
npm run db:studio
```

Studio can change database data. Use your development database for classroom exercises.

### 8.6 Write queries in repositories

Use the existing [user repository](../src/repositories/user-repository.ts), [recipe repository](../src/repositories/recipe-repository.ts), and [token repository](../src/repositories/token-repository.ts) as project examples. HTTP routes call controllers, controllers call services, and services call repositories. Keep database queries in repositories.

These examples use the complete project's schema and belong inside async repository methods. `userId` is an existing user's UUID and `ownerId` comes from the authenticated session:

```ts
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { users, recipes } from "@/db/schema";

// Read selected public fields, excluding the password.
const [user] = await db
  .select({ id: users.id, name: users.name, email: users.email })
  .from(users)
  .where(eq(users.id, userId))
  .limit(1);

// Create a row and return selected fields.
const [createdUser] = await db
  .insert(users)
  .values({ name: "Student", email: "student@example.com" })
  .returning({ id: users.id, name: users.name });

// Limit updates and deletions to a recipe owned by the caller.
const [updatedRecipe] = await db
  .update(recipes)
  .set({ name: "Vegetable Soup" })
  .where(and(eq(recipes.id, recipeId), eq(recipes.userId, ownerId)))
  .returning();

const [deletedRecipe] = await db
  .delete(recipes)
  .where(and(eq(recipes.id, recipeId), eq(recipes.userId, ownerId)))
  .returning();
```

The insert above demonstrates query syntax only. Create real accounts through the signup service so password hashing and duplicate-account checks run. Never store a plain password.

Query results are arrays. Destructuring `[user]` selects the first row, which can be `undefined` when no record matches. `.returning()` returns the affected rows on PostgreSQL. Always add an appropriate `.where()` to update/delete queries; without it, all rows can be affected. Keep ownership checks in database filters as shown.

Use these official references when adding queries:

| What you want to add | Documentation |
| --- | --- |
| Read rows, choose columns, sort, paginate | [Select](https://orm.drizzle.team/docs/select) |
| Create rows and return inserted values | [Insert](https://orm.drizzle.team/docs/insert) |
| Change matching rows | [Update](https://orm.drizzle.team/docs/update) |
| Remove matching rows | [Delete](https://orm.drizzle.team/docs/delete) |
| Filter with `eq`, `and`, `or`, `gt`, `isNull` | [Filter operators](https://orm.drizzle.team/docs/operators) |
| Combine related tables | [Joins](https://orm.drizzle.team/docs/joins) |
| Make several writes succeed or fail together | [Transactions](https://orm.drizzle.team/docs/transactions) |

### 8.7 Add a feature through the application layers

For a new database-backed feature:

1. Add its table or columns in `src/db/schema.ts` and follow the migration workflow above.
2. Add a Zod request schema in `src/schema/` to validate incoming values.
3. Add database methods in `src/repositories/` using the query references above.
4. Add business rules and permission checks in `src/services/`.
5. Add a handler in `src/controllers/`, then register its endpoint in `src/routes/` and mount the router in [src/routes/index.ts](../src/routes/index.ts).
6. Exercise the endpoint with Postman and check both successful requests and invalid or unauthorized requests.

See [recipes-api.md](recipes-api.md) for recipe endpoints and ownership rules, and [csrf-auth.md](csrf-auth.md) for browser cookies, CSRF headers, and token rotation. Browser clients must send cookies and follow that CSRF flow for protected writes.

### 8.8 Troubleshooting

- **DATABASE_URL is required:** create `.env` in the project root and set the connection string.
- **Connection refused or authentication failed:** check that PostgreSQL is reachable and the database, username, password, and SSL settings match your provider.
- **Table or relation does not exist:** confirm DATABASE_URL points to the intended database and apply its pending migrations.
- **No schema changes detected:** the schema matches the stored snapshots; this does not prove the database has already been migrated.
- **Missing module or type definitions:** run `npm install` in the API project directory and confirm the packages from section 8.1 are installed.

## 9. Check your work and commit it

Run the linter before committing:

```bash
npm run lint
```

When it passes, initialize a Git repository if needed, copy [.gitignore](../.gitignore) so it excludes `.env`, `node_modules`, and `dist`, then create your remote repository and push the project.

From here, add features in layers: define routes, validate input in schemas, put business rules in services, and keep direct database queries in repositories.
