const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

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

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Backend is API is working!' });
});

// Example database route
app.get('/api/status', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ message: 'Database connected successfully', time: new Date() });
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    console.log(`Login attempt for username: ${username}`);

    try {
        // Find user and include all possible profile types
        const user = await prisma.user.findFirst({
            where: {
                username: username,
                password_hash: password
            },
            include: {
                citizen: true,
                resident: true,
                employee: true
            }
        });

        console.log('Login query result:', user ? 'User found' : 'User not found');

        if (user) {
            // Remove sensitive fields and flatten objects
            const { password_hash, citizen, resident, employee, ...userRest } = user;

            // Merge profile data (whichever is available)
            const profileData = citizen || resident || employee || {};
            const flatUser = {
                ...profileData,
                ...userRest
            };

            res.json({ success: true, user: flatUser });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Signup endpoint
app.post('/api/signup', async (req, res) => {
    const { username, password, fullName, email, phoneNumber, nationalId, accountType = 'citizen' } = req.body;

    try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { username }
        });

        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Username already exists' });
        }

        let newUser;
        if (accountType === 'citizen') {
            newUser = await prisma.user.create({
                data: {
                    username,
                    email,
                    password_hash: password,
                    account_type: 'citizen',
                    citizen: {
                        create: {
                            national_number: nationalId || `SO-${Date.now()}`,
                            full_name: fullName,
                            dob: new Date('2000-01-01'),
                            gender: 'male',
                            phone: phoneNumber,
                            email: email
                        }
                    }
                },
                include: { citizen: true }
            });
        } else if (accountType === 'resident') {
            newUser = await prisma.user.create({
                data: {
                    username,
                    email,
                    password_hash: password,
                    account_type: 'resident',
                    resident: {
                        create: {
                            residence_number: nationalId || `RES-${Date.now()}`,
                            full_name: fullName,
                            dob: new Date('2000-01-01'),
                            gender: 'male',
                            nationality: 'Foreigner',
                            phone: phoneNumber,
                            email: email
                        }
                    }
                },
                include: { resident: true }
            });
        } else {
            return res.status(400).json({ success: false, message: 'Invalid account type' });
        }

        const { password_hash, citizen, resident, ...userRest } = newUser;
        const flatUser = {
            ...(citizen || resident || {}),
            ...userRest
        };

        res.json({ success: true, user: flatUser });
    } catch (err) {
        console.error('Error during signup:', err);
        res.status(500).json({ error: 'Signup failed', details: err.message });
    }
});

// Admin endpoint to register a new citizen
app.post('/api/admin/register-citizen', async (req, res) => {
    const { fullName, dob, gender, phone, email, address, maritalStatus, personal_photo } = req.body;

    // Optional: add authorization check here to ensure req.user is an admin

    try {
        // Generating an 11-digit unique national number
        let nationalNumber = '';
        let isUnique = false;

        while (!isUnique) {
            // Generate a random 11 digit number (starting with 1-9 to avoid leading zeros)
            nationalNumber = Math.floor(10000000000 + Math.random() * 90000000000).toString();

            // Checking if it already exists
            const existingCitizen = await prisma.citizen.findUnique({
                where: { national_number: nationalNumber }
            });

            if (!existingCitizen) {
                isUnique = true;
            }
        }

        const newCitizen = await prisma.citizen.create({
            data: {
                national_number: nationalNumber,
                full_name: fullName,
                dob: new Date(dob),
                gender: gender || 'male',
                nationality: 'Somali',
                address: address || null,
                phone: phone || null,
                email: email || null,
                marital_status: maritalStatus || 'single',
                status: 'active'
            }
        });

        if (personal_photo) {
            await prisma.$executeRawUnsafe(`UPDATE citizens SET photo = ? WHERE citizen_id = ?`, personal_photo, newCitizen.citizen_id);
            newCitizen.photo = personal_photo;
        }

        // Optionally, create a user account for them to login
        const defaultUsername = nationalNumber;
        const defaultPassword = 'Password123!'; // Should be generated or sent via email in a real app

        const newUser = await prisma.user.create({
            data: {
                citizen_id: newCitizen.citizen_id,
                username: defaultUsername,
                email: email || `${nationalNumber}@citizen.gov.so`, // unique email
                password_hash: defaultPassword,
                account_type: 'citizen'
            }
        });

        res.json({
            success: true,
            message: 'Citizen registered successfully',
            citizen: {
                ...newCitizen,
                generated_username: defaultUsername,
                generated_password: defaultPassword
            }
        });

    } catch (error) {
        console.error('Error registering citizen:', error);
        res.status(500).json({ error: 'Failed to register citizen', details: error.message });
    }
});

// Admin endpoint to register a new resident
app.post('/api/admin/register-resident', async (req, res) => {
    const { fullName, dob, gender, nationality, passportNumber, visaType, sponsorName, phone, responsiblePersonPhone, email, address, personal_photo } = req.body;

    // Optional: authorization check here

    try {
        // Generating an 11-digit unique residence number
        let residenceNumber = '';
        let isUnique = false;

        while (!isUnique) {
            residenceNumber = Math.floor(10000000000 + Math.random() * 90000000000).toString();

            const existingResident = await prisma.resident.findUnique({
                where: { residence_number: residenceNumber }
            });

            if (!existingResident) {
                isUnique = true;
            }
        }

        const newResident = await prisma.resident.create({
            data: {
                residence_number: residenceNumber,
                full_name: fullName,
                dob: new Date(dob),
                gender: gender || 'male',
                nationality: nationality || 'Unknown',
                passport_number: passportNumber || null,
                visa_type: visaType || null,
                sponsor_name: sponsorName || null,
                address: address || null,
                phone: phone || null,
                responsible_person_phone: responsiblePersonPhone || null,
                email: email || null,
                status: 'active'
            }
        });

        if (personal_photo) {
            await prisma.$executeRawUnsafe(`UPDATE residents SET photo = ? WHERE resident_id = ?`, personal_photo, newResident.resident_id);
            newResident.photo = personal_photo;
        }

        const defaultUsername = residenceNumber;
        const defaultPassword = 'Password123!';

        const newUser = await prisma.user.create({
            data: {
                resident_id: newResident.resident_id,
                username: defaultUsername,
                email: email || `${residenceNumber}@resident.gov.so`,
                password_hash: defaultPassword,
                account_type: 'resident'
            }
        });

        res.json({
            success: true,
            message: 'Resident registered successfully',
            resident: {
                ...newResident,
                generated_username: defaultUsername,
                generated_password: defaultPassword
            }
        });

    } catch (error) {
        console.error('Error registering resident:', error);
        res.status(500).json({ error: 'Failed to register resident', details: error.message });
    }
});

// Admin endpoint to issue a new National/Residence ID Card
app.post('/api/admin/issue-id-card', async (req, res) => {
    const { referenceNumber, personal_photo } = req.body;

    try {
        // Step 1: Check if it's a citizen or resident by attempting to find both
        const citizen = await prisma.citizen.findUnique({ where: { national_number: referenceNumber } });
        const resident = await prisma.resident.findUnique({ where: { residence_number: referenceNumber } });

        if (!citizen && !resident) {
            return res.status(404).json({ success: false, message: 'Person not found. Please register them first.' });
        }

        const personIdValue = citizen ? citizen.citizen_id : resident.resident_id;
        const idType = citizen ? 'citizen' : 'resident';

        // Update photo if provided
        if (personal_photo) {
            if (citizen) {
                await prisma.$executeRawUnsafe(`UPDATE citizens SET photo = ? WHERE citizen_id = ?`, personal_photo, personIdValue);
                citizen.photo = personal_photo;
            } else {
                await prisma.$executeRawUnsafe(`UPDATE residents SET photo = ? WHERE resident_id = ?`, personal_photo, personIdValue);
                resident.photo = personal_photo;
            }
        }

        // Step 2: Determine issue number 
        let existingCards;
        if (citizen) {
            existingCards = await prisma.citizenIdCard.findMany({
                where: { citizen_id: personIdValue },
                orderBy: { issue_number: 'desc' }
            });
        } else {
            existingCards = await prisma.residentIdCard.findMany({
                where: { resident_id: personIdValue },
                orderBy: { issue_number: 'desc' }
            });
        }

        const newIssueNumber = existingCards.length > 0 ? existingCards[0].issue_number + 1 : 1;

        // Step 3: Create the ID Card
        const issueDate = new Date();
        const expiryDate = new Date();
        expiryDate.setFullYear(issueDate.getFullYear() + (citizen ? 10 : 5));

        let newIdCard;
        if (citizen) {
            newIdCard = await prisma.citizenIdCard.create({
                data: {
                    citizen_id: personIdValue,
                    issue_number: newIssueNumber,
                    issue_date: issueDate,
                    expiry_date: expiryDate,
                    status: 'active'
                }
            });
            newIdCard.id_type = 'citizen';
        } else {
            newIdCard = await prisma.residentIdCard.create({
                data: {
                    resident_id: personIdValue,
                    issue_number: newIssueNumber,
                    issue_date: issueDate,
                    expiry_date: expiryDate,
                    status: 'active'
                }
            });
            newIdCard.id_type = 'resident';
        }

        res.json({
            success: true,
            message: `${idType === 'citizen' ? 'National' : 'Residence'} ID Card issued successfully.`,
            idCard: newIdCard,
            person: citizen || resident
        });

    } catch (error) {
        console.error('Error issuing ID card:', error);
        res.status(500).json({ error: 'Failed to issue ID card', details: error.message });
    }
});

// Admin endpoint: Renew ID Card
app.post('/api/admin/renew-id', async (req, res) => {
    const { referenceNumber, applicationId, personal_photo } = req.body;

    try {
        const citizen = await prisma.citizen.findUnique({ where: { national_number: referenceNumber } });
        const resident = await prisma.resident.findUnique({ where: { residence_number: referenceNumber } });

        if (!citizen && !resident) {
            return res.status(404).json({ success: false, message: 'Person not found.' });
        }

        const personIdValue = citizen ? citizen.citizen_id : resident.resident_id;

        // Update photo if provided
        if (personal_photo) {
            if (citizen) {
                await prisma.$executeRawUnsafe(`UPDATE citizens SET photo = ? WHERE citizen_id = ?`, personal_photo, personIdValue);
                citizen.photo = personal_photo;
            } else {
                await prisma.$executeRawUnsafe(`UPDATE residents SET photo = ? WHERE resident_id = ?`, personal_photo, personIdValue);
                resident.photo = personal_photo;
            }
        }

        // Step 1: Mark all existing active cards as expired/cancelled
        if (citizen) {
            await prisma.citizenIdCard.updateMany({
                where: { citizen_id: personIdValue, status: 'active' },
                data: { status: 'expired' }
            });
        } else {
            await prisma.residentIdCard.updateMany({
                where: { resident_id: personIdValue, status: 'active' },
                data: { status: 'expired' }
            });
        }

        // Step 2: Determine new issue number
        let existingCards;
        if (citizen) {
            existingCards = await prisma.citizenIdCard.findMany({
                where: { citizen_id: personIdValue },
                orderBy: { issue_number: 'desc' }
            });
        } else {
            existingCards = await prisma.residentIdCard.findMany({
                where: { resident_id: personIdValue },
                orderBy: { issue_number: 'desc' }
            });
        }
        const newIssueNumber = existingCards.length > 0 ? existingCards[0].issue_number + 1 : 1;

        // Step 3: Create new card
        const issueDate = new Date();
        const expiryDate = new Date();
        expiryDate.setFullYear(issueDate.getFullYear() + (citizen ? 10 : 5));

        let newIdCard;
        if (citizen) {
            newIdCard = await prisma.citizenIdCard.create({
                data: {
                    citizen_id: personIdValue,
                    issue_number: newIssueNumber,
                    issue_date: issueDate,
                    expiry_date: expiryDate,
                    status: 'active'
                }
            });
        } else {
            newIdCard = await prisma.residentIdCard.create({
                data: {
                    resident_id: personIdValue,
                    issue_number: newIssueNumber,
                    issue_date: issueDate,
                    expiry_date: expiryDate,
                    status: 'active'
                }
            });
        }

        // Step 4: Update application status if applicationId provided
        if (applicationId && applicationId !== 'null' && applicationId !== 'undefined') {
            await prisma.application.update({
                where: { application_id: BigInt(applicationId) },
                data: { status: 'completed' }
            });
        }

        res.json({
            success: true,
            message: 'Identity renewed successfully.',
            idCard: newIdCard,
            person: citizen || resident
        });
    } catch (error) {
        console.error('Error renewing ID:', error);
        res.status(500).json({ error: 'Failed to renew identity', details: error.message });
    }
});

// Admin endpoint: Issue New Passport
app.post('/api/admin/issue-passport', async (req, res) => {
    const { referenceNumber, passportType, applicationId, personal_photo } = req.body;

    try {
        const citizen = await prisma.citizen.findUnique({ where: { national_number: referenceNumber } });

        if (!citizen) {
            return res.status(404).json({ success: false, message: 'Citizen not found. Passports are only for citizens.' });
        }

        // Update photo if provided
        if (personal_photo) {
            await prisma.$executeRawUnsafe(`UPDATE citizens SET photo = ? WHERE citizen_id = ?`, personal_photo, citizen.citizen_id);
            citizen.photo = personal_photo;
        }

        // Step 1: Create new passport
        const passportNumber = `P${Math.floor(10000000 + Math.random() * 90000000).toString()}`;
        const issueDate = new Date();
        const expiryDate = new Date();
        expiryDate.setFullYear(issueDate.getFullYear() + 5);

        const newPassport = await prisma.passport.create({
            data: {
                citizen_id: citizen.citizen_id,
                passport_number: passportNumber,
                type: passportType || 'regular',
                issue_date: issueDate,
                expiry_date: expiryDate,
                status: 'active'
            }
        });

        // Step 2: Update application status if applicationId provided
        if (applicationId && applicationId !== 'null' && applicationId !== 'undefined') {
            await prisma.application.update({
                where: { application_id: BigInt(applicationId) },
                data: { status: 'completed' }
            });
        }

        res.json({
            success: true,
            message: 'Passport issued successfully.',
            passport: newPassport,
            person: citizen
        });
    } catch (error) {
        console.error('Error issuing passport:', error);
        res.status(500).json({ error: 'Failed to issue passport', details: error.message });
    }
});

// Admin endpoint: Renew Passport
app.post('/api/admin/renew-passport', async (req, res) => {
    const { referenceNumber, passportType, applicationId, personal_photo } = req.body;

    try {
        const citizen = await prisma.citizen.findUnique({ where: { national_number: referenceNumber } });

        if (!citizen) {
            return res.status(404).json({ success: false, message: 'Citizen not found.' });
        }

        // Update photo if provided
        if (personal_photo) {
            await prisma.$executeRawUnsafe(`UPDATE citizens SET photo = ? WHERE citizen_id = ?`, personal_photo, citizen.citizen_id);
            citizen.photo = personal_photo;
        }

        // Step 1: Mark all existing active passports as expired
        await prisma.passport.updateMany({
            where: { citizen_id: citizen.citizen_id, status: 'active' },
            data: { status: 'expired' }
        });

        // Step 2: Create new passport
        const passportNumber = `P${Math.floor(10000000 + Math.random() * 90000000).toString()}`;
        const issueDate = new Date();
        const expiryDate = new Date();
        expiryDate.setFullYear(issueDate.getFullYear() + 5);

        const newPassport = await prisma.passport.create({
            data: {
                citizen_id: citizen.citizen_id,
                passport_number: passportNumber,
                type: passportType || 'regular',
                issue_date: issueDate,
                expiry_date: expiryDate,
                status: 'active'
            }
        });

        // Step 3: Update application status if applicationId provided
        if (applicationId && applicationId !== 'null' && applicationId !== 'undefined') {
            await prisma.application.update({
                where: { application_id: BigInt(applicationId) },
                data: { status: 'completed' }
            });
        }

        res.json({
            success: true,
            message: 'Passport renewed successfully.',
            passport: newPassport,
            person: citizen
        });
    } catch (error) {
        console.error('Error renewing passport:', error);
        res.status(500).json({ error: 'Failed to renew passport', details: error.message });
    }
});

// Admin endpoint to verify passport renewal data
app.get('/api/admin/verify-passport-renewal/:ref', async (req, res) => {
    const { ref } = req.params;
    try {
        const citizen = await prisma.citizen.findFirst({
            where: {
                OR: [
                    { national_number: ref },
                    { passports: { some: { passport_number: ref } } }
                ]
            },
            include: { passports: { orderBy: { issue_date: 'desc' } } }
        });

        if (!citizen) {
            return res.status(404).json({ success: false, message: 'Passport or National ID not found. Cannot proceed.' });
        }

        res.json({ success: true, citizen });
    } catch (error) {
        console.error('Error verifying passport renewal:', error);
        res.status(500).json({ success: false, message: 'Server error.', details: error.message });
    }
});

// Admin endpoint to search Identity (Citizen or Resident)
app.get('/api/admin/search-id', async (req, res) => {
    const { query } = req.query;
    if (!query) return res.status(400).json({ success: false, message: 'Search query is required' });

    try {
        // Search citizens
        const citizens = await prisma.citizen.findMany({
            where: {
                OR: [
                    { national_number: { contains: query } },
                    { full_name: { contains: query } }
                ]
            },
            include: { citizen_id_cards: { orderBy: { issue_date: 'desc' } } }
        });

        // Search residents
        const residents = await prisma.resident.findMany({
            where: {
                OR: [
                    { residence_number: { contains: query } },
                    { full_name: { contains: query } }
                ]
            },
            include: { resident_id_cards: { orderBy: { issue_date: 'desc' } } }
        });

        const results = [
            ...citizens.map(c => ({
                ...c,
                type: 'citizen',
                id_number: c.national_number,
                idCards: c.citizen_id_cards
            })),
            ...residents.map(r => ({
                ...r,
                type: 'resident',
                id_number: r.residence_number,
                idCards: r.resident_id_cards
            }))
        ];

        res.json({ success: true, results });
    } catch (error) {
        console.error('Error searching IDs:', error);
        res.status(500).json({ success: false, message: 'Search failed', details: error.message });
    }
});

// Admin endpoint to search Passport
app.get('/api/admin/search-passport', async (req, res) => {
    const { query } = req.query;
    if (!query) return res.status(400).json({ success: false, message: 'Search query is required' });

    try {
        const citizens = await prisma.citizen.findMany({
            where: {
                OR: [
                    { national_number: { contains: query } },
                    { full_name: { contains: query } },
                    { passports: { some: { passport_number: { contains: query } } } }
                ]
            },
            include: { passports: { orderBy: { issue_date: 'desc' } } }
        });

        // We format the results to match what PassportSearch UI expects
        const results = citizens.map(c => ({
            citizen: c,
            passport_number: c.passports[0]?.passport_number || 'N/A',
            issue_date: c.passports[0]?.issue_date || new Date(),
            expiry_date: c.passports[0]?.expiry_date || new Date(),
            type: c.passports[0]?.type || 'regular',
            _hasPassport: c.passports.length > 0
        }));

        res.json({ success: true, results });
    } catch (error) {
        console.error('Error searching passports:', error);
        res.status(500).json({ success: false, message: 'Search failed', details: error.message });
    }
});

// User endpoint: Submit a request (Renewal or Replacement)
app.post('/api/user/requests', async (req, res) => {
    const { applicant_type, applicant_id, service_type, personal_photo } = req.body;
    if (!applicant_type || !applicant_id || !service_type) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    try {
        const data = {
            applicant_type,
            service_type,
            status: 'under_review'
        };

        if (applicant_type === 'citizen') {
            data.citizen_id = BigInt(applicant_id);
        } else {
            data.resident_id = BigInt(applicant_id);
        }

        const newRequest = await prisma.application.create({
            data
        });

        if (personal_photo) {
            await prisma.$executeRawUnsafe(`UPDATE applications SET personal_photo = ? WHERE application_id = ?`, personal_photo, newRequest.application_id);
        }

        res.json({ success: true, message: 'Request submitted successfully', request_id: newRequest.application_id.toString() });
    } catch (error) {
        console.error('Error submitting request:', error);
        res.status(500).json({ success: false, message: 'Server error', details: error.message });
    }
});

// User endpoint: Get own requests
app.get('/api/user/requests', async (req, res) => {
    const { type, id } = req.query; // type: citizen/resident, id: ID
    if (!type || !id) return res.status(400).json({ success: false, message: 'Missing parameters' });

    try {
        const whereClause = type === 'citizen' ? { citizen_id: BigInt(id) } : { resident_id: BigInt(id) };
        const requests = await prisma.application.findMany({
            where: whereClause,
            orderBy: { request_date: 'desc' }
        });

        res.json({ success: true, requests: JSON.parse(JSON.stringify(requests, (key, value) => typeof value === 'bigint' ? value.toString() : value)) });
    } catch (error) {
        console.error('Error fetching user requests:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Admin endpoint: Get all requests
app.get('/api/admin/requests', async (req, res) => {
    try {
        const requests = await prisma.application.findMany({
            include: {
                citizen: true,
                resident: true
            },
            orderBy: { request_date: 'desc' }
        });

        res.json({ success: true, requests: JSON.parse(JSON.stringify(requests, (key, value) => typeof value === 'bigint' ? value.toString() : value)) });
    } catch (error) {
        console.error('Error fetching all requests:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Admin endpoint: Update request status
app.put('/api/admin/requests/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    try {
        const updated = await prisma.application.update({
            where: { application_id: BigInt(id) },
            data: { 
                status,
                approval_date: status === 'approved' ? new Date() : null
            }
        });
        
        res.json({ success: true, request: JSON.parse(JSON.stringify(updated, (key, value) => typeof value === 'bigint' ? value.toString() : value)) });
    } catch (error) {
        console.error('Error updating request:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// User endpoint: Get criminal status (certificate)
app.get('/api/user/criminal-status/:id_number', async (req, res) => {
    const { id_number } = req.params;

    try {
        // 1. Get Person details
        let person = await prisma.citizen.findUnique({ where: { national_number: id_number } });
        let type = 'citizen';

        if (!person) {
            person = await prisma.resident.findUnique({ where: { residence_number: id_number } });
            type = 'resident';
        }

        if (!person) {
            return res.status(404).json({ success: false, message: 'Person not found in national database' });
        }

        // 2. Search in both records tables
        const citizenRecords = await prisma.criminalRecord.findMany({
            where: { id_number: id_number }
        });

        const residentRecords = await prisma.residentCriminalRecord.findMany({
            where: { residence_number: id_number }
        });

        const allRecords = [...citizenRecords, ...residentRecords];

        res.json({
            success: true,
            person: {
                full_name: person.full_name,
                id_number: id_number,
                type: type,
                nationality: person.nationality || 'Somali'
            },
            hasRecords: allRecords.length > 0,
            records: allRecords,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Error fetching criminal status:', error);
        res.status(500).json({ success: false, message: 'Server error', details: error.message });
    }
});

app.listen(PORT, () => {

    console.log(`Server is running on port ${PORT}`);
});
