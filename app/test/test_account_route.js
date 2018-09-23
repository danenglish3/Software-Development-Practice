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

/* Test Account Routes */
describe('Account Routes', () => { // Test account routes
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
            email: 'Testers@auto.com',
            password: 'tester1',

        };
        done();
    });

    // Test GET request route
    it('Should return an account page', (done) => {
        app.get('/account/1', (req, res) => { // Define GET route
            res.render('account.ejs', sampleData); // Define response
        });

        request(app).get('/account/1') // Make a GET request
            .expect('Content-Type', 'text/html; charset=utf-8') // Check if the response is HTML
            .expect(
                ejs.render( // Render an EJS template
                    fs.readFileSync( // By reading a file
                        path.join(__dirname, '../views/account.ejs'), // From the views folder
                        { encoding: 'utf-8' },
                        (err, contents) => contents, // And returning the contents
                    ),
                    sampleData, // To be rendered using the sample data
                ),
            )
            .end(done);
    });

    // Test POST route
    it('Should return updated account information', (done) => {
        const newData = { // Define some new data
            name: 'New Name',
            email: 'NewName@test.com',
            id: 1,
        };

        app.post('/account/1/edit', (req, res) => { // Define POST route
            for (const entry in req.body) { // eslint-disable-line
                expect(newData.entry).to.equal(req.body.entry); // Check if requested data reaches the express server
            }

            sampleData.name = req.body.name; // Update the old data with the new data
            sampleData.email = req.body.email;

            for (const entry in req.body) { // eslint-disable-line
                expect(sampleData.entry).to.equal(req.body.entry); // Check if data has updated
            }

            res.json(sampleData).status(200); // Send the updated data back
        });

        request(app).post('/account/1/edit')
            .field('name', newData.name) // Submit new data
            .field('email', newData.email)
            .expect(200, sampleData) // Check if response is successful and the response data matches
            .end(done);
    });
});
