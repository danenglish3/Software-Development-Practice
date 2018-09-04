/* Dependencies */
const path = require('path');
const express = require('express');

/* Set up a route to the home page */

const router = express.Router(); // Get express's router functions
// Respond to the browsers 'get' request by serving index.html to home URL '/'
router.get('/', (req, res) => {
    res.render(path.join(__dirname, '../views/index.ejs'), { siteName: 'Kiwi Trader' });
});

// Allow the router object to be used in other js files.
// In this case we are making the router available as a
// module so that the route to the home page can be
// mounted to the express server in app.js
module.exports = router;
