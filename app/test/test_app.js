/* Dependencies */
const expect = require('chai').expect; // eslint-disable-line
const request = require('supertest'); // eslint-disable-line
const express = require('express');

describe('Express Instance', () => {
    let app;
    let server;

    // Start the server before running any tests
    before((done) => { // Pass done to tell mocha to wait until done() is called
        app = express(); // Initialise express
        server = app.listen(3000, () => { // Start the server while mocha is waiting
            done(); // Tell mocha we are done so it no longer has to wait
        });
    });

    // Close the server after all tests are complete
    after((done) => {
        server.close();
        done();
    });

    it('Should return a successful GET request', () => {
        // Respond to supertest's GET request and then check the feedback for status code 200
        request(app).get('/').expect(200);
    });
});
