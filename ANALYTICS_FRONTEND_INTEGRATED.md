# ✅ Frontend Analytics - INTÉGRÉ AVEC L'API

## 🎯 Objectif
Remplacer les données mockées de la page Analytics.tsx par les vraies données provenant de l'API backend.

---

## 📋 Ce qui a été fait

### 1. Remplacement complet du fichier Analytics.tsx

✅ **Supprimé** : Toutes les données mockées (`mockOrders`)
✅ **Supprimé** : Tous les calculs côté frontend (useMemo)
✅ **Ajouté** : Appel API vers `/analytics/:restaurantId`
✅ **Ajouté** : Gestion des états de chargement et d'erreur
✅ **Ajouté** : Rechargement automatique lors du changement de filtres

---

## 🔄 Changements principaux

### Avant (Données mockées)
```typescript
const mockOrders: MockOrder[] = [
  { id: '1', date: '2026-04-13T10:10:00', amount: 28, ... },
  // ... plus de données mockées
];

const filteredOrders = useMemo(() => {
  // Filtrage côté frontend
}, [period, statusFilter, categoryFilter]);

const kpis = useMemo(() => {
  // Calculs côté frontend
}, [filteredOrders]);
```

### Après (API backend)
```typescript
const [data, setData] = useState<AnalyticsData | null>(null);

const loadAnalytics = async () => {
  const response = await api.get(`/analytics/${restaurantId}`, {
    params: {
      period,
      status: statusFilter !== 'ALL' ? statusFilter : undefined,
      category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
    },
  });
  setData(response.data);
};

useEffect(() => {
  void loadAnalytics();
}, [period, statusFilter, categoryFilter]);
```

---

## 🎨 Interface utilisateur

### États gérés

1. **Chargement** (`isLoading`)
   - Affiche des cartes de chargement avec gradient
   - Disparaît une fois les données chargées

2. **Erreur** (`error`)
   - Affiche un message d'erreur clair
   - Bouton "Réessayer" pour recharger

3. **Aucune donnée** (`data.totalOrders === 0`)
   - Message "Aucune donnée pour les filtres sélectionnés"
   - Suggestion de changer les filtres

4. **Données chargées** (`data`)
   - Affichage de tous les graphiques et KPIs
   - Mise à jour en temps réel

---

## 📊 Données affichées

### KPIs avec tendances
```typescript
<div className="stat-card">
  <div className="stat-card-header">
    <span className="stat-label">CA total</span>
    {trendBadge(data.kpis.revenue.trend)}
  </div>
  <div className="stat-value">
    <Euro size={18} />
    {data.kpis.revenue.value.toFixed(2)}
  </div>
</div>
```

### Graphiques
1. **Diagramme en barres** - CA par catégorie
2. **Diagramme en cercle** - Répartition par statut
3. **Courbe** - Évolution du CA horaire

### Tableaux
1. **Top articles** - Les 5 meilleurs
2. **Répartition statuts** - Avec barres de progression
3. **Performance catégories** - Commandes, CA, Marge
4. **Analyse tables** - Commandes, CA, Rotation
5. **Annulations** - Total, taux, raisons
6. **Prévisions** - Fin de journée et semaine
7. **Cohortes clients** - Nouveaux vs Récurrents

---

## 🔧 Filtres disponibles

### 1. Période
- **Aujourd'hui** : Données du jour
- **7 jours** : 7 derniers jours
- **30 jours** : 30 derniers jours
- **Custom** : Dates personnalisées (startDate + endDate)

### 2. Statut
- Tous statuts
- Terminées (COMPLETED)
- Annulées (CANCELLED)
- En préparation (PREPARING)
- En attente (PENDING)
- Prêtes (READY)

### 3. Catégorie
- Champ de texte libre
- Filtre par nom de catégorie

### 4. Canal
- Tous canaux
- Sur place (SUR_PLACE)
- A emporter (A_EMPORTER)
- Livraison (LIVRAISON)

---

## 🔄 Rechargement automatique

Les données sont rechargées automatiquement lorsque :
- ✅ La période change
- ✅ Les dates personnalisées changent
- ✅ Le filtre de statut change
- ✅ Le filtre de catégorie change
- ✅ Le filtre de canal change
- ✅ Le restaurant change

```typescript
useEffect(() => {
  void loadAnalytics();
}, [period, customStart, customEnd, statusFilter, categoryFilter, channelFilter, user?.restaurant?.id]);
```

---

## 📥 Export CSV

La fonction d'export CSV a été simplifiée :

```typescript
const exportCsv = () => {
  if (!data) return;
  
  const headers = ['Métrique', 'Valeur'];
  const rows = [
    ['CA total', data.kpis.revenue.value.toFixed(2)],
    ['Commandes', data.kpis.orders.value.toString()],
    ['Panier moyen', data.kpis.avgTicket.value.toFixed(2)],
    ['Clients uniques', data.kpis.uniqueClients.value.toString()],
  ];
  
  // Génération et téléchargement du CSV
};
```

---

## 🎯 Type TypeScript

```typescript
type AnalyticsData = {
  period: {
    start: string;
    end: string;
  };
  kpis: {
    revenue: { value: number; trend: number };
    orders: { value: number; trend: number };
    avgTicket: { value: number; trend: number };
    uniqueClients: { value: number; trend: number };
  };
  topItems: Array<{ name: string; orders: number; revenue: number }>;
  statusSplit: Record<OrderStatus, number>;
  hourlyData: Array<{ hour: string; orders: number; amount: number }>;
  categoryPerformance: Array<{ category: string; orders: number; revenue: number; margin: number }>;
  tablePerformance: Array<{ table: string; orders: number; revenue: number; rotation: number }>;
  cancellations: {
    total: number;
    rate: number;
    byReason: Record<string, number>;
  };
  forecast: {
    endDayProjection: number;
    endWeekProjection: number;
  };
  cohorts: {
    newCount: number;
    returningCount: number;
  };
  totalOrders: number;
};
```

---

## ✨ Améliorations apportées

### 1. Performance
- ✅ Calculs déportés sur le backend
- ✅ Pas de calculs lourds côté frontend
- ✅ Données pré-calculées et optimisées

### 2. Maintenabilité
- ✅ Code plus simple et lisible
- ✅ Moins de logique métier côté frontend
- ✅ Séparation des responsabilités

### 3. Fiabilité
- ✅ Données provenant de la vraie base de données
- ✅ Gestion des erreurs
- ✅ États de chargement clairs

### 4. Expérience utilisateur
- ✅ Chargement fluide avec skeleton
- ✅ Messages d'erreur clairs
- ✅ Rechargement automatique
- ✅ Filtres réactifs

---

## 🧪 Pour tester

### 1. Démarrer le backend
```bash
cd qr-order-api
npm run start:dev
```

### 2. Démarrer le frontend
```bash
cd qr-order-owner
npm run dev
```

### 3. Accéder à la page Analytics
```
http://localhost:5173/analytics
```

### 4. Tester les fonctionnalités

**Test 1 : Chargement initial**
- ✅ Les données doivent se charger automatiquement
- ✅ Les KPIs doivent s'afficher avec les tendances
- ✅ Les graphiques doivent être remplis

**Test 2 : Changement de période**
- Cliquer sur "Aujourd'hui"
- ✅ Les données doivent se recharger
- ✅ Les graphiques doivent se mettre à jour

**Test 3 : Filtres**
- Sélectionner "Terminées" dans le filtre de statut
- ✅ Les données doivent se filtrer
- ✅ Les KPIs doivent changer

**Test 4 : Période personnalisée**
- Cliquer sur "Custom"
- Sélectionner des dates
- ✅ Les données doivent correspondre à la période

**Test 5 : Export CSV**
- Cliquer sur "Export CSV"
- ✅ Un fichier CSV doit être téléchargé

**Test 6 : Widgets**
- Cliquer sur "Masquer statusSplit"
- ✅ Le widget doit disparaître
- Cliquer sur "Afficher statusSplit"
- ✅ Le widget doit réapparaître

---

## 🔍 Gestion des erreurs

### Erreur de connexion
```typescript
if (error) {
  return (
    <Layout title="Analytiques" subtitle="Erreur de chargement">
      <div className="empty-state">
        <BarChart3 size={28} />
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => void loadAnalytics()}>
          Réessayer
        </button>
      </div>
    </Layout>
  );
}
```

### Aucune donnée
```typescript
if (!data || data.totalOrders === 0) {
  return (
    <Layout title="Analytiques" subtitle="Aucune donnée pour les filtres sélectionnés.">
      <div className="empty-state">
        <BarChart3 size={28} />
        <p>Essayez une autre période ou retirez certains filtres.</p>
      </div>
    </Layout>
  );
}
```

---

## 📝 Notes techniques

### Dates par défaut
```typescript
const [customStart, setCustomStart] = useState(() => {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return date.toISOString().split('T')[0];
});

const [customEnd, setCustomEnd] = useState(() => {
  return new Date().toISOString().split('T')[0];
});
```

### Paramètres conditionnels
```typescript
const params: any = { period };

if (period === 'CUSTOM') {
  params.startDate = customStart;
  params.endDate = customEnd;
}

if (statusFilter !== 'ALL') {
  params.status = statusFilter;
}
```

### Gestion des tableaux vides
```typescript
{data.topItems.length > 0 ? (
  data.topItems.map((item) => (
    <tr key={item.name}>
      <td>{item.name}</td>
      <td>{item.orders}</td>
      <td>{item.revenue.toFixed(2)} EUR</td>
    </tr>
  ))
) : (
  <tr>
    <td colSpan={3} style={{ textAlign: 'center' }}>
      Aucun article
    </td>
  </tr>
)}
```

---

## 🎉 Résultat final

La page Analytics est maintenant **100% connectée à l'API backend** :

1. ✅ Données réelles de la base de données
2. ✅ Calculs effectués côté backend
3. ✅ Filtrage dynamique
4. ✅ Rechargement automatique
5. ✅ Gestion des erreurs
6. ✅ États de chargement
7. ✅ Export CSV
8. ✅ Widgets masquables
9. ✅ Graphiques interactifs
10. ✅ KPIs avec tendances

**L'intégration est complète et opérationnelle ! 🚀**
