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
            expect(newData.title).to.equal(req.body.title);
            expect(newData.author).to.equal(req.body.author);
            expect(newData.location).to.equal(req.body.location);
            expect(newData.category).to.equal(req.body.category);
            expect(newData.description).to.equal(req.body.description);
            expect(newData.imageFiles[0]).to.equal(req.body.imageFiles);

            // Create listing object
            const listing = { // Create a listing object
                serviceid: (sampleData.length + 1).toString(), // Create new ID
                title: req.body.title, // Get form data from the body of the post request
                author: req.body.author,
                location: req.body.location,
                category: req.body.category,
                description: req.body.description,
                imageFiles: [req.body.imageFiles],
            };

            // Save listing object
            sampleData.push(listing); // Add the listing to the sample data

            // Check if listing object has been saved
            expect(sampleData[1].title).to.equal(req.body.title);
            expect(sampleData[1].author).to.equal(req.body.author);
            expect(sampleData[1].location).to.equal(req.body.location);
            expect(sampleData[1].category).to.equal(req.body.category);
            expect(sampleData[1].description).to.equal(req.body.description);
            expect(sampleData[1].imageFiles[0]).to.equal(req.body.imageFiles);

            res.json(sampleData[1]).status(200);
        });

        // Make a post request with the fields
        request(app).post('/new_listing')
            .field('title', newData.title)
            .field('author', newData.author)
            .field('location', newData.location)
            .field('category', newData.category)
            .field('description', newData.description)
            .field('imageFiles', newData.imageFiles[0])
            .expect(200, newData) // Check if response is successful and the response data matches
            .end(done);
    });

    it('Should return updated listing', (done) => {
        const newData = {
            serviceid: (sampleData.length + 1).toString(), // Create new ID
            title: 'Updated Title', // Get form data from the body of the post request
            author: 'Updated Author',
            location: 'Updated Location',
            category: 'Updated Catergory',
            description: 'Updated Description',
            imageFiles: ['no_img.png'],
        };
        app.post('/edit_listing', (req, res) => {
            expect(newData.title).to.equal(req.body.title);
            expect(newData.author).to.equal(req.body.author);
            expect(newData.location).to.equal(req.body.location);
            expect(newData.category).to.equal(req.body.category);
            expect(newData.description).to.equal(req.body.description);
            expect(newData.imageFiles[0]).to.equal(req.body.imageFiles);

            sampleData[0].title = req.body.title;
            sampleData[0].author = req.body.author;
            sampleData[0].location = req.body.location;
            sampleData[0].category = req.body.category;
            sampleData[0].description = req.body.description;
            sampleData[0].imageFiles[0] = req.body.imageFiles;

            // Check if listing object has been saved
            expect(sampleData[0].title).to.equal(req.body.title);
            expect(sampleData[0].author).to.equal(req.body.author);
            expect(sampleData[0].location).to.equal(req.body.location);
            expect(sampleData[0].category).to.equal(req.body.category);
            expect(sampleData[0].description).to.equal(req.body.description);
            expect(sampleData[0].imageFiles[0]).to.equal(req.body.imageFiles);

            res.json(sampleData[0]).status(200);
        });

        // Make a post request with the fields
        request(app).post('/edit_listing')
            .field('title', newData.title)
            .field('author', newData.author)
            .field('location', newData.location)
            .field('category', newData.category)
            .field('description', newData.description)
            .field('imageFiles', newData.imageFiles[0])
            .expect(200) // Check if response is successful and the response data matches
            .end((err, res) => {
                expect(newData.title).to.equal(res.body.title);
                expect(newData.author).to.equal(res.body.author);
                expect(newData.location).to.equal(res.body.location);
                expect(newData.category).to.equal(res.body.category);
                expect(newData.description).to.equal(res.body.description);
                expect(newData.imageFiles[0]).to.equal(res.body.imageFiles[0]);
                done();
            });
    });
});
