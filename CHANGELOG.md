# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/).

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

