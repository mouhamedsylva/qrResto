# 🎨 État de la migration CSS - TablesAndQr

## ✅ Ce qui a été fait

### 1. Création du fichier CSS (100%)
✅ **`src/styles/TablesAndQr.css`** créé avec :
- Toutes les classes nécessaires pour les composants
- Utilisation des variables CSS existantes du projet
- Design cohérent avec le reste de l'application
- Responsive design
- Animations et transitions

### 2. Import du CSS (100%)
✅ **`src/pages/TablesAndQr.tsx`** mis à jour :
```typescript
import '../styles/TablesAndQr.css';
```

### 3. Composants migrés (4/20 - 20%)

#### ✅ Composants de base (4/4)
1. ✅ **TabNavigation.tsx** - Migration complète
2. ✅ **SearchBar.tsx** - Migration complète
3. ✅ **LoadingSpinner.tsx** - Migration complète
4. ✅ **ErrorMessage.tsx** - Migration complète

#### ⏳ Composants Tables (0/4)
5. ⏳ **TablesGrid.tsx** - À migrer
6. ⏳ **TableCard.tsx** - À migrer
7. ⏳ **TableForm.tsx** - À migrer
8. ⏳ **BulkActions.tsx** - À migrer

#### ⏳ Composants Réservations (0/4)
9. ⏳ **ReservationsList.tsx** - À migrer
10. ⏳ **ReservationCard.tsx** - À migrer
11. ⏳ **ReservationForm.tsx** - À migrer
12. ⏳ **ReservationFilters.tsx** - À migrer

#### ⏳ Composants QR (0/4)
13. ⏳ **QrCustomizer.tsx** - À migrer
14. ⏳ **QrPreview.tsx** - À migrer
15. ⏳ **ColorPicker.tsx** - À migrer
16. ⏳ **LogoUploader.tsx** - À migrer

#### ⏳ Composants Preview & Print (0/4)
17. ⏳ **MenuPreview.tsx** - À migrer
18. ⏳ **PhoneMockup.tsx** - À migrer
19. ⏳ **PrintTemplates.tsx** - À migrer
20. ⏳ **TemplateCard.tsx** - À migrer

---

## 📊 Progression

```
Composants migrés : 4/20 (20%)
████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 20%
```

---

## 🎯 Prochaines étapes

### Priorité 1 : Composants Tables (critique pour l'affichage)
Ces composants sont essentiels pour voir la page fonctionner :

1. **TablesGrid.tsx** - Conteneur principal
   - Remplacer `space-y-6` par structure avec classes custom
   - Remplacer `flex items-center justify-between` par classes custom
   - Remplacer `grid grid-cols-*` par `.tables-grid`

2. **TableCard.tsx** - Carte de table
   - Remplacer toutes les classes Tailwind par `.table-card-*`
   - Utiliser `.table-card-number`, `.table-card-code`, etc.

3. **TableForm.tsx** - Formulaire de création
   - Remplacer par `.table-form-inline`, `.table-form-input`

4. **BulkActions.tsx** - Actions en masse
   - Remplacer par `.bulk-actions`, `.bulk-actions-btn`

### Priorité 2 : Composants Réservations
5-8. Migrer les composants de réservations

### Priorité 3 : Composants avancés
9-20. Migrer les composants QR, Preview, Print

---

## 🔧 Comment migrer un composant

### Étape 1 : Identifier les classes Tailwind
```typescript
// Avant
<div className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg">
```

### Étape 2 : Trouver la classe équivalente dans TablesAndQr.css
```css
/* Dans TablesAndQr.css */
.table-card-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--surface-0);
  border: 1px solid var(--border);
  border-radius: var(--r-md);
}
```

### Étape 3 : Remplacer
```typescript
// Après
<div className="table-card-btn">
```

---

## 💡 Classes CSS disponibles

### Navigation
- `.tab-navigation` - Conteneur des onglets
- `.tab-button` - Bouton d'onglet
- `.tab-button.active` - Onglet actif

### Recherche
- `.search-bar-container` - Conteneur
- `.search-bar-input` - Input
- `.search-bar-icon` - Icône de recherche
- `.search-bar-clear` - Bouton clear

### Loading & Erreurs
- `.loading-spinner-container` - Conteneur du spinner
- `.loading-spinner` - Spinner animé
- `.error-message` - Message d'erreur
- `.error-message-retry` - Bouton retry

### Tables
- `.tables-grid-container` - Conteneur principal
- `.tables-grid` - Grille de tables
- `.table-card` - Carte de table
- `.table-card.selected` - Table sélectionnée
- `.table-card-number` - Numéro de table
- `.table-card-code` - Code de table
- `.table-card-status` - Badge de statut
- `.table-card-actions` - Conteneur d'actions
- `.table-card-btn` - Bouton d'action

### Formulaires
- `.table-form-inline` - Formulaire inline
- `.table-form-input` - Input de formulaire
- `.table-form-btn` - Bouton de formulaire

### Actions en masse
- `.bulk-actions` - Barre d'actions en masse
- `.bulk-actions-btn` - Bouton d'action
- `.bulk-actions-menu` - Menu déroulant

### Réservations
- `.reservations-container` - Conteneur principal
- `.reservations-grid` - Grille de réservations
- `.reservation-card` - Carte de réservation
- `.reservation-card-header` - Header de carte
- `.reservation-card-actions` - Actions de carte
- `.reservation-modal` - Modal de formulaire
- `.reservation-form-grid` - Grille de formulaire

### Filtres
- `.reservations-filters` - Conteneur de filtres
- `.filter-group` - Groupe de filtre
- `.filter-input` - Input de filtre
- `.filter-quick-btn` - Bouton rapide

---

## 🎨 Variables CSS disponibles

Toutes les variables du projet sont disponibles :

### Couleurs
- `var(--primary)` - Couleur primaire (#D94A6A)
- `var(--primary-hover)` - Hover primaire
- `var(--primary-faint)` - Primaire transparent
- `var(--success)` - Vert de succès
- `var(--danger)` - Rouge d'erreur
- `var(--warning)` - Orange d'avertissement
- `var(--info)` - Bleu d'information

### Surfaces
- `var(--bg)` - Fond de page
- `var(--surface-0)` - Surface blanche
- `var(--surface-1)` - Surface grise claire

### Texte
- `var(--text-900)` - Texte principal
- `var(--text-600)` - Texte secondaire
- `var(--text-400)` - Texte tertiaire

### Bordures & Ombres
- `var(--border)` - Bordure standard
- `var(--shadow-sm)` - Ombre petite
- `var(--shadow-md)` - Ombre moyenne
- `var(--shadow-lg)` - Ombre grande
- `var(--shadow-xl)` - Ombre extra-grande

### Radius
- `var(--r-sm)` - 6px
- `var(--r-md)` - 10px
- `var(--r-lg)` - 14px
- `var(--r-xl)` - 20px
- `var(--r-full)` - 9999px

### Transitions
- `var(--dur-fast)` - 150ms
- `var(--dur-base)` - 250ms
- `var(--dur-slow)` - 400ms
- `var(--ease)` - Courbe d'animation

---

## 🚀 Pour tester

1. Démarrer le frontend :
```bash
cd qr-order-owner
npm run dev
```

2. Accéder à la page :
```
http://localhost:5173/tables
```

3. Vérifier que :
   - ✅ Les onglets s'affichent correctement
   - ✅ La barre de recherche fonctionne
   - ✅ Le spinner de chargement s'affiche
   - ✅ Les messages d'erreur s'affichent

---

## 📝 Notes importantes

### Différences avec Tailwind

1. **Pas de classes utilitaires** : Utiliser les classes sémantiques
2. **Variables CSS** : Utiliser `var(--primary)` au lieu de `orange-500`
3. **Animations** : Déjà définies dans le CSS
4. **Responsive** : Géré dans le CSS avec media queries

### Avantages du CSS custom

1. ✅ **Cohérence** : Même design que le reste de l'app
2. ✅ **Performance** : Pas de Tailwind à charger
3. ✅ **Maintenabilité** : Classes sémantiques faciles à comprendre
4. ✅ **Thème** : Variables CSS centralisées

---

## 🎉 Résultat attendu

Une fois tous les composants migrés, la page TablesAndQr aura :
- ✅ Design cohérent avec le reste de l'application
- ✅ Animations fluides
- ✅ Responsive design
- ✅ Performance optimale
- ✅ Code maintenable

**Progression actuelle : 20% (4/20 composants)**

**Prochaine étape : Migrer les composants Tables (TablesGrid, TableCard, TableForm, BulkActions)**
