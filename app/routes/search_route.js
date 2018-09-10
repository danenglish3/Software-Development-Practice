/* Dependencies */
const express = require('express');

const router = express.Router(); // Get express's router functions
router.get('/search', (req, res) => {
    res.render('search.ejs', { searchName: 'Test' });
});


// Allow the router object to be used in other js files.
// In this case we are making the router available as a
// module so that the route to the home page can be
// mounted to the express server in app.js
module.exports = router;
