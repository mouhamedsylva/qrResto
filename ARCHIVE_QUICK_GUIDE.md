# 🗂️ Guide rapide : Archivage des membres

## ✅ Implémentation terminée

### Backend
- ✅ Champ `isArchived` ajouté à la table `users`
- ✅ Migration exécutée avec succès
- ✅ 5 nouvelles méthodes dans `UsersService`
- ✅ 3 nouveaux endpoints dans `UsersController`
- ✅ Build réussi sans erreurs

### Frontend
- ✅ Interface de basculement actifs/archivés
- ✅ Liste des membres archivés
- ✅ Désarchivage individuel et multiple
- ✅ Compteur de membres archivés
- ✅ Actions contextuelles selon le mode

---

## 🎯 Nouveaux endpoints

### GET `/users/team/:restaurantId/archived`
Liste les membres archivés

### POST `/users/team/:restaurantId/:memberId/unarchive`
Désarchive un membre

### POST `/users/team/:restaurantId/unarchive-bulk`
Désarchive plusieurs membres
Body: `{ ids: ["uuid1", "uuid2"] }`

---

## 🖥️ Utilisation

### Archiver des membres
1. Aller sur `/staff`
2. Sélectionner un ou plusieurs membres
3. Cliquer "Archiver sélection"
4. Confirmer

### Voir les membres archivés
1. Cliquer sur "Voir archives (X)"
2. La liste des membres archivés s'affiche

### Désarchiver des membres
1. En mode archives, sélectionner des membres
2. Cliquer "Désarchiver sélection"
3. Confirmer
4. Les membres reviennent dans la liste active

---

## 🎨 Interface

**Mode actifs :**
```
[Voir archives (3)] [Inviter un membre]
[Import CSV] [Import Excel] [Archiver sélection]
```

**Mode archivés :**
```
[Voir actifs]
[Désarchiver sélection]
```

---

## 🔄 Différence clé

**Avant :** Suppression définitive
```typescript
await this.userRepository.delete({ id: In(ids) });
```

**Maintenant :** Archivage (soft delete)
```typescript
await this.userRepository.update(
  { id: In(ids) },
  { isArchived: true }
);
```

---

## ✨ Avantages

- 🔒 Données conservées (pas de perte)
- ♻️ Restauration possible
- 📊 Historique complet
- 🚀 Opérations en masse
- 🎯 Interface intuitive

---

## 🚀 Prêt à utiliser !

Démarrez le serveur et testez :
```bash
cd qr-order-api && npm run start:dev
cd qr-order-owner && npm run dev
```

Puis allez sur http://localhost:5173/staff
