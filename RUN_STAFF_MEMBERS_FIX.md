# 🚀 Guide rapide : Corriger les entrées staff_members manquantes

## ⚡ Solution rapide (1 commande)

```bash
cd qr-order-api
npm run fix:staff-members
```

## 📋 Ce que fait le script

1. ✅ Se connecte à la base de données
2. ✅ Trouve tous les membres d'équipe (MANAGER et STAFF)
3. ✅ Vérifie si chaque membre a une entrée dans `staff_members`
4. ✅ Crée les entrées manquantes avec :
   - Statut : `ACTIVE`
   - Position : `Manager` ou `Staff` selon le rôle
   - Téléphone : `null`

## 📊 Exemple de sortie

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

## ✅ Après l'exécution

Tous vos membres d'équipe auront maintenant une entrée dans `staff_members` et vous pourrez :

- ✅ Modifier leur statut (Actif/Inactif/En congé)
- ✅ Voir leur statut dans la liste
- ✅ Gérer leur position et téléphone

## 🔄 Alternative : Correction automatique

Si vous ne voulez pas exécuter le script, la correction se fera automatiquement lors de la première modification du statut d'un membre.

1. Allez sur Staff.tsx
2. Cliquez sur "Modifier statut" pour un membre
3. Sélectionnez un statut
4. Cliquez sur "Sauver"
5. ✅ L'entrée `staff_members` est créée automatiquement

---

**Recommandation** : Exécutez le script pour corriger tous les membres d'un coup ! 🚀
