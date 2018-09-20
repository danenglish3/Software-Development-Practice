// Including dependencies
const express = require('express');
const connection = require('../database.js');

const router = express.Router();

// Serve the get request with the login.ejs page
router.get('/login', (req, res) => {
    res.render('../views/login.ejs');
});

// Create POST request to serve when Login button clicked
router.post('/login', (req, res) => {
    // Create local "loginUser" that stores information input in respective fields
    const loginUser = {
        email: req.body.loginEmail,
        password: req.body.loginPass,
    };

    // Create SQL Query to search DB for a user with input Email
    const loginQuery = `SELECT * FROM AccountHolder WHERE Email = '${loginUser.email}'`;
    // Store the results of the query in an array to be checked
    connection.query(loginQuery, (error, results) => {
        // Check if an error is thrown and log if so
        if (error) {
            console.log(error);
            res.send({
                code: 400,
            });
        } else {
            // First check checks to see if a user was returned that matched input email
            if (results[0] != null) {
                // if a user was returned, make the check to see if password matches input password
                if (results[0].Password === loginUser.password) {
                    // Send success code
                    res.send({
                        code: 200,
                        message: 'Successful login',
                    });
                } else {
                    // Else if user exists but passwords don't match send relevant error code
                    res.send({
                        code: 204,
                        message: 'Incorrect pword',
                    });
                }
            } else {
                // Else if no user was returned from SQL Query return code
                res.send({
                    code: 400,
                    message: 'not a registered user',
                });
            }
        }
    });
});

router.get('/register', (req, res) => {
    res.render('register.ejs');
});

router.post('/register', (req, res) => {
    // Getting registration information for post request from forms

    const user = {
        account_id: 1,
        email: req.body.registerEmail,
        password: req.body.registerPassword,
        name: req.body.registerName,

    };

    // Writing the SQL insertion query using the information gathered from the post form
    const insQuery = 'INSERT INTO AccountHolder SET ?';
    // Querying the database to inser the user into the database
    connection.query(insQuery, user, (error) => {
        // Catch error if it's thrown on account creation
        if (error) {
            // respond with a code and message if error is thrown
            console.log('Error', error);
            console.log(user.email, user.name, user.password);
            res.send({
                code: 400,
                message: 'creation failed',
            });
        } else {
            // send response with successful code and message if user is created
            res.send({
                code: 200,
                message: 'User registered successfully',
            });
        }
    });
});

module.exports = router;
