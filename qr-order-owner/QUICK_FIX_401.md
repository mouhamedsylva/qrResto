# 🚨 Fix Rapide - Erreur 401 Unauthorized

## ⚡ Solution Rapide (2 minutes)

### Étape 1 : Vérifier votre connexion

**Ouvrez la console du navigateur** (F12) et tapez :

```javascript
console.log('Token:', localStorage.getItem('qr_owner_token'));
```

### Étape 2 : Selon le résultat

#### ✅ Si vous voyez un long texte (token présent)
```
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ...
```

**→ Votre token a probablement expiré**

**Solution** :
1. Cliquez sur votre profil (en haut à droite)
2. Cliquez sur "Déconnexion"
3. Reconnectez-vous avec vos identifiants
4. Réessayez l'export

#### ❌ Si vous voyez `null`
```
Token: null
```

**→ Vous n'êtes pas connecté**

**Solution** :
1. Allez sur la page de connexion
2. Connectez-vous avec vos identifiants
3. Revenez sur la page Tables & QR
4. Réessayez l'export

---

## 🔍 Vérification Backend

### Le backend est-il démarré ?

**Ouvrez un terminal** et vérifiez :

```bash
# Aller dans le dossier backend
cd qr-order-api

# Démarrer le backend
npm run start:dev
```

**Vous devriez voir** :
```
[Nest] 12345  - 15/04/2026, 14:35:34     LOG [NestApplication] Nest application successfully started
[Nest] 12345  - 15/04/2026, 14:35:34     LOG [RoutesResolver] TablesController {/api/v1/tables}:
```

**Si le backend ne démarre pas** :
```bash
# Installer les dépendances
npm install

# Réessayer
npm run start:dev
```

---

## 🎯 Test Rapide

### Testez l'authentification

**Dans la console du navigateur** (F12) :

```javascript
fetch('http://localhost:3000/api/v1/users/profile', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('qr_owner_token')}`
  }
})
.then(r => r.json())
.then(data => {
  console.log('✅ Authentification OK:', data);
  console.log('Rôle:', data.role);
  console.log('Restaurant:', data.restaurant?.name);
})
.catch(err => {
  console.error('❌ Erreur authentification:', err);
});
```

### Résultat attendu

**Si ça marche** :
```
✅ Authentification OK: {id: "...", email: "...", role: "OWNER", ...}
Rôle: OWNER
Restaurant: Mon Restaurant
```

**Si ça ne marche pas** :
```
❌ Erreur authentification: Error: 401 Unauthorized
```
→ **Se reconnecter**

---

## 📋 Checklist Rapide

Cochez au fur et à mesure :

- [ ] Backend démarré (`npm run start:dev` dans qr-order-api)
- [ ] Token présent dans localStorage
- [ ] Utilisateur connecté (voir profil en haut à droite)
- [ ] Rôle = OWNER ou MANAGER
- [ ] Tables sélectionnées (au moins 1)
- [ ] Bouton "Configuration" cliqué pour voir les tables

---

## 🆘 Si rien ne fonctionne

### Solution ultime : Reset complet

```javascript
// Dans la console du navigateur (F12)
localStorage.clear();
sessionStorage.clear();
location.reload();
```

Puis :
1. Se reconnecter
2. Sélectionner des tables
3. Réessayer l'export

---

## 💬 Messages d'erreur améliorés

Le système affiche maintenant des messages clairs :

| Erreur | Message | Action |
|--------|---------|--------|
| 401 | ❌ Session expirée. Veuillez vous reconnecter. | Se reconnecter |
| 403 | ❌ Vous n'avez pas les permissions nécessaires. | Vérifier le rôle |
| 404 | ❌ Une ou plusieurs tables n'ont pas été trouvées. | Vérifier la sélection |
| Autre | ❌ Erreur lors de la génération du template. | Vérifier le backend |

---

## ✅ Ça marche maintenant ?

Si l'export fonctionne, vous devriez voir :
1. Banner bleue "Génération en cours..."
2. Téléchargement automatique du PDF
3. Message "✅ Template généré avec succès pour X table(s) !"

---

**Besoin d'aide ?** Consultez `DEBUG_AUTH_FIX.md` pour plus de détails.
