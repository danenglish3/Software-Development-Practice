/* Dependencies */
const session = require('express-session');// Used to save data between function calls
const express = require('express');
const fs = require('fs');
const uuid = require('uuid/v4');
const connection = require('../database');

const router = express.Router(); // Get express's router functions
router.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 } })); // Initialize secret?    

router.get('/search', (req, res) => { // Initial setup for search page
    res.render('search.ejs');
});

// First call after the .post from a new Search
function findServices(req, res, next) {
    // console.log(req);
    const searchParamaters = { // Get search params from the form
        location: req.body.searchLocation,
        category: req.body.searchCategory,
        keywords: req.body.searchKeyword,
    };
    let needJoin = false; // Indicate if their is more than one search param
    if (!(searchParamaters.location === 'Default') && !(searchParamaters.category === 'Default')) {
        needJoin = true;
    }
    else if (!(searchParamaters.location === 'Default') && !(searchParamaters.keywords === '')) {
        needJoin = true;
    }
    else if (!(searchParamaters.category === 'Default') && !(searchParamaters.keywords === '')) {
        needJoin = true;
    }
    console.log('search params', searchParamaters);

    let condition = []; // Search conditions
    if (!(searchParamaters.location === 'Default')) { // IF search by location, add to conditions
        const queryLocationService = `Location='${searchParamaters.location}'`;
        condition.push(queryLocationService);
    }
    if (!(searchParamaters.category === 'Default')) { // If search by category, add to conditions
        const queryCategoryService = `Category='${searchParamaters.category}'`;
        condition.push(queryCategoryService);
    }
    // let keywordStringArray = [];
    let keywordString;
    if (!(searchParamaters.keywords === '')) { // If search by keywords, add them to conditions
        let keywordStringArray = [];
        keywordStringArray = searchParamaters.keywords.split(' ');
        // console.log('array length' ,keywordStringArray.length);
        // console.log('keyword array: ', keywordStringArray);
        for (let i = 0; i < keywordStringArray.length; i += 1) {
            keywordString += keywordStringArray[i];
            if (!(i === keywordStringArray.length - 1)) {
                keywordString += '|';
            }
        }
        keywordString = keywordString.slice(9, keywordString.length);
        // console.log('keyword string: ', keywordString);
        const queryDesc = `Description REGEXP '${keywordString}'`;
        condition.push(queryDesc);
    }

    let conditionString; // Condition string for upcoming DB query
    console.log('condition ', condition);
    if (needJoin) {
        conditionString = condition.join(' AND '); // If multiple conditions, join with AND
    } else {
        conditionString = condition[0];
    }
    console.log(conditionString);
    let sql = `SELECT * FROM website_user.Service WHERE ${conditionString}`; // SQL query for getting srvices
    console.log(sql);
    connection.query(sql, (err, results) => {
        console.log(results);
        req.services = results; // Save service results in req to be used in next function
        return next(); // Call next function, renderSearchPage
    });
}

function renderSearchPage(req, res) {
    let listingResults = []; // Final listing results array
    let count = 0; // Count of how many results there are

    req.services.forEach((service) => { // For each service found in the previous function
        // Create a statement that will gather all the photos that are related to a aervice
        const queryPhotos = `SELECT * FROM Photo WHERE Service_ID = ${service.Service_ID}`;
        connection.query(queryPhotos, (err4, results4) => {
            // Create a singleListing object that holds the information required
            const singleListing = {
                serviceid: service.Service_ID,
                name: service.Title,
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
            listingResults.push({ singleListing }); // Push completed lising into final array
            count += 1; // update count
            if (count === req.services.length) { // Once all the services has been looped through and added
                // console.log('hit render ', listingResults);
                // res.render('search.ejs', { listingResults: listingResults });
                req.session.serviceResults = listingResults; // Save listing results to be used by next function
                res.redirect('/search/results'); // Redirect user to a new page
            }
        });
    });
}

// Post call for after a new search form has been submitted.
// Will goto findServices THEN renderSearchPage
router.post('/search', findServices, renderSearchPage, (req, res) => {});
// This is used to render a new search results page after geting all the results

router.get('/search/results', (req, res) => {
    let listingResults = req.session.serviceResults; // Results saved in previous function
    // console.log('search/results', listingResults);
    res.render('search-results.ejs', { listingResults }); // Render the new page
});

// Allow the router object to be used in other js files.
// In this case we are making the router available as a
// module so that the route to the home page can be
// mounted to the express server in app.js
module.exports = router;
