# 🧪 Guide de Test - Visibilité et Plat du Jour

## État Initial
✅ 250 articles actifs  
⚪ 0 plat du jour  
✅ Corrections appliquées

---

## 🎯 Test 1: Désactiver un Article

### Étape 1: Dans l'Application Owner
1. Démarrer l'API:
   ```bash
   cd qr-order-api
   npm run start:dev
   ```

2. Démarrer l'application owner:
   ```bash
   cd qr-order-owner
   npm run dev
   ```

3. Se connecter et aller dans "Menu Management"

4. Choisir un article (ex: "Salade César")

5. Cliquer sur l'icône œil (👁️) pour désactiver l'article
   - L'article doit devenir grisé
   - L'icône doit changer en œil barré (👁️‍🗨️)

### Étape 2: Vérifier dans la Base de Données
```bash
cd qr-order-api
npm run test:menu-update
```

**Résultat attendu**:
```
📈 Résumé global:
   Total d'articles: 250
   Articles actifs: 249  ← Un de moins
   Articles inactifs: 1  ← Un article inactif
   Plats du jour: 0
```

### Étape 3: Vérifier dans le Client Flutter
1. Démarrer le client:
   ```bash
   cd qr-order-client
   flutter run -d chrome
   ```

2. Aller dans le menu

3. **L'article désactivé ne doit PAS apparaître** ✅

### Étape 4: Vérifier l'API Directement
```bash
curl http://localhost:3000/api/v1/restaurants/ea5b4f8c-58e0-46a2-982a-78c7321c0d22 | jq '.categories[].items[] | select(.name == "Salade César")'
```

**Résultat attendu**: Aucun résultat (l'article est filtré)

---

## 🔥 Test 2: Marquer comme Plat du Jour

### Étape 1: Dans l'Application Owner
1. Choisir un article (ex: "Steak-frites")

2. Cliquer sur l'icône flamme (🔥)
   - L'article doit avoir un badge "Plat du jour"
   - L'icône flamme doit être colorée

### Étape 2: Vérifier dans la Base de Données
```bash
npm run test:menu-update
```

**Résultat attendu**:
```
2. Steak-frites
   ID: 032be863-53e3-4494-b789-786a9328e6a4
   isActive: ✅ Actif
   isDishOfDay: 🔥 Plat du jour  ← Marqué comme plat du jour

📈 Résumé global:
   Total d'articles: 250
   Articles actifs: 249
   Articles inactifs: 1
   Plats du jour: 1  ← Un plat du jour
```

### Étape 3: Vérifier dans le Client Flutter
1. Rafraîchir le menu dans le client Flutter

2. Chercher "Steak-frites"

3. **L'article doit avoir le tag "Plat du jour"** ✅

### Étape 4: Vérifier l'API
```bash
curl http://localhost:3000/api/v1/restaurants/ea5b4f8c-58e0-46a2-982a-78c7321c0d22 | jq '.categories[].items[] | select(.name == "Steak-frites") | {name, isDishOfDay}'
```

**Résultat attendu**:
```json
{
  "name": "Steak-frites",
  "isDishOfDay": true
}
```

---

## 🔄 Test 3: Réactiver un Article

### Étape 1: Dans l'Application Owner
1. Trouver l'article désactivé (il est grisé)

2. Cliquer à nouveau sur l'icône œil barré
   - L'article doit redevenir normal
   - L'icône doit redevenir un œil normal

### Étape 2: Vérifier dans le Client Flutter
1. Rafraîchir le menu

2. **L'article doit réapparaître** ✅

---

## 📊 Test 4: Scénario Complet

### Marquer 5 Articles comme Plat du Jour
1. Dans l'application owner, marquer ces articles:
   - Salade César
   - Steak-frites
   - Spaghetti bolognaise
   - Mousse au chocolat
   - Tarte aux pommes

2. Vérifier:
   ```bash
   npm run test:menu-update
   ```

**Résultat attendu**:
```
📈 Résumé global:
   Total d'articles: 250
   Articles actifs: 250
   Articles inactifs: 0
   Plats du jour: 5  ← 5 plats du jour
```

### Désactiver 3 Articles
1. Désactiver:
   - Velouté 12
   - Salade caprese 103
   - Salade caprese 66

2. Vérifier:
   ```bash
   npm run test:menu-update
   ```

**Résultat attendu**:
```
📈 Résumé global:
   Total d'articles: 250
   Articles actifs: 247  ← 3 de moins
   Articles inactifs: 3  ← 3 inactifs
   Plats du jour: 5
```

### Vérifier dans le Client
1. Le client Flutter doit afficher:
   - ✅ 247 articles (les 3 inactifs sont masqués)
   - ✅ 5 articles avec badge "Plat du jour"

---

## 🐛 Dépannage

### Problème: L'article reste visible après désactivation

**Solution**:
1. Vérifier que l'API est bien redémarrée après les modifications
2. Vider le cache du navigateur (Ctrl+Shift+R)
3. Vérifier dans la base de données:
   ```bash
   npm run test:menu-update
   ```

### Problème: Le badge "Plat du jour" n'apparaît pas

**Solution**:
1. Vérifier que `isDishOfDay` est bien à `true` dans la base
2. Vérifier que le client Flutter parse bien le champ:
   ```dart
   if (json['isDishOfDay'] == true) {
     parsedTags.add('Plat du jour');
   }
   ```

### Problème: L'API retourne toujours les articles inactifs

**Solution**:
1. Vérifier que le filtrage est bien appliqué dans `restaurants.service.ts`:
   ```typescript
   items: category.items ? category.items.filter(item => item.isActive) : []
   ```

---

## ✅ Checklist de Validation

- [ ] L'API démarre sans erreur
- [ ] L'application owner se connecte correctement
- [ ] Désactiver un article le rend grisé dans owner
- [ ] L'article désactivé disparaît du client Flutter
- [ ] Marquer un article comme plat du jour ajoute le badge
- [ ] Le badge "Plat du jour" apparaît dans le client Flutter
- [ ] Réactiver un article le fait réapparaître dans le client
- [ ] Le script `npm run test:menu-update` affiche les bonnes statistiques
- [ ] L'API ne retourne pas les articles inactifs

---

## 📞 Support

Si vous rencontrez des problèmes:

1. Vérifier les logs de l'API:
   ```bash
   cd qr-order-api
   npm run start:dev
   # Observer les logs
   ```

2. Vérifier l'état de la base de données:
   ```bash
   npm run test:menu-update
   ```

3. Tester l'API directement:
   ```bash
   curl http://localhost:3000/api/v1/restaurants/{restaurantId}
   ```

---

**Date**: 23 avril 2026  
**Version**: 1.0.0  
**Status**: ✅ Prêt pour les tests
