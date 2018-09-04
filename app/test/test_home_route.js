/* Dependencies */
const expect = require('chai').expect; // eslint-disable-line
const request = require('supertest'); // eslint-disable-line
const express = require('express');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

describe('Home Route', () => {
    let app;
    let server;

    // Start the server before running any tests
    before((done) => { // Pass done to tell mocha to wait until done() is called
        app = express(); // Initialise express
        // Set view engine to EJS
        app.set('view engine', 'ejs');
        server = app.listen(3000, () => { // Start the server on port 3000 while mocha is waiting
            done(); // Tell mocha we are done so it no longer has to wait
        });
    });

    // Close the server after all tests are complete
    after((done) => {
        server.close();
        done();
    });

    it('Should return homepage as is', (done) => {
        // Get express's router functions
        const router = express.Router();
        // Get the path to index.html
        const filePath = path.join(__dirname, '../views/index.ejs');
        // Read file at the specified path into a string (reading synchonously is OK for testing)
        const file = fs.readFileSync(filePath, { encoding: 'utf-8' }, (err, contents) => contents);
        // Render view with EJS
        const homepage = ejs.render(file, { siteName: 'Kiwi Trader' });

        // Respond to supertest's GET request with the file at filePath
        request(router)
            .get('/', (req, res) => {
                res.render(filePath, { siteName: 'Kiwi Trader' });
            })
            // Then compare the contents of the file we read with
            // the file we sent to ensure they are both the same
            .expect('Content-Type', 'text/html; charset utf-8')
            .expect(homepage);
        done();
    });
});
