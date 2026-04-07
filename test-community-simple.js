const http = require('http');

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api${path}`,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers.Authorization = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            body: JSON.parse(data),
            headers: res.headers,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            body: data,
            headers: res.headers,
          });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function test() {
  try {
    const userLogin = await request('POST', '/auth/login', {
      email: 'user@demo.com',
      password: 'admin123',
    });
    const token = userLogin.body.token;
    console.log('✅ Login successful, token:', token.substring(0, 30) + '...');

    // Test 1: Simple GET
    console.log('\n1️⃣  GET /api/community/posts');
    const res = await request('GET', '/community/posts', null, token);
    console.log('Status:', res.status);
    if (res.status === 200) {
      console.log('Data type:', typeof res.body);
      if (Array.isArray(res.body)) {
        console.log('Posts count:', res.body.length);
      } else {
        console.log('Body:', JSON.stringify(res.body).substring(0, 200));
      }
    } else {
      console.log('Error body:', res.body);
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

test();
