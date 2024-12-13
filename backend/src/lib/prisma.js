/**
 * prisma.js - Singleton Prisma Client for the application.
 *
 * This file ensures that the Prisma Client is initialized only once and reused across the application.
 * It avoids multiple instances of Prisma Client, which can cause connection issues in Node.js environments.
 */

const { PrismaClient } = require("@prisma/client"); // Import Prisma Client from the Prisma package.

// Declare a global variable for the Prisma Client instance.
let prisma;

/**
 * Check if a global Prisma Client instance already exists.
 * - If it doesn't exist, create a new instance and assign it to the global variable.
 * - This approach ensures that a single Prisma Client instance is shared throughout the application,
 *   even during hot module reloading in development.
 */
if (!global.prisma) {
  global.prisma = new PrismaClient();
}

// Assign the global Prisma Client instance to the local variable.
prisma = global.prisma;

// Export the Prisma Client instance for use in other parts of the application.
module.exports = prisma;
