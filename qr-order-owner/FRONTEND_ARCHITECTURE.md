# 🏗️ Architecture Frontend - TablesAndQr Modulaire

## 📁 Structure des fichiers recommandée

```
src/
├── pages/
│   └── TablesAndQr.tsx                    // Page principale (navigation uniquement)
│
├── components/
│   └── tables/
│       ├── TablesGrid.tsx                 // Grille des tables
│       ├── TableCard.tsx                  // Carte individuelle de table
│       ├── TableForm.tsx                  // Formulaire création table
│       ├── BulkActions.tsx                // Actions en masse
│       │
│       ├── reservations/
│       │   ├── ReservationsList.tsx       // Liste des réservations
│       │   ├── ReservationCard.tsx        // Carte de réservation
│       │   ├── ReservationForm.tsx        // Formulaire réservation
│       │   └── ReservationModal.tsx       // Modal création/édition
│       │
│       ├── qr/
│       │   ├── QrCustomizer.tsx           // Personnalisation QR
│       │   ├── QrPreview.tsx              // Prévisualisation QR
│       │   ├── QrExportPanel.tsx          // Panel d'export
│       │   └── ColorPicker.tsx            // Sélecteur de couleurs
│       │
│       ├── preview/
│       │   ├── MenuPreview.tsx            // Prévisualisation menu client
│       │   └── PhoneMockup.tsx            // Mockup de téléphone
│       │
│       └── print/
│           ├── PrintTemplates.tsx         // Grille de templates
│           ├── TemplateCard.tsx           // Carte de template
│           └── PrintGenerator.tsx         // Générateur de supports
│
├── hooks/
│   ├── useTables.ts                       // Hook pour les tables
│   ├── useReservations.ts                 // Hook pour les réservations
│   └── useQrCustomization.ts              // Hook pour la personnalisation QR
│
├── services/
│   ├── tablesService.ts                   // API calls pour tables
│   ├── reservationsService.ts             // API calls pour réservations
│   └── qrService.ts                       // API calls pour QR
│
└── types/
    ├── table.types.ts                     // Types pour tables
    ├── reservation.types.ts               // Types pour réservations
    └── qr.types.ts                        // Types pour QR
```

---

## 🎯 Principe de séparation

### 1. **Page principale** (TablesAndQr.tsx)
**Responsabilité :** Navigation uniquement
- Gestion des onglets
- Routing entre les vues
- Layout général

```typescript
// TablesAndQr.tsx (simplifié)
const TablesAndQr = () => {
  const [activeTab, setActiveTab] = useState('tables');

  return (
    <Layout>
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      {activeTab === 'tables' && <TablesGrid />}
      {activeTab === 'reservations' && <ReservationsList />}
      {activeTab === 'qr-custom' && <QrCustomizer />}
      {activeTab === 'preview' && <MenuPreview />}
      {activeTab === 'print' && <PrintTemplates />}
    </Layout>
  );
};
```

---

### 2. **Composants métier** (components/tables/*)
**Responsabilité :** Logique et UI spécifiques

#### TablesGrid.tsx
```typescript
// Gestion de la grille de tables
- Affichage des tables
- Recherche
- Sélection multiple
- Appel au hook useTables()
```

#### ReservationsList.tsx
```typescript
// Gestion des réservations
- Affichage de la liste
- Filtres (date, statut)
- Actions (confirmer, annuler)
- Appel au hook useReservations()
```

#### QrCustomizer.tsx
```typescript
// Personnalisation des QR
- Sélecteurs de couleurs
- Upload de logo
- Prévisualisation
- Appel au hook useQrCustomization()
```

---

### 3. **Hooks personnalisés** (hooks/*)
**Responsabilité :** Logique métier et état

#### useTables.ts
```typescript
export const useTables = (restaurantId: string) => {
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);

  const loadTables = async () => { /* ... */ };
  const createTable = async (data) => { /* ... */ };
  const deleteTable = async (id) => { /* ... */ };
  const toggleSelection = (id) => { /* ... */ };
  const selectAll = () => { /* ... */ };

  return {
    tables,
    isLoading,
    selectedTables,
    loadTables,
    createTable,
    deleteTable,
    toggleSelection,
    selectAll,
  };
};
```

#### useReservations.ts
```typescript
export const useReservations = (restaurantId: string) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({ date: '', status: '' });

  const loadReservations = async () => { /* ... */ };
  const createReservation = async (data) => { /* ... */ };
  const confirmReservation = async (id) => { /* ... */ };
  const cancelReservation = async (id) => { /* ... */ };

  return {
    reservations,
    isLoading,
    filters,
    setFilters,
    loadReservations,
    createReservation,
    confirmReservation,
    cancelReservation,
  };
};
```

#### useQrCustomization.ts
```typescript
export const useQrCustomization = () => {
  const [customization, setCustomization] = useState<QrCustomization>({
    foregroundColor: '#000000',
    backgroundColor: '#FFFFFF',
    text: 'Scannez pour commander',
    size: 'medium',
    format: 'png',
  });

  const updateColor = (type, color) => { /* ... */ };
  const uploadLogo = async (file) => { /* ... */ };
  const generateQr = async (tableId) => { /* ... */ };
  const exportBulk = async (tableIds, format) => { /* ... */ };

  return {
    customization,
    updateColor,
    uploadLogo,
    generateQr,
    exportBulk,
  };
};
```

---

### 4. **Services API** (services/*)
**Responsabilité :** Appels API uniquement

#### tablesService.ts
```typescript
export const tablesService = {
  getAll: (restaurantId: string) => 
    api.get(`/tables/restaurant/${restaurantId}`),
  
  create: (restaurantId: string, data: CreateTableDto) =>
    api.post(`/tables/restaurant/${restaurantId}`, data),
  
  delete: (id: string) =>
    api.delete(`/tables/${id}`),
  
  generateQr: (id: string) =>
    api.get(`/tables/${id}/qr`),
  
  bulkExport: (data: BulkExportDto) =>
    api.post('/tables/bulk-qr-export', data),
  
  customQr: (id: string, customization: QrCustomization) =>
    api.post(`/tables/${id}/qr-custom`, customization),
};
```

#### reservationsService.ts
```typescript
export const reservationsService = {
  getAll: (restaurantId: string, date?: string) =>
    api.get(`/reservations?restaurantId=${restaurantId}${date ? `&date=${date}` : ''}`),
  
  create: (data: CreateReservationDto) =>
    api.post('/reservations', data),
  
  update: (id: string, data: UpdateReservationDto) =>
    api.put(`/reservations/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/reservations/${id}`),
  
  confirm: (id: string) =>
    api.put(`/reservations/${id}/confirm`, {}),
  
  cancel: (id: string) =>
    api.put(`/reservations/${id}/cancel`, {}),
  
  markNoShow: (id: string) =>
    api.put(`/reservations/${id}/no-show`, {}),
};
```

---

### 5. **Types** (types/*)
**Responsabilité :** Définitions TypeScript

#### table.types.ts
```typescript
export type Table = {
  id: string;
  number: string;
  shortCode: string;
  isActive: boolean;
};

export type CreateTableDto = {
  number: string;
};

export type BulkExportDto = {
  tableIds: string[];
  format: 'zip-png' | 'zip-svg' | 'pdf-multi' | 'pdf-grid';
  size: 'small' | 'medium' | 'large' | 'xlarge';
  customization?: QrCustomization;
};
```

#### reservation.types.ts
```typescript
export type Reservation = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  partySize: number;
  reservationDate: string;
  reservationTime: string;
  status: ReservationStatus;
  notes?: string;
  table?: { id: string; number: string };
};

export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
}

export type CreateReservationDto = {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  partySize: number;
  reservationDate: string;
  reservationTime: string;
  tableId?: string;
  notes?: string;
  restaurantId: string;
};
```

---

## 🎨 Avantages de cette architecture

### ✅ Séparation des responsabilités
- **Page** : Navigation uniquement
- **Composants** : UI et interactions
- **Hooks** : Logique métier et état
- **Services** : Appels API
- **Types** : Définitions TypeScript

### ✅ Réutilisabilité
- Les composants peuvent être réutilisés ailleurs
- Les hooks peuvent être partagés entre composants
- Les services sont centralisés

### ✅ Testabilité
- Chaque partie peut être testée indépendamment
- Mocking facile des services
- Tests unitaires des hooks

### ✅ Maintenabilité
- Code organisé et facile à naviguer
- Modifications localisées
- Pas de fichier monolithique

### ✅ Scalabilité
- Facile d'ajouter de nouvelles fonctionnalités
- Pas de couplage fort entre les parties
- Code modulaire

---

## 📝 Exemple d'implémentation

### TablesAndQr.tsx (Page principale)
```typescript
import React, { useState } from 'react';
import Layout from '../components/Layout';
import TabNavigation from '../components/tables/TabNavigation';
import TablesGrid from '../components/tables/TablesGrid';
import ReservationsList from '../components/tables/reservations/ReservationsList';
import QrCustomizer from '../components/tables/qr/QrCustomizer';
import MenuPreview from '../components/tables/preview/MenuPreview';
import PrintTemplates from '../components/tables/print/PrintTemplates';

const TablesAndQr: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('tables');

  return (
    <Layout
      title="Tables & QR Codes"
      subtitle="Gestion complète de votre salle et QR codes personnalisés"
    >
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="tab-content">
        {activeTab === 'tables' && <TablesGrid />}
        {activeTab === 'reservations' && <ReservationsList />}
        {activeTab === 'qr-custom' && <QrCustomizer />}
        {activeTab === 'preview' && <MenuPreview />}
        {activeTab === 'print' && <PrintTemplates />}
      </div>
    </Layout>
  );
};

export default TablesAndQr;
```

### TablesGrid.tsx (Composant)
```typescript
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTables } from '../../hooks/useTables';
import TableCard from './TableCard';
import TableForm from './TableForm';
import BulkActions from './BulkActions';
import SearchBar from './SearchBar';

const TablesGrid: React.FC = () => {
  const { user } = useAuth();
  const restaurantId = user?.restaurant?.id || '';
  
  const {
    tables,
    isLoading,
    selectedTables,
    loadTables,
    createTable,
    deleteTable,
    toggleSelection,
    selectAll,
  } = useTables(restaurantId);

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTables();
  }, []);

  const filteredTables = tables.filter(table =>
    table.number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="tables-grid-container">
      <div className="tables-header">
        <h3>Gestion des tables</h3>
        <TableForm onSubmit={createTable} />
      </div>

      <SearchBar value={searchTerm} onChange={setSearchTerm} />

      <div className="tables-grid">
        {filteredTables.map(table => (
          <TableCard
            key={table.id}
            table={table}
            isSelected={selectedTables.includes(table.id)}
            onToggleSelection={toggleSelection}
            onDelete={deleteTable}
          />
        ))}
      </div>

      {selectedTables.length > 0 && (
        <BulkActions
          selectedCount={selectedTables.length}
          selectedTables={selectedTables}
          onClearSelection={() => selectAll()}
        />
      )}
    </div>
  );
};

export default TablesGrid;
```

### useTables.ts (Hook)
```typescript
import { useState, useCallback } from 'react';
import { tablesService } from '../services/tablesService';
import { Table } from '../types/table.types';

export const useTables = (restaurantId: string) => {
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);

  const loadTables = useCallback(async () => {
    if (!restaurantId) return;
    setIsLoading(true);
    try {
      const response = await tablesService.getAll(restaurantId);
      setTables(response.data);
    } catch (error) {
      console.error('Erreur chargement tables', error);
    } finally {
      setIsLoading(false);
    }
  }, [restaurantId]);

  const createTable = useCallback(async (number: string) => {
    if (!restaurantId) return;
    try {
      await tablesService.create(restaurantId, { number });
      await loadTables();
    } catch (error) {
      console.error('Erreur création table', error);
    }
  }, [restaurantId, loadTables]);

  const deleteTable = useCallback(async (id: string) => {
    try {
      await tablesService.delete(id);
      await loadTables();
    } catch (error) {
      console.error('Erreur suppression table', error);
    }
  }, [loadTables]);

  const toggleSelection = useCallback((id: string) => {
    setSelectedTables(prev =>
      prev.includes(id)
        ? prev.filter(tableId => tableId !== id)
        : [...prev, id]
    );
  }, []);

  const selectAll = useCallback(() => {
    if (selectedTables.length === tables.length) {
      setSelectedTables([]);
    } else {
      setSelectedTables(tables.map(t => t.id));
    }
  }, [tables, selectedTables]);

  return {
    tables,
    isLoading,
    selectedTables,
    loadTables,
    createTable,
    deleteTable,
    toggleSelection,
    selectAll,
  };
};
```

---

## 🚀 Plan d'implémentation

### Phase 1 : Structure de base
1. Créer les dossiers (components/tables/*, hooks/, services/, types/)
2. Créer les fichiers de types
3. Créer les services API

### Phase 2 : Hooks
4. Implémenter useTables.ts
5. Implémenter useReservations.ts
6. Implémenter useQrCustomization.ts

### Phase 3 : Composants Tables
7. TablesGrid.tsx
8. TableCard.tsx
9. TableForm.tsx
10. BulkActions.tsx

### Phase 4 : Composants Réservations
11. ReservationsList.tsx
12. ReservationCard.tsx
13. ReservationForm.tsx
14. ReservationModal.tsx

### Phase 5 : Composants QR
15. QrCustomizer.tsx
16. QrPreview.tsx
17. QrExportPanel.tsx
18. ColorPicker.tsx

### Phase 6 : Composants Preview & Print
19. MenuPreview.tsx
20. PhoneMockup.tsx
21. PrintTemplates.tsx
22. TemplateCard.tsx

### Phase 7 : Page principale
23. TablesAndQr.tsx (orchestration)
24. TabNavigation.tsx

---

## ✨ Résultat

Une architecture **modulaire, maintenable et scalable** avec :
- ✅ Séparation claire des responsabilités
- ✅ Code réutilisable
- ✅ Facile à tester
- ✅ Facile à maintenir
- ✅ Facile à étendre

**Chaque composant fait une seule chose et la fait bien !** 🎯
