/**
 * index.js - Entry point for the backend application.
 * This file starts the Express server and listens on the specified port.
 */

const app = require("./app");

/**
 * Start the server.
 * The server listens on the port specified in the environment variables or defaults to 4000.
 */
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
