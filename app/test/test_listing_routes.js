/* Dependencies */
const expect = require('chai').expect; // eslint-disable-line
const request = require('supertest'); // eslint-disable-line
const express = require('express');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

describe('Listing Routes', () => {
    let app;
    let router;
    let server;

    /* Sample Data */
    const sampleData = [
        {
            id: '1',
            title: 'Water Heater Repair',
            author: "Bob's Plumbing",
            location: 'Auckland',
            catergory: 'Plumbing',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam sit amet iaculis nunc. Aliquam erat volutpat. Duis tincidunt ipsum sit amet libero eleifend pharetra. Integer sem nisi, mattis eget tortor eget, accumsan viverra mi. Quisque lobortis felis est, ut volutpat metus euismod a. Nunc lacinia nec est sit amet viverra. Proin enim nulla, laoreet iaculis enim vitae, interdum vestibulum ligula. Donec at libero id dui dapibus scelerisque sed eget turpis. Cras faucibus ac libero ac malesuada. Cras vulputate neque ut varius mattis. Cras congue velit ac posuere interdum. Praesent rutrum leo ac neque eleifend tincidunt.',
        },
    ];

    // Start the server before running any tests
    before((done) => { // Pass done to tell mocha to wait until done() is called
        app = express(); // Initialise express
        router = express.Router(); // Get express's router functions
        app.set('view engine', 'ejs'); // Set view engine to EJS
        server = app.listen(3000, () => { // Start the server on port 3000 while mocha is waiting
            done(); // Tell mocha we are done so it no longer has to wait
        });
    });

    // Close the server after all tests are complete
    after((done) => {
        server.close();
        done();
    });

    it('Should return a listing page as is', (done) => {
        // Get the path to listing.ejs
        const filePath = path.join(__dirname, '../views/listing.ejs');
        // Read file at the specified path into a string (reading synchonously is OK for testing)
        const file = fs.readFileSync(filePath, { encoding: 'utf-8' }, (err, contents) => contents);
        // Render view with EJS using the object in sampleData
        const page = ejs.render(file, sampleData[0]);

        // Respond to supertest's GET request with the file at filePath
        request(router)
            .get('/listing/1', (req, res) => {
                // Render the the HTML from the EJS template using the object in sampleData
                res.render(path.join(__dirname, '../views/listing.ejs'), sampleData[0]);
            })
            // Then compare the contents of the file we read with
            // the file we sent to ensure they are both the same
            .expect('Content-Type', 'text/html; charset utf-8')
            .expect(page);
        done();
    });

    it('Should return a listing form page as is', (done) => {
        // Get the path to listing-form.ejs
        const filePath = path.join(__dirname, '../views/listing-form.ejs');
        // Read file at the specified path into a string (reading synchonously is OK for testing)
        const file = fs.readFileSync(filePath, { encoding: 'utf-8' }, (err, contents) => contents);
        // Render view with EJS using the object in sampleData
        const page = ejs.render(file, sampleData[0]);

        // Respond to supertest's GET request with the file at filePath
        request(router)
            .get('/new-listing', (req, res) => {
                // Render the the HTML from the EJS template using the object in sampleData
                res.render(path.join(__dirname, '../views/listing.ejs'), sampleData[0]);
            })
            // Then compare the contents of the file we read with
            // the file we sent to ensure they are both the same
            .expect('Content-Type', 'text/html; charset utf-8')
            .expect(page);
        done();
    });
});
