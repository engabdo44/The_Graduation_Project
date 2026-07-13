const { fork } = require('child_process');
const http = require('http');

console.log('Forking server.js...');
const child = fork('server.js', {
    env: { ...process.env, PORT: '5001', NODE_ENV: 'test' },
    silent: true
});

child.stdout.on('data', (data) => {
    console.log(`[SERVER STDOUT] ${data.toString().trim()}`);
});

child.stderr.on('data', (data) => {
    console.error(`[SERVER STDERR] ${data.toString().trim()}`);
});

// Helper for making requests
function makeRequest(path, method, headers, postData = '') {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: '127.0.0.1',
            port: 5001,
            path,
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };
        if (postData) {
            options.headers['Content-Length'] = Buffer.byteLength(postData);
        }
        const req = http.request(options, (res) => {
            let body = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body }));
        });
        req.on('error', reject);
        if (postData) req.write(postData);
        req.end();
    });
}

setTimeout(async () => {
    try {
        console.log('--- STARTING RBAC VERIFICATION ---');

        // Test 1: Admin user login
        console.log('\n[TEST 1] Logging in as admin user (law4)...');
        const loginData = JSON.stringify({ username: 'law4', password: 'law4' }); // law4 password is: Law44556@
        const res1 = await makeRequest('/api/login', 'POST', {}, JSON.stringify({ username: 'law4', password: 'Law44556@' }));
        console.log('Login Status:', res1.statusCode);
        console.log('Response body:', res1.body);

        let cookie = '';
        if (res1.headers['set-cookie']) {
            cookie = res1.headers['set-cookie'][0].split(';')[0];
            console.log('Set-Cookie received:', cookie);
        }

        // Test 2: Access admin logs path with admin cookie
        console.log('\n[TEST 2] Fetching admin users with admin cookie...');
        const res2 = await makeRequest('/api/admin/users', 'GET', { Cookie: cookie });
        console.log('Status (Should be 200/JSON):', res2.statusCode);
        const body2 = JSON.parse(res2.body);
        console.log('Success state:', body2.success);

        // Test 3: Access admin logs path without cookie
        console.log('\n[TEST 3] Fetching admin users without cookie...');
        const res3 = await makeRequest('/api/admin/users', 'GET', {});
        console.log('Status (Should be 401/Unauthorized):', res3.statusCode);
        console.log('Response body:', res3.body);

        // Test 4: Citizen login
        console.log('\n[TEST 4] Logging in as citizen user (59256976503)...');
        const res4 = await makeRequest('/api/login', 'POST', {}, JSON.stringify({ username: '59256976503', password: 'Password123!' }));
        console.log('Login Status:', res4.statusCode);
        
        let citizenCookie = '';
        if (res4.headers['set-cookie']) {
            citizenCookie = res4.headers['set-cookie'][0].split(';')[0];
        }

        // Test 5: Access admin logs path with citizen cookie
        console.log('\n[TEST 5] Fetching admin users with citizen cookie...');
        const res5 = await makeRequest('/api/admin/users', 'GET', { Cookie: citizenCookie });
        console.log('Status (Should be 403/Forbidden):', res5.statusCode);
        console.log('Response body:', res5.body);

        console.log('\n--- RBAC TESTS COMPLETED ---');
    } catch (e) {
        console.error('Test error:', e);
    } finally {
        child.kill();
        process.exit(0);
    }
}, 3000);
