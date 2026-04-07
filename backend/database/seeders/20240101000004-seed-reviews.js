// Seeder: Populate reviews table

'use strict';

module.exports = {
  async up(queryInterface) {
    return queryInterface.bulkInsert('reviews', [
      {
        user_id: 3,
        event_id: 1,
        user_name: 'Amira B.',
        rating: 5,
        comment: 'Expérience magique, organisation parfaite, les guides sont très professionnels.',
        status: 'published',
        created_at: new Date(),
      },
      {
        user_id: 3,
        event_id: 2,
        user_name: 'Karim L.',
        rating: 4,
        comment: 'Très belle randonnée, paysages incroyables. Je recommande vivement.',
        status: 'published',
        created_at: new Date(),
      },
      {
        user_id: 3,
        event_id: 3,
        user_name: 'Sara M.',
        rating: 5,
        comment: 'Un bivouac inoubliable sous les étoiles du désert. Merci TuniTrail !',
        status: 'published',
        created_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    return queryInterface.bulkDelete('reviews', null, {});
  },
};
