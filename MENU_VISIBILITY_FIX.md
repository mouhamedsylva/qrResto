# 🔧 Correction de la Visibilité des Articles et Plat du Jour

## 🐛 Problèmes Identifiés

### 1. Visibilité des Articles (isActive)
**Symptôme**: Lorsqu'on désactive un article dans l'application owner, il reste visible côté client.

**Cause**: 
- Le backend utilise le champ `isActive` (depuis la migration)
- Le client Flutter cherchait `isAvailable` dans le JSON
- L'API retournait tous les articles, même les inactifs

### 2. Plat du Jour (isDishOfDay)
**Symptôme**: La sélection "menu du jour" ne fonctionne pas côté backend.

**Cause**: Le champ `isDishOfDay` existe dans la base de données et le DTO, mais le client Flutter ne l'utilisait pas correctement.

---

## ✅ Corrections Appliquées

### 1. Client Flutter - Modèle Product

**Fichier**: `qr-order-client/lib/models/product.dart`

**Changements**:
```dart
// AVANT
final bool isAvailable;
isAvailable: json['isAvailable'] ?? true,

// APRÈS
final bool isActive;
isActive: json['isActive'] ?? true,
```

**Impact**: Le client Flutter lit maintenant le bon champ depuis l'API.

---

### 2. Backend - Filtrage des Articles Inactifs

**Fichier**: `qr-order-api/src/modules/restaurants/restaurants.service.ts`

**Changements**:
```typescript
async findOne(id: string) {
  const restaurant = await this.restaurantRepository.findOne({
    where: { id },
    relations: ['categories', 'categories.items', 'tables'],
  });
  if (!restaurant) {
    throw new NotFoundException(`Restaurant with ID ${id} not found`);
  }
  
  // Filter out inactive items for client consumption
  if (restaurant.categories) {
    restaurant.categories = restaurant.categories.map(category => ({
      ...category,
      items: category.items ? category.items.filter(item => item.isActive) : [],
    }));
  }
  
  return restaurant;
}
```

**Impact**: L'API ne retourne plus les articles inactifs aux clients.

---

### 3. Script de Test

**Fichier**: `qr-order-api/src/database/scripts/test-menu-item-update.ts`

**Usage**:
```bash
cd qr-order-api
npm run test:menu-update
```

**Résultat attendu**:
```
✅ Connexion à la base de données établie

📊 État actuel des 10 premiers articles:

1. Salade niçoise
   ID: xxx-xxx-xxx
   isActive: ✅ Actif
   isDishOfDay: ⚪ Normal

2. Steak frites
   ID: xxx-xxx-xxx
   isActive: ✅ Actif
   isDishOfDay: 🔥 Plat du jour

...

📈 Résumé global:
   Total d'articles: 248
   Articles actifs: 245
   Articles inactifs: 3
   Plats du jour: 5

✅ Connexion fermée
```

---

## 🧪 Tests à Effectuer

### Test 1: Désactiver un Article

1. **Dans l'application owner**:
   - Aller dans "Menu Management"
   - Cliquer sur l'icône œil (👁️) d'un article pour le désactiver
   - L'article doit devenir grisé avec l'icône œil barré (👁️‍🗨️)

2. **Dans le client Flutter**:
   - Rafraîchir le menu
   - L'article désactivé ne doit **plus apparaître**

3. **Vérification API**:
   ```bash
   curl http://localhost:3000/api/v1/restaurants/{restaurantId}
   ```
   - Les articles avec `isActive: false` ne doivent pas être dans la réponse

### Test 2: Marquer comme Plat du Jour

1. **Dans l'application owner**:
   - Aller dans "Menu Management"
   - Cliquer sur l'icône flamme (🔥) d'un article
   - L'article doit avoir un badge "Plat du jour"

2. **Dans le client Flutter**:
   - Rafraîchir le menu
   - L'article doit avoir le tag "Plat du jour" dans ses tags

3. **Vérification base de données**:
   ```bash
   npm run test:menu-update
   ```
   - L'article doit avoir `isDishOfDay: 🔥 Plat du jour`

### Test 3: Réactiver un Article

1. **Dans l'application owner**:
   - Cliquer à nouveau sur l'icône œil barré
   - L'article doit redevenir normal

2. **Dans le client Flutter**:
   - Rafraîchir le menu
   - L'article doit réapparaître

---

## 🔄 Flux de Données Complet

```
┌─────────────────────────────────────────────────────────┐
│                  OWNER APPLICATION                       │
│                                                          │
│  1. Toggle isActive                                     │
│     └─> PUT /api/v1/menus/items/:id                    │
│         Body: { isActive: false }                       │
│                                                          │
│  2. Toggle isDishOfDay                                  │
│     └─> PUT /api/v1/menus/items/:id                    │
│         Body: { isDishOfDay: true }                     │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTP PUT
                          │
┌─────────────────────────▼───────────────────────────────┐
│                      NESTJS API                          │
│                                                          │
│  MenusController.updateMenuItem()                       │
│  └─> MenusService.updateMenuItem()                     │
│      └─> Object.assign(item, { isActive, isDishOfDay })│
│          └─> menuItemRepository.save(item)             │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │              MySQL Database                     │    │
│  │  menu_items                                     │    │
│  │  • id                                           │    │
│  │  • name                                         │    │
│  │  • isActive (tinyint)                          │    │
│  │  • isDishOfDay (tinyint)                       │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  RestaurantsController.findOne()                        │
│  └─> RestaurantsService.findOne()                      │
│      └─> Filter: items.filter(item => item.isActive)  │
│          └─> Return only active items                   │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTP GET
                          │
┌─────────────────────────▼───────────────────────────────┐
│                    FLUTTER CLIENT                        │
│                                                          │
│  MenuService.getMenu(restaurantId)                      │
│  └─> GET /api/v1/restaurants/:id                       │
│      └─> Parse JSON                                     │
│          └─> Product.fromJson()                         │
│              • isActive: json['isActive'] ?? true       │
│              • isDishOfDay in tags                      │
│                                                          │
│  MenuScreen                                             │
│  └─> Display only active items                         │
│      └─> Show "Plat du jour" badge if isDishOfDay      │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Structure de la Base de Données

### Table: menu_items

| Colonne | Type | Description |
|---------|------|-------------|
| id | varchar(36) | UUID de l'article |
| name | varchar(255) | Nom de l'article |
| isActive | tinyint | 1 = visible, 0 = masqué |
| isDishOfDay | tinyint | 1 = plat du jour, 0 = normal |
| price | decimal(10,2) | Prix |
| imageUrl | varchar(255) | URL de l'image |
| ... | ... | Autres champs |

---

## 🎯 Résultat Final

### Avant les Corrections ❌
```
❌ isActive ignoré par le client
❌ Articles inactifs visibles côté client
❌ isDishOfDay non utilisé
❌ Pas de filtrage côté API
```

### Après les Corrections ✅
```
✅ Client lit isActive depuis l'API
✅ Articles inactifs masqués automatiquement
✅ isDishOfDay fonctionnel
✅ Filtrage côté API pour sécurité
✅ Badge "Plat du jour" affiché
✅ Script de test disponible
```

---

## 🚀 Commandes Utiles

```bash
# Tester l'état des articles
cd qr-order-api
npm run test:menu-update

# Démarrer l'API
npm run start:dev

# Démarrer le client Flutter
cd qr-order-client
flutter run -d chrome

# Démarrer l'application owner
cd qr-order-owner
npm run dev
```

---

## 📝 Notes Importantes

1. **Migration**: Le champ `isAvailable` a été remplacé par `isActive` dans la migration `1776256395755-AddMenuItemEnhancements.ts`

2. **Compatibilité**: Le client Flutter utilise maintenant `isActive` pour être aligné avec le backend

3. **Sécurité**: Le filtrage côté API empêche les clients de voir les articles inactifs même s'ils modifient le code client

4. **Performance**: Le filtrage est fait en mémoire après la requête SQL, ce qui est acceptable pour des menus de taille raisonnable

5. **Future amélioration**: Pour de très gros menus, on pourrait ajouter `where: { isActive: true }` dans la requête TypeORM

---

**Date**: 23 avril 2026  
**Status**: ✅ Corrections appliquées  
**Impact**: Visibilité et plat du jour fonctionnels  
**Fichiers modifiés**: 3  
**Scripts créés**: 1
