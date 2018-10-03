/* Dependencies */
const express = require('express');
const fs = require('fs');
const uuid = require('uuid/v4');
const jwt = require('jsonwebtoken');
const connection = require('../database');

/* Set up route for profile pages */

const router = express.Router(); // Get express's router functions
// Respond to the browsers 'get' for URL '/profile/id'
router.get('/profile/:id', (req, res, next) => {
    if (Number.isNaN(req.params.id)) { // If :id is not a number
        next(new Error('404')); // Trigger Express Error Handler
    } else {
        // Perform nested database queries to get all the information required for the EJS template
        const queryProfile = `SELECT * FROM Profile WHERE Profile_ID=${req.params.id}`;
        connection.query(queryProfile, (err, results) => {
            if (err) { // Trigger Express Error Handler if the query encounters an error
                next(err);
            } else if (!results.length) { // Trigger Express Error Handler if results are empty
                next(new Error('404'));
            } else {
                const queryAccount = `SELECT Name FROM AccountHolder WHERE Account_ID=${req.params.id}`;
                connection.query(queryAccount, (err2, results2) => {
                    if (err2) {
                        next(err2);
                    } else if (!results2.length) {
                        next(new Error('404'));
                    } else {
                        const queryPhoto = `SELECT Photo_Blob, Extension FROM Photo WHERE Photo_ID=${results[0].Photo_ID}`;
                        connection.query(queryPhoto, (err3, results3) => {
                            if (err3) {
                                next(err3);
                            } else {
                                const queryServices = `SELECT * FROM Service WHERE Profile_ID=${req.params.id}`;
                                connection.query(queryServices, (err4, results4) => {
                                    if (err4) {
                                        next(err4);
                                    } else {
                                        let filename;
                                        if (results3[0] == null) {
                                            filename = 'no_img.png';
                                        } else {
                                            filename = `${uuid()}.${results3[0].Extension}`;
                                            // Write the file to the temp directory
                                            fs.writeFile(`app/public/temp/${filename}`, results3[0].Photo_Blob, (err5) => {
                                                if (err5) next(err);
                                            });
                                        }

                                        // Create profile object with queried detials
                                        const profile = {
                                            session: null,
                                            page: results2[0].Name,
                                            editable: false,
                                            id: req.params.id,
                                            name: results2[0].Name,
                                            image: filename,
                                            joinDate: results[0].Joined_Date,
                                            phone: results[0].Phone_Number,
                                            street: results[0].Street_Name,
                                            suburb: results[0].Suburb,
                                            city: results[0].City,
                                            postcode: results[0].Postcode,
                                            description: results[0].Description,
                                            listingResults: [],
                                        };

                                        // Check if owner of the profile is logged in to enable editing/change nav
                                        const userSession = req.cookies.SessionInfo;
                                        if (userSession != null) {
                                            jwt.verify(userSession, 'dcjscomp602', (err5, decoded) => {
                                                if (err5) {
                                                    next(err5);
                                                } else {
                                                    profile.session = decoded.data;
                                                    if (decoded.data.Account_ID === results[0].Profile_ID) {
                                                        profile.editable = true;
                                                    }
                                                }
                                            });
                                        }

                                        // Render listings
                                        if (results4.length > 0) {
                                            let count = 0;
                                            results4.forEach((service) => { // For each service found in the previous function
                                                // Create a statement that will gather all the photos that are related to a aervice
                                                const queryPhotos = `SELECT * FROM Photo WHERE Service_ID = ${service.Service_ID}`;
                                                connection.query(queryPhotos, (err5, results5) => {
                                                    if (err5) {
                                                        next(err5);
                                                    } else {
                                                        // Create a singleListing object that holds the information required
                                                        const singleListing = {
                                                            serviceid: service.Service_ID,
                                                            name: service.Title,
                                                            location: service.Location,
                                                            category: service.Category,
                                                            description: service.Description,
                                                            imageFiles: [], // Create empty array for holding filenames for the images
                                                            profileid: service.Profile_ID,
                                                        };
                                                        results5.forEach((element) => { // For each result of the photo query (results3):
                                                            const imgFilename = `${uuid()}.${element.Extension}`; // Create a filename
                                                            singleListing.imageFiles.push(imgFilename); // Add filename to array in singleListing object
                                                            // Write the file to the temp directory
                                                            fs.writeFile(`app/public/temp/${imgFilename}`, element.Photo_Blob, (err6) => {
                                                                if (err6) next(err);
                                                            });
                                                        });
                                                        profile.listingResults.push({ singleListing }); // Push completed lising into final array
                                                        count += 1; // Update count

                                                        if (count === results4.length) { // Once all the services has been looped through and added
                                                            res.render('profile/profile', profile);
                                                        }
                                                    }
                                                });
                                            });
                                        } else {
                                            res.render('profile/profile', profile);
                                        }
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }
});

// Respond to the browsers 'get' for URL '/profile/id/edit'
router.get('/profile/:id/edit', (req, res, next) => {
    // Store user session information in a constant
    const userSession = req.cookies.SessionInfo;
    if (Number.isNaN(req.params.id)) {
        next(new Error('404'));
    } else if (!userSession) { // Check if user is logged in
        next(new Error('401'));
    } else {
        // Decode JSON web token and output into variable decoded
        jwt.verify(userSession, 'dcjscomp602', (err, decoded) => {
            if (err) {
                next(err);
            } else if (decoded.data.Account_ID.toString() !== req.params.id) { // Check if ID stored in user session matches requested one
                next(new Error('401'));
            } else {
                // Get profile data to display in editing fields
                const queryProfile = `SELECT * FROM Profile WHERE Profile_ID=${req.params.id}`;
                connection.query(queryProfile, (err2, results) => {
                    if (err2) {
                        next(err2);
                    } else if (!results.length) {
                        next(new Error('404'));
                    } else {
                        const queryAccount = `SELECT Name FROM AccountHolder WHERE Account_ID=${req.params.id}`;
                        connection.query(queryAccount, (err3, results2) => {
                            if (err3) {
                                next(err3);
                            } else if (!results.length) {
                                next(new Error('404'));
                            } else {
                                // Create profile object using queried data
                                const profile = {
                                    session: decoded.data,
                                    page: 'Editing Profile',
                                    accountID: results[0].Account_ID,
                                    prevPhoto: results[0].Photo_ID,
                                    prevName: results2[0].Name,
                                    prevPhone: results[0].Phone_Number,
                                    prevStreet: results[0].Street_Name,
                                    prevSuburb: results[0].Suburb,
                                    prevCity: results[0].City,
                                    prevPostcode: results[0].Postcode,
                                    prevDescription: results[0].Description,
                                };
                                // Render editing page using profile object
                                res.render('profile/edit_profile', profile);
                            }
                        });
                    }
                });
            }
        });
    }
});

router.post('/edit_profile', (req, res, next) => {
    const userSession = req.cookies.SessionInfo;
    if (!userSession) { // Check if user Session information is currently stored in browser, must be handled before JWT.verify is called
        next(new Error('401'));
    } else {
        // Decode JSON web token and output into variable decoded
        jwt.verify(userSession, 'dcjscomp602', (err, decoded) => {
            if (err) {
                next(err);
            } else if (decoded.data.Account_ID.toString() !== req.body.accountID) { // Check if ID stored in user session matches requested one
                next(new Error('401'));
            } else {
                // Delete profile is delete is enabled
                if (req.body.profileDelete === 'on') {
                    const deleteAccount = `DELETE FROM AccountHolder WHERE Account_ID = ${req.body.accountID}`;
                    connection.query(deleteAccount, (err2) => {
                        if (err2) {
                            next(err);
                        } else {
                            res.status(200);
                            res.redirect('/');
                        }
                    });
                } else {
                    const account = {
                        Name: req.body.accountName,
                    };

                    const updateAccount = `UPDATE AccountHolder SET ? WHERE Account_ID = ${req.body.accountID}`;
                    connection.query(updateAccount, account, (err2) => {
                        if (err2) {
                            next(err2);
                        } else {
                            // Create profile object with submitted data
                            const profile = {
                                Description: req.body.profileDescription,
                                Phone_Number: req.body.profilePhone,
                                Street_Name: req.body.profileStreet,
                                Suburb: req.body.profileSuburb,
                                City: req.body.profileCity,
                                Postcode: req.body.profilePostcode,
                            };

                            // Update the profile using profile object
                            const updateProfile = `UPDATE Profile SET ? WHERE Profile_ID = ${req.body.accountID}`;
                            connection.query(updateProfile, profile, (err3) => {
                                if (err3) next(err3);
                                if (req.files[0] !== undefined) {
                                    const file = req.files[0];
                                    const data = new Buffer.from(file.buffer, 'base64', (err4) => { // Read the encoded data into binary
                                        if (err4) next(err4);
                                    });
                                    const photo = { // Create photo object corresponding to 'Photo' table
                                        Photo_Blob: data,
                                        Extension: file.originalname.substring(file.originalname.lastIndexOf('.') + 1, file.originalname.length),
                                        Profile_ID: req.body.accountID,
                                    };
                                    const updatePhoto = `UPDATE Photo SET ? WHERE Photo_ID = ${req.body.photoID}`;
                                    connection.query(updatePhoto, photo, (err4) => {
                                        if (err4) next(err4);
                                        res.status(200);
                                        res.redirect(`/profile/${req.body.accountID}`);
                                    });
                                } else {
                                    res.status(200);
                                    res.redirect(`/profile/${req.body.accountID}`);
                                }
                            });
                        }
                    });
                }
            }
        });
    }
});

module.exports = router;
