#!/bin/bash
# Test userController endpoints

echo "📋 === Testing User Controller Endpoints ==="
echo ""

# Test 1: Login to get token
echo "1️⃣ Test: POST /api/auth/login"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@demo.com","password":"admin123"}')

echo "$LOGIN_RESPONSE" | jq '.'
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
USER_ID=$(echo "$LOGIN_RESPONSE" | jq -r '.user.id')
echo "✅ Token: ${TOKEN:0:50}..."
echo ""

# Test 2: Get current user profile
echo "2️⃣ Test: GET /api/users/me"
curl -s -X GET http://localhost:5000/api/users/me \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Test 3: Update user profile
echo "3️⃣ Test: PUT /api/users/me"
curl -s -X PUT http://localhost:5000/api/users/me \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Adventure User",
    "phone": "+216 12 345 678",
    "bio": "Love exploring Tunisia"
  }' | jq '.'
echo ""

# Test 4: Login as admin and list all users
echo "4️⃣ Test: GET /api/users (admin)"
ADMIN_LOGIN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tunitrail.com","password":"admin123"}')

ADMIN_TOKEN=$(echo "$ADMIN_LOGIN" | jq -r '.token')

curl -s -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'
echo ""

# Test 5: Get user by ID (admin)
echo "5️⃣ Test: GET /api/users/:id (admin)"
curl -s -X GET "http://localhost:5000/api/users/$USER_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'
echo ""

echo "✅ All tests completed!"
