/* Dependencies */
const express = require('express');
const path = require('path');

/* Creating and running an express server */
const app = express(); // Initialise express
const PORT = 3000; // Specify a network port

// Respond to the browsers 'get' request by serving index.html to home URL '/'
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}, go to 'http://localhost:${PORT}'`);
});
