# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.3.0] - 2024-12-14

### Added
- **Challenges Feature**:
  - Introduced a full-fledged challenge system.
  - Updated Prisma schema to include `Challenge`, `Stage`, `Enrollment`, and `StageStatus` models for storing challenges, stages, user enrollments, and their progress.
  - Added routes in `src/routes/challengeRoutes.js`:
    - `/challenges` (GET): Fetch all challenges.
    - `/challenges/:id` (GET): Fetch details of a specific challenge and user enrollment status.
    - `/challenges/enroll` (POST): Enroll the user in a challenge.
    - `/challenges/:id/current-stage` (GET): Fetch the user's current stage.
    - `/challenges/:id/next-stage` (POST): Move the user to the next stage in the challenge.
  - Added controllers in `src/controllers/challengeController.js` to handle business logic for challenges and stages.
  - Implemented a dynamic "pre-stage" (repository setup stage) as the initial step in all challenges, guiding users to clone their repository and push their first commit. (The actual repo creation is not implemented)

- **Frontend Updates**:
  - Updated the challenge workflow:
    - Clicking a challenge on the homepage now redirects the user to a challenge detail page (`/challenges/[id]`).
    - Added a "Start Challenge" button for new users enrolling in a challenge.
    - Displayed challenge instructions and the list of stages, validation occurs on the `Continue` button press.
    - Each stage displays its instructions and is highlighted on the stages list.
  - Updated `ChallengePage.tsx` and `InstructionsPage.tsx` for proper rendering of stages and dynamic challenge instructions.

- **Docker Enhancements**:
  - Updated `frontend/Dockerfile` to enable hot reloading during development:

  - Improved volume mapping in `docker-compose.yaml` for seamless local development.

### Changed
- **Backend Refactoring**:
  - Consolidated challenge-related logic into `src/routes/challengeRoutes.js` and `src/controllers/challengeController.js`.
  - Improved stage handling logic in `getCurrentStage` and `moveToNextStage` controllers:
    - The "pre-stage" dynamically generates instructions and transitions users to the next stage.

- **Frontend Enhancements**:
  - Refactored `HomePage.tsx` to:
    - Display challenges available to the user.
    - Redirect to the challenge details page upon selection.
    - Show appropriate messaging when no challenges are available.
  - Refactored challenge instructions UI in `InstructionsPage.tsx` to dynamically update based on the backend-provided stage data.

- **Prisma Schema Updates**:
  - Added relations and unique constraints to ensure scalability and data integrity:
    - `Challenge` now has a `stages` relation for associated stages.
    - `Enrollment` tracks user progress in a challenge.
    - `StageStatus` tracks completion state for each stage.

### Fixed
- **Hot Reloading**:
  - Resolved issues with `nodemon` not restarting the backend on file changes.
  - Addressed environment variable propagation issues in the frontend and backend Dockerfiles.

- **Session Management**:
  - Fixed Prisma session deletion issue during logout.

---

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

---

## [0.1.1] - 2024-12-13

### Added
- Configured ESLint and Prettier for both backend and frontend.
- Added `npm run lint` and `npm run format` scripts for consistent code quality and formatting.
- Included `eslint.config.js` and `.prettierrc.js` files for backend and frontend with tailored configurations.

---

## [0.1.0] - 2024-12-13

### Added
- Initial backend and frontend setup.
- Docker Compose configuration for development.
- Basic Prisma integration.

### Changed
- Refactored project structure for modularity.

### Fixed
- Minor typos in the README.
