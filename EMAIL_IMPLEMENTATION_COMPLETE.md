# ✅ Implémentation complète : Envoi automatique d'emails

## 🎯 Objectif
Envoyer automatiquement un email avec le mot de passe généré lorsqu'un membre de l'équipe est invité.

## 📋 Ce qui a été fait

### 1. Backend - Nouveau module Email
✅ **Créé** : `qr-order-api/src/modules/email/email.module.ts`
✅ **Créé** : `qr-order-api/src/modules/email/email.service.ts`

**Fonctionnalités du service :**
- Envoi d'email d'invitation avec mot de passe temporaire
- Envoi d'email de réinitialisation de mot de passe
- Templates HTML professionnels et responsives
- Gestion des erreurs (ne bloque pas la création du membre)
- Logs détaillés pour le débogage

### 2. Backend - Intégration dans le module Users
✅ **Modifié** : `qr-order-api/src/modules/users/users.module.ts`
- Import du EmailModule

✅ **Modifié** : `qr-order-api/src/modules/users/users.service.ts`
- Injection du EmailService
- Appel automatique lors de l'invitation d'un membre
- Appel automatique lors de la réinitialisation de mot de passe
- Récupération du nom du restaurant pour personnaliser l'email

### 3. Configuration
✅ **Modifié** : `qr-order-api/.env.example`
- Ajout des variables SMTP (host, port, user, pass, from)
- Ajout de APP_NAME et FRONTEND_URL

### 4. Documentation
✅ **Créé** : `qr-order-api/EMAIL_SETUP.md`
- Guide complet de configuration SMTP
- Instructions pour Gmail, Outlook, SendGrid, Mailgun
- Dépannage et résolution de problèmes

✅ **Créé** : `qr-order-api/EMAIL_FEATURE_SUMMARY.md`
- Vue d'ensemble de la fonctionnalité
- Aperçu des templates d'emails
- Guide de personnalisation

✅ **Créé** : `qr-order-api/INSTALL_EMAIL_DEPENDENCIES.md`
- Instructions d'installation de Nodemailer

## 🚀 Pour démarrer

### Étape 1 : Installer les dépendances
```bash
cd qr-order-api
npm install nodemailer @types/nodemailer
```

### Étape 2 : Configurer Gmail
1. Activer la validation en deux étapes sur votre compte Gmail
2. Générer un mot de passe d'application :
   - Google Account → Sécurité → Mots de passe des applications
   - Créer un nouveau mot de passe pour "QR Order"
   - Copier le mot de passe généré (16 caractères)

### Étape 3 : Configurer les variables d'environnement
Créer/modifier `qr-order-api/.env` :
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=xxxx-xxxx-xxxx-xxxx
SMTP_FROM=noreply@qrorder.com
APP_NAME=QR Order
FRONTEND_URL=http://localhost:5173
```

### Étape 4 : Redémarrer le serveur
```bash
npm run start:dev
```

### Étape 5 : Tester
1. Aller dans l'interface Staff (http://localhost:5173/staff)
2. Cliquer sur "Inviter un membre"
3. Remplir le formulaire et envoyer
4. Vérifier la boîte email du membre invité

## 📧 Emails envoyés automatiquement

### 1. Email d'invitation (rose #d94a6a)
**Quand ?** Lors de l'invitation d'un nouveau membre

**Contenu :**
- En-tête : "🎉 Bienvenue dans l'équipe !"
- Message personnalisé avec le nom du membre et du restaurant
- Mot de passe temporaire dans une boîte mise en évidence
- Avertissement de sécurité
- Bouton "Se connecter maintenant"
- Footer avec informations légales

### 2. Email de réinitialisation (violet #667eea)
**Quand ?** Lors de la réinitialisation du mot de passe d'un membre

**Contenu :**
- En-tête : "🔐 Réinitialisation de mot de passe"
- Message personnalisé
- Nouveau mot de passe temporaire
- Avertissement de sécurité
- Bouton "Se connecter"
- Footer

## 🔍 Vérification

### Logs du serveur
Vous devriez voir :
```
[EmailService] Email d'invitation envoyé à john@example.com
```

### En cas d'erreur
```
[EmailService] Erreur lors de l'envoi de l'email à john@example.com: ...
```
**Note :** Le membre est quand même créé, le mot de passe est affiché dans l'interface.

## ✨ Avantages

1. **Automatisation totale** - Plus besoin d'envoyer manuellement
2. **Professionnalisme** - Emails HTML élégants
3. **Sécurité** - Mots de passe envoyés de manière sécurisée
4. **Fiabilité** - Fallback manuel si l'email échoue
5. **Traçabilité** - Logs de tous les envois

## 🎨 Templates d'emails

Les templates sont entièrement personnalisables dans `email.service.ts` :

**Éléments personnalisables :**
- Couleurs (actuellement rose pour invitation, violet pour reset)
- Textes et messages
- Structure HTML
- Ajout de logo/images
- Footer

## 📊 Flux de travail

### Invitation d'un membre
```
1. Admin clique "Inviter un membre"
2. Remplit le formulaire (nom, email, rôle)
3. Clique "Envoyer"
   ↓
4. Backend crée le membre
5. Backend génère un mot de passe aléatoire
6. Backend envoie l'email automatiquement
7. Backend retourne le mot de passe à l'interface
   ↓
8. Interface affiche "Membre invité. Mot de passe: ABC123"
9. Membre reçoit l'email avec le mot de passe
10. Membre se connecte et change son mot de passe
```

### Réinitialisation de mot de passe
```
1. Admin clique "Détails" sur un membre
2. Clique "Générer" un mot de passe temporaire
3. Backend génère un nouveau mot de passe
4. Backend envoie l'email automatiquement
5. Backend retourne le mot de passe à l'interface
   ↓
6. Interface affiche le mot de passe
7. Admin peut copier ou envoyer via Gmail (fallback)
8. Membre reçoit l'email avec le nouveau mot de passe
```

## 🔒 Sécurité

- ✅ Mots de passe générés aléatoirement (8 caractères alphanumériques)
- ✅ Mots de passe hashés avec bcrypt avant stockage
- ✅ Emails envoyés via connexion sécurisée (TLS)
- ✅ Avertissement dans l'email pour changer le mot de passe
- ✅ Pas de stockage du mot de passe en clair

## 🐛 Dépannage

### L'email n'arrive pas
1. Vérifier le dossier spam
2. Vérifier les logs du serveur
3. Vérifier les identifiants SMTP dans `.env`
4. Tester avec [SMTP Test Tool](https://www.smtper.net/)

### Erreur "Invalid login"
- Utiliser un mot de passe d'application (pas le mot de passe Gmail)
- Activer la validation en deux étapes sur Gmail

### Erreur "Connection timeout"
- Vérifier que le port 587 n'est pas bloqué
- Essayer le port 465 avec `secure: true`

## 📚 Documentation complète

- **Configuration détaillée** : `qr-order-api/EMAIL_SETUP.md`
- **Vue d'ensemble** : `qr-order-api/EMAIL_FEATURE_SUMMARY.md`
- **Installation** : `qr-order-api/INSTALL_EMAIL_DEPENDENCIES.md`

## 🎉 Résultat final

Maintenant, lorsque vous invitez un membre :
1. ✅ Le membre est créé dans la base de données
2. ✅ Un email professionnel est envoyé automatiquement
3. ✅ Le mot de passe est affiché dans l'interface (backup)
4. ✅ Le membre peut se connecter immédiatement
5. ✅ Tout est tracé dans les logs

**L'expérience est fluide, professionnelle et sécurisée !** 🚀
