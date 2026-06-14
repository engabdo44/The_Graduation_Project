const mysql = require('mysql2');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    multipleStatements: true
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        process.exit(1);
    }
    console.log('Connected to MySQL server.');

    // 1. Create tables if they do not exist
    const schemaSql = `
    CREATE DATABASE IF NOT EXISTS somali_national_gateway;
    USE somali_national_gateway;

    CREATE TABLE IF NOT EXISTS birth_certificates (
        birth_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(200) NOT NULL,
        father_name VARCHAR(200) NOT NULL,
        mother_name VARCHAR(200) NOT NULL,
        dob DATE NOT NULL,
        place_of_birth VARCHAR(200) NOT NULL,
        gender VARCHAR(20) NOT NULL,
        hospital VARCHAR(200) NOT NULL,
        doctor VARCHAR(200) NOT NULL,
        ai_note TEXT,
        uid VARCHAR(50) NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS death_certificates (
        death_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(200) NOT NULL,
        citizen_id VARCHAR(20) NOT NULL,
        dod DATE NOT NULL,
        place_of_death VARCHAR(200) NOT NULL,
        cause_of_death TEXT NOT NULL,
        informant_name VARCHAR(200) NOT NULL,
        doctor_name VARCHAR(200) NOT NULL,
        registry_number VARCHAR(50) NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS health_records (
        health_record_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        id_number VARCHAR(20) NOT NULL UNIQUE,
        full_name VARCHAR(200) NOT NULL,
        dob DATE NOT NULL,
        gender VARCHAR(20) NOT NULL,
        blood_type VARCHAR(5) NOT NULL,
        allergies TEXT NOT NULL,
        medical_history TEXT NOT NULL,
        last_checkup DATE NOT NULL,
        contact_number VARCHAR(30) NOT NULL,
        region VARCHAR(100) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
    `;

    connection.query(schemaSql, (err, results) => {
        if (err) {
            console.error('Error creating health tables:', err);
            connection.end();
            process.exit(1);
        }
        console.log('Health database tables verified/created successfully.');

        // 2. Seed initial patient data
        const checkSql = "SELECT COUNT(*) AS count FROM health_records WHERE id_number = 'SOM-ID-49201'";
        connection.query(checkSql, (err, rows) => {
            if (err) {
                console.error('Error checking seed data:', err);
                connection.end();
                process.exit(1);
            }

            if (rows[0].count === 0) {
                const seedSql = `
                INSERT INTO health_records (id_number, full_name, dob, gender, blood_type, allergies, medical_history, last_checkup, contact_number, region)
                VALUES (
                    'SOM-ID-49201',
                    'Abdikadir Hassan Muse',
                    '1985-05-12',
                    'Male',
                    'A+',
                    'Penicillin',
                    'Chronic Hypertension, Type 2 Diabetes, Eye Surgery (2021)',
                    '2024-01-05',
                    '+252 61 555 1234',
                    'Banaadir'
                );
                `;
                connection.query(seedSql, (err, seedResults) => {
                    if (err) {
                        console.error('Error seeding patient data:', err);
                    } else {
                        console.log('Seeded patient Abdikadir Hassan Muse successfully.');
                    }
                    connection.end();
                });
            } else {
                console.log('Seed patient already exists in health_records table.');
                connection.end();
            }
        });
    });
});
