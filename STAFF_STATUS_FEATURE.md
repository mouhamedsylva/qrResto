# ✅ Nouvelle fonctionnalité : Gestion du statut des membres

## 🎯 Fonctionnalité ajoutée

Possibilité de modifier le statut d'un membre d'équipe dans la page Staff.tsx avec trois états possibles :
- **ACTIVE** (Actif) - Membre actif
- **INACTIVE** (Inactif) - Membre temporairement inactif
- **ON_LEAVE** (En congé) - Membre en congé

## 🔧 Implémentation Backend

### 1. Nouveau DTO créé

**Fichier : `qr-order-api/src/modules/users/dto/update-staff-status.dto.ts`**

```typescript
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StaffStatus } from '../../staff/entities/staff-member.entity';

export class UpdateStaffStatusDto {
  @ApiProperty({
    enum: StaffStatus,
    description: 'Nouveau statut du membre',
    example: StaffStatus.ACTIVE,
  })
  @IsEnum(StaffStatus)
  status: StaffStatus;
}
```

### 2. Nouvelle méthode dans UsersService

**Fichier : `qr-order-api/src/modules/users/users.service.ts`**

```typescript
async updateStaffMemberStatus(
  restaurantId: string,
  memberId: string,
  status: any,
) {
  // Vérifier que le membre existe et appartient au restaurant
  const user = await this.userRepository.findOne({
    where: {
      id: memberId,
      restaurant: { id: restaurantId },
      role: In([UserRole.MANAGER, UserRole.STAFF]),
    },
  });

  if (!user) {
    throw new NotFoundException('Membre introuvable dans ce restaurant.');
  }

  // Trouver l'entrée staff_members correspondante
  const staffMember = await this.staffMemberRepository.findOne({
    where: {
      user: { id: memberId },
      restaurant: { id: restaurantId },
    },
  });

  if (!staffMember) {
    throw new NotFoundException('Entrée staff_members introuvable.');
  }

  // Mettre à jour le statut
  staffMember.status = status;
  await this.staffMemberRepository.save(staffMember);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: staffMember.status,
  };
}
```

### 3. Nouvel endpoint dans UsersController

**Fichier : `qr-order-api/src/modules/users/users.controller.ts`**

```typescript
@Put('team/:restaurantId/:memberId/status')
@ApiOperation({ summary: "Modifier le statut d'un membre (ACTIVE/INACTIVE/ON_LEAVE)" })
@ApiBody({ type: UpdateStaffStatusDto })
@ApiResponse({ status: 200, description: 'Statut membre mis à jour.' })
async updateStaffMemberStatus(
  @Param('restaurantId') restaurantId: string,
  @Param('memberId') memberId: string,
  @Body() dto: UpdateStaffStatusDto,
) {
  return this.usersService.updateStaffMemberStatus(
    restaurantId,
    memberId,
    dto.status,
  );
}
```

### 4. Modification de listTeamMembersByRestaurant

La méthode a été modifiée pour inclure le statut depuis la table `staff_members` :

```typescript
async listTeamMembersByRestaurant(restaurantId: string, includeArchived = false) {
  const members = await this.userRepository.find({
    where: {
      restaurant: { id: restaurantId },
      role: In([UserRole.MANAGER, UserRole.STAFF]),
      ...(includeArchived ? {} : { isArchived: false }),
    },
    relations: ['restaurant'],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      restaurant: {
        id: true,
        name: true,
      },
    },
    order: { createdAt: 'DESC' },
  });

  // Récupérer les statuts depuis staff_members
  const membersWithStatus = await Promise.all(
    members.map(async (member) => {
      const staffMember = await this.staffMemberRepository.findOne({
        where: {
          user: { id: member.id },
          restaurant: { id: restaurantId },
        },
      });

      return {
        id: member.id,
        name: member.name,
        email: member.email,
        role: member.role,
        createdAt: member.createdAt,
        restaurantId: member.restaurant?.id || null,
        restaurantName: member.restaurant?.name || null,
        status: staffMember?.status || 'ACTIVE',
      };
    }),
  );

  return membersWithStatus;
}
```

## 🎨 Implémentation Frontend

### 1. Type TeamMember mis à jour

```typescript
type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: 'OWNER' | 'MANAGER' | 'STAFF' | string;
  restaurantId?: string | null;
  archivedAt?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';  // ✅ Nouveau champ
};
```

### 2. États ajoutés

```typescript
const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
const [editingStatus, setEditingStatus] = useState<'ACTIVE' | 'INACTIVE' | 'ON_LEAVE'>('ACTIVE');
```

### 3. Fonctions de gestion du statut

```typescript
const handleEditStatus = (member: TeamMember) => {
  setEditingStatusId(member.id);
  setEditingStatus(member.status || 'ACTIVE');
};

const handleSaveStatus = async (memberId: string) => {
  if (!restaurantId) return;
  try {
    await api.put(`/users/team/${restaurantId}/${memberId}/status`, {
      status: editingStatus,
    });
    setFeedback('Statut mis a jour avec succes.');
    setSuccessMessage('Statut mis a jour avec succes.');
    setEditingStatusId(null);
    await loadTeam();
  } catch (error) {
    console.error('Erreur modification statut', error);
    setFeedback('Impossible de modifier le statut.');
  }
};
```

### 4. Fonctions d'affichage

```typescript
const statusLabel = (status?: string) => {
  if (status === 'INACTIVE') return 'Inactif';
  if (status === 'ON_LEAVE') return 'En congé';
  return 'Actif';
};

const statusColor = (status?: string) => {
  if (status === 'INACTIVE') return { background: 'rgba(239,68,68,0.10)', color: '#dc2626' };
  if (status === 'ON_LEAVE') return { background: 'rgba(251,191,36,0.10)', color: '#f59e0b' };
  return { background: 'rgba(16,185,129,0.10)', color: '#059669' };
};
```

### 5. Interface utilisateur

Le tableau affiche maintenant :
- **Badge de statut** avec couleur appropriée
- **Bouton "Modifier statut"** pour chaque membre
- **Dropdown de sélection** avec les 3 options lors de l'édition
- **Boutons Sauver/Annuler** pour valider ou annuler la modification

## 📊 Statuts disponibles

| Statut | Label | Couleur | Utilisation |
|--------|-------|---------|-------------|
| `ACTIVE` | Actif | Vert | Membre actif et disponible |
| `INACTIVE` | Inactif | Rouge | Membre temporairement inactif |
| `ON_LEAVE` | En congé | Orange | Membre en congé |

## 🔄 Flux d'utilisation

### Modifier le statut d'un membre

1. Aller sur la page Staff
2. Cliquer sur **"Modifier statut"** pour un membre
3. Sélectionner le nouveau statut dans le dropdown
4. Cliquer sur **"Sauver"** pour valider
5. ✅ Le statut est mis à jour dans la BDD
6. ✅ Le badge de statut se met à jour avec la nouvelle couleur

### Annuler la modification

1. Cliquer sur **"Modifier statut"**
2. Cliquer sur **"Annuler"**
3. ✅ Le statut reste inchangé

## 🎯 Endpoint API

### Modifier le statut

**Endpoint** : `PUT /users/team/:restaurantId/:memberId/status`

**Headers** :
```
Content-Type: application/json
```

**Body** :
```json
{
  "status": "INACTIVE"
}
```

**Réponse** :
```json
{
  "id": "uuid",
  "name": "Jean Dupont",
  "email": "jean@example.com",
  "role": "STAFF",
  "status": "INACTIVE"
}
```

**Codes de statut** :
- `200` : Statut mis à jour avec succès
- `404` : Membre introuvable
- `400` : Statut invalide

## 🧪 Test de la fonctionnalité

### 1. Modifier le statut en INACTIVE

1. Ouvrir Staff.tsx
2. Cliquer sur "Modifier statut" pour un membre
3. Sélectionner "Inactif"
4. Cliquer sur "Sauver"
5. ✅ Le badge devient rouge avec "Inactif"

### 2. Vérifier dans la BDD

```sql
SELECT 
  u.id, 
  u.name, 
  u.email, 
  sm.status 
FROM users u
JOIN staff_members sm ON sm.userId = u.id
WHERE u.email = 'membre@test.com';
```

**Résultat attendu** :
```
id | name | email | status
xxx | Test | membre@test.com | INACTIVE
```

### 3. Modifier en ON_LEAVE

1. Cliquer sur "Modifier statut"
2. Sélectionner "En congé"
3. Cliquer sur "Sauver"
4. ✅ Le badge devient orange avec "En congé"

### 4. Remettre en ACTIVE

1. Cliquer sur "Modifier statut"
2. Sélectionner "Actif"
3. Cliquer sur "Sauver"
4. ✅ Le badge devient vert avec "Actif"

## 📦 Fichiers modifiés/créés

### Backend

- ✅ **Créé** : `qr-order-api/src/modules/users/dto/update-staff-status.dto.ts`
- ✅ **Modifié** : `qr-order-api/src/modules/users/users.service.ts`
- ✅ **Modifié** : `qr-order-api/src/modules/users/users.controller.ts`

### Frontend

- ✅ **Modifié** : `qr-order-owner/src/pages/Staff.tsx`

## 🎨 Design

### Badges de statut

**Actif** :
- Fond : `rgba(16,185,129,0.10)`
- Texte : `#059669`
- Label : "Actif"

**Inactif** :
- Fond : `rgba(239,68,68,0.10)`
- Texte : `#dc2626`
- Label : "Inactif"

**En congé** :
- Fond : `rgba(251,191,36,0.10)`
- Texte : `#f59e0b`
- Label : "En congé"

### Boutons

- **"Modifier statut"** : Bouton ghost
- **"Sauver"** : Bouton primary
- **"Annuler"** : Bouton ghost

## 💡 Cas d'usage

### Membre en congé

1. Membre part en vacances
2. Propriétaire change le statut en "En congé"
3. ✅ Visibilité claire du statut dans la liste
4. Membre revient de vacances
5. Propriétaire remet le statut en "Actif"

### Membre temporairement inactif

1. Membre en arrêt maladie
2. Propriétaire change le statut en "Inactif"
3. ✅ Le membre reste dans la liste mais avec statut visible
4. Membre revient
5. Propriétaire remet le statut en "Actif"

### Différence avec l'archivage

| Aspect | Statut INACTIVE | Archivage |
|--------|----------------|-----------|
| **Visibilité** | ✅ Visible dans la liste active | ❌ Masqué (liste archives) |
| **Temporaire** | ✅ Oui (congé, maladie) | ❌ Non (départ définitif) |
| **Réactivation** | ✅ Changement de statut | ✅ Désarchivage |
| **Usage** | Absence temporaire | Départ de l'équipe |

## ✅ Avantages

- ✅ **Visibilité** : Statut visible directement dans la liste
- ✅ **Flexibilité** : 3 états pour différentes situations
- ✅ **Simplicité** : Modification en 2 clics
- ✅ **Traçabilité** : Historique des changements via `updatedAt`
- ✅ **Design** : Couleurs distinctives pour chaque statut
- ✅ **UX** : Interface intuitive avec dropdown

## 🎉 Résumé

La fonctionnalité de gestion du statut des membres est maintenant opérationnelle :

- ✅ **Backend** : Endpoint et logique de mise à jour du statut
- ✅ **Frontend** : Interface de modification avec badges colorés
- ✅ **Base de données** : Statut stocké dans `staff_members.status`
- ✅ **Design** : Badges avec couleurs appropriées
- ✅ **UX** : Modification simple et intuitive

---

**Statut** : ✅ Fonctionnalité complète et opérationnelle
**Date** : 17 avril 2026
**Impact** : Amélioration de la gestion d'équipe
