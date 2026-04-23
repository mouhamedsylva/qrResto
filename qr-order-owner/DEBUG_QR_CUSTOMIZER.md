# 🔧 Debug - Onglet Personnalisation QR vide

## ❌ Problème

L'onglet "Personnalisation QR" ne s'affiche pas ou est vide.

## 🔍 Étapes de débogage

### Étape 1 : Vérifier la console du navigateur

1. Ouvrir la console (F12)
2. Aller dans l'onglet "Console"
3. Chercher des erreurs en rouge

**Erreurs possibles** :
- `Cannot read property 'map' of undefined`
- `Module not found`
- `Unexpected token`
- Erreur d'import

### Étape 2 : Vérifier que le composant se charge

Dans la console (F12), taper :
```javascript
console.log('QrCustomizer loaded');
```

### Étape 3 : Vérifier les imports

Ouvrir `qr-order-owner/src/components/tables/qr/QrCustomizer.tsx`

Vérifier que tous les imports sont corrects :
```typescript
import QrTemplates from './QrTemplates';  // ← Doit exister
import ColorPicker from './ColorPicker';  // ← Doit exister
import LogoUploader from './LogoUploader'; // ← Doit exister
import QrPreview from './QrPreview';      // ← Doit exister
```

### Étape 4 : Tester avec une version minimale

Remplacer temporairement le contenu de `QrCustomizer.tsx` par :

```typescript
import React from 'react';

const QrCustomizer: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Test QR Customizer</h2>
      <p>Si vous voyez ce message, le composant se charge correctement.</p>
    </div>
  );
};

export default QrCustomizer;
```

**Si ça s'affiche** → Le problème vient du contenu du composant  
**Si ça ne s'affiche pas** → Le problème vient de l'import ou du routing

---

## 🚀 Solutions Rapides

### Solution 1 : Recharger la page

1. Appuyer sur `Ctrl + Shift + R` (Windows) ou `Cmd + Shift + R` (Mac)
2. Cela force le rechargement sans cache

### Solution 2 : Vider le cache

```javascript
// Dans la console (F12)
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Solution 3 : Redémarrer le serveur de développement

```bash
# Arrêter le serveur (Ctrl + C)
# Puis redémarrer
cd qr-order-owner
npm start
```

### Solution 4 : Vérifier que le CSS est chargé

Dans la console (F12), onglet "Network" :
- Chercher `TablesAndQr.css`
- Vérifier qu'il se charge (statut 200)

---

## 🔧 Vérifications Techniques

### 1. Vérifier le fichier TablesAndQr.tsx

Fichier : `qr-order-owner/src/pages/TablesAndQr.tsx`

Vérifier que l'import est correct :
```typescript
import QrCustomizer from '../components/tables/qr/QrCustomizer';
```

Et que le rendu conditionnel fonctionne :
```typescript
{activeTab === 'qr-custom' && <QrCustomizer />}
```

### 2. Vérifier TabNavigation

Fichier : `qr-order-owner/src/components/tables/TabNavigation.tsx`

Vérifier qu'il y a bien un onglet avec `id="qr-custom"` :
```typescript
{
  id: 'qr-custom',
  label: 'Personnalisation QR',
  icon: Palette
}
```

### 3. Vérifier les dépendances

```bash
cd qr-order-owner
npm install
```

---

## 📝 Checklist de débogage

- [ ] Console ouverte (F12)
- [ ] Pas d'erreurs rouges dans la console
- [ ] Fichier `QrCustomizer.tsx` existe
- [ ] Fichier `QrTemplates.tsx` existe
- [ ] Fichier `TablesAndQr.css` chargé
- [ ] Serveur de développement démarré
- [ ] Page rechargée (Ctrl + Shift + R)
- [ ] Onglet "Personnalisation QR" cliqué

---

## 🎯 Test Rapide

### Test 1 : Version minimale

Créer un fichier `qr-order-owner/src/components/tables/qr/QrCustomizerTest.tsx` :

```typescript
import React from 'react';

const QrCustomizerTest: React.FC = () => {
  return (
    <div style={{
      padding: '40px',
      background: '#f0f0f0',
      borderRadius: '8px',
      margin: '20px'
    }}>
      <h1 style={{ color: '#D94A6A' }}>✅ QR Customizer Test</h1>
      <p>Le composant se charge correctement !</p>
      <button style={{
        padding: '10px 20px',
        background: '#D94A6A',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer'
      }}>
        Test Button
      </button>
    </div>
  );
};

export default QrCustomizerTest;
```

Puis dans `TablesAndQr.tsx`, remplacer temporairement :
```typescript
import QrCustomizerTest from '../components/tables/qr/QrCustomizerTest';

// ...

{activeTab === 'qr-custom' && <QrCustomizerTest />}
```

**Si ça s'affiche** → Le problème vient du composant QrCustomizer original  
**Si ça ne s'affiche pas** → Le problème vient du routing/navigation

---

## 💡 Causes Fréquentes

### 1. Erreur d'import
```typescript
// ❌ Mauvais
import QrTemplates from './QrTemplate';  // Nom incorrect

// ✅ Bon
import QrTemplates from './QrTemplates';
```

### 2. Composant enfant qui crash
Un des composants enfants (QrTemplates, ColorPicker, etc.) a une erreur et fait crasher tout le parent.

**Solution** : Commenter les imports un par un pour identifier le coupable.

### 3. Hook qui retourne undefined
Le hook `useQrCustomization` ou `useTables` retourne undefined.

**Solution** : Vérifier que les hooks sont bien exportés et importés.

### 4. CSS manquant
Le fichier `TablesAndQr.css` n'est pas chargé.

**Solution** : Vérifier l'import dans `TablesAndQr.tsx` :
```typescript
import '../styles/TablesAndQr.css';
```

---

## 🆘 Si rien ne fonctionne

### Option 1 : Utiliser la version simple

Remplacer le contenu de `QrCustomizer.tsx` par une version simple sans templates :

```typescript
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useTables } from '../../../hooks/useTables';
import { useQrCustomization } from '../../../hooks/useQrCustomization';

const QrCustomizer: React.FC = () => {
  const { user } = useAuth();
  const restaurantId = user?.restaurant?.id || '';
  const { tables, loadTables } = useTables(restaurantId);
  const { customization, updateColor, updateText } = useQrCustomization();
  const [selectedTableId, setSelectedTableId] = useState('');

  useEffect(() => {
    if (restaurantId) {
      loadTables();
    }
  }, [restaurantId, loadTables]);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Personnalisation QR Codes</h2>
      
      <div style={{ marginTop: '20px' }}>
        <label>Table :</label>
        <select 
          value={selectedTableId}
          onChange={(e) => setSelectedTableId(e.target.value)}
          style={{ marginLeft: '10px', padding: '5px' }}
        >
          <option value="">Sélectionnez une table</option>
          {tables.map((table) => (
            <option key={table.id} value={table.id}>
              Table {table.number}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: '20px' }}>
        <label>Couleur principale :</label>
        <input
          type="color"
          value={customization.foregroundColor}
          onChange={(e) => updateColor('foreground', e.target.value)}
          style={{ marginLeft: '10px' }}
        />
      </div>

      <div style={{ marginTop: '20px' }}>
        <label>Couleur de fond :</label>
        <input
          type="color"
          value={customization.backgroundColor}
          onChange={(e) => updateColor('background', e.target.value)}
          style={{ marginLeft: '10px' }}
        />
      </div>

      <div style={{ marginTop: '20px' }}>
        <label>Texte :</label>
        <input
          type="text"
          value={customization.text}
          onChange={(e) => updateText(e.target.value)}
          style={{ marginLeft: '10px', padding: '5px' }}
        />
      </div>

      <button 
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          background: '#D94A6A',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        Générer QR Code
      </button>
    </div>
  );
};

export default QrCustomizer;
```

Cette version simple devrait fonctionner à coup sûr.

---

**Date** : 15 avril 2026  
**Statut** : Guide de débogage créé  
**Action** : Suivre les étapes ci-dessus pour identifier le problème
