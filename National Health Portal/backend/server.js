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
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());

// --- Global Error Handlers ---
process.on('uncaughtException', (err) => {
    console.error('CRITICAL: Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
});

// Basic route
app.get('/api', (req, res) => {
    res.json({ message: 'Somalia National Health Portal Backend is active.' });
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

// Search Patient by ID or Name
app.get('/api/health-records/:searchTerm', async (req, res) => {
    const { searchTerm } = req.params;
    try {
        // Search by unique id_number or full_name containing search term
        const records = await prisma.health_records.findMany({
            where: {
                OR: [
                    { id_number: searchTerm },
                    { full_name: { contains: searchTerm } }
                ]
            }
        });
        
        if (records.length === 0) {
            return res.status(404).json({ error: 'Patient not found' });
        }
        
        // Parse comma-separated strings back to arrays for the frontend
        const formattedRecords = records.map(record => ({
            ...record,
            allergies: record.allergies ? record.allergies.split(',').map(s => s.trim()) : [],
            medical_history: record.medical_history ? record.medical_history.split(',').map(s => s.trim()) : []
        }));

        res.json(formattedRecords[0]); // Return the first matching record
    } catch (error) {
        console.error('Search Patient Error:', error);
        res.status(500).json({ error: 'Database search failed', details: error.message });
    }
});

// Add Patient Health Record
app.post('/api/health-records', async (req, res) => {
    try {
        const { id_number, full_name, dob, gender, blood_type, allergies, medical_history, last_checkup, contact_number, region } = req.body;
        
        if (!id_number || !full_name || !dob || !gender || !blood_type) {
            return res.status(400).json({ error: 'Required fields missing' });
        }

        // Convert arrays to comma-separated strings for database storage
        const allergiesStr = Array.isArray(allergies) ? allergies.join(', ') : (allergies || '');
        const historyStr = Array.isArray(medical_history) ? medical_history.join(', ') : (medical_history || '');

        const record = await prisma.health_records.create({
            data: {
                id_number,
                full_name,
                dob: new Date(dob),
                gender,
                blood_type,
                allergies: allergiesStr,
                medical_history: historyStr,
                last_checkup: last_checkup ? new Date(last_checkup) : new Date(),
                contact_number: contact_number || '',
                region: region || ''
            }
        });

        res.status(201).json({ message: 'Health record created successfully', record });
    } catch (error) {
        console.error('Create Health Record Error:', error);
        res.status(500).json({ error: 'Database save failed', details: error.message });
    }
});

// Submit Birth Certificate
app.post('/api/birth-certificates', async (req, res) => {
    try {
        const { fullName, fatherName, motherName, dateOfBirth, placeOfBirth, gender, hospital, doctor, aiNote, uid } = req.body;
        
        if (!fullName || !fatherName || !motherName || !dateOfBirth || !placeOfBirth || !gender || !hospital || !doctor) {
            return res.status(400).json({ error: 'Required fields missing' });
        }

        const certificate = await prisma.birth_certificates.create({
            data: {
                full_name: fullName,
                father_name: fatherName,
                mother_name: motherName,
                dob: new Date(dateOfBirth),
                place_of_birth: placeOfBirth,
                gender,
                hospital,
                doctor,
                ai_note: aiNote || '',
                uid: uid || `SOM-B-${Math.floor(1000 + Math.random() * 9000)}-SYNC`
            }
        });

        res.status(201).json({ message: 'Birth certificate registered', certificate });
    } catch (error) {
        console.error('Birth Registration Error:', error);
        res.status(500).json({ error: 'Database save failed', details: error.message });
    }
});

// Search Birth Certificate by UID or Name
app.get('/api/birth-certificates/:searchTerm', async (req, res) => {
    const { searchTerm } = req.params;
    try {
        const certificates = await prisma.birth_certificates.findMany({
            where: {
                OR: [
                    { uid: searchTerm },
                    { full_name: { contains: searchTerm } }
                ]
            }
        });
        
        if (certificates.length === 0) {
            return res.status(404).json({ error: 'Birth certificate not found' });
        }
        
        res.json(certificates[0]);
    } catch (error) {
        console.error('Search Birth Certificate Error:', error);
        res.status(500).json({ error: 'Database search failed', details: error.message });
    }
});

// Submit Death Certificate
app.post('/api/death-certificates', async (req, res) => {
    try {
        const { fullName, citizenId, dateOfDeath, placeOfDeath, causeOfDeath, informantName, doctorName, registryNumber } = req.body;
        
        if (!fullName || !citizenId || !dateOfDeath || !placeOfDeath || !causeOfDeath || !informantName || !doctorName) {
            return res.status(400).json({ error: 'Required fields missing' });
        }

        const certificate = await prisma.death_certificates.create({
            data: {
                full_name: fullName,
                citizen_id: citizenId,
                dod: new Date(dateOfDeath),
                place_of_death: placeOfDeath,
                cause_of_death: causeOfDeath,
                informant_name: informantName,
                doctor_name: doctorName,
                registry_number: registryNumber || `SOM-D-${Math.floor(100000 + Math.random() * 900000)}`
            }
        });

        res.status(201).json({ message: 'Death certificate registered', certificate });
    } catch (error) {
        console.error('Death Registration Error:', error);
        res.status(500).json({ error: 'Database save failed', details: error.message });
    }
});

// Search Death Certificate by Registry Number or Name
app.get('/api/death-certificates/:searchTerm', async (req, res) => {
    const { searchTerm } = req.params;
    try {
        const certificates = await prisma.death_certificates.findMany({
            where: {
                OR: [
                    { registry_number: searchTerm },
                    { full_name: { contains: searchTerm } }
                ]
            }
        });
        
        if (certificates.length === 0) {
            return res.status(404).json({ error: 'Death certificate not found' });
        }
        
        res.json(certificates[0]);
    } catch (error) {
        console.error('Search Death Certificate Error:', error);
        res.status(500).json({ error: 'Database search failed', details: error.message });
    }
});

// Start Server
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 MOH Health Portal Backend Server Ready`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🛠️ Mode: ${process.env.NODE_ENV || 'development'}\n`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Error: Port ${PORT} is already in use.`);
        process.exit(1);
    } else {
        console.error('❌ Server Error:', err);
    }
});

process.on('SIGTERM', () => {
    server.close(async () => {
        await prisma.$disconnect();
        console.log('HTTP server closed');
    });
});
