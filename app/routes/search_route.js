/* Dependencies */
const express = require('express');
const fs = require('fs');
const uuid = require('uuid/v4');
const connection = require('../database');


const router = express.Router(); // Get express's router functions

let searchResults = []; // Used to send listings back to search page
let serviceIdResults = [];

function pushService(serv) {
    // console.log(serv);
    if (searchResults.length === 0) {
        searchResults.push(serv);
    } else {
        searchResults.forEach((element) => {
            console.log(serv.serviceid);
            console.log(element.serviceid);
            if (!(element.serviceid === serv.serviceid)) {
                searchResults.push(serv);
                console.log(searchResults.length);
            }
        });
    }
}


router.get('/search', (req, res) => {
    searchResults = [];
    const singleListing = {
        serviceid: 0,
        name: ' ', // Selected in step 3
        location: ' ',
        category: ' ',
        description: ' ',
        imageFiles: [], // Create empty array for holding filenames for the images
    };
    pushService(singleListing);
    res.render('search.ejs', { searchResults });
});

router.post('/search', (req, res) => {
    const searchParamaters = {
        location: req.body.searchLocation,
        category: req.body.searchCategory,
        keywords: req.body.searchKeywords,
    };
    console.log(req);
    if (!(searchParamaters.location === 'default')) {
        new Promise(((resolve, reject) => {
            const queryService = `SELECT * FROM website_user.Service \
            WHERE Location='${searchParamaters.location}'`;
            connection.query(queryService, (err, results) => {
                resolve(results);
                console.log('results: ', results);
                console.log(queryService);
            });
        // return results;
        })).then(results => results.forEach((service) => {
            serviceIdResults.push(service.Service_ID);
            console.log('Location ids: ', serviceIdResults);
        }))
            .then(() => {
                let ids = `${serviceIdResults.join(',')}`;
                console.log(ids);
                const queryS = `SELECT * FROM website_user.Service WHERE Service_ID IN (${ids})`;
                connection.query(queryS, (err, results2) => {
                    // console.log('results 2 : ', results2);
                });
            // console.log(queryS);
            });
    }
    if (!(searchParamaters.category === 'default')) {
        new Promise(((resolve, reject) => {
            const queryService2 = `SELECT * FROM website_user.Service WHERE Category='${searchParamaters.category}'`;
            connection.query(queryService2, (err, results4) => {
                // resolve(results);
                console.log(queryService2);
                console.log('category results: ', results4);
            });
        // return results;
        })).then(results => results.forEach((service) => {
            serviceIdResults.push(service.Service_ID);
            console.log('Category Ids: ', serviceIdResults);
        }))
            .then(() => {
                let ids = `${serviceIdResults.join(',')}`;
                console.log(ids);
                const queryS = `SELECT * FROM website_user.Service WHERE Service_ID IN (${ids})`;
                connection.query(queryS, (err, results2) => {
                    // console.log('results 2 : ', results2);
                });
            // console.log(queryS);
            });
    }
});


/* function searchByLocation(req, res, searchParamaters) {
    if (!(req.body.searchLocation === 'default')) { // select all the services by location - if specified
        // console.log(searchParamaters);
        const queryService = `SELECT * FROM website_user.Service \
    WHERE Location='${searchParamaters.location}'`;
        connection.query(queryService, (err, results) => {
        // console.log(results.length);
            locationAffectedRows = results.length;
            console.log(locationAffectedRows);
            if (locationAffectedRows === 0) {
            // res.send('doesnt match');
                res.redirect('/invalid-search');
            }
            // Once the above query is complete:
            if (err) throw err;
            results.forEach((service) => {
            // Step 2) Create a statement to get the profile for which the service is linked to
                const queryProfileID = `SELECT Account_ID FROM website_user.Profile WHERE \
                website_user.Profile.Profile_ID = '${service.Profile_ID}'`;
                connection.query(queryProfileID, (err2, results2) => {
                    if (err2) throw err;
                    // Once the above is complete
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
                            pushService(singleListing);
                        });
                    });
                });
            });
        });
    }
} */


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
                        if (count === results.length) { // Once all the services has been looped through and added
                            console.log(listingResults);
                            res.render('search.ejs', { listingResults });
                            // Must be rendered in this step otherwise it wont work for some reason..
                        }
                    });
                });
            });
        });
    });
});

// Search by just a category
router.get('/search/category/:category', (req, res) => {
    const listingResults = [];
    let count = 0;
    // step 1) Create a select statement to query the db for a singleListing using the
    // ':category' in  the '/search/:category'
    const queryService = `SELECT * FROM website_user.Service \
        WHERE Category='${req.params.category}'`; // Submit the statement
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
                        if (count === results.length) { // Once all the services has been looped through and added
                            console.log(listingResults);
                            res.render('search.ejs', { listingResults });
                            // Must be rendered in this step otherwise it wont work for some reason..
                        }
                    });
                });
            });
        });
    });
});

router.get('/search/keyword', (req, res) => {
    let listingResults = [];
    let serviceIdResults = [];
    let count = 0;
    let parameterArray = req.query.key.split(' '); // Turn the parameter into an array of strings
    // console.log(parameterArray);
    const switchCase = 0;

    switch (switchCase) {
    case 0:
        parameterArray.forEach((element) => { // Search for Titles containing the keywords
            const queryService = `SELECT * FROM website_user.Service \
        WHERE Title LIKE '%${element}%'`; // Submit the statement
            connection.query(queryService, (err, results) => {
                // Once the above query is complete:
                if (err) throw err;
                // console.log(results);
                if (results.length > 0) {
                    results.forEach((service) => {
                        const singleID = {
                            serviceid: service.Service_ID,
                        };
                        serviceIdResults.push(singleID);
                    });
                }
                // console.log('Title', serviceIdResults);
            });
        });
    case 1:
        parameterArray.forEach((element) => { // Search for Titles containing the keywords
            const queryService = `SELECT * FROM website_user.Service \
                WHERE Description LIKE '%${element}%'`; // Submit the statement
            connection.query(queryService, (err, results) => {
            // Once the above query is complete:
                if (err) throw err;
                // console.log(results);
                if (results.length > 0) {
                    results.forEach((service) => {
                        const singleID = {
                            serviceid: service.Service_ID,
                        };
                        serviceIdResults.push(singleID);
                    });
                }
                // console.log('Description', serviceIdResults);
            });
        });
    case 2:
        parameterArray.forEach((element) => { // Search for Titles containing the keywords
            const queryService = `SELECT * FROM website_user.Service \
                WHERE Location LIKE '%${element}%'`; // Submit the statement
            connection.query(queryService, (err, results) => {
            // Once the above query is complete:
                if (err) throw err;
                // console.log(results);
                if (results.length > 0) {
                    results.forEach((service) => {
                        const singleID = {
                            serviceid: service.Service_ID,
                        };
                        serviceIdResults.push(singleID);
                    });
                }
                console.log('Location', serviceIdResults);
            });
        });
        const queryServices = `SELECT * FROM website_user.Service WHERE \
        website_user.Service.Service_ID IN ( ${1008} )`;
        connection.query(queryServices, (err7, results5) => {
            if (err7) throw err7;
            console.log('Services', results5);
            results5.forEach((service) => {
                // Step 2) Create a statement to get the profile for which the service is linked to
                const queryProfileID = `SELECT Account_ID FROM website_user.Profile WHERE \
                        website_user.Profile.Profile_ID = '${service.Profile_ID}'`;
                connection.query(queryProfileID, (err2, results2) => {
                    if (err2) throw err2;
                    // Once the above is complete
                    const accID = {
                        accid: results2[0].Account_ID,
                    };// Save the account ID for easy reference (was used in earlier versions)

                    // step 3) Create a statement that will get the business or persons name that holds the account
                    //         using the account id selected in step 2
                    const queryAccountName = `SELECT Name FROM website_user.AccountHolder WHERE \
                            website_user.AccountHolder.Account_ID = '${accID.accid}'`;
                    connection.query(queryAccountName, (err3, results3) => {
                        if (err3) throw err3;

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
                            results4.forEach((photo) => { // For each result of the photo query (results3):
                                const filename = `${uuid()}.${photo.Extension}`; // Create a filename
                                singleListing.imageFiles.push(filename); // Add filename to array in singleListing object
                                // Write the file to the temp directory
                                fs.writeFile(`app/public/temp/${filename}`, photo.Photo_Blob, (err5) => {
                                    if (err5) throw err5;
                                });
                            });

                            listingResults.push({ singleListing });
                            count += 1;
                            if (count === results5.length) { // Once all the services has been looped through and added
                                console.log(listingResults);
                                res.render('search.ejs', { listingResults });
                                // Must be rendered in this step otherwise it wont work for some reason..
                            }
                        });
                    });
                });
            });
        });
        break;
    default:
        console.log('hit defaul..');
    }


    // parameterArray.splice(invalidIndex[0], 1);
    // console.log(invalidIndex);
});

// Allow the router object to be used in other js files.
// In this case we are making the router available as a
// module so that the route to the home page can be
// mounted to the express server in app.js
module.exports = router;
