# Rôles et Permissions Dynamiques - QR-Order API

Ce document récapitule les fonctionnalités accessibles pour chaque rôle utilisateur. **Nouveauté : Le Propriétaire (OWNER) peut désormais activer ou désactiver certaines fonctions pour ses Managers et son Staff.**

---

## 🔑 1. SUPER_ADMIN (Administrateur Plateforme)
*Rôle de gestion globale du système SaaS.*
- **Contrôle Total** : Peut activer/désactiver les restaurants et voir les performances globales.

---

## 👑 2. OWNER (Propriétaire / Créateur)
*Le "Master" du restaurant. Aucun verrou ne s'applique à lui.*
- **Héritage** : Possède tous les droits des Managers et du Staff.
- **Contrôle Dynamique** : Peut configurer les permissions des autres via les réglages du restaurant.
- **Gestion Totale** : Menu, Tables, Commandes, Équipe, Finances.

---

## 🛠️ 3. MANAGER (Gérant)
*Droits étendus, mais soumis aux réglages du Propriétaire.*

- **Dashboard & Stats** : 🟢 *Désactivable* (`managerCanSeeStats`)
- **Gestion du Menu (Plats)** : 🟢 *Désactivable* (`managerCanEditMenu`)
- **Gestion des Commandes** : 🟢 *Désactivable* (`managerCanManageOrders`)
- **Gestion du Personnel** : 🔴 *Désativé par défaut* (`managerCanManageStaff`) - Permet d'inviter ou supprimer du staff.
- **Tables** : Gestion complète des tables et QR Codes.

---

## 👨‍🍳 4. STAFF (Personnel / Serveur)
*Rôle opérationnel, strictement contrôlé.*

- **Saisie de Plats** : 🟢 *Désactivable* (`staffCanEditMenu`)
- **Mise à jour des Commandes** : 🟢 *Désactivable* (`staffCanManageOrders`) - Nécessaire pour marquer une commande comme "Prête".

---

## 🍽️ 5. CUSTOMER (Client / Public)
- **Consultation Menu & Commande** : Accès via QR Code.

---

## ⚙️ Comment configurer les permissions ?
Le Propriétaire peut modifier ces paramètres via l'endpoint :
`PUT /api/v1/restaurants/:id/settings`

### Exemple de corps de requête :
```json
{
  "staffCanEditMenu": false,
  "managerCanManageStaff": true
}
```
*Ici, le Staff ne pourra plus modifier le menu, mais le Manager aura désormais le droit de gérer l'équipe.*
