const express = require('express');
const connection = require('../database');

const router = express.Router(); // Get express's router functions

function getService(req, res, next) {
    const queryService = `SELECT * FROM website_user.Service WHERE Service_ID=${req.params.id}`;
    console.log(req.params.id);
    connection.query(queryService, (err, results) => {
        if (err) {
            next(err);
        } else if (!results.length) {
            console.log('hit else');
            next(new Error('404'));
        } else {
            req.service = {
                serviceName: results[0].Title,
                prevProfile: results[0].Profile_ID,
            };
            console.log('hit else');
        }
        next();
    });
}

function renderQuotePage(req, res) {
    console.log(req.service);
    res.render('new_quote.ejs', req.service);
}

router.get('/new_quote/:id', getService, renderQuotePage, (req, res) => {});

module.exports = router;
