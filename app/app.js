/* Dependencies */
const express = require('express');

/* Creating and running an express server */
const app = express(); // Initialise express
const PORT = 3000; // Specify a network port

// Set view engine to EJS
app.set('view engine', 'ejs');

// Mount routes to the express app
app.use(require('./routes/home_route'));
app.use(require('./routes/listing_route'));

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} at 'http://localhost:${PORT}' (CTRL + C to exit)`);
});
