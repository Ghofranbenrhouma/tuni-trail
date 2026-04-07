const bcrypt = require('bcryptjs');

const testHash = '$2a$10$8K1p/pHlKVfh1D5q.B6zOeKx5ry0YQpXS7ROAH8oUXqKrq.GVfDi6';
const password = 'admin123';

bcrypt.compare(password, testHash).then(isMatch => {
  console.log(`Password '${password}' matches hash: ${isMatch ? '✅ YES' : '❌ NO'}`);

  if (!isMatch) {
    console.log('\nGenerating correct hash for admin123...');
    return bcrypt.hash(password, 10);
  }
}).then(newHash => {
  if (newHash) {
    console.log(`Correct hash: ${newHash}`);
  }
  process.exit(0);
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
