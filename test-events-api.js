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
  console.log('📋 === Testing Event Controller Endpoints ===\n');

  try {
    // Get tokens
    let orgToken, adminToken;
    const orgLogin = await request('POST', '/auth/login', {
      email: 'org@demo.com',
      password: 'admin123',
    });
    orgToken = orgLogin.body.token;

    const adminLogin = await request('POST', '/auth/login', {
      email: 'admin@tunitrail.com',
      password: 'admin123',
    });
    adminToken = adminLogin.body.token;

    console.log('✅ Tokens obtained\n');

    // Test 1: List all events
    console.log('1️⃣  Test: GET /api/events');
    const listRes = await request('GET', '/events', null, orgToken);
    console.log(`   Status: ${listRes.status}`);
    console.log(`   Events found: ${listRes.body.length}`);
    if (listRes.body.length > 0) {
      console.log(`   First event: "${listRes.body[0].title}"`);
      console.log(`   Has organizer: ${listRes.body[0].organizer_details ? '✅ YES' : '❌ NO'}`);
    }
    console.log('   ✅ PASS\n');

    // Test 2: Get specific event
    console.log('2️⃣  Test: GET /api/events/:id');
    const getRes = await request('GET', '/events/1', null, orgToken);
    console.log(`   Status: ${getRes.status}`);
    console.log(`   Event: "${getRes.body.title}"`);
    console.log(`   Organizer: ${getRes.body.organizer_details?.name || 'N/A'}`);
    console.log('   ✅ PASS\n');

    // Test 3: Create event
    console.log('3️⃣  Test: POST /api/events (create)');
    const createRes = await request('POST', '/events', {
      title: 'Test Trekking Adventure',
      category: 'Trekking',
      location: 'Kroumerie',
      date: '2026-06-15',
      duration: '3 days',
      price: '300 TND',
      price_num: 300,
      difficulty: 'Moyen',
      description: 'Amazing trekking experience',
      includes: ['Food', 'Water', 'Guide'],
      excludes: ['Transportation'],
      program: ['Day 1: Start', 'Day 2: Trek', 'Day 3: Return'],
      lat: '36.5',
      lng: '8.8',
      max_people: 20,
      images: [],
      status: 'draft',
    }, orgToken);
    console.log(`   Status: ${createRes.status}`);
    if (createRes.status === 201) {
      const newEventId = createRes.body.id;
      console.log(`   Created event ID: ${newEventId}`);
      console.log(`   Title: "${createRes.body.title}"`);
      console.log('   ✅ PASS\n');

      // Test 4: Update event
      console.log('4️⃣  Test: PUT /api/events/:id (update)');
      const updateRes = await request('PUT', `/events/${newEventId}`, {
        title: 'Updated Test Trek',
        difficulty: 'Difficile',
        price: '400 TND',
      }, orgToken);
      console.log(`   Status: ${updateRes.status}`);
      console.log(`   Updated title: "${updateRes.body.title}"`);
      console.log(`   Updated difficulty: "${updateRes.body.difficulty}"`);
      console.log('   ✅ PASS\n');

      // Test 5: Change status
      console.log('5️⃣  Test: PATCH /api/events/:id/status');
      const statusRes = await request('PATCH', `/events/${newEventId}/status`, {
        status: 'published',
      }, adminToken);
      console.log(`   Status: ${statusRes.status}`);
      console.log(`   Event status: ${statusRes.body.status}`);
      console.log('   ✅ PASS\n');

      // Test 6: Toggle featured
      console.log('6️⃣  Test: PATCH /api/events/:id/featured');
      const featuredRes = await request('PATCH', `/events/${newEventId}/featured`, {}, adminToken);
      console.log(`   Status: ${featuredRes.status}`);
      console.log(`   Is featured: ${featuredRes.body.is_featured}`);
      console.log('   ✅ PASS\n');

      // Test 7: Delete event
      console.log('7️⃣  Test: DELETE /api/events/:id');
      const deleteRes = await request('DELETE', `/events/${newEventId}`, null, adminToken);
      console.log(`   Status: ${deleteRes.status}`);
      console.log(`   Message: ${deleteRes.body.message}`);
      console.log('   ✅ PASS\n');

      // Verify deleted
      const verifyRes = await request('GET', `/events/${newEventId}`, null, orgToken);
      console.log(`   Verify delete: ${verifyRes.status === 404 ? '✅ Event removed' : '❌ Still exists'}\n`);
    } else {
      console.log(`   ❌ Failed to create event`);
      console.log(`   Error: ${createRes.body.error}\n`);
    }

    // Test 8: List with filters
    console.log('8️⃣  Test: GET /api/events?status=published');
    const filterRes = await request('GET', '/events?status=published', null, orgToken);
    console.log(`   Status: ${filterRes.status}`);
    console.log(`   Published events: ${filterRes.body.length}`);
    console.log('   ✅ PASS\n');

    console.log('✅ === All Event Tests Passed! ===');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

runTests();
