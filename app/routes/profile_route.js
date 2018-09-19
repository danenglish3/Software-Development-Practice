/* Dependencies */
const express = require('express');
const fs = require('fs');
const uuid = require('uuid/v4');
const connection = require('../database');

/* Set up route for profile pages */

const router = express.Router(); // Get express's router functions
// Respond to the browsers 'get' for URL '/profile/id'
router.get('/profile/:id', (req, res) => {
    const queryProfile = `SELECT * FROM Profile WHERE Profile_ID=${req.params.id}`;
    connection.query(queryProfile, (err, results, fields) => {
        if (err) throw err;
        const queryAccount = `SELECT Name FROM AccountHolder WHERE Account_ID=${req.params.id}`;
        connection.query(queryAccount, (err2, results2, fields2) => {
            if (err2) throw err2;
            const queryPhoto = `SELECT Photo_Blob, Extension FROM Photo WHERE Photo_ID=${results[0].Photo_ID}`;
            connection.query(queryPhoto, (err3, results3, fields3) => {
                if (err3) throw err3;
                let filename;
                if (results3[0] == null) {
                    filename = 'no_img.png';
                } else {
                    filename = `${uuid()}.${results3[0].Extension}`;
                    // Write the file to the temp directory
                    fs.writeFile(`app/public/temp/${filename}`, results3[0].Photo_Blob, (err4) => {
                        if (err4) throw err4;
                    });
                }
                const profile = {
                    name: results2[0].Name,
                    image: filename,
                    joinDate: results[0].Joined_Date,
                    phone: results[0].Phone_Number,
                    street: results[0].Street_Name,
                    suburb: results[0].Suburb,
                    city: results[0].City,
                    postcode: results[0].Postcode,
                    description: results[0].Description,
                };
                res.render('profile.ejs', profile);
            });
        });
    });
});

router.get('/profile/:id/edit', (req, res) => {
    const queryProfile = `SELECT * FROM Profile WHERE Profile_ID=${req.params.id}`;
    connection.query(queryProfile, (err, results, fields) => {
        if (err) throw err;
        const queryAccount = `SELECT Name FROM AccountHolder WHERE Account_ID=${req.params.id}`;
        connection.query(queryAccount, (err2, results2, fields2) => {
            if (err2) throw err2;
            const profile = {
                accountid: results[0].Account_ID,
                prevPhoto: results[0].Photo_ID,
                prevName: results2[0].Name,
                prevPhone: results[0].Phone_Number,
                prevStreet: results[0].Street_Name,
                prevSuburb: results[0].Suburb,
                prevCity: results[0].City,
                prevPostcode: results[0].Postcode,
                prevDescription: results[0].Description,
            };
            res.render('edit_profile.ejs', profile);
        });
    });
});

router.post('/edit_profile', (req, res) => {
    const profile = {
        Description: req.body.profileDescription,
        Phone_Number: req.body.profilePhone,
        Street_Name: req.body.profileStreet,
        Suburb: req.body.profileSuburb,
        City: req.body.profileSuburb,
        Postcode: req.body.profilePostcode,
    };
    const updateProfile = `UPDATE Profile SET ? WHERE Profile_ID = ${req.body.accountID}`;
    connection.query(updateProfile, profile, (err, results, fields) => {
        if (err) throw err;
        if (req.files[0] !== undefined) {
            const file = req.files[0];
            const data = new Buffer.from(file.buffer, 'base64', (err2) => { // Read the encoded data into binary
                if (err2) throw err2;
            });
            const photo = { // Create photo object corresponding to 'Photo' table
                Photo_Blob: data,
                Extension: file.originalname.substring(file.originalname.lastIndexOf('.') + 1, file.originalname.length),
            };
            const updatePhoto = `UPDATE Photo SET ? WHERE Photo_ID = ${req.body.photoID}`;
            connection.query(updatePhoto, photo, (err2, results2, fields2) => {
                if (err2) throw err2;
                res.end('Profile updated');
            });
        } else {
            res.end('Profile updated');
        }
    });
});

module.exports = router;
