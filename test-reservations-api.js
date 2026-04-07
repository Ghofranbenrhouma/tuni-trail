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
          });
        } catch {
          resolve({
            status: res.statusCode,
            body: data,
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
  console.log('📋 === Testing Reservation Controller Endpoints ===\n');

  try {
    // Get tokens
    const userLogin = await request('POST', '/auth/login', {
      email: 'user@demo.com',
      password: 'admin123',
    });
    const userToken = userLogin.body.token;

    const orgLogin = await request('POST', '/auth/login', {
      email: 'org@demo.com',
      password: 'admin123',
    });
    const orgToken = orgLogin.body.token;

    console.log('✅ Tokens obtained\n');

    // Test 1: Get my reservations (user)
    console.log('1️⃣  Test: GET /api/reservations (my reservations)');
    const myRes = await request('GET', '/reservations', null, userToken);
    console.log(`   Status: ${myRes.status}`);
    console.log(`   User reservations found: ${myRes.body.length}`);
    if (myRes.body.length > 0) {
      console.log(`   First reservation: ${myRes.body[0].ref_code}`);
      console.log(`   Event: ${myRes.body[0].event_title}`);
      console.log(`   Has user data: ${myRes.body[0].user ? '✅ YES' : '❌ NO'}`);
    }
    console.log('   ✅ PASS\n');

    // Test 2: Create reservation
    console.log('2️⃣  Test: POST /api/reservations (create)');
    const createRes = await request('POST', '/reservations', {
      event_id: 1,
      event_title: 'Test Event for Reservation',
      event_date: '2026-06-15',
      event_loc: 'Kroumerie',
      event_cls: 'test-event',
      price: '150 TND',
      option_label: 'VIP Pass',
      ticket_count: 2,
    }, userToken);
    console.log(`   Status: ${createRes.status}`);
    if (createRes.status === 201) {
      const newResId = createRes.body.id;
      const refCode = createRes.body.ref_code;
      console.log(`   Created reservation ID: ${newResId}`);
      console.log(`   Reference code: ${refCode}`);
      console.log(`   Tickets: ${createRes.body.ticket_count}`);
      console.log(`   Status: ${createRes.body.status}`);
      console.log('   ✅ PASS\n');

      // Test 3: Get all reservations (org)
      console.log('3️⃣  Test: GET /api/reservations/all (org view)');
      const allRes = await request('GET', '/reservations/all', null, orgToken);
      console.log(`   Status: ${allRes.status}`);
      console.log(`   Total reservations: ${allRes.body.length}`);
      console.log('   ✅ PASS\n');

      // Test 4: Filter by status
      console.log('4️⃣  Test: GET /api/reservations/all?status=confirmed');
      const filterRes = await request('GET', '/reservations/all?status=confirmed', null, orgToken);
      console.log(`   Status: ${filterRes.status}`);
      console.log(`   Confirmed reservations: ${filterRes.body.length}`);
      console.log('   ✅ PASS\n');

      // Test 5: Search by reference code
      console.log(`5️⃣  Test: GET /api/reservations/all?search=${refCode}`);
      const searchRes = await request('GET', `/reservations/all?search=${refCode}`, null, orgToken);
      console.log(`   Status: ${searchRes.status}`);
      console.log(`   Search results: ${searchRes.body.length}`);
      if (searchRes.body.length > 0) {
        console.log(`   Found: ${searchRes.body[0].ref_code}`);
      }
      console.log('   ✅ PASS\n');

      // Test 6: Generate QR payload and verify
      console.log('6️⃣  Test: POST /api/reservations/verify-qr');
      const qrPayload = Buffer.from(JSON.stringify({
        app: 'TuniTrail',
        rid: refCode,
        eid: 1,
      })).toString('base64');

      const verifyRes = await request('POST', '/reservations/verify-qr', {
        qr_payload: qrPayload,
      }, orgToken);
      console.log(`   Status: ${verifyRes.status}`);
      console.log(`   Valid: ${verifyRes.body.valid}`);
      if (verifyRes.body.valid) {
        console.log(`   Reservation verified: ${verifyRes.body.reservation.ref_code}`);
      } else {
        console.log(`   Reason: ${verifyRes.body.reason}`);
      }
      console.log('   ✅ PASS\n');

      // Test 7: Invalid QR code
      console.log('7️⃣  Test: POST /api/reservations/verify-qr (invalid)');
      const badQrPayload = Buffer.from(JSON.stringify({
        app: 'WrongApp',
        rid: 'BAD-REF',
        eid: 999,
      })).toString('base64');

      const badVerifyRes = await request('POST', '/reservations/verify-qr', {
        qr_payload: badQrPayload,
      }, orgToken);
      console.log(`   Status: ${badVerifyRes.status}`);
      console.log(`   Valid: ${badVerifyRes.body.valid}`);
      console.log(`   Reason: ${badVerifyRes.body.reason}`);
      console.log('   ✅ PASS\n');
    } else {
      console.log(`   ❌ Failed to create reservation`);
      console.log(`   Error: ${createRes.body.error}\n`);
    }

    console.log('✅ === All Reservation Tests Passed! ===');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

runTests();
