const { fork } = require('child_process');
const http = require('http');

console.log('Forking server.js...');
const child = fork('server.js', {
    env: { ...process.env, PORT: '5000', NODE_ENV: 'test' },
    silent: true
});

child.stdout.on('data', (data) => {
    console.log(`[SERVER STDOUT] ${data.toString().trim()}`);
});

child.stderr.on('data', (data) => {
    console.error(`[SERVER STDERR] ${data.toString().trim()}`);
});

// Wait 3 seconds for server to start, then make request
setTimeout(() => {
    console.log('Sending request to /api/login...');
    const postData = JSON.stringify({
        username: 'admin',
        password: 'password'
    });

    const options = {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const req = http.request(options, (res) => {
        console.log(`STATUS: ${res.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        res.setEncoding('utf8');
        let body = '';
        res.on('data', (chunk) => {
            body += chunk;
        });
        res.on('end', () => {
            console.log('BODY:', body);
            child.kill();
            process.exit(0);
        });
    });

    req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
        child.kill();
        process.exit(1);
    });

    req.write(postData);
    req.end();
}, 3000);
