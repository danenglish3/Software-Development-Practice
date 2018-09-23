/* Dependencies */
const expect = require('chai').expect; // eslint-disable-line
const request = require('supertest'); // eslint-disable-line
const express = require('express');

describe('Express Instance', () => {
    let app;
    let server;

    // Close the server after all tests are complete
    after((done) => {
        server.close();
        done();
    });

    // Start the server before running any tests
    it('Should start the server', (done) => { // Pass done to tell mocha to wait until done() is called
        app = express(); // Initialise express
        server = app.listen(3000, () => { // Start the server while mocha is waiting
            done(); // Tell mocha we are done so it no longer has to wait
        });
    });

    it('Should return a successful GET request', (done) => {
        // Respond to supertest's GET request and then check the feedback for status code 200
        const myObject = {
            message: 'Hello World',
        };
        app.get('/', (req, res) => {
            res.status(200).json(myObject);
        });
        request(app).get('/')
            .send(myObject)
            .expect(200)
            .expect(myObject)
            .end(done);
    });
});
