//Including dependencies
const express = require('express');
const connection = require('../database.js');
const router = express.Router();

//
router.get('/login', (req, res) => {
    res.render('../views/login.ejs');
});

//Respond to get request by serving the 
router.get('/register', (req, res) => { 
    res.render('register.ejs');
});

router.post('/register', (req, res) =>  {
    //Getting registration information for post request from forms

    const user = {
        account_id: 'x',
        email: req.body.registerEmail,
        password: req.body.registerPassword,
        name: req.body.registerName,

    };

    //Writing the SQL insertion query using the information gathered from the post form
    const insQuery = 'INSERT INTO AccountHolder (account_id, email, password, name) VALUES (X, account_id, email, password, name);';
    //Querying the database to inser the user into the database
    connection.query(insQuery, function (error,results) {
        //Catch error if it's thrown on account creation
        if (err) {
            //respond with a code and message if error is thrown
            res.send({
                "code": 400,
                "message": "creation failed"
            });
        } else {
            //send response with successful code and message if user is created
            res.send({
                "code": 200,
                "message": "User registered successfully"
            });
        }
    
    });


})

module.exports = router;
