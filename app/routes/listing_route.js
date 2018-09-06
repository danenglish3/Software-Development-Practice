/* Dependencies */
const express = require('express');
const fs = require('fs');

/* Temporary fs data retrieve/save functions */

// TODO: Repalce with database
function getSampleData(callback) {
    fs.readFile('app/public/temp/data.json', 'utf8', (err, data) => {
        if (err) throw err;
        callback(JSON.parse(data));
    });
}

function saveSampleData(data, callback) {
    fs.writeFile('app/public/temp/data.json', JSON.stringify(data), 'utf8', (err) => {
        if (err) throw err;
        callback();
    });
}

/* Set up route for listing pages */

const router = express.Router(); // Get express's router functions
// Respond to the browsers 'get' request by serving listing.ejs to URL '/listing/id'
router.get('/listing/:id', (req, res) => {
    // Get ':id' from /listing/:id
    const reqID = req.params.id;
    // Get the sample data
    getSampleData((sampleData) => {
        // Return an object defined as 'listing' which has an 'id'
        // that matches the request parameter 'id' to queryResult
        const queryResult = sampleData.find(listing => listing.id === reqID);
        // Render the the HTML from the EJS template using the listing data in queryResult
        res.render('listing.ejs', queryResult);
    });
});

/* Set up routes for listing form */

// Respond to the browsers 'get' request by serving new_listing.ejs to URL '/new_listing'
router.get('/new_listing', (req, res) => {
    res.render('new_listing.ejs'); // Render the the HTML from the EJS template
});

// Respond to the browsers 'post' request by saving a new listing then displaying the listing
router.post('/new_listing', (req, res) => {
    // Get sample data
    getSampleData((sampleData) => {
        // Once sample data has been retrieved:

        const listing = { // Create a listing object
            id: (sampleData.length + 1).toString(), // Create new ID
            title: req.body.listingTitle, // Get form data from the body of the post request
            author: 'ACME Inc.',
            location: req.body.listingLocation,
            catergory: req.body.listingCatergory,
            description: req.body.listingDescription,
            imageFiles: [], // Create array to store file names of uploaded images
        };

        req.files.forEach((image) => { // Iterate though each image file uploaded in the post request
            const fileName = `${Date.now()}-${image.originalname}`; // Create a filename
            const data = new Buffer.from(image.buffer, 'base64', (err) => { // Read the encoded data into binary
                if (err) throw err;
            });

            fs.writeFile(`app/public/temp/uploads/${fileName}`, data, (err) => { // Write encoded data to a file
                if (err) throw err;
            });

            listing.imageFiles.push(fileName); // Add the file name to the listing object
        });

        sampleData.push(listing); // Add the listing to the sample data
        saveSampleData(sampleData, () => { // Save the sample data
            console.log('Data Saved!');
        });

        // Respond to the request by displaying the new lisitng
        res.render('listing.ejs', listing);
    });
});

// Allow the router object to be used in other js files.
// In this case we are making the router available as a
// module so that the route to the listing page can be
// mounted to the express server in app.js
module.exports = router;
