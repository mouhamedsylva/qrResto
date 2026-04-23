# ✅ Nouvelle fonctionnalité : Pagination dans Staff.tsx

## 🎯 Fonctionnalité ajoutée

Pagination automatique dans la page Staff.tsx lorsque le nombre de membres dépasse un certain seuil.

## 📊 Configuration

- **Éléments par page** : 10 membres
- **Activation** : Automatique dès que le nombre de membres > 10
- **Réinitialisation** : La page revient à 1 lors du changement de vue (actifs ↔ archivés)

## 🎨 Interface utilisateur

### Barre de pagination

La barre de pagination s'affiche en bas du tableau et contient :

1. **Indicateur de plage** (gauche)
   - Format : "Affichage de X à Y sur Z membre(s)"
   - Exemple : "Affichage de 1 à 10 sur 25 membre(s)"

2. **Contrôles de navigation** (droite)
   - Bouton **"Précédent"** : Désactivé sur la page 1
   - **Numéros de page** : Boutons cliquables (page active en surbrillance)
   - Bouton **"Suivant"** : Désactivé sur la dernière page

### Design

```
┌─────────────────────────────────────────────────────────────┐
│ Affichage de 1 à 10 sur 25 membre(s)    [Précédent] [1] [2] [3] [Suivant] │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Implémentation technique

### 1. États ajoutés

```typescript
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage] = useState(10);
```

### 2. Logique de pagination

```typescript
// Calculs de pagination
const currentList = showArchived ? archivedTeam : team;
const totalPages = Math.ceil(currentList.length / itemsPerPage);
const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;
const paginatedList = currentList.slice(startIndex, endIndex);
```

### 3. Fonctions de navigation

```typescript
const goToPage = (page: number) => {
  setCurrentPage(page);
  setSelectedIds([]);
};

const goToNextPage = () => {
  if (currentPage < totalPages) {
    setCurrentPage(currentPage + 1);
    setSelectedIds([]);
  }
};

const goToPreviousPage = () => {
  if (currentPage > 1) {
    setCurrentPage(currentPage - 1);
    setSelectedIds([]);
  }
};
```

### 4. Réinitialisation automatique

```typescript
// Réinitialiser la page lors du changement de vue
useEffect(() => {
  setCurrentPage(1);
  setSelectedIds([]);
}, [showArchived]);
```

### 5. Sélection multiple adaptée

La fonction `toggleAll` ne sélectionne que les éléments de la page courante :

```typescript
const toggleAll = () => {
  if (selectedIds.length === paginatedList.length) {
    setSelectedIds([]);
    return;
  }
  setSelectedIds(paginatedList.map((member) => member.id));
};
```

## 🎯 Comportement

### Affichage de la pagination

| Nombre de membres | Pagination visible |
|-------------------|-------------------|
| ≤ 10 | ❌ Non (pas nécessaire) |
| > 10 | ✅ Oui (automatique) |

### Navigation

1. **Page 1** : Bouton "Précédent" désactivé
2. **Page intermédiaire** : Tous les boutons actifs
3. **Dernière page** : Bouton "Suivant" désactivé

### Changement de vue

Lors du passage de "Membres actifs" à "Membres archivés" (ou inverse) :
- ✅ Retour automatique à la page 1
- ✅ Désélection de tous les éléments
- ✅ Recalcul de la pagination

### Sélection multiple

- ✅ La case "Tout sélectionner" ne sélectionne que les éléments de la page courante
- ✅ Les sélections sont réinitialisées lors du changement de page
- ✅ Les actions multiples (archivage, désarchivage) s'appliquent uniquement aux éléments sélectionnés

## 📋 Exemples d'utilisation

### Exemple 1 : 25 membres actifs

```
Page 1 : Membres 1-10
Page 2 : Membres 11-20
Page 3 : Membres 21-25

Affichage : "Affichage de 1 à 10 sur 25 membre(s)"
Navigation : [Précédent] [1] [2] [3] [Suivant]
```

### Exemple 2 : 8 membres actifs

```
Page unique : Membres 1-8

Affichage : Pas de pagination (≤ 10 membres)
```

### Exemple 3 : 15 membres archivés

```
Page 1 : Membres 1-10
Page 2 : Membres 11-15

Affichage : "Affichage de 1 à 10 sur 15 membre(s)"
Navigation : [Précédent] [1] [2] [Suivant]
```

## 🎨 Styles CSS

La pagination utilise les classes existantes du projet :

```css
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-top: 1px solid var(--border);
}

/* Boutons de pagination */
.btn-primary /* Page active */
.btn-ghost   /* Pages inactives */
.btn-sm      /* Taille des boutons */
```

### Boutons désactivés

```css
opacity: 0.5;
cursor: not-allowed;
```

## 🔄 Flux utilisateur

### Navigation simple

1. Utilisateur arrive sur Staff.tsx
2. Si > 10 membres : Pagination visible
3. Clic sur "Page 2" → Affichage des membres 11-20
4. Clic sur "Suivant" → Affichage des membres 21-30
5. Clic sur "Précédent" → Retour aux membres 11-20

### Sélection et action multiple

1. Utilisateur sur Page 2 (membres 11-20)
2. Coche "Tout sélectionner" → Sélection des membres 11-20 uniquement
3. Clic sur "Archiver sélection" → Archivage des 10 membres
4. Rechargement → Retour automatique à la page 1

### Changement de vue

1. Utilisateur sur Page 3 des membres actifs
2. Clic sur "Voir archives" → Retour automatique à la page 1 des archives
3. Clic sur "Voir actifs" → Retour automatique à la page 1 des actifs

## ✅ Avantages

- ✅ **Performance** : Affichage de 10 éléments max par page
- ✅ **UX** : Navigation intuitive avec boutons numérotés
- ✅ **Clarté** : Indicateur de plage visible
- ✅ **Automatique** : S'active uniquement si nécessaire
- ✅ **Responsive** : Sélection multiple adaptée à la page courante
- ✅ **Cohérence** : Réinitialisation lors des changements de contexte

## 🧪 Test de la fonctionnalité

### Test 1 : Pagination visible

1. Créer plus de 10 membres
2. Aller sur Staff.tsx
3. ✅ La pagination s'affiche en bas du tableau
4. ✅ Seuls 10 membres sont visibles

### Test 2 : Navigation

1. Cliquer sur "Page 2"
2. ✅ Affichage des membres 11-20
3. ✅ Bouton "Page 2" en surbrillance
4. Cliquer sur "Suivant"
5. ✅ Passage à la page 3

### Test 3 : Sélection multiple

1. Sur Page 2, cocher "Tout sélectionner"
2. ✅ Sélection des 10 membres de la page uniquement
3. Passer à la Page 3
4. ✅ Désélection automatique

### Test 4 : Changement de vue

1. Sur Page 3 des actifs
2. Cliquer sur "Voir archives"
3. ✅ Retour à la page 1 des archives
4. ✅ Désélection automatique

### Test 5 : Pagination masquée

1. Avoir ≤ 10 membres
2. ✅ Pas de pagination visible
3. ✅ Tous les membres affichés

## 📦 Fichiers modifiés

- ✅ `qr-order-owner/src/pages/Staff.tsx`

## 💡 Configuration personnalisable

Pour modifier le nombre d'éléments par page, changez la valeur dans le state :

```typescript
const [itemsPerPage] = useState(10);  // Modifier ici (ex: 20, 50, etc.)
```

## 🎯 Cas d'usage

### Petite équipe (< 10 membres)

- Pas de pagination
- Tous les membres visibles
- Interface simple et directe

### Équipe moyenne (10-50 membres)

- Pagination avec 2-5 pages
- Navigation facile avec numéros de page
- Sélection multiple par page

### Grande équipe (> 50 membres)

- Pagination avec plusieurs pages
- Navigation efficace
- Performance optimisée (10 éléments par page)

## 🚀 Améliorations futures possibles

- [ ] Recherche/filtre par nom ou email
- [ ] Tri par colonne (nom, rôle, statut)
- [ ] Sélecteur de nombre d'éléments par page (10, 20, 50)
- [ ] Pagination côté serveur pour très grandes équipes (> 1000 membres)
- [ ] Raccourcis clavier (← → pour navigation)

## 🎉 Résumé

La pagination est maintenant opérationnelle dans Staff.tsx :

- ✅ **Activation automatique** : Dès que > 10 membres
- ✅ **Navigation intuitive** : Boutons numérotés + Précédent/Suivant
- ✅ **Indicateur de plage** : "Affichage de X à Y sur Z"
- ✅ **Sélection adaptée** : Uniquement les éléments de la page courante
- ✅ **Réinitialisation intelligente** : Lors des changements de contexte
- ✅ **Performance** : Affichage limité à 10 éléments

---

**Statut** : ✅ Fonctionnalité complète et opérationnelle
**Date** : 17 avril 2026
**Impact** : Amélioration de la performance et de l'UX pour les grandes équipes
