# Guide de Débogage: Onglet Personnalisation QR

## Étape 1: Ouvrir la Console du Navigateur

1. Appuyez sur **F12** (ou Ctrl+Shift+I sur Windows, Cmd+Option+I sur Mac)
2. Allez dans l'onglet **Console**
3. Cliquez sur l'onglet "Personnalisation QR" dans votre application
4. Observez les messages dans la console

## Étape 2: Analyser les Messages de Debug

Vous devriez voir ces messages dans l'ordre:

```
✅ QrCustomizer module loaded
🔍 TablesAndQr: activeTab = qr-custom
🔍 TablesAndQr: Rendering QrCustomizer
🔍 QrCustomizer: Component rendering
🔍 QrCustomizer: user = {name: "...", restaurant: {...}}
🔍 QrCustomizer: restaurantId = "..."
🔍 QrCustomizer: tables = X loading = false/true
🔍 QrCustomizer: useEffect triggered, restaurantId = "..."
🔍 QrCustomizer: Before render, tablesLoading = false/true
🔍 QrCustomizer: Rendering main content
```

## Étape 3: Identifier le Problème

### Cas 1: Aucun message n'apparaît
**Problème**: Le module ne se charge pas du tout
**Solutions**:
- Vérifier que le fichier `QrCustomizer.tsx` existe
- Vérifier qu'il n'y a pas d'erreur de syntaxe
- Redémarrer le serveur de développement

### Cas 2: "Component rendering" n'apparaît pas
**Problème**: Le composant n'est pas appelé
**Solutions**:
- Vérifier que `activeTab === 'qr-custom'`
- Vérifier le routing dans `TablesAndQr.tsx`
- Vérifier que le bouton de l'onglet fonctionne

### Cas 3: "Showing loading spinner" apparaît et reste bloqué
**Problème**: `tablesLoading` reste à `true`
**Solutions**:
- Vérifier que `restaurantId` n'est pas vide
- Vérifier que l'API `/tables` répond correctement
- Vérifier le hook `useTables`

### Cas 4: Erreur JavaScript
**Problème**: Une erreur empêche le rendu
**Solutions**:
- Lire le message d'erreur complet
- Vérifier la ligne et le fichier mentionnés
- Corriger l'erreur

### Cas 5: "Rendering main content" apparaît mais rien ne s'affiche
**Problème**: CSS non chargé ou élément masqué
**Solutions**:
- Vérifier que `TablesAndQr.css` est importé
- Vérifier dans l'inspecteur (F12 > Elements) si l'élément existe dans le DOM
- Vérifier les styles CSS appliqués

## Étape 4: Vérifications Supplémentaires

### Vérifier le DOM
1. Ouvrir l'inspecteur (F12 > Elements)
2. Chercher `qr-customizer-container` dans le DOM
3. Si trouvé: problème CSS
4. Si non trouvé: problème de rendu React

### Vérifier le CSS
1. Dans l'inspecteur, sélectionner `.qr-customizer-container`
2. Vérifier les styles appliqués
3. Vérifier que `display` n'est pas `none`
4. Vérifier que `visibility` n'est pas `hidden`

### Vérifier les Erreurs React
1. Chercher des erreurs rouges dans la console
2. Chercher des warnings jaunes
3. Vérifier les erreurs de hooks (useEffect, useState)

## Étape 5: Solutions Rapides

### Solution 1: Redémarrer le Serveur
```bash
# Arrêter le serveur (Ctrl+C)
npm run dev
```

### Solution 2: Nettoyer le Cache
```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules
npm install
npm run dev
```

### Solution 3: Vérifier les Imports
Ouvrir `TablesAndQr.tsx` et vérifier:
```tsx
import '../styles/TablesAndQr.css'; // ✅ Doit être présent
```

### Solution 4: Version Minimale de Test
Remplacer temporairement le contenu de `QrCustomizer.tsx` par:

```tsx
import React from 'react';

const QrCustomizer: React.FC = () => {
  return (
    <div style={{ 
      padding: '40px', 
      background: 'white', 
      borderRadius: '8px',
      margin: '20px'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>
        ✅ QR Customizer Fonctionne!
      </h1>
      <p style={{ color: '#666' }}>
        Si vous voyez ce message, le composant se charge correctement.
        Le problème vient probablement d'un des sous-composants ou hooks.
      </p>
    </div>
  );
};

export default QrCustomizer;
```

Si cette version s'affiche, le problème vient d'un des sous-composants ou hooks.

## Étape 6: Rapporter le Problème

Si aucune solution ne fonctionne, fournir ces informations:

1. **Messages de la console** (copier-coller tous les messages)
2. **Erreurs affichées** (copier-coller le message d'erreur complet)
3. **Valeur de `activeTab`** (visible dans les logs)
4. **Valeur de `restaurantId`** (visible dans les logs)
5. **Valeur de `tablesLoading`** (visible dans les logs)
6. **Capture d'écran** de la console et de la page

## Messages d'Erreur Courants

### "Cannot read property 'id' of undefined"
**Cause**: `user` ou `user.restaurant` est undefined
**Solution**: Vérifier que l'utilisateur est bien connecté

### "loadTables is not a function"
**Cause**: Hook `useTables` mal importé
**Solution**: Vérifier l'import de `useTables`

### "QrTemplates is not defined"
**Cause**: Import manquant
**Solution**: Vérifier `import QrTemplates from './QrTemplates'`

### "Cannot find module './QrTemplates'"
**Cause**: Fichier manquant
**Solution**: Vérifier que `QrTemplates.tsx` existe

## Prochaines Étapes

Une fois le problème identifié et résolu:
1. Supprimer les `console.log` de debug
2. Tester toutes les fonctionnalités
3. Vérifier que les templates s'affichent
4. Tester la sélection de templates
5. Tester le mode custom
