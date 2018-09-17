/* Dependencies */
const expect = require('chai').expect; // eslint-disable-line
const request = require('supertest'); // eslint-disable-line
const express = require('express');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

describe('Home Route', () => {
    const app = express();

    // Set view engine to EJS
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '../views'));

    // Test GET request route
    it('Should return the home page as is', (done) => {
        app.get('/', (req, res) => { // Define GET route
            res.render('index.ejs', { siteName: 'Kiwi Trader' }); // Define response
        });

        request(app).get('/') // Make a GET request
            .expect('Content-Type', 'text/html; charset=utf-8') // Check if the response is HTML
            .expect(
                ejs.render( // Render an EJS template
                    fs.readFileSync( // By reading a file
                        path.join(__dirname, '../views/index.ejs'), // From the views folder
                        { encoding: 'utf-8' },
                        (err, contents) => contents, // And returning the contents
                    ),
                    { siteName: 'Kiwi Trader' }, // To be rendered using the sample data
                ),
            )
            .end(done);
    });
});
