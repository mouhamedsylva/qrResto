# ✅ Fonctionnalité d'archivage des membres - IMPLÉMENTÉE

## 🎯 Objectif
Permettre aux propriétaires de restaurants d'archiver et de désarchiver les membres de leur équipe, avec la possibilité de voir la liste des membres archivés.

---

## 📋 Ce qui a été fait

### 1. Backend - Base de données

#### Migration ajoutée
✅ **Créé** : `qr-order-api/src/database/migrations/1776382657122-AddIsArchivedToUsers.ts`
- Ajout du champ `isArchived` (boolean, default: false) à la table `users`
- Migration exécutée avec succès

#### Entité User mise à jour
✅ **Modifié** : `qr-order-api/src/modules/users/entities/user.entity.ts`
```typescript
@Column({ default: false })
isArchived: boolean;
```

---

### 2. Backend - Service

✅ **Modifié** : `qr-order-api/src/modules/users/users.service.ts`

#### Nouvelles méthodes ajoutées :

**1. `listTeamMembersByRestaurant(restaurantId, includeArchived = false)`**
- Liste les membres actifs par défaut
- Paramètre optionnel pour inclure les archivés
- Filtre `isArchived: false` par défaut

**2. `listArchivedTeamMembersByRestaurant(restaurantId)`**
- Liste uniquement les membres archivés
- Filtre `isArchived: true`
- Tri par date de mise à jour (DESC)
- Retourne `archivedAt` (updatedAt)

**3. `archiveTeamMembersByRestaurant(restaurantId, ids[])`**
- Archive plusieurs membres en une seule opération
- Met à jour `isArchived: true` au lieu de supprimer
- Retourne le nombre de membres archivés

**4. `unarchiveTeamMemberByRestaurant(restaurantId, memberId)`**
- Désarchive un seul membre
- Met à jour `isArchived: false`
- Vérifie que le membre est bien archivé avant

**5. `unarchiveTeamMembersByRestaurant(restaurantId, ids[])`**
- Désarchive plusieurs membres en une seule opération
- Met à jour `isArchived: false`
- Retourne le nombre de membres désarchivés

---

### 3. Backend - Contrôleur

✅ **Modifié** : `qr-order-api/src/modules/users/users.controller.ts`

#### Nouveaux endpoints ajoutés :

**1. GET `/users/team/:restaurantId/archived`**
- Liste les membres archivés d'un restaurant
- Retourne un tableau de membres avec `archivedAt`

**2. POST `/users/team/:restaurantId/:memberId/unarchive`**
- Désarchive un membre spécifique
- Retourne les informations du membre désarchivé

**3. POST `/users/team/:restaurantId/unarchive-bulk`**
- Désarchive plusieurs membres en une fois
- Body: `{ ids: string[] }`
- Retourne `{ unarchivedCount: number }`

#### Endpoint modifié :

**POST `/users/team/:restaurantId/archive-bulk`**
- Maintenant archive au lieu de supprimer
- Met à jour `isArchived: true`
- Retourne `{ archivedCount: number }`

---

### 4. Frontend - Interface Staff

✅ **Modifié** : `qr-order-owner/src/pages/Staff.tsx`

#### Nouveaux états ajoutés :
```typescript
const [archivedTeam, setArchivedTeam] = useState<TeamMember[]>([]);
const [showArchived, setShowArchived] = useState(false);
```

#### Nouvelles fonctions ajoutées :

**1. `loadArchivedTeam()`**
- Charge la liste des membres archivés
- Appelle l'endpoint `/users/team/:restaurantId/archived`

**2. `handleUnarchive(id)`**
- Désarchive un membre individuel
- Recharge les deux listes (actifs et archivés)

**3. `handleUnarchiveSelected()`**
- Désarchive plusieurs membres sélectionnés
- Affiche un message de confirmation
- Recharge les listes après succès

#### Modifications de l'interface :

**1. Bouton de basculement**
```tsx
<button onClick={() => setShowArchived(!showArchived)}>
  {showArchived ? 'Voir actifs' : `Voir archives (${archivedTeam.length})`}
</button>
```

**2. Actions conditionnelles**
- Mode actif : Import CSV, Import Excel, Archiver sélection
- Mode archivé : Désarchiver sélection

**3. Tableau dynamique**
- Affiche les membres actifs ou archivés selon le mode
- Colonne supplémentaire "Archivé le" en mode archivé
- Badge de statut différent (vert pour actif, gris pour archivé)

**4. Actions par ligne**
- Mode actif : Modifier, Détails, Archiver
- Mode archivé : Désarchiver

---

## 🎨 Interface utilisateur

### Vue des membres actifs
```
┌─────────────────────────────────────────────────────────┐
│ Membres de l'équipe          [Voir archives (3)] [Inviter]│
├─────────────────────────────────────────────────────────┤
│ Actions multiples (2 sélectionnés)                      │
│ [Import CSV] [Import Excel] [Archiver sélection]        │
├─────────────────────────────────────────────────────────┤
│ ☑ Nom          Role     Email         Statut   Action   │
│ ☑ John Doe     Manager  john@...      Actif    [...]    │
│ ☑ Jane Smith   Staff    jane@...      Actif    [...]    │
└─────────────────────────────────────────────────────────┘
```

### Vue des membres archivés
```
┌─────────────────────────────────────────────────────────┐
│ Membres archivés                        [Voir actifs]   │
├─────────────────────────────────────────────────────────┤
│ Actions multiples (1 sélectionné)                       │
│ [Désarchiver sélection]                                 │
├─────────────────────────────────────────────────────────┤
│ ☑ Nom       Role   Email    Statut   Archivé le  Action│
│ ☑ Bob Lee   Staff  bob@...  Archivé  15/04/2026 [Désarchiver]│
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Flux de travail

### Archivage d'un membre
```
1. Admin sélectionne un ou plusieurs membres actifs
2. Clique sur "Archiver sélection"
3. Confirme l'action dans la modale
   ↓
4. Backend met à jour isArchived = true
5. Frontend recharge les deux listes
6. Message de succès affiché
   ↓
7. Membre(s) disparaissent de la liste active
8. Membre(s) apparaissent dans la liste archivée
```

### Désarchivage d'un membre
```
1. Admin clique sur "Voir archives (X)"
2. Liste des membres archivés s'affiche
3. Admin sélectionne un ou plusieurs membres
4. Clique sur "Désarchiver sélection"
5. Confirme l'action dans la modale
   ↓
6. Backend met à jour isArchived = false
7. Frontend recharge les deux listes
8. Message de succès affiché
   ↓
9. Membre(s) disparaissent de la liste archivée
10. Membre(s) réapparaissent dans la liste active
```

---

## 📊 Endpoints API

### Liste des endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/users/team/:restaurantId` | Liste les membres actifs |
| GET | `/users/team/:restaurantId/archived` | Liste les membres archivés |
| POST | `/users/team/:restaurantId/archive-bulk` | Archive plusieurs membres |
| POST | `/users/team/:restaurantId/:memberId/unarchive` | Désarchive un membre |
| POST | `/users/team/:restaurantId/unarchive-bulk` | Désarchive plusieurs membres |

### Exemples de requêtes

#### Lister les membres archivés
```http
GET /users/team/restaurant-uuid/archived
Authorization: Bearer YOUR_JWT_TOKEN
```

**Réponse :**
```json
[
  {
    "id": "member-uuid",
    "name": "Bob Lee",
    "email": "bob@example.com",
    "role": "STAFF",
    "createdAt": "2026-03-15T10:00:00Z",
    "archivedAt": "2026-04-15T14:30:00Z",
    "restaurantId": "restaurant-uuid",
    "restaurantName": "Restaurant ABC"
  }
]
```

#### Désarchiver un membre
```http
POST /users/team/restaurant-uuid/member-uuid/unarchive
Authorization: Bearer YOUR_JWT_TOKEN
```

**Réponse :**
```json
{
  "id": "member-uuid",
  "name": "Bob Lee",
  "email": "bob@example.com",
  "role": "STAFF",
  "isArchived": false
}
```

#### Désarchiver plusieurs membres
```http
POST /users/team/restaurant-uuid/unarchive-bulk
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "ids": ["member-uuid-1", "member-uuid-2", "member-uuid-3"]
}
```

**Réponse :**
```json
{
  "unarchivedCount": 3
}
```

---

## 🔒 Sécurité et validation

### Vérifications backend

1. **Vérification du restaurant**
   - Le membre doit appartenir au restaurant spécifié
   - Empêche l'archivage/désarchivage de membres d'autres restaurants

2. **Vérification du rôle**
   - Seuls les MANAGER et STAFF peuvent être archivés
   - Les OWNER ne peuvent pas être archivés

3. **Vérification de l'état**
   - Pour désarchiver : vérifie que `isArchived: true`
   - Pour archiver : vérifie que `isArchived: false`

4. **Gestion des erreurs**
   - 404 si le membre n'existe pas
   - 400 si les données sont invalides
   - Messages d'erreur clairs

---

## ✨ Avantages de cette implémentation

### 1. Soft Delete (Archivage)
- ✅ Les données ne sont jamais supprimées définitivement
- ✅ Possibilité de restaurer un membre archivé
- ✅ Historique conservé (date d'archivage)
- ✅ Audit trail complet

### 2. Performance
- ✅ Opérations en masse (bulk operations)
- ✅ Requêtes optimisées avec filtres
- ✅ Pas de cascade delete

### 3. Expérience utilisateur
- ✅ Interface intuitive avec basculement actifs/archivés
- ✅ Compteur de membres archivés visible
- ✅ Sélection multiple pour actions en masse
- ✅ Confirmations avant actions critiques
- ✅ Messages de succès/erreur clairs

### 4. Flexibilité
- ✅ Archivage individuel ou multiple
- ✅ Désarchivage individuel ou multiple
- ✅ Filtrage facile (actifs vs archivés)
- ✅ Extensible pour d'autres fonctionnalités

---

## 🚀 Pour tester

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

### 3. Tester l'archivage
1. Aller sur http://localhost:5173/staff
2. Sélectionner un ou plusieurs membres
3. Cliquer sur "Archiver sélection"
4. Confirmer l'action
5. Vérifier que les membres disparaissent de la liste

### 4. Tester le désarchivage
1. Cliquer sur "Voir archives (X)"
2. Sélectionner un ou plusieurs membres archivés
3. Cliquer sur "Désarchiver sélection"
4. Confirmer l'action
5. Cliquer sur "Voir actifs"
6. Vérifier que les membres sont de retour

---

## 📝 Notes techniques

### Différence avec la suppression
**Avant (suppression) :**
```typescript
await this.userRepository.delete({ id: In(ids) });
```

**Maintenant (archivage) :**
```typescript
await this.userRepository.update(
  { id: In(ids) },
  { isArchived: true }
);
```

### Filtrage des requêtes
**Membres actifs :**
```typescript
where: {
  restaurant: { id: restaurantId },
  role: In([UserRole.MANAGER, UserRole.STAFF]),
  isArchived: false  // Nouveau filtre
}
```

**Membres archivés :**
```typescript
where: {
  restaurant: { id: restaurantId },
  role: In([UserRole.MANAGER, UserRole.STAFF]),
  isArchived: true  // Nouveau filtre
}
```

---

## 🎉 Résultat final

Maintenant, dans la page Staff :

1. ✅ Les membres peuvent être archivés au lieu d'être supprimés
2. ✅ Un bouton "Voir archives (X)" affiche le nombre de membres archivés
3. ✅ La liste des membres archivés est accessible en un clic
4. ✅ Les membres archivés peuvent être désarchivés individuellement
5. ✅ Les membres archivés peuvent être désarchivés en masse
6. ✅ L'interface bascule entre actifs et archivés de manière fluide
7. ✅ Les actions sont contextuelles (archiver en mode actif, désarchiver en mode archivé)
8. ✅ Toutes les données sont conservées (soft delete)

**La fonctionnalité d'archivage est complète et opérationnelle ! 🚀**

---

## 🔮 Améliorations futures possibles

1. **Filtre de recherche**
   - Rechercher dans les membres actifs et archivés
   - Filtrer par rôle, date d'archivage, etc.

2. **Raison d'archivage**
   - Ajouter un champ `archiveReason` (optionnel)
   - Afficher la raison dans la liste archivée

3. **Suppression définitive**
   - Ajouter une option pour supprimer définitivement après X jours
   - Confirmation renforcée pour suppression définitive

4. **Statistiques**
   - Dashboard avec nombre de membres actifs/archivés
   - Graphique d'évolution de l'équipe

5. **Export**
   - Exporter la liste des membres archivés en CSV
   - Rapport d'archivage avec dates et raisons

6. **Notifications**
   - Email au membre lors de l'archivage
   - Email au membre lors du désarchivage

7. **Permissions**
   - Seuls les OWNER peuvent archiver/désarchiver
   - Les MANAGER peuvent seulement voir les archivés
