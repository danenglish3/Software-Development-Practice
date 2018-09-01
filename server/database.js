
const mysql = require('mysql');

//Creating connection to database using relevant information
const connection = mysql.createConnection({
    host: '159.65.11.196',
    port: 3306,
    user: 'root',
    password: 'dcjscomp602',
    database: 'website_user', 
    insecureAuth: true,
});

//Connected to server using provided connection information
connection.connect(function(err) {
  if (err) {
    return console.error('error: ' + err.message);
  } 
  console.log('Connected to the MySQL server.');
});

