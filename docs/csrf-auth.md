# Browser and mobile authentication

Login still returns access and refresh tokens in `data` and sets HttpOnly authentication cookies. Browser clients use cookies. Mobile clients keep the returned tokens in secure storage and do not send cookies.

## Browser flow

1. GET `/api/auth/v1/csrf-token` with `credentials: "include"`. Save `data.csrfToken` in memory.
2. POST login or signup with `credentials: "include"` and the `x-csrf-token` header.
3. After successful login, GET the CSRF endpoint again. The new token is bound to the login cookies.
4. Include cookies and `x-csrf-token` when creating, updating or deleting recipes, refreshing tokens or logging out. GET requests do not require the header.
5. After refreshing authentication tokens, fetch a new CSRF token before the next protected POST. Logout clears authentication and CSRF cookies; fetch a new CSRF token before the next browser login.

```js
const api = "http://localhost:7000/api";

async function getCsrfToken() {
  const response = await fetch(`${api}/auth/v1/csrf-token`, {
    credentials: "include",
  });
  const result = await response.json();
  return result.data.csrfToken;
}

let csrfToken = await getCsrfToken();
const login = await fetch(`${api}/auth/v1/login`, {
  method: "POST",
  credentials: "include",
  headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
  body: JSON.stringify({ email: "student@example.com", password: "Example123" }),
});
if (login.ok) csrfToken = await getCsrfToken();
```

Use the same header and credentials options for recipe POST requests. CSRF failures return 403 with `Invalid or missing CSRF token`. CORS must allow your frontend origin; production cookies require HTTPS.

## Mobile / cookie-free API clients

- Login/signup: send credentials as JSON without cookies or browser Origin/Referer/Fetch Metadata headers. No CSRF token is required for this flow.
- Recipes: send `Authorization: Bearer <accessToken>`. AuthMiddleware verifies it and records Bearer authentication before CSRF middleware skips its check. Invalid Bearer headers do not bypass authentication.
- Refresh/logout: send `{ "refreshToken": "..." }` as JSON without authentication cookies. CSRF middleware verifies the refresh-token signature and type before skipping the check; services still perform their existing database checks.
- If you send authentication cookies to refresh/logout, you must send a CSRF token, even when an Authorization header or body token is also present. Disable automatic cookie storage/sending for the mobile token flow.

## Request flow

Recipe POST: route → AuthMiddleware → CsrfMiddleware → RoleValidatorMiddleware → SchemaMiddleware → controller → service → repository.

Role validation and ownership checks remain separate from CSRF protection. The CSRF endpoint uses AuthController and `get-csrf-token-service.ts`; it needs no database query because csrf-csrf uses signed double-submit cookies.

Set a separate `CSRF_SECRET` in production, for example generate one with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Keep it stable across app instances. Development uses a random secret when none is configured, so fetch a new CSRF token after restarting the server.

Database-free checks: `npx tsx --test src/tests/csrf.test.ts`.
