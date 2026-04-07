# Test 1: Login to get token
$login = @{
  email = 'user@demo.com'
  password = 'admin123'
} | ConvertTo-Json

$loginResponse = Invoke-WebRequest -Uri 'http://localhost:5000/api/auth/login' `
  -Method POST `
  -UseBasicParsing `
  -Headers @{'Content-Type'='application/json'} `
  -Body $login

$loginData = $loginResponse.Content | ConvertFrom-Json
$token = $loginData.token
$userId = $loginData.user.id

Write-Host '✅ Login successful' -ForegroundColor Green
Write-Host "Token: $token" -ForegroundColor Cyan
Write-Host "User ID: $userId" -ForegroundColor Cyan
Write-Host ''

# Test 2: Get current user profile
Write-Host '📋 Test: GET /api/users/me' -ForegroundColor Yellow
$meResponse = Invoke-WebRequest -Uri 'http://localhost:5000/api/users/me' `
  -Method GET `
  -Headers @{'Authorization'="Bearer $token"}

$meData = $meResponse.Content | ConvertFrom-Json
Write-Host "Status: $($meResponse.StatusCode)" -ForegroundColor Green
Write-Host ($meData | ConvertTo-Json -Depth 3) -ForegroundColor Cyan
Write-Host ''

# Test 3: Update user profile
Write-Host '📋 Test: PUT /api/users/me' -ForegroundColor Yellow
$updateBody = @{
  name = 'Updated Adventure User'
  phone = '+216 12 345 678'
  bio = 'Love exploring Tunisia'
} | ConvertTo-Json

$updateResponse = Invoke-WebRequest -Uri 'http://localhost:5000/api/users/me' `
  -Method PUT `
  -Headers @{'Authorization'="Bearer $token"; 'Content-Type'='application/json'} `
  -Body $updateBody

$updateData = $updateResponse.Content | ConvertFrom-Json
Write-Host "Status: $($updateResponse.StatusCode)" -ForegroundColor Green
Write-Host ($updateData | ConvertTo-Json -Depth 3) -ForegroundColor Cyan
Write-Host ''

# Test 4: Login as admin and list all users
Write-Host '📋 Test: GET /api/users (admin)' -ForegroundColor Yellow
$adminLogin = @{
  email = 'admin@tunitrail.com'
  password = 'admin123'
} | ConvertTo-Json

$adminLoginResponse = Invoke-WebRequest -Uri 'http://localhost:5000/api/auth/login' `
  -Method POST `
  -Headers @{'Content-Type'='application/json'} `
  -Body $adminLogin

$adminData = $adminLoginResponse.Content | ConvertFrom-Json
$adminToken = $adminData.token

$usersResponse = Invoke-WebRequest -Uri 'http://localhost:5000/api/users' `
  -Method GET `
  -Headers @{'Authorization'="Bearer $adminToken"}

$usersData = $usersResponse.Content | ConvertFrom-Json
Write-Host "Status: $($usersResponse.StatusCode)" -ForegroundColor Green
Write-Host "Count: $($usersData.Length) users" -ForegroundColor Green
Write-Host ($usersData | ConvertTo-Json -Depth 3) -ForegroundColor Cyan
