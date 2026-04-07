// Seeder: Populate community_posts table

'use strict';

const posts = [
  {
    user_id: 3,
    author_name: 'Mehdi Gouia',
    author_avatar: 'M',
    location: 'Camping Zaghouan',
    image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600&h=600&fit=crop',
    caption: 'Quelle vue incroyable au lever du soleil! 🏔️✨',
    likes_count: 342,
    comments_count: 45,
    created_at: new Date(),
  },
  {
    user_id: 3,
    author_name: 'Linda Li',
    author_avatar: 'L',
    location: 'Trek Ichkeul',
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=600&fit=crop',
    caption: 'Bivouac sous les étoiles... un moment magique 🌟🏕️',
    likes_count: 523,
    comments_count: 78,
    created_at: new Date(),
  },
  {
    user_id: 3,
    author_name: 'Mohamed Abouda',
    author_avatar: 'MA',
    location: 'Bivouac Tataouine',
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=600&fit=crop',
    caption: 'Avec les amis dans le désert de Tataouine 🐪🌅',
    likes_count: 678,
    comments_count: 92,
    created_at: new Date(),
  },
  {
    user_id: 3,
    author_name: 'Rayen Benbarek',
    author_avatar: 'R',
    location: 'Rando Tabarka',
    image: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=600&h=600&fit=crop',
    caption: 'Les paysages côtiers de Tabarka! 🌊⛰️',
    likes_count: 451,
    comments_count: 64,
    created_at: new Date(),
  },
  {
    user_id: 3,
    author_name: 'Helena Fa',
    author_avatar: 'H',
    location: 'Kayak Djerba',
    image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600&h=600&fit=crop',
    caption: 'Vacances en famille à Djerba 🏖️',
    likes_count: 612,
    comments_count: 88,
    created_at: new Date(),
  },
];

module.exports = {
  async up(queryInterface) {
    return queryInterface.bulkInsert('community_posts', posts);
  },

  async down(queryInterface) {
    return queryInterface.bulkDelete('community_posts', null, {});
  },
};
