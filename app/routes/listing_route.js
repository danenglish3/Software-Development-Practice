/* Dependencies */
const express = require('express');
const fs = require('fs');
const uuid = require('uuid/v4');
const jwt = require('jsonwebtoken');
const connection = require('../database');


/* Temporary fs data retrieve/save functions */

/* Set up route for listing pages */

const router = express.Router(); // Get express's router functions
// Respond to the browsers 'get' for URL '/listing/id'
router.get('/listing/:id', (req, res, next) => {
    // Create a select statement to query the db for a listing using the ':id' in  the '/listing/:id'
    const queryService = `SELECT * FROM Service WHERE Service_ID='${req.params.id}'`; // Submit the statement
    connection.query(queryService, (err, results) => {
        // Once the above query is complete:
        if (err) { // Trigger Express Error Handler if there is an error
            next(err);
        } else if (!results.length) { // If the query return is empty trigger 404 error
            next(new Error('404'));
        } else {
            // Create a select statement to query the db for the name of the author using the profile id
            const queryAuthor = `SELECT Name FROM AccountHolder WHERE Account_ID = ${results[0].Profile_ID}`;
            connection.query(queryAuthor, (err2, results2) => { // Sumbit the statement
                // Once the above query is complete:
                if (err2) {
                    next(err2);
                } else if (!results2.length) {
                    next(new Error('404'));
                } else {
                    // Create a select statement to query the db for the photos
                    const queryImages = `SELECT * FROM Photo WHERE Service_ID = ${results[0].Service_ID}`;
                    connection.query(queryImages, (err3, results3) => { // Submit statement
                        if (err3) {
                            next(err3);
                        } else {
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
                                    if (err4) next(err4);
                                });
                            });
                            // Now that the listing object is complete, render the HTML using the information from the EJS template
                            res.render('listing.ejs', listing);
                        }
                    });
                }
            });
        }
    });
});

/* Set up routes for listing form */

// Respond to the browsers 'get' request by serving new_listing.ejs to URL '/new_listing'
router.get('/new_listing/:id', (req, res, next) => {
    const userSession = req.cookies.SessionInfo;
    if (isNaN(req.params.id)) {
        next(new Error('404'));
    } else if (!userSession) {
        next(new Error('401'));
    } else {
        jwt.verify(userSession, 'dcjscomp602', (err, decoded) => {
            if (err) {
                next(new Error('500'));
            } else if (decoded.data.Account_ID.toString() !== req.params.id) {
                next(new Error('401'));
            } else {
                res.render('new_listing.ejs'); // Render the the HTML from the EJS template
            }
        });
    }
});

// Respond to the browsers 'post' to URL '/new_listing' request by saving a new listing
router.post('/new_listing/:id', (req, res, next) => { // Make sure this URL matches the one in the ejs template in the form
    const userSession = req.cookies.SessionInfo;
    if (isNaN(req.params.id)) {
        next(new Error('404'));
    } else if (!userSession) {
        next(new Error('401'));
    } else {
        jwt.verify(userSession, 'dcjscomp602', (err, decoded) => {
            if (err) {
                next(new Error('500'));
            } else if (decoded.data.Account_ID.toString() !== req.params.id) {
                next(new Error('401'));
            } else {
                const listing = { // Create a listing object corresponding to 'Service' table in db
                    Profile_ID: req.params.id,
                    Title: req.body.listingTitle, // Get form data from the body of the post request
                    Description: req.body.listingDescription,
                    Location: req.body.listingLocation,
                    Category: req.body.listingCategory,
                };

                const insertService = 'INSERT INTO Service SET ?'; // Start insert statement
                // Complete insert statement within query using listing object
                connection.query(insertService, listing, (err2, results) => {
                    if (err2) {
                        next(err2);
                    } else {
                        req.files.forEach((file) => { // Iterate though each image file uploaded in the post request
                            const data = new Buffer.from(file.buffer, 'base64', (err3) => { // Read the encoded data into binary
                                if (err3) next(err3);
                            });

                            const image = { // Create image object corresponding to 'Photo' table
                                Photo_Blob: data,
                                Extension: file.originalname.substring(file.originalname.lastIndexOf('.') + 1, file.originalname.length),
                                Profile_ID: listing.Profile_ID,
                                Service_ID: results.insertId,
                            };

                            // Insert images
                            const insertImage = 'INSERT INTO Photo SET ?';
                            connection.query(insertImage, image, (err4) => {
                                if (err4) next(err4);
                            });
                        });
                        res.end(`Saved /listing/${results.insertId}`); // Send saved response
                    }
                });
            // Respond to the request by displaying the new lisitng
            // res.render('listing.ejs', listing);
            }
        });
    }
});

// Respond to the browsers 'get' for URL '/listing/id/edit'
router.get('/listing/:id/edit', (req, res, next) => {
    // Create a select statement to query the db for a listing using the ':id' in  the '/listing/:id'
    const queryService = `SELECT * FROM Service WHERE Service_ID='${req.params.id}'`; // Submit the statement
    connection.query(queryService, (err, results) => {
        // Once the above query is complete:
        if (err) {
            next(err);
        } else if (!results.length) {
            next(new Error('404'));
        } else {
            // Create a select statement to query the db for the photos
            const queryImages = `SELECT * FROM Photo WHERE Service_ID = ${results[0].Service_ID}`;
            connection.query(queryImages, (err2, results2) => { // Submit statement
                // Create a listing object with property names that correspond to the ejs template
                if (err2) {
                    next(err2);
                } else {
                    const listing = {
                        accountID: results[0].Profile_ID,
                        listingID: results[0].Service_ID,
                        prevTitle: results[0].Title, // Use the information from the first query (results) to add the title
                        prevLocation: results[0].Location,
                        prevCategory: results[0].Category,
                        prevDesc: results[0].Description,
                        prevImages: [],
                        imageFiles: [], // Create empty array for holding filenames for the images
                    };

                    results2.forEach((element) => { // For each result of the photo query (results3):
                        const filename = `${uuid()}.${element.Extension}`; // Create a filename
                        listing.imageFiles.push(filename); // Add filename to array in listing object
                        listing.prevImages.push(element.Photo_ID);
                        // Write the file to the temp directory
                        fs.writeFile(`app/public/temp/${filename}`, element.Photo_Blob, (err3) => {
                            if (err3) next(err3);
                        });
                    });
                    // Now that the listing object is complete, render the HTML using the information from the EJS template
                    res.render('edit_listing.ejs', listing);
                }
            });
        }
    });
});

// Respond to the browsers 'post' request to URL '/new_listing' by saving a new listing
router.post('/edit_listing', (req, res, next) => { // Make sure this URL matches the one in the ejs template in the form
    if (req.body.listingDelete === 'on') {
        const deleteService = `DELETE FROM Service WHERE Service_ID = ${req.body.listingID}`;
        connection.query(deleteService, (err) => {
            if (err) next(err);
            res.end('Deleted Listing!');
        });
    } else {
        const listing = { // Create a listing object corresponding to 'Service' table in db
            Title: req.body.listingTitle, // Get form data from the body of the post request
            Description: req.body.listingDescription,
            Location: req.body.listingLocation,
            Category: req.body.listingCategory,
        };

        const updateService = `UPDATE Service SET ? WHERE Service_ID = ${req.body.listingID}`; // Start insert statement
        // Complete insert statement within query using listing object
        connection.query(updateService, listing, (err) => {
            if (err) next(err);
            if (req.body.delete) {
                req.body.delete.forEach((element) => {
                    const deleteImage = `DELETE FROM Photo WHERE Photo_ID = ${parseInt(element, 10)}`;
                    connection.query(deleteImage, (err2) => {
                        if (err2) next(err2);
                    });
                });
            }

            req.files.forEach((file) => { // Iterate though each image file uploaded in the post request
                const data = new Buffer.from(file.buffer, 'base64', (err2) => { // Read the encoded data into binary
                    if (err2) next(err2);
                });

                const image = { // Create image object corresponding to 'Photo' table
                    Photo_Blob: data,
                    Extension: file.originalname.substring(file.originalname.lastIndexOf('.') + 1, file.originalname.length),
                    Profile_ID: req.body.accountID,
                    Service_ID: req.body.listingID,
                };

                // Insert images
                const insertImage = 'INSERT INTO Photo SET ?';
                connection.query(insertImage, image, (err2) => {
                    if (err2) next(err2);
                });
            });
            res.end(`Saved /listing/${req.body.listingID}`); // Send saved response
        });
    // Respond to the request by displaying the new lisitng
    // res.render('listing.ejs', listing);
    }
});

// Allow the router object to be used in other js files.
// In this case we are making the router available as a
// module so that the route to the listing page can be
// mounted to the express server in app.js
module.exports = router;
