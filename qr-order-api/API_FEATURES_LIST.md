# Liste des Fonctionnalités - QR-Order API

Ce document présente une vue d'ensemble exhaustive des capacités de l'API QR-Order.

---

## 🔐 1. Authentification & Sécurité
- **Inscription Intelligente** : Création automatique d'un compte utilisateur et de son établissement lié lors de l'enregistrement d'un Propriétaire (OWNER).
- **Relai de Rôles (RBAC)** : Gestion fine des accès via 5 rôles (`SUPER_ADMIN`, `OWNER`, `MANAGER`, `STAFF`, `CUSTOMER`).
- **Gestion Dynamique des Permissions** : Système de "toggles" permettant au propriétaire d'activer/désactiver des fonctions spécifiques pour son équipe (ex: interdire au staff de modifier le menu).
- **Sécurisation JWT** : Authentification par jeton Bearer pour toutes les routes privées.

## 🏠 2. Gestion du Restaurant
- **Profil d'Établissement** : Personnalisation du nom, adresse, logo, contact et coordonnées.
- **Réglages Visuels** : Configuration des couleurs de marque (primaire/secondaire) pour le menu client.
- **Paramètres Régionaux** : Choix de la devise et de la langue.
- **Module de Taxes** : Activation/Désactivation de la TVA et configuration du taux personnalisé.
- **Dashboard en Temps Réel** : Visualisation des ventes du jour, du nombre de commandes (scans) et de l'effectif présent.

## 📋 3. Menus & Gastronomie
- **Structure Catégorisée** : Organisation par types (Entrées, Plats, Boissons, etc.).
- **Gestion des Articles** : Création complète de plats avec prix, descriptions et images.
- **Options & Modificateurs** : Gestion des suppléments (fromage, sauce) et des préférences (cuisson, taille).
- **Gestion des Stocks** : Possibilité de marquer un produit comme "épuisé" instantanément.
- **Réorganisation** : Tri personnalisé des articles du menu.

## 🛒 4. Système de Commande
- **Double Mode** : Support des commandes à table (Dine-in) et à emporter (Take-away).
- **Flux de Travail (Workflow)** : Suivi complet du statut (`En attente` -> `Préparation` -> `Prêt` -> `Terminé`).
- **Historique & Filtres** : Recherche et filtrage avancé des commandes par date, statut ou table.
- **Totalisation** : Calcul automatique des prix, taxes et frais de service.

## 📍 5. Tables & QR Codes
- **Gestion des Emplacements** : Création de tables individuelles ou création rapide par lot (bulk).
- **Génération Automatique de QR** : Chaque table possède son propre code QR unique liant le client à son emplacement.
- **Statut des Tables** : Visualisation des tables occupées ou libres.

## 💳 6. Paiements & Abonnements
- **Intégration Stripe** : Paiement sécurisé par carte bancaire.
- **Stripe Connect** : Système de répartition des fonds permettant au propriétaire de recevoir ses paiements.
- **Forfaits SaaS** : Gestion des abonnements pour l'accès aux fonctionnalités du service.

## 👥 7. Gestion d'Équipe
- **Recrutement Digital** : Invitation de personnel via email.
- **Hiérarchie Opérationnelle** : Passage de Staff à Manager pour déléguer les responsabilités.
- **Contrôle de l'Équipe** : Possibilité de révoquer des accès instantanément.

## ⚡ 8. Notifications & Temps Réel
- **Alertes Instantanées** : Notification immédiate de la cuisine/salle lors d'une nouvelle commande via WebSockets.
- **Mises à jour client** : Notification du client quand sa commande est "Prête".

## 🛠️ 9. Administration Plateforme (Back-office)
- **Gestion Multi-tenant** : Vue d'ensemble sur tous les restaurants inscrits.
- **Modération** : Activation ou suspension temporaire des établissements.
- **Analytics Plateforme** : Statistiques globales sur l'utilisation du service.
