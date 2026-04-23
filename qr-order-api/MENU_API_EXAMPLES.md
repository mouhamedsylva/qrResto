# 📚 Exemples d'utilisation de l'API Menu

## 🎯 Endpoints mis à jour avec les nouveaux champs

---

## 1. Créer un article de menu complet

### `POST /menus/items`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Burger Signature Vegan",
  "description": "Steak végétal, cheddar vegan, sauce maison, salade, tomate, oignons caramélisés",
  "price": 14.50,
  "categoryId": "uuid-category-plats",
  "imageUrl": "https://example.com/images/burger-vegan.jpg",
  
  "badgeLabel": "Best seller",
  "badgeColor": "#b91c1c",
  
  "stockQty": 25,
  "lowStockThreshold": 5,
  "displayOrder": 1,
  
  "isActive": true,
  "isDishOfDay": true,
  
  "prepTime": 15,
  "calories": 520,
  
  "allergens": ["gluten", "soy", "sesame"],
  "dietaryLabels": ["vegan"],
  
  "availableDays": [1, 2, 3, 4, 5],
  
  "subcategoryName": "Burgers"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid-generated",
  "name": "Burger Signature Vegan",
  "description": "Steak végétal, cheddar vegan, sauce maison, salade, tomate, oignons caramélisés",
  "price": 14.50,
  "imageUrl": "https://example.com/images/burger-vegan.jpg",
  "badgeLabel": "Best seller",
  "badgeColor": "#b91c1c",
  "stockQty": 25,
  "lowStockThreshold": 5,
  "displayOrder": 1,
  "isActive": true,
  "isDishOfDay": true,
  "prepTime": 15,
  "calories": 520,
  "allergens": ["gluten", "soy", "sesame"],
  "dietaryLabels": ["vegan"],
  "availableDays": [1, 2, 3, 4, 5],
  "ordersCount": 0,
  "subcategoryName": "Burgers",
  "category": {
    "id": "uuid-category-plats"
  }
}
```

---

## 2. Mettre à jour un article (toggle plat du jour)

### `PUT /menus/items/:id`

**Body:**
```json
{
  "isDishOfDay": true
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid-item",
  "name": "Burger Signature Vegan",
  "isDishOfDay": true,
  ...
}
```

---

## 3. Créer un plat avec allergènes multiples

### `POST /menus/items`

**Body:**
```json
{
  "name": "Salade César",
  "price": 11.00,
  "categoryId": "uuid-category-entrees",
  "allergens": ["gluten", "eggs", "fish", "lactose"],
  "dietaryLabels": [],
  "prepTime": 10,
  "calories": 350,
  "availableDays": [0, 1, 2, 3, 4, 5, 6],
  "subcategoryName": "Salades"
}
```

---

## 4. Créer un plat végétarien sans gluten

### `POST /menus/items`

**Body:**
```json
{
  "name": "Bowl Quinoa & Légumes",
  "description": "Quinoa bio, légumes de saison rôtis, houmous, graines",
  "price": 12.50,
  "categoryId": "uuid-category-plats",
  "allergens": ["sesame"],
  "dietaryLabels": ["vegan", "gluten-free"],
  "prepTime": 12,
  "calories": 420,
  "availableDays": [1, 2, 3, 4, 5],
  "badgeLabel": "Healthy",
  "badgeColor": "#16a34a",
  "subcategoryName": "Bowls"
}
```

---

## 5. Créer un plat disponible uniquement le week-end

### `POST /menus/items`

**Body:**
```json
{
  "name": "Brunch Complet",
  "description": "Œufs, bacon, pancakes, fruits frais, jus d'orange",
  "price": 18.00,
  "categoryId": "uuid-category-brunch",
  "allergens": ["gluten", "eggs", "lactose"],
  "dietaryLabels": [],
  "prepTime": 20,
  "calories": 850,
  "availableDays": [0, 6],
  "isDishOfDay": false,
  "badgeLabel": "Week-end",
  "badgeColor": "#d97706",
  "subcategoryName": "Brunch"
}
```

---

## 6. Mettre à jour le stock d'un article

### `PUT /menus/items/:id`

**Body:**
```json
{
  "stockQty": 0
}
```

**Use case:** Marquer un article en rupture de stock

---

## 7. Activer/Désactiver un article

### `PUT /menus/items/:id`

**Body:**
```json
{
  "isActive": false
}
```

**Use case:** Désactiver temporairement un article sans le supprimer

---

## 8. Réorganiser les articles (drag & drop)

### `POST /menus/items/reorder`

**Body:**
```json
{
  "orders": [
    { "id": "uuid-item-1", "order": 1 },
    { "id": "uuid-item-2", "order": 2 },
    { "id": "uuid-item-3", "order": 3 }
  ]
}
```

---

## 9. Upload d'image

### `POST /menus/items/upload-image`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Body (form-data):**
```
file: [binary image file]
```

**Response:** `200 OK`
```json
{
  "imageUrl": "http://localhost:3000/uploads/menu-items/1776256789123-burger.jpg",
  "path": "/uploads/menu-items/1776256789123-burger.jpg"
}
```

---

## 10. Récupérer toutes les catégories avec leurs articles

### `GET /menus/categories/:restaurantId`

**Response:** `200 OK`
```json
[
  {
    "id": "uuid-category-1",
    "name": "Entrées",
    "order": 1,
    "isActive": true,
    "items": [
      {
        "id": "uuid-item-1",
        "name": "Salade César",
        "price": 11.00,
        "allergens": ["gluten", "eggs", "fish", "lactose"],
        "dietaryLabels": [],
        "prepTime": 10,
        "calories": 350,
        "isDishOfDay": false,
        "isActive": true,
        "subcategoryName": "Salades",
        ...
      }
    ]
  },
  {
    "id": "uuid-category-2",
    "name": "Plats",
    "order": 2,
    "isActive": true,
    "items": [
      {
        "id": "uuid-item-2",
        "name": "Burger Signature Vegan",
        "price": 14.50,
        "allergens": ["gluten", "soy", "sesame"],
        "dietaryLabels": ["vegan"],
        "prepTime": 15,
        "calories": 520,
        "isDishOfDay": true,
        "isActive": true,
        "subcategoryName": "Burgers",
        ...
      }
    ]
  }
]
```

---

## 📊 Valeurs possibles pour les champs

### Allergènes (`allergens`)
```json
["gluten", "lactose", "nuts", "eggs", "fish", "shellfish", "soy", "sesame"]
```

### Labels diététiques (`dietaryLabels`)
```json
["vegan", "vegetarian", "halal", "gluten-free"]
```

### Jours disponibles (`availableDays`)
```json
[0, 1, 2, 3, 4, 5, 6]
```
- `0` = Dimanche
- `1` = Lundi
- `2` = Mardi
- `3` = Mercredi
- `4` = Jeudi
- `5` = Vendredi
- `6` = Samedi

---

## 🔍 Cas d'usage avancés

### Filtrer les plats du jour (côté frontend)
```typescript
const dishesOfDay = categories
  .flatMap(c => c.items)
  .filter(item => item.isDishOfDay && item.isActive);
```

### Filtrer par allergène (côté frontend)
```typescript
const glutenFreeItems = categories
  .flatMap(c => c.items)
  .filter(item => !item.allergens?.includes('gluten'));
```

### Filtrer par label diététique (côté frontend)
```typescript
const veganItems = categories
  .flatMap(c => c.items)
  .filter(item => item.dietaryLabels?.includes('vegan'));
```

### Filtrer par disponibilité aujourd'hui (côté frontend)
```typescript
const today = new Date().getDay(); // 0-6
const availableToday = categories
  .flatMap(c => c.items)
  .filter(item => item.availableDays?.includes(today));
```

### Articles en rupture de stock
```typescript
const outOfStock = categories
  .flatMap(c => c.items)
  .filter(item => item.stockQty === 0);
```

### Articles en stock faible
```typescript
const lowStock = categories
  .flatMap(c => c.items)
  .filter(item => 
    item.stockQty > 0 && 
    item.stockQty <= item.lowStockThreshold
  );
```

---

## 🎨 Exemples de badges personnalisés

### Best seller (rouge)
```json
{
  "badgeLabel": "Best seller",
  "badgeColor": "#b91c1c"
}
```

### Nouveau (vert)
```json
{
  "badgeLabel": "Nouveau",
  "badgeColor": "#047857"
}
```

### Signature (violet)
```json
{
  "badgeLabel": "Signature",
  "badgeColor": "#6d28d9"
}
```

### Healthy (vert clair)
```json
{
  "badgeLabel": "Healthy",
  "badgeColor": "#16a34a"
}
```

### Épicé (orange)
```json
{
  "badgeLabel": "Épicé",
  "badgeColor": "#ea580c"
}
```

---

## 🧪 Tests recommandés

### 1. Test de création complète
```bash
curl -X POST http://localhost:3000/menus/items \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Burger",
    "price": 12.50,
    "categoryId": "uuid-category",
    "allergens": ["gluten"],
    "dietaryLabels": ["vegan"],
    "prepTime": 15,
    "calories": 500,
    "availableDays": [1,2,3,4,5],
    "isDishOfDay": true
  }'
```

### 2. Test de mise à jour partielle
```bash
curl -X PUT http://localhost:3000/menus/items/<item-id> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "isDishOfDay": false,
    "stockQty": 10
  }'
```

### 3. Test de récupération
```bash
curl -X GET http://localhost:3000/menus/categories/<restaurant-id>
```

---

## ✅ Checklist de validation

- [ ] Créer un article avec tous les champs
- [ ] Mettre à jour un article existant
- [ ] Toggle `isDishOfDay`
- [ ] Toggle `isActive`
- [ ] Modifier le stock
- [ ] Ajouter/modifier des allergènes
- [ ] Ajouter/modifier des labels diététiques
- [ ] Modifier les jours de disponibilité
- [ ] Upload d'image
- [ ] Réorganiser les articles
- [ ] Supprimer un article
- [ ] Vérifier l'export CSV (frontend)
- [ ] Vérifier l'import CSV (frontend)

---

## 🚀 Prochaines améliorations possibles

### Endpoints de statistiques
```typescript
// Top des plats les plus commandés
GET /menus/items/top-sellers?restaurantId=xxx&limit=10

// Plats du jour actifs
GET /menus/items/dish-of-day?restaurantId=xxx

// Articles en rupture de stock
GET /menus/items/out-of-stock?restaurantId=xxx

// Articles par allergène
GET /menus/items/by-allergen?allergen=gluten&restaurantId=xxx

// Articles par label diététique
GET /menus/items/by-dietary?label=vegan&restaurantId=xxx
```

### Webhooks
```typescript
// Notification quand un article passe en stock faible
POST /webhooks/low-stock

// Notification quand un article est en rupture
POST /webhooks/out-of-stock
```

### Analytics
```typescript
// Incrémenter le compteur de commandes
PUT /menus/items/:id/increment-orders

// Statistiques de popularité
GET /menus/items/:id/stats
```
