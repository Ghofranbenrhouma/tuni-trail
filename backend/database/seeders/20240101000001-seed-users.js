// Seeder: Populate users table

'use strict';

module.exports = {
  async up(queryInterface) {
    // Password: 'admin123' (bcrypt hashed with 10 rounds)
    const hashedPassword = '$2a$10$I7PwXgmSBicmPe.Tw/SP1ebQbMjFZRWfkw54NTXlBqDmVNJK/Z/oa';

    return queryInterface.bulkInsert('users', [
      {
        email: 'admin@tunitrail.com',
        password: hashedPassword,
        name: 'Admin TuniTrail',
        avatar: 'AT',
        role: 'admin',
        created_at: new Date(),
      },
      {
        email: 'org@demo.com',
        password: hashedPassword,
        name: 'Tribus Aventure',
        avatar: 'TA',
        role: 'org',
        created_at: new Date(),
      },
      {
        email: 'user@demo.com',
        password: hashedPassword,
        name: 'Ahmed Ben Ali',
        avatar: 'AB',
        role: 'user',
        created_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    return queryInterface.bulkDelete('users', null, {});
  },
};
