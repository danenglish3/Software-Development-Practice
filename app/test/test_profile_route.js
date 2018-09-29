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

/* Test Profile Routes */
describe('Profile Routes', () => { // Test profile routes
    const app = express();

    // Set view engine to EJS
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '../views'));

    // Add Express Middleware
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(multer({ storage: multer.memoryStorage({}) }).any());

    let sampleData;

    beforeEach((done) => { // Reset sample data before every test
        sampleData = {
            id: 1,
            name: "Tester's Auto Shop",
            image: 'no_img.png',
            joinDate: '01/01/2001',
            phone: '09 123 4567',
            street: '1 Example Street',
            suburb: 'CBD',
            city: 'Auckland',
            postcode: '0123',
            description: 'Unit Test',
            listingResults: [],
        };
        done();
    });

    // Test GET request route
    it('Should return a profile page as is', (done) => {
        app.get('/profile/1', (req, res) => { // Define GET route
            res.render('profile.ejs', sampleData); // Define response
        });

        request(app).get('/profile/1') // Make a GET request
            .expect('Content-Type', 'text/html; charset=utf-8') // Check if the response is HTML
            .expect(
                ejs.render( // Render an EJS template
                    fs.readFileSync( // By reading a file
                        path.join(__dirname, '../views/profile.ejs'), // From the views folder
                        { encoding: 'utf-8' },
                        (err, contents) => contents, // And returning the contents
                    ),
                    sampleData, // To be rendered using the sample data
                ),
            )
            .end(done);
    });

    // Test POST route with delete enabled
    it('Should return request to delete', (done) => {
        app.post('/edit_profile', (req, res) => { // Define POST route
            expect(req.body.delete === 'on');
            if (req.body.delete === 'on') {
                sampleData.name = null; // Update the old data with the new data
                sampleData.image = null;
                sampleData.phone = null;
                sampleData.street = null;
                sampleData.suburb = null;
                sampleData.city = null;
                sampleData.postcode = null;
                sampleData.description = null;
            }
            res.json(sampleData).status(200); // Send the updated data back
        });

        request(app).post('/edit_profile')
            .field('delete', 'on') // Submit new data
            .expect(200, sampleData) // Check if response is successful and the response data matches
            .end(done);
    });

    // Test POST route
    it('Should return updated profile information', (done) => {
        const newData = { // Define some new data
            name: 'New Name',
            image: 'newImage.png',
            phone: '09 987 6543',
            street: '2 New Street',
            suburb: 'Newton',
            city: 'Wellington',
            postcode: '3210',
            description: 'New Description',
        };

        app.post('/edit_profile', (req, res) => { // Define POST route
            // Check if data arrived
            expect(newData.name).to.equal(req.body.name);
            expect(newData.image).to.equal(req.body.image);
            expect(newData.phone).to.equal(req.body.phone);
            expect(newData.street).to.equal(req.body.street);
            expect(newData.suburb).to.equal(req.body.suburb);
            expect(newData.city).to.equal(req.body.city);
            expect(newData.postcode).to.equal(req.body.postcode);
            expect(newData.description).to.equal(req.body.description);

            sampleData.name = req.body.name; // Update the old data with the new data
            sampleData.image = req.body.image;
            sampleData.phone = req.body.phone;
            sampleData.street = req.body.street;
            sampleData.suburb = req.body.suburb;
            sampleData.city = req.body.city;
            sampleData.postcode = req.body.postcode;
            sampleData.description = req.body.description;

            // Check if data has updated
            expect(sampleData.name).to.equal(req.body.name);
            expect(sampleData.image).to.equal(req.body.image);
            expect(sampleData.phone).to.equal(req.body.phone);
            expect(sampleData.street).to.equal(req.body.street);
            expect(sampleData.suburb).to.equal(req.body.suburb);
            expect(sampleData.city).to.equal(req.body.city);
            expect(sampleData.postcode).to.equal(req.body.postcode);
            expect(sampleData.description).to.equal(req.body.description);

            res.json(sampleData).status(200); // Send the updated data back
        });

        request(app).post('/edit_profile')
            .field('name', newData.name) // Submit new data
            .field('image', newData.image)
            .field('phone', newData.phone)
            .field('street', newData.street)
            .field('suburb', newData.suburb)
            .field('city', newData.city)
            .field('postcode', newData.postcode)
            .field('description', newData.description)
            .expect(200, sampleData) // Check if response is successful and the response data matches
            .end(done);
    });
});
