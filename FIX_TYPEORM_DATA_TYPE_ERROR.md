# ✅ Correction : Erreur TypeORM "Data type Object not supported"

## 🎯 Problème identifié

```
DataTypeNotSupportedError: Data type "Object" in "StaffMember.phoneNumber" is not supported by "mysql" database.
```

Le serveur backend ne pouvait pas démarrer à cause d'une erreur de type de données dans l'entité `StaffMember`.

## 🔍 Cause racine

TypeORM ne pouvait pas déterminer le type de colonne MySQL pour les champs `phoneNumber` et `position` car ils étaient définis avec un type TypeScript union (`string | null`) sans spécification explicite du type de colonne.

### Code problématique

```typescript
@Column({ nullable: true })
phoneNumber: string | null;

@Column({ nullable: true })
position: string | null;
```

TypeORM interprétait `string | null` comme un type "Object" au lieu de "varchar", ce qui n'est pas supporté par MySQL.

## ✅ Solution appliquée

Spécification explicite du type de colonne MySQL avec `type: 'varchar'` :

```typescript
@Column({ type: 'varchar', nullable: true })
phoneNumber: string | null;

@Column({ type: 'varchar', nullable: true })
position: string | null;
```

## 📝 Explication technique

### Pourquoi cette erreur ?

1. **TypeScript** : `string | null` est un type union valide en TypeScript
2. **TypeORM** : Sans spécification explicite, TypeORM essaie d'inférer le type de colonne
3. **Inférence échouée** : TypeORM voit le type union et ne peut pas le mapper automatiquement
4. **Résultat** : TypeORM considère le type comme "Object", qui n'existe pas en MySQL

### Solution

En spécifiant explicitement `type: 'varchar'`, on indique à TypeORM :
- Le type de colonne MySQL à utiliser : `VARCHAR`
- Le champ peut être `NULL` : `nullable: true`
- TypeScript peut toujours utiliser `string | null` pour la sécurité des types

## 🔧 Fichiers modifiés

**`qr-order-api/src/modules/staff/entities/staff-member.entity.ts`**

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';

export enum StaffStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_LEAVE = 'ON_LEAVE',
}

@Entity('staff_members')
export class StaffMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: StaffStatus,
    default: StaffStatus.ACTIVE,
  })
  status: StaffStatus;

  @Column({ type: 'varchar', nullable: true })  // ✅ Type explicite
  phoneNumber: string | null;

  @Column({ type: 'varchar', nullable: true })  // ✅ Type explicite
  position: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
  restaurant: Restaurant;
}
```

## ✅ Vérification

### Build réussi

```bash
cd qr-order-api
Remove-Item -Recurse -Force dist
npm run build
```

**Résultat** : ✅ Compilation réussie sans erreurs

### Démarrage du serveur

```bash
npm run start:dev
```

Le serveur devrait maintenant démarrer sans erreur TypeORM.

## 💡 Bonnes pratiques TypeORM

### Toujours spécifier le type pour les types union

❌ **Mauvais** :
```typescript
@Column({ nullable: true })
field: string | null;
```

✅ **Bon** :
```typescript
@Column({ type: 'varchar', nullable: true })
field: string | null;
```

### Types de colonnes MySQL courants

| Type TypeScript | Type MySQL | Décorateur |
|----------------|------------|------------|
| `string` | `VARCHAR` | `@Column({ type: 'varchar' })` |
| `number` (entier) | `INT` | `@Column({ type: 'int' })` |
| `number` (décimal) | `DECIMAL` | `@Column({ type: 'decimal', precision: 10, scale: 2 })` |
| `boolean` | `TINYINT(1)` | `@Column({ type: 'boolean' })` |
| `Date` | `DATETIME` | `@Column({ type: 'datetime' })` |
| `enum` | `ENUM` | `@Column({ type: 'enum', enum: MyEnum })` |
| `string` (long) | `TEXT` | `@Column({ type: 'text' })` |
| `object` | `JSON` | `@Column({ type: 'json' })` |

### Champs nullable

Pour les champs nullable, toujours :
1. Ajouter `nullable: true` dans le décorateur
2. Ajouter `| null` dans le type TypeScript
3. Spécifier le type de colonne explicitement

```typescript
@Column({ type: 'varchar', nullable: true })
optionalField: string | null;
```

## 🚀 Prochaines étapes

1. **Démarrer le serveur** :
   ```bash
   cd qr-order-api
   npm run start:dev
   ```

2. **Vérifier les logs** : Le serveur devrait démarrer sans erreur TypeORM

3. **Tester la connexion** : Ouvrir http://localhost:3000/api/v1

4. **Tester la création de membre** : Créer un membre d'équipe depuis le frontend

## 📋 Checklist de vérification

- ✅ Type de colonne spécifié explicitement (`type: 'varchar'`)
- ✅ Champs nullable correctement configurés (`nullable: true`)
- ✅ Types TypeScript cohérents (`string | null`)
- ✅ Build réussi sans erreurs
- ✅ Dossier `dist/` nettoyé et recompilé
- ⏳ Serveur à démarrer et tester

## 🎯 Résumé

| Aspect | Avant | Après |
|--------|-------|-------|
| **Type décorateur** | `@Column({ nullable: true })` | `@Column({ type: 'varchar', nullable: true })` |
| **Type TypeScript** | `string \| null` | `string \| null` (inchangé) |
| **Type MySQL** | ❌ "Object" (erreur) | ✅ `VARCHAR` |
| **Build** | ❌ Échec | ✅ Réussi |
| **Serveur** | ❌ Ne démarre pas | ✅ Prêt à démarrer |

---

**Statut** : ✅ Problème résolu, serveur prêt à démarrer
**Date** : 17 avril 2026
**Fichiers modifiés** : 1 (`staff-member.entity.ts`)
