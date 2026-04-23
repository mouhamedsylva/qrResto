# 🧪 Guide de test : Analytics intégré

## ✅ Intégration terminée

La page Analytics est maintenant connectée à l'API backend et affiche les vraies données de la base de données.

---

## 🚀 Démarrage

### Terminal 1 : Backend
```bash
cd qr-order-api
npm run start:dev
```

### Terminal 2 : Frontend
```bash
cd qr-order-owner
npm run dev
```

### Accès
```
http://localhost:5173/analytics
```

---

## 🧪 Tests à effectuer

### ✅ Test 1 : Chargement initial
1. Ouvrir la page Analytics
2. **Vérifier** : Skeleton de chargement s'affiche
3. **Vérifier** : Données se chargent (KPIs, graphiques, tableaux)
4. **Vérifier** : Aucune erreur dans la console

**Résultat attendu :**
- KPIs affichés avec tendances (flèches ↑ ou ↓)
- 3 graphiques (barres, cercle, courbe)
- Tableaux remplis avec données

---

### ✅ Test 2 : Filtres de période

**2.1 Aujourd'hui**
1. Cliquer sur "Aujourd'hui"
2. **Vérifier** : Données se rechargent
3. **Vérifier** : Seules les commandes du jour s'affichent

**2.2 7 jours**
1. Cliquer sur "7 jours"
2. **Vérifier** : Données des 7 derniers jours

**2.3 30 jours**
1. Cliquer sur "30 jours"
2. **Vérifier** : Données des 30 derniers jours

**2.4 Custom**
1. Cliquer sur "Custom"
2. Sélectionner une date de début
3. Sélectionner une date de fin
4. **Vérifier** : Données de la période personnalisée

---

### ✅ Test 3 : Filtres de statut

1. Sélectionner "Terminées" dans le dropdown
2. **Vérifier** : Seules les commandes terminées s'affichent
3. **Vérifier** : KPIs mis à jour
4. **Vérifier** : Graphiques mis à jour

Répéter avec :
- Annulées
- En préparation
- En attente
- Prêtes

---

### ✅ Test 4 : Filtre de catégorie

1. Taper "Burgers" dans le champ catégorie
2. **Vérifier** : Seules les commandes de burgers s'affichent
3. **Vérifier** : Graphique des catégories mis à jour

---

### ✅ Test 5 : Filtre de canal

1. Sélectionner "Sur place"
2. **Vérifier** : Seules les commandes sur place
3. Sélectionner "A emporter"
4. **Vérifier** : Seules les commandes à emporter
5. Sélectionner "Livraison"
6. **Vérifier** : Seules les livraisons

---

### ✅ Test 6 : Combinaison de filtres

1. Période : 7 jours
2. Statut : Terminées
3. Catégorie : Burgers
4. Canal : Sur place
5. **Vérifier** : Données filtrées correctement
6. **Vérifier** : Tous les graphiques cohérents

---

### ✅ Test 7 : Widgets masquables

1. Cliquer sur "Masquer statusSplit"
2. **Vérifier** : Widget disparaît
3. Cliquer sur "Afficher statusSplit"
4. **Vérifier** : Widget réapparaît

Répéter pour tous les widgets :
- statusSplit
- hourlyHeatmap
- categoryPerf
- tablePerf
- cancellations
- forecast
- cohorts

---

### ✅ Test 8 : Export CSV

1. Cliquer sur "Export CSV"
2. **Vérifier** : Fichier téléchargé
3. Ouvrir le fichier
4. **Vérifier** : Données présentes (CA, Commandes, etc.)

---

### ✅ Test 9 : Aucune donnée

1. Sélectionner une période sans commandes
2. **Vérifier** : Message "Aucune donnée pour les filtres sélectionnés"
3. **Vérifier** : Suggestion de changer les filtres

---

### ✅ Test 10 : Gestion des erreurs

**Simuler une erreur :**
1. Arrêter le backend
2. Recharger la page
3. **Vérifier** : Message d'erreur affiché
4. **Vérifier** : Bouton "Réessayer" présent
5. Redémarrer le backend
6. Cliquer sur "Réessayer"
7. **Vérifier** : Données se chargent

---

## 📊 Vérifications visuelles

### KPIs
- ✅ CA total avec icône Euro
- ✅ Nombre de commandes
- ✅ Panier moyen en EUR
- ✅ Clients uniques avec icône Users
- ✅ Tendances avec flèches et pourcentages
- ✅ Couleurs : vert (positif), rouge (négatif)

### Graphique en barres (Catégories)
- ✅ Barres horizontales
- ✅ Gradient rose
- ✅ Montants affichés
- ✅ Proportions correctes

### Graphique en cercle (Statuts)
- ✅ Donut chart coloré
- ✅ Total au centre
- ✅ Légende avec couleurs
- ✅ Proportions correctes

### Courbe (CA horaire)
- ✅ Barres verticales
- ✅ Gradient rose
- ✅ Heures affichées (10h-21h)
- ✅ Hauteurs proportionnelles

### Heatmap horaire
- ✅ 12 cases (10h-21h)
- ✅ Intensité de couleur variable
- ✅ Nombre de commandes affiché
- ✅ Heures en dessous

### Tableaux
- ✅ Top articles : Nom, Commandes, CA
- ✅ Répartition statuts : Barres de progression
- ✅ Performance catégories : Commandes, CA, Marge
- ✅ Analyse tables : Table, Commandes, CA, Rotation
- ✅ Annulations : Raisons et nombres
- ✅ Prévisions : Fin de journée et semaine
- ✅ Cohortes : Nouveaux, Récurrents, Pourcentage

---

## 🐛 Problèmes potentiels

### Problème 1 : Aucune donnée ne s'affiche
**Cause** : Pas de commandes dans la base de données
**Solution** : Créer des commandes de test

### Problème 2 : Erreur 404
**Cause** : Backend non démarré ou endpoint incorrect
**Solution** : Vérifier que le backend tourne sur port 3000

### Problème 3 : Erreur CORS
**Cause** : Configuration CORS incorrecte
**Solution** : Vérifier APP_CORS_ORIGIN dans .env

### Problème 4 : Données ne se rechargent pas
**Cause** : useEffect ne se déclenche pas
**Solution** : Vérifier les dépendances du useEffect

### Problème 5 : Graphiques vides
**Cause** : Données nulles ou format incorrect
**Solution** : Vérifier la structure de la réponse API

---

## ✅ Checklist finale

- [ ] Backend démarré et accessible
- [ ] Frontend démarré et accessible
- [ ] Page Analytics charge sans erreur
- [ ] KPIs affichés avec tendances
- [ ] 3 graphiques principaux affichés
- [ ] Tous les tableaux remplis
- [ ] Filtres de période fonctionnent
- [ ] Filtres de statut fonctionnent
- [ ] Filtre de catégorie fonctionne
- [ ] Filtre de canal fonctionne
- [ ] Widgets masquables fonctionnent
- [ ] Export CSV fonctionne
- [ ] Gestion des erreurs fonctionne
- [ ] Message "Aucune donnée" fonctionne
- [ ] Rechargement automatique fonctionne

---

## 🎉 Si tous les tests passent

**Félicitations ! L'intégration Analytics est 100% fonctionnelle ! 🚀**

Les données proviennent maintenant de la vraie base de données et tous les graphiques sont alimentés par l'API backend.
