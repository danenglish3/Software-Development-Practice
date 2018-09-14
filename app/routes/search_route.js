/* Dependencies */
const express = require('express');
const fs = require('fs');
const uuid = require('uuid/v4');
const connection = require('../database');
var session = require('express-session')

const router = express.Router(); // Get express's router functions
router.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}));

router.get('/search', (req, res) => {
    let listingResults = [];
    const singleListing = {
        serviceid: 0,
        name: 'asd ', // Selected in step 3
        location: ' asd',
        category: ' asd',
        description: ' asd',
        imageFiles: [], // Create empty array for holding filenames for the images
    };
    listingResults.push(singleListing);
    res.render('search.ejs', { listingResults });
});

router.post('/search', findServices, renderSearchPage, (req, res) => {});

function findServices(req, res, next) {
    // console.log(req);
    const searchParamaters = {
        location: req.body.searchLocation,
        category: req.body.searchCategory,
        keywords: req.body.searchKeywords,
    };

    console.log('search params', searchParamaters);
    if(searchParamaters.location === undefined){
        searchParamaters.location = 'Test'
        console.log('changed location to test');
    }
    if(searchParamaters.category === undefined){
        searchParamaters.category = 'Test'
    }

    let condition = [];
    const queryLocationService = `Location='${searchParamaters.location}'`;
    condition.push(queryLocationService);
    const queryCategoryService = `Category='${searchParamaters.category}'`;
    condition.push(queryCategoryService);
    condition.join(' AND ');

    let conditionString = condition.join(' AND ');
    console.log(conditionString);
    let sql = `SELECT * FROM website_user.Service WHERE ${conditionString}`;
    console.log(sql);
    connection.query(sql, (err, results) => {
        console.log(results);
        req.services = results;
        return next();
    });
}

function renderSearchPage(req, res) {
    let listingResults = [];
    let count = 0;
    // console.log('req length', req.services.length);
    req.services.forEach((service) => {
        // Step 4) Create a statement that will gather all the photos that are related to a aervice
        const queryPhotos = `SELECT * FROM Photo WHERE Service_ID = ${service.Service_ID}`;
        connection.query(queryPhotos, (err4, results4) => {
            // Create a singleListing object that holds the information required
            const singleListing = {
                serviceid: service.Service_ID,
                name: service.Title, // Selected in step 3
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
            // console.log('listing results', listingResults);
            count += 1;
            if (count === req.services.length) { // Once all the services has been looped through and added
                console.log('hit render ', listingResults);
                // res.render('search.ejs', { listingResults: listingResults });
                req.session.serviceResults = listingResults;
                res.redirect('/search/results');
                // Must be rendered in this step otherwise it wont work for some reason..
            }
        });
    });
}

router.get('/search/results', (req, res) => {
    let listingResults =  req.session.serviceResults;
    console.log('search/results', listingResults);
    res.render('search-results.ejs', {listingResults});
});
// Allow the router object to be used in other js files.
// In this case we are making the router available as a
// module so that the route to the home page can be
// mounted to the express server in app.js
module.exports = router;
