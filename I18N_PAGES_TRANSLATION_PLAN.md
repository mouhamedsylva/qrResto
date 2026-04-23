# Plan de Traduction des Pages Principales

## État actuel
- ✅ Dashboard.tsx : **TERMINÉ**
- ⏳ Orders.tsx : **À FAIRE**
- ⏳ MenuManagement.tsx : **À FAIRE**
- ⏳ Staff.tsx : **À FAIRE**
- ⏳ TablesAndQr.tsx : **À FAIRE**

---

## ORDERS.TSX - Clés de traduction nécessaires

### Titres et sous-titres
- `orders.myOrders` : "Mes commandes"
- `orders.trackActiveOrders` : "Suivez les commandes actives de votre restaurant."

### Métriques
- `orders.ordersOfDay` : "Commandes du jour"
- `orders.totalAmount` : "Montant total"
- `orders.inProgress` : "En cours"
- `orders.completed` : "Terminées"
- `orders.cancelled` : "Annulées"

### Filtres et actions
- `orders.serviceOrders` : "Commandes du service"
- `orders.edit` : "Editer"
- `orders.finish` : "Terminer"
- `orders.all` : "Toutes"
- `orders.preparing` : "En cours"
- `orders.pending` : "En attente"
- `orders.ready` : "Prêtes"

### Tableau
- `orders.orderNumber` : "N° commande"
- `orders.customer` : "Client"
- `orders.table` : "Table"
- `orders.items` : "Articles"
- `orders.amount` : "Montant"
- `orders.time` : "Heure"
- `orders.noOrdersForFilter` : "Aucune commande pour ce filtre."

### Kanban
- `orders.dragOrderHere` : "Glissez une commande ici"

---

## MENU_MANAGEMENT.TSX - Clés de traduction nécessaires

### Titres
- `menu.menuAndCards` : "Menu & Cartes"
- `menu.composeIrresistibleMenu` : "Composez une carte irrésistible pour votre service."
- `menu.yourMenuReady` : "Votre carte du jour est prête à performer"
- `menu.addDishesOptimize` : "Ajoutez des plats, optimisez les prix et mettez en avant vos best sellers."

### Actions principales
- `menu.exportCsv` : "Exporter CSV"
- `menu.importCsv` : "Importer CSV"
- `menu.addItem` : "Ajouter un article"
- `menu.newCategory` : "Nouvelle catégorie"
- `menu.newItem` : "Nouvel article"
- `menu.editItem` : "Modifier l'article"

### Formulaire catégorie
- `menu.categoryName` : "Nom"
- `menu.categoryPlaceholder` : "Ex: Entrées"
- `menu.createCategory` : "Créer catégorie"

### Formulaire article
- `menu.itemName` : "Nom de l'article"
- `menu.itemNamePlaceholder` : "Ex: Burger Signature"
- `menu.priceEur` : "Prix (EUR)"
- `menu.pricePlaceholder` : "Ex: 12.50"
- `menu.badgeLabel` : "Label du badge"
- `menu.badgePlaceholder` : "Ex: Best seller"
- `menu.color` : "Couleur"
- `menu.stockQuantity` : "Quantité en stock"
- `menu.stockPlaceholder` : "Ex: 20"
- `menu.lowStockThreshold` : "Seuil stock faible"
- `menu.thresholdPlaceholder` : "Ex: 5"
- `menu.prepTime` : "Temps de préparation (min)"
- `menu.prepTimePlaceholder` : "Ex: 15"
- `menu.calories` : "Calories (kcal)"
- `menu.caloriesPlaceholder` : "Ex: 450"
- `menu.chooseCategory` : "Choisir une catégorie"
- `menu.subcategory` : "Sous-catégorie"
- `menu.subcategoryPlaceholder` : "Ex: Chaudes, Froides…"
- `menu.dishImage` : "Image du plat"
- `menu.descriptionPlaceholder` : "Décrivez le plat (optionnel)"

### Allergènes et labels
- `menu.allergens` : "Allergènes"
- `menu.dietaryLabels` : "Labels diététiques"
- `menu.availableDays` : "Jours de disponibilité"

### Badges et statuts
- `menu.bestSeller` : "Best seller"
- `menu.new` : "Nouveau"
- `menu.signature` : "Signature"
- `menu.outOfStock` : "Rupture"
- `menu.lowStock` : "Stock faible"
- `menu.stock` : "Stock"

### Actions sur les articles
- `menu.edit` : "Modifier"
- `menu.duplicate` : "Dupliquer"
- `menu.delete` : "Supprimer"
- `menu.activate` : "Activer"
- `menu.deactivate` : "Désactiver"
- `menu.setDishOfDay` : "Plat du jour"
- `menu.removeDishOfDay` : "Retirer plat du jour"

### Messages
- `menu.categoryDeleted` : "Catégorie supprimée avec succès"
- `menu.itemModified` : "Article modifié avec succès"
- `menu.itemDuplicated` : "Article dupliqué avec succès"
- `menu.itemDeleted` : "Article supprimé avec succès"
- `menu.badgeApplied` : "Badge appliqué en lot"
- `menu.stockSetToZero` : "Stock mis à rupture pour la sélection"
- `menu.csvImportComplete` : "Import CSV terminé"

### Filtres
- `menu.all` : "Tous"
- `menu.allItems` : "Tous les articles"
- `menu.dishOfDay` : "Plat du jour"

---

## STAFF.TSX - Clés de traduction nécessaires

### Titres
- `staff.team` : "Equipe"
- `staff.teamManagement` : "Gestion des membres et des invitations."
- `staff.activeMembers` : "Membres de l'équipe"
- `staff.archivedMembers` : "Membres archivés"

### Actions
- `staff.inviteMember` : "Inviter un membre"
- `staff.viewActive` : "Voir actifs"
- `staff.viewArchived` : "Voir archives"
- `staff.multipleActions` : "Actions multiples"
- `staff.selected` : "sélectionnés"
- `staff.importCsv` : "Import CSV"
- `staff.importExcel` : "Import Excel"
- `staff.archiveSelection` : "Archiver sélection"
- `staff.unarchiveSelection` : "Désarchiver sélection"

### Formulaire invitation
- `staff.name` : "Nom"
- `staff.email` : "Email"
- `staff.role` : "Rôle"
- `staff.send` : "Envoyer"

### Rôles
- `staff.owner` : "Propriétaire"
- `staff.manager` : "Manager"
- `staff.staffMember` : "Staff"

### Statuts
- `staff.active` : "Actif"
- `staff.inactive` : "Inactif"
- `staff.onLeave` : "En congé"
- `staff.archived` : "Archivé"

### Tableau
- `staff.nameColumn` : "Nom"
- `staff.roleColumn` : "Rôle"
- `staff.emailColumn` : "Email"
- `staff.statusColumn` : "Statut"
- `staff.archivedOn` : "Archivé le"
- `staff.action` : "Action"

### Actions sur les membres
- `staff.modifyRole` : "Modifier rôle"
- `staff.modifyStatus` : "Modifier statut"
- `staff.details` : "Détails"
- `staff.archive` : "Archiver"
- `staff.unarchive` : "Désarchiver"
- `staff.save` : "Sauver"

### Messages de confirmation
- `staff.archiveMember` : "Archiver ce membre ?"
- `staff.archiveMemberMessage` : "Ce membre sera retiré de la liste active."
- `staff.unarchiveMember` : "Désarchiver ce membre ?"
- `staff.unarchiveMemberMessage` : "Ce membre sera restauré dans la liste active."
- `staff.archiveSelectionConfirm` : "Archiver la sélection ?"
- `staff.archiveSelectionMessage` : "Vous allez archiver {count} membre(s)."
- `staff.unarchiveSelectionConfirm` : "Désarchiver la sélection ?"
- `staff.unarchiveSelectionMessage` : "Vous allez désarchiver {count} membre(s)."

### Messages de succès
- `staff.memberInvited` : "Membre invité avec succès."
- `staff.memberInvitedWithPassword` : "Membre invité. Mot de passe temporaire: {password}"
- `staff.memberArchived` : "Membre archivé avec succès."
- `staff.memberUnarchived` : "Membre désarchivé avec succès."
- `staff.roleUpdated` : "Rôle mis à jour avec succès."
- `staff.statusUpdated` : "Statut mis à jour avec succès."
- `staff.archiveComplete` : "Archivage terminé. {success} membre(s) archivés, {fail} échec(s)."
- `staff.unarchiveComplete` : "Désarchivage terminé. {success} membre(s) désarchivés, {fail} échec(s)."
- `staff.importComplete` : "Import terminé. {success} membre(s) ajoutés, {fail} échec(s)."

### Messages d'erreur
- `staff.cannotLoadTeam` : "Impossible de charger l'équipe."
- `staff.cannotInvite` : "Impossible d'inviter ce membre."
- `staff.cannotArchive` : "Impossible d'archiver ce membre."
- `staff.cannotModifyRole` : "Impossible de modifier le rôle."
- `staff.cannotModifyStatus` : "Impossible de modifier le statut."
- `staff.cannotGetDetails` : "Impossible de récupérer les détails du membre."
- `staff.selectAtLeastOne` : "Sélectionnez au moins un membre."
- `staff.csvEmpty` : "Fichier CSV vide ou invalide."
- `staff.excelUnavailable` : "Import Excel temporairement indisponible. Utilisez l'import CSV."

### Pagination
- `staff.showing` : "Affichage de {start} à {end} sur {total} membre(s)"
- `staff.previous` : "Précédent"
- `staff.next` : "Suivant"

### Messages vides
- `staff.noMembers` : "Aucun membre dans l'équipe."
- `staff.noArchivedMembers` : "Aucun membre archivé."

---

## TABLES_AND_QR.TSX - Clés de traduction nécessaires

### Titres
- `tables.title` : "Tables & QR Codes"
- `tables.subtitle` : "Gestion complète de votre salle et QR codes personnalisés"

### Onglets
- `tables.tabTables` : "Tables"
- `tables.tabReservations` : "Réservations"
- `tables.tabQrCustom` : "QR Personnalisés"
- `tables.tabPreview` : "Aperçu Menu"
- `tables.tabPrint` : "Impression"

---

## PROCHAINES ÉTAPES

1. Ajouter toutes ces clés dans les 4 fichiers JSON (fr, en, nl, es)
2. Intégrer `useLanguage` dans chaque page
3. Remplacer tous les textes en dur par `t('key')`
4. Tester le build
5. Vérifier que toutes les traductions fonctionnent

**Estimation** : ~200 clés de traduction à ajouter × 4 langues = ~800 traductions
