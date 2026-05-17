const fs = require('fs');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') }); // ensure we pick up the env file

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true // Important for running schema.sql
});

const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        process.exit(1);
    }
    console.log('Connected to MySQL.');

    connection.query(schema, (err, results) => {
        if (err) {
            console.error('Error executing schema:', err);
            process.exit(1);
        }
        console.log('Schema executed successfully.');
        connection.end();
    });
});
