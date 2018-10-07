const express = require('express');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const connection = require('../database');

const router = express.Router(); // Get express's router functions

// Create nodemailer transporter with ethereal SMTP server (https://ethereal.email/) as host
// NOTE: Emails are only sent in theory and are not actually recieved by the reciever as
// creating our own SMTP server is out of the scope of this project
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'zjqn7xhvlkzajmta@ethereal.email',
        pass: 'rCqhDGSjQ2PTWKrpxF',
    },
});

// Get the service details for the desired quote
function getService(req, res, next) {
    const queryService = `SELECT * FROM website_user.Service WHERE Service_ID=${req.params.id}`;
    console.log(req.params.id);
    connection.query(queryService, (err, results) => {
        if (err) {
            next(err);
        } else if (!results.length) {
            next(new Error('404'));
        } else {
            // Create a new service object
            req.service = {
                serviceID: req.params.id,
                serviceName: results[0].Title,
                profileID: results[0].Profile_ID,
            };
        }
        next(); // Call next func, renderQuotePage
    });
}

// This function is called after getService. It will render the new quote page
function renderQuotePage(req, res) {
    console.log(req.service);
    res.render('new_quote.ejs', req.service);
}

// Get for displaying new quote page, will call 2 functions
router.get('/new_quote/:id', getService, renderQuotePage, (req, res) => {});

// This function is called when the post request for new quote is sent
function insertQuote(req, res, next) {
    let userAccID; // User account ID needed to be saved in quote
    const userSession = req.cookies.SessionInfo; // Get the current user session details
    jwt.verify(userSession, 'dcjscomp602', (err, decoded) => { // Decode the session
        if (err) { // Return error 500, error on code side if function doesn't successfully call
            next(new Error('500'));
        } else {
            userAccID = decoded.data.Account_ID; // Sace current user account ID
            console.log(decoded.data);
        }
    });
    const quoteDetails = { // Create new Quote object
        serviceRequestedID: req.body.serviceID,
        accountRequestedFromID: userAccID,
        phoneNumber: req.body.quoteContact,
        emailAddress: req.body.quoteEmail,
        description: req.body.quoteDesc,
    };
    // console.log(quoteDetails);
    const insertQuoteStmnt = 'INSERT INTO Quote SET ?'; // Save into the DB
    connection.query(insertQuoteStmnt, quoteDetails, (err, results) => {
        if (err) {
            next(err);
        } else {
            return next();
        }
    });
}

function sendEmail(req, res, next) {
    const queryService = `SELECT Title, Profile_ID FROM Service WHERE Service_ID = ${req.body.serviceID}`;
    connection.query(queryService, (err, results) => {
        if (err) {
            next(err);
        } else {
            const getReciever = `SELECT Email FROM AccountHolder WHERE Account_ID = ${results[0].Profile_ID}`;
            connection.query(getReciever, (err2, results2) => {
                if (err2) {
                    next(err2);
                } else {
                    // Create a message object
                    const message = {
                        from: 'noreply@kiwitrader.com',
                        to: results2[0].Email,
                        replyTo: req.body.quoteEmail,
                        subject: 'Quote Request',
                        // Plain text version
                        text: `Quote requested from '${req.body.quoteEmail}' for service '${results[0].Title}'. Contact '${req.body.quoteContact}'`,
                        // HTML version
                        html: `<h1>Email:</h1><p>Quote requested from '${req.body.quoteEmail}' for service '${results[0].Title}'. Contact '${req.body.quoteContact}'</p><p><em>NOTE: Emails are only sent in theory and are not actually recieved by the reciever as creating our own SMTP server is out of the scope of this project</em></p>`,
                    };
                    transporter.sendMail(message, (err3) => {
                        if (err3) {
                            next(err3);
                        } else {
                            res.send(message.html);
                        }
                    });
                }
            });
        }
    });
}

router.post('/new_quote', insertQuote, sendEmail, (req, res) => {});

module.exports = router;
