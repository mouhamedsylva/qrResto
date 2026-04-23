# 🚀 Exécuter le script de correction maintenant

## ⚡ Commande rapide

```bash
cd qr-order-api
npm run fix:staff-members
```

## 📋 Prérequis

Avant d'exécuter le script, assurez-vous que :

1. ✅ MySQL est démarré
2. ✅ Le fichier `.env` est configuré correctement
3. ✅ La base de données `qr_order_db` existe
4. ✅ Vous êtes dans le dossier `qr-order-api`

## 🔍 Vérification rapide

### Vérifier MySQL

```bash
# Windows (XAMPP, WAMP, etc.)
# Vérifier que MySQL est démarré dans le panneau de contrôle
```

### Vérifier le .env

```bash
cat .env
```

Doit contenir :
```
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=
DATABASE_NAME=qr_order_db
```

## 🚀 Exécution

```bash
cd qr-order-api
npm run fix:staff-members
```

## ✅ Résultat attendu

```
🚀 Démarrage du script de correction des entrées staff_members

🔄 Initialisation de la connexion à la base de données...
✅ Connexion établie

🔍 Recherche des membres d'équipe...
📊 X membre(s) d'équipe trouvé(s)

✅ Entrée créée pour ...
⏭️  Entrée existante pour ...

============================================================
📊 RÉSUMÉ
============================================================
✅ Entrées créées      : X
⏭️  Entrées existantes  : X
❌ Erreurs             : 0
📊 Total traité        : X
============================================================

✅ Script terminé avec succès
```

## ❌ En cas d'erreur

### Erreur de connexion

```
❌ Erreur lors de l'exécution du script :
connect ECONNREFUSED 127.0.0.1:3306
```

**Solution** : Démarrer MySQL

### Base de données introuvable

```
❌ Erreur lors de l'exécution du script :
Unknown database 'qr_order_db'
```

**Solution** : Créer la base de données
```sql
CREATE DATABASE qr_order_db;
```

### Erreur d'authentification

```
❌ Erreur lors de l'exécution du script :
Access denied for user 'root'@'localhost'
```

**Solution** : Vérifier les credentials dans `.env`

## 🎯 Après l'exécution

1. Aller sur Staff.tsx
2. Essayer de modifier le statut d'un membre
3. ✅ Ça devrait fonctionner sans erreur 404

---

**Prêt ?** Exécutez maintenant : `npm run fix:staff-members` 🚀
