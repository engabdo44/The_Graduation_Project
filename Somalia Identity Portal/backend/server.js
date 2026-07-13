const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

// Validation helpers
const validateText = (value, fieldName) => {
  if (!value || value.trim() === '') {
    throw new Error(`${fieldName} is required`);
  }
  const textRegex = /^[a-zA-Z\u0600-\u06FF\u0750-\u077F\s\-'\.,0-9]+$/;
  if (!textRegex.test(value)) {
    throw new Error(`${fieldName} contains invalid characters`);
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

const validateStrongPassword = (pass) => {
    if (!pass || pass.length < 8) return false;
    if (!/[A-Z]/.test(pass)) return false;
    if (!/[a-z]/.test(pass)) return false;
    if (!/[0-9]/.test(pass)) return false;
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(pass)) return false;
    return true;
};

const generateTempPassword = () => {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const nums = '0123456789';
    const spec = '!@#$%^&*()_+-=[]{};:|,.<>/?';
    let pass = '';
    pass += upper[Math.floor(Math.random() * upper.length)];
    pass += lower[Math.floor(Math.random() * lower.length)];
    pass += nums[Math.floor(Math.random() * nums.length)];
    pass += spec[Math.floor(Math.random() * spec.length)];
    const all = upper + lower + nums + spec;
    for(let i = 0; i < 4; i++) {
        pass += all[Math.floor(Math.random() * all.length)];
    }
    return pass.split('').sort(() => 0.5 - Math.random()).join('');
};

const validatePhone = (value, fieldName) => {
  if (!value || value.trim() === '') {
    throw new Error(`${fieldName} is required`);
  }
  const phoneRegex = /^\+?[\d\s\-]+$/;
  if (!phoneRegex.test(value)) {
    throw new Error(`${fieldName} format is invalid`);
  }
  const digitsOnly = value.replace(/\D/g, '');
  if (digitsOnly.length < 8 || digitsOnly.length > 15) {
    throw new Error(`${fieldName} must be between 8-15 digits`);
  }
};

dotenv.config();

// BigInt serialization fix
BigInt.prototype.toJSON = function () {
    return this.toString();
};

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cookieParser());

// SMTP transporter configuration
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: parseInt(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    logger: true,
    debug: true,
    tls: {
       rejectUnauthorized: false
    }
});

// Middleware for token validation
const authenticateToken = (req, res, next) => {
    const token = req.cookies?.auth_token || req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Unauthorized access. Please login again.' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret123');
        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
             return res.status(401).json({ success: false, message: 'Session expired. Please refresh or login again.', code: 'TOKEN_EXPIRED' });
        }
        res.status(403).json({ success: false, message: 'Invalid token' });
    }
};

// Middleware for role-based authorization
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        // Run token authentication first if req.user is not populated yet
        if (!req.user) {
            const token = req.cookies?.auth_token || req.headers['authorization']?.split(' ')[1];
            if (!token) return res.status(401).json({ success: false, message: 'Unauthorized access. Please login again.' });
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret123');
                req.user = decoded;
            } catch (err) {
                if (err.name === 'TokenExpiredError') {
                     return res.status(401).json({ success: false, message: 'Session expired. Please refresh or login again.', code: 'TOKEN_EXPIRED' });
                }
                return res.status(403).json({ success: false, message: 'Invalid token' });
            }
        }

        // Check if the user's role is allowed
        if (!allowedRoles.includes(req.user.account_type)) {
            return res.status(403).json({
                success: false,
                message: 'Access Denied: You do not have permission to perform this action.'
            });
        }
        next();
    };
};

// Check auth status
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const user = await prisma.users.findFirst({
            where: { user_id: BigInt(req.user.user_id) },
            include: { citizens: true, residents: true, employees: true }
        });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        const { password_hash, citizens, residents, employees, ...userRest } = user;
        const flatUser = { ...((citizens || residents || employees) || {}), ...userRest };
        const token = jwt.sign({ user_id: flatUser.user_id.toString(), account_type: flatUser.account_type }, process.env.JWT_SECRET || 'supersecret123', { expiresIn: '8h' });
        res.cookie('auth_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 8 * 60 * 60 * 1000 });
        res.json({ success: true, user: flatUser });
    } catch(err) {
        res.status(500).json({ success: false });
    }
});

app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('auth_token');
    res.json({ success: true, message: 'Logged out successfully' });
});


// Memory store for OTPs: Map<email, { otp, expiresAt, verified }>
const otpStore = new Map();

// Memory store for Password Setup Tokens: Map<token, { userId, username, email, expiresAt, used }>
const setupTokenStore = new Map();

// Helper to send credentials email
const sendCredentialsEmail = async (email, username, tempPassword, setupToken) => {
    if (!email) return false;
    const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@egovernment.gov.so',
        to: email,
        subject: 'Welcome to the E-Government Portal - Your Account Details',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
                <h2 style="color: #1e3a8a; text-align: center;">E-Government Portal</h2>
                <p style="color: #374151; font-size: 16px;">Welcome to the E-Government Portal. Your new account has been successfully created.</p>
                <div style="margin: 20px 0; background: #f9fafb; padding: 15px; border-radius: 8px;">
                    <p style="margin: 5px 0;"><strong>Username:</strong> ${username}</p>
                    <p style="margin: 5px 0;"><strong>Temporary Password:</strong> ${tempPassword}</p>
                </div>
                <p style="color: #374151; font-size: 16px;">For your security, you must set a permanent password before accessing your account.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="http://localhost:5173/set-password?token=${setupToken}" style="background-color: #1d4ed8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Set Up Your Password</a>
                </div>
                <p style="color: #6b7280; font-size: 14px; text-align: center;">This secure link will expire in 24 hours.</p>
                <div style="text-align: center; margin-top: 15px;">
                    <a href="http://localhost:5173/" style="color: #1d4ed8; font-size: 14px; text-decoration: none;">Go to Portal Login</a>
                </div>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
                <p style="color: #9ca3af; font-size: 12px; text-align: center;">If you need assistance, please contact the support team or visit your nearest branch.</p>
            </div>
        `
    };
    try {
        console.log(`[SMTP] Attempting to send credentials email to: ${email}`);
        const info = await transporter.sendMail(mailOptions);
        console.log(`[SMTP] Email sent successfully to ${email}. Message ID: ${info.messageId}`);
        return true;
    } catch (err) {
        console.error('[SMTP] Failed to send credentials email:', err.message);
        return false;
    }
};

app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
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

// Admin Citizens Search
app.get('/api/admin/citizens/search', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) return res.json({ success: true, citizens: [] });
        
        // Search by citizen_id (if numeric) or full_name
        let whereClause = {
            OR: [
                { full_name: { contains: query } },
                { national_id_number: { contains: query } }
            ]
        };
        
        if (!isNaN(parseInt(query))) {
             whereClause.OR.push({ citizen_id: BigInt(query) });
        }
        
        const citizens = await prisma.citizens.findMany({
            where: whereClause,
            take: 10
        });
        
        res.json({
            success: true,
            citizens: JSON.parse(JSON.stringify(citizens, (key, value) => typeof value === 'bigint' ? value.toString() : value))
        });
    } catch (err) {
        console.error('Citizens Search Error:', err);
        res.status(500).json({ success: false, error: 'Database search failed' });
    }
});

// Admin Direct Reprint - Revenue Tracker
app.post('/api/admin/birth-certificates/reprint', async (req, res) => {
    try {
        const { citizen_id } = req.body;
        
        await prisma.revenue.create({
            data: {
                transaction_type: 'Health',
                service_name: 'Birth Certificate Reprint',
                amount: 10.00,
                status: 'completed',
                payment_method: 'Admin Issue'
            }
        });
        
        res.json({ success: true, message: 'Reprint action recorded and revenue updated.' });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to record reprint.' });
    }
});

// Admin Dashboard Statistics — live data endpoint
app.get('/api/admin/dashboard-stats', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const [
            totalRequests,
            pendingRequests,
            todayApprovals,
            revenueAgg,
            statusDist,
            serviceUsage,
        ] = await Promise.all([
            // Total requests
            prisma.applications.count(),
            // Pending verification
            prisma.applications.count({ where: { status: 'pending' } }),
            // Today's approvals
            prisma.applications.count({
                where: {
                    status: { in: ['approved', 'printing_queue', 'completed'] },
                    approval_date: { gte: today, lt: tomorrow }
                }
            }),
            // Total revenue from completed transactions
            prisma.revenue.aggregate({
                where: { status: 'completed' },
                _sum: { amount: true }
            }),
            // Status distribution
            prisma.applications.groupBy({
                by: ['status'],
                _count: { application_id: true }
            }),
            // Service type usage
            prisma.applications.groupBy({
                by: ['service_type'],
                _count: { application_id: true },
                orderBy: { _count: { application_id: 'desc' } }
            }),
        ]);

        // Build 7-day trends (daily approved vs submitted)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const recentApps = await prisma.applications.findMany({
            where: { request_date: { gte: sevenDaysAgo } },
            select: { request_date: true, status: true }
        });

        // Group into daily buckets
        const dailyMap = {};
        for (let i = 0; i < 7; i++) {
            const d = new Date(sevenDaysAgo);
            d.setDate(d.getDate() + i);
            const key = d.toISOString().split('T')[0];
            dailyMap[key] = { date: key, submitted: 0, approved: 0, rejected: 0, completed: 0 };
        }
        recentApps.forEach(a => {
            const key = a.request_date ? new Date(a.request_date).toISOString().split('T')[0] : null;
            if (key && dailyMap[key]) {
                dailyMap[key].submitted++;
                if (['approved', 'printing_queue'].includes(a.status)) dailyMap[key].approved++;
                if (a.status === 'rejected') dailyMap[key].rejected++;
                if (a.status === 'completed') dailyMap[key].completed++;
            }
        });

        const bigIntFix = (v) => typeof v === 'bigint' ? Number(v) : v;

        res.json({
            success: true,
            stats: {
                totalRequests: bigIntFix(totalRequests),
                pendingRequests: bigIntFix(pendingRequests),
                todayApprovals: bigIntFix(todayApprovals),
                totalRevenue: parseFloat(revenueAgg._sum.amount || 0),
                statusDistribution: statusDist.map(s => ({
                    status: s.status,
                    count: bigIntFix(s._count.application_id)
                })),
                serviceUsage: serviceUsage.map(s => ({
                    service_type: s.service_type,
                    count: bigIntFix(s._count.application_id)
                })),
                dailyTrend: Object.values(dailyMap)
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats', details: error.message });
    }
});


// Login endpoint
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    console.log(`Login attempt for username: ${username}`);

    try {
        // Find user and include all possible profile types
        const user = await prisma.users.findUnique({
            where: {
                username: username
            },
            include: {
                citizens: true,
                residents: true,
                employees: true
            }
        });

        if (!user) {
            console.log('Login query result: User not found');
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Compare password (support both bcrypt hashes and plain text fallback)
        let isMatch = false;
        if (user.password_hash.startsWith('$2')) {
            const bcryptjs = require('bcryptjs');
            isMatch = bcryptjs.compareSync(password, user.password_hash);
        } else {
            isMatch = (user.password_hash === password);
        }

        if (isMatch) {
            // Remove sensitive fields and flatten objects
            const { password_hash, citizens, residents, employees, ...userRest } = user;

            // Merge profile data (whichever is available)
            const profileData = citizens || residents || employees || {};
            const flatUser = {
                ...profileData,
                ...userRest
            };

            // Log First Login if this is a pending account
            if (flatUser.account_status === 'Pending Password Change') {
                try {
                    await prisma.system_logs.create({
                        data: {
                            event_type: 'Authentication',
                            module_name: 'User Portal',
                            description: 'Action: First Login',
                            user_id: user.user_id.toString(),
                            username: user.username,
                            account_type: user.account_type,
                            created_at: new Date()
                        }
                    });
                } catch (logErr) {}
                
                return res.json({ success: true, requiresPasswordChange: true, user: flatUser });
            }

            const token = jwt.sign(
                { user_id: flatUser.user_id.toString(), account_type: flatUser.account_type },
                process.env.JWT_SECRET || 'supersecret123',
                { expiresIn: '8h' }
            );

            res.cookie('auth_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 8 * 60 * 60 * 1000
            });

            res.json({ success: true, user: flatUser, token });
        } else {
            console.log('Login query result: Password mismatch');
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Change Password Endpoint
app.post('/api/user/change-password', async (req, res) => {
    const { user_id, current_password, new_password } = req.body;

    try {
        // Find existing user by ID
        const user = await prisma.users.findUnique({
            where: {
                user_id: BigInt(user_id)
            }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Compare password (support both bcrypt hashes and plain text fallback)
        let isMatch = false;
        if (user.password_hash.startsWith('$2')) {
            const bcryptjs = require('bcryptjs');
            isMatch = bcryptjs.compareSync(current_password, user.password_hash);
        } else {
            isMatch = (user.password_hash === current_password);
        }

        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
        }

        if (!validateStrongPassword(new_password)) {
            return res.status(400).json({ success: false, message: 'Password does not meet security requirements.' });
        }

        // Update password and activate account using bcrypt hash
        const bcryptjs = require('bcryptjs');
        const hashedPassword = bcryptjs.hashSync(new_password, 10);
        await prisma.users.update({
            where: { user_id: BigInt(user_id) },
            data: { password_hash: hashedPassword, account_status: 'Active' }
        });

        // Try to log the event in SystemLog, but don't fail password change if logging fails
        try {
            await prisma.system_logs.create({
                data: {
                    event_type: 'Authentication',
                    module_name: 'User Portal',
                    description: 'Action: Password Changed',
                    user_id: user_id.toString(),
                    username: user.username,
                    account_type: user.account_type,
                    created_at: new Date()
                }
            });
            // If it was pending, log account activated
            if (user.account_status === 'Pending Password Change') {
                await prisma.system_logs.create({
                    data: {
                        event_type: 'Authentication',
                        module_name: 'User Portal',
                        description: 'Action: Account Activated',
                        user_id: user_id.toString(),
                        username: user.username,
                        account_type: user.account_type,
                        created_at: new Date()
                    }
                });
            }
        } catch (logErr) {
            console.error('Failed to write activity log:', logErr.message);
        }

        res.json({ success: true, message: 'Password changed successfully.' });
    } catch (err) {
        console.error('Error changing password:', err);
        res.status(500).json({ success: false, message: 'Internal server error while changing password.' });
    }
});

// -- FORGOT PASSWORD WORKFLOW --

// 1. Send OTP
app.post('/api/forgot-password/send-otp', async (req, res) => {
    const { email } = req.body;
    console.log(`\n--- Forgot password request received ---`);
    console.log(`Email details: ${email}`);

    try {
        const user = await prisma.users.findUnique({
            where: { email }
        });

        if (!user) {
            console.log(`Email NOT found in database: ${email}`);
            return res.status(404).json({ success: false, message: 'This email is not registered in our system.' });
        }

        console.log(`Email found in database: ${email} (User ID: ${user.user_id})`);

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`OTP generated successfully.`);

        // Setup email options
        const mailOptions = {
            from: process.env.SMTP_FROM || 'noreply@egovernment.gov.so',
            to: email,
            subject: 'Your Password Reset Verification Code',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
                    <h2 style="color: #1e3a8a; text-align: center;">E-Government Portal</h2>
                    <p style="color: #374151; font-size: 16px;">Hello ${user.username},</p>
                    <p style="color: #374151; font-size: 16px;">We received a request to reset your password. Use the verification code below to proceed:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1d4ed8; background: #eff6ff; padding: 10px 30px; border-radius: 8px;">${otp}</span>
                    </div>
                    <p style="color: #6b7280; font-size: 14px;">This code will expire in 10 minutes. If you did not request a password reset, please ignore this email.</p>
                </div>
            `
        };

        try {
            console.log(`[SMTP] OTP Email send attempted to ${email}`);
            const info = await transporter.sendMail(mailOptions);
            console.log(`[SMTP] OTP Email send success to ${email}. Message ID: ${info.messageId}`);
        } catch (emailErr) {
            console.error(`[SMTP] OTP Email send failure:`, emailErr);
            console.error(`[SMTP] Exact SMTP error details: ${emailErr.message}`);
            return res.status(500).json({ success: false, message: 'Email delivery failed. Please contact the system administrator.' });
        }

        // Store OTP with 10 mins expiry
        otpStore.set(email, { 
            otp, 
            expiresAt: Date.now() + 10 * 60 * 1000,
            verified: false 
        });
        
        // Log "Password Reset Requested" event
        try {
            await prisma.system_logs.create({
                data: {
                    event_type: 'Authentication',
                    module_name: 'User Portal',
                    description: 'Action: Password Reset Requested',
                    user_id: user.user_id.toString(),
                    username: user.username,
                    account_type: user.account_type,
                    created_at: new Date()
                }
            });
        } catch (logErr) { console.error('Failed to log reset request:', logErr.message); }

        // Log Code sent event
        try {
            await prisma.system_logs.create({
                data: {
                    event_type: 'Authentication',
                    module_name: 'User Portal',
                    description: 'Action: Verification Code Sent',
                    user_id: user.user_id.toString(),
                    username: user.username,
                    account_type: user.account_type,
                    created_at: new Date()
                }
            });
        } catch (logErr) { console.error('Failed to log code sent:', logErr.message); }

        res.json({ success: true, message: 'A verification code has been sent to your email address.' });
    } catch (err) {
        console.error('Error in send-otp process:', err);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

// 2. Verify OTP
app.post('/api/forgot-password/verify-otp', async (req, res) => {
    const { email, code } = req.body;
    try {
        const record = otpStore.get(email);

        if (!record) {
            return res.status(400).json({ success: false, message: 'No verification requested for this email.' });
        }

        if (Date.now() > record.expiresAt) {
            otpStore.delete(email);
            return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new code.' });
        }

        if (record.otp !== code) {
            return res.status(400).json({ success: false, message: 'Invalid verification code.' });
        }

        // Mark as verified
        record.verified = true;
        otpStore.set(email, record);

        // Fetch user for logging
        const user = await prisma.users.findUnique({ where: { email } });
        if (user) {
            try {
                await prisma.system_logs.create({
                    data: {
                        event_type: 'Authentication',
                        module_name: 'User Portal',
                        description: 'Action: Verification Successful',
                        user_id: user.user_id.toString(),
                        username: user.username,
                        account_type: user.account_type,
                        created_at: new Date()
                    }
                });
            } catch (logErr) { console.error('Failed to log verification success:', logErr.message); }
        }

        res.json({ success: true, message: 'OTP verified successfully.' });
    } catch (err) {
        console.error('Error verifying OTP:', err);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

// 3. Reset Password
app.post('/api/forgot-password/reset-password', async (req, res) => {
    const { email, new_password } = req.body;
    try {
        const record = otpStore.get(email);
        
        if (!record || !record.verified) {
            return res.status(403).json({ success: false, message: 'Unauthorized password reset attempt.' });
        }

        // Fetch user to check password
        const user = await prisma.users.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        let isSame = false;
        if (user.password_hash.startsWith('$2')) {
            const bcryptjs = require('bcryptjs');
            isSame = bcryptjs.compareSync(new_password, user.password_hash);
        } else {
            isSame = (user.password_hash === new_password);
        }

        if (isSame) {
            return res.status(400).json({ success: false, message: 'Cannot be the same as the current password.' });
        }

        if (!validateStrongPassword(new_password)) {
            return res.status(400).json({ success: false, message: 'Password does not meet security requirements.' });
        }

        // Update password with bcrypt hash
        const bcryptjs = require('bcryptjs');
        const hashedPassword = bcryptjs.hashSync(new_password, 10);
        const updatedUser = await prisma.users.update({
            where: { email },
            data: { password_hash: hashedPassword }
        });

        // Invalidate OTP flow
        otpStore.delete(email);

        // Log completion
        try {
            await prisma.system_logs.create({
                data: {
                    event_type: 'Authentication',
                    module_name: 'User Portal',
                    description: 'Action: Password Reset Completed',
                    user_id: updatedUser.user_id.toString(),
                    username: updatedUser.username,
                    account_type: updatedUser.account_type,
                    created_at: new Date()
                }
            });
        } catch (logErr) { console.error('Failed to log reset completion:', logErr.message); }

        res.json({ success: true, message: 'Password reset successfully.' });
    } catch (err) {
        console.error('Error resetting password:', err);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

// -- PASSWORD SETUP VIA EMAIL LINK --

// 1. Validate Setup Token
app.get('/api/user/validate-setup-token', async (req, res) => {
    const { token } = req.query;
    if (!token) return res.status(400).json({ success: false, message: 'No token provided.' });

    const record = setupTokenStore.get(token);
    if (!record) {
        return res.status(400).json({ success: false, message: 'This password setup link is no longer valid.' });
    }
    
    if (record.used) {
        return res.status(400).json({ success: false, message: 'This password setup link has already been used.' });
    }

    if (Date.now() > record.expiresAt) {
        setupTokenStore.delete(token);
        return res.status(400).json({ success: false, message: 'This password setup link has expired.' });
    }

    // Still valid
    res.json({ success: true, username: record.username });
});

// 2. Set Up New Password
app.post('/api/user/setup-password', async (req, res) => {
    const { token, new_password } = req.body;
    try {
        const record = setupTokenStore.get(token);
        if (!record || record.used || Date.now() > record.expiresAt) {
            if (record && Date.now() > record.expiresAt) setupTokenStore.delete(token);
            return res.status(400).json({ success: false, message: 'This password setup link is no longer valid.' });
        }

        const user = await prisma.users.findFirst({ where: { user_id: BigInt(record.userId) } });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        if (user.password_hash === new_password) {
             return res.status(400).json({ success: false, message: 'New password cannot be the same as the temporary password.' });
        }

        if (!validateStrongPassword(new_password)) {
            return res.status(400).json({ success: false, message: 'Password does not meet security requirements.' });
        }

        // Update password and mark active with bcrypt hash
        const bcryptjs = require('bcryptjs');
        const hashedPassword = bcryptjs.hashSync(new_password, 10);
        await prisma.users.update({
            where: { user_id: user.user_id },
            data: { password_hash: hashedPassword, account_status: 'Active' }
        });

        // Mark token as used & invalidate
        record.used = true;
        setupTokenStore.delete(token);

        // Logs
        try {
            await prisma.system_logs.create({
                data: {
                    event_type: 'Authentication',
                    module_name: 'User Portal',
                    description: 'Action: Password Successfully Set',
                    user_id: user.user_id.toString(),
                    username: user.username,
                    account_type: user.account_type,
                    created_at: new Date()
                }
            });
            
            await prisma.system_logs.create({
                data: {
                    event_type: 'Authentication',
                    module_name: 'User Portal',
                    description: 'Action: Account Activated',
                    user_id: user.user_id.toString(),
                    username: user.username,
                    account_type: user.account_type,
                    created_at: new Date()
                }
            });
        } catch(e) {}

        res.json({ success: true, message: 'Your password has been set successfully. You can now log in.' });
    } catch (err) {
        console.error('Error setting up new password:', err);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

// Email Testing Endpoint
app.post('/api/test-email', async (req, res) => {
    const { to } = req.body;
    console.log(`--- Email Delivery Test to: ${to} ---`);
    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || 'test@egovernment.gov.so',
            to,
            subject: 'Test Email',
            text: 'This is a standard backend testing email.'
        });
        res.json({ success: true, message: 'Email passed.', info });
    } catch (err) {
        console.error('[SMTP] Basic test endpoint failure:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Admin Email Diagnostics Endpoint
app.post('/api/admin/email-diagnostics/test', authorizeRoles('admin'), async (req, res) => {
    const { email } = req.body;
    try {
        console.log(`[SMTP Diagnostics] 1. Starting SMTP connection test...`);
        const isVerified = await transporter.verify();
        console.log(`[SMTP Diagnostics] 2. SMTP authentication success: ${isVerified}`);
        
        console.log(`[SMTP Diagnostics] 3. Attempting to send test email to: ${email}`);
        const mailOptions = {
            from: process.env.SMTP_FROM || 'noreply@egovernment.gov.so',
            to: email,
            subject: 'System Email Diagnostics Test',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #2563eb;">SMTP Diagnostic Successful</h2>
                    <p>If you are receiving this email, it means your E-Government Portal SMTP connection is fully operational.</p>
                    <p>Timestamp: ${new Date().toISOString()}</p>
                </div>
            `
        };

        console.log('Test email send attempted...');
        const info = await transporter.sendMail(mailOptions);
        console.log(`Test email send success. Message ID: ${info.messageId}`);
        
        res.json({ success: true, message: 'Test email delivered securely.', info });
    } catch (error) {
        console.error(`Test email send failure:`, error);
        console.error(`SMTP error details: ${error.message}`);
        res.status(500).json({ success: false, message: 'Unable to send test verification email. Please try again later.', error: error.message });
    }
});

// Signup endpoint
app.post('/api/signup', async (req, res) => {
    const { username, password, fullName, email, phoneNumber, nationalId, accountType = 'citizen' } = req.body;

    try {
        if (!validateStrongPassword(password)) {
            return res.status(400).json({ success: false, message: 'Password does not meet security requirements.' });
        }

        // Check if user already exists
        const existingUser = await prisma.users.findUnique({
            where: { username }
        });

        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Username already exists' });
        }

        const bcryptjs = require('bcryptjs');
        const hashedPassword = bcryptjs.hashSync(password, 10);

        let newUser;
        if (accountType === 'citizen') {
            newUser = await prisma.users.create({
                data: {
                    username,
                    email,
                    password_hash: hashedPassword,
                    account_type: 'citizen',
                    citizens: { create: {
                            national_number: nationalId || `SO-${Date.now()}`,
                            full_name: fullName,
                            dob: new Date('2000-01-01'),
                            gender: 'male',
                            phone: phoneNumber,
                            email: email
                        }
                    }
                },
                include: { citizens: true }
            });
        } else if (accountType === 'resident') {
            newUser = await prisma.users.create({
                data: {
                    username,
                    email,
                    password_hash: hashedPassword,
                    account_type: 'resident',
                    residents: { create: {
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
                include: { residents: true }
            });
        } else {
            return res.status(400).json({ success: false, message: 'Invalid account type' });
        }

        const { password_hash, citizens, residents, ...userRest } = newUser;
        const flatUser = {
            ...(citizens || residents || {}),
            ...userRest
        };

        res.json({ success: true, user: flatUser });
    } catch (err) {
        console.error('Error during signup:', err);
        res.status(500).json({ error: 'Signup failed', details: err.message });
    }
});

// Admin endpoint to register a new citizen
app.post('/api/admin/register-citizen', authorizeRoles('admin', 'Immigration_Officer', 'Immigration_Department_Manager'), async (req, res) => {
    const { fullName, dob, gender, phone, email, address, maritalStatus, personal_photo } = req.body;

    // Optional: add authorization check here to ensure req.user is an admin

    try {
        // Validation
        validateText(fullName, 'Full Name');
        validateDate(dob, 'Date of Birth', false, true);
        
        if (!['male', 'female'].includes(gender)) {
            throw new Error('Invalid gender value');
        }
        
        if (phone) {
            validatePhone(phone, 'Phone Number');
        }
        
        if (email) {
            validateEmail(email, 'Email');
        }
        
        if (address) {
            validateText(address, 'Address');
        }
        
        if (maritalStatus && !['single', 'married', 'divorced', 'widowed'].includes(maritalStatus)) {
            throw new Error('Invalid marital status');
        }

        // Generating an 11-digit unique national number
        let nationalNumber = '';
        let isUnique = false;

        while (!isUnique) {
            // Generate a random 11 digit number (starting with 1-9 to avoid leading zeros)
            nationalNumber = Math.floor(10000000000 + Math.random() * 90000000000).toString();

            // Checking if it already exists
            const existingCitizen = await prisma.citizens.findUnique({
                where: { national_number: nationalNumber }
            });

            if (!existingCitizen) {
                isUnique = true;
            }
        }

        const newCitizen = await prisma.citizens.create({
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

        console.log(`[Success] Citizen registered successfully with National Number: ${nationalNumber}`);
        try {
            await prisma.system_logs.create({
                data: {
                    event_type: 'Registration',
                    module_name: 'Admin System',
                    description: `Action: Citizen Registered Successfully. National Number: ${nationalNumber}`,
                    metadata: JSON.stringify({ name: fullName }),
                    created_at: new Date()
                }
            });
        } catch(e) { console.error('Failed to log citizen registration:', e.message); }

        res.json({
            success: true,
            message: 'Citizen registered successfully. Note: Account will be created when ID is issued.',
            citizen: newCitizen
        });

    } catch (error) {
        console.error(`[Failure] Error registering citizen: ${error.message}`);
        try {
            await prisma.system_logs.create({
                data: {
                    event_type: 'Registration Error',
                    module_name: 'Admin System',
                    description: `Action: Citizen Registration Failed. Error: ${error.message}`,
                    created_at: new Date()
                }
            });
        } catch(e) {}
        res.status(400).json({ error: error.message || 'Failed to register citizen', details: error.message });
    }
});

// Admin endpoint to register a new resident
app.post('/api/admin/register-resident', authorizeRoles('admin', 'Immigration_Officer', 'Immigration_Department_Manager'), async (req, res) => {
    const { fullName, dob, gender, nationality, passportNumber, visaType, sponsorName, phone, responsiblePersonPhone, email, address, personal_photo } = req.body;

    // Optional: authorization check here

    try {
        // Validation
        validateText(fullName, 'Full Name');
        validateDate(dob, 'Date of Birth', false, true);
        
        if (!['male', 'female'].includes(gender)) {
            throw new Error('Invalid gender value');
        }
        
        validateText(nationality, 'Nationality');
        
        if (passportNumber) {
            const passportRegex = /^[A-Za-z0-9]+$/;
            if (!passportRegex.test(passportNumber)) {
                throw new Error('Passport number should only contain letters and numbers');
            }
            if (passportNumber.length < 6 || passportNumber.length > 15) {
                throw new Error('Passport number must be between 6-15 characters');
            }
        }
        
        if (visaType) {
            validateText(visaType, 'Visa Type');
        }
        
        if (sponsorName) {
            validateText(sponsorName, 'Sponsor Name');
        }
        
        if (phone) {
            validatePhone(phone, 'Phone Number');
        }
        
        if (responsiblePersonPhone) {
            validatePhone(responsiblePersonPhone, 'Responsible Person Phone');
        }
        
        if (email) {
            validateEmail(email, 'Email');
        }
        
        if (address) {
            validateText(address, 'Address');
        }

        // Generating an 11-digit unique residence number
        let residenceNumber = '';
        let isUnique = false;

        while (!isUnique) {
            residenceNumber = Math.floor(10000000000 + Math.random() * 90000000000).toString();

            const existingResident = await prisma.residents.findUnique({
                where: { residence_number: residenceNumber }
            });

            if (!existingResident) {
                isUnique = true;
            }
        }

        const newResident = await prisma.residents.create({
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

        console.log(`[Success] Resident registered successfully with Residence Number: ${residenceNumber}`);
        try {
            await prisma.system_logs.create({
                data: {
                    event_type: 'Registration',
                    module_name: 'Admin System',
                    description: `Action: Resident Registered Successfully. Residence Number: ${residenceNumber}`,
                    metadata: JSON.stringify({ name: fullName, nationality }),
                    created_at: new Date()
                }
            });
        } catch(e) { console.error('Failed to log resident registration:', e.message); }

        res.json({
            success: true,
            message: 'Resident registered successfully. Note: Account will be created when ID is issued.',
            resident: newResident
        });

    } catch (error) {
        console.error(`[Failure] Error registering resident: ${error.message}`);
        try {
            await prisma.system_logs.create({
                data: {
                    event_type: 'Registration Error',
                    module_name: 'Admin System',
                    description: `Action: Resident Registration Failed. Error: ${error.message}`,
                    created_at: new Date()
                }
            });
        } catch(e) {}
        res.status(400).json({ error: error.message || 'Failed to register resident', details: error.message });
    }
});

// Admin endpoint to resend credentials
app.post('/api/admin/resend-credentials', authorizeRoles('admin', 'Immigration_Officer', 'Immigration_Department_Manager'), async (req, res) => {
    const { username } = req.body;
    try {
        const user = await prisma.users.findUnique({
            where: { username }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const newPassword = generateTempPassword();

        await prisma.users.update({
            where: { username },
            data: { 
                password_hash: newPassword,
                account_status: 'Pending Password Change'
            }
        });
        
        const setupToken = crypto.randomBytes(32).toString('hex');
        setupTokenStore.set(setupToken, {
            userId: user.user_id.toString(),
            username: user.username,
            email: user.email,
            expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
            used: false
        });
        
        try {
            await prisma.system_logs.create({
                data: {
                    event_type: 'Authentication',
                    module_name: 'Admin System',
                    description: 'Action: Password Setup Link Generated',
                    user_id: user.user_id.toString(),
                    username: user.username,
                    account_type: user.account_type,
                    created_at: new Date()
                }
            });
        } catch(e) {}

        const emailSent = await sendCredentialsEmail(user.email, user.username, newPassword, setupToken);

        if (emailSent) {
            try {
                await prisma.system_logs.create({
                    data: {
                        event_type: 'Authentication',
                        module_name: 'Admin System',
                        description: 'Action: Password Setup Email Sent',
                        user_id: user.user_id.toString(),
                        username: user.username,
                        account_type: user.account_type,
                        created_at: new Date()
                    }
                });
            } catch(e) {}
            return res.json({ success: true, message: 'Credentials regenerated and setup email sent.' });
        } else {
            return res.status(500).json({ success: false, message: 'Password regenerated but failed to send email.' });
        }
    } catch (e) {
        console.error('Error resending credentials:', e);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

// Admin endpoint to issue a new National/Residence ID Card
app.post('/api/admin/issue-id-card', authorizeRoles('admin', 'Immigration_Officer', 'Immigration_Department_Manager'), async (req, res) => {
    const { referenceNumber, personal_photo } = req.body;

    try {
        // Step 1: Check if it's a citizen or resident by attempting to find both
        const citizen = await prisma.citizens.findUnique({ where: { national_number: referenceNumber } });
        const resident = await prisma.residents.findUnique({ where: { residence_number: referenceNumber } });

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
            existingCards = await prisma.citizen_id_cards.findMany({
                where: { citizen_id: personIdValue },
                orderBy: { issue_number: 'desc' }
            });
        } else {
            existingCards = await prisma.resident_id_cards.findMany({
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
            newIdCard = await prisma.citizen_id_cards.create({
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
            newIdCard = await prisma.resident_id_cards.create({
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

        await prisma.print_queue.create({
            data: {
                document_type: 'National ID',
                document_number: referenceNumber,
                applicant_name: citizen ? citizen.full_name : resident.full_name,
                request_number: referenceNumber,
                status: 'pending'
            }
        });

        let generatedUsername = null;
        let generatedPassword = null;
        let emailSent = false;
        let finalEmail = citizen ? citizen.email : resident.email;
        
        // Check if user already exists
        const existingUser = await prisma.users.findUnique({
            where: { username: referenceNumber }
        });
        
        if (!existingUser) {
            generatedUsername = referenceNumber;
            generatedPassword = generateTempPassword();
            
            if (!finalEmail) {
                finalEmail = `${referenceNumber}@${idType}.gov.so`;
            }

            // Check if email already exists in User table to avoid P2002
            const existingEmailUser = await prisma.users.findUnique({ where: { email: finalEmail } });
            if (existingEmailUser) {
                finalEmail = `${referenceNumber}_${Date.now().toString().slice(-4)}@${idType}.gov.so`;
            }
            
            let newUser;
            try {
                newUser = await prisma.users.create({
                    data: {
                        citizen_id: citizen ? citizen.citizen_id : undefined,
                        resident_id: resident ? resident.resident_id : undefined,
                        username: generatedUsername,
                        email: finalEmail,
                        password_hash: generatedPassword,
                        account_type: idType,
                        account_status: 'Pending Password Change'
                    }
                });
            } catch (userCreateErr) {
                console.error('Failed to auto-create user (may exist already):', userCreateErr);
                // We shouldn't stop ID card generation if user creation failed unpredictably
            }
            
            if (newUser) {
                try {
                    await prisma.system_logs.create({
                        data: {
                            event_type: 'User Management',
                            module_name: 'Admin System',
                            description: 'Action: User Account Created',
                            user_id: newUser.user_id.toString(),
                            username: newUser.username,
                            account_type: idType,
                            created_at: new Date()
                        }
                    });
                } catch (e) {}
            
                const setupToken = crypto.randomBytes(32).toString('hex');
                setupTokenStore.set(setupToken, {
                    userId: newUser.user_id.toString(),
                    username: newUser.username,
                    email: newUser.email,
                    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
                    used: false
                });
                
                try {
                    await prisma.system_logs.create({
                        data: {
                            event_type: 'Authentication',
                            module_name: 'Admin System',
                            description: 'Action: Password Setup Link Generated',
                            user_id: newUser.user_id.toString(),
                            username: newUser.username,
                            account_type: idType,
                            created_at: new Date()
                        }
                    });
                } catch(e) {}

                emailSent = await sendCredentialsEmail(finalEmail, generatedUsername, generatedPassword, setupToken);
                
                if (emailSent) {
                    try {
                        await prisma.system_logs.create({
                            data: {
                                event_type: 'Authentication',
                                module_name: 'Admin System',
                                description: 'Action: Password Setup Email Sent',
                                user_id: newUser.user_id.toString(),
                                username: newUser.username,
                                account_type: idType,
                                created_at: new Date()
                            }
                        });
                    } catch (e) {}
                }
            }
        }
        
        // Remove the block that returns success: false if email fails, 
        // to ensure ID generation succeeds regardless of SMTP configuration.

        res.json({
            success: true,
            message: `${idType === 'citizen' ? 'National' : 'Residence'} ID Card issued successfully. Sent to Printing Queue.${!existingUser ? ' Account generated and credentials sent.' : ''}`,
            idCard: newIdCard,
            person: citizens || residents,
            generated_username: generatedUsername,
            generated_password: generatedPassword,
            email_sent: emailSent
        });

    } catch (error) {
        console.error('Error issuing ID card:', error);
        res.status(500).json({ error: 'Failed to issue ID card', details: error.message });
    }
});

// Admin endpoint: Renew ID Card
app.post('/api/admin/renew-id', authorizeRoles('admin', 'Immigration_Officer', 'Immigration_Department_Manager'), async (req, res) => {
    const { referenceNumber, applicationId, personal_photo } = req.body;

    try {
        const citizen = await prisma.citizens.findUnique({ where: { national_number: referenceNumber } });
        const resident = await prisma.residents.findUnique({ where: { residence_number: referenceNumber } });

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

        // Admin Validation Rules
        const activeCard = citizen 
            ? await prisma.citizen_id_cards.findFirst({ where: { citizen_id: personIdValue }, orderBy: { issue_date: 'desc' } })
            : await prisma.resident_id_cards.findFirst({ where: { resident_id: personIdValue }, orderBy: { issue_date: 'desc' } });
            
        if (!activeCard) {
            return res.status(400).json({ success: false, message: 'National ID renewal is not available because no active National ID record was found.' });
        }

        const now = new Date();
        const twoYearsFromNow = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate());
        if (new Date(activeCard.expiry_date) > twoYearsFromNow) {
            return res.status(400).json({ success: false, message: 'National ID renewal is only allowed when the card has less than 2 years remaining before expiration.' });
        }

        // Step 1: Mark all existing active cards as expired/cancelled
        if (citizen) {
            await prisma.citizen_id_cards.updateMany({
                where: { citizen_id: personIdValue, status: 'active' },
                data: { status: 'expired' }
            });
        } else {
            await prisma.resident_id_cards.updateMany({
                where: { resident_id: personIdValue, status: 'active' },
                data: { status: 'expired' }
            });
        }

        // Step 2: Determine new issue number
        let existingCards;
        if (citizen) {
            existingCards = await prisma.citizen_id_cards.findMany({
                where: { citizen_id: personIdValue },
                orderBy: { issue_number: 'desc' }
            });
        } else {
            existingCards = await prisma.resident_id_cards.findMany({
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
            newIdCard = await prisma.citizen_id_cards.create({
                data: {
                    citizen_id: personIdValue,
                    issue_number: newIssueNumber,
                    issue_date: issueDate,
                    expiry_date: expiryDate,
                    status: 'active'
                }
            });
        } else {
            newIdCard = await prisma.resident_id_cards.create({
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
            await prisma.applications.update({
                where: { application_id: BigInt(applicationId) },
                data: { status: 'printing_queue' }
            });
        }

        // Record Revenue for Renewal ($100)
        await prisma.revenue.create({
            data: {
                transaction_type: 'National ID',
                service_name: 'National ID Renewal',
                amount: 100.00,
                applicant_name: citizen ? citizen.full_name : resident.full_name,
                id_number: referenceNumber,
                application_id: applicationId && applicationId !== 'null' ? String(applicationId) : referenceNumber,
                payment_method: 'card',
                status: 'completed'
            }
        }).catch(() => null);

        await prisma.print_queue.create({
            data: {
                document_type: 'National ID',
                document_number: referenceNumber,
                applicant_name: citizen ? citizen.full_name : resident.full_name,
                request_number: String(applicationId && applicationId !== 'null' ? applicationId : referenceNumber),
                status: 'pending'
            }
        });

        res.json({
            success: true,
            message: 'Identity renewed successfully. Sent to Printing Queue.',
            idCard: newIdCard,
            person: citizens || residents
        });
    } catch (error) {
        console.error('Error renewing ID:', error);
        res.status(500).json({ error: 'Failed to renew identity', details: error.message });
    }
});

// Admin endpoint: Issue New Passport
app.post('/api/admin/issue-passport', authorizeRoles('admin', 'Immigration_Officer', 'Immigration_Department_Manager'), async (req, res) => {
    const { referenceNumber, passportType, applicationId, personal_photo } = req.body;

    try {
        const citizen = await prisma.citizens.findUnique({ where: { national_number: referenceNumber } });

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

        const newPassport = await prisma.passports.create({
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
            await prisma.applications.update({
                where: { application_id: BigInt(applicationId) },
                data: { status: 'printing_queue' }
            });
        }

        await prisma.print_queue.create({
            data: {
                document_type: 'Passport',
                document_number: passportNumber,
                applicant_name: citizen.full_name,
                request_number: String(applicationId && applicationId !== 'null' ? applicationId : referenceNumber),
                status: 'pending'
            }
        });

        res.json({
            success: true,
            message: 'Passport issued successfully. Sent to Printing Queue.',
            passport: newPassport,
            person: citizen
        });
    } catch (error) {
        console.error('Error issuing passport:', error);
        res.status(500).json({ error: 'Failed to issue passport', details: error.message });
    }
});

// Admin endpoint: Renew Passport
app.post('/api/admin/renew-passport', authorizeRoles('admin', 'Immigration_Officer', 'Immigration_Department_Manager'), async (req, res) => {
    const { referenceNumber, passportType, applicationId, personal_photo } = req.body;

    try {
        const citizen = await prisma.citizens.findUnique({ where: { national_number: referenceNumber } });

        if (!citizen) {
            return res.status(404).json({ success: false, message: 'Citizen not found.' });
        }

        // Update photo if provided
        if (personal_photo) {
            await prisma.$executeRawUnsafe(`UPDATE citizens SET photo = ? WHERE citizen_id = ?`, personal_photo, citizen.citizen_id);
            citizen.photo = personal_photo;
        }

        // Admin Validation Rules
        const existingPassport = await prisma.passports.findFirst({
            where: { citizen_id: citizen.citizen_id },
            orderBy: { issue_date: 'desc' }
        });

        if (!existingPassport) {
            return res.status(400).json({ success: false, message: 'Passport renewal is not available because no active passport record was found.' });
        }

        const now = new Date();
        const threeYearsFromNow = new Date(now.getFullYear() + 3, now.getMonth(), now.getDate());
        if (new Date(existingPassport.expiry_date) > threeYearsFromNow) {
            return res.status(400).json({ success: false, message: 'Passport renewal is only allowed when the passport has less than 3 years remaining before expiration.' });
        }

        // Step 1: Mark all existing active passports as expired
        await prisma.passports.updateMany({
            where: { citizen_id: citizen.citizen_id, status: 'active' },
            data: { status: 'expired' }
        });

        // Step 2: Create new passport
        const passportNumber = `P${Math.floor(10000000 + Math.random() * 90000000).toString()}`;
        const issueDate = new Date();
        const expiryDate = new Date();
        expiryDate.setFullYear(issueDate.getFullYear() + 5);

        const newPassport = await prisma.passports.create({
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
            await prisma.applications.update({
                where: { application_id: BigInt(applicationId) },
                data: { status: 'printing_queue' }
            });
        }

        // Record Revenue for Renewal ($100)
        await prisma.revenue.create({
            data: {
                transaction_type: 'Passport',
                service_name: 'Passport Renewal',
                amount: 100.00,
                applicant_name: citizen.full_name,
                id_number: referenceNumber,
                application_id: applicationId && applicationId !== 'null' ? String(applicationId) : referenceNumber,
                payment_method: 'card',
                status: 'completed'
            }
        }).catch(() => null);

        await prisma.print_queue.create({
            data: {
                document_type: 'Passport',
                document_number: passportNumber,
                applicant_name: citizen.full_name,
                request_number: String(applicationId && applicationId !== 'null' ? applicationId : referenceNumber),
                status: 'pending'
            }
        });

        res.json({
            success: true,
            message: 'Passport renewed successfully. Sent to Printing Queue.',
            passport: newPassport,
            person: citizen
        });
    } catch (error) {
        console.error('Error renewing passport:', error);
        res.status(500).json({ error: 'Failed to renew passport', details: error.message });
    }
});

// Admin endpoint to verify passport renewal data
app.get('/api/admin/verify-passport-renewal/:ref', authorizeRoles('admin', 'Immigration_Officer', 'Immigration_Department_Manager'), async (req, res) => {
    const { ref } = req.params;
    try {
        const citizen = await prisma.citizens.findFirst({
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

        const passport = citizen.passports[0];
        if (!passport) {
            return res.status(400).json({ success: false, message: 'Passport renewal is not available because no active passport record was found.' });
        }

        const now = new Date();
        const threeYearsFromNow = new Date(now.getFullYear() + 3, now.getMonth(), now.getDate());
        if (new Date(passport.expiry_date) > threeYearsFromNow) {
            return res.status(400).json({ success: false, message: 'Passport renewal is only allowed when the passport has less than 3 years remaining before expiration.' });
        }

        res.json({ success: true, citizen });
    } catch (error) {
        console.error('Error verifying passport renewal:', error);
        res.status(500).json({ success: false, message: 'Server error.', details: error.message });
    }
});

// Admin endpoint to search Identity (Citizen or Resident)
app.get('/api/admin/search-id', authorizeRoles('admin', 'Immigration_Officer', 'Immigration_Department_Manager'), async (req, res) => {
    const { query } = req.query;
    if (!query) return res.status(400).json({ success: false, message: 'Search query is required' });

    try {
        // Search citizens
        const citizens = await prisma.citizens.findMany({
            where: {
                OR: [
                    { national_number: { contains: query } },
                    { full_name: { contains: query } }
                ]
            },
            include: { citizen_id_cards: { orderBy: { issue_date: 'desc' } } }
        });

        // Search residents
        const residents = await prisma.residents.findMany({
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
app.get('/api/admin/search-passport', authorizeRoles('admin', 'Immigration_Officer', 'Immigration_Department_Manager'), async (req, res) => {
    const { query } = req.query;
    if (!query) return res.status(400).json({ success: false, message: 'Search query is required' });

    try {
        const citizens = await prisma.citizens.findMany({
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
        const applicantIdBigInt = BigInt(applicant_id);

        // Validation Rules
        const now = new Date();
        const twoYearsFromNow = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate());
        const threeYearsFromNow = new Date(now.getFullYear() + 3, now.getMonth(), now.getDate());

        if (service_type === 'ID_RENEWAL' || service_type === 'ID_REPLACEMENT') {
            let idCard;
            if (applicant_type === 'citizen') {
                idCard = await prisma.citizen_id_cards.findFirst({
                    where: { citizen_id: applicantIdBigInt },
                    orderBy: { issue_date: 'desc' }
                });
            } else if (applicant_type === 'resident') {
                idCard = await prisma.resident_id_cards.findFirst({
                    where: { resident_id: applicantIdBigInt },
                    orderBy: { issue_date: 'desc' }
                });
            }

            if (!idCard) {
                return res.status(400).json({ 
                    success: false, 
                    error: true,
                    message: service_type === 'ID_RENEWAL' 
                        ? 'National ID renewal is not available because no active National ID record was found.' 
                        : 'National ID replacement is not available because no National ID record was found.'
                });
            }

            if (service_type === 'ID_RENEWAL') {
                if (new Date(idCard.expiry_date) > twoYearsFromNow) {
                    return res.status(400).json({ 
                        success: false, 
                        error: true,
                        message: 'National ID renewal is only allowed when the card has less than 2 years remaining before expiration.'
                    });
                }
            }
        }

        if (service_type === 'PASSPORT_RENEWAL' || service_type === 'PASSPORT_REPLACEMENT') {
            if (applicant_type !== 'citizen') {
                return res.status(400).json({ success: false, error: true, message: 'Only citizens can apply for passport services.' });
            }

            const passport = await prisma.passports.findFirst({
                where: { citizen_id: applicantIdBigInt },
                orderBy: { issue_date: 'desc' }
            });

            if (!passport) {
                return res.status(400).json({ 
                    success: false, 
                    error: true,
                    message: service_type === 'PASSPORT_RENEWAL'
                        ? 'Passport renewal is not available because no active passport record was found.'
                        : 'Lost passport replacement is not available because no passport record was found.'
                });
            }

            if (service_type === 'PASSPORT_RENEWAL') {
                if (new Date(passport.expiry_date) > threeYearsFromNow) {
                    return res.status(400).json({ 
                        success: false, 
                        error: true,
                        message: 'Passport renewal is only allowed when the passport has less than 3 years remaining before expiration.'
                    });
                }
            }
        }
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

        const newRequest = await prisma.applications.create({
            data
        });

        if (personal_photo) {
            await prisma.$executeRawUnsafe(`UPDATE applications SET personal_photo = ? WHERE application_id = ?`, personal_photo, newRequest.application_id);
        }

        notifyUser(applicant_id, applicant_type, 'Request Submitted', `Your request for ${service_type.replace(/_/g, ' ')} has been successfully submitted. Ref: REQ-${newRequest.application_id}`, 'request_submitted');
        notifyStaff('New Request Submitted', `A new ${service_type.replace(/_/g, ' ')} request (REQ-${newRequest.application_id}) has been submitted and requires review.`, 'staff_request_submitted');

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
        const requests = await prisma.applications.findMany({
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
app.get('/api/admin/requests', authorizeRoles('admin', 'Immigration_Officer', 'Immigration_Department_Manager'), async (req, res) => {
    try {
        const requests = await prisma.applications.findMany({
            include: {
                citizens: true,
                residents: true
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
app.put('/api/admin/requests/:id', authorizeRoles('admin', 'Immigration_Officer', 'Immigration_Department_Manager'), async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        // First, fetch the application with citizen/resident data
        const application = await prisma.applications.findUnique({
            where: { application_id: BigInt(id) },
            include: { citizens: true, residents: true }
        });

        if (!application) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        const isApproving = status === 'approved';
        const serviceType = application.service_type;
        const isReplacement = serviceType === 'PASSPORT_REPLACEMENT' || serviceType === 'ID_REPLACEMENT';
        const isBirthReprint = serviceType === 'BIRTH_CERTIFICATE_REPRINT';

        // For replacements being approved: auto-route directly to printing queue
        if (isApproving && (isReplacement || isBirthReprint)) {
            const applicantName = application.citizens?.full_name || application.residents?.full_name || 'Unknown';
            const docNumber = application.citizens?.national_number || application.residents?.residence_number || id.toString();
            const docType = isBirthReprint ? 'Birth Certificate' : (serviceType === 'PASSPORT_REPLACEMENT' ? 'Passport (Replacement)' : 'National ID (Replacement)');

            // Move application straight to printing_queue
            const updated = await prisma.applications.update({
                where: { application_id: BigInt(id) },
                data: {
                    status: 'printing_queue',
                    approval_date: new Date()
                }
            });

            // Create a PrintQueue record automatically if it doesn't already exist
            const existingPrintQueue = await prisma.print_queue.findFirst({
                where: { request_number: id.toString() }
            });
            if (!existingPrintQueue) {
                await prisma.print_queue.create({
                    data: {
                        document_type: docType,
                        document_number: docNumber,
                        applicant_name: applicantName,
                        request_number: id.toString(),
                        status: 'pending'
                    }
                });
            }

            // Record revenue for fee
            await prisma.revenue.create({
                data: {
                    transaction_type: isBirthReprint ? 'Health' : (serviceType === 'PASSPORT_REPLACEMENT' ? 'Passport' : 'National ID'),
                    service_name: isBirthReprint ? 'Birth Certificate Reprint' : (serviceType === 'PASSPORT_REPLACEMENT' ? 'Lost Passport Replacement' : 'Lost National ID Replacement'),
                    amount: isBirthReprint ? 10.00 : 50.00,
                    applicant_name: applicantName,
                    id_number: docNumber,
                    application_id: id.toString(),
                    payment_method: 'cash',
                    status: 'completed'
                }
            }).catch(() => null);

            // Log the approval
            await createLog({
                event_type: 'REQUEST_APPROVED',
                module_name: 'Requests',
                description: `${docType} replacement request approved for ${applicantName} (${docNumber}). Auto-queued for printing.`,
                ip_address: req.ip,
                metadata: { application_id: id, service_type: serviceType, applicant: applicantName }
            });

            notifyUser(application.citizen_id || application.resident_id, application.applicant_type, 'Request Approved', `Your request (${docType}) has been approved.`, 'request_approved');
            notifyUser(application.citizen_id || application.resident_id, application.applicant_type, 'Sent to Printing Queue', `Your request (${docType}) has been moved to the printing queue.`, 'request_printing');
            notifyStaff('Request Ready for Printing', `${docType} request (${id}) for ${applicantName} is queued for printing.`, 'staff_printing_queue');

            return res.json({
                success: true,
                request: JSON.parse(JSON.stringify(updated, (key, value) => typeof value === 'bigint' ? value.toString() : value)),
                auto_queued: true,
                message: 'Request approved and automatically sent to Printing Queue.'
            });
        }

        const isBirthPdf = serviceType === 'BIRTH_CERTIFICATE_PDF';
        
        // For Birth Certificate PDF being approved: auto-route directly to completed
        if (isApproving && isBirthPdf) {
            const applicantNameOther = application.citizens?.full_name || application.residents?.full_name || 'Unknown';
            const updated = await prisma.applications.update({
                where: { application_id: BigInt(id) },
                data: {
                    status: 'completed',
                    approval_date: new Date()
                }
            });

            await createLog({
                event_type: 'REQUEST_APPROVED',
                module_name: 'Requests',
                description: `Birth Certificate PDF request approved and generated for ${applicantNameOther}.`,
                ip_address: req.ip,
                metadata: { application_id: id, service_type: serviceType }
            });

            notifyUser(application.citizen_id || application.resident_id, application.applicant_type, 'Request Approved', 'Your Birth Certificate PDF request has been approved.', 'request_approved');
            notifyUser(application.citizen_id || application.resident_id, application.applicant_type, 'PDF Generated', 'Your official Birth Certificate PDF has been generated successfully.', 'pdf_generated');
            notifyUser(application.citizen_id || application.resident_id, application.applicant_type, 'Request Completed', 'Your request is completed and ready for download.', 'request_completed');

            notifyStaff('PDF Generated', `Birth Certificate PDF generated for ${applicantNameOther}.`, 'staff_pdf_generated');

            return res.json({
                success: true,
                request: JSON.parse(JSON.stringify(updated, (key, value) => typeof value === 'bigint' ? value.toString() : value)),
                auto_completed: true,
                message: 'Request approved and PDF generated successfully.'
            });
        }

        const isIdIssuanceOrRenewal = serviceType === 'ID_RENEWAL' || serviceType === 'NATIONAL_ID' || serviceType === 'NEW_NATIONAL_ID';

        if (isApproving && isIdIssuanceOrRenewal) {
            const applicantName = application.citizens?.full_name || application.residents?.full_name || 'Unknown';
            let docNumber = application.citizens?.national_number || application.residents?.residence_number;
            const docType = 'National ID';
            const personIdValue = application.citizen_id || application.resident_id;
            const idType = application.citizen_id ? 'citizen' : 'resident';

            // National ID Number Generation: Ensure 11-digit Unique ID is generated properly as a string
            if (!docNumber) {
                let isUnique = false;
                while (!isUnique) {
                    docNumber = Math.floor(10000000000 + Math.random() * 90000000000).toString();
                    const existing = idType === 'citizen' 
                        ? await prisma.citizens.findUnique({ where: { national_number: docNumber } })
                        : await prisma.residents.findUnique({ where: { residence_number: docNumber } });
                    if (!existing) isUnique = true;
                }
                
                if (idType === 'citizen') {
                    await prisma.citizens.update({ where: { citizen_id: personIdValue }, data: { national_number: docNumber }});
                } else {
                    await prisma.residents.update({ where: { resident_id: personIdValue }, data: { residence_number: docNumber }});
                }
            }

            // Create new ID card and expire old ones
            const issueDate = new Date();
            const expiryDate = new Date();
            expiryDate.setFullYear(issueDate.getFullYear() + (idType === 'citizen' ? 10 : 5));

            let newIssueNumber = 1;
            if (idType === 'citizen') {
                const existingCards = await prisma.citizen_id_cards.findMany({ where: { citizen_id: personIdValue }, orderBy: { issue_date: 'desc' } });
                if (existingCards.length > 0) {
                    newIssueNumber = existingCards[0].issue_number + 1;
                    await prisma.citizen_id_cards.updateMany({ where: { citizen_id: personIdValue, status: 'active' }, data: { status: 'expired' } });
                }
                await prisma.citizen_id_cards.create({
                    data: {
                        citizen_id: personIdValue,
                        issue_number: newIssueNumber,
                        issue_date: issueDate,
                        expiry_date: expiryDate,
                        status: 'active'
                    }
                });
            } else {
                const existingCards = await prisma.resident_id_cards.findMany({ where: { resident_id: personIdValue }, orderBy: { issue_date: 'desc' } });
                if (existingCards.length > 0) {
                    newIssueNumber = existingCards[0].issue_number + 1;
                    await prisma.resident_id_cards.updateMany({ where: { resident_id: personIdValue, status: 'active' }, data: { status: 'expired' } });
                }
                await prisma.resident_id_cards.create({
                    data: {
                        resident_id: personIdValue,
                        issue_number: newIssueNumber,
                        issue_date: issueDate,
                        expiry_date: expiryDate,
                        status: 'active'
                    }
                });
            }

            // Move application straight to printing_queue
            const updated = await prisma.applications.update({
                where: { application_id: BigInt(id) },
                data: {
                    status: 'printing_queue',
                    approval_date: new Date()
                }
            });

            const existingPrintQueue2 = await prisma.print_queue.findFirst({
                where: { request_number: id.toString() }
            });
            if (!existingPrintQueue2) {
                await prisma.print_queue.create({
                    data: {
                        document_type: docType,
                        document_number: docNumber,
                        applicant_name: applicantName,
                        request_number: id.toString(),
                        status: 'pending'
                    }
                });
            }

            await prisma.revenue.create({
                data: {
                    transaction_type: 'National ID',
                    service_name: serviceType === 'ID_RENEWAL' ? 'National ID Renewal' : 'New National ID',
                    amount: 50.00,
                    applicant_name: applicantName,
                    id_number: docNumber,
                    application_id: id.toString(),
                    payment_method: 'card',
                    status: 'completed'
                }
            }).catch(() => null);

            await createLog({
                event_type: 'REQUEST_APPROVED',
                module_name: 'Requests',
                description: `${serviceType} approved for ${applicantName}. New ID Card generated and auto-queued for printing.`,
                ip_address: req.ip,
                metadata: { application_id: id, service_type: serviceType, applicant: applicantName }
            });

            notifyUser(personIdValue, application.applicant_type, 'Request Approved & ID Generated', `Your request (${serviceType}) has been approved and moved to the printing queue.`, 'request_approved');
            notifyStaff('ID Card Ready for Printing', `ID Card for ${applicantName} is queued for printing.`, 'staff_printing_queue');

            return res.json({
                success: true,
                request: JSON.parse(JSON.stringify(updated, (key, value) => typeof value === 'bigint' ? value.toString() : value)),
                auto_queued: true,
                message: 'Request approved, ID Card generated, and sent to Printing Queue.'
            });
        }

        // For all other cases (renewals approval, rejections, etc.)
        const applicantNameOther = application.citizens?.full_name || application.residents?.full_name || 'Unknown';
        const updated = await prisma.applications.update({
            where: { application_id: BigInt(id) },
            data: {
                status,
                approval_date: status === 'approved' ? new Date() : null
            }
        });

        // Log the action
        await createLog({
            event_type: status === 'approved' ? 'REQUEST_APPROVED' : status === 'rejected' ? 'REQUEST_REJECTED' : 'REQUEST_UPDATED',
            module_name: 'Requests',
            description: `Request #${id} (${serviceType}) ${status} for ${applicantNameOther}.`,
            ip_address: req.ip,
            metadata: { application_id: id, service_type: serviceType, status }
        });

        if (status === 'approved') {
            notifyUser(application.citizen_id || application.resident_id, application.applicant_type, 'Request Approved', `Your request (${serviceType}) has been approved.`, 'request_approved');
            notifyStaff('Request Approved', `Request #${id} for ${applicantNameOther} has been approved.`, 'staff_request_approved');
        } else if (status === 'rejected') {
            notifyUser(application.citizen_id || application.resident_id, application.applicant_type, 'Request Rejected', `Your request (${serviceType}) has been rejected.`, 'request_rejected');
        } else if (status === 'printing_queue') {
            notifyUser(application.citizen_id || application.resident_id, application.applicant_type, 'Sent to Printing', `Your request (${serviceType}) is now being printed.`, 'request_printing');
            notifyStaff('Sent to Printing', `Request #${id} is sent to the printing queue.`, 'staff_printing_queue');
        } else if (status === 'under_review') {
            notifyUser(application.citizen_id || application.resident_id, application.applicant_type, 'Under Review', `Your request (${serviceType}) is currently under review.`, 'request_review');
        } else if (status === 'completed') {
            notifyUser(application.citizen_id || application.resident_id, application.applicant_type, 'Request Completed', `Your request (${serviceType}) is completed.`, 'request_completed');
        }

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
        let person = await prisma.citizens.findUnique({ where: { national_number: id_number } });
        let type = 'citizen';

        if (!person) {
            person = await prisma.residents.findUnique({ where: { residence_number: id_number } });
            type = 'resident';
        }

        if (!person) {
            return res.status(404).json({ success: false, message: 'Person not found in national database' });
        }

        // 2. Search in both records tables
        const citizenRecords = await prisma.criminal_records.findMany({
            where: { id_number: id_number }
        });

        const residentRecords = await prisma.resident_criminal_records.findMany({
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

// Admin endpoint: Log a print action
app.post('/api/admin/print-log', authorizeRoles('admin', 'Printing_Officer'), async (req, res) => {
    const { admin_name, document_type, document_number, timestamp } = req.body;
    if (!document_type || !document_number) {
        return res.status(400).json({ success: false, message: 'Missing document info' });
    }
    
    try {
        const log = await prisma.system_logs.create({
            data: {
                event_type: 'PRINT_DOCUMENT',
                module_name: 'Printing',
                action: 'Printed Document',
                description: `Admin ${admin_name || 'UnknownAdmin'} printed ${document_type} #${document_number}`,
                username: admin_name,
                ip_address: req.ip,
                created_at: timestamp ? new Date(timestamp) : new Date()
            }
        });
        res.json({ success: true, log });
    } catch (e) {
        res.status(500).json({ success: false });
    }
});

// Admin endpoint: Get all print logs
app.get('/api/admin/print-logs', authorizeRoles('admin', 'Printing_Officer'), async (req, res) => {
    try {
        const logs = await prisma.system_logs.findMany({
            where: { event_type: 'PRINT_DOCUMENT' },
            orderBy: { created_at: 'desc' }
        });
        const formatted = logs.map(l => {
           let docType = 'Unknown';
           let docNum = 'Unknown';
           const m = l.description.match(/printed (.+) #(.+)/);
           if(m) { docType = m[1]; docNum = m[2]; }
           return {
               id: Number(l.log_id),
               admin_name: l.username,
               document_type: docType,
               document_number: docNum,
               timestamp: l.created_at
           };
        });
        res.json({ success: true, logs: formatted });
    } catch (e) {
        res.status(500).json({ success: false });
    }
});

// Admin endpoint: Get Print Queue (Pending)
app.get('/api/admin/print-queue', authorizeRoles('admin', 'Printing_Officer'), async (req, res) => {
    try {
        const queue = await prisma.print_queue.findMany({
            where: { status: 'pending' },
            orderBy: { request_date: 'asc' }
        });
        res.json({ success: true, queue: JSON.parse(JSON.stringify(queue, (key, value) => typeof value === 'bigint' ? value.toString() : value)) });
    } catch (error) {
        console.error('Error fetching print queue:', error);
        res.status(500).json({ error: 'Failed to fetch print queue', details: error.message });
    }
});

// Admin endpoint: Get Print Queue (All)
app.get('/api/admin/print-queue-all', authorizeRoles('admin', 'Printing_Officer'), async (req, res) => {
    try {
        const queue = await prisma.print_queue.findMany({
            orderBy: { request_date: 'desc' }
        });
        res.json({ success: true, queue: JSON.parse(JSON.stringify(queue, (key, value) => typeof value === 'bigint' ? value.toString() : value)) });
    } catch (error) {
        console.error('Error fetching print queue all:', error);
        res.status(500).json({ error: 'Failed to fetch all print queue', details: error.message });
    }
});

// Admin endpoint: Get Print History (Printed)
app.get('/api/admin/print-history', authorizeRoles('admin', 'Printing_Officer'), async (req, res) => {
    try {
        const history = await prisma.print_queue.findMany({
            where: { status: 'printed' },
            orderBy: { print_date: 'desc' }
        });
        res.json({ success: true, history: JSON.parse(JSON.stringify(history, (key, value) => typeof value === 'bigint' ? value.toString() : value)) });
    } catch (error) {
        console.error('Error fetching print history:', error);
        res.status(500).json({ error: 'Failed to fetch print history', details: error.message });
    }
});

// Admin endpoint: Mark as Printed
app.put('/api/admin/mark-printed/:id', authorizeRoles('admin', 'Printing_Officer'), async (req, res) => {
    const { id } = req.params;
    const { printedBy } = req.body;
    try {
        const printRequest = await prisma.print_queue.findUnique({
            where: { print_id: BigInt(id) }
        });

        if (!printRequest) {
            return res.status(404).json({ success: false, message: 'Print request not found' });
        }

        const updated = await prisma.print_queue.update({
            where: { print_id: BigInt(id) },
            data: {
                status: 'printed',
                print_date: new Date(),
                print_time: new Date().toLocaleTimeString(),
                printed_by: printedBy || 'System'
            }
        });

        // Also update the original application to completed if possible
        if (printRequest.request_number) {
            // Check if it's an application ID (numeric)
            if (!isNaN(printRequest.request_number)) {
                const appId = BigInt(printRequest.request_number);
                const app = await prisma.applications.findUnique({ where: { application_id: appId } }).catch(() => null);
                if (app && app.status === 'printing_queue') {
                    await prisma.applications.update({
                        where: { application_id: appId },
                        data: { status: 'completed' }
                    });
                    notifyUser(app.citizen_id || app.resident_id, app.applicant_type, 'Request Completed', `Your request (${app.service_type}) is completed and printed.`, 'request_completed');
                }
            }
        }

        // Log the print action
        await createLog({
            event_type: 'DOCUMENT_PRINTED',
            module_name: 'Printing',
            description: `${printRequest.document_type} printed for ${printRequest.applicant_name} (${printRequest.document_number}) by ${printedBy || 'System'}.`,
            username: printedBy || 'System',
            ip_address: req.ip,
            metadata: { print_id: id, document_type: printRequest.document_type, document_number: printRequest.document_number }
        });

        notifyStaff('Document Printed', `${printRequest.document_type} for ${printRequest.applicant_name} has been printed successfully.`, 'staff_printed');

        res.json({ success: true, message: 'Document marked as printed', printed: JSON.parse(JSON.stringify(updated, (key, value) => typeof value === 'bigint' ? value.toString() : value)) });
    } catch (error) {
        console.error('Error marking printed:', error);
        res.status(500).json({ error: 'Failed to mark as printed', details: error.message });
    }
});

// User Management Page Endpoints
app.get('/api/admin/users', authorizeRoles('admin'), async (req, res) => {
    try {
        const users = await prisma.users.findMany({
            include: { citizens: true, residents: true, employees: true }
        });
        const flatUsers = users.map(user => {
            const { password_hash, citizens, residents, employees, ...rest } = user;
            return {
                ...rest,
                fullName: citizens?.full_name || residents?.full_name || employees?.full_name || user.username
            };
        });
        res.json({ success: true, users: JSON.parse(JSON.stringify(flatUsers, (key, value) => typeof value === 'bigint' ? value.toString() : value)) });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

app.put('/api/admin/users/:id', authorizeRoles('admin'), async (req, res) => {
    const { id } = req.params;
    const { account_type, is_active, password } = req.body;
    try {
        const dataToUpdate = {};
        if (account_type) dataToUpdate.account_type = account_type;
        if (is_active !== undefined) dataToUpdate.is_active = is_active;
        if (password) dataToUpdate.password_hash = password;

        const updated = await prisma.users.update({
            where: { user_id: BigInt(id) },
            data: dataToUpdate
        });

        res.json({ success: true, message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// =====================================
// LOGGING HELPER
// =====================================
const createLog = async ({ event_type, module_name, description, user_id, username, account_type, ip_address, metadata }) => {
    try {
        await prisma.system_logs.create({
            data: {
                event_type: event_type || 'SYSTEM',
                module_name: module_name || 'System',
                description: description || '',
                user_id: user_id ? String(user_id) : null,
                username: username || null,
                account_type: account_type || null,
                ip_address: ip_address || null,
                metadata: metadata ? JSON.stringify(metadata) : null,
            }
        });
    } catch (e) {
        // Non-critical - just log to console if DB logging fails
        console.error('[LOG ERROR]', e.message);
    }
};

// =====================================
// SYSTEM LOGS ENDPOINTS
// =====================================

// Get all logs with filters & pagination
app.get('/api/admin/logs', authorizeRoles('admin'), async (req, res) => {
    try {
        const { page = 1, limit = 50, event_type, module_name, username, account_type, from, to, search } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (event_type) where.event_type = event_type;
        if (module_name) where.module_name = module_name;
        if (username) where.username = { contains: username };
        if (account_type) where.account_type = account_type;
        if (from || to) {
            where.created_at = {};
            if (from) where.created_at.gte = new Date(from);
            if (to) where.created_at.lte = new Date(to + 'T23:59:59');
        }
        if (search) {
            where.OR = [
                { description: { contains: search } },
                { username: { contains: search } },
                { event_type: { contains: search } },
                { module_name: { contains: search } },
            ];
        }

        const [logs, total] = await Promise.all([
            prisma.system_logs.findMany({ where, skip, take: parseInt(limit), orderBy: { created_at: 'desc' } }),
            prisma.system_logs.count({ where })
        ]);

        const serialized = JSON.parse(JSON.stringify(logs, (k, v) => typeof v === 'bigint' ? v.toString() : v));
        res.json({ success: true, logs: serialized, total, pages: Math.ceil(total / parseInt(limit)) });
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ error: 'Failed to fetch logs', details: error.message });
    }
});

// Get distinct event types and modules for filter dropdowns
app.get('/api/admin/logs/meta', authorizeRoles('admin'), async (req, res) => {
    try {
        const [eventTypes, modules, accountTypes] = await Promise.all([
            prisma.system_logs.groupBy({ by: ['event_type'], _count: { log_id: true } }).catch(() => []),
            prisma.system_logs.groupBy({ by: ['module_name'], _count: { log_id: true } }).catch(() => []),
            prisma.system_logs.groupBy({ by: ['account_type'], _count: { log_id: true } }).catch(() => []),
        ]);
        res.json({
            success: true,
            eventTypes: eventTypes.map(e => e.event_type).filter(Boolean),
            modules: modules.map(m => m.module_name).filter(Boolean),
            accountTypes: accountTypes.map(a => a.account_type).filter(Boolean),
        });
    } catch (error) {
        res.json({ success: true, eventTypes: [], modules: [], accountTypes: [] });
    }
});

// =====================================
// REVENUE ENDPOINTS
// =====================================

// Get revenue with filters
app.get('/api/admin/revenue', authorizeRoles('admin'), async (req, res) => {
    try {
        const { from, to, transaction_type, search, page = 1, limit = 50 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const where = { status: 'completed' };

        if (transaction_type) where.transaction_type = transaction_type;
        if (from || to) {
            where.created_at = {};
            if (from) where.created_at.gte = new Date(from);
            if (to) where.created_at.lte = new Date(to + 'T23:59:59');
        }
        if (search) {
            where.OR = [
                { applicant_name: { contains: search } },
                { id_number: { contains: search } },
                { service_name: { contains: search } },
            ];
        }

        const [records, total] = await Promise.all([
            prisma.revenue.findMany({ where, skip, take: parseInt(limit), orderBy: { created_at: 'desc' } }).catch(() => []),
            prisma.revenue.count({ where }).catch(() => 0)
        ]);

        const serialized = JSON.parse(JSON.stringify(records, (k, v) => typeof v === 'bigint' ? v.toString() : v));
        res.json({ success: true, records: serialized, total, pages: Math.ceil(total / parseInt(limit)) });
    } catch (error) {
        res.json({ success: true, records: [], total: 0, pages: 0 });
    }
});

// Revenue statistics summary
app.get('/api/admin/revenue/stats', authorizeRoles('admin'), async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        const safeAgg = async (where) => {
            try {
                const r = await prisma.revenue.aggregate({ where, _sum: { amount: true } });
                return r._sum.amount || 0;
            } catch { return 0; }
        };
        const safeGroup = async () => {
            try {
                return await prisma.revenue.groupBy({ by: ['transaction_type'], where: { status: 'completed' }, _sum: { amount: true }, _count: { revenue_id: true } });
            } catch { return []; }
        };

        const [grandTotal, monthly, yearly, idTotal, passportTotal, renewalTotal, replacementTotal, byType] = await Promise.all([
            safeAgg({ status: 'completed' }),
            safeAgg({ status: 'completed', created_at: { gte: startOfMonth } }),
            safeAgg({ status: 'completed', created_at: { gte: startOfYear } }),
            safeAgg({ status: 'completed', transaction_type: { contains: 'National ID' } }),
            safeAgg({ status: 'completed', transaction_type: { contains: 'Passport' } }),
            safeAgg({ status: 'completed', service_name: { contains: 'Renewal' } }),
            safeAgg({ status: 'completed', service_name: { contains: 'Replacement' } }),
            safeGroup(),
        ]);

        res.json({
            success: true,
            stats: {
                grand_total: grandTotal,
                monthly,
                yearly,
                national_id_total: idTotal,
                passport_total: passportTotal,
                renewal_total: renewalTotal,
                replacement_total: replacementTotal,
                by_type: byType.map(b => ({ type: b.transaction_type, total: b._sum.amount || 0, count: b._count.revenue_id }))
            }
        });
    } catch (error) {
        res.json({ success: true, stats: { grand_total: 0, monthly: 0, yearly: 0, national_id_total: 0, passport_total: 0, renewal_total: 0, replacement_total: 0, by_type: [] } });
    }
});

// =====================================
// DYNAMIC PENDING REQUESTS COUNT
// =====================================
app.get('/api/admin/requests/pending-count', authorizeRoles('admin', 'Immigration_Officer', 'Immigration_Department_Manager'), async (req, res) => {
    try {
        const count = await prisma.applications.count({ where: { status: 'pending' } });
        res.json({ success: true, count });
    } catch (error) {
        res.json({ success: true, count: 0 });
    }
});

// =====================================
// REPORTS ENDPOINTS
// =====================================

// --- National ID Reports ---
app.get('/api/admin/reports/national-id', authorizeRoles('admin'), async (req, res) => {
    try {
        const { from, to, status, search, page = 1, limit = 20, sortBy = 'request_date', sortOrder = 'desc' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const where = {
            service_type: { in: ['NATIONAL_ID', 'RENEWAL', 'ID_REPLACEMENT'] }
        };
        if (status) where.status = status;
        if (from || to) {
            where.request_date = {};
            if (from) where.request_date.gte = new Date(from);
            if (to) where.request_date.lte = new Date(to + 'T23:59:59');
        }
        if (search) {
            where.OR = [
                { citizen: { full_name: { contains: search } } },
                { citizen: { national_number: { contains: search } } },
                { resident: { full_name: { contains: search } } },
            ];
            const searchId = parseInt(search);
            if (!isNaN(searchId)) {
                where.OR.push({ application_id: searchId });
            }
        }

        const orderBy = { [sortBy]: sortOrder };
        const [records, total, newCount, renewalCount, replacementCount, pendingCount, approvedCount, rejectedCount, completedCount] = await Promise.all([
            prisma.applications.findMany({ where, skip, take: parseInt(limit), orderBy, include: { citizens: true, residents: true } }),
            prisma.applications.count({ where }),
            prisma.applications.count({ where: { ...where, service_type: 'NATIONAL_ID' } }),
            prisma.applications.count({ where: { ...where, service_type: 'RENEWAL' } }),
            prisma.applications.count({ where: { ...where, service_type: 'ID_REPLACEMENT' } }),
            prisma.applications.count({ where: { ...where, status: 'pending' } }),
            prisma.applications.count({ where: { ...where, status: 'approved' } }),
            prisma.applications.count({ where: { ...where, status: 'rejected' } }),
            prisma.applications.count({ where: { ...where, status: 'completed' } }),
        ]);

        const serialized = JSON.parse(JSON.stringify(records, (k, v) => typeof v === 'bigint' ? v.toString() : v));
        res.json({ success: true, records: serialized, total, pages: Math.ceil(total / parseInt(limit)), summary: { newCount, renewalCount, replacementCount, pendingCount, approvedCount, rejectedCount, completedCount } });
    } catch (error) {
        console.error('NID report error:', error);
        res.status(500).json({ error: 'Failed to fetch National ID report', details: error.message });
    }
});

// --- Passport Reports ---
app.get('/api/admin/reports/passport', authorizeRoles('admin'), async (req, res) => {
    try {
        const { from, to, status, search, page = 1, limit = 20, sortBy = 'request_date', sortOrder = 'desc' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const where = {
            service_type: { in: ['PASSPORT', 'PASSPORT_RENEWAL', 'PASSPORT_REPLACEMENT'] }
        };
        if (status) where.status = status;
        if (from || to) {
            where.request_date = {};
            if (from) where.request_date.gte = new Date(from);
            if (to) where.request_date.lte = new Date(to + 'T23:59:59');
        }
        if (search) {
            where.OR = [
                { citizen: { full_name: { contains: search } } },
                { citizen: { national_number: { contains: search } } },
            ];
            const searchId = parseInt(search);
            if (!isNaN(searchId)) {
                where.OR.push({ application_id: searchId });
            }
        }

        const orderBy = { [sortBy]: sortOrder };
        const [records, total, newCount, renewalCount, replacementCount, pendingCount, approvedCount, rejectedCount, completedCount] = await Promise.all([
            prisma.applications.findMany({ where, skip, take: parseInt(limit), orderBy, include: { citizens: true, residents: true } }),
            prisma.applications.count({ where }),
            prisma.applications.count({ where: { ...where, service_type: 'PASSPORT' } }),
            prisma.applications.count({ where: { ...where, service_type: 'PASSPORT_RENEWAL' } }),
            prisma.applications.count({ where: { ...where, service_type: 'PASSPORT_REPLACEMENT' } }),
            prisma.applications.count({ where: { ...where, status: 'pending' } }),
            prisma.applications.count({ where: { ...where, status: 'approved' } }),
            prisma.applications.count({ where: { ...where, status: 'rejected' } }),
            prisma.applications.count({ where: { ...where, status: 'completed' } }),
        ]);

        const serialized = JSON.parse(JSON.stringify(records, (k, v) => typeof v === 'bigint' ? v.toString() : v));
        res.json({ success: true, records: serialized, total, pages: Math.ceil(total / parseInt(limit)), summary: { newCount, renewalCount, replacementCount, pendingCount, approvedCount, rejectedCount, completedCount } });
    } catch (error) {
        console.error('Passport report error:', error);
        res.status(500).json({ error: 'Failed to fetch Passport report', details: error.message });
    }
});

// --- Printing Reports ---
app.get('/api/admin/reports/printing', authorizeRoles('admin'), async (req, res) => {
    try {
        const { from, to, status, search, page = 1, limit = 20, sortBy = 'request_date', sortOrder = 'desc' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const where = {};
        if (status) where.status = status;
        if (from || to) {
            where.request_date = {};
            if (from) where.request_date.gte = new Date(from);
            if (to) where.request_date.lte = new Date(to + 'T23:59:59');
        }
        if (search) {
            where.OR = [
                { applicant_name: { contains: search } },
                { document_number: { contains: search } },
                { document_type: { contains: search } },
            ];
        }

        const orderBy = sortBy === 'request_date' ? { request_date: sortOrder } : { print_date: sortOrder };
        const [records, total, pendingCount, printedCount, idCount, passportCount] = await Promise.all([
            prisma.print_queue.findMany({ where, skip, take: parseInt(limit), orderBy }),
            prisma.print_queue.count({ where }),
            prisma.print_queue.count({ where: { ...where, status: 'pending' } }),
            prisma.print_queue.count({ where: { ...where, status: 'printed' } }),
            prisma.print_queue.count({ where: { ...where, document_type: { contains: 'ID' } } }),
            prisma.print_queue.count({ where: { ...where, document_type: { contains: 'Passport' } } }),
        ]);

        const serialized = JSON.parse(JSON.stringify(records, (k, v) => typeof v === 'bigint' ? v.toString() : v));
        res.json({ success: true, records: serialized, total, pages: Math.ceil(total / parseInt(limit)), summary: { pendingCount, printedCount, idCount, passportCount } });
    } catch (error) {
        console.error('Printing report error:', error);
        res.status(500).json({ error: 'Failed to fetch Printing report', details: error.message });
    }
});

// --- User Reports ---
app.get('/api/admin/reports/users', authorizeRoles('admin'), async (req, res) => {
    try {
        const { search, account_type, is_active, page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const where = {};
        if (account_type) where.account_type = account_type;
        if (is_active !== undefined && is_active !== '') where.is_active = is_active === 'true';
        if (search) {
            where.OR = [
                { username: { contains: search } },
                { email: { contains: search } },
            ];
        }

        const orderBy = { [sortBy]: sortOrder };
        const [users, total, activeCount, disabledCount, byType] = await Promise.all([
            prisma.users.findMany({ where, skip, take: parseInt(limit), orderBy, include: { citizens: { select: { full_name: true } }, residents: { select: { full_name: true } }, employees: { select: { full_name: true } } } }),
            prisma.users.count({ where }),
            prisma.users.count({ where: { ...where, is_active: true } }),
            prisma.users.count({ where: { ...where, is_active: false } }),
            prisma.users.groupBy({ by: ['account_type'], _count: { user_id: true } }),
        ]);

        const flatUsers = users.map(u => {
            const { password_hash, citizens, residents, employees, ...rest } = u;
            return { ...rest, full_name: citizens?.full_name || residents?.full_name || employees?.full_name || u.username };
        });

        const serialized = JSON.parse(JSON.stringify(flatUsers, (k, v) => typeof v === 'bigint' ? v.toString() : v));
        const byTypeSer = JSON.parse(JSON.stringify(byType, (k, v) => typeof v === 'bigint' ? v.toString() : v));
        res.json({ success: true, records: serialized, total, pages: Math.ceil(total / parseInt(limit)), summary: { activeCount, disabledCount, byType: byTypeSer } });
    } catch (error) {
        console.error('User report error:', error);
        res.status(500).json({ error: 'Failed to fetch User report', details: error.message });
    }
});

// --- Activity Log Reports ---
app.get('/api/admin/reports/activity-logs', authorizeRoles('admin'), async (req, res) => {
    try {
        const { from, to, event_type, module_name, username, account_type, search, page = 1, limit = 20, sortOrder = 'desc' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const where = {};
        if (event_type) where.event_type = event_type;
        if (module_name) where.module_name = module_name;
        if (username) where.username = { contains: username };
        if (account_type) where.account_type = account_type;
        if (from || to) {
            where.created_at = {};
            if (from) where.created_at.gte = new Date(from);
            if (to) where.created_at.lte = new Date(to + 'T23:59:59');
        }
        if (search) {
            where.OR = [
                { description: { contains: search } },
                { username: { contains: search } },
                { event_type: { contains: search } },
                { module_name: { contains: search } },
            ];
        }

        const [logs, total, eventMeta] = await Promise.all([
            prisma.system_logs.findMany({ where, skip, take: parseInt(limit), orderBy: { created_at: sortOrder } }).catch(() => []),
            prisma.system_logs.count({ where }).catch(() => 0),
            prisma.system_logs.groupBy({ by: ['event_type'], _count: { log_id: true } }).catch(() => []),
        ]);

        const serialized = JSON.parse(JSON.stringify(logs, (k, v) => typeof v === 'bigint' ? v.toString() : v));
        const metaSer = JSON.parse(JSON.stringify(eventMeta, (k, v) => typeof v === 'bigint' ? v.toString() : v));
        res.json({ success: true, records: serialized, total, pages: Math.ceil(total / parseInt(limit)), eventSummary: metaSer });
    } catch (error) {
        res.json({ success: true, records: [], total: 0, pages: 0, eventSummary: [] });
    }
});

// --- Revenue Reports (extended) ---
app.get('/api/admin/reports/revenue', authorizeRoles('admin'), async (req, res) => {
    try {
        const { from, to, transaction_type, search, page = 1, limit = 20, sortOrder = 'desc' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const where = { status: 'completed' };
        if (transaction_type) where.transaction_type = transaction_type;
        if (from || to) {
            where.created_at = {};
            if (from) where.created_at.gte = new Date(from);
            if (to) where.created_at.lte = new Date(to + 'T23:59:59');
        }
        if (search) where.OR = [{ applicant_name: { contains: search } }, { service_name: { contains: search } }, { id_number: { contains: search } }];

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        const safeAgg = async (w) => { try { const r = await prisma.revenue.aggregate({ where: w, _sum: { amount: true } }); return parseFloat(r._sum.amount || 0); } catch { return 0; } };

        const [records, total, grandTotal, monthly, yearly, idRev, passportRev, renewalRev, replacementRev] = await Promise.all([
            prisma.revenue.findMany({ where, skip, take: parseInt(limit), orderBy: { created_at: sortOrder } }).catch(() => []),
            prisma.revenue.count({ where }).catch(() => 0),
            safeAgg({ status: 'completed' }),
            safeAgg({ status: 'completed', created_at: { gte: startOfMonth } }),
            safeAgg({ status: 'completed', created_at: { gte: startOfYear } }),
            safeAgg({ status: 'completed', transaction_type: { contains: 'National ID' } }),
            safeAgg({ status: 'completed', transaction_type: { contains: 'Passport' } }),
            safeAgg({ status: 'completed', service_name: { contains: 'Renewal' } }),
            safeAgg({ status: 'completed', service_name: { contains: 'Replacement' } }),
        ]);

        const serialized = JSON.parse(JSON.stringify(records, (k, v) => typeof v === 'bigint' ? v.toString() : v));
        res.json({
            success: true, records: serialized, total, pages: Math.ceil(total / parseInt(limit)),
            summary: { grandTotal, monthly, yearly, idRev, passportRev, renewalRev, replacementRev }
        });
    } catch (error) {
        res.json({ success: true, records: [], total: 0, pages: 0, summary: { grandTotal: 0, monthly: 0, yearly: 0, idRev: 0, passportRev: 0, renewalRev: 0, replacementRev: 0 } });
    }
});

// =====================================
// NOTIFICATIONS API
// =====================================

app.get('/api/notifications', async (req, res) => {
    try {
        const { user_id, account_type } = req.query;
        if (!user_id || !account_type) return res.status(400).json({ success: false, error: 'User ID and Account Type required' });
        
        let targetUserId = user_id;
        // Optional: If you need to find User ID by citizen_id/resident_id, do it here. 
        // For simplicity, assuming user_id parameter passed represents the actual user.user_id or we lookup.
        const user = await prisma.users.findFirst({
            where: {
                OR: [
                    { user_id: !isNaN(parseInt(user_id)) ? BigInt(user_id) : undefined },
                    { citizen_id: !isNaN(parseInt(user_id)) && account_type === 'citizen' ? BigInt(user_id) : undefined },
                    { resident_id: !isNaN(parseInt(user_id)) && account_type === 'resident' ? BigInt(user_id) : undefined },
                    { employee_id: !isNaN(parseInt(user_id)) && account_type === 'staff' ? BigInt(user_id) : undefined }
                ]
            }
        });

        if (!user) return res.json({ success: true, notifications: [] });

        const notifications = await prisma.notifications.findMany({
            where: { user_id: user.user_id },
            orderBy: { created_at: 'desc' }
        });
        
        const formatted = JSON.parse(JSON.stringify(notifications, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));
        
        res.json({ success: true, notifications: formatted });
    } catch (err) {
        console.error('Fetch notifications error:', err);
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
        res.status(500).json({ success: false, error: 'Failed to mark read' });
    }
});

app.put('/api/notifications/read-all', async (req, res) => {
    try {
        const { user_id, account_type } = req.body;
        if (!user_id) return res.status(400).json({ success: false, error: 'User ID required' });
        
        const user = await prisma.users.findFirst({
            where: {
                OR: [
                    { user_id: !isNaN(parseInt(user_id)) ? BigInt(user_id) : undefined },
                    { citizen_id: !isNaN(parseInt(user_id)) && account_type === 'citizen' ? BigInt(user_id) : undefined },
                    { resident_id: !isNaN(parseInt(user_id)) && account_type === 'resident' ? BigInt(user_id) : undefined }
                ]
            }
        });

        if (!user) return res.json({ success: true });

        await prisma.notifications.updateMany({
            where: { user_id: user.user_id, is_read: false },
            data: { is_read: true }
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to mark all read' });
    }
});

app.delete('/api/notifications/:id', async (req, res) => {
    try {
        await prisma.notifications.delete({
            where: { notification_id: BigInt(req.params.id) }
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to delete notification' });
    }
});

// Helper function to create logic-based notifications
const notifyUser = async (applicant_id, accountType, title, message, type) => {
    try {
        const user = await prisma.users.findFirst({
            where: {
                OR: [
                    { user_id: !isNaN(parseInt(applicant_id)) ? BigInt(applicant_id) : undefined },
                    { citizen_id: !isNaN(parseInt(applicant_id)) && accountType === 'citizen' ? BigInt(applicant_id) : undefined },
                    { resident_id: !isNaN(parseInt(applicant_id)) && accountType === 'resident' ? BigInt(applicant_id) : undefined }
                ]
            }
        });
        if (user) {
            await prisma.notifications.create({
                data: {
                    user_id: user.user_id,
                    title,
                    message,
                    notification_type: type,
                    is_read: false
                }
            });
        }
    } catch (error) {
        console.error("Error creating user notification: ", error);
    }
};

const notifyStaff = async (title, message, type) => {
    try {
        const staffUsers = await prisma.users.findMany({
            where: {
                NOT: {
                    account_type: { in: ['citizen', 'resident'] }
                }
            }
        });
        
        const notificationsData = staffUsers.map(staff => ({
            user_id: staff.user_id,
            title,
            message,
            notification_type: type,
            is_read: false
        }));

        if (notificationsData.length > 0) {
            await prisma.notifications.createMany({
                data: notificationsData
            });
        }
    } catch (error) {
        console.error("Error creating staff notification: ", error);
    }
};

app.use((req, res, next) => {
    res.status(404).json({ success: false, message: 'API Route Not Found' });
});

app.use((err, req, res, next) => {
    console.error('Unhandled Exception:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
