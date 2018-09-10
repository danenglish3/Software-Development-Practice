/* Dependencies */
const express = require('express');
const connection = require('../database');

const router = express.Router(); // Get express's router functions

/* router.get('/search', (req, res) => {
    const queryService = 'SELECT * FROM website_user.Service';
    connection.query(queryService, (err, results) => {
        if (err) throw err;

        console.log(results);
    });
}); */

// Search by just a location
router.get('/search/location/:Location', (req, res) => {
    // Create a select statement to query the db for a listing using the ':id' in  the '/listing/:id'
    const queryService = `SELECT * FROM website_user.Service \
        WHERE Location='${req.params.Location}'`; // Submit the statement
    connection.query(queryService, (err, results) => {
        // Once the above query is complete:
        if (err) throw err;

        // Step 2) Create a statement to get the profile for which the service is linked to
        const queryProfileID = `SELECT Account_ID FROM website_user.Profile WHERE \
                website_user.Profile.Profile_ID = '${results[0].Profile_ID}'`;
        connection.query(queryProfileID, (err2, results2) => {
            if (err2) throw err;
            // Once the above is complete
            // console.log(results2);
            const accID = {
                accid: results2[0].Account_ID, // Save the account ID for easy reference (was used in earlier versions)
            };
                // console.log(accID.accid);

            // step 3) Create a statement that will get the business or persons name that holds the account
            //         using the account id selected in step 2
            const queryAccountName = `SELECT Name FROM website_user.AccountHolder WHERE \
                    website_user.AccountHolder.Account_ID = '${accID.accid}'`;
            connection.query(queryAccountName, (err3, results3) => {
                if (err3) throw err;

                // Create a listing object that holds the information required
                const listing = {
                    serviceid: results[0].Service_ID,
                    name: results3[0].Name, // Selected in step 3
                    location: results[0].Location,
                    category: results[0].Category,
                    description: results[0].Description,
                };
                    // console.log(listing);
                res.render('search.ejs', listing); // Render the new page with the information gathered
            });
        });
        // Now that the listing object is complete, render the HTML using the information from the EJS template
    });
});

// Search by just a category
router.get('/search/category/:category', (req, res) => {
    // step 1) Create a select statement to query the db for a listing using the ':category' in  the '/search/:category'
    const queryService = `SELECT * FROM website_user.Service \
        WHERE Category='${req.params.category}'`; // Submit the statement
    connection.query(queryService, (err, results) => {
        // Once the above query is complete:
        if (err) throw err;

        // Step 2) Create a statement to get the profile for which the service is linked to
        const queryProfileID = `SELECT Account_ID FROM website_user.Profile WHERE \
            website_user.Profile.Profile_ID = '${results[0].Profile_ID}'`;
        connection.query(queryProfileID, (err2, results2) => {
            if (err2) throw err;
            // Once the above is complete
            // console.log(results2);
            const accID = {
                accid: results2[0].Account_ID, // Save the account ID for easy reference (was used in earlier versions)
            };
            // console.log(accID.accid);

            // step 3) Create a statement that will get the business or persons name that holds the account
            const queryAccountName = `SELECT Name FROM website_user.AccountHolder WHERE \
                website_user.AccountHolder.Account_ID = '${accID.accid}'`; // Using the account id selected in step 2
            connection.query(queryAccountName, (err3, results3) => {
                if (err3) throw err;

                // Create a listing object that holds the information required
                const listing = {
                    serviceid: results[0].Service_ID,
                    name: results3[0].Name, // Selected in step 3
                    location: results[0].Location,
                    category: results[0].Category,
                    description: results[0].Description,
                };
                // console.log(listing);
                res.render('search.ejs', listing); // Render the new page with the information gathered
            });
        });
        // Now that the listing object is complete, render the HTML using the information from the EJS template
    });
});


// Allow the router object to be used in other js files.
// In this case we are making the router available as a
// module so that the route to the home page can be
// mounted to the express server in app.js
module.exports = router;
