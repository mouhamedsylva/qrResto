# 🔄 Plan d'Alignement qr-order-client avec qr-order-api

## 📊 État Actuel

### ✅ Ce qui fonctionne déjà
Le client Flutter `qr-order-client` dispose d'une base solide:
- Architecture Provider pour la gestion d'état
- Services HTTP configurés avec `http` package
- WebSocket configuré avec `socket_io_client`
- Modèles de données: `Product`, `Order`, `OrderItem`, `CartItem`
- Écrans: Scanner QR, Menu, Panier, Paiement, Suivi de commande
- Configuration API avec support web/mobile

### ⚠️ Points à aligner

#### 1. **Configuration API**
**Fichier**: `lib/config/api_config.dart`

**Problème actuel**:
```dart
static String get baseUrl {
  if (kIsWeb) {
    return 'http://localhost:3000';
  } else {
    return 'http://10.0.2.2:3000';
  }
}
```

**À corriger**:
- Ajouter le préfixe `/api/v1` pour correspondre à l'API
- Supporter les variables d'environnement
- Ajouter configuration pour réseau local (WiFi)

**Solution**:
```dart
static String get baseUrl {
  const apiVersion = '/api/v1';
  
  if (kIsWeb) {
    return 'http://localhost:3000$apiVersion';
  } else if (kDebugMode) {
    // Pour émulateur Android
    return 'http://10.0.2.2:3000$apiVersion';
  } else {
    // Pour appareil physique - à configurer selon votre réseau
    return 'http://192.168.1.X:3000$apiVersion';
  }
}
```

---

#### 2. **Service Menu**
**Fichier**: `lib/services/menu_service.dart`

**État actuel**: ✅ Bien aligné
- Utilise `GET /restaurants/:id` pour récupérer le menu complet
- Parse correctement les catégories et items
- Gère le cache en mémoire

**Améliorations suggérées**:
- Ajouter gestion d'erreurs plus robuste
- Supporter le rafraîchissement du cache
- Gérer les produits épuisés (`isAvailable`)

---

#### 3. **Service Commandes**
**Fichier**: `lib/services/order_service.dart`

**État actuel**: ✅ Bien aligné
- Utilise `POST /orders` pour créer une commande
- WebSocket configuré pour les mises à jour en temps réel
- Écoute l'événement `orderStatusUpdated`

**Points à vérifier**:
```dart
// ✅ Correct
body: jsonEncode({
  'restaurantId': restaurantId,
  'tableId': tableNumber,
  'type': 'DINE_IN',
  'items': cartItems.map((item) => {
    'menuItemId': item.product.id,
    'quantity': item.quantity,
  }).toList()
})
```

**Améliorations**:
- Ajouter support pour `type: 'TAKE_AWAY'`
- Ajouter champ `customerName` pour les commandes à emporter
- Ajouter champ `note` pour les instructions spéciales

---

#### 4. **Modèle Product**
**Fichier**: `lib/models/product.dart`

**État actuel**: ✅ Bien aligné avec l'API

Le modèle parse correctement:
- `id`, `name`, `description`, `price`, `imageUrl`
- `badgeLabel`, `isDishOfDay`, `dietaryLabels`
- `ordersCount` pour déterminer la popularité

**Champs manquants de l'API**:
- `isAvailable` (pour gérer les ruptures de stock)
- `allergens` (liste des allergènes)
- `preparationTime` (temps de préparation)

**À ajouter**:
```dart
class Product {
  // ... champs existants
  final bool isAvailable;
  final List<String> allergens;
  final int? preparationTime; // en minutes

  const Product({
    // ... params existants
    this.isAvailable = true,
    this.allergens = const [],
    this.preparationTime,
  });

  factory Product.fromJson(Map<String, dynamic> json, String categoryName) {
    // ... code existant
    return Product(
      // ... champs existants
      isAvailable: json['isAvailable'] ?? true,
      allergens: json['allergens'] != null 
        ? List<String>.from(json['allergens']) 
        : [],
      preparationTime: json['preparationTime'],
    );
  }
}
```

---

#### 5. **Modèle Order**
**Fichier**: `lib/models/order.dart`

**État actuel**: ✅ Bien aligné

**Statuts supportés**:
```dart
enum OrderStatus {
  pending,    // ✅ Correspond à PENDING dans l'API
  preparing,  // ✅ Correspond à PREPARING
  ready,      // ✅ Correspond à READY
  completed,  // ✅ Correspond à COMPLETED
  cancelled,  // ✅ Correspond à CANCELLED
}
```

**Améliorations**:
- Ajouter champ `type` (DINE_IN / TAKE_AWAY)
- Ajouter champ `customerName` pour les commandes à emporter
- Ajouter champ `note` pour les instructions

```dart
class Order {
  // ... champs existants
  final String? type;
  final String? customerName;
  final String? note;

  Order({
    // ... params existants
    this.type,
    this.customerName,
    this.note,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    // ... code existant
    return Order(
      // ... champs existants
      type: json['type'],
      customerName: json['customerName'],
      note: json['note'],
    );
  }
}
```

---

#### 6. **Service Paiement**
**Fichier**: `lib/services/stripe_service.dart`

**État actuel**: Simulation uniquement

**À implémenter**:
1. Intégrer le package `flutter_stripe`
2. Utiliser l'endpoint `POST /payments/checkout`
3. Gérer le retour de paiement

**Dépendance à ajouter**:
```yaml
dependencies:
  flutter_stripe: ^10.0.0
```

**Code à implémenter**:
```dart
import 'package:flutter_stripe/flutter_stripe.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';

class StripeService {
  Future<void> initialize() async {
    Stripe.publishableKey = ApiConfig.stripePublishableKey;
  }

  Future<bool> processPayment({
    required String restaurantId,
    required String tableId,
    required List<Map<String, dynamic>> items,
  }) async {
    try {
      // 1. Créer une session de paiement
      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/payments/checkout'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'restaurantId': restaurantId,
          'tableId': tableId,
          'items': items,
        }),
      );

      if (response.statusCode != 201) {
        throw Exception('Erreur création session');
      }

      final data = jsonDecode(response.body);
      final clientSecret = data['clientSecret'];

      // 2. Confirmer le paiement
      await Stripe.instance.confirmPayment(
        paymentIntentClientSecret: clientSecret,
      );

      return true;
    } catch (e) {
      print('Erreur paiement: $e');
      return false;
    }
  }
}
```

---

## 🎯 Fonctionnalités API non utilisées

### 1. **Réservations**
L'API supporte les réservations (`/reservations`) mais le client ne les utilise pas.

**Endpoints disponibles**:
- `GET /reservations?restaurantId=X&date=Y`
- `POST /reservations`
- `PUT /reservations/:id/confirm`
- `PUT /reservations/:id/cancel`

**À implémenter si nécessaire**:
- Écran de réservation
- Service `reservation_service.dart`
- Modèle `Reservation`

### 2. **Personnalisation Restaurant**
L'API retourne les couleurs de marque (`primaryColor`, `secondaryColor`) mais le client ne les applique pas.

**À implémenter**:
```dart
// Dans menu_service.dart
Future<Map<String, dynamic>> getRestaurantTheme(String restaurantId) async {
  final info = await getRestaurantInfo(restaurantId);
  return {
    'primaryColor': Color(int.parse(info['primaryColor'].replaceFirst('#', '0xFF'))),
    'secondaryColor': Color(int.parse(info['secondaryColor'].replaceFirst('#', '0xFF'))),
    'buttonStyle': info['buttonStyle'] ?? 'rounded',
  };
}
```

### 3. **Taxes dynamiques**
L'API supporte `isTaxIncluded` et `taxRate` personnalisés, mais le client utilise un taux fixe de 10%.

**À corriger dans `order.dart`**:
```dart
class Order {
  final double taxRate;
  final bool isTaxIncluded;
  
  double get tax => isTaxIncluded ? 0.0 : subtotal * taxRate;
}
```

---

## 📝 Plan d'Action Prioritaire

### Phase 1: Corrections Critiques (1-2h)
1. ✅ Corriger `api_config.dart` pour ajouter `/api/v1`
2. ✅ Ajouter champs manquants dans `Product` (`isAvailable`)
3. ✅ Ajouter champs manquants dans `Order` (`type`, `note`)
4. ✅ Tester la création de commande avec l'API réelle

### Phase 2: Améliorations (2-3h)
5. ✅ Implémenter le paiement Stripe réel
6. ✅ Appliquer les couleurs de marque du restaurant
7. ✅ Gérer les taxes dynamiques
8. ✅ Ajouter gestion des produits épuisés

### Phase 3: Fonctionnalités Avancées (optionnel)
9. ⚪ Implémenter les réservations
10. ⚪ Ajouter support multi-langue
11. ⚪ Ajouter analytics côté client

---

## 🧪 Tests à Effectuer

### Test 1: Connexion API
```bash
# Démarrer l'API
cd qr-order-api
npm run start:dev

# Tester depuis le client
curl http://localhost:3000/api/v1/restaurants/ea5b4f8c-58e0-46a2-982a-78c7321c0d22
```

### Test 2: Création de commande
1. Scanner un QR code (ou utiliser l'ID hardcodé)
2. Ajouter des produits au panier
3. Valider la commande
4. Vérifier dans la base de données

### Test 3: WebSocket
1. Créer une commande
2. Depuis l'interface owner, changer le statut
3. Vérifier que le client reçoit la mise à jour en temps réel

---

## 📚 Documentation API Utile

### Endpoints Client (CUSTOMER)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/restaurants/:id` | Infos restaurant + menu complet |
| `POST` | `/orders` | Créer une commande |
| `GET` | `/orders/:id` | Suivre une commande |
| `POST` | `/payments/checkout` | Créer session de paiement |

### WebSocket Events
| Event | Direction | Payload |
|-------|-----------|---------|
| `orderStatusUpdated` | Server → Client | `{ orderId, status }` |
| `newOrder` | Server → Owner | `{ order }` |

---

## 🔧 Configuration Recommandée

### Variables d'environnement (à créer)
Créer `.env` dans `qr-order-client/`:
```env
API_BASE_URL=http://localhost:3000/api/v1
STRIPE_PUBLISHABLE_KEY=pk_test_...
ENABLE_RESERVATIONS=false
```

### Mise à jour `pubspec.yaml`
```yaml
dependencies:
  flutter_stripe: ^10.0.0
  flutter_dotenv: ^5.1.0  # Pour les variables d'environnement
```

---

## ✅ Checklist Finale

- [ ] API accessible depuis le client
- [ ] Menu se charge correctement
- [ ] Commande créée avec succès
- [ ] WebSocket reçoit les mises à jour
- [ ] Paiement Stripe fonctionnel
- [ ] Couleurs de marque appliquées
- [ ] Taxes calculées dynamiquement
- [ ] Produits épuisés gérés
- [ ] Tests sur émulateur Android
- [ ] Tests sur appareil physique
- [ ] Tests sur navigateur web

---

**Prochaine étape**: Voulez-vous que je commence par la Phase 1 (corrections critiques) ?
