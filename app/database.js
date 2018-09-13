const mysql = require('mysql');

// Creating connection object
const connection = mysql.createConnection({
    host: '159.65.11.196',
    user: 'root',
    password: 'dcjscomp602',
    database: 'website_user',
    connectionLimit: 20,
});

// Establishing connection to database using relevant information
connection.connect((err) => {
    if (err) throw err;
    console.log('Successfully connected to MySQL DB');
});

module.exports = connection;
