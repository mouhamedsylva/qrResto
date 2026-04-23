# 🚀 Guide de démarrage rapide

## ⚡ Démarrage en 3 étapes

### 1️⃣ Démarrer le Backend

```powershell
cd qr-order-api
.\start-server.ps1
```

Ou manuellement :
```powershell
cd qr-order-api
npm run start:dev
```

Le serveur démarre sur **http://localhost:3000**

### 2️⃣ Démarrer le Frontend

Dans un nouveau terminal :
```powershell
cd qr-order-owner
npm run dev
```

Le frontend démarre sur **http://localhost:5173**

### 3️⃣ Se connecter

Ouvrez votre navigateur sur **http://localhost:5173/login**

---

## 🔧 Scripts utiles

### Backend (qr-order-api)

| Script | Commande | Description |
|--------|----------|-------------|
| **Démarrage rapide** | `.\start-server.ps1` | Nettoie, compile et démarre le serveur |
| **Vérifier l'état** | `.\check-server.ps1` | Vérifie si le serveur et MySQL sont actifs |
| **Dev mode** | `npm run start:dev` | Démarre avec hot-reload |
| **Production** | `npm run start:prod` | Démarre en mode production |
| **Build** | `npm run build` | Compile le projet |
| **Nettoyer** | `Remove-Item -Recurse -Force dist` | Supprime les fichiers compilés |

### Frontend (qr-order-owner)

| Script | Commande | Description |
|--------|----------|-------------|
| **Dev mode** | `npm run dev` | Démarre le serveur de développement |
| **Build** | `npm run build` | Compile pour la production |
| **Preview** | `npm run preview` | Prévisualise le build de production |

---

## 🐛 Résolution des problèmes courants

### ❌ "Le serveur est inaccessible"

**Cause** : Le backend n'est pas démarré ou le port 3000 est bloqué

**Solution** :
```powershell
cd qr-order-api
.\check-server.ps1  # Vérifier l'état
.\start-server.ps1  # Démarrer le serveur
```

### ❌ "Cannot find module './user.entity'"

**Cause** : Fichiers compilés corrompus dans `dist/`

**Solution** :
```powershell
cd qr-order-api
Remove-Item -Recurse -Force dist
npm run build
npm run start:dev
```

### ❌ "Port 3000 already in use"

**Cause** : Un autre processus utilise le port 3000

**Solution** :
```powershell
# Trouver le processus
netstat -ano | findstr :3000

# Arrêter le processus (remplacer <PID> par le numéro)
taskkill /PID <PID> /F

# Ou utiliser le script qui le fait automatiquement
.\start-server.ps1
```

### ❌ Erreur de connexion MySQL

**Cause** : MySQL n'est pas démarré ou mauvais credentials

**Solution** :
1. Démarrer MySQL (XAMPP, WAMP, ou service Windows)
2. Vérifier les credentials dans `qr-order-api/.env` :
   ```env
   DATABASE_HOST=localhost
   DATABASE_PORT=3306
   DATABASE_USER=root
   DATABASE_PASSWORD=
   DATABASE_NAME=qr_order_db
   ```
3. Créer la base de données si elle n'existe pas :
   ```sql
   CREATE DATABASE qr_order_db;
   ```

### ❌ Erreur CORS

**Cause** : Configuration CORS incorrecte

**Solution** : Vérifier que dans `qr-order-api/.env` :
```env
APP_CORS_ORIGIN=http://localhost:5173
```

---

## 📚 URLs importantes

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | Interface propriétaire |
| **Backend API** | http://localhost:3000/api/v1 | API REST |
| **Documentation API** | http://localhost:3000/api/docs | Swagger UI |
| **Login** | http://localhost:5173/login | Page de connexion |
| **Dashboard** | http://localhost:5173/ | Tableau de bord |

---

## 🔐 Comptes de test

### Super Admin
- **Email** : `admin@qrorder.com`
- **Mot de passe** : `Admin123!`

### Propriétaire de restaurant
Créez un compte via la page d'inscription : http://localhost:5173/register

---

## 📦 Installation initiale (première fois)

Si c'est la première fois que vous lancez le projet :

### 1. Installer les dépendances

**Backend** :
```powershell
cd qr-order-api
npm install
```

**Frontend** :
```powershell
cd qr-order-owner
npm install
```

### 2. Configurer l'environnement

Copier et configurer le fichier `.env` :
```powershell
cd qr-order-api
Copy-Item .env.example .env
# Éditer .env avec vos paramètres
```

### 3. Créer la base de données

```sql
CREATE DATABASE qr_order_db;
```

### 4. Exécuter les migrations

```powershell
cd qr-order-api
npm run migration:run
```

### 5. Démarrer les serveurs

Suivez les étapes du début de ce guide (Démarrage en 3 étapes).

---

## 🎯 Workflow de développement quotidien

1. **Démarrer MySQL** (si pas déjà actif)
2. **Terminal 1** : `cd qr-order-api && npm run start:dev`
3. **Terminal 2** : `cd qr-order-owner && npm run dev`
4. **Navigateur** : http://localhost:5173

---

## 💡 Conseils

- ✅ Utilisez `.\start-server.ps1` pour un démarrage propre du backend
- ✅ Utilisez `.\check-server.ps1` pour diagnostiquer les problèmes
- ✅ Gardez deux terminaux ouverts (backend + frontend)
- ✅ Vérifiez les logs en cas d'erreur
- ✅ Utilisez F12 dans le navigateur pour voir les erreurs frontend
- ✅ La documentation Swagger est votre amie : http://localhost:3000/api/docs

---

## 🆘 Besoin d'aide ?

1. **Vérifier l'état** : `.\check-server.ps1`
2. **Consulter les logs** dans les terminaux
3. **Ouvrir la console** du navigateur (F12)
4. **Consulter la documentation** : `FIX_LOGIN_CORS_ISSUE.md`

---

**Bon développement ! 🚀**
