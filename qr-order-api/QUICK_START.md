# 🚀 Quick Start - Nouveaux champs Menu

## ⚡ Démarrage rapide

### 1. La migration a déjà été exécutée ✅
```bash
# Déjà fait !
npm run migration:run
```

### 2. Démarrer le serveur
```bash
npm run start:dev
```

### 3. Tester un endpoint
```bash
curl -X POST http://localhost:3000/menus/items \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Burger Vegan",
    "price": 12.50,
    "categoryId": "YOUR_CATEGORY_ID",
    "allergens": ["gluten", "soy"],
    "dietaryLabels": ["vegan"],
    "prepTime": 15,
    "calories": 500,
    "isDishOfDay": true
  }'
```

---

## 📋 Nouveaux champs disponibles

### ✅ Champs obligatoires (inchangés)
- `name` (string)
- `price` (number)
- `categoryId` (uuid)

### 🆕 Nouveaux champs optionnels

#### Nutrition
```typescript
prepTime?: number;        // Temps de préparation (minutes)
calories?: number;        // Calories (kcal)
```

#### Allergènes & Diététique
```typescript
allergens?: string[];     // ["gluten", "lactose", "nuts", "eggs", "fish", "shellfish", "soy", "sesame"]
dietaryLabels?: string[]; // ["vegan", "vegetarian", "halal", "gluten-free"]
```

#### Disponibilité
```typescript
availableDays?: number[]; // [0,1,2,3,4,5,6] (0=Dim, 6=Sam)
isDishOfDay?: boolean;    // Plat du jour
isActive?: boolean;       // Actif/Inactif (remplace isAvailable)
```

#### Organisation
```typescript
subcategoryName?: string; // Ex: "Burgers", "Entrées chaudes"
```

#### Statistiques
```typescript
ordersCount?: number;     // Nombre de commandes (auto-géré)
```

---

## 🎯 Exemples rapides

### Plat vegan sans gluten
```json
{
  "name": "Bowl Quinoa",
  "price": 11.50,
  "categoryId": "xxx",
  "allergens": ["sesame"],
  "dietaryLabels": ["vegan", "gluten-free"],
  "prepTime": 12,
  "calories": 420
}
```

### Plat du jour
```json
{
  "name": "Plat du Chef",
  "price": 15.00,
  "categoryId": "xxx",
  "isDishOfDay": true,
  "prepTime": 20
}
```

### Plat week-end uniquement
```json
{
  "name": "Brunch Complet",
  "price": 18.00,
  "categoryId": "xxx",
  "availableDays": [0, 6],
  "allergens": ["gluten", "eggs", "lactose"]
}
```

---

## 📚 Documentation complète

- **MENU_ALIGNMENT_CHANGES.md** - Détails techniques
- **MENU_API_EXAMPLES.md** - 10 exemples d'utilisation
- **ALIGNMENT_SUMMARY.md** - Vue d'ensemble

---

## ✅ Checklist

- [x] Migration exécutée
- [x] Entity mise à jour
- [x] DTO mis à jour
- [x] Build réussi
- [x] Aucune erreur TypeScript
- [ ] Tester les endpoints
- [ ] Vérifier le frontend

---

## 🎉 C'est prêt !

Votre backend est maintenant 100% aligné avec `MenuManagement.tsx` !
