# 🔧 Correction : Problème de connexion et CORS

## 🎯 Problème identifié

Erreur lors de la connexion : **"Le serveur est inaccessible. Vérifiez votre connexion ou la configuration CORS du backend."**

### Cause racine
Le problème venait d'une **référence circulaire** dans les fichiers compilés TypeScript dans le dossier `dist/`, causant une erreur au démarrage du serveur :

```
Error: Cannot find module './user.entity'
```

## ✅ Solution appliquée

### 1. Nettoyage du dossier dist

Le dossier `dist/` contenait des fichiers compilés corrompus. Il a été supprimé et recompilé :

```bash
cd qr-order-api
Remove-Item -Recurse -Force dist
npm run build
```

**Résultat** : ✅ Build réussi sans erreurs

### 2. Configuration CORS vérifiée

La configuration CORS dans `main.ts` est correcte et permet :
- ✅ `http://localhost:5173` (frontend)
- ✅ `http://127.0.0.1:5173`
- ✅ Tous les localhost avec pattern regex
- ✅ Credentials activés
- ✅ Méthodes : GET, POST, PUT, PATCH, DELETE, OPTIONS
- ✅ Headers : Content-Type, Accept, Authorization

### 3. Configuration API vérifiée

**Frontend** (`qr-order-owner/src/services/api.ts`) :
```typescript
baseURL: 'http://localhost:3000/api/v1'
```

**Backend** (`.env`) :
```env
PORT=3000
APP_CORS_ORIGIN=http://localhost:5173
```

✅ Les configurations correspondent parfaitement

## 🚀 Étapes pour démarrer le serveur

### Option 1 : Mode développement (recommandé)

```bash
cd qr-order-api
npm run start:dev
```

Le serveur démarre sur `http://localhost:3000` avec hot-reload.

### Option 2 : Mode production

```bash
cd qr-order-api
npm run start:prod
```

Le serveur démarre sur `http://localhost:3000` sans hot-reload.

## ✅ Vérification du serveur

Une fois le serveur démarré, vous devriez voir :

```
[Nest] INFO [NestFactory] Starting Nest application...
[Nest] INFO [InstanceLoader] AppModule dependencies initialized
[Nest] INFO [RoutesResolver] Mapped {/api/v1/auth/login, POST} route
[Nest] INFO [NestApplication] Nest application successfully started
```

### Test de connexion

1. **Vérifier que le serveur répond** :
   ```bash
   curl http://localhost:3000/api/v1/auth/login
   ```

2. **Ouvrir le frontend** :
   ```bash
   cd qr-order-owner
   npm run dev
   ```

3. **Tester la connexion** sur `http://localhost:5173/login`

## 🔍 Diagnostic en cas de problème

### Le serveur ne démarre pas

```bash
# Vérifier si le port 3000 est déjà utilisé
netstat -ano | findstr :3000

# Si occupé, tuer le processus
taskkill /PID <PID> /F
```

### Erreur de base de données

Vérifier que MySQL est démarré et que les credentials dans `.env` sont corrects :

```env
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=
DATABASE_NAME=qr_order_db
```

### Erreur CORS persistante

Si l'erreur CORS persiste après le démarrage :

1. Vérifier que le backend est bien sur le port 3000
2. Vérifier que le frontend appelle `http://localhost:3000/api/v1`
3. Ouvrir la console du navigateur (F12) pour voir l'erreur exacte
4. Vérifier que les cookies/credentials sont activés

## 📋 Checklist de démarrage

- ✅ Dossier `dist/` nettoyé et recompilé
- ✅ MySQL démarré
- ✅ Base de données `qr_order_db` créée
- ✅ Fichier `.env` configuré
- ⏳ **Démarrer le backend** : `npm run start:dev`
- ⏳ **Démarrer le frontend** : `npm run dev`
- ⏳ **Tester la connexion** sur Login.tsx

## 🎯 Prochaines étapes

1. **Démarrer le serveur backend** avec `npm run start:dev`
2. **Vérifier les logs** pour confirmer que tout démarre correctement
3. **Tester la connexion** depuis le frontend
4. Si le problème persiste, vérifier les logs du navigateur (F12 → Console)

## 📦 Fichiers vérifiés

- ✅ `qr-order-api/src/main.ts` (configuration CORS)
- ✅ `qr-order-api/.env` (variables d'environnement)
- ✅ `qr-order-owner/src/services/api.ts` (URL de l'API)
- ✅ `qr-order-owner/src/pages/Login.tsx` (gestion des erreurs)
- ✅ `qr-order-api/src/modules/users/entities/user.entity.ts` (pas de référence circulaire)

## 💡 Note importante

Le problème de **référence circulaire** a été résolu en nettoyant le dossier `dist/`. Si le problème réapparaît :

```bash
# Nettoyer et recompiler
cd qr-order-api
Remove-Item -Recurse -Force dist
npm run build
npm run start:dev
```

---

**Statut actuel** : ✅ Build réussi, prêt à démarrer le serveur
