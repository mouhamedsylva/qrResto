# ✅ Correction : Enregistrement dans la table staff_members

## 🎯 Problème identifié

Lors de la création d'un membre d'équipe, l'utilisateur était créé dans la table `users` mais **aucune entrée correspondante n'était créée dans la table `staff_members`**.

## 🔍 Analyse

La base de données utilise deux tables pour gérer les membres d'équipe :

1. **`users`** : Contient les informations d'authentification et le rôle
2. **`staff_members`** : Contient les informations spécifiques au staff (statut, téléphone, position)

Relation : `staff_members.user` → `users.id` (OneToOne avec CASCADE)

## ✨ Solution implémentée

### 1. Mise à jour du module Users

**Fichier : `qr-order-api/src/modules/users/users.module.ts`**

```typescript
// Ajout de l'entité StaffMember dans les imports
imports: [TypeOrmModule.forFeature([User, StaffMember]), EmailModule]
```

### 2. Injection du repository StaffMember

**Fichier : `qr-order-api/src/modules/users/users.service.ts`**

```typescript
constructor(
  @InjectRepository(User)
  private userRepository: Repository<User>,
  @InjectRepository(StaffMember)
  private staffMemberRepository: Repository<StaffMember>,
  private emailService: EmailService,
) {}
```

### 3. Création automatique dans staff_members

Ajout de la logique dans les deux méthodes de création :

#### `createTeamMember()`
```typescript
// Après la création de l'utilisateur
const staffMember = this.staffMemberRepository.create({
  user: savedUser,
  restaurant: owner.restaurant,
  status: StaffStatus.ACTIVE,
  phoneNumber: null,
  position: dto.role === UserRole.MANAGER ? 'Manager' : 'Staff',
});

await this.staffMemberRepository.save(staffMember);
```

#### `createTeamMemberByRestaurant()`
```typescript
// Après la création de l'utilisateur
const staffMember = this.staffMemberRepository.create({
  user: savedUser,
  restaurant: { id: restaurantId } as any,
  status: StaffStatus.ACTIVE,
  phoneNumber: null,
  position: dto.role === UserRole.MANAGER ? 'Manager' : 'Staff',
});

await this.staffMemberRepository.save(staffMember);
```

### 4. Correction des types TypeScript

**Fichier : `qr-order-api/src/modules/staff/entities/staff-member.entity.ts`**

```typescript
@Column({ nullable: true })
phoneNumber: string | null;  // Ajout de | null

@Column({ nullable: true })
position: string | null;  // Ajout de | null
```

## 📋 Détails de l'entrée staff_members créée

Pour chaque nouveau membre, une entrée est créée avec :

| Champ | Valeur |
|-------|--------|
| `user` | Référence vers l'utilisateur créé |
| `restaurant` | Référence vers le restaurant |
| `status` | `ACTIVE` (par défaut) |
| `phoneNumber` | `null` (peut être mis à jour plus tard) |
| `position` | `"Manager"` si role = MANAGER, sinon `"Staff"` |

## ✅ Résultat

Désormais, lors de la création d'un membre d'équipe :

1. ✅ Un utilisateur est créé dans `users`
2. ✅ Une entrée correspondante est créée dans `staff_members`
3. ✅ Un email d'invitation est envoyé avec le mot de passe
4. ✅ Les deux tables sont synchronisées automatiquement

## 🧪 Test

Pour tester la correction :

1. Créer un nouveau membre depuis la page Staff
2. Vérifier dans la base de données :
   ```sql
   SELECT * FROM users WHERE email = 'nouveau@membre.com';
   SELECT * FROM staff_members WHERE userId = '<id_du_user>';
   ```
3. Les deux entrées doivent exister et être liées

## 📦 Fichiers modifiés

- ✅ `qr-order-api/src/modules/users/users.module.ts`
- ✅ `qr-order-api/src/modules/users/users.service.ts`
- ✅ `qr-order-api/src/modules/staff/entities/staff-member.entity.ts`

## 🚀 Build

```bash
npm run build
```

**Statut** : ✅ Build réussi sans erreurs
