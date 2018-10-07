/* Dependencies */
const express = require('express');
const jwt = require('jsonwebtoken');

/* Set up a route to the home page */

const router = express.Router(); // Get express's router functions
// Respond to the browsers 'get' request by serving index.html to home URL '/'
<<<<<<< HEAD
router.get('/', (req, res) => {
    if (!req.cookies.SessionInfo) {
        res.render('index.ejs', { siteName: 'Kiwi Trader', isLogin: false });
    } else {
        res.render('index.ejs', { siteName: 'Kiwi Trader', isLogin: true });
    }
=======
router.get('/', (req, res, next) => {
    const userSession = req.cookies.SessionInfo;
    const home = {
        session: null,
        page: 'Home',
    };
    if (userSession != null) {
        jwt.verify(userSession, 'dcjscomp602', (err5, decoded) => {
            if (err5) {
                next(err5);
            } else {
                home.session = decoded.data;
            }
        });
    }
    res.render('home/index', home);
>>>>>>> 73a1f5dbab12f8c5c8cf2a3d2e90032319d30c0f
});

// Allow the router object to be used in other js files.
// In this case we are making the router available as a
// module so that the route to the home page can be
// mounted to the express server in app.js
module.exports = router;
