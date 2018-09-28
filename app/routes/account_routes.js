// Including dependencies
const express = require('express');
const cookieParser = require('cookie-parser');
const connection = require('../database.js');

const router = express.Router();

// Serve the get request with the login.ejs page
router.get('/account/:id', (req, res, next) => {
    if (isNaN(req.params.id)) {
        next(new Error('404'));
    } else {
    // Query the account that is to be displayed
        const queryAccount = `SELECT * FROM AccountHolder where Account_id = ${req.params.id}`;
        const sessionUser = req.cookies.SessionInfo;
        connection.query(queryAccount, (err, results) => {
            if (err) {
                next(new Error('500'));
            } else if (!results.length) {
                next(new Error('404'));
            } else if ((sessionUser.Account_ID.toString() !== req.params.id) || (!sessionUser)) {
                next(new Error('401'));
            } else {
            // If query doesn't throw an error create an object with user values
                const account = {
                    id: req.params.id,
                    name: results[0].Name,
                    email: results[0].Email,
                    password: results[0].Password,
                };
                // Serve the page using values from account for template
                res.render('account.ejs', account);
            }
        });
    }
});

// GET Request to edit an account with a specific ID
router.get('/account/:id/edit', (req, res, next) => {
    if (isNaN(req.params.id)) {
        next(new Error('404'));
    } else {
        // Run select query to get specified user
        const queryAccount = `SELECT * FROM AccountHolder where Account_id = ${req.params.id}`;
        const sessionUser = req.cookies.SessionInfo;
        connection.query(queryAccount, (err, results) => {
            if (err) {
                next(new Error('500'));
            } else if (!results.length) {
                next(new Error('404'));
            } else if ((sessionUser.Account_ID.toString() !== req.params.id) || (req.cookies.SessionInfo === null)) {
                next(new Error('401'));
            } else {
                // Create account object with information pulled from DB
                const account = {
                    id: req.params.id,
                    prevName: results[0].Name,
                    prevEmail: results[0].Email,
                    prevPword: results[0].Password,
                };
                // Render page using information stored in account
                res.render('edit_account.ejs', account);
            }
        });
    }
});

// POST Request for editing an account page
router.post('/account/:id/edit', (req, res, next) => {
    if (isNaN(req.params.id)) {
        next(new Error('404'));
    } else {
    // Pull data to be used for update from fields
        const account = {
            name: req.body.accountName,
            email: req.body.accountEmail,
        };
        // Run update query
        const updateAccount = `UPDATE AccountHolder SET ? WHERE Account_id = ${req.params.id}`;
        connection.query(updateAccount, account, (err) => {
            if (err) {
                next(new Error('500'));
            } else {
                res.status(200);
                res.redirect(`/account/${req.params.id}`);
            }
        });
    }
});

// Serve the GET request for the change password page with a specific ID
router.get('/change_password/:id', (req, res, next) => {
    if (isNaN(req.params.id)) {
        next(new Error('404'));
    } else {
        // Run Query to pull user with :id from DB
        const queryAccount = `SELECT * FROM AccountHolder where Account_id = ${req.params.id}`;
        const sessionUser = req.cookies.SessionInfo;
        connection.query(queryAccount, (err, results) => {
            // Check if error is thrown when SQL Query runs and return 500 code if it is
            if (err) {
                next(new Error('500'));
            } else if (!results.length) { // If no error is thrown on SQL Query check if requested ID is valid
                next(new Error('404'));
            } else if ((sessionUser.Account_ID.toString() !== req.params.id) || (!sessionUser)) {
                next(new Error('401'));
            } else {
                results[0].id = req.params.id;
                // Render page using ID from the account
                res.render('change_password.ejs', results[0]);
            }
        });
    }
});

// POST Request for changing a password
router.post('/change_password/:id', (req, res, next) => {
    if (isNaN(req.params.id)) {
        next(new Error('404'));
    } else {
        // Write select query to get user by ID
        const queryAccount = `SELECT * FROM AccountHolder where Account_id = ${req.params.id}`;
        connection.query(queryAccount, (err, results) => {
            if (err) throw (err);
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
                    connection.query(updateQuery, account, (err2) => {
                        if (err2) {
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
        });
    }
});

module.exports = router;
