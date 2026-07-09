const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Validation helpers
const validateText = (value, fieldName) => {
  if (!value || value.trim() === '') {
    throw new Error(`${fieldName} is required`);
  }
  const textRegex = /^[a-zA-Z\u0600-\u06FF\u0750-\u077F\s\-'\.]+$/;
  if (!textRegex.test(value)) {
    throw new Error(`${fieldName} should only contain letters`);
  }
  if (value.length > 200) {
    throw new Error(`${fieldName} is too long (max 200 characters)`);
  }
};

const validateNumeric = (value, fieldName, minLength = 1, maxLength = 20) => {
  if (!value || value.trim() === '') {
    throw new Error(`${fieldName} is required`);
  }
  const numericRegex = /^\d+$/;
  if (!numericRegex.test(value)) {
    throw new Error(`${fieldName} should only contain numbers`);
  }
  if (value.length < minLength) {
    throw new Error(`${fieldName} must be at least ${minLength} digits`);
  }
  if (value.length > maxLength) {
    throw new Error(`${fieldName} must be at most ${maxLength} digits`);
  }
};

const validateDate = (value, fieldName, allowFuture = false, allowPast = true) => {
  if (!value) {
    throw new Error(`${fieldName} is required`);
  }
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new Error(`${fieldName} is not a valid date`);
  }
  const now = new Date();
  if (!allowFuture && date > now) {
    throw new Error(`${fieldName} cannot be in the future`);
  }
  if (!allowPast && date < now) {
    throw new Error(`${fieldName} cannot be in the past`);
  }
};

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

// Login endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const user = await prisma.users.findUnique({
            where: { username }
        });

        if (!user || user.account_type !== 'Police_Officer') {
            return res.status(401).json({ error: 'Invalid credentials or unauthorized' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        res.json({
            user: {
                id: user.user_id,
                username: user.username,
                email: user.email,
                accountType: user.account_type,
                isActive: user.is_active
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Login failed', details: error.message });
    }
});

// Create user endpoint (for initial setup)
app.post('/api/users', async (req, res) => {
    try {
        const { username, password, email, account_type, employee_id } = req.body;
        
        if (!username || !password || !email || !account_type) {
            return res.status(400).json({ error: 'Required fields missing' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.users.create({
            data: {
                username,
                password_hash: hashedPassword,
                email,
                account_type,
                employee_id: employee_id || null
            }
        });

        res.status(201).json({ message: 'User created successfully', user: { id: user.user_id, username: user.username, account_type: user.account_type } });
    } catch (error) {
        console.error('Create User Error:', error);
        res.status(500).json({ error: 'User creation failed', details: error.message });
    }
});

// Criminal Records endpoint
app.post('/api/criminal-records', async (req, res) => {
    try {
        const { id_number, crime_type, severity, incident_date, court_decision, status } = req.body;
        
        // Validation
        validateNumeric(id_number, 'ID Number', 11, 11);
        validateText(crime_type, 'Crime Type');
        
        if (severity && !['A', 'B', 'C', 'D', 'E', 'F'].includes(severity)) {
            throw new Error('Invalid severity level');
        }
        
        if (incident_date) {
            validateDate(incident_date, 'Incident Date', false, true);
        }
        
        if (status && !['open', 'closed'].includes(status)) {
            throw new Error('Invalid status');
        }

        const record = await prisma.criminal_records.create({
            data: {
                id_number,
                crime_type,
                severity: severity || 'C',
                incident_date: incident_date ? new Date(incident_date) : null,
                court_decision,
                status: status || 'open'
            }
        });

        res.status(201).json({ message: 'Record created', record });
    } catch (error) {
        console.error('Record Creation Error:', error);
        res.status(400).json({ error: error.message || 'Database operation failed', details: error.message });
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
        
        // Validation
        validateNumeric(residence_number, 'Residence Number', 1, 20);
        validateText(crime_type, 'Crime Type');
        
        if (severity && !['A', 'B', 'C', 'D', 'E', 'F'].includes(severity)) {
            throw new Error('Invalid severity level');
        }
        
        if (incident_date) {
            validateDate(incident_date, 'Incident Date', false, true);
        }
        
        if (status && !['open', 'closed'].includes(status)) {
            throw new Error('Invalid status');
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
        res.status(400).json({ error: error.message || 'Database operation failed', details: error.message });
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


// Search Criminal Records by various fields
app.get('/api/criminal-records/search/:searchTerm', async (req, res) => {
    const { searchTerm } = req.params;
    
    if (!searchTerm || searchTerm.trim() === '') {
        return res.status(400).json({ error: 'Search term is required' });
    }

    try {
        // Search citizen criminal records
        const citizenRecords = await prisma.criminal_records.findMany({
            where: {
                OR: [
                    { id_number: { contains: searchTerm, mode: 'insensitive' } },
                    { crime_type: { contains: searchTerm, mode: 'insensitive' } },
                    { court_decision: { contains: searchTerm, mode: 'insensitive' } }
                ]
            }
        });

        // Search resident criminal records
        const residentRecords = await prisma.resident_criminal_records.findMany({
            where: {
                OR: [
                    { residence_number: { contains: searchTerm, mode: 'insensitive' } },
                    { crime_type: { contains: searchTerm, mode: 'insensitive' } },
                    { court_decision: { contains: searchTerm, mode: 'insensitive' } }
                ]
            }
        });

        const allRecords = [
            ...citizenRecords.map(r => ({ ...r, record_type: 'citizen' })),
            ...residentRecords.map(r => ({ ...r, record_type: 'resident' }))
        ];

        if (allRecords.length === 0) {
            return res.status(404).json({ error: 'No criminal records found' });
        }

        res.json(allRecords);
    } catch (error) {
        console.error('Search Criminal Records Error:', error);
        res.status(500).json({ error: 'Database search failed', details: error.message });
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
