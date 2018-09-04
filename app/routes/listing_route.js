/* Dependencies */
const path = require('path');
const express = require('express');

/* Temporary Sample Data */
const sampleData = [
    {
        id: '1',
        title: 'Water Heater Repair',
        author: "Bob's Plumbing",
        location: 'Auckland',
        catergory: 'Plumbing',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam sit amet iaculis nunc. Aliquam erat volutpat. Duis tincidunt ipsum sit amet libero eleifend pharetra. Integer sem nisi, mattis eget tortor eget, accumsan viverra mi. Quisque lobortis felis est, ut volutpat metus euismod a. Nunc lacinia nec est sit amet viverra. Proin enim nulla, laoreet iaculis enim vitae, interdum vestibulum ligula. Donec at libero id dui dapibus scelerisque sed eget turpis. Cras faucibus ac libero ac malesuada. Cras vulputate neque ut varius mattis. Cras congue velit ac posuere interdum. Praesent rutrum leo ac neque eleifend tincidunt.',
    },
    {
        id: '2',
        title: 'WOF + Servicing',
        author: "Dave's Auto",
        location: 'Hamilton',
        catergory: 'Automotive',
        description: 'Praesent tristique vulputate sem, eget bibendum sapien commodo non. Vivamus commodo feugiat sem accumsan tempor. In sollicitudin dui eu elit lacinia, in congue ex dictum. Donec felis sem, accumsan eu turpis id, facilisis suscipit sem. Nullam vehicula nisl augue, ac pellentesque ipsum scelerisque a. Nullam a fringilla dolor. Curabitur ex orci, vulputate sit amet fermentum bibendum, bibendum rutrum erat. Ut condimentum viverra hendrerit. Pellentesque in elit mauris. Morbi dapibus metus a nunc finibus tincidunt. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Nulla et quam et ligula vulputate sodales.',
    },
    {
        id: '3',
        title: 'Yard Design',
        author: "Sally's Landscaping",
        location: 'Christchurch',
        catergory: 'Landscaping',
        description: 'Nunc venenatis porttitor gravida. Aliquam nibh nunc, dignissim non ipsum nec, rhoncus cursus nulla. Nullam viverra nulla eget massa ullamcorper, ac pellentesque quam feugiat. Integer viverra sapien interdum ligula dapibus, in vehicula ex blandit. Vestibulum ac tincidunt sapien. Nulla rutrum, nunc blandit convallis fringilla, tortor tortor congue ipsum, commodo facilisis mi ex at sapien. Nam rutrum metus magna, at lacinia eros pharetra vitae. Curabitur at molestie justo. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vel imperdiet sapien. Aliquam facilisis quis metus et volutpat.',
    },
];

/* Set up route for listing pages */

const router = express.Router(); // Get express's router functions
// Respond to the browsers 'get' request by serving listing.ejs to URL '/listing/id'
router.get('/listing/:id', (req, res) => {
    // Return an object defined as 'listing' which has an 'id'
    // that matches the request parameter 'id' to queryResult
    const queryResult = sampleData.find(listing => listing.id === req.params.id);
    // Render the the HTML from the EJS template using the data in the listing object in queryResult
    res.render(path.join(__dirname, '../views/listing.ejs'), queryResult);
});

/* Set up routes for listing form */

// Respond to the browsers 'get' request by serving listing-form.ejs to URL '/listing/new'
router.get('/new-listing', (req, res) => {
    // Render the the HTML from the EJS template
    res.render(path.join(__dirname, '../views/listing-form.ejs'));
});

// Allow the router object to be used in other js files.
// In this case we are making the router available as a
// module so that the route to the home page can be
// mounted to the express server in app.js
module.exports = router;
