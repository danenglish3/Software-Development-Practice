/* Dependencies */
const express = require('express');
const jwt = require('jsonwebtoken');

/* Set up a route to the home page */

const router = express.Router(); // Get express's router functions
// Respond to the browsers 'get' request by serving index.html to home URL '/'
router.get('/', (req, res, next) => {
    const userSession = req.cookies.SessionInfo;
    const home = {
        session: null,
        page: 'Home',
    };
    if (userSession != null) {
        jwt.verify(userSession, 'dcjscomp602', (err, decoded) => {
            if (err) {
                next(err);
            } else {
                home.session = decoded.data;
            }
        });
    }
    res.render('home/index', home);
});

// Allow the router object to be used in other js files.
// In this case we are making the router available as a
// module so that the route to the home page can be
// mounted to the express server in app.js
module.exports = router;
