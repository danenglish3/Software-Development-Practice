/* Dependencies */
const expect = require('chai').expect; // eslint-disable-line
const request = require('supertest'); // eslint-disable-line
const express = require('express');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const multer = require('multer');

describe('Listing Routes', () => {
    let app;
    let router;
    let server;

    /* Sample Data */
    const sampleData = [
        {
            serviceid: '1',
            title: 'Water Heater Repair',
            author: "Bob's Plumbing",
            location: 'Auckland',
            category: 'Plumbing',
            description: 'desc',
            imageFiles: [],
        },
    ];

    // Start the server before running any tests
    before((done) => { // Pass done to tell mocha to wait until done() is called
        app = express(); // Initialise express
        router = express.Router(); // Get express's router functions

        // Set view engine to EJS
        app.set('view engine', 'ejs');
        app.set('views', path.join(__dirname, '../views'));

        // Provide Express with middleware
        app.use(express.static(path.join(__dirname, 'public'))); // Specify the folder which holds static files
        app.use(bodyParser.json()); // Parse input text to JSON
        app.use(bodyParser.urlencoded({ extended: true })); // Ensure proper/safe URL encoding
        app.use(multer({ storage: multer.memoryStorage({}) }).any()); // Configure multer to hold uploaded file data in memory

        server = app.listen(3000, () => { // Start the server on port 3000 while mocha is waiting
            done(); // Tell mocha we are done so it no longer has to wait
        });
    });

    // Close the server after all tests are complete
    after((done) => {
        server.close();
        done();
    });

    it('Should return a listing page as is', (done) => {
        // Read file at the specified path into a string (reading synchonously is OK for testing)
        const file = fs.readFileSync(path.join(__dirname, '../views/listing.ejs'), { encoding: 'utf-8' }, (err, contents) => contents);
        // Render view with EJS using the object in sampleData
        const page = ejs.render(file, sampleData[0]);

        // Respond to supertest's GET request with the file at filePath
        request(router)
            .get('/listing/1', (req, res) => {
                // Render the the HTML from the EJS template using the object in sampleData
                res.render('listing.ejs', sampleData[0]);
            })
            // Then compare the contents of the file we read with
            // the file we sent to ensure they are both the same
            .expect('Content-Type', 'text/html; charset utf-8')
            .expect(page);
        done();
    });

    it('Should use POST data to create and return a new listing', (done) => {
        let newListingPage;
        app.post('/new_listing', (req, res) => {
            // Once sample data has been retrieved:
            const listing = { // Create a listing object
                serviceid: (sampleData.length + 1).toString(), // Create new ID
                title: req.body.listingTitle, // Get form data from the body of the post request
                author: req.body.listingAuthor,
                location: req.body.listingLocation,
                category: req.body.listingCatergory,
                description: req.body.listingDescription,
                imageFiles: [], // Create array to store file names of uploaded images
            };

            sampleData.push(listing); // Add the listing to the sample data

            // Respond to the request by displaying the new lisitng
            newListingPage = ejs.render('listing.ejs', listing);
            res.render('listing.ejs', listing);
        });

        // Make a post request with the fields
        request(app)
            .post('/new_listing')
            .set('Content-Type', 'multipart/form-data')
            .field('listingTitle', 'A title')
            .field('listingAuthor', 'An Author')
            .field('listingLocation', 'A location')
            .field('listingCatergory', 'A Category')
            .field('listingDescription', 'A Description')
            .end((err, res) => {
                expect(newListingPage);
                done();
            });
    });
});
