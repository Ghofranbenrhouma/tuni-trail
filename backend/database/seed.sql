-- ============================================================
-- TuniTrail — Seed Data
-- ============================================================
USE tunitrail;

-- ── Admin account (password: admin123) ───────────────────────
INSERT INTO users (email, password, name, avatar, role) VALUES
('admin@tunitrail.com', '$2a$10$8K1p/pHlKVfh1D5q.B6zOeKx5ry0YQpXS7ROAH8oUXqKrq.GVfDi6', 'Admin TuniTrail', 'AT', 'admin');

-- ── Demo users ───────────────────────────────────────────────
INSERT INTO users (email, password, name, avatar, role) VALUES
('org@demo.com',  '$2a$10$8K1p/pHlKVfh1D5q.B6zOeKx5ry0YQpXS7ROAH8oUXqKrq.GVfDi6', 'Tribus Aventure', 'TA', 'org'),
('user@demo.com', '$2a$10$8K1p/pHlKVfh1D5q.B6zOeKx5ry0YQpXS7ROAH8oUXqKrq.GVfDi6', 'Ahmed Ben Ali',   'AB', 'user');

-- ── Events ───────────────────────────────────────────────────
INSERT INTO events (title, category, location, date, duration, price, price_num, difficulty, css_class, organizer, organizer_id, rating, reviews_count, description, includes, excludes, program, lat, lng, map_label, images, max_people, min_age, options, status, sold, capacity, revenue) VALUES
(
  'Camping Zaghouan — Nuit sous les étoiles', 'Camping', 'Zaghouan', '15 Avr', '2 jours', '89 DT', 89.00, 'Facile', 'th-z', 'Tribus Aventure', 2, 4.9, 142,
  'Passez une nuit inoubliable sous les étoiles dans les hauteurs de Zaghouan, au cœur du parc national de Zaghouan. Niché entre les collines boisées et les ruines romaines du temple des Eaux, ce camping offre un cadre unique alliant nature sauvage et patrimoine historique.\n\nVos guides expérimentés de Tribus Aventure vous accompagneront tout au long de cette aventure : randonnée crépusculaire jusqu''au sommet, dîner berbère autour du feu, observation des étoiles au télescope, et petit-déjeuner au lever du soleil avec vue panoramique sur la plaine de la Manouba.',
  '["Tente et matelas fournis","Dîner berbère traditionnel","Petit-déjeuner inclus","Guide certifié","Télescope pour observation"]',
  '["Transport depuis Tunis","Équipement de randonnée personnel","Assurance voyage"]',
  '[{"time":"Jour 1 — 15h00","desc":"Départ depuis le point de ralliement à Zaghouan"},{"time":"17h00","desc":"Arrivée au camp et installation des tentes"},{"time":"19h00","desc":"Randonnée crépusculaire au sommet du Jebel Zaghouan (1 295m)"},{"time":"21h00","desc":"Dîner berbère autour du feu de camp"},{"time":"22h30","desc":"Séance d''observation des étoiles avec télescope"},{"time":"Jour 2 — 06h30","desc":"Lever du soleil panoramique"},{"time":"07h30","desc":"Petit-déjeuner traditionnel"},{"time":"09h00","desc":"Visite du Temple des Eaux (époque romaine)"},{"time":"11h00","desc":"Retour et fin de l''aventure"}]',
  36.4024, 10.1353, 'Jebel Zaghouan, Zaghouan',
  '["th-z","th-b","th-s"]', 20, 8,
  '[{"id":"std","label":"Standard","price":89,"desc":"Tente 2 personnes partagée, repas inclus"},{"id":"prm","label":"Premium","price":129,"desc":"Tente individuelle, kit confort + boisson chaude offerte"}]',
  'published', 34, 40, 3026.00
),
(
  'Trek Ichkeul — Zone humide UNESCO', 'Trek', 'Bizerte', '22 Avr', '1 jour', '45 DT', 45.00, 'Modéré', 'th-i', 'NatureVoyage', NULL, 4.7, 89,
  'Explorez le parc national d''Ichkeul, classé au patrimoine mondial de l''UNESCO — l''une des dernières zones humides d''Afrique du Nord.',
  '["Guide naturaliste certifié","Jumelles fournies","Lunch panier","Entrée parc nationale"]',
  '["Transport","Chaussures de randonnée","Crème solaire"]',
  '[{"time":"07h30","desc":"Rendez-vous à l''entrée du parc d''Ichkeul"},{"time":"08h00","desc":"Introduction naturaliste"},{"time":"09h00","desc":"Randonnée dans les marais"},{"time":"11h30","desc":"Ascension partielle du Jebel Ichkeul (511m)"},{"time":"13h00","desc":"Pause déjeuner au sommet"},{"time":"14h30","desc":"Retour par le lac"},{"time":"16h30","desc":"Fin de la journée"}]',
  37.1575, 9.6699, 'Parc National d''Ichkeul, Bizerte',
  '["th-i","th-z","th-c"]', 15, 10,
  '[{"id":"std","label":"Standard","price":45,"desc":"Randonnée guidée + lunch + entrée parc"},{"id":"fam","label":"Famille (2 adultes + 2 enfants)","price":120,"desc":"Tarif famille avec activités enfants adaptées"}]',
  'published', 18, 25, 810.00
),
(
  'Ksar Hadada — Bivouac saharien', 'Bivouac', 'Tataouine', '29 Avr', '3 jours', '145 DT', 145.00, 'Difficile', 'th-k', 'Desert Trail', NULL, 5.0, 64,
  'Vivez un bivouac authentique dans l''erg de Ksar Ghilane, aux portes du Grand Erg Oriental.',
  '["Nuit en tente saharienne (2 nuits)","Tous les repas (cuisine berbère)","Balade à dos de dromadaire","Guide désert","Transfert depuis Tataouine ville"]',
  '["Vol / transport jusqu''à Tataouine","Assurance désert","Vêtements chauds (nuits froides)"]',
  '[{"time":"Jour 1 — 14h00","desc":"Départ de Tataouine en 4x4 vers Ksar Hadada"},{"time":"16h00","desc":"Visite du ksar et installation du camp"},{"time":"18h30","desc":"Balade à dromadaire au coucher du soleil"},{"time":"20h00","desc":"Dîner sous les étoiles, musique gnawa"},{"time":"Jour 2","desc":"Excursion full-day dans les dunes"},{"time":"Jour 3 — 06h00","desc":"Lever de soleil sur les dunes, thé des nomades"},{"time":"10h00","desc":"Retour à Tataouine"}]',
  32.9999, 10.0979, 'Ksar Hadada, Tataouine',
  '["th-k","th-z","th-b"]', 12, 12,
  '[{"id":"std","label":"Standard","price":145,"desc":"Tente partagée, tous repas, dromadaire"},{"id":"prm","label":"Premium Bivouac","price":195,"desc":"Tente privée luxe, menu gastronomique berbère"}]',
  'published', 7, 12, 1015.00
),
(
  'Cap Bon — Randonnée côtière', 'Rando', 'Nabeul', '6 Mai', '1 jour', '35 DT', 35.00, 'Facile', 'th-c', 'Bleu Aventure', NULL, 4.8, 201,
  'Partez à la découverte de la côte de Cap Bon, l''un des joyaux naturels de la Tunisie.',
  '["Guide accompagnateur","Lunch dans restaurant local","Transport depuis Nabeul","Arrêts baignade"]',
  '["Maillot de bain et serviette","Crème solaire","Dépenses personnelles"]',
  '[{"time":"07h00","desc":"Départ depuis Nabeul centre"},{"time":"08h30","desc":"Début de la randonnée à Kelibia"},{"time":"10h00","desc":"Crique sauvage, baignade libre"},{"time":"12h30","desc":"Déjeuner chez un pêcheur local"},{"time":"14h30","desc":"Continuation vers Kerkouane"},{"time":"16h30","desc":"Retour à Nabeul"}]',
  36.8977, 11.0945, 'Cap Bon, Nabeul',
  '["th-c","th-i","th-z"]', 25, 6,
  '[{"id":"std","label":"Standard","price":35,"desc":"Randonnée + déjeuner + transport"},{"id":"fam","label":"Famille (2A+2E)","price":90,"desc":"Tarif famille, activités adaptées enfants"}]',
  'published', 0, 30, 0.00
),
(
  'Forêt de Babouch — Camping pineraie', 'Camping', 'Tabarka', '13 Mai', '2 jours', '75 DT', 75.00, 'Facile', 'th-b', 'Tribus Aventure', 2, 4.6, 118,
  'Dormez au cœur de la forêt de pins de Babouch, dans le nord-ouest de la Tunisie.',
  '["Tente et literie","Repas du soir et petit-déjeuner","Guide forestier","Activité cueillette et botanique"]',
  '["Transport depuis Tabarka","Équipement de pluie","Collations"]',
  '[{"time":"Jour 1 — 13h00","desc":"Accueil au camp de Babouch"},{"time":"14h30","desc":"Randonnée découverte de la forêt"},{"time":"17h00","desc":"Atelier botanique"},{"time":"19h30","desc":"Dîner rustique autour du feu"},{"time":"21h00","desc":"Soirée contes berbères"},{"time":"Jour 2 — 07h00","desc":"Petit-déjeuner dans les pins"},{"time":"09h00","desc":"Balade libre puis départ"}]',
  36.8133, 8.6833, 'Forêt de Babouch, Tabarka',
  '["th-b","th-z","th-k"]', 18, 7,
  '[{"id":"std","label":"Standard","price":75,"desc":"Tente partagée, dîner + petit-déjeuner"},{"id":"solo","label":"Solo / Couple","price":99,"desc":"Tente individuelle, repas premium, kit confort"}]',
  'published', 0, 18, 0.00
),
(
  'Jebel Serj — Ascension panoramique', 'Escalade', 'Siliana', '20 Mai', '1 jour', '55 DT', 55.00, 'Difficile', 'th-s', 'Summit Tunisia', NULL, 4.9, 77,
  'Relevez le défi de l''ascension du Jebel Serj (1 357m), le deuxième plus haut sommet de Tunisie.',
  '["Guide alpiniste certifié","Corde et matériel de sécurité","Lunch au sommet","Certificat d''ascension"]',
  '["Chaussures de trekking (obligatoires)","Transport","Assurance montagne"]',
  '[{"time":"05h30","desc":"Départ de Siliana ville"},{"time":"07h00","desc":"Début de l''ascension"},{"time":"09h30","desc":"Passage de la crête nord"},{"time":"11h00","desc":"Arrivée au sommet (1 357m)"},{"time":"12h00","desc":"Déjeuner au sommet"},{"time":"13h30","desc":"Descente par le versant sud"},{"time":"16h00","desc":"Retour à Siliana"}]',
  35.9214, 9.2614, 'Jebel Serj, Siliana',
  '["th-s","th-k","th-b"]', 10, 16,
  '[{"id":"std","label":"Ascension Standard","price":55,"desc":"Guide + équipement sécurité + lunch sommital"},{"id":"prm","label":"Ascension + Nuit en refuge","price":95,"desc":"Nuit en refuge de montagne, lever de soleil"}]',
  'published', 0, 10, 0.00
);

-- ── Products ─────────────────────────────────────────────────
INSERT INTO products (id, name, category, price, price_num, badge, badge_cls, icon, description, rating, reviews_count, in_stock, css_class) VALUES
('p1',  'Tente Dôme 2 personnes',        'Tentes',           '189 DT', 189, 'Bestseller', 'badge-lime',  '⛺', 'Légère et imperméable, montage en 5 min.',                4.8, 124, TRUE, 'prod-green'),
('p2',  'Tente Familiale 4 personnes',    'Tentes',           '320 DT', 320, 'Nouveau',    'badge-amber', '🏕', 'Grande tente ventilée avec séjour séparé.',               4.6,  67, TRUE, 'prod-earth'),
('p3',  'Tente Ultra-légère 1 personne',  'Tentes',           '245 DT', 245, 'Pro',        'badge-blue',  '⛺', '500g seulement. Pour les treks solitaires.',              4.9,  89, TRUE, 'prod-stone'),
('p4',  'Sac de couchage -5°C',           'Sacs de couchage', '135 DT', 135, 'Bestseller', 'badge-lime',  '🛏', 'Garnissage synthétique, séchage rapide.',                 4.7, 201, TRUE, 'prod-blue'),
('p5',  'Sac de couchage Duvet -15°C',    'Sacs de couchage', '280 DT', 280, 'Premium',    'badge-amber', '🛏', 'Duvet 90%, compressible. Nuits froides.',                 4.9,  55, TRUE, 'prod-navy'),
('p6',  'Sac de couchage Été +5°C',       'Sacs de couchage', '75 DT',   75, 'Promo',      'badge-red',   '🛏', 'Léger et aéré. Bivouacs d''été tunisiens.',               4.5, 143, TRUE, 'prod-warm'),
('p7',  'Sac à dos 45L',                  'Sacs à dos',       '165 DT', 165, 'Bestseller', 'badge-lime',  '🎒', 'Armature aluminium, ceinture lombaire.',                  4.8, 178, TRUE, 'prod-green'),
('p8',  'Sac à dos 65L Expédition',       'Sacs à dos',       '235 DT', 235, 'Pro',        'badge-blue',  '🎒', 'Système de portage ergonomique.',                         4.7,  92, TRUE, 'prod-earth'),
('p9',  'Sac à dos Journée 20L',          'Sacs à dos',       '85 DT',   85, NULL,         NULL,          '🎒', 'Compact et léger. Poche hydratation.',                    4.6, 231, TRUE, 'prod-stone'),
('p10', 'Lampe frontale 350 lumens',       'Éclairage',        '45 DT',   45, 'Bestseller', 'badge-lime',  '🔦', 'Rechargeable USB-C, étanche IPX4.',                      4.9, 312, TRUE, 'prod-yellow'),
('p11', 'Lanterne de camp solaire',        'Éclairage',        '65 DT',   65, 'Éco',        'badge-lime',  '🏮', 'Panneau solaire intégré, 3 modes.',                      4.7,  89, TRUE, 'prod-amber'),
('p12', 'Bâtons lumineux d''urgence',      'Éclairage',        '18 DT',   18, NULL,         NULL,          '✨', 'Pack de 10. Signalisation nocturne. 8h.',                4.4, 445, TRUE, 'prod-red'),
('p13', 'Réchaud à gaz compact',           'Cuisine',          '55 DT',   55, 'Bestseller', 'badge-lime',  '🔥', 'Aluminium, poids 85g.',                                  4.8, 267, TRUE, 'prod-orange'),
('p14', 'Gamelle titane 700ml',            'Cuisine',          '72 DT',   72, 'Léger',      'badge-blue',  '🫕', 'Titane grade 1, 98g.',                                   4.6, 134, TRUE, 'prod-stone'),
('p15', 'Kit vaisselle camping 4 pers.',   'Cuisine',          '89 DT',   89, NULL,         NULL,          '🍽', 'Assiettes, bols, couverts pliants.',                     4.5,  78, TRUE, 'prod-earth'),
('p16', 'Filtre à eau portable',           'Cuisine',          '95 DT',   95, 'Essentiel',  'badge-blue',  '💧', 'Filtre 0.1 micron, 1000L de capacité.',                  4.9, 198, TRUE, 'prod-blue'),
('p17', 'Veste imperméable 3 couches',     'Vêtements',        '225 DT', 225, 'Nouveau',    'badge-amber', '🧥', 'Membrane Gore-Tex. Protection totale.',                  4.8,  56, TRUE, 'prod-navy'),
('p18', 'Chaussures de trek basses',       'Vêtements',        '185 DT', 185, 'Bestseller', 'badge-lime',  '👟', 'Semelle Vibram, imperméable.',                            4.7, 189, TRUE, 'prod-brown'),
('p19', 'Guêtres imperméables',            'Vêtements',        '55 DT',   55, NULL,         NULL,          '🧦', 'Protection contre boue et eau.',                         4.5,  67, TRUE, 'prod-green'),
('p20', 'Boussole de randonnée',           'Navigation',       '35 DT',   35, 'Essentiel',  'badge-blue',  '🧭', 'Miroir de visée, déclinaison réglable.',                 4.9, 234, TRUE, 'prod-stone'),
('p21', 'GPS de randonnée',                'Navigation',       '420 DT', 420, 'Premium',    'badge-amber', '📡', 'Cartographie topographique Tunisie.',                    4.8,  44, TRUE, 'prod-blue'),
('p22', 'Altimètre / Baromètre',           'Navigation',       '125 DT', 125, NULL,         NULL,          '🌡', 'Prévisions météo, altimètre barométrique.',              4.6,  88, TRUE, 'prod-navy'),
('p23', 'Kit premiers secours complet',    'Premiers secours', '65 DT',   65, 'Essentiel',  'badge-red',   '🩺', '42 pièces, sac étanche.',                                4.9, 312, TRUE, 'prod-red'),
('p24', 'Couverture de survie',            'Premiers secours', '12 DT',   12, NULL,         NULL,          '🆘', 'Aluminium mylar, réflexion 90%.',                        4.7, 567, TRUE, 'prod-warm'),
('p25', 'Tapis de sol isolant',            'Accessoires',      '45 DT',   45, NULL,         NULL,          '🛏', 'Mousse EVA haute densité, R-Value 2.0.',                 4.5, 145, TRUE, 'prod-green'),
('p26', 'Corde de camp 10m',              'Accessoires',      '28 DT',   28, NULL,         NULL,          '🧵', 'Polypropylène 4mm, charge 200kg.',                       4.6,  89, TRUE, 'prod-earth'),
('p27', 'Pioches de tente x8',            'Accessoires',      '22 DT',   22, 'Pack',       'badge-lime',  '⚒',  'Aluminium anodisé, ultra-légères.',                      4.7, 203, TRUE, 'prod-stone'),
('p28', 'Powerbank solaire 20000mAh',     'Accessoires',      '155 DT', 155, 'Nouveau',    'badge-amber', '🔋', '2 panneaux solaires, 3 sorties USB.',                    4.8,  67, TRUE, 'prod-yellow');

-- ── Destinations ─────────────────────────────────────────────
INSERT INTO destinations (name, full_name, type, altitude, difficulty, diff_class, duration, rating, reviews_count, lat, lng, image, description, highlights, season, emoji, gradient) VALUES
('Zaghouan',       'Camping Zaghouan',           'Camping',    '1 295m', 'Modéré',   'diff-mod',  '2 jours', 4.8, 124, 36.40, 10.14, 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=400&fit=crop', 'Au pied du majestueux Jebel Zaghouan, découvrez un camping d''exception.',                    '["Vue panoramique","Source thermale","Sentiers balisés"]',       'Mars - Nov',        '🏔️', 'linear-gradient(135deg, #102008, #2f5420)'),
('Tataouine',      'Bivouac Tataouine',          'Bivouac',    '860m',   'Difficile','diff-hard', '3 jours', 4.9,  89, 32.93, 10.45, 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&h=400&fit=crop', 'Vivez l''aventure ultime dans les paysages désertiques de Tataouine.',                        '["Nuits étoilées","Ksour berbères","Dunes dorées"]',             'Oct - Avr',         '🏜️', 'linear-gradient(135deg, #241008, #6b2e12)'),
('Ichkeul',        'Trek Ichkeul',               'Trek',       '511m',   'Facile',   'diff-easy', '1 jour',  4.7, 203, 37.16,  9.67, 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop', 'Parc national classé UNESCO, Ichkeul offre une biodiversité exceptionnelle.',                '["Site UNESCO","Ornithologie","Lac naturel"]',                   'Toute l''année',    '🦅', 'linear-gradient(135deg, #0b1c2e, #163a5a)'),
('Tozeur',         'Camping Tozeur',             'Camping',    '385m',   'Facile',   'diff-easy', '2 jours', 4.6, 167, 33.92,  8.13, 'https://images.unsplash.com/photo-1542401886-65d6c61db217?w=600&h=400&fit=crop', 'Oasis luxuriante aux portes du Sahara.',                                                     '["Palmeraie","Oasis de montagne","Architecture"]',               'Oct - Mai',         '🌴', 'linear-gradient(135deg, #1a1508, #4a3c16)'),
('Tabarka',        'Rando Tabarka',              'Randonnée',  '600m',   'Modéré',   'diff-mod',  '1 jour',  4.8, 142, 36.95,  8.76, 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=600&h=400&fit=crop', 'Entre mer et montagne, Tabarka offre des sentiers de randonnée spectaculaires.',              '["Forêts de chênes","Côte sauvage","Plongée"]',                  'Avr - Oct',         '🌊', 'linear-gradient(135deg, #0c1c14, #224a30)'),
('Djerba',         'Kayak Djerba',               'Kayak',      '3m',     'Facile',   'diff-easy', '1 jour',  4.5, 231, 33.81, 10.94, 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600&h=400&fit=crop', 'L''île des rêves vous accueille pour des excursions en kayak.',                               '["Eaux turquoise","Plages vierges","Culture locale"]',           'Mai - Oct',         '🏖️', 'linear-gradient(135deg, #160c24, #3c1e5c)'),
('Jebel Boubaker', 'Escalade Jebel Boubaker',    'Escalade',   '2 000m', 'Difficile','diff-hard', '2 jours', 4.9,  56, 35.89,  9.94, 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=400&fit=crop', 'Le point culminant de la dorsale tunisienne offre un défi exaltant.',                         '["Sommet tunisien","Voies techniques","Vue 360°"]',              'Avr - Nov',         '🧗', 'linear-gradient(135deg, #201a08, #5a4018)'),
('Douz',           'Bivouac Douz',               'Bivouac',    '480m',   'Modéré',   'diff-mod',  '3 jours', 4.7, 178, 33.46,  8.97, 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&h=400&fit=crop&q=80', 'Porte du Sahara, Douz est le point de départ idéal pour des expéditions.',              '["Porte du Sahara","Méharées","Festival"]',                      'Oct - Avr',         '🐪', 'linear-gradient(135deg, #2a1a0e, #3a2814)');

-- ── Reviews ──────────────────────────────────────────────────
INSERT INTO reviews (user_id, event_id, user_name, rating, comment, status) VALUES
(3, 1, 'Amira B.',  5, 'Expérience magique, organisation parfaite, les guides sont très professionnels.', 'published'),
(3, 2, 'Karim L.',  4, 'Très belle randonnée, paysages incroyables. Je recommande vivement.',             'published'),
(3, 3, 'Sara M.',   5, 'Un bivouac inoubliable sous les étoiles du désert. Merci TuniTrail !',            'published');

-- ── Bookings (demo) ──────────────────────────────────────────
INSERT INTO reservations (ref_code, user_id, event_id, event_title, event_date, event_loc, event_cls, price, option_label, ticket_count, status) VALUES
('#TT-2024-0412', 3, 1, 'Camping Zaghouan', '15 Avr', 'Zaghouan',  'th-z', '178 DT', 'Standard', 2, 'confirmed'),
('#TT-2024-0411', 3, 2, 'Trek Ichkeul',     '22 Avr', 'Bizerte',   'th-i', '65 DT',  'Premium',  1, 'pending'),
('#TT-2024-0410', 3, 3, 'Ksar Hadada',      '29 Avr', 'Tataouine', 'th-k', '435 DT', 'Standard', 3, 'confirmed'),
('#TT-2024-0409', 3, 4, 'Cap Bon',          '6 Mai',  'Nabeul',    'th-c', '70 DT',  'Standard', 2, 'cancelled');

-- ── Community Posts ──────────────────────────────────────────
INSERT INTO community_posts (user_id, author_name, author_avatar, location, image, caption, likes_count, comments_count) VALUES
(3, 'Mehdi Gouia',      'M',  'Camping Zaghouan',  'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600&h=600&fit=crop', 'Quelle vue incroyable au lever du soleil! 🏔️✨', 342, 45),
(3, 'Linda Li',         'L',  'Trek Ichkeul',      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=600&fit=crop', 'Bivouac sous les étoiles... un moment magique 🌟🏕️', 523, 78),
(3, 'Mohamed Abouda',   'MA', 'Bivouac Tataouine', 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=600&fit=crop', 'Avec les amis dans le désert de Tataouine 🐪🌅',     678, 92),
(3, 'Rayen Benbarek',   'R',  'Rando Tabarka',     'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=600&h=600&fit=crop', 'Les paysages côtiers de Tabarka! 🌊⛰️',              451, 64),
(3, 'Helena Fa',        'H',  'Kayak Djerba',      'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600&h=600&fit=crop', 'Vacances en famille à Djerba 🏖️',                    612, 88);

-- ── Chat Messages ────────────────────────────────────────────
INSERT INTO chat_messages (user_id, author_name, author_avatar, message, is_ai) VALUES
(3,    'Mehdi Gouia',      'M',  'Quelqu''un pour une randonnée ce week-end ?',                              FALSE),
(3,    'Linda Li',         'L',  'Je suis partante! Où pensez-vous aller?',                                  FALSE),
(3,    'Mohamed Abouda',   'MA', 'Tabarka serait sympa, j''ai entendu dire que c''était magnifique',         FALSE),
(3,    'Rayen Benbarek',   'R',  'J''ai des coordonnées pour les meilleurs spots de camping là-bas',         FALSE);
