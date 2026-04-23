# Configuration de l'envoi d'emails

## 📧 Vue d'ensemble

Le système envoie automatiquement des emails dans les cas suivants :
- **Invitation d'un nouveau membre** : Email avec mot de passe temporaire
- **Réinitialisation de mot de passe** : Email avec nouveau mot de passe temporaire

## 🔧 Configuration avec Gmail

### 1. Créer un mot de passe d'application Gmail

1. Connectez-vous à votre compte Gmail
2. Allez dans **Paramètres du compte Google** → **Sécurité**
3. Activez la **validation en deux étapes** (si ce n'est pas déjà fait)
4. Recherchez **Mots de passe des applications**
5. Sélectionnez **Autre (nom personnalisé)** et entrez "QR Order"
6. Cliquez sur **Générer**
7. Copiez le mot de passe généré (16 caractères)

### 2. Configurer les variables d'environnement

Dans votre fichier `.env`, ajoutez :

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-application
SMTP_FROM=noreply@qrorder.com
APP_NAME=QR Order
FRONTEND_URL=http://localhost:5173
```

**Important :** 
- `SMTP_USER` : Votre adresse Gmail complète
- `SMTP_PASS` : Le mot de passe d'application généré (pas votre mot de passe Gmail)
- `SMTP_FROM` : L'adresse email qui apparaîtra comme expéditeur
- `FRONTEND_URL` : L'URL de votre application frontend (pour les liens dans les emails)

## 🔐 Configuration avec d'autres fournisseurs

### Outlook / Office 365

```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=votre-email@outlook.com
SMTP_PASS=votre-mot-de-passe
```

### SendGrid

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=votre-api-key-sendgrid
```

### Mailgun

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@votre-domaine.mailgun.org
SMTP_PASS=votre-mot-de-passe-mailgun
```

## 📝 Templates d'emails

Les emails sont envoyés en HTML avec un design professionnel incluant :
- Logo et en-tête coloré
- Mot de passe en évidence dans une boîte
- Bouton d'action (Se connecter)
- Avertissement de sécurité
- Footer avec informations légales

### Email d'invitation
- **Sujet** : "Bienvenue dans l'équipe {Restaurant} - QR Order"
- **Contenu** : Mot de passe temporaire + lien de connexion
- **Couleur** : Rose (#d94a6a)

### Email de réinitialisation
- **Sujet** : "Réinitialisation de votre mot de passe - QR Order"
- **Contenu** : Nouveau mot de passe temporaire + lien de connexion
- **Couleur** : Violet (#667eea)

## 🧪 Test de la configuration

Pour tester l'envoi d'emails :

1. Démarrez le serveur backend
2. Invitez un nouveau membre via l'interface Staff
3. Vérifiez les logs du serveur pour confirmer l'envoi
4. Vérifiez la boîte de réception du membre invité

## ⚠️ Gestion des erreurs

Si l'envoi d'email échoue :
- Le membre est quand même créé dans la base de données
- Le mot de passe temporaire est affiché dans l'interface
- L'administrateur peut copier et envoyer manuellement le mot de passe
- Les erreurs sont loggées dans la console du serveur

## 🔍 Dépannage

### L'email n'est pas reçu

1. **Vérifiez le dossier spam** du destinataire
2. **Vérifiez les logs** du serveur pour voir les erreurs
3. **Testez les identifiants SMTP** avec un outil comme [SMTP Test Tool](https://www.smtper.net/)
4. **Vérifiez les limites d'envoi** de votre fournisseur email

### Erreur "Invalid login"

- Vérifiez que vous utilisez un **mot de passe d'application** (pas votre mot de passe Gmail)
- Vérifiez que la **validation en deux étapes** est activée sur Gmail

### Erreur "Connection timeout"

- Vérifiez que le port 587 n'est pas bloqué par votre firewall
- Essayez le port 465 avec `secure: true` dans la configuration

## 📚 Ressources

- [Documentation Nodemailer](https://nodemailer.com/)
- [Mots de passe d'application Gmail](https://support.google.com/accounts/answer/185833)
- [Limites d'envoi Gmail](https://support.google.com/a/answer/166852)

## 🚀 Production

Pour la production, il est recommandé d'utiliser :
- **SendGrid** (gratuit jusqu'à 100 emails/jour)
- **Mailgun** (gratuit jusqu'à 5000 emails/mois)
- **Amazon SES** (très économique pour gros volumes)

Ces services offrent :
- Meilleure délivrabilité
- Statistiques d'envoi
- Gestion des bounces
- Support technique
