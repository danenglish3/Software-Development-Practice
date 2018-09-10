/* Dependencies */
const express = require('express');
const fs = require('fs');
const uuid = require('uuid/v4');
const connection = require('../database');

/* Temporary fs data retrieve/save functions */

// TODO: Implement user
function getUser() {
    return '12350';
}

/* Set up route for listing pages */

const router = express.Router(); // Get express's router functions
// Respond to the browsers 'get' for URL '/listing/id'
router.get('/listing/:id', (req, res) => {
    // Create a select statement to query the db for a listing using the ':id' in  the '/listing/:id'
    const queryService = `SELECT * FROM Service WHERE Service_ID='${req.params.id}'`; // Submit the statement
    connection.query(queryService, (err, results, fields) => {
        // Once the above query is complete:
        if (err) throw err;
        // Create a select statement to query the db for the name of the author using the profile id
        const queryAuthor = `SELECT Name FROM AccountHolder WHERE Account_ID = ${results[0].Profile_ID}`;
        connection.query(queryAuthor, (err2, results2, fields2) => { // Sumbit the statement
            // Once the above query is complete:
            if (err2) throw err2;
            // Create a select statement to query the db for the photos
            const queryImages = `SELECT * FROM Photo WHERE Service_ID = ${results[0].Service_ID}`;
            connection.query(queryImages, (err3, results3, fields3) => { // Submit statement
                // Once the above query is complete:
                // Create a listing object with property names that correspond to the ejs template
                const listing = {
                    title: results[0].Title, // Use the information from the first query (results) to add the title
                    serviceid: results[0].Service_ID,
                    location: results[0].Location,
                    author: results2[0].Name, // Use the information from the second query (results2) to add the author
                    category: results[0].Category,
                    description: results[0].Description,
                    imageFiles: [], // Create empty array for holding filenames for the images
                };

                results3.forEach((element) => { // For each result of the photo query (results3):
                    const filename = `${uuid()}.${element.Extension}`; // Create a filename
                    listing.imageFiles.push(filename); // Add filename to array in listing object
                    // Write the file to the temp directory
                    fs.writeFile(`app/public/temp/${filename}`, element.Photo_Blob, (err4) => {
                        if (err4) throw err4;
                    });
                });
                // Now that the listing object is complete, render the HTML using the information from the EJS template
                res.render('listing.ejs', listing);
            });
        });
    });
});

/* Set up routes for listing form */

// Respond to the browsers 'get' request by serving new_listing.ejs to URL '/new_listing'
router.get('/new_listing', (req, res) => {
    res.render('new_listing.ejs'); // Render the the HTML from the EJS template
});

// Respond to the browsers 'post' to URL '/new_listing' request by saving a new listing
router.post('/new_listing', (req, res) => { // Make sure this URL matches the one in the ejs template in the form
    const listing = { // Create a listing object corresponding to 'Service' table in db
        Profile_ID: getUser(),
        Title: req.body.listingTitle, // Get form data from the body of the post request
        Description: req.body.listingDescription,
        Location: req.body.listingLocation,
        Category: req.body.listingCategory,
    };

    const insertService = 'INSERT INTO Service SET ?'; // Start insert statement
    // Complete insert statement within query using listing object
    connection.query(insertService, listing, (err, results, fields) => {
        if (err) throw err;

        req.files.forEach((file) => { // Iterate though each image file uploaded in the post request
            const data = new Buffer.from(file.buffer, 'base64', (err2) => { // Read the encoded data into binary
                if (err2) throw err2;
            });

            const image = { // Create image object corresponding to 'Photo' table
                Photo_Blob: data,
                Extension: file.originalname.substring(file.originalname.lastIndexOf('.') + 1, file.originalname.length),
                Service_ID: results.insertId,
            };

            // Insert images
            const insertImage = 'INSERT INTO Photo SET ?';
            connection.query(insertImage, image, (err3, results2, fields) => {
                if (err3) throw err3;
            });
        });
        res.end(`Saved! to /listing/${results.insertId}`); // Send saved response
    });
    // Respond to the request by displaying the new lisitng
    // res.render('listing.ejs', listing);
});

// Allow the router object to be used in other js files.
// In this case we are making the router available as a
// module so that the route to the listing page can be
// mounted to the express server in app.js
module.exports = router;
