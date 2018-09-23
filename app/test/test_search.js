/* Dependencies */
const expect = require('chai').expect; // eslint-disable-line
const request = require('supertest'); // eslint-disable-line
const express = require('express');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

describe('Search Route', () => {
    let app;
    let server;

    // Start the server before running any tests
    before((done) => { // Pass done to tell mocha to wait until done() is called
        app = express(); // Initialise express

        // Set view engine to EJS
        app.set('view engine', 'ejs');
        app.set('views', path.join(__dirname, '../views'));

        // Provide Express with middleware
        app.use(express.static(path.join(__dirname, 'public'))); // Specify the folder which holds static files

        server = app.listen(3000, () => { // Start the server on port 3000 while mocha is waiting
            done(); // Tell mocha we are done so it no longer has to wait
        });
    });

    // Close the server after all tests are complete
    after((done) => {
        server.close();
        done();
    });


    // Begin test for rendering a search page determined by location
    it('Should return a Search using a keyword, category and location', (done) => {
        // Get express's router functions
        const router = express.Router();
        const listingResults = [];
        const singleListing = {
            serviceid: 1000,
            name: 'Test',
            location: 'Test',
            category: 'Test',
            description: 'Test Desc',
            imageFiles: [],
        };

        listingResults.push(singleListing); // Get the path to index.html

        // Render view with EJS
        const searchpage = ejs.render('search-results.ejs', { listingResults });

        request(app)
            .post('/search')
            .set('Content-Type', 'multipart/form-data')
            .field('searchKeyword', '')
            .field('searchLocation', 'Test')
            .field('searchCatergory', 'Test')
            .end((err, res) => {
                expect(searchpage);
                done();
            });

        // Respond to supertest's GET request with the file at filePath
    });
});
