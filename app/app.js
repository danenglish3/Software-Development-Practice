/* Dependencies */
const express = require('express');
const bodyParser = require('body-parser');

/* Creating and running an express server */
const app = express(); // Initialise express
const PORT = 3000; // Specify a network port

// Set view engine to EJS
app.set('view engine', 'ejs');

// Provide Express with middleware
app.use(bodyParser.json()); // Parse input text to JSON
app.use(bodyParser.urlencoded({ extended: true })); // Ensure proper/safe URL encoding

// Mount routes to the express app
app.use(require('./routes/home_route'));

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} at 'http://localhost:${PORT}' (CTRL + C to exit)`);
});
