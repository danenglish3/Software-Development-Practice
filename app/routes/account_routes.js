// Including dependencies
const express = require('express');
const connection = require('../database.js');

const router = express.Router();

// Serve the get request with the login.ejs page
router.get('/account/:id', (req, res, next) => {
    if (isNaN(req.params.id)) {
        next(new Error('404'));
    } else {
    // Query the account that is to be displayed
        const queryAccount = `SELECT * FROM AccountHolder where Account_id = ${req.params.id}`;
        connection.query(queryAccount, (error, results) => {
            if (error) {
                next(new Error('400'));
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
        connection.query(queryAccount, (err, results) => {
            if (err) throw err;
            // Create account object with information pulled from DB
            const account = {
                id: req.params.id,
                prevName: results[0].Name,
                prevEmail: results[0].Email,
                prevPword: results[0].Password,
            };
            // Render page using information stored in account
            res.render('edit_account.ejs', account);
        });
    }
});

// POST Request for editing an account page
router.post('/account/:id/edit', (req, res) => {
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
            if (err) throw (err);
            res.send({
                code: 200,
                message: 'Account Updated',
            });
        });
    }
});

// Serve the GET request for the change password page with a specific ID
router.get('/change_password/:id', (req, res, next) => {
    if (isNaN(req.params.id)) {
        next(new Error('404'));
    } else {
        const account = {
            id: req.params.id,
        };
        // Render page using ID from the account
        res.render('change_password.ejs', account);
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
                id: req.params.id,
                password: results[0].Password,
                name: results[0].Name,
                email: results[0].Email,
            };
                // Check to see if password is correct
            if (account.password === req.body.oldPassword) {
                // Check to see if new password matches repeated one and is different to old password
                if ((req.body.newPassword === req.body.repeatPassword) && (req.body.newPassword !== account.password)) {
                    const updateQuery = `UPDATE AccountHolder SET Password = ${req.body.newPassword} WHERE Account_id = ${req.params.id}`;
                    connection.query(updateQuery);
                    res.send({
                        code: 200,
                        message: 'Password updated',
                    });
                }
            } else {
                // If the password provided isn't correct send unauthorized response code
                next(new Error('401'));
            }
        });
    }
});

module.exports = router;
