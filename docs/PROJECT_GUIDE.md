# Student Mart project guide

## What this app is

Student Mart is a responsive student marketplace seller dashboard. Sellers can create an account, sign in, manage a starter product catalog, and preview a student-focused storefront. The interface is designed for phones, tablets, and desktop screens.

## What is included and why

### Authentication

- Registration asks for a name, email, and password.
- Email format is checked in the browser and API. Passwords need at least eight characters, uppercase and lowercase letters, and a number.
- Passwords are hashed with bcrypt before storage.
- A signed, HTTP-only, SameSite=Lax cookie keeps the session. The browser does not read the session token.
- Auth endpoints are rate limited. The `GET /api/auth/me` endpoint restores a session after a page reload, and logout clears its cookie.
- `vaida.ri1709@gmail.com` is the single administrator account. Public registration cannot claim this address. A first Google sign-in creates/promotes it to admin only after Google verifies the matching email. All other registered accounts have the seller role.
- Google sign-in is available for both login and registration. Google credentials are verified by the Express server against the configured Google Web Client ID, and Google must confirm the email address.

These choices keep account credentials out of the database in plain text and keep session tokens out of client JavaScript.

### Seller dashboard

The administrator sees the full workspace: Overview, My products, Storefront, Orders, Customers, Analytics, and Settings. Other signed-in users see only their seller panel: their own My products list, Storefront, and Settings. Seller product lists start empty and load only records owned by that account. The administrator's Overview chart, customer list, order history, and starting products are sample data for the UI; they are not fetched from marketplace transaction tables.

### Administrator setup

Only `vaida.ri1709@gmail.com` can have the administrator role. Public registration rejects that address. Google can create the admin account after it verifies this exact email; use the following owner-only provisioning command if you also want password sign-in or need to reset the admin password:

```powershell
$env:ADMIN_INITIAL_PASSWORD = 'Choose-A-Strong-Password-2026'
npm run admin:setup
Remove-Item Env:ADMIN_INITIAL_PASSWORD
```

The script creates or updates Ritwik Vaida's account, assigns the admin role, and demotes any other admin accounts. Sign in with `vaida.ri1709@gmail.com` and the password you set. Provisioning again resets this account's password.

### Google sign-in setup

Create an OAuth **Web application** client ID in Google Cloud Console. Add `http://localhost` and `http://localhost:5173` as authorized JavaScript origins, then put the client ID in `.env` as `VITE_GOOGLE_CLIENT_ID`. Restart `npm run dev` after changing `.env`. Use the production website origin when configuring deployment. Until this ID is set, the login screen displays the Google option with a setup message.

### Storefront and products

The Storefront uses the supplied 21st product rail and its motion, item selection, front/back view, detail panel, autoplay, and keyboard behavior. Its item content comes from the same product state as My products. The sample catalog represents student goods: textbooks, notes, stationery, electronics, project kits, and campus essentials. Prices display in Indian rupees.

When a signed-in owner adds a product, the API stores it in MongoDB under that owner. The new item appears in My products and the Storefront immediately. Saved products are fetched again after sign-in, so they remain after reload. The product artwork is generated from each listing's name and category; image upload is not implemented yet.

### Appearance and accessibility

- Inter is used for interface text and Plus Jakarta Sans for headings.
- The light/dark mode button is available on the dashboard and sign-in screen. The choice is saved in browser local storage.
- Layouts reflow for small screens. The rail supports keyboard navigation, buttons have visible focus states, and reduced-motion preferences are respected by the UI styles.

## Project layout

```text
src/
  App.jsx                         React routes, auth screens, dashboard views, and product state
  main.jsx                        React entry point
  styles.css                      Dashboard design and Tailwind CSS import/theme tokens
  theme.css                       Type scale and light/dark appearance rules
  components/
    StudentStorefront.tsx         Student product content and generated cover art for the 21st rail
    ui/skate-deck-rail.tsx         Supplied interactive 21st rail component
    lib/utils.ts                   shadcn-compatible class-name helper
server/
  index.js                        Express server and route setup
  models/User.js                  MongoDB user schema
  models/Product.js               MongoDB product schema
  middleware/auth.js              Session cookie verification
  routes/auth.js                  Register, login, logout, and current-user endpoints
  routes/products.js              Owner-scoped product listing and creation endpoints
  scripts/provision-admin.js      Create the single administrator account
components.json                   shadcn component paths and Tailwind settings
vite.config.js                    Vite, Tailwind plugin, @ alias, and API proxy
```

## Run locally

### Requirements

- Node.js 20 or newer
- MongoDB running locally, or a MongoDB Atlas connection string

### Setup

1. Copy `.env.example` to `.env`.
2. Set `MONGODB_URI` to your MongoDB connection string.
3. Replace `JWT_SECRET` with a long, random secret.
4. Install packages with `npm install`.
5. Start the API and Vite dev server with `npm run dev`.
6. Open `http://localhost:5173`.

Vite proxies `/api` requests to Express on port 5000. For a production build, run `npm run build`, set `NODE_ENV=production`, then run `npm start`; Express serves the built frontend and API from one origin.

## View the website database in MongoDB Compass

Compass is a database browser; the Express API connects to the MongoDB server itself. This project uses `mongodb://127.0.0.1:27017/student-mart`, which matches the `localhost:27017` connection shown in the supplied Compass screenshot.

1. Keep the local MongoDB server (`mongod`) running.
2. In Compass, open the saved `localhost:27017` connection and click **Connect**. If you create a new Compass connection, use `mongodb://127.0.0.1:27017`.
3. In Compass, open the `student-mart` database. The `users` collection contains account records and the `products` collection contains owner listings.
4. Register a website account or add a product. Refresh the Compass database view to see the saved document. Products are scoped to their owner's MongoDB user ID.

The website's `GET /api/health` endpoint reports `{ "status": "ok", "database": "student-mart" }` when Express has a live MongoDB connection, and returns HTTP 503 when the database is disconnected. Keep the connection string in the backend `.env`; the React app calls Express endpoints and never connects directly to MongoDB.

## Configuration

| Variable | Purpose | Local default |
| --- | --- | --- |
| `PORT` | Express API port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/student-mart` |
| `JWT_SECRET` | Secret used to sign session cookies | Must be set in `.env` |
| `CLIENT_URL` | Allowed development origin for credentialed CORS | `http://localhost:5173` |
| `NODE_ENV` | Enables secure cookies and static production serving | `development` |

## API reference

### Authentication

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Public | Validate and create a seller account; starts a session. The admin email is reserved. |
| `POST` | `/api/auth/login` | Public | Verify credentials; starts a session |
| `POST` | `/api/auth/google` | Public | Verify a Google ID token and sign in or create a seller account |
| `POST` | `/api/auth/logout` | Public | Clear the session cookie |
| `GET` | `/api/auth/me` | Signed in | Return the current user's public profile |

Registration JSON:

```json
{
  "name": "Sam Student",
  "email": "sam@example.edu",
  "password": "CampusPass2026"
}
```

### Products

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/products` | Signed in | List products owned by the current user |
| `POST` | `/api/products` | Signed in | Validate and save a product in INR |

Product JSON:

```json
{
  "name": "Data Structures exam notes",
  "category": "Notes & study guides",
  "price": 199,
  "description": "Concise revision notes with solved examples."
}
```

Valid categories are `Textbooks`, `Notes & study guides`, `Stationery`, `Electronics`, `Project kits`, and `Campus essentials`. Prices are numeric INR amounts from ₹1 to ₹10,00,000. Product routes require the same HTTP-only session cookie as dashboard access.

## Data models

### User

MongoDB stores the display name, normalized unique email, optional bcrypt password hash, optional Google account ID, role (`admin` or `seller`), and timestamps. Password hashes and Google IDs are excluded from normal user queries and from API responses. The admin role is assigned only after Google verifies the reserved email or by the owner-only provisioning script.

### Product

Each product stores its owner ID, name, category, numeric INR price, optional description, and timestamps. Product reads are filtered by the authenticated owner ID.

## Styling and component setup

Tailwind CSS v4 runs through `@tailwindcss/vite`. TypeScript is enabled for `.tsx` components. The `@/` alias points to `src/`, and `src/components/ui` is the shared UI component location. `components.json` configures the project for shadcn-compatible component installation.

## Current scope

- The six starter marketplace listings, revenue chart, order history, and customer metrics are demonstration data.
- Owner-created products persist in MongoDB. Editing, deleting, inventory quantity, order processing, customer records, product image uploads, password reset, and email verification are not implemented.
- Theme preference is local to the current browser; it is not stored on the user's account.
