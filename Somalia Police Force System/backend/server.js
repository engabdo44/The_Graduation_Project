const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

// Load environment variables
dotenv.config();

// BigInt serialization fix
BigInt.prototype.toJSON = function () {
    return this.toString();
};

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- Global Error Handlers ---
process.on('uncaughtException', (err) => {
    console.error('CRITICAL: Uncaught Exception:', err);
    // Keep server running or exit based on severity
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
});

// Basic route
app.get('/api', (req, res) => {
    res.json({ message: 'Somali Police Force Backend is active.' });
});

// Database status route
app.get('/api/status', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ status: 'connected', message: 'Database is reachable' });
    } catch (err) {
        console.error('Database Status Error:', err.message);
        res.status(500).json({ status: 'error', message: 'Database unreachable' });
    }
});

// Criminal Records endpoint
app.post('/api/criminal-records', async (req, res) => {
    try {
        const { id_number, crime_type, severity, incident_date, court_decision, status } = req.body;
        
        if (!id_number || !crime_type) {
            return res.status(400).json({ error: 'id_number and crime_type are required' });
        }

        const record = await prisma.criminal_records.create({
            data: {
                id_number,
                crime_type,
                severity: severity || 'MEDIUM',
                incident_date: incident_date ? new Date(incident_date) : null,
                court_decision,
                status: status || 'open'
            }
        });

        res.status(201).json({ message: 'Record created', record });
    } catch (error) {
        console.error('Record Creation Error:', error);
        res.status(500).json({ error: 'Database operation failed', details: error.message });
    }
});

// Get all records
app.get('/api/criminal-records', async (req, res) => {
    try {
        const records = await prisma.criminal_records.findMany();
        res.json(records);
    } catch (error) {
        console.error('Fetch Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Resident Criminal Records endpoint
app.post('/api/resident-criminal-records', async (req, res) => {
    try {
        const { residence_number, crime_type, severity, incident_date, court_decision, status } = req.body;
        
        if (!residence_number || !crime_type) {
            return res.status(400).json({ error: 'residence_number and crime_type are required' });
        }

        const record = await prisma.resident_criminal_records.create({
            data: {
                residence_number,
                crime_type,
                severity: severity || 'C',
                incident_date: incident_date ? new Date(incident_date) : null,
                court_decision,
                status: status || 'open'
            }
        });

        res.status(201).json({ message: 'Resident record created', record });
    } catch (error) {
        console.error('Resident Record Creation Error:', error);
        res.status(500).json({ error: 'Database operation failed', details: error.message });
    }
});

app.get('/api/resident-criminal-records', async (req, res) => {
    try {
        const records = await prisma.resident_criminal_records.findMany();
        res.json(records);
    } catch (error) {
        console.error('Fetch Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Search person by ID (Citizen or Resident)
app.get('/api/person/:id_number', async (req, res) => {
    const { id_number } = req.params;

    if (!id_number || id_number.length !== 11) {
        return res.status(400).json({ error: 'Invalid ID number. Must be 11 digits.' });
    }

    try {
        // 1. Search in Citizens
        let person = await prisma.citizens.findUnique({
            where: { national_number: id_number },
            include: {
                citizen_id_cards: true,
                passports: true
            }
        });

        let type = 'citizen';

        // 2. If not found, search in Residents
        if (!person) {
            person = await prisma.residents.findUnique({
                where: { residence_number: id_number },
                include: {
                    resident_id_cards: true
                }
            });
            type = 'resident';
        }

        if (!person) {
            return res.status(404).json({ error: 'Person not found' });
        }

        // 3. Get Criminal Records (both types for the ID)
        const citizenRecords = await prisma.criminal_records.findMany({
            where: { id_number: id_number }
        });

        const residentRecords = await prisma.resident_criminal_records.findMany({
            where: { residence_number: id_number }
        });

        res.json({
            ...person,
            person_type: type,
            criminal_records: [...citizenRecords, ...residentRecords]
        });
    } catch (error) {
        console.error('Search Error:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});


// Start Server with Port Handling
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 SPF Backend Server Ready`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🛠️ Mode: ${process.env.NODE_ENV || 'development'}\n`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Error: Port ${PORT} is already in use.`);
        console.log(`💡 Try changing the PORT in your .env file.`);
        process.exit(1);
    } else {
        console.error('❌ Server Error:', err);
    }
});

// Graceful Shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(async () => {
        await prisma.$disconnect();
        console.log('HTTP server closed');
    });
});
