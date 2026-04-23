# 📊 Résumé : Fonctionnalités pour Dashboard.tsx

## 🎯 12 fonctionnalités recommandées

### 🔥 Priorité HAUTE (À implémenter en premier)

#### 1. ⚠️ **Alertes en temps réel**
- Stock faible / Rupture de stock
- Tables occupées longtemps (>45min)
- Commandes en attente
- Nouvelles commandes

**Impact :** Réactivité immédiate aux problèmes

---

#### 2. 🍽️ **Top 5 des plats**
- Plats les plus vendus du jour
- Nombre de commandes par plat
- CA généré par plat
- Badges visuels

**Impact :** Optimisation du menu

---

#### 3. 💰 **Panier moyen (KPI)**
- Montant moyen par commande
- Évolution vs hier/semaine
- Indicateur de performance

**Impact :** Suivi de la rentabilité

---

#### 4. 📱 **Actions rapides**
- Nouvelle commande
- Ajouter un plat
- Ajouter une table
- Exporter rapport

**Impact :** Gain de temps

---

#### 5. 🔔 **Fil d'activité récente**
- Nouvelles commandes
- Commandes servies
- Nouveaux clients
- Modifications menu
- Alertes stock

**Impact :** Vue d'ensemble en temps réel

---

### ⚡ Priorité MOYENNE

#### 6. 📈 **Graphique CA (7 jours)**
- Courbe d'évolution du CA
- Comparaison semaine précédente
- Identification des tendances

**Impact :** Analyse des performances

---

#### 7. 🎯 **Objectifs du jour**
- Objectif CA
- Objectif nombre de commandes
- Barre de progression
- Estimation d'atteinte

**Impact :** Motivation de l'équipe

---

#### 8. 📅 **Comparaison temporelle**
- vs Hier
- vs Semaine dernière
- vs Mois dernier
- Tous les KPI comparés

**Impact :** Contexte historique

---

#### 9. 💳 **Moyens de paiement**
- Répartition CB / Espèces / Mobile
- Montants par méthode
- Pourcentages

**Impact :** Analyse financière

---

#### 10. 📊 **Taux d'occupation des tables**
- % de tables occupées
- Durée moyenne d'occupation
- Optimisation du plan de salle

**Impact :** Optimisation de l'espace

---

### 🌟 Priorité BASSE (Nice to have)

#### 11. 🌡️ **État du service (Score global)**
- Score de performance (0-100)
- Rapidité, Précision, Satisfaction
- Indicateur visuel

**Impact :** Vue d'ensemble qualitative

---

#### 12. 👥 **Équipe en service**
- Personnel actif
- Commandes gérées par personne
- Statut (En ligne/Pause)

**Impact :** Gestion du personnel

---

## 📊 Nouveaux KPI à ajouter

### KPI supplémentaires recommandés
```typescript
// Panier moyen
value: "27.50€"
change: "+12.3%"

// Taux d'occupation
value: "68%"
change: "+5.2%"

// Satisfaction client
value: "4.7/5"
change: "+0.2"

// Commandes en cours
value: "12"
change: "-3"
```

---

## 🔌 Endpoints backend nécessaires

### À créer dans le backend

```typescript
// 1. Top des plats
GET /menus/items/top-sellers?restaurantId=xxx&limit=5&period=today

// 2. Alertes
GET /dashboard/alerts?restaurantId=xxx

// 3. Activité récente
GET /dashboard/activity?restaurantId=xxx&limit=10

// 4. Graphique CA
GET /dashboard/revenue-chart?restaurantId=xxx&period=7days

// 5. Stats complètes
GET /dashboard/stats?restaurantId=xxx&period=today

// 6. Moyens de paiement
GET /dashboard/payment-methods?restaurantId=xxx&period=today
```

---

## 🎨 Layout recommandé

```
┌─────────────────────────────────────────────────────┐
│  KPI 1    │  KPI 2    │  KPI 3    │  KPI 4         │
│  CA       │  Commandes│  Clients  │  Temps prépa   │
├─────────────────────────────────────────────────────┤
│  KPI 5    │  KPI 6    │  KPI 7    │  KPI 8         │
│  Panier   │  Taux occ │  Satisf.  │  En cours      │
├─────────────────────────────────────────────────────┤
│                          │                          │
│  Graphique CA (7j)       │  Alertes                 │
│                          │  ⚠️ Stock faible         │
│                          │  ⚠️ Table longue         │
├──────────────────────────┤                          │
│                          │  Objectifs               │
│  Commandes récentes      │  ━━━━━━━━ 62%           │
│  #1042 | Table 02        │                          │
│  #1043 | Table 07        │  Activité récente        │
│  #1044 | Table 11        │  🛒 Nouvelle cmd         │
│                          │  ✅ Cmd servie           │
├──────────────────────────┤                          │
│                          │  Actions rapides         │
│  Top 5 des plats         │  [+] Nouvelle cmd        │
│  1. Burger Vegan (12)    │  [+] Ajouter plat        │
│  2. Salade César (8)     │  [📥] Export             │
│                          │                          │
├─────────────────────────────────────────────────────┤
│  Plan de salle  │  Moyens paiement │  État service │
│  [Tables grid]  │  💳 CB: 71%      │  Score: 92    │
│                 │  💵 Esp: 22%     │  Excellent    │
└─────────────────────────────────────────────────────┘
```

---

## 📦 Librairies à installer

```bash
# Pour les graphiques
npm install recharts

# Pour les animations (optionnel)
npm install framer-motion

# Pour les dates
npm install date-fns
```

---

## 🚀 Plan d'implémentation

### Phase 1 : Quick Wins (1-2 jours)
1. ✅ Ajouter 4 nouveaux KPI cards
2. ✅ Widget Alertes en temps réel
3. ✅ Widget Top 5 des plats
4. ✅ Widget Actions rapides

### Phase 2 : Graphiques (2-3 jours)
5. ✅ Graphique CA (7 jours)
6. ✅ Widget Objectifs du jour
7. ✅ Widget Activité récente

### Phase 3 : Analytics (2-3 jours)
8. ✅ Widget Comparaison temporelle
9. ✅ Widget Moyens de paiement
10. ✅ Amélioration du plan de salle

### Phase 4 : Avancé (optionnel)
11. ✅ Widget État du service
12. ✅ Widget Équipe en service

---

## 💡 Exemples de données

### Alertes
```json
[
  {
    "type": "stock",
    "severity": "high",
    "title": "Stock faible",
    "message": "Burger Vegan - 2 restants",
    "itemId": "xxx"
  },
  {
    "type": "table",
    "severity": "medium",
    "title": "Table occupée longtemps",
    "message": "Table 05 - 1h20",
    "tableId": "xxx"
  }
]
```

### Top plats
```json
[
  {
    "id": "xxx",
    "name": "Burger Vegan",
    "ordersCount": 12,
    "revenue": 174,
    "categoryName": "Plats"
  }
]
```

### Activité
```json
[
  {
    "type": "order",
    "icon": "🛒",
    "text": "Nouvelle commande #1045 - Table 08",
    "timeAgo": "2 min"
  }
]
```

---

## ✨ Résultat attendu

Un Dashboard **complet et actionnable** qui permet de :
- ✅ Voir les performances en temps réel
- ✅ Identifier les problèmes rapidement
- ✅ Prendre des décisions éclairées
- ✅ Optimiser les opérations
- ✅ Motiver l'équipe avec des objectifs
- ✅ Analyser les tendances

**Temps d'implémentation estimé :** 6-10 jours pour toutes les fonctionnalités

**Documentation complète :** Voir `qr-order-owner/DASHBOARD_FEATURES_IDEAS.md`
