# 🎯 Fonctionnalités à ajouter au Dashboard.tsx

## 📊 Analyse du Dashboard actuel

### ✅ Fonctionnalités existantes
- 4 KPI cards (CA, Commandes, Clients, Temps prépa)
- Liste des commandes récentes (5 dernières)
- Plan de salle avec état des tables
- Filtres et export (boutons présents)

---

## 🚀 Nouvelles fonctionnalités recommandées

### 1. 📈 **Graphiques de performance**

#### A. Graphique de CA journalier
```typescript
// Courbe d'évolution du CA sur les 7 derniers jours
<div className="card">
  <div className="card-header">
    <span className="card-title">Évolution du CA (7 jours)</span>
  </div>
  <div className="card-body">
    <LineChart data={revenueData} />
  </div>
</div>
```

**Données à afficher :**
- CA par jour (7 derniers jours)
- Comparaison avec la semaine précédente
- Moyenne mobile

#### B. Graphique de distribution des commandes
```typescript
// Répartition des commandes par heure de la journée
<div className="card">
  <div className="card-header">
    <span className="card-title">Affluence par heure</span>
  </div>
  <div className="card-body">
    <BarChart data={ordersByHour} />
  </div>
</div>
```

**Données à afficher :**
- Nombre de commandes par tranche horaire
- Identification des heures de pointe
- Prévisions d'affluence

---

### 2. 🍽️ **Top des plats**

#### Widget "Plats les plus vendus"
```typescript
<div className="card">
  <div className="card-header">
    <span className="card-title">Top 5 des plats</span>
    <span className="text-xs text-lighter">Aujourd'hui</span>
  </div>
  <div className="card-body">
    {topDishes.map((dish, index) => (
      <div key={dish.id} className="top-dish-row">
        <span className="rank">#{index + 1}</span>
        <div className="dish-info">
          <span className="dish-name">{dish.name}</span>
          <span className="dish-category">{dish.categoryName}</span>
        </div>
        <div className="dish-stats">
          <span className="orders-count">{dish.ordersCount} cmd</span>
          <span className="revenue">{dish.revenue}€</span>
        </div>
      </div>
    ))}
  </div>
</div>
```

**Données à afficher :**
- Nom du plat
- Nombre de commandes
- CA généré
- Catégorie
- Badge (Best seller, Nouveau, etc.)

**Endpoint backend à créer :**
```typescript
GET /menus/items/top-sellers?restaurantId=xxx&limit=5&period=today
```

---

### 3. ⚠️ **Alertes et notifications**

#### Widget "Alertes en temps réel"
```typescript
<div className="card alert-card">
  <div className="card-header">
    <span className="card-title">
      Alertes
      {alerts.length > 0 && (
        <span className="badge badge-danger">{alerts.length}</span>
      )}
    </span>
  </div>
  <div className="card-body">
    {alerts.map(alert => (
      <div key={alert.id} className={`alert alert-${alert.type}`}>
        <AlertIcon type={alert.type} />
        <div className="alert-content">
          <span className="alert-title">{alert.title}</span>
          <span className="alert-message">{alert.message}</span>
        </div>
        <button className="alert-action">Voir</button>
      </div>
    ))}
  </div>
</div>
```

**Types d'alertes :**
- 🔴 **Stock faible** : "Burger Vegan - Stock: 2 restants"
- 🔴 **Rupture de stock** : "Salade César - Rupture de stock"
- ⚠️ **Table occupée longtemps** : "Table 05 - Occupée depuis 1h20"
- ⚠️ **Commande en attente** : "3 commandes en attente depuis +15min"
- 🔔 **Nouvelle commande** : "Nouvelle commande #1045 - Table 08"

**Endpoint backend à créer :**
```typescript
GET /dashboard/alerts?restaurantId=xxx
```

---

### 4. 💰 **Objectifs et progression**

#### Widget "Objectifs du jour"
```typescript
<div className="card">
  <div className="card-header">
    <span className="card-title">Objectifs du jour</span>
  </div>
  <div className="card-body">
    <div className="goal-item">
      <div className="goal-header">
        <span className="goal-label">Chiffre d'affaires</span>
        <span className="goal-value">1 250€ / 2 000€</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: '62.5%' }} />
      </div>
      <span className="goal-remaining">750€ restants</span>
    </div>
    
    <div className="goal-item">
      <div className="goal-header">
        <span className="goal-label">Commandes</span>
        <span className="goal-value">45 / 80</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: '56.25%' }} />
      </div>
      <span className="goal-remaining">35 commandes restantes</span>
    </div>
  </div>
</div>
```

**Données à afficher :**
- Objectif CA du jour
- Objectif nombre de commandes
- Progression en %
- Estimation d'atteinte (basée sur l'heure actuelle)

---

### 5. 👥 **Activité du personnel**

#### Widget "Équipe en service"
```typescript
<div className="card">
  <div className="card-header">
    <span className="card-title">Équipe en service</span>
    <span className="badge">{staffOnDuty.length} personnes</span>
  </div>
  <div className="card-body">
    {staffOnDuty.map(staff => (
      <div key={staff.id} className="staff-row">
        <div className="staff-avatar">{staff.initials}</div>
        <div className="staff-info">
          <span className="staff-name">{staff.name}</span>
          <span className="staff-role">{staff.role}</span>
        </div>
        <div className="staff-stats">
          <span className="orders-handled">{staff.ordersHandled} cmd</span>
          <span className="status-indicator online" />
        </div>
      </div>
    ))}
  </div>
</div>
```

**Données à afficher :**
- Nom du personnel
- Rôle (Serveur, Cuisinier, Manager)
- Nombre de commandes gérées
- Statut (En ligne, Pause, Hors ligne)

---

### 6. 📅 **Comparaison temporelle**

#### Widget "Comparaison avec hier/semaine dernière"
```typescript
<div className="card">
  <div className="card-header">
    <span className="card-title">Comparaison</span>
    <select className="select-sm">
      <option>vs Hier</option>
      <option>vs Semaine dernière</option>
      <option>vs Mois dernier</option>
    </select>
  </div>
  <div className="card-body">
    <div className="comparison-row">
      <span className="metric-label">Chiffre d'affaires</span>
      <div className="metric-values">
        <span className="current">1 250€</span>
        <span className="previous">1 180€</span>
        <span className="trend positive">+5.9%</span>
      </div>
    </div>
    
    <div className="comparison-row">
      <span className="metric-label">Commandes</span>
      <div className="metric-values">
        <span className="current">45</span>
        <span className="previous">52</span>
        <span className="trend negative">-13.5%</span>
      </div>
    </div>
    
    <div className="comparison-row">
      <span className="metric-label">Panier moyen</span>
      <div className="metric-values">
        <span className="current">27.78€</span>
        <span className="previous">22.69€</span>
        <span className="trend positive">+22.4%</span>
      </div>
    </div>
  </div>
</div>
```

---

### 7. 🎯 **Indicateurs avancés**

#### Nouveaux KPI à ajouter
```typescript
// Panier moyen
<StatsCard
  label="Panier moyen"
  value="27.50€"
  change="+12.3%"
  trend="up"
  icon={<ShoppingCart size={20} />}
  iconColor="#8b5cf6"
  iconBg="rgba(139,92,246,0.12)"
/>

// Taux d'occupation des tables
<StatsCard
  label="Taux d'occupation"
  value="68%"
  change="+5.2%"
  trend="up"
  icon={<Percent size={20} />}
  iconColor="#ec4899"
  iconBg="rgba(236,72,153,0.12)"
/>

// Taux de satisfaction (si avis clients)
<StatsCard
  label="Satisfaction client"
  value="4.7/5"
  change="+0.2"
  trend="up"
  icon={<Star size={20} />}
  iconColor="#f59e0b"
  iconBg="rgba(245,158,11,0.12)"
/>

// Commandes en cours
<StatsCard
  label="Commandes en cours"
  value="12"
  change="-3"
  trend="down"
  icon={<Clock size={20} />}
  iconColor="#06b6d4"
  iconBg="rgba(6,182,212,0.12)"
/>
```

---

### 8. 🔔 **Fil d'activité en temps réel**

#### Widget "Activité récente"
```typescript
<div className="card">
  <div className="card-header">
    <span className="card-title">Activité récente</span>
    <span className="badge badge-live">Live</span>
  </div>
  <div className="card-body activity-feed">
    {activities.map(activity => (
      <div key={activity.id} className="activity-item">
        <div className="activity-icon" style={{ background: activity.color }}>
          {activity.icon}
        </div>
        <div className="activity-content">
          <span className="activity-text">{activity.text}</span>
          <span className="activity-time">{activity.timeAgo}</span>
        </div>
      </div>
    ))}
  </div>
</div>
```

**Exemples d'activités :**
- 🛒 "Nouvelle commande #1045 - Table 08" (il y a 2 min)
- ✅ "Commande #1042 servie - Table 02" (il y a 5 min)
- 👤 "Nouveau client inscrit - Awa S." (il y a 8 min)
- 🍔 "Burger Vegan ajouté au menu" (il y a 15 min)
- ⚠️ "Stock faible - Salade César (3 restants)" (il y a 20 min)

---

### 9. 🌡️ **Météo du service**

#### Widget "État du service"
```typescript
<div className="card service-health">
  <div className="card-header">
    <span className="card-title">État du service</span>
  </div>
  <div className="card-body">
    <div className="health-indicator">
      <div className="health-circle excellent">
        <span className="health-score">92</span>
        <span className="health-label">Excellent</span>
      </div>
    </div>
    
    <div className="health-metrics">
      <div className="health-metric">
        <span className="metric-icon">⚡</span>
        <span className="metric-label">Rapidité</span>
        <div className="metric-bar">
          <div className="metric-fill" style={{ width: '95%' }} />
        </div>
      </div>
      
      <div className="health-metric">
        <span className="metric-icon">🎯</span>
        <span className="metric-label">Précision</span>
        <div className="metric-bar">
          <div className="metric-fill" style={{ width: '88%' }} />
        </div>
      </div>
      
      <div className="health-metric">
        <span className="metric-icon">😊</span>
        <span className="metric-label">Satisfaction</span>
        <div className="metric-bar">
          <div className="metric-fill" style={{ width: '93%' }} />
        </div>
      </div>
    </div>
  </div>
</div>
```

**Calcul du score :**
- Temps de préparation moyen
- Taux d'erreur des commandes
- Satisfaction client
- Taux d'occupation optimal

---

### 10. 📱 **Actions rapides**

#### Widget "Actions rapides"
```typescript
<div className="card">
  <div className="card-header">
    <span className="card-title">Actions rapides</span>
  </div>
  <div className="card-body quick-actions">
    <button className="quick-action-btn" onClick={() => navigate('/orders/new')}>
      <Plus size={20} />
      <span>Nouvelle commande</span>
    </button>
    
    <button className="quick-action-btn" onClick={() => navigate('/menus/items/new')}>
      <Plus size={20} />
      <span>Ajouter un plat</span>
    </button>
    
    <button className="quick-action-btn" onClick={() => navigate('/tables/new')}>
      <Plus size={20} />
      <span>Ajouter une table</span>
    </button>
    
    <button className="quick-action-btn" onClick={handleExportReport}>
      <Download size={20} />
      <span>Exporter rapport</span>
    </button>
  </div>
</div>
```

---

### 11. 💳 **Moyens de paiement**

#### Widget "Répartition des paiements"
```typescript
<div className="card">
  <div className="card-header">
    <span className="card-title">Moyens de paiement</span>
  </div>
  <div className="card-body">
    <div className="payment-method-row">
      <div className="payment-icon">💳</div>
      <span className="payment-label">Carte bancaire</span>
      <div className="payment-stats">
        <span className="payment-count">32 (71%)</span>
        <span className="payment-amount">890€</span>
      </div>
    </div>
    
    <div className="payment-method-row">
      <div className="payment-icon">💵</div>
      <span className="payment-label">Espèces</span>
      <div className="payment-stats">
        <span className="payment-count">10 (22%)</span>
        <span className="payment-amount">280€</span>
      </div>
    </div>
    
    <div className="payment-method-row">
      <div className="payment-icon">📱</div>
      <span className="payment-label">Mobile (Apple/Google Pay)</span>
      <div className="payment-stats">
        <span className="payment-count">3 (7%)</span>
        <span className="payment-amount">80€</span>
      </div>
    </div>
  </div>
</div>
```

---

### 12. 🎂 **Événements spéciaux**

#### Widget "Événements du jour"
```typescript
<div className="card">
  <div className="card-header">
    <span className="card-title">Événements spéciaux</span>
  </div>
  <div className="card-body">
    <div className="event-item">
      <span className="event-icon">🎂</span>
      <div className="event-info">
        <span className="event-title">Anniversaire - Table 05</span>
        <span className="event-detail">Fatou D. - 25 ans</span>
      </div>
      <button className="btn btn-sm btn-primary">Préparer</button>
    </div>
    
    <div className="event-item">
      <span className="event-icon">👥</span>
      <div className="event-info">
        <span className="event-title">Réservation groupe</span>
        <span className="event-detail">12 personnes - 20h00</span>
      </div>
      <button className="btn btn-sm btn-ghost">Voir</button>
    </div>
  </div>
</div>
```

---

## 📊 Layout recommandé pour le Dashboard enrichi

### Structure en grille
```typescript
<Layout>
  {/* Ligne 1 : KPI principaux (4 cards) */}
  <div className="stats-grid">
    <StatsCard /> x4
  </div>

  {/* Ligne 2 : KPI secondaires (4 cards) */}
  <div className="stats-grid">
    <StatsCard /> x4
  </div>

  {/* Ligne 3 : Contenu principal (2 colonnes) */}
  <div className="content-grid-3col">
    {/* Colonne gauche (2/3) */}
    <div className="col-span-2">
      <GraphiqueCA />
      <CommandesRecentes />
      <TopPlats />
    </div>

    {/* Colonne droite (1/3) */}
    <div>
      <Alertes />
      <Objectifs />
      <ActiviteRecente />
      <ActionsRapides />
    </div>
  </div>

  {/* Ligne 4 : Widgets secondaires (3 colonnes) */}
  <div className="content-grid-3col">
    <PlanDeSalle />
    <MoyensPaiement />
    <EtatService />
  </div>
</Layout>
```

---

## 🎨 Améliorations visuelles

### 1. Animations et transitions
```css
/* Animations d'entrée échelonnées */
.anim-in-1 { animation-delay: 0.05s; }
.anim-in-2 { animation-delay: 0.1s; }
.anim-in-3 { animation-delay: 0.15s; }
.anim-in-4 { animation-delay: 0.2s; }

/* Pulse pour les éléments live */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.badge-live {
  animation: pulse 2s infinite;
}
```

### 2. Mode sombre/clair
```typescript
const [theme, setTheme] = useState<'light' | 'dark'>('light');

<button onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}>
  {theme === 'light' ? <Moon /> : <Sun />}
</button>
```

### 3. Filtres temporels
```typescript
const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');

<div className="period-selector">
  <button className={period === 'today' ? 'active' : ''} onClick={() => setPeriod('today')}>
    Aujourd'hui
  </button>
  <button className={period === 'week' ? 'active' : ''} onClick={() => setPeriod('week')}>
    Cette semaine
  </button>
  <button className={period === 'month' ? 'active' : ''} onClick={() => setPeriod('month')}>
    Ce mois
  </button>
</div>
```

---

## 🔌 Endpoints backend à créer

### 1. Dashboard complet
```typescript
GET /dashboard/stats?restaurantId=xxx&period=today
Response: {
  revenue: { value: 1250, trend: 5.9, previous: 1180 },
  orders: { value: 45, trend: -13.5, previous: 52 },
  customers: { value: 38, trend: 8.2, previous: 35 },
  prepTime: { value: 18, trend: -2, previous: 20 },
  avgBasket: { value: 27.78, trend: 22.4, previous: 22.69 },
  occupancyRate: { value: 68, trend: 5.2, previous: 64.6 }
}
```

### 2. Top des plats
```typescript
GET /menus/items/top-sellers?restaurantId=xxx&limit=5&period=today
Response: [
  { id: 'xxx', name: 'Burger Vegan', ordersCount: 12, revenue: 174, categoryName: 'Plats' },
  ...
]
```

### 3. Alertes
```typescript
GET /dashboard/alerts?restaurantId=xxx
Response: [
  { id: 'xxx', type: 'stock', severity: 'high', title: 'Stock faible', message: 'Burger Vegan - 2 restants', itemId: 'xxx' },
  { id: 'xxx', type: 'table', severity: 'medium', title: 'Table occupée longtemps', message: 'Table 05 - 1h20', tableId: 'xxx' },
  ...
]
```

### 4. Activité récente
```typescript
GET /dashboard/activity?restaurantId=xxx&limit=10
Response: [
  { id: 'xxx', type: 'order', icon: '🛒', text: 'Nouvelle commande #1045', timeAgo: '2 min', timestamp: '2026-04-15T14:30:00Z' },
  ...
]
```

### 5. Graphique CA
```typescript
GET /dashboard/revenue-chart?restaurantId=xxx&period=7days
Response: [
  { date: '2026-04-09', revenue: 1180, orders: 52 },
  { date: '2026-04-10', revenue: 1320, orders: 58 },
  ...
]
```

### 6. Moyens de paiement
```typescript
GET /dashboard/payment-methods?restaurantId=xxx&period=today
Response: [
  { method: 'card', count: 32, percentage: 71, amount: 890 },
  { method: 'cash', count: 10, percentage: 22, amount: 280 },
  { method: 'mobile', count: 3, percentage: 7, amount: 80 }
]
```

---

## 🎯 Priorisation des fonctionnalités

### 🔥 Priorité HAUTE (Quick wins)
1. ✅ **Alertes en temps réel** (stock, tables, commandes)
2. ✅ **Top des plats** (facile à implémenter, grande valeur)
3. ✅ **Panier moyen** (KPI simple mais important)
4. ✅ **Actions rapides** (améliore l'UX)
5. ✅ **Activité récente** (engagement utilisateur)

### ⚡ Priorité MOYENNE
6. ✅ **Graphique CA** (nécessite une lib de charts)
7. ✅ **Objectifs du jour** (motivation de l'équipe)
8. ✅ **Comparaison temporelle** (insights précieux)
9. ✅ **Moyens de paiement** (analyse financière)
10. ✅ **Taux d'occupation** (optimisation des tables)

### 🌟 Priorité BASSE (Nice to have)
11. ✅ **État du service** (complexe à calculer)
12. ✅ **Équipe en service** (nécessite gestion du personnel)
13. ✅ **Événements spéciaux** (fonctionnalité avancée)
14. ✅ **Graphique affluence** (analyse avancée)

---

## 📦 Librairies recommandées

### Pour les graphiques
```bash
npm install recharts
# ou
npm install chart.js react-chartjs-2
# ou
npm install @nivo/core @nivo/line @nivo/bar
```

### Pour les animations
```bash
npm install framer-motion
```

### Pour les dates
```bash
npm install date-fns
```

### Pour les icônes supplémentaires
```bash
# Déjà installé : lucide-react
```

---

## ✨ Conclusion

Votre Dashboard peut être transformé en un **centre de contrôle complet** avec ces fonctionnalités. Je recommande de commencer par les **5 priorités hautes** qui apporteront le plus de valeur rapidement.

**Ordre d'implémentation suggéré :**
1. Alertes en temps réel
2. Top des plats
3. Panier moyen (KPI)
4. Actions rapides
5. Activité récente

Ensuite, ajoutez progressivement les graphiques et les widgets avancés selon les besoins de vos utilisateurs.
