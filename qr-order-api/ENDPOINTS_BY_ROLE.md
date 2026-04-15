# Endpoints par Rôle - QR-Order API

Ce document liste les routes techniques accessibles pour chaque profil utilisateur.

---

## 🔑 SUPER_ADMIN (Administration Système)
*Gestion globale de la plateforme SaaS.*

| Méthode | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/admin/stats` | Statistiques globales de la plateforme |
| `GET` | `/api/v1/admin/restaurants` | Liste de tous les restaurants inscrits |
| `PUT` | `/api/v1/admin/restaurants/:id/active` | Activer/Désactiver un établissement |

---

## 👑 OWNER (Propriétaire)
*Contrôle total sur son établissement.*

### 🏠 Gestion Restaurant & Équipe
| Méthode | Endpoint | Description |
| :--- | :--- | :--- |
| `PUT` | `/api/v1/restaurants/:id` | Configurer le profil (Adresse, Tel, Logo) |
| `PUT` | `/api/v1/restaurants/:id/settings` | **Réglages & Permissions Dynamiques** |
| `GET` | `/api/v1/restaurants/:id/stats` | Tableau de bord (Ventes, Commandes, Effectif) |
| `POST` | `/api/v1/staff/invite` | Inviter un Manager ou un Staff |
| `PUT` | `/api/v1/staff/:id/role` | Changer le rôle d'un membre |
| `DELETE` | `/api/v1/staff/:id` | Supprimer un membre du personnel |

### 📋 Menu & Infrastructure
| Méthode | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/menus/categories` | Créer une catégorie de menu |
| `PUT` | `/api/v1/menus/categories/:id` | Modifier une catégorie |
| `POST` | `/api/v1/menus/items/reorder` | Réorganiser l'ordre des plats |
| `DELETE` | `/api/v1/menus/items/:id` | Supprimer un plat définitivement |
| `POST` | `/api/v1/tables` | Créer une table (individuelle ou en masse) |
| `GET` | `/api/v1/orders` | Voir l'historique complet des commandes |

---

## 🛠️ MANAGER (Gérant)
*Droits opérationnels (soumis aux permissions de l'Owner).*

| Méthode | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/restaurants/:id/stats` | Voir le Dashboard (si activé) |
| `PUT` | `/api/v1/orders/:id/status` | Gérer le flux des commandes |
| `POST` | `/api/v1/tables` | Gérer le plan de salle |
| `GET` | `/api/v1/staff/restaurant/:id` | Voir la liste de l'équipe |

---

## 👨‍🍳 STAFF (Personnel / Cuisine)
*Gestion des commandes et du menu.*

| Méthode | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/orders/restaurant/:id` | Voir les commandes en cours |
| `PUT` | `/api/v1/orders/:id/status` | Changer le statut (ex: Prêt) |
| `PUT` | `/api/v1/menus/items/:id` | Modifier un plat (ex: Rupture de stock) |

---

## 🍽️ CUSTOMER (Client / Public)
*Routes accessibles via scan QR Code.*

| Méthode | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/restaurants/:id` | Voir les infos du restaurant |
| `GET` | `/api/v1/menus/categories/:id` | Consulter la carte (Menu) |
| `POST` | `/api/v1/orders` | **Valider une commande** |
| `GET` | `/api/v1/orders/:id` | Suivre l'avancement de son plat |
| `POST` | `/api/v1/payments/create-session` | Payer l'addition via Stripe |

---

## 🔐 Routes Communes (Authentifié)
- `GET /api/v1/users/profile` : Voir son profil personnel.
- `PUT /api/v1/users/password` : Changer son mot de passe.
- `POST /api/v1/auth/refresh` : Rafraîchir son jeton de connexion.
