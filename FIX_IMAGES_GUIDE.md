# 🖼️ Guide de Correction des Images

## 🐛 Problème Identifié

Les articles dans votre base de données utilisent des URLs Unsplash obsolètes au format:
```
https://source.unsplash.com/400x300/?Salade-niçoise
```

Ce format n'est **plus supporté** par Unsplash depuis 2022. Les images ne s'affichent donc pas.

## ✅ Solution

Deux scripts ont été créés pour corriger ce problème:

### 1. Script de Correction des URLs Unsplash

**Fichier**: `qr-order-api/src/database/scripts/fix-unsplash-images.ts`

Ce script:
- ✅ Détecte toutes les URLs Unsplash obsolètes
- ✅ Les remplace par des URLs valides
- ✅ Utilise un mapping intelligent basé sur le nom du plat
- ✅ Fallback sur l'image par défaut de la catégorie

**Mapping intelligent**:
```typescript
'salade' → https://images.unsplash.com/photo-1512621776951-a57141f2eefd
'steak' → https://images.unsplash.com/photo-1558030006-450675393462
'pizza' → https://images.unsplash.com/photo-1513104890138-7c749659a591
'mousse' → https://images.unsplash.com/photo-1551024601-bec78aea704b
etc.
```

### 2. Script d'Ajout d'Images par Défaut

**Fichier**: `qr-order-api/src/database/scripts/add-default-images.ts`

Ce script:
- ✅ Trouve tous les articles sans image
- ✅ Leur attribue une image par défaut selon leur catégorie

## 🚀 Utilisation

### Étape 1: Corriger les URLs Unsplash Obsolètes

```bash
cd qr-order-api
npm run fix:unsplash-images
```

**Résultat attendu**:
```
✅ Connexion à la base de données établie

📊 X articles à corriger

✅ Salade niçoise
   Catégorie: Entrées
   Avant: https://source.unsplash.com/400x300/?Salade-niçoise
   Après: https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80

✅ Mousse au chocolat
   Catégorie: Desserts
   Avant: https://source.unsplash.com/400x300/?Mousse-au-chocolat
   Après: https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80

...

🎉 X articles mis à jour avec succès!

📝 Résumé:
   - Articles corrigés: X
   - Toutes les images utilisent maintenant des URLs Unsplash valides

✅ Connexion fermée
```

### Étape 2: Ajouter des Images aux Articles Sans Image (Optionnel)

```bash
npm run add:default-images
```

## 📊 Mapping des Images

### Entrées
| Mot-clé | Image |
|---------|-------|
| salade | Salade fraîche |
| soupe, velouté | Soupe chaude |
| carpaccio | Carpaccio de bœuf |
| tartare | Tartare de saumon |
| escargot | Escargots de Bourgogne |

### Plats - Viandes
| Mot-clé | Image |
|---------|-------|
| steak, entrecôte | Steak grillé |
| bœuf | Bœuf bourguignon |
| poulet | Poulet rôti |
| cordon | Cordon bleu |

### Plats - Poissons
| Mot-clé | Image |
|---------|-------|
| saumon | Saumon grillé |
| cabillaud, sole | Poisson blanc |
| moules | Moules marinières |

### Plats - Pâtes
| Mot-clé | Image |
|---------|-------|
| spaghetti, tagliatelle | Pâtes |
| lasagne | Lasagnes |
| risotto | Risotto |

### Plats - Pizzas
| Mot-clé | Image |
|---------|-------|
| pizza | Pizza |

### Desserts
| Mot-clé | Image |
|---------|-------|
| mousse | Mousse au chocolat |
| tiramisu | Tiramisu |
| tarte | Tarte aux pommes |
| crème | Crème brûlée |
| crêpe | Crêpes |
| gaufre | Gaufres |
| glace, sorbet | Glace |
| salade de fruits | Salade de fruits |

## 🔄 Fallback par Catégorie

Si aucun mot-clé ne correspond, l'image par défaut de la catégorie est utilisée:

| Catégorie | Image par Défaut |
|-----------|------------------|
| Entrées | Plat d'entrée générique |
| Plats | Plat principal générique |
| Desserts | Dessert générique |
| Boissons | Boisson générique |

## 🎨 Client Flutter

Le client Flutter a également été mis à jour pour gérer les images manquantes:

**Fichier**: `qr-order-client/lib/models/product.dart`

```dart
// Si l'imageUrl est vide, utiliser une image par défaut basée sur la catégorie
if (imageUrl.isEmpty) {
  switch (categoryName.toLowerCase()) {
    case 'entrées':
      imageUrl = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80';
      break;
    case 'plats':
      imageUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80';
      break;
    case 'desserts':
      imageUrl = 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80';
      break;
    // ...
  }
}
```

## ✅ Vérification

Après avoir exécuté le script:

1. **Vérifier dans la base de données**:
```sql
SELECT name, "imageUrl" FROM menu_items LIMIT 10;
```

2. **Tester dans le client Flutter**:
```bash
cd qr-order-client
flutter run -d chrome
```

3. **Vérifier que les images s'affichent** dans le menu

## 🔧 Pour les Nouveaux Articles

Lors de la création d'un nouvel article via l'interface owner:

1. **Avec image personnalisée**:
   - Uploader une image via le bouton "Télécharger une image"
   - L'image sera stockée et l'URL sera automatiquement renseignée

2. **Sans image**:
   - Laisser le champ vide
   - Le client Flutter affichera automatiquement une image par défaut selon la catégorie

## 📝 Format d'URL Valide

Les URLs Unsplash valides suivent ce format:
```
https://images.unsplash.com/photo-[ID]?w=400&q=80
```

**Exemples**:
- ✅ `https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80`
- ❌ `https://source.unsplash.com/400x300/?salade` (obsolète)

## 🎯 Résultat Final

Après correction:
- ✅ Toutes les images s'affichent correctement
- ✅ URLs Unsplash valides et fonctionnelles
- ✅ Fallback automatique pour les images manquantes
- ✅ Expérience utilisateur améliorée

---

**Date**: 23 avril 2026  
**Status**: ✅ Scripts créés et prêts à l'emploi  
**Impact**: Correction de toutes les images obsolètes
