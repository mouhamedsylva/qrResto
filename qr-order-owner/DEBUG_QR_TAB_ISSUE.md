# Debug: QR Customization Tab Not Displaying

## Problème
L'onglet "Personnalisation QR" ne s'affiche pas du tout.

## Vérifications Effectuées ✅

### 1. Composants
- ✅ `QrCustomizer.tsx` existe et est bien structuré
- ✅ `QrTemplates.tsx` existe avec 9 templates
- ✅ `ColorPicker.tsx` existe
- ✅ `LogoUploader.tsx` existe
- ✅ `QrPreview.tsx` existe
- ✅ `LoadingSpinner.tsx` existe
- ✅ `ErrorMessage.tsx` existe

### 2. Hook
- ✅ `useQrCustomization.ts` existe et est bien implémenté

### 3. CSS
- ✅ Classes CSS existent dans `TablesAndQr.css`:
  - `.qr-customizer-container`
  - `.qr-design-mode-selector`
  - `.qr-templates-container`
  - Et toutes les autres classes nécessaires

### 4. Routing
- ✅ `TablesAndQr.tsx` affiche bien `<QrCustomizer />` quand `activeTab === 'qr-custom'`

## Causes Possibles

### 1. Erreur JavaScript au Runtime
Le composant pourrait crasher silencieusement. Vérifier:
- Console du navigateur (F12)
- Erreurs React dans la console
- Erreurs de hooks (useEffect, useState)

### 2. Problème avec les Hooks
- `useTables` pourrait ne pas retourner les bonnes données
- `useQrCustomization` pourrait avoir un problème
- `useAuth` pourrait retourner undefined

### 3. CSS Non Chargé
- Le fichier `TablesAndQr.css` n'est peut-être pas importé correctement
- Vérifier que l'import existe dans `TablesAndQr.tsx`

### 4. Condition de Rendu
- Le composant pourrait être masqué par une condition
- Vérifier si `tablesLoading` reste bloqué à `true`

## Solutions à Tester

### Solution 1: Ajouter des Logs de Debug
Ajouter des `console.log` dans `QrCustomizer.tsx`:

```tsx
const QrCustomizer: React.FC = () => {
  console.log('🔍 QrCustomizer: Component rendering');
  
  const { user } = useAuth();
  console.log('🔍 QrCustomizer: user =', user);
  
  const restaurantId = user?.restaurant?.id || '';
  console.log('🔍 QrCustomizer: restaurantId =', restaurantId);
  
  const { tables, isLoading: tablesLoading, loadTables } = useTables(restaurantId);
  console.log('🔍 QrCustomizer: tables =', tables, 'loading =', tablesLoading);
  
  // ... reste du code
}
```

### Solution 2: Version Minimale pour Tester
Créer une version ultra-simple pour identifier le problème:

```tsx
const QrCustomizer: React.FC = () => {
  return (
    <div style={{ padding: '20px', background: 'white' }}>
      <h1>QR Customizer - Test</h1>
      <p>Si vous voyez ce texte, le composant se charge correctement.</p>
    </div>
  );
};
```

### Solution 3: Vérifier le Hook useTables
Le hook `useTables` pourrait bloquer le rendu. Vérifier:
- Si `isLoading` reste bloqué à `true`
- Si une erreur est levée dans le hook
- Si `restaurantId` est vide

### Solution 4: Error Boundary
Ajouter un Error Boundary pour capturer les erreurs:

```tsx
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('🚨 Error caught:', error, errorInfo);
  }
  
  render() {
    return this.props.children;
  }
}

// Dans TablesAndQr.tsx
{activeTab === 'qr-custom' && (
  <ErrorBoundary>
    <QrCustomizer />
  </ErrorBoundary>
)}
```

## Actions Immédiates

1. **Ouvrir la console du navigateur** (F12) et vérifier les erreurs
2. **Ajouter des console.log** dans QrCustomizer pour voir où ça bloque
3. **Tester avec une version minimale** du composant
4. **Vérifier que TablesAndQr.css est bien importé** dans TablesAndQr.tsx

## Prochaines Étapes

Une fois le problème identifié:
1. Corriger l'erreur
2. Tester que l'onglet s'affiche
3. Vérifier que les templates s'affichent correctement
4. Tester la sélection de templates
5. Tester le mode custom
