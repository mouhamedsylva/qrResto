# 🔧 Fix de l'erreur 401 - Authentification

## ❌ Problème

Erreur lors de l'export des templates :
```json
{
  "statusCode": 401,
  "timestamp": "2026-04-15T14:35:34.104Z",
  "path": "/api/v1/tables/bulk-qr-export",
  "message": "Unauthorized"
}
```

## 🔍 Causes possibles

### 1. Token JWT expiré
Le token d'authentification a peut-être expiré.

**Solution** : Se reconnecter

### 2. Token non envoyé
Le token n'est pas présent dans le localStorage ou n'est pas envoyé dans les headers.

**Vérification** :
```javascript
// Ouvrir la console du navigateur (F12)
console.log('Token:', localStorage.getItem('qr_owner_token'));
```

### 3. Rôle insuffisant
L'utilisateur n'a pas le rôle OWNER ou MANAGER.

**Vérification** :
```javascript
// Ouvrir la console du navigateur (F12)
console.log('User:', JSON.parse(localStorage.getItem('qr_owner_user') || '{}'));
```

### 4. Backend non démarré ou URL incorrecte
Le backend n'est pas accessible à l'URL configurée.

**Vérification** :
- Backend démarré sur `http://localhost:3000` ?
- Vérifier dans `qr-order-owner/src/services/api.ts`

---

## ✅ Solutions implémentées

### 1. Gestion d'erreurs améliorée

Le composant `PrintTemplates.tsx` gère maintenant les erreurs spécifiques :

```typescript
catch (error: any) {
  if (error.response?.status === 401) {
    alert('❌ Session expirée. Veuillez vous reconnecter.');
  } else if (error.response?.status === 403) {
    alert('❌ Vous n\'avez pas les permissions nécessaires.');
  } else if (error.response?.status === 404) {
    alert('❌ Une ou plusieurs tables n\'ont pas été trouvées.');
  } else {
    alert('❌ Erreur lors de la génération du template.');
  }
}
```

### 2. Messages d'erreur clairs

L'utilisateur reçoit maintenant un message spécifique selon le type d'erreur :
- **401** : Session expirée → Se reconnecter
- **403** : Permissions insuffisantes → Vérifier le rôle
- **404** : Tables non trouvées → Vérifier la sélection
- **Autre** : Erreur générique

---

## 🔧 Comment débugger

### Étape 1 : Vérifier le token

Ouvrir la console du navigateur (F12) et exécuter :

```javascript
const token = localStorage.getItem('qr_owner_token');
console.log('Token présent:', !!token);
console.log('Token:', token);
```

**Résultat attendu** :
```
Token présent: true
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Si le token est absent** :
- Se reconnecter à l'application
- Vérifier que la connexion fonctionne

### Étape 2 : Vérifier l'utilisateur

```javascript
// Récupérer les infos utilisateur depuis le contexte
// Ou vérifier dans la console Network (F12 → Network)
// Regarder la requête vers /api/v1/users/profile
```

**Vérifier** :
- `user.role` = "OWNER" ou "MANAGER"
- `user.restaurant.id` existe

### Étape 3 : Vérifier la requête

Dans la console Network (F12 → Network) :
1. Cliquer sur "Générer" d'un template
2. Trouver la requête `bulk-qr-export`
3. Vérifier les **Headers** :
   - `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
4. Vérifier le **Body** :
   ```json
   {
     "tableIds": ["uuid-1", "uuid-2"],
     "format": "pdf-multi",
     "size": "large"
   }
   ```

### Étape 4 : Vérifier le backend

```bash
# Dans le terminal du backend
cd qr-order-api
npm run start:dev
```

**Vérifier** :
- Le backend démarre sans erreur
- Le port 3000 est bien utilisé
- Les logs montrent la requête entrante

---

## 🚀 Solutions rapides

### Solution 1 : Se reconnecter

1. Se déconnecter de l'application
2. Se reconnecter avec vos identifiants
3. Réessayer l'export

### Solution 2 : Vider le cache

```javascript
// Dans la console du navigateur (F12)
localStorage.clear();
// Puis se reconnecter
```

### Solution 3 : Vérifier l'URL du backend

Fichier : `qr-order-owner/src/services/api.ts`

```typescript
const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1', // ← Vérifier cette URL
  headers: {
    'Content-Type': 'application/json',
  },
});
```

**Modifier si nécessaire** :
- Backend sur un autre port ? → Changer `3000`
- Backend sur un autre domaine ? → Changer l'URL complète

### Solution 4 : Vérifier les permissions backend

Fichier : `qr-order-api/src/modules/tables/tables.controller.ts`

L'endpoint nécessite :
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER, UserRole.MANAGER)
```

**Vérifier** :
- Votre utilisateur a le rôle OWNER ou MANAGER
- Le JWT est valide et non expiré

---

## 📝 Checklist de débogage

- [ ] Token présent dans localStorage
- [ ] Token non expiré (< 24h généralement)
- [ ] Utilisateur a le rôle OWNER ou MANAGER
- [ ] Backend démarré sur le bon port
- [ ] URL du backend correcte dans api.ts
- [ ] Headers Authorization présent dans la requête
- [ ] Pas d'erreur CORS dans la console
- [ ] Tables sélectionnées existent bien

---

## 🔐 Informations sur l'authentification

### Token JWT

Le token JWT est stocké dans :
```
localStorage.getItem('qr_owner_token')
```

Il est automatiquement ajouté aux requêtes par l'interceptor Axios :
```typescript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('qr_owner_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Durée de validité

Par défaut, les tokens JWT expirent après :
- **24 heures** pour les tokens d'accès
- **7 jours** pour les refresh tokens (si implémentés)

**Si le token est expiré** :
- Se reconnecter pour obtenir un nouveau token
- Ou implémenter un système de refresh token automatique

---

## 🎯 Test de l'authentification

### Test manuel

1. **Ouvrir la console** (F12)
2. **Exécuter** :
```javascript
fetch('http://localhost:3000/api/v1/users/profile', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('qr_owner_token')}`
  }
})
.then(r => r.json())
.then(data => console.log('User:', data))
.catch(err => console.error('Error:', err));
```

3. **Résultat attendu** :
```json
{
  "id": "uuid",
  "email": "owner@example.com",
  "role": "OWNER",
  "restaurant": {
    "id": "uuid",
    "name": "Mon Restaurant"
  }
}
```

4. **Si erreur 401** :
   - Le token est invalide ou expiré
   - Se reconnecter

---

## 💡 Recommandations

### 1. Implémenter un refresh token automatique

Ajouter un interceptor pour rafraîchir le token automatiquement :

```typescript
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Tenter de rafraîchir le token
      // Ou rediriger vers la page de login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 2. Afficher un message de session expirée

Dans le composant, rediriger automatiquement :

```typescript
if (error.response?.status === 401) {
  alert('❌ Session expirée. Redirection vers la page de connexion...');
  setTimeout(() => {
    window.location.href = '/login';
  }, 2000);
}
```

### 3. Vérifier le token avant l'action

Ajouter une vérification préventive :

```typescript
const handleGenerate = async (templateId: string) => {
  // Vérifier le token
  const token = localStorage.getItem('qr_owner_token');
  if (!token) {
    alert('❌ Vous devez être connecté pour effectuer cette action.');
    return;
  }

  // ... reste du code
};
```

---

## ✅ Résolution

Une fois le problème identifié :

1. **Si token expiré** → Se reconnecter
2. **Si token absent** → Se reconnecter
3. **Si permissions insuffisantes** → Contacter l'administrateur
4. **Si backend inaccessible** → Vérifier que le backend est démarré

---

**Date** : 15 avril 2026  
**Statut** : Gestion d'erreurs améliorée ✅  
**Action requise** : Vérifier l'authentification et se reconnecter si nécessaire
