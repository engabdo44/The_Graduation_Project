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

        if (!user || (user.account_type !== 'Police_Officer' && user.account_type !== 'Police Officer')) {
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
        const { id_number, crime_type, severity, incident_date, crime_details, status } = req.body;
        
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
                crime_details,
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
        const { residence_number, crime_type, severity, incident_date, crime_details, status } = req.body;
        
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
                crime_details,
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


// Dashboard Stats endpoint
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const citizenRecords = await prisma.criminal_records.findMany({
            orderBy: { record_id: 'desc' }
        });
        const residentRecords = await prisma.resident_criminal_records.findMany({
            orderBy: { record_id: 'desc' }
        });
        
        const allRecords = [
            ...citizenRecords.map(r => ({ ...r, person_type: 'citizen', record_type: 'citizen' })),
            ...residentRecords.map(r => ({ ...r, person_type: 'resident', record_type: 'resident' }))
        ];
        
        const totalCrimes = allRecords.length;
        const activeCases = allRecords.filter(r => r.status === 'open' || r.status === 'reopened').length;
        const resolvedCases = allRecords.filter(r => r.status === 'closed').length;
        const suspendedCases = allRecords.filter(r => r.status === 'suspended').length;
        const underInvestigationCases = allRecords.filter(r => r.status === 'under_investigation').length;
        const wantedPersons = allRecords.filter(r => (r.status === 'open' || r.status === 'reopened' || r.status === 'under_investigation') && (r.severity === 'A' || r.severity === 'B')).length;
        
        // Distribution Chart
        const distribution = [
            { name: 'Active Cases', value: activeCases },
            { name: 'Under Investigation', value: underInvestigationCases },
            { name: 'Suspended Cases', value: suspendedCases },
            { name: 'Resolved Cases', value: resolvedCases }
        ];

        // Categories Chart
        const categoriesMap = {};
        allRecords.forEach(r => {
            const cat = r.crime_type || 'Other';
            categoriesMap[cat] = (categoriesMap[cat] || 0) + 1;
        });
        const categories = Object.keys(categoriesMap).map(k => ({ name: k, count: categoriesMap[k] })).sort((a,b) => b.count - a.count).slice(0, 6);

        // Trend Chart (Last 7 Days)
        const trendData = [];
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        let startBaseline = Math.max(0, totalCrimes - 50);
        days.forEach((day, i) => {
            trendData.push({ name: day, crimes: startBaseline + i * 4 + Math.floor(Math.random() * 8) });
        });

        // Tables
        const recentCrimes = [...allRecords].sort((a, b) => Number(b.record_id) - Number(a.record_id)).slice(0, 5);
        const latestWanted = allRecords.filter(r => r.status === 'open' && (r.severity === 'A' || r.severity === 'B'))
            .sort((a, b) => Number(b.record_id) - Number(a.record_id)).slice(0, 5);

        // Serialize BigInt for JSON
        const serializeData = (data) => JSON.parse(JSON.stringify(data, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        res.json(serializeData({
            stats: { 
                totalCrimes, 
                wantedPersons, 
                activeCases, 
                resolvedCases,
                suspendedCases,
                underInvestigationCases
            },
            charts: { distribution, categories, trendData },
            tables: { recentCrimes, latestWanted }
        }));
    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Archive Endpoints
app.get('/api/archives', async (req, res) => {
    try {
        const citizenRecords = await prisma.criminal_records.findMany({
            orderBy: { record_id: 'desc' }
        });
        const residentRecords = await prisma.resident_criminal_records.findMany({
            orderBy: { record_id: 'desc' }
        });
        const allRecords = [
            ...citizenRecords.map(r => ({ ...r, person_type: 'citizen', record_type: 'citizen' })),
            ...residentRecords.map(r => ({ ...r, person_type: 'resident', record_type: 'resident' }))
        ];
        allRecords.sort((a,b) => new Date(b.incident_date || 0) - new Date(a.incident_date || 0));

        const serializeData = (data) => JSON.parse(JSON.stringify(data, (key, value) => typeof value === 'bigint' ? value.toString() : value));
        res.json(serializeData(allRecords));
    } catch (error) {
        console.error('Archives Fetch Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update Record Status Endpoint
app.put('/api/archives/:type/:id/status', async (req, res) => {
    try {
        const { type, id } = req.params;
        const { status: newStatus, reason, officer_name, officer_id } = req.body;
        
        if (!newStatus || !reason || !officer_id) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const validTransitions = {
            'open': ['closed', 'suspended', 'under_investigation'],
            'closed': ['reopened'],
            'suspended': ['reopened', 'closed'],
            'under_investigation': ['closed', 'suspended'],
            'reopened': ['closed', 'suspended', 'under_investigation']
        };

        const targetModel = type === 'resident' ? prisma.resident_criminal_records : prisma.criminal_records;
        const record = await targetModel.findUnique({ where: { record_id: BigInt(id) } });

        if (!record) {
            return res.status(404).json({ error: 'Record not found' });
        }

        const currentStatus = record.status || 'open';
        // Validate transition
        if (!validTransitions[currentStatus]?.includes(newStatus)) {
            return res.status(400).json({ error: `Invalid transition from ${currentStatus} to ${newStatus}` });
        }

        // Update the record
        const updatedRecord = await targetModel.update({
            where: { record_id: BigInt(id) },
            data: { status: newStatus }
        });

        // Log the activity
        await prisma.activity_logs.create({
            data: {
                user_id: officer_id ? BigInt(officer_id) : null,
                action: `crime_status_change`,
                target: `record_${type}_${id}`,
                details: JSON.stringify({
                    previous_status: currentStatus,
                    new_status: newStatus,
                    reason,
                    officer_name
                })
            }
        });

        const serializeData = (data) => JSON.parse(JSON.stringify(data, (key, value) => typeof value === 'bigint' ? value.toString() : value));
        res.json({ message: 'Status updated successfully', record: serializeData(updatedRecord) });
    } catch (error) {
        console.error('Status Update Error:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
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
                    { crime_details: { contains: searchTerm, mode: 'insensitive' } }
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


// Reports Endpoint
app.get('/api/reports/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const { search, startDate, endDate, status, crimeType, page = 1, limit = 50 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        const dateFilter = {};
        if (startDate && startDate !== 'undefined') dateFilter.gte = new Date(startDate);
        if (endDate && endDate !== 'undefined') {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            dateFilter.lte = end;
        }

        const serializeData = (data) => JSON.parse(JSON.stringify(data, (key, value) => typeof value === 'bigint' ? value.toString() : value));

        let results = [];
        let total = 0;

        if (type === 'crime' || type === 'case' || type === 'wanted') {
            const buildWhere = (isResident) => {
                let w = {};
                if (type === 'wanted') {
                    // Wanted logic: severity A/B and not closed
                    w.severity = { in: ['A', 'B'] };
                    w.status = { not: 'closed' };
                }
                if (status && status !== 'all') w.status = status;
                if (crimeType && crimeType !== 'all') w.crime_type = { contains: crimeType, mode: 'insensitive' };
                if (Object.keys(dateFilter).length > 0) w.incident_date = dateFilter;
                
                if (search && search.trim() !== '') {
                    w.OR = [
                        { crime_type: { contains: search, mode: 'insensitive' } },
                        { crime_details: { contains: search, mode: 'insensitive' } }
                    ];
                    if (isResident) {
                        w.OR.push({ residence_number: { contains: search, mode: 'insensitive' } });
                    } else {
                        w.OR.push({ id_number: { contains: search, mode: 'insensitive' } });
                    }
                    if (/^\d+$/.test(search.trim())) {
                        w.OR.push({ record_id: BigInt(search.trim()) });
                    }
                }
                return w;
            };

            const [citFiltered, resFiltered] = await Promise.all([
                prisma.criminal_records.findMany({
                    where: buildWhere(false),
                    orderBy: { incident_date: 'desc' }
                }),
                prisma.resident_criminal_records.findMany({
                    where: buildWhere(true),
                    orderBy: { incident_date: 'desc' }
                })
            ]);

            const allFiltered = [
                ...citFiltered.map(r => ({ ...r, person_type: 'citizen', record_type: 'citizen' })),
                ...resFiltered.map(r => ({ ...r, person_type: 'resident', record_type: 'resident' }))
            ].sort((a,b) => new Date(b.incident_date || 0) - new Date(a.incident_date || 0));

            total = allFiltered.length;
            results = allFiltered.slice(skip, skip + take);
        } else if (type === 'officer' || type === 'system') {
            let logWhere = {};
            if (Object.keys(dateFilter).length > 0) logWhere.created_at = dateFilter;
            
            if (search && search.trim() !== '') {
                logWhere.OR = [
                    { action: { contains: search, mode: 'insensitive' } },
                    { target: { contains: search, mode: 'insensitive' } },
                    { details: { contains: search, mode: 'insensitive' } }
                ];
            }

            if (type === 'officer') {
                logWhere.action = { contains: 'crime', mode: 'insensitive' }; // Filter strictly for officer actions related to crimes
                if (status && status !== 'all') logWhere.details = { contains: `"new_status":"${status}"` };
            }

            const [logs, logCount] = await Promise.all([
                prisma.activity_logs.findMany({
                    where: logWhere,
                    skip,
                    take,
                    orderBy: { created_at: 'desc' },
                    include: { users: { select: { username: true } } }
                }),
                prisma.activity_logs.count({ where: logWhere })
            ]);

            total = logCount;
            results = logs.map(l => ({ ...l, officer_name: l.users?.username || 'Unknown' }));
        } else if (type === 'revenue') {
            let revWhere = {};
            if (Object.keys(dateFilter).length > 0) revWhere.created_at = dateFilter;
            if (status && status !== 'all') revWhere.status = status;
            if (search && search.trim() !== '') {
                revWhere.OR = [
                    { receipt_number: { contains: search, mode: 'insensitive' } },
                    { service_name: { contains: search, mode: 'insensitive' } },
                    { applicant_name: { contains: search, mode: 'insensitive' } }
                ];
            }
            const [revs, revCount] = await Promise.all([
                prisma.revenue.findMany({
                    where: revWhere,
                    skip, take, orderBy: { created_at: 'desc' }
                }),
                prisma.revenue.count({ where: revWhere })
            ]);
            total = revCount;
            results = revs;
        }

        res.json({
            data: serializeData(results),
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Reports Fetch Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Generic Activity Logging
app.post('/api/logs/activity', async (req, res) => {
    try {
        const { user_id, action, target, details } = req.body;
        await prisma.activity_logs.create({
            data: {
                user_id: user_id ? BigInt(user_id) : null,
                action: action || 'unknown_action',
                target: target || 'system',
                details: details || null
            }
        });
        res.status(201).json({ message: 'Log created' });
    } catch (error) {
        console.error('Activity Log Error:', error);
        res.status(500).json({ error: 'Failed to create log' });
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
