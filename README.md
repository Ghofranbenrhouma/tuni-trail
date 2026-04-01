# TuniTrail — Frontend

Plateforme de tourisme et camping en Tunisie.

## Stack

- React 18
- Vite 5
- React Router DOM v6

## Lancer le projet

```bash
npm install
npm run dev
```

## Build production

```bash
npm run build
npm run preview
```

## Structure

```
tuniTrail-frontend/
├── public/               # Fichiers statiques
├── src/
│   ├── assets/           # Images, fonts, icônes
│   ├── components/       # Composants réutilisables
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── EventCard.jsx
│   │   ├── Modal.jsx
│   │   ├── Toast.jsx
│   │   └── Marquee.jsx
│   ├── pages/            # Pages principales
│   │   ├── Landing.jsx
│   │   ├── DashboardUser.jsx
│   │   └── DashboardOrg.jsx
│   ├── context/          # Contextes React (panier, auth)
│   │   ├── AuthContext.jsx
│   │   └── CartContext.jsx
│   ├── hooks/            # Hooks personnalisés
│   │   └── useToast.js
│   ├── services/         # Appels API
│   │   └── api.js
│   ├── utils/            # Fonctions utilitaires
│   │   └── helpers.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
└── eslint.config.js
```
