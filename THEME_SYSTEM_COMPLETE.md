# 🎨 Système de Thème Clair/Sombre - Implémentation Complète

## 📋 Vue d'ensemble

Le système de thème clair/sombre a été implémenté avec succès dans l'application QR Order Owner. Il utilise un **Context API React** pour gérer l'état du thème globalement et des **variables CSS** pour appliquer les styles dynamiquement.

---

## 🎯 Fonctionnalités

### ✅ Thème Clair (par défaut)
- Interface lumineuse et claire
- Couleurs existantes conservées
- Optimisé pour une utilisation en journée

### ✅ Thème Sombre (Night Owl)
- Inspiré du thème Night Owl de VS Code
- Couleur dominante : **#ff6b9d** (rose vif)
- Background : **#011627** (bleu nuit profond)
- Surfaces : **#0b2942**, **#1d3b53** (bleus nuit)
- Texte : **#d6deeb** (clair), **#a599e9** (violet), **#637777** (gris-vert)
- Optimisé pour réduire la fatigue oculaire

### ✅ Persistance
- Le thème choisi est sauvegardé dans **localStorage**
- Restauré automatiquement au rechargement de la page

### ✅ Transitions fluides
- Changement de thème avec animation CSS (0.3s ease)
- Transitions sur background, border, color, box-shadow

---

## 📁 Fichiers créés/modifiés

### 1. **ThemeContext.tsx** (nouveau)
**Chemin** : `qr-order-owner/src/context/ThemeContext.tsx`

**Rôle** : Gère l'état global du thème

**Exports** :
- `ThemeProvider` : Composant wrapper pour l'application
- `useTheme()` : Hook personnalisé pour accéder au thème

**API** :
```typescript
interface ThemeContextType {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
}
```

**Fonctionnalités** :
- Récupération du thème depuis localStorage au montage
- Application de l'attribut `data-theme` sur `document.documentElement`
- Sauvegarde automatique dans localStorage à chaque changement

---

### 2. **themes.css** (nouveau)
**Chemin** : `qr-order-owner/src/styles/themes.css`

**Rôle** : Définit les variables CSS pour les deux thèmes

**Structure** :
```css
:root[data-theme="light"] { /* Variables mode clair */ }
:root[data-theme="dark"]  { /* Variables mode sombre */ }
```

**Variables principales** :
- `--primary`, `--primary-hover`, `--primary-faint`
- `--bg`, `--surface-0`, `--surface-1`
- `--text-900`, `--text-600`, `--text-400`
- `--success`, `--warning`, `--danger`, `--info`
- `--border`, `--border-dark`
- `--shadow-*` (xs, sm, md, lg, xl, sidebar, primary)

**Ajustements spécifiques mode sombre** :
- `.topbar`, `.card`, `.form-input`, `.btn-ghost`
- `.stat-card`, `.data-table`, `.search-input`
- `.icon-btn`, `.user-pill`, `.table-cell`
- `.auth-card`, `.menu-hero`
- Scrollbar personnalisée

---

### 3. **Settings.tsx** (modifié)
**Chemin** : `qr-order-owner/src/pages/Settings.tsx`

**Modifications** :
1. Import du hook `useTheme` :
```typescript
import { useTheme } from '../context/ThemeContext';
```

2. Utilisation du hook dans le composant :
```typescript
const { theme, setTheme } = useTheme();
```

3. Suppression de l'état local `theme` (géré par le contexte)

4. Onglet "Thème" connecté au contexte :
   - Clic sur "Mode Clair" → `setTheme('light')`
   - Clic sur "Mode Sombre" → `setTheme('dark')`
   - Affichage visuel avec icônes Sun/Moon
   - Bordure et background adaptés selon le thème actif

---

### 4. **main.tsx** (modifié)
**Chemin** : `qr-order-owner/src/main.tsx`

**Modifications** :
1. Import du `ThemeProvider` :
```typescript
import { ThemeProvider } from './context/ThemeContext'
```

2. Wrapper de l'application :
```typescript
<StrictMode>
  <ThemeProvider>
    <App />
  </ThemeProvider>
</StrictMode>
```

---

### 5. **index.css** (modifié)
**Chemin** : `qr-order-owner/src/index.css`

**Modifications** :
1. Import du fichier `themes.css` :
```css
@import './styles/themes.css';
```

---

## 🎨 Palette de couleurs

### Mode Clair
| Variable | Valeur | Usage |
|----------|--------|-------|
| `--primary` | `#D94A6A` | Couleur principale |
| `--bg` | `#f1f5f9` | Background général |
| `--surface-0` | `#ffffff` | Cartes, surfaces |
| `--text-900` | `#0f172a` | Texte principal |
| `--success` | `#10b981` | Succès |
| `--warning` | `#f59e0b` | Avertissement |
| `--danger` | `#ef4444` | Danger |

### Mode Sombre (Night Owl)
| Variable | Valeur | Usage |
|----------|--------|-------|
| `--primary` | `#ff6b9d` | Couleur principale (plus vive) |
| `--bg` | `#011627` | Background général (bleu nuit) |
| `--surface-0` | `#0b2942` | Cartes, surfaces |
| `--surface-1` | `#1d3b53` | Surfaces secondaires |
| `--text-900` | `#d6deeb` | Texte principal (clair) |
| `--text-600` | `#a599e9` | Texte secondaire (violet) |
| `--text-400` | `#637777` | Texte tertiaire (gris-vert) |
| `--success` | `#22da6e` | Succès (vert vif) |
| `--warning` | `#ffcb8b` | Avertissement (orange doux) |
| `--danger` | `#ef5350` | Danger (rouge doux) |
| `--info` | `#82aaff` | Info (bleu clair) |

---

## 🚀 Utilisation

### Dans un composant React

```typescript
import { useTheme } from '../context/ThemeContext';

function MyComponent() {
  const { theme, setTheme, toggleTheme } = useTheme();

  return (
    <div>
      <p>Thème actuel : {theme}</p>
      <button onClick={() => setTheme('dark')}>Mode Sombre</button>
      <button onClick={() => setTheme('light')}>Mode Clair</button>
      <button onClick={toggleTheme}>Basculer</button>
    </div>
  );
}
```

### Dans les styles CSS

```css
.my-element {
  background: var(--surface-0);
  color: var(--text-900);
  border: 1px solid var(--border);
}

/* Ajustement spécifique mode sombre */
:root[data-theme="dark"] .my-element {
  box-shadow: var(--shadow-lg);
}
```

---

## 🧪 Tests

### Test manuel
1. Ouvrir l'application
2. Aller dans **Paramètres** → Onglet **Thème**
3. Cliquer sur **Mode Sombre**
   - ✅ L'interface passe en mode sombre
   - ✅ Les couleurs changent avec animation fluide
   - ✅ La bordure de la carte "Mode Sombre" devient rose
4. Recharger la page
   - ✅ Le thème sombre est conservé
5. Cliquer sur **Mode Clair**
   - ✅ L'interface repasse en mode clair
6. Naviguer entre les pages
   - ✅ Le thème est appliqué partout

### Vérification localStorage
```javascript
// Dans la console du navigateur
localStorage.getItem('theme') // Devrait retourner 'light' ou 'dark'
```

---

## 📊 Composants affectés

Tous les composants de l'application bénéficient automatiquement du système de thème grâce aux variables CSS :

- ✅ **Layout** (Sidebar, Topbar, Main)
- ✅ **Dashboard** (Stats, Tables, Charts)
- ✅ **Menu** (Hero, Cards, Forms)
- ✅ **Orders** (Metrics, Table, Filters)
- ✅ **Staff** (List, Pagination, Badges)
- ✅ **Settings** (Tabs, Forms, Switches)
- ✅ **Auth** (Login, Register)
- ✅ **Tables** (Occupancy Grid)

---

## 🎯 Avantages

### 1. **Maintenabilité**
- Variables CSS centralisées
- Facile à modifier et étendre
- Pas de duplication de code

### 2. **Performance**
- Changement de thème instantané (CSS uniquement)
- Pas de re-render complet de l'application
- Transitions CSS optimisées

### 3. **Accessibilité**
- Mode sombre réduit la fatigue oculaire
- Contraste optimisé pour les deux thèmes
- Persistance du choix utilisateur

### 4. **Expérience utilisateur**
- Changement fluide avec animations
- Choix sauvegardé automatiquement
- Interface cohérente sur toutes les pages

---

## 🔧 Personnalisation

### Ajouter un nouveau thème

1. **Ajouter les variables dans `themes.css`** :
```css
:root[data-theme="custom"] {
  --primary: #your-color;
  --bg: #your-bg;
  /* ... autres variables */
}
```

2. **Mettre à jour le type dans `ThemeContext.tsx`** :
```typescript
type Theme = 'light' | 'dark' | 'custom';
```

3. **Ajouter l'option dans `Settings.tsx`** :
```typescript
<div onClick={() => setTheme('custom')}>
  {/* Votre carte de thème */}
</div>
```

### Modifier les couleurs du mode sombre

Éditer les variables dans `themes.css` :
```css
:root[data-theme="dark"] {
  --primary: #your-new-color;
  --bg: #your-new-bg;
  /* ... */
}
```

---

## 📝 Notes techniques

### Attribut data-theme
Le thème est appliqué via l'attribut `data-theme` sur `document.documentElement` :
```html
<html data-theme="dark">
```

Cela permet d'utiliser des sélecteurs CSS comme :
```css
:root[data-theme="dark"] .my-class { /* styles */ }
```

### Transitions
Toutes les propriétés liées au thème ont une transition de 0.3s :
```css
* {
  transition: background-color 0.3s ease, 
              border-color 0.3s ease, 
              color 0.3s ease,
              box-shadow 0.3s ease;
}
```

### localStorage
Le thème est sauvegardé sous la clé `'theme'` :
```javascript
localStorage.setItem('theme', 'dark');
localStorage.getItem('theme'); // 'dark'
```

---

## ✅ Checklist d'implémentation

- [x] Créer `ThemeContext.tsx` avec provider et hook
- [x] Créer `themes.css` avec variables pour les deux thèmes
- [x] Importer `themes.css` dans `index.css`
- [x] Wrapper l'app avec `ThemeProvider` dans `main.tsx`
- [x] Intégrer `useTheme()` dans `Settings.tsx`
- [x] Connecter l'onglet Thème au contexte
- [x] Tester le changement de thème
- [x] Vérifier la persistance dans localStorage
- [x] Vérifier les transitions CSS
- [x] Tester sur toutes les pages
- [x] Créer la documentation

---

## 🎉 Résultat

Le système de thème clair/sombre est maintenant **100% fonctionnel** ! Les utilisateurs peuvent :

1. Choisir entre mode clair et mode sombre
2. Voir le changement appliqué instantanément avec animation
3. Conserver leur choix même après rechargement
4. Profiter d'une interface cohérente sur toutes les pages

Le mode sombre utilise un style **Night Owl** élégant avec la couleur dominante du projet (#ff6b9d), offrant une expérience visuelle agréable et réduisant la fatigue oculaire lors d'une utilisation prolongée.

---

## 📚 Ressources

- **Context API React** : https://react.dev/reference/react/useContext
- **CSS Variables** : https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties
- **Night Owl Theme** : https://github.com/sdras/night-owl-vscode-theme
- **localStorage API** : https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

---

**Date de création** : 19 avril 2026  
**Statut** : ✅ Implémentation complète  
**Version** : 1.0.0
