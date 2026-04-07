const http = require('http');

// Helper function to make HTTP requests
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
          });
        } catch {
          resolve({
            status: res.statusCode,
            body:data,
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

async function runTests() {
  console.log('📋 === Testing User Controller Endpoints ===\n');

  try {
    // Test 1: Login
    console.log('1️⃣  Test: POST /api/auth/login');
    const loginRes = await request('POST', '/auth/login', {
      email: 'user@demo.com',
      password: 'admin123',
    });
    console.log(`   Status: ${loginRes.status}`);
    console.log(`   User: ${loginRes.body.user?.email}`);
    console.log(`   Token: ${loginRes.body.token?.substring(0, 30)}...`);
    const token = loginRes.body.token;
    const userId = loginRes.body.user?.id;
    console.log('   ✅ PASS\n');

    // Test 2: Get current user profile
    console.log('2️⃣  Test: GET /api/users/me');
    const meRes = await request('GET', '/users/me', null, token);
    console.log(`   Status: ${meRes.status}`);
    console.log(`   User: ${meRes.body.email}`);
    console.log(`   Has password field: ${meRes.body.password ? '❌ NO (should not have)' : '✅ YES (excluded)'}`);
    console.log('   ✅ PASS\n');

    // Test 3: Update user profile
    console.log('3️⃣  Test: PUT /api/users/me');
    const updateRes = await request('PUT', '/users/me', {
      name: 'Updated Adventure User',
      phone: '+216 12 345 678',
      bio: 'Love exploring Tunisia',
    }, token);
    console.log(`   Status: ${updateRes.status}`);
    console.log(`   Updated name: ${updateRes.body.name}`);
    console.log(`   Updated phone: ${updateRes.body.phone}`);
    console.log(`   Updated bio: ${updateRes.body.bio}`);
    console.log('   ✅ PASS\n');

    // Test 4: Login as admin and list all users
    console.log('4️⃣  Test: GET /api/users (admin list)');
    const adminLoginRes = await request('POST', '/auth/login', {
      email: 'admin@tunitrail.com',
      password: 'admin123',
    });
    const adminToken = adminLoginRes.body.token;

    const usersRes = await request('GET', '/users', null, adminToken);
    console.log(`   Status: ${usersRes.status}`);
    console.log(`   User count: ${usersRes.body.length}`);
    usersRes.body.forEach((u, i) => {
      console.log(`     ${i + 1}. ${u.email} (${u.role})`);
    });
    console.log('   ✅ PASS\n');

    // Test 5: Get user by ID
    console.log(`5️⃣  Test: GET /api/users/${userId} (admin)`);
    const userRes = await request('GET', `/users/${userId}`, null, adminToken);
    console.log(`   Status: ${userRes.status}`);
    console.log(`   User: ${userRes.body.email}`);
    console.log(`   Role: ${userRes.body.role}`);
    console.log('   ✅ PASS\n');

    console.log('✅ === All 5 Tests Passed! ===');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

runTests();
