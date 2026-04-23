# ✅ Correction : Entrées staff_members manquantes

## 🎯 Problème identifié

Erreur lors de la modification du statut d'un membre :

```json
{
  "statusCode": 404,
  "message": "Entrée staff_members introuvable.",
  "error": "Not Found"
}
```

## 🔍 Cause racine

Les membres d'équipe créés **avant** l'implémentation de la création automatique dans `staff_members` n'ont pas d'entrée correspondante dans cette table.

### Pourquoi ce problème ?

1. **Avant** : Les membres étaient créés uniquement dans la table `users`
2. **Maintenant** : Les membres sont créés dans `users` ET `staff_members`
3. **Résultat** : Les anciens membres n'ont pas d'entrée dans `staff_members`

## ✅ Solutions implémentées

### Solution 1 : Création automatique lors de la modification du statut

La méthode `updateStaffMemberStatus` a été modifiée pour créer automatiquement l'entrée `staff_members` si elle n'existe pas.

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
    relations: ['restaurant'],
  });

  if (!user) {
    throw new NotFoundException('Membre introuvable dans ce restaurant.');
  }

  // Trouver l'entrée staff_members correspondante
  let staffMember = await this.staffMemberRepository.findOne({
    where: {
      user: { id: memberId },
      restaurant: { id: restaurantId },
    },
  });

  // ✅ Si l'entrée n'existe pas, la créer automatiquement
  if (!staffMember) {
    staffMember = this.staffMemberRepository.create({
      user: user,
      restaurant: user.restaurant,
      status: StaffStatus.ACTIVE,
      phoneNumber: null,
      position: user.role === UserRole.MANAGER ? 'Manager' : 'Staff',
    });
    await this.staffMemberRepository.save(staffMember);
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

### Solution 2 : Script de migration pour tous les membres existants

Un script a été créé pour créer les entrées `staff_members` manquantes pour tous les membres existants.

**Fichier : `qr-order-api/src/scripts/create-missing-staff-members.ts`**

```typescript
import { DataSource } from 'typeorm';
import { User, UserRole } from '../modules/users/entities/user.entity';
import { StaffMember, StaffStatus } from '../modules/staff/entities/staff-member.entity';

async function createMissingStaffMembers() {
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3306'),
    username: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'qr_order_db',
    entities: [User, StaffMember],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Connexion à la base de données établie');

    const userRepository = dataSource.getRepository(User);
    const staffMemberRepository = dataSource.getRepository(StaffMember);

    // Récupérer tous les membres d'équipe (MANAGER et STAFF)
    const teamMembers = await userRepository.find({
      where: [
        { role: UserRole.MANAGER },
        { role: UserRole.STAFF },
      ],
      relations: ['restaurant'],
    });

    console.log(`📊 ${teamMembers.length} membre(s) d'équipe trouvé(s)`);

    let createdCount = 0;
    let existingCount = 0;

    for (const user of teamMembers) {
      // Vérifier si une entrée staff_members existe déjà
      const existingStaffMember = await staffMemberRepository.findOne({
        where: {
          user: { id: user.id },
        },
      });

      if (existingStaffMember) {
        existingCount++;
        console.log(`⏭️  Entrée existante pour ${user.name} (${user.email})`);
        continue;
      }

      // Créer l'entrée staff_members manquante
      const staffMember = staffMemberRepository.create({
        user: user,
        restaurant: user.restaurant,
        status: StaffStatus.ACTIVE,
        phoneNumber: null,
        position: user.role === UserRole.MANAGER ? 'Manager' : 'Staff',
      });

      await staffMemberRepository.save(staffMember);
      createdCount++;
      console.log(`✅ Entrée créée pour ${user.name} (${user.email})`);
    }

    console.log('\n📊 Résumé :');
    console.log(`   - Entrées créées : ${createdCount}`);
    console.log(`   - Entrées existantes : ${existingCount}`);
    console.log(`   - Total : ${teamMembers.length}`);

    await dataSource.destroy();
    console.log('\n✅ Script terminé avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution du script :', error);
    process.exit(1);
  }
}

createMissingStaffMembers();
```

## 🚀 Utilisation

### Option 1 : Automatique (recommandé)

Essayez simplement de modifier le statut d'un membre. Si l'entrée `staff_members` n'existe pas, elle sera créée automatiquement.

1. Aller sur Staff.tsx
2. Cliquer sur "Modifier statut" pour un membre
3. Sélectionner un statut
4. Cliquer sur "Sauver"
5. ✅ L'entrée `staff_members` est créée automatiquement si nécessaire
6. ✅ Le statut est mis à jour

### Option 2 : Script de migration (pour tous les membres)

Pour créer toutes les entrées manquantes d'un coup :

```bash
cd qr-order-api
npm run fix:staff-members
```

**Sortie attendue** :

```
✅ Connexion à la base de données établie
📊 5 membre(s) d'équipe trouvé(s)
✅ Entrée créée pour Jean Dupont (jean@example.com)
✅ Entrée créée pour Marie Martin (marie@example.com)
⏭️  Entrée existante pour Paul Durand (paul@example.com)
✅ Entrée créée pour Sophie Bernard (sophie@example.com)
✅ Entrée créée pour Luc Petit (luc@example.com)

📊 Résumé :
   - Entrées créées : 4
   - Entrées existantes : 1
   - Total : 5

✅ Script terminé avec succès
```

## 🔄 Flux de correction

### Avant la correction

1. Membre créé avant l'implémentation
2. Entrée dans `users` : ✅
3. Entrée dans `staff_members` : ❌
4. Tentative de modification du statut : ❌ Erreur 404

### Après la correction (automatique)

1. Membre créé avant l'implémentation
2. Entrée dans `users` : ✅
3. Entrée dans `staff_members` : ❌
4. Tentative de modification du statut
5. **Création automatique** de l'entrée `staff_members` : ✅
6. Mise à jour du statut : ✅

### Après la correction (script)

1. Exécution du script `npm run fix:staff-members`
2. Scan de tous les membres dans `users`
3. Création des entrées manquantes dans `staff_members` : ✅
4. Tous les membres ont maintenant une entrée `staff_members` : ✅

## 🧪 Vérification

### Vérifier les membres sans entrée staff_members

```sql
SELECT 
  u.id, 
  u.name, 
  u.email, 
  u.role,
  sm.id as staff_member_id
FROM users u
LEFT JOIN staff_members sm ON sm.userId = u.id
WHERE u.role IN ('MANAGER', 'STAFF')
  AND sm.id IS NULL;
```

**Résultat attendu après correction** : Aucune ligne (tous les membres ont une entrée)

### Vérifier qu'un membre a bien son entrée

```sql
SELECT 
  u.id, 
  u.name, 
  u.email, 
  sm.status,
  sm.position
FROM users u
JOIN staff_members sm ON sm.userId = u.id
WHERE u.email = 'membre@test.com';
```

**Résultat attendu** :
```
id | name | email | status | position
xxx | Test | membre@test.com | ACTIVE | Staff
```

## 📦 Fichiers modifiés/créés

### Backend

- ✅ **Modifié** : `qr-order-api/src/modules/users/users.service.ts`
- ✅ **Créé** : `qr-order-api/src/scripts/create-missing-staff-members.ts`
- ✅ **Modifié** : `qr-order-api/package.json` (ajout du script `fix:staff-members`)

## 💡 Prévention future

Pour éviter ce problème à l'avenir, la création d'un membre crée maintenant **automatiquement** une entrée dans les deux tables :

1. **Table `users`** : Informations d'authentification et rôle
2. **Table `staff_members`** : Informations spécifiques au staff (statut, téléphone, position)

### Code de création (déjà implémenté)

```typescript
// Créer l'utilisateur
const savedUser = await this.userRepository.save(newUser);

// Créer l'entrée staff_members correspondante
const staffMember = this.staffMemberRepository.create({
  user: savedUser,
  restaurant: { id: restaurantId } as any,
  status: StaffStatus.ACTIVE,
  phoneNumber: null,
  position: dto.role === UserRole.MANAGER ? 'Manager' : 'Staff',
});

await this.staffMemberRepository.save(staffMember);
```

## 🎯 Résumé des solutions

| Solution | Quand l'utiliser | Avantage |
|----------|------------------|----------|
| **Automatique** | Modification du statut | ✅ Transparent pour l'utilisateur |
| **Script** | Après migration/mise à jour | ✅ Corrige tous les membres d'un coup |

## ✅ Résultat

- ✅ **Création automatique** : L'entrée `staff_members` est créée si elle n'existe pas
- ✅ **Script de migration** : Permet de corriger tous les membres existants
- ✅ **Prévention** : Les nouveaux membres ont toujours les deux entrées
- ✅ **Pas d'erreur 404** : La modification du statut fonctionne maintenant

## 🚀 Action recommandée

**Exécutez le script de migration pour corriger tous les membres existants :**

```bash
cd qr-order-api
npm run fix:staff-members
```

Cela créera toutes les entrées `staff_members` manquantes en une seule fois.

---

**Statut** : ✅ Problème résolu avec double solution
**Date** : 17 avril 2026
**Impact** : Correction des données existantes + prévention future
