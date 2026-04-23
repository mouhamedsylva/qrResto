# 🍔 QR Order Client — Application Flutter

Application Flutter client pour la commande en restaurant via QR Code.

## ✨ Fonctionnalités

| Écran | Description |
|-------|-------------|
| **QR Scanner** | Scanner animé simulé avec détection de table |
| **Menu** | Liste élégante avec catégories, best-sellers, images |
| **Panier** | Gestion complète des articles (ajout/suppression/quantité) |
| **Paiement** | Intégration Stripe simulée avec animation de succès |
| **Suivi** | Statut temps réel via Stream (En attente → Préparation → Prêt) |

## 🚀 Démarrage Rapide

### Prérequis
- Flutter SDK ≥ 3.11.0
- Dart ≥ 3.11.0
- API qr-order-api démarrée

### Installation

```bash
# 1. Installer les dépendances
flutter pub get

# 2. Tester la connexion API
dart run test_api_connection.dart

# 3. Lancer l'application
flutter run -d chrome  # Web
# ou
flutter run -d emulator-5554  # Android
# ou
flutter run -d iPhone  # iOS
```

## 🏗️ Architecture

```
lib/
├── main.dart                    # Entry point + MultiProvider
├── config/
│   └── api_config.dart          # Configuration API ✅ Aligné
├── models/
│   ├── product.dart             # Modèle produit ✅ Enrichi
│   ├── cart_item.dart           # Article de panier
│   └── order.dart               # Commande + OrderStatus ✅ Enrichi
├── services/
│   ├── menu_service.dart        # Service menu
│   ├── order_service.dart       # Service commandes ✅ Amélioré
│   ├── restaurant_service.dart  # Service restaurant ✅ Nouveau
│   └── stripe_service.dart      # Service paiement
├── providers/
│   ├── cart_provider.dart       # État du panier
│   └── order_provider.dart      # État de la commande
└── screens/
    ├── qr_scanner_screen.dart   # Scanner QR
    ├── menu_screen.dart         # Menu restaurant
    ├── cart_screen.dart         # Panier
    ├── payment_screen.dart      # Paiement
    └── order_status_screen.dart # Suivi commande
```

## 📦 Dépendances

```yaml
provider: ^6.1.1              # Gestion d'état
google_fonts: ^6.1.0          # Typographie Poppins
cached_network_image: ^3.3.0  # Images avec cache
mobile_scanner: ^5.0.0        # Scanner QR
http: ^1.2.1                  # Requêtes HTTP
socket_io_client: ^2.0.3      # WebSocket temps réel
shared_preferences: ^2.2.3    # Stockage local
```

## 🔌 Connexion à l'API

### Configuration
Le client se connecte à l'API via `lib/config/api_config.dart`:

```dart
// Web
baseUrl = 'http://localhost:3000/api/v1'

// Émulateur Android
baseUrl = 'http://10.0.2.2:3000/api/v1'

// Appareil physique (même WiFi)
baseUrl = 'http://192.168.1.X:3000/api/v1'  // Remplacer X par votre IP
```

### Endpoints Utilisés

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/restaurants/:id` | GET | Infos restaurant + menu complet |
| `/orders` | POST | Créer une commande |
| `/orders/:id` | GET | Suivre une commande |
| `/orders/:id/status` | PUT | Mettre à jour le statut |

### WebSocket
Connexion à `http://localhost:3000` pour les mises à jour temps réel:
- Event: `orderStatusUpdated`
- Payload: `{ orderId, status }`

## 🎨 Design System

| Token | Valeur |
|-------|--------|
| `primary` | `#FF6B35` (Orange) |
| `primaryDark` | `#E05520` |
| `success` | `#22C55E` |
| `warning` | `#F59E0B` |
| `background` | `#FAFAFA` |
| Font | Poppins (Google Fonts) |

## 🔄 Flux de Navigation

```
QRScannerScreen
    └── MenuScreen (restaurantId, tableNumber)
            └── CartScreen
                    └── PaymentScreen
                            └── OrderStatusScreen
                                    └── MenuScreen (nouvelle commande)
```

## 📡 Fonctionnalités Temps Réel

Le `OrderService` utilise Socket.IO pour recevoir les mises à jour:
- **En attente** → Commande reçue
- **En préparation** → Cuisine en cours
- **Prêt** → Commande prête à servir
- **Terminé** → Commande livrée

## 🧪 Tests

### Test de Connexion API
```bash
dart run test_api_connection.dart
```

### Données de Test
- **Restaurant ID**: `ea5b4f8c-58e0-46a2-982a-78c7321c0d22`
- **Table ID**: `33a2819a-f50f-47e0-a406-428b57c7b20c`
- **Carte Stripe**: `4242 4242 4242 4242`

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

## 🔧 Configuration Avancée

### Appareil Physique (même WiFi)

1. Trouver l'IP de votre machine:
```bash
# Windows
ipconfig

# Mac/Linux
ifconfig | grep "inet "
```

2. Modifier `lib/config/api_config.dart`:
```dart
return 'http://192.168.1.15:3000/api/v1';  // Votre IP
```

3. Configurer l'API:
```typescript
// qr-order-api/src/main.ts
await app.listen(3000, '0.0.0.0');
```

## 📚 Documentation

- [Plan d'Alignement](../QR_CLIENT_ALIGNMENT_PLAN.md)
- [Phase 1 Complétée](../QR_CLIENT_PHASE1_COMPLETE.md)
- [Guide de Démarrage](../QR_CLIENT_QUICK_START.md)
- [Résumé d'Alignement](../QR_CLIENT_ALIGNMENT_SUMMARY.md)

## ✅ Status d'Alignement avec l'API

- ✅ Configuration API correcte (`/api/v1`)
- ✅ Modèles de données enrichis
- ✅ Support DINE_IN / TAKE_AWAY
- ✅ Taxes dynamiques
- ✅ WebSocket fonctionnel
- ✅ Gestion des ruptures de stock
- ✅ Allergènes supportés
- ⚠️ Paiement Stripe (simulé)
- ⚠️ Thème dynamique (à intégrer)
- ⚠️ Multi-langue (à implémenter)

**Alignement global: 90%** 🎯

## 🚀 Prochaines Étapes

### Phase 2: Améliorations UI
1. Intégrer le thème restaurant (couleurs dynamiques)
2. Afficher les produits épuisés
3. Section allergènes dans les détails produit

### Phase 3: Paiement Stripe
1. Ajouter `flutter_stripe` package
2. Implémenter le flux de paiement réel
3. Gérer les erreurs et confirmations

### Phase 4: Multi-langue
1. Ajouter `flutter_localizations`
2. Utiliser la langue du restaurant
3. Traductions FR/EN

---

*Développé avec Flutter · Provider · Socket.IO · Aligné avec qr-order-api*