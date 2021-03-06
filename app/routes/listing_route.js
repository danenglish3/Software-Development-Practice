/* Dependencies */
const express = require('express');
const fs = require('fs');
const uuid = require('uuid/v4');
const jwt = require('jsonwebtoken');
const async = require('async');
const connection = require('../database');

/* Set up route for listing pages */

const router = express.Router(); // Get express's router functions

// Respond to the browsers 'get' for URL '/listing/id'
router.get('/listing/:id', (req, res, next) => {
    if (Number.isNaN(req.params.id)) { // Check if ID for get is a number
        next(new Error('404'));
    } else {
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
                                    session: null,
                                    editable: false,
                                    saved: false,
                                    title: results[0].Title, // Use the information from the first query (results) to add the title
                                    serviceid: results[0].Service_ID,
                                    location: results[0].Location,
                                    author: { // Use the information from the first & second query to add the author
                                        id: results[0].Profile_ID,
                                        name: results2[0].Name,
                                    },
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

                                // Check if owner of listing is logged in to enable editing
                                const userSession = req.cookies.SessionInfo;
                                if (userSession != null) {
                                    jwt.verify(userSession, 'dcjscomp602', (err4, decoded) => {
                                        if (err4) {
                                            next(err(err4));
                                        } else {
                                            listing.session = decoded.data;
                                            if (decoded.data.Account_ID === results[0].Profile_ID) {
                                                listing.editable = true;
                                            }
                                            const checkSaved = `SELECT * FROM Saved WHERE Profile_ID = ${decoded.data.Account_ID} AND Service_ID = ${results[0].Service_ID}`;
                                            connection.query(checkSaved, (err5, results4) => {
                                                if (err5) {
                                                    next(err5);
                                                } else {
                                                    if (results4.length) {
                                                        if (results4[0].Service_ID === results[0].Service_ID) {
                                                            listing.saved = true;
                                                        }
                                                    }
                                                    res.render('listing/listing', listing);
                                                }
                                            });
                                        }
                                    });
                                } else {
                                    // Now that the listing object is complete, render the HTML using the information from the EJS template
                                    res.render('listing/listing', listing);
                                }
                            }
                        });
                    }
                });
            }
        });
    }
});

/* Set up routes for listing form */

// Respond to the browsers 'get' request by serving new_listing.ejs to URL '/new_listing'
router.get('/new_listing', (req, res, next) => {
    const userSession = req.cookies.SessionInfo;
    if (!userSession) { // Check if user Session information is currently stored in browser
        next(new Error('401'));
    } else {
        jwt.verify(userSession, 'dcjscomp602', (err, decoded) => {
            if (err) {
                next(err(err));
            } else {
                const newListing = {
                    session: decoded.data,
                    page: 'New Listing',
                };
                // Render the the HTML from the EJS template
                res.render('listing/new_listing', newListing);
            }
        });
    }
});

// Respond to the browsers 'post' to URL '/new_listing' request by saving a new listing
router.post('/new_listing', (req, res, next) => {
    const userSession = req.cookies.SessionInfo;
    if (!userSession) {
        next(new Error('401'));
    } else {
        jwt.verify(userSession, 'dcjscomp602', (err, decoded) => {
            if (err) {
                next(err);
            } else {
                // Create a listing object corresponding to 'Service' table in db
                const listing = {
                    Profile_ID: decoded.data.Account_ID,
                    Title: req.body.listingTitle, // Get form data from the body of the post request
                    Description: req.body.listingDescription,
                    Location: req.body.listingLocation,
                    Category: req.body.listingCategory,
                };

                // Start insert statement
                const insertService = 'INSERT INTO Service SET ?';
                // Complete insert statement within query using listing object
                connection.query(insertService, listing, (err2, results) => {
                    if (err2) {
                        next(err2);
                    } else {
                        // Iterate though each image file uploaded in the post request
                        req.files.forEach((file) => {
                            // Read the encoded data into binary
                            const data = new Buffer.from(file.buffer, 'base64', (err3) => {
                                if (err3) next(err3);
                            });

                            // Create image object corresponding to 'Photo' table
                            const image = {
                                Photo_Blob: data,
                                Extension: file.originalname.substring(file.originalname.lastIndexOf('.') + 1, file.originalname.length),
                                Profile_ID: listing.Profile_ID,
                                Service_ID: results.insertId,
                            };

                            // Insert images
                            const insertImage = 'INSERT INTO Photo SET ?';
                            connection.query(insertImage, image, (err3) => {
                                if (err3) next(err3);
                            });
                        });

                        // Redirect to listing
                        res.status(200);
                        res.redirect(`/listing/${results.insertId}`);
                    }
                });
            }
        });
    }
});

// Respond to the browsers 'get' for URL '/listing/id/edit'
router.get('/listing/:id/edit', (req, res, next) => {
    // Get session
    const userSession = req.cookies.SessionInfo;
    if (Number.isNaN(req.params.id)) { // Check if ID for get is a number
        next(new Error('404'));
    } else if (!userSession) { // Check if user Session information is currently stored in browser, must be handled before JWT.verify is called
        next(new Error('401'));
    } else {
        jwt.verify(userSession, 'dcjscomp602', (err, decoded) => {
            if (err) { // Return error, error on code side if function doesn't successfully call
                next(err);
            } else {
                // Create a select statement to query the db for a listing using the ':id' in  the '/listing/:id'
                const queryService = `SELECT * FROM Service WHERE Service_ID='${req.params.id}'`; // Submit the statement
                connection.query(queryService, (err2, results) => {
                    // Once the above query is complete:
                    if (err2) {
                        next(err2);
                    } else if (decoded.data.Account_ID !== results[0].Profile_ID) { // Check if ID stored in user session matches requested one
                        next(new Error('401'));
                    } else if (!results.length) {
                        next(new Error('404'));
                    } else {
                        // Create a select statement to query the db for the photos
                        const queryImages = `SELECT * FROM Photo WHERE Service_ID = ${results[0].Service_ID}`;
                        connection.query(queryImages, (err3, results2) => { // Submit statement
                            // Create a listing object with property names that correspond to the ejs template
                            if (err3) {
                                next(err3);
                            } else {
                                const listing = {
                                    session: decoded.data,
                                    accountID: results[0].Profile_ID,
                                    listingID: results[0].Service_ID,
                                    prevTitle: results[0].Title, // Use the information from the first query (results) to add the title
                                    prevLocation: results[0].Location,
                                    prevCategory: results[0].Category,
                                    prevDesc: results[0].Description,
                                    prevImages: [], // Create empty array for holding filenames for the images
                                    imageFiles: [],
                                };

                                results2.forEach((element) => { // For each result of the photo query (results3):
                                    const filename = `${uuid()}.${element.Extension}`; // Create a filename
                                    listing.imageFiles.push(filename); // Add filename to array in listing object
                                    listing.prevImages.push(element.Photo_ID);
                                    // Write the file to the temp directory
                                    fs.writeFile(`app/public/temp/${filename}`, element.Photo_Blob, (err5) => {
                                        if (err5) next(err5);
                                    });
                                });

                                // Now that the listing object is complete, render the HTML using the information from the EJS template
                                res.render('listing/edit_listing', listing);
                            }
                        });
                    }
                });
            }
        });
    }
});

// Respond to the browsers 'post' request to URL '/new_listing' by saving a new listing
router.post('/edit_listing', (req, res, next) => {
    const userSession = req.cookies.SessionInfo;
    if (!userSession) { // Check if user Session information is currently stored in browser, must be handled before JWT.verify is called
        next(new Error('401'));
    } else {
        jwt.verify(userSession, 'dcjscomp602', (err, decoded) => {
            if (err) {
                next(err);
            } else if (decoded.data.Account_ID.toString() !== req.body.accountID) {
                next(new Error('401'));
            } else {
                if (req.body.listingDelete === 'on') {
                    const deleteService = `DELETE FROM Service WHERE Service_ID = ${req.body.listingID}`;
                    connection.query(deleteService, (err2) => {
                        if (err2) next(err2);
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
                    connection.query(updateService, listing, (err2) => {
                        if (err2) next(err2);
                        if (req.body.delete) {
                            req.body.delete.forEach((element) => {
                                const deleteImage = `DELETE FROM Photo WHERE Photo_ID = ${parseInt(element, 10)}`;
                                connection.query(deleteImage, (err3) => {
                                    if (err3) next(err3);
                                });
                            });
                        }

                        req.files.forEach((file) => { // Iterate though each image file uploaded in the post request
                            const data = new Buffer.from(file.buffer, 'base64', (err3) => { // Read the encoded data into binary
                                if (err3) next(err3);
                            });

                            const image = { // Create image object corresponding to 'Photo' table
                                Photo_Blob: data,
                                Extension: file.originalname.substring(file.originalname.lastIndexOf('.') + 1, file.originalname.length),
                                Profile_ID: req.body.accountID,
                                Service_ID: req.body.listingID,
                            };

                            // Insert images
                            const insertImage = 'INSERT INTO Photo SET ?';
                            connection.query(insertImage, image, (err3) => {
                                if (err3) next(err3);
                            });
                        });

                        res.status(200);
                        res.redirect(`/listing/${req.body.listingID}`);
                    });
                }
            }
        });
    }
});

// Respond to the browsers 'get' request to URL '/saved' by displaying list of saved services
router.get('/saved', (req, res, next) => {
    const userSession = req.cookies.SessionInfo;
    if (!userSession) {
        next(new Error('401'));
    } else {
        jwt.verify(userSession, 'dcjscomp602', (err, decoded) => {
            if (err) {
                next(err);
            } else {
                const getSaved = `SELECT * FROM Service INNER JOIN Saved ON Saved.Service_ID = Service.Service_ID WHERE Saved.Profile_ID = ${decoded.data.Account_ID}`;
                connection.query(getSaved, (err2, results) => {
                    if (err2) {
                        next(err2);
                    } else {
                        const savedServices = {
                            session: decoded.data,
                            allListings: [],
                        };
                        if (!results.length) { // If there are no saved services to be displayed
                            savedServices.allListings = null;
                        } else { // If there are saved services to be displayed
                            async.each(results, (service, callback) => {
                                // Create a statement that will gather all the photos that are related to a aervice
                                const queryPhotos = `SELECT * FROM Photo WHERE Photo_ID = ${service.MainPhotoID}`;
                                connection.query(queryPhotos, (err3, results2) => {
                                    if (err3) {
                                        next(err3);
                                    } else {
                                        // Create a singleListing object that holds the information required
                                        const singleListing = {
                                            serviceid: service.Service_ID,
                                            name: service.Title,
                                            location: service.Location,
                                            category: service.Category,
                                            description: service.Description,
                                            imageFile: null,
                                            profileid: service.Profile_ID,
                                        };

                                        // If description is longer than 50 chars, cut down and add info to click
                                        if (singleListing.description.length > 50) {
                                            singleListing.description = singleListing.description.slice(0, 50);
                                            singleListing.description += '. Click Profile to read more.';
                                        }

                                        if (results2[0] == null) {
                                            singleListing.imageFile = 'no_img.png';
                                        } else {
                                            const filename = `${uuid()}.${results2[0].Extension}`; // Create a filename
                                            singleListing.imageFile = filename; // Add filename to array in singleListing object
                                            // Write the file to the temp directory
                                            fs.writeFile(`app/public/temp/${filename}`, results2[0].Photo_Blob, (err5) => {
                                                if (err5) next(err5);
                                            });
                                        }
                                        savedServices.allListings.push(singleListing); // Push completed lising into final array
                                        callback();
                                    }
                                });
                            }, (err3) => {
                                if (err3) {
                                    next(err3);
                                } else {
                                    res.render('listing/saved_listings', savedServices);
                                }
                            });
                        }
                    }
                });
            }
        });
    }
});

// Respond to the browsers 'post' request to URL '/save' by saving the service
router.post('/save', (req, res, next) => {
    const userSession = req.cookies.SessionInfo;
    if (!userSession) {
        next(new Error('401'));
    } else {
        jwt.verify(userSession, 'dcjscomp602', (err, decoded) => {
            if (err) {
                next(err);
            } else {
                const save = {
                    Profile_ID: decoded.data.Account_ID,
                    Service_ID: req.body.serviceID,
                };
                const saveQuery = 'INSERT INTO Saved SET ?';
                connection.query(saveQuery, save, (err2) => {
                    if (err2) {
                        next(err2);
                    } else {
                        res.status(200);
                        res.redirect(`/listing/${req.body.serviceID}`);
                    }
                });
            }
        });
    }
});

// Respond to the browsers 'post' request to URL '/delete_save' by deleting the service
router.post('/delete_save', (req, res, next) => {
    const userSession = req.cookies.SessionInfo;
    if (!userSession) {
        next(new Error('401'));
    } else {
        jwt.verify(userSession, 'dcjscomp602', (err, decoded) => {
            if (err) {
                next(err);
            } else {
                const deleteSaved = `DELETE FROM Saved WHERE Profile_ID = ${decoded.data.Account_ID} AND Service_ID = ${req.body.serviceID}`;
                connection.query(deleteSaved, (err2, results) => {
                    if (err2) {
                        next(err);
                    } else {
                        res.status(200);
                        res.redirect(`/listing/${req.body.serviceID}`);
                    }
                });
            }
        });
    }
});

// Allow the router object to be used in other js files.
// In this case we are making the router available as a
// module so that the route to the listing page can be
// mounted to the express server in app.js
module.exports = router;
