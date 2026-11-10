# Student Mart

A responsive student creator storefront dashboard with a React frontend, Tailwind CSS, TypeScript UI components, Express API, and MongoDB user accounts.

## Run locally

1. Install Node.js 20 or newer and start MongoDB locally (or use a MongoDB Atlas connection string).
2. Copy `.env.example` to `.env` and set `MONGODB_URI` and a long random `JWT_SECRET`.
3. Run `npm install` and then `npm run dev`.
4. Open `http://localhost:5173`.

The Vite development server proxies `/api` to Express on port 5000. In production, run `npm run build`, set `NODE_ENV=production`, and run `npm start`; Express serves the built frontend and API from the same origin.

The dashboard includes a student-focused **Storefront** that uses the supplied 21st product rail UI and effects for textbooks, study notes, stationery, electronics, project kits, and campus essentials. Product prices use INR. Products added by a signed-in owner are stored in MongoDB and update both the product list and storefront. `components.json` and the `@/` alias are set up for shadcn-compatible component paths.

See [docs/PROJECT_GUIDE.md](docs/PROJECT_GUIDE.md) for the full feature overview, design rationale, architecture, setup, API, data models, and current scope.

## Authentication System

The user authentication system is built using **React**, **Node.js/Express**, and **MongoDB (Mongoose)**:

- **User Registration Form**:
  - Full Name, Email, Password, and Confirm Password fields with show/hide password toggles.
  - Real-time password criteria checklist (8–72 characters, uppercase letter, lowercase letter, number, and password match indicator).
  - Client-side pre-validation and field-level error messages.
  - Server endpoint `POST /api/auth/register`: validates all inputs, checks for duplicate accounts, hashes the password using `bcrypt` (12 salt rounds), persists user details in MongoDB, and issues a session cookie along with a signed JWT token.

- **User Login Functionality**:
  - Email and Password fields with show/hide toggle and optional "Keep me signed in".
  - Server endpoint `POST /api/auth/login`: validates email and password, verifies the hashed password using `bcrypt.compare`, and issues a 7-day session token and HTTP-only cookie.
  - Optional Google OAuth sign-in integration (`POST /api/auth/google`).

- **Field Validation**:
  - Email format validation using RFC-compliant regular expressions both client-side and server-side.
  - Password strength validation: minimum 8 characters, maximum 72 characters, at least one uppercase letter, one lowercase letter, and one number.
  - Password confirmation validation to prevent registration typos.

- **MongoDB Storage**:
  - `User` collection schema (`server/models/User.js`) with `name`, `email` (unique, lowercase, trimmed), `password` (hashed, excluded by default from queries), and timestamps.

- **Logout Functionality**:
  - Available via both the sidebar user menu and Settings page.
  - Server endpoint `POST /api/auth/logout`: clears the session cookie.
  - Client-side: clears the stored JWT token, resets React authentication state, and redirects back to the login view.

The dashboard's chart, orders and starter catalog are sample UI data. New owner listings are stored in MongoDB and persist across sessions.
