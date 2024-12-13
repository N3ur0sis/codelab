/**
 * index.js - Entry point for the backend application
 * This file sets up an Express.js server with Prisma for database interactions.
 *
 * Key Features:
 * - RESTful endpoints for user management, just to illustrates the app setup, will be removed in future versions.
 * - CORS headers for cross-origin requests.
 * - Health check endpoint to monitor API availability.
 */

const express = require('express');
const { PrismaClient } = require('@prisma/client');

// Initialize Prisma Client for database operations
const prisma = new PrismaClient();

// Create an Express application
const app = express();

/**
 * Middleware: Parses incoming JSON requests.
 * This ensures the server can handle JSON payloads sent in HTTP requests.
 */
app.use(express.json());

/**
 * Middleware: Sets CORS headers.
 * This allows requests from any origin and specifies allowed HTTP methods and headers.
 * It is useful for enabling communication between the frontend and backend.
 */
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    next();
});

/**
 * Endpoint: Health Check
 * GET /health
 *
 * Purpose: To check if the API is running.
 * Returns a JSON response with a status message.
 */
app.get('/health', (req, res) => {
    try {
        res.status(200).json({ message: 'API is running' });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error : ' + error.message });
    }
});

/**
 * Endpoint: Get All Users
 * GET /users
 *
 * Purpose: Fetches all user records from the database.
 * Returns an array of user objects.
 */
app.get('/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error : ' + error.message });
    }
});

/**
 * Endpoint: Get User by ID
 * GET /users/:id
 *
 * Purpose: Fetches a single user record by ID.
 * Returns the user object if found; otherwise, returns a 404 error.
 */
app.get('/users/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const user = await prisma.user.findUnique({ where: { id: Number(id) } });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
        } else {
            res.status(200).json(user);
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error : ' + error.message });
    }
});

/**
 * Endpoint: Create a User
 * POST /users
 *
 * Purpose: Adds a new user to the database.
 * Expects `name` and `email` fields in the request body.
 * Returns the created user object.
 */
app.post('/users', async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = await prisma.user.create({ data: { name, email } });
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error : ' + error.message });
    }
});

/**
 * Endpoint: Update a User
 * PUT /users/:id
 *
 * Purpose: Updates an existing user by ID.
 * Expects `name` and `email` fields in the request body.
 * Returns the updated user object.
 */
app.put('/users/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { name, email } = req.body;
        const user = await prisma.user.update({ 
            where: { id: Number(id) }, 
            data: { name, email },
        });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error : ' + error.message });
    }
});

/**
 * Endpoint: Delete a User
 * DELETE /users/:id
 *
 * Purpose: Removes a user record by ID from the database.
 * Returns a success message upon successful deletion.
 */
app.delete('/users/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await prisma.user.delete({ where: { id: Number(id) } });
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error : ' + error.message });
    }
});

/**
 * Start the server on the specified port.
 * The default port is 4000 unless overridden by the `port` environment variable.
 */
const PORT = process.env.port || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
