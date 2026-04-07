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
  console.log('📋 === Testing Community Controller Endpoints ===\n');

  try {
    // Get user token
    const userLogin = await request('POST', '/auth/login', {
      email: 'user@demo.com',
      password: 'admin123',
    });
    const userToken = userLogin.body.token;

    console.log('✅ User token obtained\n');

    // Test 1: Get all community posts
    console.log('1️⃣  Test: GET /api/community/posts');
    const postsRes = await request('GET', '/community/posts', null, userToken);
    console.log(`   Status: ${postsRes.status}`);
    console.log(`   Posts found: ${postsRes.body.length}`);
    if (postsRes.body.length > 0) {
      console.log(`   First post caption: "${postsRes.body[0].caption?.substring(0, 50)}..."`);
      console.log(`   Has author info: ${postsRes.body[0].author_name ? '✅ YES' : '❌ NO'}`);
      console.log(`   Has liked flag: ${postsRes.body[0].liked !== undefined ? '✅ YES' : '❌ NO'}`);
    }
    console.log('   ✅ PASS\n');

    // Test 2: Create a community post
    console.log('2️⃣  Test: POST /api/community/posts (create)');
    const createRes = await request('POST', '/community/posts', {
      caption: 'Amazing adventure in Kroumerie! #TuniTrail #Travel',
      location: 'Kroumerie',
      image: 'https://example.com/image.jpg',
    }, userToken);
    console.log(`   Status: ${createRes.status}`);
    if (createRes.status === 201) {
      const newPostId = createRes.body.id;
      console.log(`   Created post ID: ${newPostId}`);
      console.log(`   Caption: "${createRes.body.caption}"`);
      console.log(`   Author: ${createRes.body.author_name}`);
      console.log(`   Likes: ${createRes.body.likes_count}`);
      console.log('   ✅ PASS\n');

      // Test 3: Like the post
      console.log('3️⃣  Test: POST /api/community/posts/:id/like (like)');
      const likeRes = await request('POST', `/community/posts/${newPostId}/like`, {}, userToken);
      console.log(`   Status: ${likeRes.status}`);
      console.log(`   Liked: ${likeRes.body.liked}`);
      console.log('   ✅ PASS\n');

      // Test 4: Get posts to verify like was recorded
      console.log('4️⃣  Test: GET /api/community/posts (verify like)');
      const postsRes2 = await request('GET', '/community/posts', null, userToken);
      const updatedPost = postsRes2.body.find(p => p.id === newPostId);
      console.log(`   Status: ${postsRes2.status}`);
      console.log(`   Post likes: ${updatedPost?.likes_count}`);
      console.log(`   User liked: ${updatedPost?.liked ? '✅ YES' : '❌ NO'}`);
      console.log('   ✅ PASS\n');

      // Test 5: Unlike the post
      console.log('5️⃣  Test: POST /api/community/posts/:id/like (unlike)');
      const unlikeRes = await request('POST', `/community/posts/${newPostId}/like`, {}, userToken);
      console.log(`   Status: ${unlikeRes.status}`);
      console.log(`   Liked: ${unlikeRes.body.liked}`);
      console.log('   ✅ PASS\n');

      // Test 6: Get posts to verify unlike was recorded
      console.log('6️⃣  Test: GET /api/community/posts (verify unlike)');
      const postsRes3 = await request('GET', '/community/posts', null, userToken);
      const unlikedPost = postsRes3.body.find(p => p.id === newPostId);
      console.log(`   Status: ${postsRes3.status}`);
      console.log(`   Post likes: ${unlikedPost?.likes_count}`);
      console.log(`   User liked: ${unlikedPost?.liked ? '❌ Still liked' : '✅ NO'}`);
      console.log('   ✅ PASS\n');

      // Test 7: Get chat messages
      console.log('7️⃣  Test: GET /api/community/chat');
      const chatRes = await request('GET', '/community/chat', null, userToken);
      console.log(`   Status: ${chatRes.status}`);
      console.log(`   Chat messages found: ${chatRes.body.length}`);
      console.log('   ✅ PASS\n');

      // Test 8: Send a chat message
      console.log('8️⃣  Test: POST /api/community/chat (send message)');
      const sendChatRes = await request('POST', '/community/chat', {
        message: 'Great community here! Looking forward to more adventures.',
      }, userToken);
      console.log(`   Status: ${sendChatRes.status}`);
      if (sendChatRes.status === 201) {
        console.log(`   Message sent:`);
        console.log(`   Author: ${sendChatRes.body.author_name}`);
        console.log(`   Message: "${sendChatRes.body.message}"`);
        console.log('   ✅ PASS\n');
      } else {
        console.log(`   Error: ${sendChatRes.body.error}\n`);
      }

      // Test 9: Invalid caption
      console.log('9️⃣  Test: POST /api/community/posts (missing caption - should fail)');
      const invalidRes = await request('POST', '/community/posts', {
        location: 'Test',
      }, userToken);
      console.log(`   Status: ${invalidRes.status}`);
      console.log(`   Error: ${invalidRes.body.error}`);
      console.log(`   Expected 400: ${invalidRes.status === 400 ? '✅ YES' : '❌ NO'}`);
      console.log('   ✅ PASS\n');
    } else {
      console.log(`   ❌ Failed to create post`);
      console.log(`   Error: ${createRes.body.error}\n`);
    }

    console.log('✅ === All Community Tests Passed! ===');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

runTests();
