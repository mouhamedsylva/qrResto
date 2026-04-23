# 🎨 Plan de migration CSS - TablesAndQr

## 📋 Situation actuelle

Les composants TablesAndQr utilisent des classes Tailwind CSS, mais le projet utilise un système CSS custom avec des variables CSS.

## ✅ Ce qui a été fait

1. ✅ Créé `src/styles/TablesAndQr.css` avec toutes les classes nécessaires
2. ✅ Utilisé le système de design existant (variables CSS du projet)
3. ✅ Créé des classes pour tous les composants

## 🔄 Ce qui reste à faire

### Étape 1 : Importer le CSS dans TablesAndQr.tsx
```typescript
import '../styles/TablesAndQr.css';
```

### Étape 2 : Mettre à jour les composants

Chaque composant doit être mis à jour pour utiliser les nouvelles classes CSS au lieu de Tailwind.

#### Composants à mettre à jour (20 fichiers)

1. **TabNavigation.tsx** - Remplacer les classes Tailwind par `.tab-navigation`, `.tab-button`
2. **SearchBar.tsx** - Utiliser `.search-bar-container`, `.search-bar-input`
3. **LoadingSpinner.tsx** - Utiliser `.loading-spinner-container`, `.loading-spinner`
4. **ErrorMessage.tsx** - Utiliser `.error-message`, `.error-message-content`
5. **TablesGrid.tsx** - Utiliser `.tables-grid-container`, `.tables-grid`
6. **TableCard.tsx** - Utiliser `.table-card`, `.table-card-number`
7. **TableForm.tsx** - Utiliser `.table-form-inline`, `.table-form-input`
8. **BulkActions.tsx** - Utiliser `.bulk-actions`, `.bulk-actions-btn`
9. **ReservationsList.tsx** - Utiliser `.reservations-container`, `.reservations-grid`
10. **ReservationCard.tsx** - Utiliser `.reservation-card`, `.reservation-card-header`
11. **ReservationForm.tsx** - Utiliser `.reservation-modal`, `.reservation-form-grid`
12. **ReservationFilters.tsx** - Utiliser `.reservations-filters`, `.filter-group`
13. **QrCustomizer.tsx** - À adapter avec les classes existantes
14. **QrPreview.tsx** - À adapter avec les classes existantes
15. **ColorPicker.tsx** - À adapter avec les classes existantes
16. **LogoUploader.tsx** - À adapter avec les classes existantes
17. **MenuPreview.tsx** - À adapter avec les classes existantes
18. **PhoneMockup.tsx** - À adapter avec les classes existantes
19. **PrintTemplates.tsx** - À adapter avec les classes existantes
20. **TemplateCard.tsx** - À adapter avec les classes existantes

## 🎯 Priorité

### Haute priorité (affichage de base)
1. TabNavigation
2. TablesGrid
3. TableCard
4. SearchBar
5. LoadingSpinner
6. ErrorMessage

### Moyenne priorité (fonctionnalités principales)
7. TableForm
8. BulkActions
9. ReservationsList
10. ReservationCard
11. ReservationForm
12. ReservationFilters

### Basse priorité (fonctionnalités avancées)
13-20. Composants QR, Preview, Print

## 📝 Exemple de migration

### Avant (Tailwind)
```typescript
<div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
  <span className="text-sm font-medium text-gray-700">Button</span>
</div>
```

### Après (CSS Custom)
```typescript
<div className="table-card-btn table-card-btn-primary">
  <span>Button</span>
</div>
```

## 🚀 Prochaines étapes

1. Importer le CSS dans TablesAndQr.tsx
2. Mettre à jour les composants un par un
3. Tester chaque composant après migration
4. Ajuster les styles si nécessaire

## 💡 Notes

- Le fichier CSS utilise les variables CSS existantes du projet
- Les animations et transitions sont cohérentes avec le reste de l'application
- Le design est responsive et s'adapte aux différentes tailles d'écran
