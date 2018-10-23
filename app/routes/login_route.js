// Including dependencies
const express = require('express');
const jwt = require('jsonwebtoken');
const connection = require('../database.js');

const router = express.Router();
const secretKey = 'dcjscomp602';

// Serve the get request with the login.ejs page
router.get('/login', (req, res) => {
    const sessionInfo = {
        session: null,
        page: 'Login',
    };
    res.render('login/login.ejs', sessionInfo);
});

// Create POST request to serve when Login button clicked
router.post('/login', (req, res, next) => {
    // Create local "loginUser" that stores information input in respective fields
    const loginUser = {
        email: req.body.loginEmail,
        password: req.body.loginPass,
    };

    // Create SQL Query to search DB for a user with input Email
    const loginQuery = `SELECT * FROM AccountHolder WHERE Email = '${loginUser.email.toLowerCase()}'`;
    // Store the results of the query in an array to be checked
    connection.query(loginQuery, (error, results) => {
        // Check if an error is thrown and log if so
        if (error) {
            next(new Error('400'));
        } else {
            // First check checks to see if a user was returned that matched input email
            if (results[0] != null) {
                // if a user was returned, make the check to see if password matches input password
                if (results[0].Password === loginUser.password) {
                    // If all checks pass then create a JSON Web Token for the users session that cna be used to verify their identity.
                    jwt.sign({
                        data: results[0],
                    }, secretKey, (err, Token) => {
                        if (err) {
                            next(new Error(500));
                        } else {
                            res.cookie('SessionInfo', Token, { maxAge: 9000000 });
                            res.status(200);
                            res.redirect('/');
                            res.end();
                        }
                    });
                    // Send cookie storing user session information to browser to be used for checks.
                } else {
                    // Else if user exists but passwords don't match send relevant error code
                    next(new Error('401'));
                }
            } else {
                // Else if no user was returned from SQL Query return code
                next(new Error('400'));
            }
        }
    });
});

router.get('/register', (req, res) => {
    const sessionInfo = {
        session: null,
        page: 'Register',
    };
    res.render('login/register.ejs', sessionInfo);
});

router.post('/register', (req, res, next) => {
    // Getting registration information for post request from forms
    const user = {
        email: req.body.registerEmail.toLowerCase(),
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
            console.log(error);
            next(new Error('500'));
        } else {
            // send response with successful code and message if user is created
            res.status(200);
            res.redirect('/login');
            res.end();
        }
    });
});

router.post('/logout', (req, res) => {
    res.clearCookie('SessionInfo');
    res.redirect('/');
});

module.exports = router;
