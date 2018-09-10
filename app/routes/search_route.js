/* Dependencies */
const express = require('express');
const connection = require('../database');

const router = express.Router(); // Get express's router functions
router.get('/search', (req, res) => {
    const queryService = 'SELECT * FROM website_user.Service';
    connection.query(queryService, (err, results) => {
        if (err) throw err;

        console.log(results);
    });
});


router.get('/search/:location', (req, res) => {
    // Create a select statement to query the db for a listing using the ':id' in  the '/listing/:id'
    const queryService = `SELECT * FROM website_user.Service WHERE Location='${req.params.location}'`; // Submit the statement
    connection.query(queryService, (err, results) => {
        // Once the above query is complete:
        if (err) throw err;

        const listing = {
            serviceid: results[0].Service_ID,
            location: results[0].Location,
            category: results[0].Category,
            description: results[0].Description,
        };

        // Now that the listing object is complete, render the HTML using the information from the EJS template
        console.log(results);
        console.log(listing);
        res.render('search.ejs', listing);
    });
});

// Allow the router object to be used in other js files.
// In this case we are making the router available as a
// module so that the route to the home page can be
// mounted to the express server in app.js
module.exports = router;
