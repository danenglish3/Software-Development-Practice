const expect = require('chai').expect; // eslint-disable-line
const request = require('supertest'); // eslint-disable-line
const express = require('express');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const multer = require('multer');


describe('Login routes', () => {
    let app;
    let router;
    let server;

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

    it('Should return login page', (done) => {
        // Read file at the specified path into a string (reading synchonously is OK for testing)
        const file = fs.readFileSync(path.join(__dirname, '../views/login.ejs'), { encoding: 'utf-8' }, (err, contents) => contents);
        // Render view with EJS
        const page = ejs.render(file);
        request(router)
            // Run a .get request to get the page to render
            .get('/login')
            // Write expects for what is expected from the return of get request
            .expect('Content-Type', 'text/html; charset utf-8')
            .expect(200)
            .expect(page);
        done();
    });

    it('Should return register page', (done) => {
        // Read file at the specified path into a string (reading synchonously is OK for testing)
        const file = fs.readFileSync(path.join(__dirname, '../views/register.ejs'), { encoding: 'utf-8' }, (err, contents) => contents);
        // Render view with EJS
        const page = ejs.render(file);
        request(router)
            // Run a .get request to get the page to render
            .get('/register')
            // Write expects for what is expected from the return of get request
            .expect('Content-Type', 'text/html; charset utf-8')
            .expect(200)
            .expect(page);
        done();
    });

    it('Should post a new user', (done) => {
        // Write a sample post request
        request(app)
            // Post some data to check the request works
            .post('/register')
            .send({
                accountid: 5,
                name: 'testName',
                password: 'testPassword',
                email: 'test@example.com',
            })
            // Expect a 200 status response
            .end(() => {
                expect(200);
                done();
            });
    });
});
