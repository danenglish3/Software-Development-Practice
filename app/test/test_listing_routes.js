/* Dependencies */
const chai = require('chai');
const express = require('express');
const request = require('supertest');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const ejs = require('ejs');
const fs = require('fs');

const expect = chai.expect;

describe('Listing Routes', () => {
    const app = express();

    // Set view engine to EJS
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '../views'));

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(multer({ storage: multer.memoryStorage({}) }).any());

    /* Sample Data */
    const sampleData = [
        {
            serviceid: '1',
            title: 'Water Heater Repair',
            author: "Bob's Plumbing",
            location: 'Auckland',
            category: 'Plumbing',
            description: 'desc',
            imageFiles: ['no_img.png'],
        },
    ];

    // Test GET request route
    it('Should return a listing page as is', (done) => {
        app.get('/listing/1', (req, res) => { // Define GET route
            res.render('listing.ejs', sampleData[0]); // Define response
        });

        request(app).get('/listing/1') // Make a GET request
            .expect('Content-Type', 'text/html; charset=utf-8') // Check if the response is HTML
            .expect(
                ejs.render( // Render an EJS template
                    fs.readFileSync( // By reading a file
                        path.join(__dirname, '../views/listing.ejs'), // From the views folder
                        { encoding: 'utf-8' },
                        (err, contents) => contents, // And returning the contents
                    ),
                    sampleData[0], // To be rendered using the sample data
                ),
            )
            .end(done);
    });

    it('Should return a data for a new listing', (done) => {
        const newData = {
            serviceid: (sampleData.length + 1).toString(), // Create new ID
            title: 'New Title', // Get form data from the body of the post request
            author: 'New Author',
            location: 'New Location',
            category: 'New Catergory',
            description: 'New Description',
            imageFiles: ['no_img.png'],
        };
        app.post('/new_listing', (req, res) => {
            for (const entry in req.body) { // eslint-disable-line
                expect(newData.entry).to.equal(req.body.entry); // Check if requested data reaches the express server
            }
            // Once sample data has been retrieved:
            const listing = { // Create a listing object
                serviceid: (sampleData.length + 1).toString(), // Create new ID
                title: req.body.listingTitle, // Get form data from the body of the post request
                author: req.body.listingAuthor,
                location: req.body.listingLocation,
                category: req.body.listingCatergory,
                description: req.body.listingDescription,
                imageFiles: [req.body.listingImages],
            };

            sampleData.push(listing); // Add the listing to the sample data

            for (const entry in req.body) { // eslint-disable-line
                expect(sampleData[1].entry).to.equal(req.body.entry); // Check if data has updated
            }

            res.json(listing).status(200);
        });

        // Make a post request with the fields
        request(app).post('/new_listing')
            .field('listingTitle', newData.title)
            .field('listingAuthor', newData.author)
            .field('listingLocation', newData.location)
            .field('listingCatergory', newData.category)
            .field('listingDescription', newData.description)
            .field('listingImages', newData.imageFiles[0])
            .expect(200, newData) // Check if response is successful and the response data matches
            .end(done);
    });
});
