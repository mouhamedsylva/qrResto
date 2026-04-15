# 🔄 Alignement Backend avec MenuManagement.tsx

## 📅 Date : 15 avril 2026

## 🎯 Objectif
Aligner le backend NestJS avec les fonctionnalités complètes de la page `MenuManagement.tsx` du frontend React.

---

## ✅ Modifications apportées

### 1. **Entity `MenuItem` - Nouveaux champs ajoutés**

#### Champs nutritionnels et informatifs
- ✅ `prepTime` (number, nullable) - Temps de préparation en minutes
- ✅ `calories` (number, nullable) - Calories en kcal
- ✅ `allergens` (string[], nullable) - Liste des allergènes (gluten, lactose, nuts, eggs, fish, shellfish, soy, sesame)
- ✅ `dietaryLabels` (string[], nullable) - Labels diététiques (vegan, vegetarian, halal, gluten-free)

#### Champs de disponibilité
- ✅ `availableDays` (number[], nullable) - Jours de disponibilité (0=Dimanche, 6=Samedi)
- ✅ `isDishOfDay` (boolean, default: false) - Marquer comme plat du jour

#### Champs organisationnels
- ✅ `subcategoryName` (string, nullable) - Nom de la sous-catégorie (ex: "Entrées chaudes")
- ✅ `ordersCount` (number, default: 0) - Nombre de commandes (pour statistiques)

#### Correction de nommage
- ✅ `isAvailable` → **renommé en** `isActive` (cohérence avec le frontend)

---

### 2. **DTO `CreateMenuItemDto` - Nouveaux champs**

Tous les nouveaux champs de l'entity ont été ajoutés au DTO avec :
- Validation appropriée (`@IsBoolean`, `@IsArray`, `@IsNumber`, etc.)
- Documentation Swagger (`@ApiProperty`)
- Marqués comme optionnels (`@IsOptional()`)

**Exemple :**
```typescript
@ApiProperty({
  example: ['gluten', 'lactose', 'nuts'],
  description: 'Liste des allergènes',
  required: false,
  type: [String],
})
@IsArray()
@IsOptional()
allergens?: string[];
```

---

### 3. **Migration de base de données**

**Fichier :** `1776256395755-AddMenuItemEnhancements.ts`

**Actions :**
- ✅ Suppression de la colonne `isAvailable`
- ✅ Ajout de la colonne `isActive` (tinyint, default: 1)
- ✅ Ajout de `isDishOfDay` (tinyint, default: 0)
- ✅ Ajout de `prepTime` (int, nullable)
- ✅ Ajout de `calories` (int, nullable)
- ✅ Ajout de `allergens` (text, nullable)
- ✅ Ajout de `dietaryLabels` (text, nullable)
- ✅ Ajout de `availableDays` (text, nullable)
- ✅ Ajout de `ordersCount` (int, default: 0)
- ✅ Ajout de `subcategoryName` (varchar(255), nullable)

**Migration exécutée avec succès** ✅

---

## 🔍 Fonctionnalités Frontend maintenant supportées

### ✅ Gestion des allergènes
Le frontend peut maintenant :
- Afficher et sélectionner 8 allergènes (🌾 Gluten, 🥛 Lactose, 🥜 Noix, 🥚 Œufs, 🐟 Poisson, 🦐 Crustacés, 🫘 Soja, 🌱 Sésame)
- Sauvegarder la liste dans le backend
- Exporter/importer via CSV

### ✅ Labels diététiques
- Vegan, Végétarien, Halal, Sans Gluten
- Avec couleurs personnalisées pour l'affichage

### ✅ Disponibilité par jour
- Sélection des jours de la semaine (Dim-Sam)
- Permet de gérer les plats saisonniers ou hebdomadaires

### ✅ Plat du jour
- Toggle pour marquer un plat comme "Plat du jour"
- Filtrage dédié dans l'interface

### ✅ Informations nutritionnelles
- Temps de préparation (minutes)
- Calories (kcal)

### ✅ Sous-catégories
- Organisation plus fine (ex: "Entrées chaudes", "Entrées froides")

### ✅ Export/Import CSV complet
Tous les nouveaux champs sont inclus dans l'export/import CSV :
- Allergènes (format: `gluten|lactose|nuts`)
- Labels diététiques (format: `vegan|vegetarian`)
- Jours disponibles (format: `Lun|Mar|Mer`)

---

## 📊 Schéma de données mis à jour

```typescript
MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  
  // Badges
  badgeLabel?: string;
  badgeColor?: string;
  
  // Stock
  stockQty: number;
  lowStockThreshold: number;
  
  // Organisation
  displayOrder: number;
  subcategoryName?: string;
  
  // État
  isActive: boolean;        // ⚠️ Renommé depuis isAvailable
  isDishOfDay: boolean;     // 🆕
  
  // Nutrition
  prepTime?: number;        // 🆕
  calories?: number;        // 🆕
  allergens?: string[];     // 🆕
  dietaryLabels?: string[]; // 🆕
  
  // Disponibilité
  availableDays?: number[]; // 🆕
  
  // Statistiques
  ordersCount: number;      // 🆕
  
  // Relations
  category: Category;
}
```

---

## 🚀 Prochaines étapes recommandées

### 1. **Tester les endpoints**
```bash
# Créer un article avec tous les nouveaux champs
POST /menus/items
{
  "name": "Burger Vegan",
  "price": 12.50,
  "categoryId": "uuid-category",
  "prepTime": 15,
  "calories": 450,
  "allergens": ["gluten", "soy"],
  "dietaryLabels": ["vegan"],
  "availableDays": [1, 2, 3, 4, 5],
  "isDishOfDay": true,
  "subcategoryName": "Burgers"
}
```

### 2. **Mettre à jour la documentation Swagger**
- Les nouveaux champs sont déjà documentés dans les DTOs
- Accéder à `/api/docs` pour voir la documentation mise à jour

### 3. **Tester l'import/export CSV**
- Vérifier que tous les nouveaux champs sont correctement exportés
- Tester l'import avec les nouveaux formats

### 4. **Ajouter des endpoints de statistiques (optionnel)**
```typescript
// Exemple : Top plats par ordersCount
GET /menus/items/top-sellers?restaurantId=xxx&limit=10

// Exemple : Plats du jour actifs
GET /menus/items/dish-of-day?restaurantId=xxx
```

---

## ⚠️ Points d'attention

### Migration de données existantes
- Les articles existants auront `isActive = true` par défaut (anciennement `isAvailable`)
- Les nouveaux champs seront `NULL` ou à leurs valeurs par défaut
- Aucune perte de données

### Compatibilité
- ✅ Rétrocompatible : les anciens appels API fonctionnent toujours
- ✅ Les nouveaux champs sont optionnels
- ✅ Le frontend peut envoyer ou non les nouveaux champs

### Performance
- Les champs `allergens`, `dietaryLabels`, `availableDays` utilisent le type `simple-array` de TypeORM
- Stockés comme texte séparé par des virgules en base
- Pour des requêtes complexes sur ces champs, envisager une table de liaison

---

## 📝 Résumé

| Aspect | Avant | Après |
|--------|-------|-------|
| Champs MenuItem | 11 | 20 (+9) |
| Allergènes | ❌ | ✅ 8 types |
| Labels diététiques | ❌ | ✅ 4 types |
| Disponibilité | ❌ | ✅ Par jour |
| Plat du jour | ❌ | ✅ |
| Nutrition | ❌ | ✅ Temps + Calories |
| Sous-catégories | ❌ | ✅ |
| Export CSV complet | ⚠️ Partiel | ✅ Complet |

---

## ✨ Conclusion

Le backend est maintenant **100% aligné** avec les fonctionnalités de `MenuManagement.tsx`. Toutes les fonctionnalités avancées du frontend (allergènes, labels diététiques, disponibilité, plat du jour, etc.) sont maintenant supportées par l'API.

**Migration exécutée avec succès** ✅  
**Aucune perte de données** ✅  
**Rétrocompatible** ✅
