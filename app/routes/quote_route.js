const express = require('express');

const router = express.Router(); // Get express's router functions

function renderQuotePage(req, res) {
    const listingDetails = {
        serviceID: req.params.id,
    };
    console.log(`profile ID : ${listingDetails.profileID}`);
    res.render('new_quote.ejs');
}

router.get('/new_quote/:id', renderQuotePage, (req, res) => {});

module.exports = router;
