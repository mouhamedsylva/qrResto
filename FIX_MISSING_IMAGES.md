# 🖼️ Correction des Images Manquantes

## 🐛 Problème Identifié

Les articles dans la base de données n'ont pas d'`imageUrl` définie, ce qui empêche l'affichage des images dans le client Flutter.

## ✅ Solutions Implémentées

### 1. Fallback dans le Client Flutter ✅

Le modèle `Product` a été amélioré pour afficher des images par défaut selon la catégorie si `imageUrl` est vide:

```dart
// qr-order-client/lib/models/product.dart

// Images par défaut selon la catégorie
switch (categoryName.toLowerCase()) {
  case 'entrées':
  case 'entrees':
    imageUrl = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80';
    break;
  case 'plats':
  case 'plat':
    imageUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80';
    break;
  case 'desserts':
  case 'dessert':
    imageUrl = 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80';
    break;
  case 'boissons':
  case 'boisson':
    imageUrl = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80';
    break;
  default:
    imageUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80';
}
```

**Avantages**:
- ✅ Les articles s'affichent immédiatement avec des images
- ✅ Pas besoin de modifier la base de données
- ✅ Logs dans la console pour identifier les articles sans image

### 2. Script de Migration pour la Base de Données ✅

Un script a été créé pour ajouter des images par défaut aux articles existants:

**Fichier**: `qr-order-api/src/database/scripts/add-default-images.ts`

**Commande**:
```bash
cd qr-order-api
npm run add:default-images
```

**Ce que fait le script**:
1. Se connecte à la base de données
2. Trouve tous les articles sans `imageUrl`
3. Assigne une image par défaut selon la catégorie
4. Sauvegarde les modifications
5. Affiche un rapport détaillé

**Exemple de sortie**:
```
✅ Connexion à la base de données établie

📊 15 articles sans image trouvés

✅ Salade César (Entrées) → https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80
✅ Burger Maison (Plats) → https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80
✅ Tiramisu (Desserts) → https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80
...

🎉 15 articles mis à jour avec succès!
✅ Connexion fermée
```

### 3. Création de Nouveaux Articles ✅

L'interface owner permet déjà d'ajouter des images lors de la création d'articles:

**Fonctionnalités**:
- ✅ Upload d'image via formulaire
- ✅ Prévisualisation de l'image
- ✅ Sauvegarde de l'`imageUrl` dans la base de données
- ✅ Endpoint API: `POST /menus/items/upload-image`

**Workflow**:
1. Créer un nouvel article dans l'interface owner
2. Cliquer sur "Choisir une image"
3. Sélectionner un fichier
4. L'image est uploadée et l'URL est sauvegardée
5. L'article s'affiche avec l'image dans le client

---

## 🚀 Comment Utiliser

### Option A: Utiliser les Images par Défaut (Recommandé)

Les images par défaut sont déjà configurées dans le client Flutter. Aucune action nécessaire!

**Avantages**:
- ✅ Fonctionne immédiatement
- ✅ Pas de modification de la base de données
- ✅ Images de qualité depuis Unsplash

### Option B: Mettre à Jour la Base de Données

Si vous voulez que les images par défaut soient dans la base de données:

```bash
cd qr-order-api
npm run add:default-images
```

**Avantages**:
- ✅ Images persistées en base
- ✅ Cohérence des données
- ✅ Facilite les exports/imports

### Option C: Ajouter des Images Personnalisées

Pour chaque article, via l'interface owner:

1. Aller dans "Menu Management"
2. Cliquer sur "Modifier" pour un article
3. Cliquer sur "Choisir une image"
4. Uploader votre image
5. Sauvegarder

**Avantages**:
- ✅ Images personnalisées
- ✅ Meilleure expérience utilisateur
- ✅ Branding cohérent

---

## 📊 Images par Défaut

| Catégorie | Image par Défaut |
|-----------|------------------|
| Entrées | ![Entrées](https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&q=80) |
| Plats | ![Plats](https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80) |
| Desserts | ![Desserts](https://images.unsplash.com/photo-1551024601-bec78aea704b?w=200&q=80) |
| Boissons | ![Boissons](https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&q=80) |

**Source**: Unsplash (images libres de droits)

---

## 🔍 Vérification

### Dans le Client Flutter

Lancer le client et vérifier les logs:

```bash
cd qr-order-client
flutter run -d chrome
```

**Logs attendus**:
```
⚠️  Produit "Salade César" sans image, utilisation de l'image par défaut pour Entrées
✅ Produit "Burger Premium" avec image: https://example.com/burger.jpg
⚠️  Produit "Tiramisu" sans image, utilisation de l'image par défaut pour Desserts
```

### Dans la Base de Données

Vérifier les articles sans image:

```sql
SELECT 
  mi.name, 
  mc.name as category, 
  mi."imageUrl"
FROM menu_items mi
LEFT JOIN menu_categories mc ON mi."categoryId" = mc.id
WHERE mi."imageUrl" IS NULL OR mi."imageUrl" = '';
```

---

## 🎯 Résultat

### Avant ❌
```
Articles affichés sans images
❌ Expérience utilisateur dégradée
❌ Interface peu attractive
```

### Après ✅
```
✅ Tous les articles ont une image
✅ Images par défaut selon la catégorie
✅ Possibilité d'uploader des images personnalisées
✅ Expérience utilisateur améliorée
```

---

## 📝 Notes Techniques

### Structure de l'Entité MenuItem

```typescript
@Entity('menu_items')
export class MenuItem {
  @Column({ nullable: true })
  imageUrl: string;
  
  // ... autres champs
}
```

**Important**: Le champ `imageUrl` est `nullable`, donc les articles peuvent exister sans image.

### DTO de Création

```typescript
export class CreateMenuItemDto {
  @IsString()
  @IsOptional()
  imageUrl?: string;
  
  // ... autres champs
}
```

**Important**: Le champ `imageUrl` est optionnel lors de la création.

### Upload d'Image

L'API expose un endpoint pour uploader des images:

```typescript
POST /api/v1/menus/items/upload-image
Content-Type: multipart/form-data

Response:
{
  "imageUrl": "https://storage.example.com/images/abc123.jpg"
}
```

---

## ✅ Checklist

- [x] Fallback dans le client Flutter
- [x] Script de migration créé
- [x] Commande npm ajoutée
- [x] Images par défaut définies
- [x] Upload d'image fonctionnel
- [x] Documentation créée

---

## 🔜 Améliorations Futures

### 1. Service de Stockage d'Images
- Intégrer AWS S3 ou Cloudinary
- Optimisation automatique des images
- Génération de thumbnails

### 2. Validation des Images
- Vérifier le format (JPEG, PNG, WebP)
- Limiter la taille (max 5MB)
- Vérifier les dimensions

### 3. Images Multiples
- Permettre plusieurs images par article
- Galerie d'images
- Zoom sur les images

---

**Date**: 23 avril 2026  
**Status**: ✅ Corrigé  
**Impact**: Les articles s'affichent maintenant avec des images
