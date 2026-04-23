# 🎯 Fonctionnalités à ajouter à TablesAndQr.tsx

## 📊 Analyse de la page actuelle

### ✅ Fonctionnalités existantes
- Liste des tables avec numéros et codes
- Création/Suppression de tables
- Statuts des tables (Libre, Occupée, Réservée, Nettoyage)
- Génération et téléchargement de QR codes
- 4 templates de QR (Classic, Modern, Minimal, Luxury)
- Personnalisation des couleurs (primary/secondary)
- Preview du QR avant téléchargement

---

## 🚀 Nouvelles fonctionnalités recommandées

### 1. 🗺️ **Plan de salle visuel interactif**

#### Éditeur de plan de salle drag & drop
```typescript
<div className="card">
  <div className="card-header">
    <span className="card-title">Plan de salle</span>
    <div className="card-actions">
      <button className="btn btn-ghost btn-sm" onClick={toggleEditMode}>
        {editMode ? 'Terminer' : 'Modifier le plan'}
      </button>
      <button className="btn btn-ghost btn-sm" onClick={saveLayout}>
        Sauvegarder
      </button>
    </div>
  </div>
  <div className="card-body">
    <div className="floor-plan-editor">
      {tables.map(table => (
        <DraggableTable
          key={table.id}
          table={table}
          position={tablePositions[table.id]}
          onDrag={(newPos) => updateTablePosition(table.id, newPos)}
          status={tableStatuses[table.id]}
          onClick={() => selectTable(table.id)}
        />
      ))}
    </div>
  </div>
</div>
```

**Fonctionnalités :**
- Drag & drop des tables sur une grille
- Redimensionnement des tables (2, 4, 6, 8 places)
- Formes différentes (carré, rectangle, rond)
- Rotation des tables
- Zones de salle (Terrasse, Intérieur, VIP, etc.)
- Sauvegarde des positions en base de données

**Endpoint backend à créer :**
```typescript
PUT /tables/:id/position
Body: { x: number, y: number, rotation: number, shape: string, capacity: number }
```

---

### 2. 📊 **Statistiques par table**

#### Widget "Performance des tables"
```typescript
<div className="card">
  <div className="card-header">
    <span className="card-title">Performance des tables</span>
    <select onChange={(e) => setPeriod(e.target.value)}>
      <option value="today">Aujourd'hui</option>
      <option value="week">Cette semaine</option>
      <option value="month">Ce mois</option>
    </select>
  </div>
  <div className="card-body">
    <table className="data-table">
      <thead>
        <tr>
          <th>Table</th>
          <th>Commandes</th>
          <th>CA généré</th>
          <th>Durée moy.</th>
          <th>Taux rotation</th>
        </tr>
      </thead>
      <tbody>
        {tableStats.map(stat => (
          <tr key={stat.tableId}>
            <td><strong>Table {stat.tableNumber}</strong></td>
            <td>{stat.ordersCount}</td>
            <td>{formatCurrency(stat.revenue)}</td>
            <td>{stat.avgDuration} min</td>
            <td>
              <span className={`badge ${stat.rotationRate > 3 ? 'success' : 'warning'}`}>
                {stat.rotationRate}x
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
```

**Données à afficher :**
- Nombre de commandes par table
- CA généré par table
- Durée moyenne d'occupation
- Taux de rotation (nb de services par jour)
- Table la plus rentable
- Table la moins utilisée

**Endpoint backend à créer :**
```typescript
GET /tables/stats?restaurantId=xxx&period=today
```

---

### 3. ⏱️ **Chronomètre d'occupation en temps réel**

#### Suivi du temps d'occupation
```typescript
<td>
  {tableStatuses[table.id] === 'OCCUPIED' && (
    <div className="occupation-timer">
      <Clock size={14} />
      <span className={occupationTime > 45 ? 'text-warning' : ''}>
        {formatDuration(occupationTime)}
      </span>
      {occupationTime > 45 && (
        <span className="badge badge-warning">Longue occupation</span>
      )}
    </div>
  )}
</td>
```

**Fonctionnalités :**
- Démarrage automatique du chrono quand table = Occupée
- Alerte visuelle après 45 minutes
- Notification push après 1 heure
- Historique des durées d'occupation
- Temps moyen par table

**Endpoint backend à créer :**
```typescript
POST /tables/:id/start-occupation
POST /tables/:id/end-occupation
GET /tables/:id/occupation-history
```

---

### 4. 📅 **Système de réservations**

#### Gestion des réservations
```typescript
<div className="card">
  <div className="card-header">
    <span className="card-title">Réservations</span>
    <button className="btn btn-primary btn-sm" onClick={() => setShowReservationModal(true)}>
      <Plus size={14} /> Nouvelle réservation
    </button>
  </div>
  <div className="card-body">
    <div className="reservations-timeline">
      {reservations.map(reservation => (
        <div key={reservation.id} className="reservation-card">
          <div className="reservation-header">
            <span className="reservation-time">{reservation.time}</span>
            <span className="reservation-table">Table {reservation.tableNumber}</span>
          </div>
          <div className="reservation-details">
            <span className="customer-name">{reservation.customerName}</span>
            <span className="party-size">{reservation.partySize} personnes</span>
            {reservation.phone && (
              <span className="phone">{reservation.phone}</span>
            )}
          </div>
          {reservation.notes && (
            <div className="reservation-notes">
              <AlertCircle size={12} />
              {reservation.notes}
            </div>
          )}
          <div className="reservation-actions">
            <button className="btn btn-sm btn-ghost" onClick={() => confirmReservation(reservation.id)}>
              Confirmer
            </button>
            <button className="btn btn-sm btn-ghost" onClick={() => cancelReservation(reservation.id)}>
              Annuler
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>
```

**Fonctionnalités :**
- Créer une réservation (nom, téléphone, nb personnes, heure, table)
- Vue calendrier des réservations
- Confirmation par SMS/Email
- Rappel automatique 2h avant
- Gestion des no-show
- Historique des réservations par client

**Endpoint backend à créer :**
```typescript
POST /reservations
GET /reservations?restaurantId=xxx&date=2026-04-15
PUT /reservations/:id/confirm
PUT /reservations/:id/cancel
```

---

### 5. 🎨 **Personnalisation avancée des QR codes**

#### Éditeur de QR code enrichi
```typescript
<div className="qr-customizer">
  <div className="customizer-section">
    <h4>Logo du restaurant</h4>
    <input type="file" accept="image/*" onChange={handleLogoUpload} />
    <div className="logo-preview">
      {logo && <img src={logo} alt="Logo" />}
    </div>
  </div>

  <div className="customizer-section">
    <h4>Couleurs du QR</h4>
    <div className="color-pickers">
      <label>
        Couleur principale
        <input type="color" value={qrForeground} onChange={(e) => setQrForeground(e.target.value)} />
      </label>
      <label>
        Couleur de fond
        <input type="color" value={qrBackground} onChange={(e) => setQrBackground(e.target.value)} />
      </label>
    </div>
  </div>

  <div className="customizer-section">
    <h4>Texte personnalisé</h4>
    <input
      type="text"
      placeholder="Ex: Scannez pour commander"
      value={qrText}
      onChange={(e) => setQrText(e.target.value)}
    />
  </div>

  <div className="customizer-section">
    <h4>Taille du QR</h4>
    <select value={qrSize} onChange={(e) => setQrSize(e.target.value)}>
      <option value="small">Petit (200x200)</option>
      <option value="medium">Moyen (300x300)</option>
      <option value="large">Grand (500x500)</option>
      <option value="xlarge">Très grand (800x800)</option>
    </select>
  </div>

  <div className="customizer-section">
    <h4>Format d'export</h4>
    <div className="format-buttons">
      <button onClick={() => downloadQr('png')}>PNG</button>
      <button onClick={() => downloadQr('svg')}>SVG</button>
      <button onClick={() => downloadQr('pdf')}>PDF</button>
    </div>
  </div>
</div>
```

**Fonctionnalités :**
- Logo du restaurant au centre du QR
- Couleurs personnalisées (foreground/background)
- Texte personnalisé sous le QR
- Différentes tailles d'export
- Formats multiples (PNG, SVG, PDF)
- Prévisualisation en temps réel

---

### 6. 📦 **Export en masse des QR codes**

#### Téléchargement groupé
```typescript
<div className="card">
  <div className="card-header">
    <span className="card-title">Export en masse</span>
  </div>
  <div className="card-body">
    <div className="bulk-export-options">
      <label>
        <input
          type="checkbox"
          checked={selectAll}
          onChange={handleSelectAll}
        />
        Sélectionner toutes les tables
      </label>

      <div className="table-selection">
        {tables.map(table => (
          <label key={table.id}>
            <input
              type="checkbox"
              checked={selectedTables.includes(table.id)}
              onChange={() => toggleTableSelection(table.id)}
            />
            Table {table.number}
          </label>
        ))}
      </div>

      <div className="export-format">
        <h4>Format d'export</h4>
        <select value={bulkFormat} onChange={(e) => setBulkFormat(e.target.value)}>
          <option value="zip-png">ZIP de PNG</option>
          <option value="zip-svg">ZIP de SVG</option>
          <option value="pdf-multi">PDF multi-pages</option>
          <option value="pdf-grid">PDF grille (4x4)</option>
        </select>
      </div>

      <button
        className="btn btn-primary"
        onClick={handleBulkExport}
        disabled={selectedTables.length === 0}
      >
        <Download size={14} />
        Télécharger {selectedTables.length} QR codes
      </button>
    </div>
  </div>
</div>
```

**Fonctionnalités :**
- Sélection multiple de tables
- Export en ZIP (tous les QR en PNG/SVG)
- Export en PDF multi-pages (1 QR par page)
- Export en PDF grille (4x4 QR par page pour impression)
- Nommage automatique des fichiers

**Endpoint backend à créer :**
```typescript
POST /tables/bulk-qr-export
Body: { tableIds: string[], format: string, size: string }
Response: { downloadUrl: string }
```

---

### 7. 🏷️ **Étiquettes et catégories de tables**

#### Organisation par zones
```typescript
<div className="card">
  <div className="card-header">
    <span className="card-title">Zones de salle</span>
    <button className="btn btn-primary btn-sm" onClick={() => setShowZoneModal(true)}>
      <Plus size={14} /> Nouvelle zone
    </button>
  </div>
  <div className="card-body">
    {zones.map(zone => (
      <div key={zone.id} className="zone-card">
        <div className="zone-header">
          <span className="zone-name">{zone.name}</span>
          <span className="zone-badge" style={{ background: zone.color }}>
            {zone.tables.length} tables
          </span>
        </div>
        <div className="zone-tables">
          {zone.tables.map(table => (
            <span key={table.id} className="table-chip">
              Table {table.number}
            </span>
          ))}
        </div>
        <div className="zone-stats">
          <span>Capacité: {zone.totalCapacity} places</span>
          <span>Taux d'occupation: {zone.occupancyRate}%</span>
        </div>
      </div>
    ))}
  </div>
</div>
```

**Exemples de zones :**
- 🌳 Terrasse
- 🏠 Intérieur
- ⭐ VIP
- 👨‍👩‍👧‍👦 Familles
- 🚭 Non-fumeur
- 🪟 Près des fenêtres

**Fonctionnalités :**
- Créer des zones personnalisées
- Assigner des tables à des zones
- Couleur par zone
- Statistiques par zone
- Filtrage par zone

---

### 8. 📱 **Prévisualisation du menu client**

#### Simulateur de scan QR
```typescript
<div className="card">
  <div className="card-header">
    <span className="card-title">Prévisualisation client</span>
  </div>
  <div className="card-body">
    <div className="phone-mockup">
      <div className="phone-screen">
        <iframe
          src={`${clientAppUrl}/menu/${restaurantId}?table=${selectedTable}`}
          title="Preview menu client"
          style={{ width: '100%', height: '100%', border: 'none' }}
        />
      </div>
    </div>
    <div className="preview-controls">
      <select value={selectedTable} onChange={(e) => setSelectedTable(e.target.value)}>
        {tables.map(table => (
          <option key={table.id} value={table.number}>
            Table {table.number}
          </option>
        ))}
      </select>
      <button className="btn btn-ghost btn-sm" onClick={refreshPreview}>
        <RefreshCw size={14} /> Actualiser
      </button>
    </div>
  </div>
</div>
```

**Fonctionnalités :**
- Voir ce que le client voit après scan
- Tester le parcours de commande
- Vérifier l'affichage du menu
- Simuler une commande

---

### 9. 📊 **Historique et analytics des scans**

#### Suivi des scans de QR
```typescript
<div className="card">
  <div className="card-header">
    <span className="card-title">Analytics des QR codes</span>
  </div>
  <div className="card-body">
    <div className="analytics-grid">
      <div className="stat-card">
        <span className="stat-label">Scans aujourd'hui</span>
        <span className="stat-value">{scanStats.today}</span>
        <span className="stat-trend">+12% vs hier</span>
      </div>

      <div className="stat-card">
        <span className="stat-label">Taux de conversion</span>
        <span className="stat-value">{scanStats.conversionRate}%</span>
        <span className="stat-subtitle">Scans → Commandes</span>
      </div>

      <div className="stat-card">
        <span className="stat-label">Table la plus scannée</span>
        <span className="stat-value">Table {scanStats.topTable}</span>
        <span className="stat-subtitle">{scanStats.topTableScans} scans</span>
      </div>
    </div>

    <div className="scans-chart">
      <h4>Scans par heure</h4>
      <BarChart data={scansByHour} />
    </div>

    <div className="recent-scans">
      <h4>Scans récents</h4>
      <table className="data-table">
        <thead>
          <tr>
            <th>Table</th>
            <th>Heure</th>
            <th>Appareil</th>
            <th>Commande</th>
          </tr>
        </thead>
        <tbody>
          {recentScans.map(scan => (
            <tr key={scan.id}>
              <td>Table {scan.tableNumber}</td>
              <td>{formatTime(scan.timestamp)}</td>
              <td>{scan.device}</td>
              <td>
                {scan.orderId ? (
                  <span className="badge badge-success">Commandé</span>
                ) : (
                  <span className="badge badge-warning">En cours</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
</div>
```

**Données à tracker :**
- Nombre de scans par table
- Heure des scans
- Appareil utilisé (iOS/Android)
- Taux de conversion (scan → commande)
- Temps moyen entre scan et commande
- Tables jamais scannées

**Endpoint backend à créer :**
```typescript
POST /tables/:id/track-scan
Body: { device: string, userAgent: string }

GET /tables/scan-analytics?restaurantId=xxx&period=today
```

---

### 10. 🔔 **Notifications et alertes**

#### Système d'alertes pour les tables
```typescript
<div className="card">
  <div className="card-header">
    <span className="card-title">Alertes tables</span>
  </div>
  <div className="card-body">
    {tableAlerts.map(alert => (
      <div key={alert.id} className={`alert alert-${alert.severity}`}>
        <div className="alert-icon">
          {alert.type === 'long-occupation' && <Clock />}
          {alert.type === 'no-order' && <AlertTriangle />}
          {alert.type === 'cleaning-needed' && <Trash2 />}
        </div>
        <div className="alert-content">
          <span className="alert-title">{alert.title}</span>
          <span className="alert-message">{alert.message}</span>
          <span className="alert-time">{alert.timeAgo}</span>
        </div>
        <button className="alert-action" onClick={() => resolveAlert(alert.id)}>
          Résoudre
        </button>
      </div>
    ))}
  </div>
</div>
```

**Types d'alertes :**
- ⏱️ **Occupation longue** : "Table 05 occupée depuis 1h15"
- ⚠️ **Pas de commande** : "Table 08 scannée il y a 10min, aucune commande"
- 🧹 **Nettoyage nécessaire** : "Table 03 libérée, nettoyage requis"
- 📱 **QR non scanné** : "Table 12 occupée mais QR non scanné"
- 🔄 **Rotation faible** : "Table 15 - 1 seul service aujourd'hui"

---

### 11. 🖨️ **Impression de supports physiques**

#### Générateur de supports imprimables
```typescript
<div className="card">
  <div className="card-header">
    <span className="card-title">Supports imprimables</span>
  </div>
  <div className="card-body">
    <div className="print-templates">
      <div className="template-card" onClick={() => generatePrint('table-tent')}>
        <div className="template-preview">
          <img src="/templates/table-tent.png" alt="Chevalet de table" />
        </div>
        <span className="template-name">Chevalet de table</span>
        <span className="template-size">A5 plié</span>
      </div>

      <div className="template-card" onClick={() => generatePrint('sticker')}>
        <div className="template-preview">
          <img src="/templates/sticker.png" alt="Autocollant" />
        </div>
        <span className="template-name">Autocollant</span>
        <span className="template-size">10x10 cm</span>
      </div>

      <div className="template-card" onClick={() => generatePrint('poster')}>
        <div className="template-preview">
          <img src="/templates/poster.png" alt="Affiche" />
        </div>
        <span className="template-name">Affiche</span>
        <span className="template-size">A4</span>
      </div>

      <div className="template-card" onClick={() => generatePrint('menu-insert')}>
        <div className="template-preview">
          <img src="/templates/menu-insert.png" alt="Insert menu" />
        </div>
        <span className="template-name">Insert menu</span>
        <span className="template-size">A6</span>
      </div>
    </div>
  </div>
</div>
```

**Formats disponibles :**
- 📄 Chevalet de table (A5 plié)
- 🏷️ Autocollants (10x10 cm)
- 📋 Affiche (A4)
- 📖 Insert pour menu (A6)
- 🎴 Cartes de visite avec QR

---

### 12. 🔗 **Intégration avec les commandes**

#### Vue unifiée table + commandes
```typescript
<div className="table-detail-modal">
  <div className="modal-header">
    <h3>Table {selectedTable.number}</h3>
    <span className={`status-badge ${selectedTable.status}`}>
      {getStatusLabel(selectedTable.status)}
    </span>
  </div>

  <div className="modal-body">
    {/* Infos de la table */}
    <div className="table-info-section">
      <div className="info-row">
        <span className="label">Capacité:</span>
        <span className="value">{selectedTable.capacity} places</span>
      </div>
      <div className="info-row">
        <span className="label">Zone:</span>
        <span className="value">{selectedTable.zone}</span>
      </div>
      <div className="info-row">
        <span className="label">Occupée depuis:</span>
        <span className="value">{formatDuration(selectedTable.occupiedSince)}</span>
      </div>
    </div>

    {/* Commandes en cours */}
    <div className="orders-section">
      <h4>Commandes en cours</h4>
      {tableOrders.map(order => (
        <div key={order.id} className="order-card">
          <div className="order-header">
            <span className="order-number">#{order.orderNumber}</span>
            <span className="order-status">{order.status}</span>
          </div>
          <div className="order-items">
            {order.items.map(item => (
              <div key={item.id} className="order-item">
                <span className="item-qty">{item.quantity}x</span>
                <span className="item-name">{item.name}</span>
                <span className="item-price">{formatPrice(item.price)}</span>
              </div>
            ))}
          </div>
          <div className="order-total">
            Total: {formatPrice(order.total)}
          </div>
        </div>
      ))}
    </div>

    {/* Actions rapides */}
    <div className="quick-actions">
      <button className="btn btn-primary" onClick={() => addOrder(selectedTable.id)}>
        <Plus size={14} /> Nouvelle commande
      </button>
      <button className="btn btn-ghost" onClick={() => callWaiter(selectedTable.id)}>
        <Bell size={14} /> Appeler serveur
      </button>
      <button className="btn btn-ghost" onClick={() => requestBill(selectedTable.id)}>
        <Receipt size={14} /> Demander l'addition
      </button>
    </div>
  </div>
</div>
```

---

## 📊 Layout recommandé

```
┌─────────────────────────────────────────────────────┐
│  Zones de salle                                     │
│  [Terrasse] [Intérieur] [VIP] [+ Nouvelle zone]    │
├─────────────────────────────────────────────────────┤
│                          │                          │
│  Plan de salle visuel    │  Statistiques            │
│  [Drag & drop tables]    │  • CA par table          │
│                          │  • Taux rotation         │
│                          │  • Durée moy.            │
│                          │                          │
│                          │  Alertes                 │
│                          │  ⚠️ Table 05 - 1h15     │
│                          │  🧹 Table 03 - Nettoyage│
├─────────────────────────────────────────────────────┤
│  Liste des tables                                   │
│  [Filtres: Zone | Statut | Capacité]               │
│  Table | Code | Statut | QR | Actions              │
├─────────────────────────────────────────────────────┤
│  Réservations du jour    │  Analytics QR           │
│  • 12h30 - Table 05      │  • 45 scans aujourd'hui │
│  • 19h00 - Table 12      │  • Taux conversion: 78% │
└─────────────────────────────────────────────────────┘
```

---

## 🔌 Endpoints backend nécessaires

```typescript
// 1. Positions des tables
PUT /tables/:id/position
Body: { x: number, y: number, rotation: number, shape: string, capacity: number }

// 2. Statistiques par table
GET /tables/stats?restaurantId=xxx&period=today

// 3. Occupation
POST /tables/:id/start-occupation
POST /tables/:id/end-occupation
GET /tables/:id/occupation-history

// 4. Réservations
POST /reservations
GET /reservations?restaurantId=xxx&date=2026-04-15
PUT /reservations/:id/confirm

// 5. Zones
POST /zones
GET /zones?restaurantId=xxx
PUT /tables/:id/zone

// 6. Export QR en masse
POST /tables/bulk-qr-export
Body: { tableIds: string[], format: string }

// 7. Analytics scans
POST /tables/:id/track-scan
GET /tables/scan-analytics?restaurantId=xxx

// 8. Alertes
GET /tables/alerts?restaurantId=xxx
PUT /tables/alerts/:id/resolve
```

---

## 🎯 Priorisation

### 🔥 Priorité HAUTE
1. ✅ **Plan de salle visuel** (grande valeur UX)
2. ✅ **Statistiques par table** (insights précieux)
3. ✅ **Chronomètre d'occupation** (gestion temps réel)
4. ✅ **Export en masse QR** (gain de temps)
5. ✅ **Zones de salle** (organisation)

### ⚡ Priorité MOYENNE
6. ✅ **Système de réservations** (fonctionnalité avancée)
7. ✅ **Personnalisation QR avancée** (branding)
8. ✅ **Analytics des scans** (data-driven)
9. ✅ **Notifications et alertes** (réactivité)
10. ✅ **Intégration commandes** (vue unifiée)

### 🌟 Priorité BASSE
11. ✅ **Prévisualisation client** (nice to have)
12. ✅ **Supports imprimables** (marketing)

---

## 📦 Librairies recommandées

```bash
# Pour le drag & drop
npm install react-dnd react-dnd-html5-backend

# Pour les graphiques
npm install recharts

# Pour la génération de QR personnalisés
npm install qrcode.react

# Pour la génération de PDF
npm install jspdf html2canvas
```

---

## ✨ Conclusion

Votre page TablesAndQr peut devenir un **centre de gestion complet** de la salle avec ces fonctionnalités. Commencez par les **5 priorités hautes** pour un impact immédiat !
