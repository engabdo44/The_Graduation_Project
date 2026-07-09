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

const validateEmail = (value, fieldName) => {
  if (!value || value.trim() === '') {
    throw new Error(`${fieldName} is required`);
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    throw new Error(`${fieldName} format is invalid`);
  }
  if (value.length > 120) {
    throw new Error(`${fieldName} is too long`);
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

// Login endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const user = await prisma.users.findUnique({
            where: { username },
            include: {
                employees: true
            }
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        if (user.account_type !== 'Ministry Health Admin') {
            return res.status(403).json({ error: 'You are not authorized to access the National Health System.' });
        }

        const employee = user.employees || {};

        res.json({
            user: {
                id: user.user_id,
                username: user.username,
                name: employee.full_name || user.username,
                role: user.account_type,
                node: employee.department || 'MOG-HQ-PRIMARY',
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
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
        const { username, password, full_name, role, node_id, email, account_type } = req.body;
        
        if (!username || !password || !full_name || !role) {
            return res.status(400).json({ error: 'Required fields missing' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userEmail = email || `${username}@health.gov.so`;

        // First find or create the employee record
        let employee = await prisma.employees.findFirst({
            where: { full_name }
        });

        if (!employee) {
            employee = await prisma.employees.create({
                data: {
                    full_name,
                    role,
                    department: node_id || 'MOG-HQ-PRIMARY',
                    email: userEmail,
                    phone: ''
                }
            });
        }

        const user = await prisma.users.create({
            data: {
                username,
                password_hash: hashedPassword,
                email: userEmail,
                account_type: account_type || 'Ministry Health Admin',
                employee_id: employee.employee_id,
                is_active: true
            }
        });

        res.status(201).json({ message: 'User created successfully', user: { id: user.user_id, username: user.username, role: employee.role } });
    } catch (error) {
        console.error('Create User Error:', error);
        res.status(500).json({ error: 'User creation failed', details: error.message });
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
        
        // Validation
        validateNumeric(id_number, 'ID Number', 1, 20);
        validateText(full_name, 'Full Name');
        validateDate(dob, 'Date of Birth', false, true);
        
        if (!['Male', 'Female', 'MALE', 'FEMALE'].includes(gender)) {
            throw new Error('Invalid gender value');
        }
        
        if (!blood_type) {
            throw new Error('Blood type is required');
        }
        
        if (contact_number) {
            const phoneRegex = /^\+?[\d\s\-]+$/;
            if (!phoneRegex.test(contact_number)) {
                throw new Error('Contact number format is invalid');
            }
        }
        
        if (region) {
            validateText(region, 'Region');
        }
        
        if (last_checkup) {
            validateDate(last_checkup, 'Last Checkup Date', true, true);
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
        res.status(400).json({ error: error.message || 'Database save failed', details: error.message });
    }
});

// Submit Birth Certificate
app.post('/api/birth-certificates', async (req, res) => {
    try {
        const { fullName, fatherName, motherName, dateOfBirth, placeOfBirth, gender, hospital, doctor, aiNote, uid } = req.body;
        
        // Validation
        validateText(fullName, 'Full Name');
        validateText(fatherName, 'Father Name');
        validateText(motherName, 'Mother Name');
        validateDate(dateOfBirth, 'Date of Birth', false, true);
        validateText(placeOfBirth, 'Place of Birth');
        
        if (!['Male', 'Female', 'MALE', 'FEMALE'].includes(gender)) {
            throw new Error('Invalid gender value');
        }
        
        validateText(hospital, 'Hospital');
        validateText(doctor, 'Doctor');

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
        res.status(400).json({ error: error.message || 'Database save failed', details: error.message });
    }
});

// Search Birth Certificate by UID, National ID, or Name
app.get('/api/birth-certificates/:searchTerm', async (req, res) => {
    const { searchTerm } = req.params;
    try {
        if (!searchTerm || searchTerm.trim() === '') {
            return res.status(400).json({ error: 'Search term is required' });
        }

        const certificates = await prisma.birth_certificates.findMany({
            where: {
                OR: [
                    { uid: { contains: searchTerm } },
                    { full_name: { contains: searchTerm } },
                    { father_name: { contains: searchTerm } },
                    { mother_name: { contains: searchTerm } }
                ]
            },
            take: 20
        });
        
        if (certificates.length === 0) {
            return res.status(404).json({ error: 'Birth certificate not found' });
        }
        
        res.json(certificates);
    } catch (error) {
        console.error('Search Birth Certificate Error:', error);
        res.status(500).json({ error: 'Database search failed', details: error.message });
    }
});

// Submit Death Certificate
app.post('/api/death-certificates', async (req, res) => {
    try {
        const { fullName, citizenId, dateOfDeath, placeOfDeath, causeOfDeath, informantName, doctorName, registryNumber } = req.body;
        
        // Validation
        validateText(fullName, 'Full Name');
        validateNumeric(citizenId, 'Citizen ID', 1, 20);
        validateDate(dateOfDeath, 'Date of Death', false, true);
        validateText(placeOfDeath, 'Place of Death');
        validateText(causeOfDeath, 'Cause of Death');
        validateText(informantName, 'Informant Name');
        validateText(doctorName, 'Doctor Name');

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
        res.status(400).json({ error: error.message || 'Database save failed', details: error.message });
    }
});

// Search Death Certificate by Registry Number, National ID, or Name
app.get('/api/death-certificates/:searchTerm', async (req, res) => {
    const { searchTerm } = req.params;
    try {
        if (!searchTerm || searchTerm.trim() === '') {
            return res.status(400).json({ error: 'Search term is required' });
        }

        const certificates = await prisma.death_certificates.findMany({
            where: {
                OR: [
                    { registry_number: { contains: searchTerm } },
                    { citizen_id: { contains: searchTerm } },
                    { full_name: { contains: searchTerm } }
                ]
            },
            take: 20
        });
        
        if (certificates.length === 0) {
            return res.status(404).json({ error: 'Death certificate not found' });
        }
        
        res.json(certificates);
    } catch (error) {
        console.error('Search Death Certificate Error:', error);
        res.status(500).json({ error: 'Database search failed', details: error.message });
    }
});

// =====================================
// HELPER FUNCTIONS
// =====================================
const notifyUser = async (user_id, account_type, title, message, type) => {
    try {
        if (!user_id) return;
        await prisma.notifications.create({
            data: { user_id: String(user_id), account_type, title, message, notification_type: type }
        });
    } catch (e) {
        console.error("Notify error:", e);
    }
};

const notifyStaff = async (title, message, type) => {
    try {
        const staff = await prisma.users.findMany({ where: { account_type: 'Ministry Health Admin' } });
        if(staff.length > 0) {
            await prisma.notifications.createMany({
                data: staff.map(s => ({ user_id: String(s.user_id), account_type: s.account_type, title, message, notification_type: type }))
            });
        }
    } catch (e) {
        console.error("Staff Notify error:", e);
    }
};

const createLog = async (action, module_name, description, username, user_id, account_type) => {
    try {
        await prisma.system_logs.create({
            data: { action, module_name, description, username: String(username), user_id: String(user_id), account_type: String(account_type) }
        });
    } catch (e) {
        console.error("Log error:", e);
    }
};

// =====================================
// BIRTH CERTIFICATE ISSUANCE & REPRINT
// =====================================

app.post('/api/certificates/birth/issue', async (req, res) => {
    try {
        const { birth_id, generated_by_user_id, generated_by_username, generated_by_role } = req.body;
        
        const record = await prisma.birth_certificates.findUnique({ where: { birth_id: BigInt(birth_id) } });
        if (!record) return res.status(404).json({ error: "Record not found" });

        const certNum = `BC-SOM-${Math.floor(1000000 + Math.random() * 9000000)}`;

        const newRequest = await prisma.certificate_requests.create({
            data: {
                birth_id: BigInt(birth_id),
                service_type: 'ISSUANCE',
                fee: 0.00,
                status: 'completed',
                print_date: new Date(),
                patient_name: record.full_name,
                certificate_number: certNum
            }
        });

        await prisma.revenue.create({
            data: {
                transaction_type: 'Birth Certificate Issuance',
                amount: 0.00,
                request_id: newRequest.request_id,
                applicant_name: record.full_name,
                status: 'completed'
            }
        });

        await notifyStaff('Certificate Generated', `A new birth certificate (${certNum}) was generated.`, 'cert_generated');
        await createLog('CERTIFICATE_GENERATED', 'Certificates', `Generated certificate ${certNum} for ${record.full_name}`, generated_by_username, generated_by_user_id, generated_by_role);

        res.json({ success: true, request_id: newRequest.request_id.toString(), certificate_number: certNum });
    } catch (error) {
        res.status(500).json({ error: 'Issuance failed', details: error.message });
    }
});

app.post('/api/certificates/birth/reprint', async (req, res) => {
    try {
        const { birth_id, user_id, username, account_type } = req.body;
        
        const record = await prisma.birth_certificates.findUnique({ where: { birth_id: BigInt(birth_id) } });
        if (!record) return res.status(404).json({ error: "Record not found" });

        const existingIssue = await prisma.certificate_requests.findFirst({
            where: { birth_id: BigInt(birth_id), service_type: 'ISSUANCE', status: 'completed' }
        });
        
        const certNum = existingIssue ? existingIssue.certificate_number : `BC-SOM-R${Math.floor(100000 + Math.random() * 900000)}`;

        const newRequest = await prisma.certificate_requests.create({
            data: {
                birth_id: BigInt(birth_id),
                service_type: 'REPRINT',
                fee: 10.00,
                status: 'submitted',
                patient_name: record.full_name,
                certificate_number: certNum,
                user_id: user_id ? BigInt(user_id) : null
            }
        });

        await notifyUser(user_id, account_type, 'Reprint Request Submitted', `Your reprint request for ${record.full_name} is submitted.`, 'reprint_submitted');
        await notifyStaff('Reprint Request Submitted', `A new reprint request is pending review for ${record.full_name}.`, 'staff_reprint_req');
        await createLog('REPRINT_REQUESTED', 'Certificates', `Requested reprint for ${record.full_name}`, username, user_id, account_type);

        res.json({ success: true, request_id: newRequest.request_id.toString() });
    } catch (error) {
        res.status(500).json({ error: 'Reprint request failed', details: error.message });
    }
});

// Update Request Status (For Approvals, Printing, etc)
app.put('/api/certificates/requests/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, user_id, username, account_type } = req.body;

        const request = await prisma.certificate_requests.update({
            where: { request_id: BigInt(id) },
            data: { 
                status,
                ...(status === 'approved' ? { approval_date: new Date() } : {}),
                ...(status === 'printed' ? { print_date: new Date() } : {})
            }
        });

        if (status === 'completed' && request.fee > 0) {
            await prisma.revenue.create({
                data: {
                    transaction_type: 'Birth Certificate Reprint',
                    amount: 10.00,
                    request_id: request.request_id,
                    applicant_name: request.patient_name,
                    status: 'completed'
                }
            });
        }

        const notifyMsgMap = {
            'approved': 'Your reprint request has been approved and moved to the printing queue.',
            'rejected': 'Your reprint request was rejected.',
            'printing_queue': 'Your certificate is in the printing queue.',
            'printed': 'Your certificate has been printed.',
            'completed': 'Your reprint request is fully completed.'
        };

        if (notifyMsgMap[status]) {
            await notifyUser(request.user_id, 'citizen', `Request ${status.toUpperCase()}`, notifyMsgMap[status], `request_${status}`);
            await notifyStaff(`Request ${status.toUpperCase()}`, `Request ${request.request_id} for ${request.patient_name} is now ${status}.`, `request_${status}`);
        }

        await createLog(`REQUEST_STATUS_${status}`, 'Certificates', `Request ${id} status updated to ${status}`, username, user_id, account_type);

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Update failed', details: error.message });
    }
});

// =====================================
// REPORTS & REVENUE API
// =====================================

app.get('/api/reports/birth-certificates', async (req, res) => {
    try {
        const { search, certNum, dateFrom, dateTo, status, page = 1, limit = 20 } = req.query;
        let where = {};
        if (search) where.patient_name = { contains: search };
        if (certNum) where.certificate_number = { contains: certNum };
        if (status) where.status = status;
        if (dateFrom || dateTo) {
            where.created_at = {};
            if (dateFrom) where.created_at.gte = new Date(dateFrom);
            if (dateTo) where.created_at.lte = new Date(dateTo);
        }

        const records = await prisma.certificate_requests.findMany({
            where,
            include: { birth_certificate: true },
            skip: (parseInt(page) - 1) * parseInt(limit),
            take: parseInt(limit),
            orderBy: { created_at: 'desc' }
        });

        const total = await prisma.certificate_requests.count({ where });

        // Stats
        const totalIssuance = await prisma.certificate_requests.count({ where: { service_type: 'ISSUANCE' } });
        const totalReprints = await prisma.certificate_requests.count({ where: { service_type: 'REPRINT' } });
        const pendingReqs = await prisma.certificate_requests.count({ where: { status: 'submitted' } });
        const approvedReqs = await prisma.certificate_requests.count({ where: { status: 'approved' } });
        const rejectedReqs = await prisma.certificate_requests.count({ where: { status: 'rejected' } });
        const completedReqs = await prisma.certificate_requests.count({ where: { status: 'completed' } });
        const revenueResult = await prisma.revenue.aggregate({ _sum: { amount: true }, where: { transaction_type: 'Birth Certificate Reprint', status: 'completed' } });

        const serialized = JSON.parse(JSON.stringify(records, (k, v) => typeof v === 'bigint' ? v.toString() : v));
        
        res.json({
            success: true,
            records: serialized,
            total,
            pages: Math.ceil(total / parseInt(limit)),
            stats: { totalIssuance, totalReprints, pendingReqs, approvedReqs, rejectedReqs, completedReqs, revenue: revenueResult._sum.amount || 0 }
        });
    } catch (error) {
        res.status(500).json({ error: 'Report failed', details: error.message });
    }
});

app.get('/api/reports/revenue', async (req, res) => {
    try {
        const totalRev = await prisma.revenue.aggregate({ _sum: { amount: true }, where: { status: 'completed' } });
        const issuanceCount = await prisma.revenue.count({ where: { transaction_type: 'Birth Certificate Issuance' } });
        const reprintCount = await prisma.revenue.count({ where: { transaction_type: 'Birth Certificate Reprint' } });
        
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthlyRev = await prisma.revenue.aggregate({ _sum: { amount: true }, where: { status: 'completed', created_at: { gte: startOfMonth } } });
        
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const yearlyRev = await prisma.revenue.aggregate({ _sum: { amount: true }, where: { status: 'completed', created_at: { gte: startOfYear } } });

        res.json({
            success: true,
            totalRevenue: totalRev._sum.amount || 0,
            monthlyRevenue: monthlyRev._sum.amount || 0,
            annualRevenue: yearlyRev._sum.amount || 0,
            issuanceCount,
            reprintCount
        });
    } catch (error) {
        res.status(500).json({ error: 'Revenue fetch failed', details: error.message });
    }
});

// Notifications Endpoint for Health Portal
app.get('/api/notifications', async (req, res) => {
    try {
        const { user_id } = req.query;
        if (!user_id) return res.status(400).json({ success: false, error: 'User ID required' });

        const notifications = await prisma.notifications.findMany({
            where: { user_id: String(user_id) },
            orderBy: { created_at: 'desc' }
        });
        
        const formatted = JSON.parse(JSON.stringify(notifications, (key, value) => typeof value === 'bigint' ? value.toString() : value));
        res.json({ success: true, notifications: formatted });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
    }
});

app.put('/api/notifications/:id/read', async (req, res) => {
    try {
        await prisma.notifications.update({
            where: { notification_id: BigInt(req.params.id) },
            data: { is_read: true }
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
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
