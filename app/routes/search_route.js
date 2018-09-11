/* Dependencies */
const express = require('express');
const fs = require('fs');
const uuid = require('uuid/v4');
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
    const listingResults = [];
    let count = 0;
    // Create a select statement to query the db for a singleListing using the ':id' in  the '/singleListing/:id'
    const queryService = `SELECT * FROM website_user.Service \
        WHERE Location='${req.params.Location}'`; // Submit the statement
    connection.query(queryService, (err, results) => {
        // Once the above query is complete:
        if (err) throw err;
        results.forEach((service) => {
            // Step 2) Create a statement to get the profile for which the service is linked to
            const queryProfileID = `SELECT Account_ID FROM website_user.Profile WHERE \
                website_user.Profile.Profile_ID = '${service.Profile_ID}'`;
            connection.query(queryProfileID, (err2, results2) => {
                if (err2) throw err;
                // Once the above is complete
                // console.log(results2);
                const accID = {
                    accid: results2[0].Account_ID,
                };// Save the account ID for easy reference (was used in earlier versions)

                // step 3) Create a statement that will get the business or persons name that holds the account
                //         using the account id selected in step 2
                const queryAccountName = `SELECT Name FROM website_user.AccountHolder WHERE \
                    website_user.AccountHolder.Account_ID = '${accID.accid}'`;
                connection.query(queryAccountName, (err3, results3) => {
                    if (err3) throw err;

                    // Step 4) Create a statement that will gather all the photos that are related to a aervice
                    const queryPhotos = `SELECT * FROM Photo WHERE Service_ID = ${service.Service_ID}`;
                    connection.query(queryPhotos, (err4, results4) => {
                    // Create a singleListing object that holds the information required
                        const singleListing = {
                            serviceid: service.Service_ID,
                            name: results3[0].Name, // Selected in step 3
                            location: service.Location,
                            category: service.Category,
                            description: service.Description,
                            imageFiles: [], // Create empty array for holding filenames for the images
                        };
                        results4.forEach((element) => { // For each result of the photo query (results3):
                            const filename = `${uuid()}.${element.Extension}`; // Create a filename
                            singleListing.imageFiles.push(filename); // Add filename to array in singleListing object
                            // Write the file to the temp directory
                            fs.writeFile(`app/public/temp/${filename}`, element.Photo_Blob, (err5) => {
                                if (err5) throw err5;
                            });
                        });

                        listingResults.push({ singleListing });
                        count += 1;
                        if (count === results.length) {
                            console.log(listingResults);
                            res.render('search.ejs', { listingResults });
                        }

                        // res.render('search.ejs', { singleListing });
                        // console.log(listingResults);
                    });
                });
            });
        });
    });
    // console.log(listingResults);
    // res.render('search.ejs', { listingResults }); // Render the new page with the information gathered
});

// Search by just a category
router.get('/search/category/:category', (req, res) => {
    // step 1) Create a select statement to query the db for a singleListing using the
    // ':category' in  the '/search/:category'
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
            //         using the account id selected in step 2
            const queryAccountName = `SELECT Name FROM website_user.AccountHolder WHERE \
                        website_user.AccountHolder.Account_ID = '${accID.accid}'`;
            connection.query(queryAccountName, (err3, results3) => {
                if (err3) throw err;

                // Step 4) Create a statement that will gather all the photos that are related to a aervice
                const queryPhotos = `SELECT * FROM Photo WHERE Service_ID = ${results[0].Service_ID}`;
                connection.query(queryPhotos, (err4, results4) => {
                    // Create a singleListing object that holds the information required
                    const singleListing = {
                        serviceid: results[0].Service_ID,
                        name: results3[0].Name, // Selected in step 3
                        location: results[0].Location,
                        category: results[0].Category,
                        description: results[0].Description,
                        imageFiles: [], // Create empty array for holding filenames for the images
                    };
                    results4.forEach((element) => { // For each result of the photo query (results4):
                        const filename = `${uuid()}.${element.Extension}`; // Create a filename
                        singleListing.imageFiles.push(filename); // Add filename to array in singleListing object
                        // Write the file to the temp directory
                        fs.writeFile(`app/public/temp/${filename}`, element.Photo_Blob, (err5) => {
                            if (err5) throw err5;
                        });
                    });
                    // console.log(singleListing);
                    res.render('search.ejs', singleListing); // Render the new page with the information gathered
                });
            });
        });
    });
});


// Search by just a keyword
router.get('/search/keyword/:keyword', (req) => {
    const queryService = `SELECT * FROM website_user.Service \
        WHERE Title LIKE '${req.params.keyword}'`; // Submit the statement
    connection.query(queryService, (err, results) => {
        // Once the above query is complete:
        if (err) throw err;
        console.log(results);
    });
});

// Allow the router object to be used in other js files.
// In this case we are making the router available as a
// module so that the route to the home page can be
// mounted to the express server in app.js
module.exports = router;
