// Including dependencies
const express = require('express');
const connection = require('../database.js');

const router = express.Router();

// Serve the get request with the login.ejs page
router.get('/account/:id', (req, res) => {
    res.render('../views/account.ejs');
    const queryAccount = `SELECT * FROM AccountHolder where account_id = ${req.params.id}`;
    connection.query(queryAccount, (error, results) => {
        if (error) {
            console.log(error);
            res.send({
                code: 400,
            });
        } else {
            const account = {
                name: results[0].name,
                email: results[0].email,
                password: results[0].password,
            };
            console.log(account);
            res.render('account.ejs', account);
        }
    });
});

module.exports = router;
