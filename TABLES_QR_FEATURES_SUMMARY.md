# 🗺️ Résumé : Fonctionnalités pour TablesAndQr.tsx

## 🎯 12 fonctionnalités recommandées

### 🔥 Priorité HAUTE (À implémenter en premier)

#### 1. 🗺️ **Plan de salle visuel interactif**
- Drag & drop des tables sur une grille
- Redimensionnement et rotation
- Formes différentes (carré, rond, rectangle)
- Zones de salle (Terrasse, Intérieur, VIP)
- Sauvegarde des positions

**Impact :** Visualisation intuitive de la salle

---

#### 2. 📊 **Statistiques par table**
- Nombre de commandes par table
- CA généré par table
- Durée moyenne d'occupation
- Taux de rotation (services/jour)
- Table la plus/moins rentable

**Impact :** Optimisation de la rentabilité

---

#### 3. ⏱️ **Chronomètre d'occupation en temps réel**
- Démarrage auto quand table = Occupée
- Alerte visuelle après 45 min
- Notification après 1 heure
- Historique des durées
- Temps moyen par table

**Impact :** Gestion du temps d'occupation

---

#### 4. 📦 **Export en masse des QR codes**
- Sélection multiple de tables
- Export en ZIP (PNG/SVG)
- Export PDF multi-pages
- Export PDF grille (4x4 pour impression)
- Nommage automatique

**Impact :** Gain de temps énorme

---

#### 5. 🏷️ **Zones de salle**
- Créer des zones (Terrasse, VIP, etc.)
- Assigner tables aux zones
- Couleur par zone
- Statistiques par zone
- Filtrage par zone

**Impact :** Organisation claire

---

### ⚡ Priorité MOYENNE

#### 6. 📅 **Système de réservations**
- Créer réservation (nom, tel, nb personnes, heure)
- Vue calendrier
- Confirmation SMS/Email
- Rappel automatique 2h avant
- Gestion des no-show

**Impact :** Gestion des réservations

---

#### 7. 🎨 **Personnalisation avancée des QR**
- Logo du restaurant au centre
- Couleurs personnalisées
- Texte personnalisé
- Différentes tailles
- Formats multiples (PNG, SVG, PDF)

**Impact :** Branding professionnel

---

#### 8. 📊 **Analytics des scans de QR**
- Nombre de scans par table
- Taux de conversion (scan → commande)
- Scans par heure
- Appareil utilisé (iOS/Android)
- Tables jamais scannées

**Impact :** Insights data-driven

---

#### 9. 🔔 **Notifications et alertes**
- Occupation longue (>45min)
- Pas de commande après scan
- Nettoyage nécessaire
- QR non scanné
- Rotation faible

**Impact :** Réactivité immédiate

---

#### 10. 🔗 **Intégration avec les commandes**
- Vue détaillée table + commandes
- Commandes en cours par table
- Actions rapides (nouvelle commande, appeler serveur)
- Historique des commandes
- Demander l'addition

**Impact :** Vue unifiée

---

### 🌟 Priorité BASSE (Nice to have)

#### 11. 📱 **Prévisualisation du menu client**
- Simulateur de scan QR
- Voir ce que le client voit
- Tester le parcours de commande
- Vérifier l'affichage du menu

**Impact :** Contrôle qualité

---

#### 12. 🖨️ **Supports imprimables**
- Chevalet de table (A5 plié)
- Autocollants (10x10 cm)
- Affiche (A4)
- Insert menu (A6)
- Cartes de visite avec QR

**Impact :** Marketing physique

---

## 📊 Comparaison Avant/Après

| Aspect | Avant | Après |
|--------|-------|-------|
| **Visualisation** | Liste simple | Plan interactif drag & drop |
| **Statistiques** | ❌ | ✅ CA, rotation, durée par table |
| **Occupation** | Statut manuel | ✅ Chronomètre auto + alertes |
| **QR Export** | 1 par 1 | ✅ Export en masse (ZIP/PDF) |
| **Organisation** | Aucune | ✅ Zones de salle |
| **Réservations** | ❌ | ✅ Système complet |
| **Personnalisation QR** | 4 templates | ✅ Logo, couleurs, texte |
| **Analytics** | ❌ | ✅ Scans, conversion, tendances |
| **Alertes** | ❌ | ✅ 5 types d'alertes |
| **Intégration** | Séparé | ✅ Vue unifiée table+commandes |

---

## 🔌 Endpoints backend nécessaires

```typescript
// 1. Plan de salle
PUT /tables/:id/position
Body: { x: number, y: number, rotation: number, shape: string, capacity: number }

// 2. Statistiques
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

// 6. Export QR masse
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

## 🎨 Layout recommandé

```
┌─────────────────────────────────────────────────────┐
│  Zones: [Terrasse] [Intérieur] [VIP] [+ Nouvelle]  │
├─────────────────────────────────────────────────────┤
│                          │                          │
│  Plan de salle visuel    │  Statistiques            │
│  [Drag & drop tables]    │  • CA par table          │
│  🟢 🔴 🟡               │  • Taux rotation         │
│                          │  • Durée moyenne         │
│                          │                          │
│                          │  Alertes                 │
│                          │  ⚠️ Table 05 - 1h15     │
│                          │  🧹 Table 03 - Nettoyage│
├─────────────────────────────────────────────────────┤
│  Liste des tables                                   │
│  [Filtres: Zone | Statut | Capacité]               │
│  Table | Code | Statut | Chrono | QR | Actions     │
├─────────────────────────────────────────────────────┤
│  Réservations du jour    │  Analytics QR           │
│  • 12h30 - Table 05 (4p) │  • 45 scans aujourd'hui │
│  • 19h00 - Table 12 (2p) │  • Conversion: 78%      │
│                          │  • Top: Table 08        │
└─────────────────────────────────────────────────────┘
```

---

## 📦 Librairies à installer

```bash
# Pour le drag & drop
npm install react-dnd react-dnd-html5-backend

# Pour les graphiques
npm install recharts

# Pour QR personnalisés
npm install qrcode.react

# Pour génération PDF
npm install jspdf html2canvas
```

---

## 🚀 Plan d'implémentation

### Phase 1 : Visualisation (3-4 jours)
1. ✅ Plan de salle visuel drag & drop
2. ✅ Zones de salle
3. ✅ Chronomètre d'occupation

### Phase 2 : Analytics (2-3 jours)
4. ✅ Statistiques par table
5. ✅ Analytics des scans QR
6. ✅ Alertes et notifications

### Phase 3 : Export & Personnalisation (2-3 jours)
7. ✅ Export en masse QR
8. ✅ Personnalisation avancée QR
9. ✅ Supports imprimables

### Phase 4 : Avancé (3-4 jours)
10. ✅ Système de réservations
11. ✅ Intégration commandes
12. ✅ Prévisualisation client

---

## 💡 Exemples de données

### Statistiques table
```json
{
  "tableId": "xxx",
  "tableNumber": "05",
  "ordersCount": 12,
  "revenue": 450.50,
  "avgDuration": 42,
  "rotationRate": 3.5,
  "lastOccupied": "2026-04-15T14:30:00Z"
}
```

### Alerte
```json
{
  "id": "xxx",
  "type": "long-occupation",
  "severity": "medium",
  "tableId": "xxx",
  "tableNumber": "05",
  "title": "Occupation longue",
  "message": "Table 05 occupée depuis 1h15",
  "timestamp": "2026-04-15T15:45:00Z"
}
```

### Réservation
```json
{
  "id": "xxx",
  "customerName": "Awa S.",
  "phone": "+33612345678",
  "partySize": 4,
  "date": "2026-04-15",
  "time": "19:00",
  "tableId": "xxx",
  "tableNumber": "12",
  "status": "confirmed",
  "notes": "Anniversaire - prévoir bougie"
}
```

---

## ✨ Résultat attendu

Une page **complète de gestion de salle** qui permet de :
- ✅ Visualiser la salle en temps réel
- ✅ Optimiser la rentabilité par table
- ✅ Gérer les occupations et rotations
- ✅ Exporter tous les QR en 1 clic
- ✅ Organiser par zones
- ✅ Gérer les réservations
- ✅ Personnaliser les QR codes
- ✅ Analyser les performances
- ✅ Réagir aux alertes
- ✅ Vue unifiée table + commandes

**Temps d'implémentation estimé :** 10-14 jours pour toutes les fonctionnalités

**Documentation complète :** Voir `qr-order-owner/TABLES_QR_FEATURES_IDEAS.md`
