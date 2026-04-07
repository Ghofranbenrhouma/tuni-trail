# TuniTrail — Guide de démarrage

## Architecture

```
tuniTrail-final/
├── backend/          Node.js + Express + MySQL
│   ├── server.js
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── config/db.js
│   └── database/
│       ├── schema.sql   ← créer les tables
│       └── seed.sql     ← données de démo
└── frontend/         React + Vite
    └── src/
        ├── services/api.js   ← couche API centralisée
        ├── context/          ← AuthContext, CartContext, etc.
        └── pages/
```

## Prérequis

- Node.js 18+
- MySQL 8+

---

## 1. Base de données

```bash
# Se connecter à MySQL
mysql -u root -p

# Créer la base
CREATE DATABASE tunitrail CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tunitrail;

# Importer le schéma
SOURCE /chemin/vers/backend/database/schema.sql;

# (Optionnel) Importer les données de démo
SOURCE /chemin/vers/backend/database/seed.sql;
```

---

## 2. Backend

```bash
cd backend

# Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos identifiants MySQL

# Installer les dépendances
npm install

# Démarrer
npm run dev        # développement (rechargement auto)
# ou
npm start          # production
```

Le backend tourne sur **http://localhost:5000**  
Vérifier : http://localhost:5000/api/health

---

## 3. Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Démarrer
npm run dev
```

Le frontend tourne sur **http://localhost:5173**  
Le proxy Vite redirige automatiquement `/api/*` → `http://localhost:5000`.

---

## Compte admin par défaut

Après import du seed.sql :

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| admin@tunitrail.com | admin123 | Admin |
| org@demo.com | demo1234 | Organisateur |
| user@demo.com | demo1234 | Aventurier |

---

## Changements v2 — Migration localStorage → API

Toutes les données sont maintenant gérées côté serveur :

| Fonctionnalité | Avant | Après |
|---|---|---|
| Authentification | localStorage (mots de passe en clair !) | JWT via `/api/auth` |
| Panier | localStorage par user | `/api/cart` (MySQL) |
| Wishlist | localStorage par user | `/api/wishlist` (MySQL) |
| Commandes | localStorage par user | `/api/orders` (MySQL) |
| Réservations | localStorage par user | `/api/reservations` (MySQL) |
| Vérification QR | scan localStorage | `/api/reservations/verify-qr` |
| Avis | localStorage par event | `/api/reviews` (MySQL) |
| Posts communauté | données statiques | `/api/community/posts` (MySQL) |
| Produits boutique | données statiques | `/api/products` (MySQL) |

Le token JWT est conservé en **sessionStorage** (effacé à la fermeture de l'onglet).  
Aucune donnée sensible dans le navigateur.
