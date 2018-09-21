/* Dependencies */
const express = require('express');
const fs = require('fs');
const uuid = require('uuid/v4');
const connection = require('../database');

/* Set up route for profile pages */

const router = express.Router(); // Get express's router functions
// Respond to the browsers 'get' for URL '/profile/id'
router.get('/profile/:id', (req, res, next) => {
    if (isNaN(req.params.id)) { // If :id is not a number
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
                                        const profile = {
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
                                                            res.render('profile.ejs', profile);
                                                        }
                                                    }
                                                });
                                            });
                                        } else {
                                            res.render('profile.ejs', profile);
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

router.get('/profile/:id/edit', (req, res, next) => {
    const queryProfile = `SELECT * FROM Profile WHERE Profile_ID=${req.params.id}`;
    connection.query(queryProfile, (err, results) => {
        if (err) {
            next(err);
        } else if (!results.length) {
            next(new Error('404'));
        } else {
            const queryAccount = `SELECT Name FROM AccountHolder WHERE Account_ID=${req.params.id}`;
            connection.query(queryAccount, (err2, results2) => {
                if (err2) {
                    next(err2);
                } else if (!results.length) {
                    next(new Error('404'));
                } else {
                    const profile = {
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
                    res.render('edit_profile.ejs', profile);
                }
            });
        }
    });
});

router.post('/edit_profile', (req, res, next) => {
    if (req.body.profileDelete === 'on') {
        const deleteAccount = `DELETE FROM AccountHolder WHERE Account_ID = ${req.body.accountID}`;
        connection.query(deleteAccount, (err) => {
            if (err) next(err);
            res.end('Profile deleted');
        });
    } else {
        const profile = {
            Description: req.body.profileDescription,
            Phone_Number: req.body.profilePhone,
            Street_Name: req.body.profileStreet,
            Suburb: req.body.profileSuburb,
            City: req.body.profileSuburb,
            Postcode: req.body.profilePostcode,
        };
        const updateProfile = `UPDATE Profile SET ? WHERE Profile_ID = ${req.body.accountID}`;
        connection.query(updateProfile, profile, (err) => {
            if (err) next(err);
            if (req.files[0] !== undefined) {
                const file = req.files[0];
                const data = new Buffer.from(file.buffer, 'base64', (err2) => { // Read the encoded data into binary
                    if (err2) next(err2);
                });
                const photo = { // Create photo object corresponding to 'Photo' table
                    Photo_Blob: data,
                    Extension: file.originalname.substring(file.originalname.lastIndexOf('.') + 1, file.originalname.length),
                    Profile_ID: req.body.accountID,
                };
                const updatePhoto = `UPDATE Photo SET ? WHERE Photo_ID = ${req.body.photoID}`;
                connection.query(updatePhoto, photo, (err2) => {
                    if (err2) next(err2);
                    res.end('Profile updated');
                });
            } else {
                res.end('Profile updated');
            }
        });
    }
});

module.exports = router;
