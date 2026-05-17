const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'somali_national_gateway'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting: ' + err.stack);
    process.exit(1);
  }
  console.log('Connected to DB');

  connection.query('DESCRIBE criminal_records', (error, results, fields) => {
    if (error) {
      console.error('Error querying:', error);
      process.exit(1);
    }
    console.log(JSON.stringify(results, null, 2));
    connection.end();
  });
});
