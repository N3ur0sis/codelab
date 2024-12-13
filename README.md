# CodeLab: Next-Gen Learning Management System for Computer Science

**CodeLab** is a modern platform for computer science education, replacing traditional LMS systems. It features real-time coding challenges, GitHub/GitLab integration, and a scalable, interactive infrastructure.

---

## Current Version

**Version 0.1.2 (Starter Project)**  
Foundational setup with backend, frontend, and Dockerized infrastructure with ESLint and Prettier configured for clean code.

---

## Project Structure

```plaintext
codelab/
├── backend/                # Express.js backend
│   ├── prisma/             # Database schema and migrations
│   ├── index.js            # Main entry point for the backend
│   ├── package.json        # Backend dependencies
│   └── backend.dockerfile  # Dockerfile for backend
├── frontend/               # Next.js frontend
│   ├── public/             # Public assets
│   ├── src/                # Main application code
│   ├── package.json        # Frontend dependencies
│   └── frontend.dockerfile # Dockerfile for frontend
├── compose.yaml            # Docker Compose configuration for full stack
├── .env.development        # Development environment variables
└── README.md               # Documentation
```

---

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- [Docker](https://docs.docker.com/get-docker/) (for containerization)
- [Node.js](https://nodejs.org/) (for local development)
- [PostgreSQL](https://www.postgresql.org/) (if running locally without Docker)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/neur0sis/codelab.git
   cd codelab
   ```

2. Set up the environment variables:

   - Create a `.env.development` file in the root directory:

     ```bash
     cp .env.example .env.development
     ```

   - Fill in required variables (e.g., `DATABASE_URL`, `NEXT_PUBLIC_API_URL`).

     Example `.env.development`:

     ```env
     DATABASE_URL=postgresql://postgres:postgres@db:5432/postgres?schema=public
     NEXT_PUBLIC_API_URL=http://localhost:4000
     POSTGRES_USER=postgres
     POSTGRES_PASSWORD=postgres
     POSTGRES_DB=postgres
     ```

3. Build and start the application using Docker Compose:

   ```bash
   ENV=development docker-compose up --build
   ```

4. Access the application:

   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:4000`

---

## Development Workflow

### Running the Application Locally

Use Docker Compose to run the entire stack:

```bash
ENV=development docker-compose up
```

### Backend Development

If you need to make changes or run the backend independently:

1. Navigate to the `backend` directory:

   ```bash
   cd backend
   ```

2. Run the backend server:

   ```bash
   ENV=development docker-compose up backend
   ```

### Frontend Development

If you need to work only on the frontend:

1. Navigate to the `frontend` directory:

   ```bash
   cd frontend
   ```

2. Run the frontend application:

   ```bash
   ENV=development docker-compose up frontend
   ```

3. Access the frontend at `http://localhost:3000`.

### Database Interaction

To work with the database locally using Prisma Studio:

1. Create a `.env` file in the `backend` directory with:

   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres?schema=public
   ```

2. Run Prisma Studio:

   ```bash
   npx prisma studio
   ```

---

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository.
2. Create a feature branch:

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. Commit your changes:

   ```bash
   git commit -m "Add your feature description"
   ```

4. Push to your fork:

   ```bash
   git push origin feature/your-feature-name
   ```

5. Create a pull request.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Built with love by the SoloDesign team

