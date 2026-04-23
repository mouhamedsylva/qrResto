# 🚀 Guide de Démarrage Rapide - qr-order-client

## 📋 Prérequis

- Flutter SDK ≥ 3.11.0
- Dart ≥ 3.11.0
- API qr-order-api démarrée sur le port 3000

## ⚡ Démarrage en 3 Étapes

### 1️⃣ Démarrer l'API Backend

```bash
cd qr-order-api
npm run start:dev
```

Vérifiez que l'API répond:
```bash
curl http://localhost:3000/api/v1/restaurants/ea5b4f8c-58e0-46a2-982a-78c7321c0d22
```

### 2️⃣ Installer les Dépendances Flutter

```bash
cd qr-order-client
flutter pub get
```

### 3️⃣ Lancer l'Application

**Option A: Web (Recommandé pour le développement)**
```bash
flutter run -d chrome
```

**Option B: Émulateur Android**
```bash
flutter run -d emulator-5554
```

**Option C: Émulateur iOS**
```bash
flutter run -d iPhone
```

---

## 🧪 Tester la Connexion API

Avant de lancer l'app, testez la connexion:

```bash
cd qr-order-client
dart run test_api_connection.dart
```

**Résultat attendu**:
```
🧪 Test de connexion à qr-order-api

📡 Test 1: Connexion à l'API...
✅ API accessible (Status: 200)
   Restaurant: Le Gourmet Dakar
   ID: ea5b4f8c-58e0-46a2-982a-78c7321c0d22
   Devise: EUR
   Langue: fr

📋 Test 2: Chargement du menu...
✅ 5 catégories trouvées
   - Entrées: 3 items
   - Plats: 5 items
   - Desserts: 4 items
   - Boissons: 6 items
   - Spécialités: 2 items
   Total: 20 produits

⚙️  Test 3: Paramètres du restaurant...
   Couleur primaire: #FF6B35
   Couleur secondaire: #2C3E50
   Taxe incluse: false
   Taux de taxe: 0.10

✅ Tous les tests sont passés!
```

---

## 🔧 Configuration

### Modifier l'ID du Restaurant

Par défaut, l'app utilise l'ID hardcodé dans `main.dart`:

```dart
home: const MenuScreen(
  restaurantId: 'ea5b4f8c-58e0-46a2-982a-78c7321c0d22',
  tableNumber: '33a2819a-f50f-47e0-a406-428b57c7b20c',
),
```

Pour utiliser un autre restaurant, remplacez ces IDs.

### Configurer pour Appareil Physique

Si vous testez sur un téléphone connecté au même WiFi:

1. **Trouver l'IP de votre machine**:
```bash
# Windows
ipconfig

# Mac/Linux
ifconfig | grep "inet "
```

2. **Modifier `lib/config/api_config.dart`**:
```dart
static String get baseUrl {
  if (kIsWeb) {
    return 'http://localhost:3000/api/v1';
  } else if (kDebugMode) {
    return 'http://10.0.2.2:3000/api/v1'; // Émulateur
  } else {
    return 'http://192.168.1.15:3000/api/v1'; // ⬅️ Votre IP
  }
}
```

3. **Configurer l'API pour écouter sur toutes les interfaces**:
```typescript
// qr-order-api/src/main.ts
await app.listen(3000, '0.0.0.0');
```

---

## 📱 Flux de l'Application

```
1. Scanner QR (ou ID hardcodé)
   ↓
2. Menu du Restaurant
   - Affichage des catégories
   - Liste des produits
   - Ajout au panier
   ↓
3. Panier
   - Modification des quantités
   - Calcul du total + taxes
   ↓
4. Paiement (Simulé pour l'instant)
   ↓
5. Suivi de Commande
   - En attente → En préparation → Prêt
   - Mises à jour en temps réel via WebSocket
```

---

## 🐛 Dépannage

### Erreur: "Failed to connect to localhost:3000"

**Cause**: L'API n'est pas démarrée ou n'écoute pas sur le bon port.

**Solution**:
```bash
cd qr-order-api
npm run start:dev
```

### Erreur: "404 Not Found"

**Cause**: L'URL ne contient pas le préfixe `/api/v1`.

**Solution**: Vérifiez que `api_config.dart` contient bien:
```dart
return 'http://localhost:3000/api/v1';
```

### Erreur: "Restaurant not found"

**Cause**: L'ID du restaurant n'existe pas dans la base de données.

**Solution**: 
1. Vérifiez les restaurants disponibles:
```bash
curl http://localhost:3000/api/v1/restaurants
```

2. Utilisez un ID valide dans `main.dart`

### WebSocket ne se connecte pas

**Cause**: L'URL WebSocket contient `/api/v1` (incorrect).

**Solution**: Vérifiez que `order_service.dart` utilise:
```dart
_socket = IO.io(ApiConfig.socketUrl, ...); // Sans /api/v1
```

### Produits ne s'affichent pas

**Cause**: Le restaurant n'a pas de catégories ou de produits.

**Solution**: Ajoutez des produits via l'interface owner ou:
```bash
cd qr-order-api
npm run seed:menu
```

---

## 📊 Données de Test

### Restaurant par Défaut
- **ID**: `ea5b4f8c-58e0-46a2-982a-78c7321c0d22`
- **Nom**: Le Gourmet Dakar
- **Tables**: 1 à 12

### Table par Défaut
- **ID**: `33a2819a-f50f-47e0-a406-428b57c7b20c`
- **Numéro**: 1

### Carte Stripe Test
- **Numéro**: `4242 4242 4242 4242`
- **Date**: N'importe quelle date future
- **CVC**: N'importe quel 3 chiffres

---

## 🎨 Personnalisation

### Changer les Couleurs

Les couleurs sont chargées dynamiquement depuis l'API. Pour les modifier:

1. Via l'interface owner (qr-order-owner)
2. Ou directement dans la base de données:
```sql
UPDATE restaurants 
SET "primaryColor" = '#FF6B35', 
    "secondaryColor" = '#2C3E50'
WHERE id = 'ea5b4f8c-58e0-46a2-982a-78c7321c0d22';
```

### Changer la Langue

```sql
UPDATE restaurants 
SET language = 'en'
WHERE id = 'ea5b4f8c-58e0-46a2-982a-78c7321c0d22';
```

---

## 📝 Commandes Utiles

```bash
# Installer les dépendances
flutter pub get

# Lancer en mode web
flutter run -d chrome

# Lancer en mode debug
flutter run --debug

# Lancer en mode release
flutter run --release

# Nettoyer le build
flutter clean

# Analyser le code
flutter analyze

# Formater le code
dart format lib/

# Tester la connexion API
dart run test_api_connection.dart
```

---

## 🔄 Hot Reload

Flutter supporte le Hot Reload. Après avoir lancé l'app:

- **r**: Reload (recharge l'UI)
- **R**: Hot Restart (redémarre l'app)
- **q**: Quit (quitter)

---

## 📚 Structure du Projet

```
lib/
├── main.dart                    # Point d'entrée
├── config/
│   └── api_config.dart          # Configuration API ✅ Modifié
├── models/
│   ├── product.dart             # Modèle produit ✅ Enrichi
│   ├── order.dart               # Modèle commande ✅ Enrichi
│   └── cart_item.dart           # Article panier
├── services/
│   ├── menu_service.dart        # Service menu
│   ├── order_service.dart       # Service commandes ✅ Amélioré
│   ├── restaurant_service.dart  # Service restaurant ✅ Nouveau
│   └── stripe_service.dart      # Service paiement
├── providers/
│   ├── cart_provider.dart       # État du panier
│   └── order_provider.dart      # État commande
├── screens/
│   ├── qr_scanner_screen.dart   # Scanner QR
│   ├── menu_screen.dart         # Menu restaurant
│   ├── cart_screen.dart         # Panier
│   ├── payment_screen.dart      # Paiement
│   └── order_status_screen.dart # Suivi commande
└── theme/
    └── app_theme.dart           # Thème de l'app
```

---

## ✅ Checklist de Démarrage

- [ ] API démarrée (`npm run start:dev`)
- [ ] Dépendances installées (`flutter pub get`)
- [ ] Test de connexion réussi (`dart run test_api_connection.dart`)
- [ ] App lancée (`flutter run -d chrome`)
- [ ] Menu s'affiche correctement
- [ ] Ajout au panier fonctionne
- [ ] Création de commande réussie
- [ ] WebSocket reçoit les mises à jour

---

**Prêt à tester!** 🎉

Si vous rencontrez des problèmes, consultez la section Dépannage ou vérifiez les logs de l'API et du client.
