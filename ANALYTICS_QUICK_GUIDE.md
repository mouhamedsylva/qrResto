# 📊 Guide rapide : Backend Analytics

## ✅ Implémentation terminée

Le module Analytics backend est maintenant opérationnel et fournit toutes les données pour les graphiques.

---

## 🚀 Endpoint principal

```
GET /analytics/:restaurantId
```

### Paramètres (tous optionnels)
- `period` : TODAY | LAST_7 | LAST_30 | CUSTOM
- `startDate` : YYYY-MM-DD (si CUSTOM)
- `endDate` : YYYY-MM-DD (si CUSTOM)
- `status` : COMPLETED | CANCELLED | PREPARING | PENDING | READY
- `category` : Nom de catégorie
- `channel` : SUR_PLACE | A_EMPORTER | LIVRAISON

---

## 📊 Données retournées

### KPIs avec tendances
```json
{
  "revenue": { "value": 350.50, "trend": 15.3 },
  "orders": { "value": 12, "trend": 20.0 },
  "avgTicket": { "value": 29.21, "trend": -4.2 },
  "uniqueClients": { "value": 8, "trend": 33.3 }
}
```

### Top 5 articles
```json
[
  { "name": "Burger Signature", "orders": 5, "revenue": 140.00 },
  { "name": "Pizza Truffe", "orders": 3, "revenue": 149.00 }
]
```

### Répartition par statut
```json
{
  "COMPLETED": 8,
  "CANCELLED": 2,
  "PREPARING": 1,
  "PENDING": 1,
  "READY": 0
}
```

### Données horaires (10h-21h)
```json
[
  { "hour": "10h", "orders": 1, "amount": 28.00 },
  { "hour": "11h", "orders": 2, "amount": 54.00 }
]
```

### Performance par catégorie
```json
[
  { "category": "Burgers", "orders": 5, "revenue": 140.00, "margin": 62 },
  { "category": "Pizzas", "orders": 3, "revenue": 149.00, "margin": 62 }
]
```

### Top 5 tables
```json
[
  { "table": "T-01", "orders": 3, "revenue": 85.00, "rotation": 2 },
  { "table": "T-03", "orders": 2, "revenue": 75.00, "rotation": 1 }
]
```

### Annulations
```json
{
  "total": 2,
  "rate": 16.7,
  "byReason": {
    "Client annule": 1,
    "Rupture stock": 1,
    "Delai long": 0
  }
}
```

### Prévisions
```json
{
  "endDayProjection": 515.44,
  "endWeekProjection": 3608.08
}
```

### Cohortes clients
```json
{
  "newCount": 3,
  "returningCount": 5
}
```

---

## 🧪 Tester l'API

### Exemple 1 : 7 derniers jours
```bash
GET http://localhost:3000/analytics/restaurant-uuid?period=LAST_7
```

### Exemple 2 : Aujourd'hui, commandes terminées
```bash
GET http://localhost:3000/analytics/restaurant-uuid?period=TODAY&status=COMPLETED
```

### Exemple 3 : Période personnalisée, catégorie Burgers
```bash
GET http://localhost:3000/analytics/restaurant-uuid?period=CUSTOM&startDate=2026-04-01&endDate=2026-04-15&category=Burgers
```

---

## 💻 Intégration Frontend

```typescript
// Dans Analytics.tsx
const loadAnalytics = async () => {
  const response = await api.get(`/analytics/${restaurantId}`, {
    params: {
      period: 'LAST_7',
      status: statusFilter === 'ALL' ? undefined : statusFilter,
      category: categoryFilter === 'ALL' ? undefined : categoryFilter,
    },
  });
  
  const data = response.data;
  setKpis(data.kpis);
  setTopItems(data.topItems);
  // ... etc
};
```

---

## ✨ Fonctionnalités

- ✅ KPIs avec tendances (comparaison période précédente)
- ✅ Top 5 articles les plus vendus
- ✅ Répartition par statut
- ✅ Évolution horaire (10h-21h)
- ✅ Performance par catégorie
- ✅ Performance des tables
- ✅ Analyse des annulations
- ✅ Prévisions fin de journée/semaine
- ✅ Cohortes clients (nouveaux/récurrents)
- ✅ Filtrage multiple (période, statut, catégorie, canal)

---

## 🎉 Prêt à utiliser !

Le backend est compilé et prêt. Démarrez le serveur :

```bash
cd qr-order-api
npm run start:dev
```

Puis testez l'endpoint avec Postman ou intégrez-le dans le frontend.
