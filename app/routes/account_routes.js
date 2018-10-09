// Including dependencies
const express = require('express');
const jwt = require('jsonwebtoken');
const connection = require('../database.js');

const router = express.Router();

// Serve the get request with the login.ejs page
router.get('/account/:id', (req, res, next) => {
    // Store user session information in a constant
    const userSession = req.cookies.SessionInfo;
    if (isNaN(req.params.id)) { // Check if ID for get is a number
        next(new Error('404'));
    } else if (!userSession) { // Check if user Session information is currently stored in browser, must be handled before JWT.verify is called
        next(new Error('401'));
    } else {
        // Decode JSON web token and output into variable decoded
        jwt.verify(userSession, 'dcjscomp602', (err, decoded) => {
            if (err) { // Return error 500, error on code side if function doesn't successfully call
                next(new Error('500'));
            } else if (decoded.data.Account_ID.toString() !== req.params.id) { // Check if ID stored in user session matches requested one
                next(new Error('401'));
            } else {
                // Query the account that is to be displayed
                const queryAccount = `SELECT * FROM AccountHolder where Account_id = ${req.params.id}`;
                connection.query(queryAccount, (err2, results) => {
                    if (err2) {
                        next(new Error('500'));
                    } else if (!results.length) {
                        next(new Error('404'));
                    } else {
                        // If query doesn't throw an error create an object with user values
                        const account = {
                            id: req.params.id,
                            name: results[0].Name,
                            email: results[0].Email,
                            password: results[0].Password,
                            session: decoded.data,
                            page: 'Account',
                        };
                        // Serve the page using values from account for template
                        res.render('account/account.ejs', account);
                    }
                });
            }
        });
    }
});

// GET Request to edit an account with a specific ID
router.get('/account/:id/edit', (req, res, next) => {
    // Store user session information in a constant
    const userSession = req.cookies.SessionInfo;
    if (isNaN(req.params.id)) { // Validate requested ID is not a string
        next(new Error('404'));
    } else if (!userSession) { // Check if user Session information is currently stored in browser, must be handled before JWT.verify is called
        next(new Error('401'));
    } else {
        // Decode JSON web token and output into variable decoded
        jwt.verify(userSession, 'dcjscomp602', (err, decoded) => {
            if (err) { // Return error 500, error on code side if function doesn't successfully call
                next(new Error('500'));
            } else if (decoded.data.Account_ID.toString() !== req.params.id) { // Check if ID stored in user session matches requested one
                next(new Error('401'));
            } else {
                // Run select query to get specified user
                const queryAccount = `SELECT * FROM AccountHolder where Account_id = ${req.params.id}`;
                connection.query(queryAccount, (err2, results) => {
                    if (err2) {
                        next(new Error('500'));
                    } else if (!results.length) {
                        next(new Error('404'));
                    } else {
                        // Create account object with information pulled from DB
                        const account = {
                            id: req.params.id,
                            prevName: results[0].Name,
                            prevEmail: results[0].Email,
                            prevPword: results[0].Password,
                            session: decoded.data,
                            page: 'Edit Account',
                        };
                        // Render page using information stored in account
                        res.render('account/edit_account.ejs', account);
                    }
                });
            }
        });
    }
});

// POST Request for editing an account page
router.post('/account/:id/edit', (req, res, next) => {
    // Store user session information in a constant
    const userSession = req.cookies.SessionInfo;
    if (isNaN(req.params.id)) { // Validate requested ID is not a string
        next(new Error('404'));
    } else if (!userSession) { // Check if user Session information is currently stored in browser, must be handled before JWT.verify is called
        next(new Error('401'));
    } else {
        // Decode JSON web token and output into variable decode
        jwt.verify(userSession, 'dcjscomp602', (err, decoded) => {
            if (err) { // Return error 500, error on code side if function doesn't successfully call
                next(new Error('500'));
            } else if (decoded.data.Account_ID.toString() !== req.params.id) { // Check if ID stored in user session matches requested one
                next(new Error('401'));
            } else {
                // Pull data to be used for update from fields
                const account = {
                    name: req.body.accountName,
                    email: req.body.accountEmail,
                };
                // Run update query
                const updateAccount = `UPDATE AccountHolder SET ? WHERE Account_id = ${req.params.id}`;
                connection.query(updateAccount, account, (err2) => {
                    if (err2) {
                        next(new Error('500'));
                    } else {
                        res.status(200);
                        res.redirect(`/account/${req.params.id}`);
                    }
                });
            }
        });
    }
});

// Serve the GET request for the change password page with a specific ID
router.get('/change_password/:id', (req, res, next) => {
    // Store user session information in a constant
    const userSession = req.cookies.SessionInfo;
    if (isNaN(req.params.id)) { // Validate requested ID is not a string
        next(new Error('404'));
    } else if (!userSession) { // Check if user Session information is currently stored in browser, must be handled before JWT.verify is called
        next(new Error('401'));
    } else {
        // Decode JSON web token and output into variable decode
        jwt.verify(userSession, 'dcjscomp602', (err, decoded) => {
            if (err) { // Return error 500, error on code side if function doesn't successfully call
                next(new Error('500'));
            } else if (decoded.data.Account_ID.toString() !== req.params.id) { // Check if ID stored in user session matches requested one
                next(new Error('401'));
            } else {
                // Run Query to pull user with :id from DB
                const queryAccount = `SELECT * FROM AccountHolder where Account_id = ${req.params.id}`;
                connection.query(queryAccount, (err2, results) => {
                // Check if error is thrown when SQL Query runs and return 500 code if it is
                    if (err2) {
                        next(new Error('500'));
                    } else if (!results.length) { // If no error is thrown on SQL Query check if requested ID is valid
                        next(new Error('404'));
                    } else {
                        results[0].id = req.params.id;
                        results[0].session = decoded.data;
                        results[0].page = 'Change Password';
                        // Render page using ID from the account
                        res.render('account/change_password.ejs', results[0]);
                    }
                });
            }
        });
    }
});

// POST Request for changing a password
router.post('/change_password/:id', (req, res, next) => {
    // Store user session information in a constant
    const userSession = req.cookies.SessionInfo;
    if (isNaN(req.params.id)) { // Validate requested ID is not a string
        next(new Error('404'));
    } else if (!userSession) { // Check if user Session information is currently stored in browser, must be handled before JWT.verify is called
        next(new Error('401'));
    } else {
        // Decode JSON web token and output into variable decode
        jwt.verify(req.cookies.SessionInfo, 'dcjscomp602', (err, decoded) => {
            if (err) { // Return error 500, error on code side if function doesn't successfully call
                next(new Error('500'));
            } else if (decoded.data.Account_ID.toString() !== req.params.id) { // Check if ID stored in user session matches requested one
                next(new Error('401'));
            } else {
                // Write select query to get user by ID
                const queryAccount = `SELECT * FROM AccountHolder where Account_id = ${req.params.id}`;
                connection.query(queryAccount, (err2, results) => {
                    if (err2) {
                        next(new Error('500'));
                    } else {
                        const account = {
                            account_id: req.params.id,
                            Password: results[0].Password,
                            Name: results[0].Name,
                            Email: results[0].Email,
                        };
                        // Check to see if password is correct
                        if (account.Password === req.body.oldPassword) {
                            // Check to see if new password matches repeated one and is different to old password
                            if ((req.body.newPassword === req.body.repeatPassword) && (req.body.newPassword !== account.password)) {
                                account.Password = req.body.newPassword;
                                const updateQuery = `UPDATE AccountHolder SET ? WHERE Account_id = ${req.params.id}`;
                                connection.query(updateQuery, account, (err3) => {
                                    if (err3) {
                                        next(new Error('500'));
                                    } else {
                                        res.status(200);
                                        res.redirect(`/account/${req.params.id}`);
                                    }
                                });
                            } else {
                                next(new Error('400'));
                            }
                        } else {
                            // If the password provided isn't correct send unauthorized response code
                            next(new Error('401'));
                        }
                    }
                });
            }
        });
    }
});

module.exports = router;
