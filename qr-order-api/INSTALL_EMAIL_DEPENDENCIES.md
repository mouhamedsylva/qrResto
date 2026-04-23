# Installation des dépendances pour l'envoi d'emails

## 📦 Commandes à exécuter

### 1. Installer Nodemailer

```bash
cd qr-order-api
npm install nodemailer
npm install --save-dev @types/nodemailer
```

### 2. Vérifier l'installation

```bash
npm list nodemailer
```

Vous devriez voir :
```
qr-order-api@1.0.0
└── nodemailer@6.x.x
```

### 3. Redémarrer le serveur

```bash
npm run start:dev
```

## ✅ Vérification

Si tout est bien installé, vous devriez voir dans les logs au démarrage :
```
[Nest] LOG [EmailService] Email service initialized
```

## 🔧 Configuration

Après l'installation, configurez les variables d'environnement dans `.env` :

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-application
SMTP_FROM=noreply@qrorder.com
APP_NAME=QR Order
FRONTEND_URL=http://localhost:5173
```

Voir `EMAIL_SETUP.md` pour plus de détails sur la configuration.
