export const EVENTS = [
  { id:1, title:"Camping Zaghouan — Nuit sous les étoiles", cat:"Camping", loc:"Zaghouan", date:"15 Avr", dur:"2 jours", price:"89 DT", diff:"Facile", cls:"th-z", org:"Tribus Aventure", rating:"4.9", rev:142 },
  { id:2, title:"Trek Ichkeul — Zone humide UNESCO", cat:"Trek", loc:"Bizerte", date:"22 Avr", dur:"1 jour", price:"45 DT", diff:"Modéré", cls:"th-i", org:"NatureVoyage", rating:"4.7", rev:89 },
  { id:3, title:"Ksar Hadada — Bivouac saharien", cat:"Bivouac", loc:"Tataouine", date:"29 Avr", dur:"3 jours", price:"145 DT", diff:"Difficile", cls:"th-k", org:"Desert Trail", rating:"5.0", rev:64 },
  { id:4, title:"Cap Bon — Randonnée côtière", cat:"Rando", loc:"Nabeul", date:"6 Mai", dur:"1 jour", price:"35 DT", diff:"Facile", cls:"th-c", org:"Bleu Aventure", rating:"4.8", rev:201 },
  { id:5, title:"Forêt de Babouch — Camping pineraie", cat:"Camping", loc:"Tabarka", date:"13 Mai", dur:"2 jours", price:"75 DT", diff:"Facile", cls:"th-b", org:"Tribus Aventure", rating:"4.6", rev:118 },
  { id:6, title:"Jebel Serj — Ascension panoramique", cat:"Escalade", loc:"Siliana", date:"20 Mai", dur:"1 jour", price:"55 DT", diff:"Difficile", cls:"th-s", org:"Summit Tunisia", rating:"4.9", rev:77 },
];

export const REVS = [
  { name:"Amira B.", ev:"Camping Zaghouan", d:"12 Avr", r:5, q:"Expérience magique, organisation parfaite, les guides sont très professionnels.", c:"rgba(125,184,83,.15)", tc:"var(--lime2)" },
  { name:"Karim L.", ev:"Trek Ichkeul", d:"5 Avr", r:4, q:"Très belle randonnée, paysages incroyables. Je recommande vivement.", c:"rgba(201,138,26,.15)", tc:"var(--amber)" },
  { name:"Sara M.", ev:"Ksar Hadada", d:"28 Mar", r:5, q:"Un bivouac inoubliable sous les étoiles du désert. Merci TuniTrail !", c:"rgba(100,148,216,.15)", tc:"#a0b8d8" },
];

export const BARD = {
  '7j': [
    {l:'Lu',v:320},{l:'Ma',v:480},{l:'Me',v:390},{l:'Je',v:520},{l:'Ve',v:680},{l:'Sa',v:890},{l:'Di',v:1240}
  ],
  '30j': [
    {l:'S1',v:2100},{l:'S2',v:3400},{l:'S3',v:2800},{l:'S4',v:4200}
  ],
  '90j': [
    {l:'Jan',v:8200},{l:'Fév',v:11400},{l:'Mar',v:9800}
  ],
};

export const EVLIST = [
  { title:"Camping Zaghouan", date:"15 Avr", loc:"Zaghouan", sold:34, cap:40, rev:3026, st:"published", cls:"th-z" },
  { title:"Trek Ichkeul", date:"22 Avr", loc:"Bizerte", sold:18, cap:25, rev:810, st:"published", cls:"th-i" },
  { title:"Ksar Hadada Bivouac", date:"29 Avr", loc:"Tataouine", sold:7, cap:12, rev:1015, st:"published", cls:"th-k" },
  { title:"Cap Bon Côtière", date:"6 Mai", loc:"Nabeul", sold:0, cap:30, rev:0, st:"draft", cls:"th-c" },
];

export const BOOKINGS_TABLE = [
  { ref:"#TT-2024-0412", name:"Ahmed Ben Ali", ev:"Camping Zaghouan", date:"15 Avr", tkt:"Standard", qty:2, total:"178 DT", st:"confirmed" },
  { ref:"#TT-2024-0411", name:"Leila Mansouri", ev:"Trek Ichkeul", date:"22 Avr", tkt:"Premium", qty:1, total:"65 DT", st:"pending" },
  { ref:"#TT-2024-0410", name:"Mohamed Trabelsi", ev:"Ksar Hadada", date:"29 Avr", tkt:"Standard", qty:3, total:"435 DT", st:"confirmed" },
  { ref:"#TT-2024-0409", name:"Fatma Chaabane", ev:"Cap Bon", date:"6 Mai", tkt:"Standard", qty:2, total:"70 DT", st:"cancelled" },
];

// ── STORE : Équipements de camping ──────────────────────────────────────────
export const STORE_CATEGORIES = [
  'Tous', 'Tentes', 'Sacs de couchage', 'Sacs à dos', 'Éclairage',
  'Cuisine', 'Vêtements', 'Navigation', 'Premiers secours', 'Accessoires'
]

export const STORE_PRODUCTS = [
  // Tentes
  { id:'p1', name:'Tente Dôme 2 personnes', cat:'Tentes', price:'189 DT', priceNum:189, badge:'Bestseller', badgeCls:'badge-lime', icon:'⛺', desc:'Légère et imperméable, montage en 5 min. Idéale pour le camping tunisien.', rating:'4.8', rev:124, inStock:true, cls:'prod-green' },
  { id:'p2', name:'Tente Familiale 4 personnes', cat:'Tentes', price:'320 DT', priceNum:320, badge:'Nouveau', badgeCls:'badge-amber', icon:'🏕', desc:'Grande tente ventilée avec séjour séparé. Parfaite pour les sorties en famille.', rating:'4.6', rev:67, inStock:true, cls:'prod-earth' },
  { id:'p3', name:'Tente Ultra-légère 1 personne', cat:'Tentes', price:'245 DT', priceNum:245, badge:'Pro', badgeCls:'badge-blue', icon:'⛺', desc:'500g seulement. Pour les treks solitaires en montagne.', rating:'4.9', rev:89, inStock:true, cls:'prod-stone' },
  // Sacs de couchage
  { id:'p4', name:'Sac de couchage -5°C', cat:'Sacs de couchage', price:'135 DT', priceNum:135, badge:'Bestseller', badgeCls:'badge-lime', icon:'🛏', desc:'Garnissage synthétique, séchage rapide. Confort jusqu\'à -5°C.', rating:'4.7', rev:201, inStock:true, cls:'prod-blue' },
  { id:'p5', name:'Sac de couchage Duvet -15°C', cat:'Sacs de couchage', price:'280 DT', priceNum:280, badge:'Premium', badgeCls:'badge-amber', icon:'🛏', desc:'Duvet 90%, compressible. Pour les nuits froides en altitude.', rating:'4.9', rev:55, inStock:true, cls:'prod-navy' },
  { id:'p6', name:'Sac de couchage Été +5°C', cat:'Sacs de couchage', price:'75 DT', priceNum:75, badge:'Promo', badgeCls:'badge-red', icon:'🛏', desc:'Léger et aéré. Parfait pour les bivouacs d\'été tunisiens.', rating:'4.5', rev:143, inStock:true, cls:'prod-warm' },
  // Sacs à dos
  { id:'p7', name:'Sac à dos 45L', cat:'Sacs à dos', price:'165 DT', priceNum:165, badge:'Bestseller', badgeCls:'badge-lime', icon:'🎒', desc:'Armature aluminium, ceinture lombaire. Idéal pour 3-4 jours de trek.', rating:'4.8', rev:178, inStock:true, cls:'prod-green' },
  { id:'p8', name:'Sac à dos 65L Expédition', cat:'Sacs à dos', price:'235 DT', priceNum:235, badge:'Pro', badgeCls:'badge-blue', icon:'🎒', desc:'Système de portage ergonomique. Pour les longues expéditions.', rating:'4.7', rev:92, inStock:true, cls:'prod-earth' },
  { id:'p9', name:'Sac à dos Journée 20L', cat:'Sacs à dos', price:'85 DT', priceNum:85, badge:'', badgeCls:'', icon:'🎒', desc:'Compact et léger. Poche hydratation compatible. Pour les randonnées journées.', rating:'4.6', rev:231, inStock:true, cls:'prod-stone' },
  // Éclairage
  { id:'p10', name:'Lampe frontale 350 lumens', cat:'Éclairage', price:'45 DT', priceNum:45, badge:'Bestseller', badgeCls:'badge-lime', icon:'🔦', desc:'Rechargeable USB-C, étanche IPX4. Autonomie 8h.', rating:'4.9', rev:312, inStock:true, cls:'prod-yellow' },
  { id:'p11', name:'Lanterne de camp solaire', cat:'Éclairage', price:'65 DT', priceNum:65, badge:'Éco', badgeCls:'badge-lime', icon:'🏮', desc:'Panneau solaire intégré, 3 modes d\'éclairage. Zéro batterie.', rating:'4.7', rev:89, inStock:true, cls:'prod-amber' },
  { id:'p12', name:'Bâtons lumineux d\'urgence', cat:'Éclairage', price:'18 DT', priceNum:18, badge:'', badgeCls:'', icon:'✨', desc:'Pack de 10. Signalisation nocturne. Durée 8h.', rating:'4.4', rev:445, inStock:true, cls:'prod-red' },
  // Cuisine
  { id:'p13', name:'Réchaud à gaz compact', cat:'Cuisine', price:'55 DT', priceNum:55, badge:'Bestseller', badgeCls:'badge-lime', icon:'🔥', desc:'Aluminium, poids 85g. Compatible cartouches standard.', rating:'4.8', rev:267, inStock:true, cls:'prod-orange' },
  { id:'p14', name:'Gamelle titane 700ml', cat:'Cuisine', price:'72 DT', priceNum:72, badge:'Léger', badgeCls:'badge-blue', icon:'🫕', desc:'Titane grade 1, 98g. Anti-adhérent naturel.', rating:'4.6', rev:134, inStock:true, cls:'prod-stone' },
  { id:'p15', name:'Kit vaisselle camping 4 pers.', cat:'Cuisine', price:'89 DT', priceNum:89, badge:'', badgeCls:'', icon:'🍽', desc:'Assiettes, bols, couverts pliants. Empilable, léger.', rating:'4.5', rev:78, inStock:true, cls:'prod-earth' },
  { id:'p16', name:'Filtre à eau portable', cat:'Cuisine', price:'95 DT', priceNum:95, badge:'Essentiel', badgeCls:'badge-blue', icon:'💧', desc:'Filtre 0.1 micron, 1000L de capacité. Eau potable partout.', rating:'4.9', rev:198, inStock:true, cls:'prod-blue' },
  // Vêtements
  { id:'p17', name:'Veste imperméable 3 couches', cat:'Vêtements', price:'225 DT', priceNum:225, badge:'Nouveau', badgeCls:'badge-amber', icon:'🧥', desc:'Membrane Gore-Tex®. Protection totale contre pluie et vent.', rating:'4.8', rev:56, inStock:true, cls:'prod-navy' },
  { id:'p18', name:'Chaussures de trek basses', cat:'Vêtements', price:'185 DT', priceNum:185, badge:'Bestseller', badgeCls:'badge-lime', icon:'👟', desc:'Semelle Vibram®, imperméable. Légères et confortables.', rating:'4.7', rev:189, inStock:true, cls:'prod-brown' },
  { id:'p19', name:'Guêtres imperméables', cat:'Vêtements', price:'55 DT', priceNum:55, badge:'', badgeCls:'', icon:'🧦', desc:'Protection contre boue et eau. Compatibles tous types de chaussures.', rating:'4.5', rev:67, inStock:true, cls:'prod-green' },
  // Navigation
  { id:'p20', name:'Boussole de randonnée', cat:'Navigation', price:'35 DT', priceNum:35, badge:'Essentiel', badgeCls:'badge-blue', icon:'🧭', desc:'Miroir de visée, déclinaison réglable. Précision militaire.', rating:'4.9', rev:234, inStock:true, cls:'prod-stone' },
  { id:'p21', name:'GPS de randonnée', cat:'Navigation', price:'420 DT', priceNum:420, badge:'Premium', badgeCls:'badge-amber', icon:'📡', desc:'Cartographie topographique Tunisie incluse. Batterie 25h.', rating:'4.8', rev:44, inStock:true, cls:'prod-blue' },
  { id:'p22', name:'Altimètre / Baromètre', cat:'Navigation', price:'125 DT', priceNum:125, badge:'', badgeCls:'', icon:'🌡', desc:'Prévisions météo, altimètre barométrique. Montre multi-sport.', rating:'4.6', rev:88, inStock:true, cls:'prod-navy' },
  // Premiers secours
  { id:'p23', name:'Kit premiers secours complet', cat:'Premiers secours', price:'65 DT', priceNum:65, badge:'Essentiel', badgeCls:'badge-red', icon:'🩺', desc:'42 pièces, sac étanche. Conforme normes européennes EN 13485.', rating:'4.9', rev:312, inStock:true, cls:'prod-red' },
  { id:'p24', name:'Couverture de survie', cat:'Premiers secours', price:'12 DT', priceNum:12, badge:'', badgeCls:'', icon:'🆘', desc:'Aluminium mylar, réflexion 90% de la chaleur. Compacte.', rating:'4.7', rev:567, inStock:true, cls:'prod-warm' },
  // Accessoires
  { id:'p25', name:'Tapis de sol isolant', cat:'Accessoires', price:'45 DT', priceNum:45, badge:'', badgeCls:'', icon:'🛏', desc:'Mousse EVA haute densité, R-Value 2.0. Isolation du sol.', rating:'4.5', rev:145, inStock:true, cls:'prod-green' },
  { id:'p26', name:'Corde de camp 10m', cat:'Accessoires', price:'28 DT', priceNum:28, badge:'', badgeCls:'', icon:'🧵', desc:'Polypropylène 4mm, charge 200kg. Tente bâche, linge, sécurité.', rating:'4.6', rev:89, inStock:true, cls:'prod-earth' },
  { id:'p27', name:'Pioches de tente x8', cat:'Accessoires', price:'22 DT', priceNum:22, badge:'Pack', badgeCls:'badge-lime', icon:'⚒', desc:'Aluminium anodisé, ultra-légères. Tiennent dans tous les terrains.', rating:'4.7', rev:203, inStock:true, cls:'prod-stone' },
  { id:'p28', name:'Powerbank solaire 20000mAh', cat:'Accessoires', price:'155 DT', priceNum:155, badge:'Nouveau', badgeCls:'badge-amber', icon:'🔋', desc:'2 panneaux solaires, 3 sorties USB. Charge rapide 18W.', rating:'4.8', rev:67, inStock:true, cls:'prod-yellow' },
]

// ── EVENT DETAILS (extended info for detail pages) ─────────────────────────
export const EVENTS_DETAIL = {
  1: {
    description: `Passez une nuit inoubliable sous les étoiles dans les hauteurs de Zaghouan, au cœur du parc national de Zaghouan. Niché entre les collines boisées et les ruines romaines du temple des Eaux, ce camping offre un cadre unique alliant nature sauvage et patrimoine historique.\n\nVos guides expérimentés de Tribus Aventure vous accompagneront tout au long de cette aventure : randonnée crépusculaire jusqu'au sommet, dîner berbère autour du feu, observation des étoiles au télescope, et petit-déjeuner au lever du soleil avec vue panoramique sur la plaine de la Manouba.`,
    includes: ['Tente et matelas fournis', 'Dîner berbère traditionnel', 'Petit-déjeuner inclus', 'Guide certifié', 'Télescope pour observation'],
    excludes: ['Transport depuis Tunis', 'Équipement de randonnée personnel', 'Assurance voyage'],
    program: [
      { time: 'Jour 1 — 15h00', desc: 'Départ depuis le point de ralliement à Zaghouan' },
      { time: '17h00', desc: 'Arrivée au camp et installation des tentes' },
      { time: '19h00', desc: 'Randonnée crépusculaire au sommet du Jebel Zaghouan (1 295m)' },
      { time: '21h00', desc: 'Dîner berbère autour du feu de camp' },
      { time: '22h30', desc: 'Séance d\'observation des étoiles avec télescope' },
      { time: 'Jour 2 — 06h30', desc: 'Lever du soleil panoramique' },
      { time: '07h30', desc: 'Petit-déjeuner traditionnel' },
      { time: '09h00', desc: 'Visite du Temple des Eaux (époque romaine)' },
      { time: '11h00', desc: 'Retour et fin de l\'aventure' },
    ],
    lat: 36.4024, lng: 10.1353,
    mapLabel: 'Jebel Zaghouan, Zaghouan',
    images: ['th-z', 'th-b', 'th-s'],
    maxPeople: 20,
    minAge: 8,
    options: [
      { id: 'std', label: 'Standard', price: 89, desc: 'Tente 2 personnes partagée, repas inclus' },
      { id: 'prm', label: 'Premium', price: 129, desc: 'Tente individuelle, kit confort + boisson chaude offerte' },
    ],
  },
  2: {
    description: `Explorez le parc national d'Ichkeul, classé au patrimoine mondial de l'UNESCO — l'une des dernières zones humides d'Afrique du Nord. Cette randonnée guidée vous emmène à travers les marais, les prairies et les flancs du Jebel Ichkeul, habitat de milliers d'oiseaux migrateurs.\n\nVous découvrirez une biodiversité exceptionnelle : flamants roses, canards siffleurs, hérons cendrés… Un moment suspendu entre ciel et eau, encadré par les experts naturalistes de NatureVoyage.`,
    includes: ['Guide naturaliste certifié', 'Jumelles fournies', 'Lunch panier', 'Entrée parc nationale'],
    excludes: ['Transport', 'Chaussures de randonnée', 'Crème solaire'],
    program: [
      { time: '07h30', desc: 'Rendez-vous à l\'entrée du parc d\'Ichkeul' },
      { time: '08h00', desc: 'Introduction naturaliste et présentation des espèces' },
      { time: '09h00', desc: 'Randonnée dans les marais et observation des oiseaux' },
      { time: '11h30', desc: 'Ascension partielle du Jebel Ichkeul (511m), vue panoramique' },
      { time: '13h00', desc: 'Pause déjeuner au sommet' },
      { time: '14h30', desc: 'Retour par le lac, visite du musée de l\'écosystème' },
      { time: '16h30', desc: 'Fin de la journée' },
    ],
    lat: 37.1575, lng: 9.6699,
    mapLabel: 'Parc National d\'Ichkeul, Bizerte',
    images: ['th-i', 'th-z', 'th-c'],
    maxPeople: 15,
    minAge: 10,
    options: [
      { id: 'std', label: 'Standard', price: 45, desc: 'Randonnée guidée + lunch + entrée parc' },
      { id: 'fam', label: 'Famille (2 adultes + 2 enfants)', price: 120, desc: 'Tarif famille avec activités enfants adaptées' },
    ],
  },
  3: {
    description: `Vivez un bivouac authentique dans l'erg de Ksar Ghilane, aux portes du Grand Erg Oriental. Ksar Hadada — forteresse berbère en pisé datant du XIIe siècle — sera votre camp de base pour trois jours d'immersion totale dans le désert tunisien.\n\nLe team Desert Trail vous guide à dos de dromadaire entre les dunes, vous initie à la cuisine saharienne et vous fait dormir sous un ciel étoilé d'une densité incomparable. Une expérience transformatrice, loin de tout.`,
    includes: ['Nuit en tente saharienne (2 nuits)', 'Tous les repas (cuisine berbère)', 'Balade à dos de dromadaire', 'Guide désert', 'Transfert depuis Tataouine ville'],
    excludes: ['Vol / transport jusqu\'à Tataouine', 'Assurance désert', 'Vêtements chauds (nuits froides)'],
    program: [
      { time: 'Jour 1 — 14h00', desc: 'Départ de Tataouine en 4x4 vers Ksar Hadada' },
      { time: '16h00', desc: 'Visite du ksar et installation du camp' },
      { time: '18h30', desc: 'Balade à dromadaire au coucher du soleil' },
      { time: '20h00', desc: 'Dîner sous les étoiles, musique gnawa' },
      { time: 'Jour 2', desc: 'Excursion full-day dans les dunes, exploration de l\'erg' },
      { time: 'Jour 3 — 06h00', desc: 'Lever de soleil sur les dunes, thé des nomades' },
      { time: '10h00', desc: 'Retour à Tataouine' },
    ],
    lat: 32.9999, lng: 10.0979,
    mapLabel: 'Ksar Hadada, Tataouine',
    images: ['th-k', 'th-z', 'th-b'],
    maxPeople: 12,
    minAge: 12,
    options: [
      { id: 'std', label: 'Standard', price: 145, desc: 'Tente partagée, tous repas, dromadaire' },
      { id: 'prm', label: 'Premium Bivouac', price: 195, desc: 'Tente privée luxe, menu gastronomique berbère' },
    ],
  },
  4: {
    description: `Partez à la découverte de la côte de Cap Bon, l'un des joyaux naturels de la Tunisie. Cette randonnée côtière longe les falaises calcaires blanches, les criques turquoise et les forêts d'eucalyptus parfumées entre Kelibia et Kerkouane.\n\nBleu Aventure vous propose une journée légère et ressourçante, idéale pour les débutants et les familles, avec des arrêts baignade dans des criques sauvages et une halte déjeuner dans un restaurant de pêcheurs local.`,
    includes: ['Guide accompagnateur', 'Lunch dans restaurant local', 'Transport depuis Nabeul', 'Arrêts baignade'],
    excludes: ['Maillot de bain et serviette', 'Crème solaire', 'Dépenses personnelles'],
    program: [
      { time: '07h00', desc: 'Départ depuis Nabeul centre' },
      { time: '08h30', desc: 'Début de la randonnée à Kelibia, vue sur le fort byzantin' },
      { time: '10h00', desc: 'Crique sauvage, baignade libre (1h)' },
      { time: '12h30', desc: 'Déjeuner chez un pêcheur local — poisson frais' },
      { time: '14h30', desc: 'Continuation vers Kerkouane (site phénicien UNESCO)' },
      { time: '16h30', desc: 'Retour à Nabeul' },
    ],
    lat: 36.8977, lng: 11.0945,
    mapLabel: 'Cap Bon, Nabeul',
    images: ['th-c', 'th-i', 'th-z'],
    maxPeople: 25,
    minAge: 6,
    options: [
      { id: 'std', label: 'Standard', price: 35, desc: 'Randonnée + déjeuner + transport' },
      { id: 'fam', label: 'Famille (2A+2E)', price: 90, desc: 'Tarif famille, activités adaptées enfants' },
    ],
  },
  5: {
    description: `Dormez au cœur de la forêt de pins de Babouch, dans le nord-ouest de la Tunisie, proche de la frontière algérienne. Ce camping intimiste au milieu des pinèdes offre une atmosphère fraîche et apaisante, loin des chaleurs estivales.\n\nTribus Aventure propose un séjour complet : randonnée dans les forêts de chênes-lièges, reconnaissance de la flore endémique, feu de camp et soirée contes berbères, nuit sous les pins avec chants d'oiseaux au réveil.`,
    includes: ['Tente et literie', 'Repas du soir et petit-déjeuner', 'Guide forestier', 'Activité cueillette et botanique'],
    excludes: ['Transport depuis Tabarka', 'Équipement de pluie', 'Collations'],
    program: [
      { time: 'Jour 1 — 13h00', desc: 'Accueil au camp de Babouch' },
      { time: '14h30', desc: 'Randonnée découverte de la forêt de chênes-lièges' },
      { time: '17h00', desc: 'Atelier botanique : plantes endémiques du Nord-Ouest' },
      { time: '19h30', desc: 'Dîner rustique autour du feu' },
      { time: '21h00', desc: 'Soirée contes et traditions berbères' },
      { time: 'Jour 2 — 07h00', desc: 'Petit-déjeuner dans les pins, écoute des oiseaux' },
      { time: '09h00', desc: 'Balade libre puis départ' },
    ],
    lat: 36.8133, lng: 8.6833,
    mapLabel: 'Forêt de Babouch, Tabarka',
    images: ['th-b', 'th-z', 'th-k'],
    maxPeople: 18,
    minAge: 7,
    options: [
      { id: 'std', label: 'Standard', price: 75, desc: 'Tente partagée, dîner + petit-déjeuner' },
      { id: 'solo', label: 'Solo / Couple', price: 99, desc: 'Tente individuelle, repas premium, kit confort' },
    ],
  },
  6: {
    description: `Relevez le défi de l'ascension du Jebel Serj (1 357m), le deuxième plus haut sommet de Tunisie. Situé dans le gouvernorat de Siliana, ce jebel calcaire offre un panorama exceptionnel sur la dorsale tunisienne — par temps clair, on aperçoit le lac Sbikha et les plaines de Kairouan.\n\nSummit Tunisia vous propose une ascension encadrée par des guides alpinistes certifiés, accessible aux randonneurs expérimentés. Prévoyez de bonnes chaussures, la montagne n'attend pas.`,
    includes: ['Guide alpiniste certifié', 'Corde et matériel de sécurité', 'Lunch au sommet', 'Certificat d\'ascension'],
    excludes: ['Chaussures de trekking (obligatoires)', 'Transport', 'Assurance montagne'],
    program: [
      { time: '05h30', desc: 'Départ de Siliana ville' },
      { time: '07h00', desc: 'Début de l\'ascension depuis le village de Kesra' },
      { time: '09h30', desc: 'Passage de la crête nord (zone rocheuse, corde conseillée)' },
      { time: '11h00', desc: 'Arrivée au sommet (1 357m) — panorama 360°' },
      { time: '12h00', desc: 'Déjeuner au sommet, remise du certificat d\'ascension' },
      { time: '13h30', desc: 'Descente par le versant sud' },
      { time: '16h00', desc: 'Retour à Siliana' },
    ],
    lat: 35.9214, lng: 9.2614,
    mapLabel: 'Jebel Serj, Siliana',
    images: ['th-s', 'th-k', 'th-b'],
    maxPeople: 10,
    minAge: 16,
    options: [
      { id: 'std', label: 'Ascension Standard', price: 55, desc: 'Guide + équipement sécurité + lunch sommital' },
      { id: 'prm', label: 'Ascension + Nuit en refuge', price: 95, desc: 'Nuit en refuge de montagne, lever de soleil au sommet le lendemain' },
    ],
  },
}
