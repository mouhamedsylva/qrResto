# Documentation Complète du Backend - QR-Order API

Ce document détaille l'architecture, les fonctionnalités et la configuration complète du système de commande par QR Code (SaaS Multi-tenant).

## 🚀 Architecture
- **Framework** : NestJS (Node.js)
- **Base de données** : MySQL
- **ORM** : TypeORM
- **Authentification** : Passport-JWT & Bcrypt
- **Paiements** : Stripe (Sessions & Webhooks)
- **Notifications** : Socket.io (Temps-réel)
- **Stockage** : Local (via `multer`)

---

## 🏗️ Structure des Modules

### 1. Authentification (`AuthModule`)
Gère l'inscription, la connexion et la sécurisation des routes.
- **Endpoints** :
  - `POST /auth/register` : Inscription d'un propriétaire (`OWNER`).
  - `POST /auth/login` : Connexion et récupération du token JWT.
- **Sécurité** : `JwtStrategy` valide les tokens et injecte l'utilisateur dans la requête.

### 2. Gestion des Restaurants (`RestaurantsModule`)
Cœur du système multi-tenant.
- **Fonctionnalités** :
  - Création et mise à jour des paramètres du restaurant.
  - Génération de **QR Codes** uniques par table.
  - Isolation des données (chaque restaurant ne voit que ses propres menus/commandes).

### 3. Menus et Catégories (`MenusModule`)
Organisation de la carte.
- **Entités** : `Category` (Groupement) et `MenuItem` (Plats/Boissons).
- **Fonctionnalités** : CRUD complet pour les plats avec gestion des prix et de la disponibilité.

### 4. Tables (`TablesModule`)
Gestion de l'espace physique.
- Chaque table est liée à un restaurant et possède un identifiant unique utilisé dans l'URL du QR Code.

### 5. Commandes (`OrdersModule`)
Gestion du flux client.
- **Statuts** : `PENDING`, `PREPARING`, `READY`, `COMPLETED`, `CANCELLED`.
- **Items** : Enregistre le prix au moment de la commande pour l'historique financier.

### 6. Paiements (`PaymentsModule`)
Intégration Stripe.
- **Flux** :
  1. Client crée une session : `POST /payments/checkout/:orderId`.
  2. Redirection vers Stripe.
  3. Stripe notifie le backend via Webhook : `POST /payments/webhook`.
  4. Le backend met à jour le statut de la commande en `PAID`.

### 7. Notifications (`NotificationsModule`)
Communication temps-réel via WebSockets.
- Les serveurs rejoignent une "room" spécifique à leur restaurant (`restaurant_{id}`).
- Le backend émet des notifications (`newOrder`, `orderStatusUpdated`).

---

## 🛠️ Configuration du Système (`.env`)

Assurez-vous que votre fichier `.env` contient les variables suivantes :

```env
# Server
PORT=3000
APP_CORS_ORIGIN=http://localhost:3000

# Base de Données (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=qr_order_db
DB_USER=root
DB_PASSWORD=votre_mot_de_passe

# Sécurité
JWT_SECRET=super_secret_jwt_key
JWT_EXPIRES_IN=1d

# Stripe
STRIPE_API_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend
FRONTEND_URL=http://localhost:3000
```

---

## 🛡️ Rôles et Autorisations
Le système utilise un `RolesGuard` pour filtrer les accès :
- `SUPER_ADMIN` : Accès global (gestion des souscriptions).
- `OWNER` : Gestion totale de son restaurant.
- `STAFF` : Visualisation et mise à jour des commandes.

---

## 📡 Webhooks Stripe
Pour tester localement les paiements, utilisez le CLI Stripe :
```bash
stripe listen --forward-to localhost:3000/payments/webhook
```
Utilisez la clé fournie par le CLI pour `STRIPE_WEBHOOK_SECRET`.

---

## ✅ État de l'implémentation
Tous les fichiers de base ont été remplis avec la logique métier requise. Le système est prêt pour :
1. L'exécution des migrations TypeORM.
2. La connexion avec le Frontend.
3. Les tests d'intégration des paiements en mode test.
