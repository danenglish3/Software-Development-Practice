/* Dependencies */
const session = require('express-session');// Used to save data between function calls
const express = require('express');
const fs = require('fs');
const uuid = require('uuid/v4');
const jwt = require('jsonwebtoken');
const connection = require('../database');

const router = express.Router(); // Get express's router functions
router.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 } })); // Initialize secret?

router.get('/search', (req, res) => { // Initial setup for search page
    const toReturn = {
        session: null,
        editable: false,
    };
    res.render('search/search.ejs', toReturn);
});

// First call after the .post from a new Search
function findServices(req, res, next) {
    const searchParamaters = { // Get search params from the form
        location: req.body.searchLocation,
        category: req.body.searchCategory,
        keywords: req.body.searchKeyword,
    };
    let needJoin = false; // Indicate if their is more than one search param
    // Location and category
    if (!(searchParamaters.location === 'Default') && !(searchParamaters.category === 'Default')) {
        needJoin = true;
    // location and keywords
    } else if (!(searchParamaters.location === 'Default') && !(searchParamaters.keywords === '')) {
        needJoin = true;
    // category and keywords
    } else if (!(searchParamaters.category === 'Default') && !(searchParamaters.keywords === '')) {
        needJoin = true;
    }

    req.undefResults = false; // Used to check if there are any results from the query
    // If nothing is entered in the search page, but they click search
    if ((searchParamaters.location === 'Default') && (searchParamaters.category === 'Default')
        && (searchParamaters.keywords === '')) {
        req.undefResults = true; // Set undefined results to true
    }
    const condition = []; // Search conditions
    if (!(searchParamaters.location === 'Default')) { // IF search by location, add to conditions
        const queryLocationService = `Location='${searchParamaters.location}'`;
        condition.push(queryLocationService);
    }
    if (!(searchParamaters.category === 'Default')) { // If search by category, add to conditions
        const queryCategoryService = `Category='${searchParamaters.category}'`;
        condition.push(queryCategoryService);
    }
    // This next section focus's on searching via keywords
    let keywordString;
    let keywordStringArray = [];
    if (!(searchParamaters.keywords === '')) { // If search by keywords, add them to conditions
        // Split the input keyword paramaters up into an array
        keywordStringArray = searchParamaters.keywords.split(' ');

        for (let i = 0; i < keywordStringArray.length; i += 1) {
            keywordString += keywordStringArray[i]; // Add each keyword into the final string
            if (!(i === keywordStringArray.length - 1)) {
                keywordString += '|'; // If theres more than one, a '|' is added for the final regexp query
            }
        }
        // For some reason there was always an undefined at the start of the string
        // So that needs to be cut away
        keywordString = keywordString.slice(9, keywordString.length);
        const queryDesc = `Description REGEXP '${keywordString}' OR Title REGEXP '${keywordString}'`;
        condition.push(queryDesc); // Push the keyword search string into the final query conditions
    }
    let conditionString; // Condition string for upcoming DB query
    if (needJoin) { // If there is a need to join the condition strings (if there is more than 1)
        conditionString = condition.join(' AND '); // If multiple conditions, join with AND
    } else {
        conditionString = condition[0]; // Else set the condition string to the lone query
    }
    const sql = `SELECT * FROM website_user.Service WHERE ${conditionString}`; // SQL query for getting srvices
    connection.query(sql, (err, results) => {
        if (err && !req.undefResults) {
            next(new Error('500'));
        } else {
            req.services = results; // Save service results in req to be used in next function
            return next(); // Call next function, renderSearchPage
        }
    });
}

function renderSearchPage(req, res, next) {
    const listingResults = []; // Final listing results array
    let count = 0; // Count of how many results there are
    // If the results of the query come back with nothing
    // Set undefResults to true for futher on in the function
    if (!(req.undefResults) && req.services.length === 0) {
        req.undefResults = true;
    }
    if (!(req.undefResults)) { // IF there are results to be displayed
        req.services.forEach((service) => { // For each service found in the previous function
        // Create a statement that will gather all the photos that are related to a aervice
            const queryPhotos = `SELECT * FROM Photo WHERE Photo_ID = ${service.MainPhotoID}`;
            connection.query(queryPhotos, (err, results4) => {
                if (err) {
                    next(new Error('500'));
                } else {
                    // Create a singleListing object that holds the information required
                    const singleListing = {
                        serviceid: service.Service_ID,
                        name: service.Title,
                        location: service.Location,
                        category: service.Category,
                        description: service.Description,
                        imageFile: 'no_img.png', // Create empty array for holding filenames for the images
                        profileid: service.Profile_ID,
                    };
                    // IF description is longer than 50 chars, cut down and add info to click
                    if (singleListing.description.length > 50) {
                        singleListing.description = singleListing.description.slice(0, 50);
                        singleListing.description += '. Click Profile to read more.';
                    }
                    results4.forEach((element) => { // For each result of the photo query (results3):
                        const filename = `${uuid()}.${element.Extension}`; // Create a filename
                        singleListing.imageFile = filename; // Add filename to array in singleListing object
                        // Write the file to the temp directory
                        fs.writeFile(`app/public/temp/${filename}`, element.Photo_Blob, (err5) => {
                            if (err5) throw err5;
                        });
                    });
                    listingResults.push(singleListing); // Push completed lising into final array
                    count += 1; // update count
                    if (count === req.services.length) { // Once all the services has been looped through and added
                        req.session.serviceResults = listingResults; // Save listing results to be used by next function
                        res.redirect('/search/results'); // Redirect user to a new page
                    }
                }
            });
        });
    } else { // IF there are no results to be displayed
        req.session.serviceResults = [];
        res.redirect('/search/results');
    }
}

// Post call for after a new search form has been submitted.
// Will goto findServices THEN renderSearchPage
router.post('/search', findServices, renderSearchPage, (req, res) => {});
// This is used to render a new search results page after geting all the results

router.get('/search/results', (req, res, next) => {
    const results = {
        session: null,
        listingResults: req.session.serviceResults,
    };
    const userSession = req.cookies.SessionInfo;
    if (!userSession) { // Check if user Session information is currently stored in browser
        res.render('search/search_results.ejs', results);
    } else {
        jwt.verify(userSession, 'dcjscomp602', (err, decoded) => {
            if (err) {
                next(err);
            } else {
                results.session = decoded.data;
                // Render the the HTML from the EJS template
                res.render('listing/new_listing', results);
            }
        });
    }
});

// Allow the router object to be used in other js files.
// In this case we are making the router available as a
// module so that the route to the home page can be
// mounted to the express server in app.js
module.exports = router;
