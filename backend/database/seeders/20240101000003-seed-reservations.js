// Seeder: Populate reservations table

'use strict';

module.exports = {
  async up(queryInterface) {
    return queryInterface.bulkInsert('reservations', [
      {
        ref_code: '#TT-2024-0412',
        user_id: 3,
        event_id: 1,
        event_title: 'Camping Zaghouan',
        event_date: '15 Avr',
        event_loc: 'Zaghouan',
        event_cls: 'th-z',
        price: '178 DT',
        option_label: 'Standard',
        ticket_count: 2,
        status: 'confirmed',
        created_at: new Date(),
      },
      {
        ref_code: '#TT-2024-0411',
        user_id: 3,
        event_id: 2,
        event_title: 'Trek Ichkeul',
        event_date: '22 Avr',
        event_loc: 'Bizerte',
        event_cls: 'th-i',
        price: '65 DT',
        option_label: 'Premium',
        ticket_count: 1,
        status: 'pending',
        created_at: new Date(),
      },
      {
        ref_code: '#TT-2024-0410',
        user_id: 3,
        event_id: 3,
        event_title: 'Ksar Hadada',
        event_date: '29 Avr',
        event_loc: 'Tataouine',
        event_cls: 'th-k',
        price: '435 DT',
        option_label: 'Standard',
        ticket_count: 3,
        status: 'confirmed',
        created_at: new Date(),
      },
      {
        ref_code: '#TT-2024-0409',
        user_id: 3,
        event_id: 1,
        event_title: 'Camping Zaghouan',
        event_date: '20 Mai',
        event_loc: 'Zaghouan',
        event_cls: 'th-z',
        price: '178 DT',
        option_label: 'Standard',
        ticket_count: 2,
        status: 'cancelled',
        created_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    return queryInterface.bulkDelete('reservations', null, {});
  },
};
