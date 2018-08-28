/* Dependencies */
const expect = require('chai').expect; // eslint-disable-line
const request = require('supertest'); // eslint-disable-line
const express = require('express');
const fs = require('fs');
const path = require('path');

describe('Express Instance', () => {
    const app = express(); // Initialise express
    const PORT = 3000; // Specify a network port

    // Start the server before running any tests
    before((done) => { // Pass done to tell mocha to wait until done() is called
        app.listen(PORT, () => { // Start the server while mocha is waiting
            done(); // Tell mocha we are done so it no longer has to wait
        });
    });

    // Close the server after all tests are complete
    after((done) => {
        app.removeAllListeners();
        done();
    });

    it('Should return a successful GET request', () => {
        // Respond to supertest's GET request and then check the feedback for status code 200
        request(app).get('/').expect(200);
    });

    it('Should return homepage as is', (done) => {
        // Get the path to index.html
        const filePath = path.join(__dirname, '../public/index.html');
        // Read the file at the path into a string (reading synchonously is OK for testing)
        const homepage = fs.readFileSync(filePath, { encoding: 'utf-8' }, (err, contents) => contents);

        // Respond to supertest's GET request with the file at filePath
        request(app)
            .get('/', (req, res) => {
                res.sendFile(filePath);
            })
            // Then compare the contents of the file we read with
            // the file we sent to ensure they are both the same
            .expect('Content-Type', 'text/html; charset utf-8')
            .expect(homepage);
        done();
    });
});