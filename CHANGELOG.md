# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.2.0] - 2024-12-13

### Added
- **Authentication**:
  - Implemented GitHub OAuth for user authentication using Passport.js.
  - Added `auth/` directory for Passport configuration (`passportConfig.js`).
  - Updated Prisma schema to include `githubId`, `accessToken`, and `avatarUrl` fields in the `User` model for GitHub authentication.
  - Added `routes/authRoutes.js` to handle authentication-related endpoints (`/auth/github`, `/auth/github/callback`, `/auth/logout`).
  - Integrated session management using `express-session` and a Prisma-backed session store.
  - Middleware for session configuration (`middleware/sessionConfig.js`) to manage user sessions securely.
  - Protected routes with middleware to check user authentication.

- **Frontend Updates**:
  - Created a dynamic `Navbar` component with GitHub login/logout functionality.
    - Displays "Sign in with GitHub" for unauthenticated users.
    - Displays "Sign out" and the user's name for authenticated users.
  - Updated `Home` page to display a personalized greeting for authenticated users and a login prompt for unauthenticated users.

- **Prisma Enhancements**:
  - Added a singleton pattern for Prisma client initialization (`src/lib/prisma.js`) to prevent multiple connections in development.

- **Development Tooling**:
  - Configured `nodemon` for hot reloading of backend files during development.
  - Updated `docker-compose.yaml` to map host directories and set up `nodemon` properly for the backend.

- **Environment Configuration**:
  - Configured `env_file` in `docker-compose.yaml` for both backend and frontend.
  - Integrated `.env.development` for managing environment variables in development.
  - Passed environment variables like `NEXT_PUBLIC_API_URL` to Next.js during the build process.

### Changed
- Refactored project structure for better modularity:
  - Moved session logic to `middleware/sessionConfig.js`.
  - Added centralized routes for authentication in `routes/authRoutes.js`.
  - Updated Prisma schema to handle session management via a `Session` model.
- Updated `frontend/Dockerfile` to pass environment variables dynamically using `ARG` during the build.
- Modified `backend/Dockerfile` to support `nodemon` for local development.
- Enhanced logging and error handling in backend routes and Passport configuration.

### Fixed
- Resolved issue where nodemon was not restarting when files in `src/` changed.
- Fixed Prisma error when attempting to delete a non-existent session during logout.
- Corrected redirection issues to ensure users are redirected to the frontend after login/logout.

---

## [0.1.2] - 2024-12-13

### Fixed
- Changed backend Dockerfile to use `node:22` instead of `node:22-alpine` to resolve Prisma's `openssl` module issue.

### Changed
- Removed reference to `docker exec -it backend npx prisma studio` in the README because it's not working.

## [0.1.1] - 2024-12-13

### Added
- Configured ESLint and Prettier for both backend and frontend.
- Added `npm run lint` and `npm run format` scripts for consistent code quality and formatting.
- Included `eslint.config.js` and `.prettierrc.js` files for backend and frontend with tailored configurations.

## [0.1.0] - 2024-12-13

### Added
- Initial backend and frontend setup.
- Docker Compose configuration for development.
- Basic Prisma integration.

### Changed
- Refactored project structure for modularity.

### Fixed
- Minor typos in the README.
