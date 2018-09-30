const express = require('express');
const router = express.Router(); // Get express's router functions

function renderQuotePage(req, res) {
    res.render('new_quote.ejs');
}

router.get('/new_quote', renderQuotePage, (req, res) => {});

module.exports = router;
