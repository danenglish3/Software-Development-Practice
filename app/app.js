/* NPM Dependencies */
const express = require('express');
const path = require('path');

// Initialise express
const app = express();
const PORT = 3000;

// Serve index.html to home URL '/'
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}, go to 'http://localhost:${PORT}'`);
});
