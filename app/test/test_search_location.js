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

    /* Sample Data */
    const sampleData = [
        {
            // id: '1',
            location: 'Test',
            catergory: 'Plumbing',
            description: 'Aliquam erat volutpat. Duis tincidunt ipsum sit amet libero eleifend pharetra.',
        },
    ];

    it('Should return Search as is', (done) => {
        // Get express's router functions
        const router = express.Router();
        // Get the path to index.html
        // Read file at the specified path into a string (reading synchonously is OK for testing)
        const file = fs.readFileSync(path.join(__dirname, '../views/search.ejs'),
            { encoding: 'utf-8' }, (err, contents) => contents);
        // Render view with EJS
        const searchpage = ejs.render(file, { sampleData });

        // Respond to supertest's GET request with the file at filePath
        request(router)
            .get('/search/Test', (req, res) => {
                res.render('search.ejs', { sampleData });
            })
            // Then compare the contents of the file we read with
            // the file we sent to ensure they are both the same
            .expect('Content-Type', 'text/html; charset utf-8')
            .expect(searchpage);
        done();
    });
});
