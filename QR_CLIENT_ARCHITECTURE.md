# 🏗️ Architecture qr-order-client

## 📊 Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                    qr-order-client (Flutter)                 │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │  Screens   │  │ Providers  │  │  Services  │           │
│  │            │  │            │  │            │           │
│  │ • Menu     │  │ • Cart     │  │ • Menu     │           │
│  │ • Cart     │  │ • Order    │  │ • Order    │           │
│  │ • Payment  │  │            │  │ • Restaurant│          │
│  │ • Status   │  │            │  │ • Stripe   │           │
│  └────────────┘  └────────────┘  └────────────┘           │
│         │              │                │                   │
│         └──────────────┴────────────────┘                   │
│                        │                                     │
│                   ┌────▼────┐                               │
│                   │ Models  │                               │
│                   │         │                               │
│                   │ • Product                               │
│                   │ • Order                                 │
│                   │ • CartItem                              │
│                   └─────────┘                               │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ HTTP + WebSocket
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                  qr-order-api (NestJS)                       │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │ Restaurants│  │   Orders   │  │  Payments  │           │
│  │ Controller │  │ Controller │  │ Controller │           │
│  └────────────┘  └────────────┘  └────────────┘           │
│         │              │                │                   │
│         └──────────────┴────────────────┘                   │
│                        │                                     │
│                   ┌────▼────┐                               │
│                   │PostgreSQL│                              │
│                   └─────────┘                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flux de Données

### 1. Chargement du Menu

```
┌─────────┐     GET /restaurants/:id     ┌─────────┐
│  Menu   │ ──────────────────────────> │   API   │
│ Screen  │                              │         │
└─────────┘                              └─────────┘
     │                                        │
     │                                        │ Query DB
     │                                        ▼
     │                                   ┌─────────┐
     │    JSON (restaurant + menu)      │   DB    │
     │ <────────────────────────────── │         │
     │                                   └─────────┘
     ▼
┌─────────┐
│  Menu   │
│ Service │ ──> Parse JSON ──> Product Models
└─────────┘
     │
     ▼
┌─────────┐
│  Cart   │
│Provider │ ──> Display in UI
└─────────┘
```

### 2. Création de Commande

```
┌─────────┐                              ┌─────────┐
│  Cart   │     POST /orders             │   API   │
│ Screen  │ ──────────────────────────> │         │
└─────────┘                              └─────────┘
     │                                        │
     │  {                                     │ Create Order
     │    restaurantId,                       │ in DB
     │    tableId,                            ▼
     │    type: "DINE_IN",              ┌─────────┐
     │    items: [...]                  │   DB    │
     │  }                               │         │
     │                                   └─────────┘
     │                                        │
     │    JSON (order created)               │
     │ <──────────────────────────────────── │
     ▼
┌─────────┐
│  Order  │
│ Service │ ──> Parse JSON ──> Order Model
└─────────┘
     │
     ▼
┌─────────┐
│ Status  │
│ Screen  │ ──> Display order tracking
└─────────┘
```

### 3. Mises à Jour Temps Réel (WebSocket)

```
┌─────────┐                              ┌─────────┐
│ Status  │     WebSocket Connect        │   API   │
│ Screen  │ <──────────────────────────> │         │
└─────────┘                              └─────────┘
     │                                        │
     │                                        │
     │  Event: orderStatusUpdated            │
     │  { orderId, status: "PREPARING" }     │
     │ <──────────────────────────────────── │
     │                                        │
     ▼                                        │
┌─────────┐                                  │
│  Order  │                                  │
│Provider │ ──> Update UI                    │
└─────────┘                                  │
     │                                        │
     │  Event: orderStatusUpdated            │
     │  { orderId, status: "READY" }         │
     │ <──────────────────────────────────── │
     │                                        │
     ▼                                        │
┌─────────┐                                  │
│   UI    │ ──> Show "Prêt !" notification  │
└─────────┘                                  │
```

---

## 📦 Structure des Modèles

### Product Model

```dart
class Product {
  // Identifiants
  final String id;
  final String name;
  final String category;
  
  // Informations
  final String description;
  final double price;
  final String imageUrl;
  
  // Métadonnées
  final bool isPopular;
  final List<String> tags;
  
  // ✅ Nouveaux champs (Phase 1)
  final bool isAvailable;        // Rupture de stock
  final List<String> allergens;  // Allergènes
  final int? preparationTime;    // Temps de préparation
}
```

### Order Model

```dart
class Order {
  // Identifiants
  final String id;
  final String restaurantId;
  final String? tableNumber;
  
  // Contenu
  final List<OrderItem> items;
  final double total;
  
  // Statut
  OrderStatus status;  // PENDING, PREPARING, READY, COMPLETED
  final DateTime createdAt;
  
  // ✅ Nouveaux champs (Phase 1)
  final String? type;          // DINE_IN / TAKE_AWAY
  final String? customerName;  // Nom du client
  final String? note;          // Instructions
  final double taxRate;        // Taux de taxe
  final bool isTaxIncluded;    // Taxe incluse
  
  // Calculs
  double get subtotal => items.fold(0.0, (sum, item) => sum + item.totalPrice);
  double get tax => isTaxIncluded ? 0.0 : subtotal * taxRate;
}
```

---

## 🔌 Services

### MenuService

```dart
class MenuService {
  // Cache
  List<Product> _cachedProducts = [];
  Map<String, dynamic>? _cachedRestaurantInfo;
  List<String> _cachedCategories = [];
  
  // Méthodes
  Future<Map<String, dynamic>> getRestaurantInfo(String restaurantId);
  Future<List<Product>> getMenu(String restaurantId);
  Future<List<String>> getCategories(String restaurantId);
}
```

**Endpoint utilisé**: `GET /api/v1/restaurants/:id`

### OrderService

```dart
class OrderService {
  // WebSocket
  IO.Socket? _socket;
  Map<String, StreamController<OrderStatus>> _statusControllers = {};
  
  // Méthodes
  Future<Order> createOrder({
    required String restaurantId,
    required String tableNumber,
    required List<CartItem> cartItems,
    String type = 'DINE_IN',
    String? customerName,
    String? note,
  });
  
  Stream<OrderStatus> watchOrderStatus(String orderId);
  Future<Order?> getOrder(String orderId);
  Future<bool> cancelOrder(String orderId);
}
```

**Endpoints utilisés**:
- `POST /api/v1/orders`
- `GET /api/v1/orders/:id`
- `PUT /api/v1/orders/:id/status`
- WebSocket: `ws://localhost:3000`

### RestaurantService ⭐ Nouveau

```dart
class RestaurantService {
  // Cache
  RestaurantTheme? _cachedTheme;
  Map<String, dynamic>? _cachedInfo;
  
  // Méthodes
  Future<Map<String, dynamic>> getRestaurantInfo(String restaurantId);
  Future<RestaurantTheme> getRestaurantTheme(String restaurantId);
  void clearCache();
}

class RestaurantTheme {
  final Color primaryColor;
  final Color secondaryColor;
  final String buttonStyle;
  final String currency;
  final String language;
  final bool isTaxIncluded;
  final double taxRate;
}
```

**Endpoint utilisé**: `GET /api/v1/restaurants/:id`

---

## 🎨 Providers (State Management)

### CartProvider

```dart
class CartProvider extends ChangeNotifier {
  List<CartItem> _items = [];
  
  // Getters
  List<CartItem> get items => _items;
  int get itemCount => _items.length;
  double get total => _items.fold(0.0, (sum, item) => sum + item.totalPrice);
  
  // Actions
  void addItem(Product product);
  void removeItem(String productId);
  void updateQuantity(String productId, int quantity);
  void clear();
}
```

### OrderProvider

```dart
class OrderProvider extends ChangeNotifier {
  Order? _currentOrder;
  OrderStatus? _currentStatus;
  
  // Getters
  Order? get currentOrder => _currentOrder;
  OrderStatus? get currentStatus => _currentStatus;
  
  // Actions
  Future<void> createOrder(CreateOrderDto dto);
  void watchOrderStatus(String orderId);
  void updateStatus(OrderStatus newStatus);
}
```

---

## 🔐 Configuration API

### ApiConfig

```dart
class ApiConfig {
  static const String apiVersion = '/api/v1';
  
  // HTTP Endpoints
  static String get baseUrl {
    if (kIsWeb) {
      return 'http://localhost:3000$apiVersion';
    } else if (kDebugMode) {
      return 'http://10.0.2.2:3000$apiVersion';  // Émulateur Android
    } else {
      return 'http://10.0.2.2:3000$apiVersion';  // Production
    }
  }
  
  // WebSocket (sans /api/v1)
  static String get socketUrl {
    if (kIsWeb) {
      return 'http://localhost:3000';
    } else if (kDebugMode) {
      return 'http://10.0.2.2:3000';
    } else {
      return 'http://10.0.2.2:3000';
    }
  }
  
  // Stripe
  static const String stripePublishableKey = 'pk_test_stripe_key';
}
```

---

## 🎯 Flux Utilisateur Complet

```
1. Scanner QR Code
   │
   ├─> Extraire restaurantId + tableId
   │
   ▼
2. Charger Menu
   │
   ├─> GET /restaurants/:id
   ├─> Parser catégories et produits
   ├─> Afficher dans MenuScreen
   │
   ▼
3. Ajouter au Panier
   │
   ├─> CartProvider.addItem(product)
   ├─> Calculer total + taxes
   ├─> Afficher badge panier
   │
   ▼
4. Valider Commande
   │
   ├─> POST /orders
   ├─> Créer Order dans DB
   ├─> Retourner orderId
   │
   ▼
5. Paiement (simulé)
   │
   ├─> PaymentScreen
   ├─> Animation de succès
   │
   ▼
6. Suivi Temps Réel
   │
   ├─> WebSocket.connect()
   ├─> Écouter orderStatusUpdated
   │
   ├─> Status: PENDING
   │   └─> Afficher "En attente"
   │
   ├─> Status: PREPARING
   │   └─> Afficher "En préparation"
   │
   ├─> Status: READY
   │   └─> Afficher "Prêt !" + notification
   │
   └─> Status: COMPLETED
       └─> Retour au menu
```

---

## 📊 Diagramme de Séquence

### Création de Commande

```
Client          CartProvider    OrderService         API            DB
  │                  │               │                │              │
  │ Add to cart      │               │                │              │
  ├─────────────────>│               │                │              │
  │                  │               │                │              │
  │ Checkout         │               │                │              │
  ├─────────────────>│               │                │              │
  │                  │               │                │              │
  │                  │ createOrder() │                │              │
  │                  ├──────────────>│                │              │
  │                  │               │ POST /orders   │              │
  │                  │               ├───────────────>│              │
  │                  │               │                │ INSERT       │
  │                  │               │                ├─────────────>│
  │                  │               │                │              │
  │                  │               │                │ Order created│
  │                  │               │                │<─────────────┤
  │                  │               │ Order JSON     │              │
  │                  │               │<───────────────┤              │
  │                  │ Order object  │                │              │
  │                  │<──────────────┤                │              │
  │ Navigate to      │               │                │              │
  │ StatusScreen     │               │                │              │
  │<─────────────────┤               │                │              │
  │                  │               │                │              │
  │                  │               │ WebSocket      │              │
  │                  │               │ Connect        │              │
  │                  │               ├───────────────>│              │
  │                  │               │                │              │
  │                  │               │ Status updates │              │
  │                  │               │<───────────────┤              │
  │ Update UI        │               │                │              │
  │<─────────────────┴───────────────┤                │              │
```

---

## 🔄 Cycle de Vie d'une Commande

```
┌──────────┐
│ PENDING  │ ──> Commande créée, en attente de validation
└────┬─────┘
     │
     │ Owner/Staff valide
     ▼
┌──────────┐
│PREPARING │ ──> Cuisine en cours de préparation
└────┬─────┘
     │
     │ Plat terminé
     ▼
┌──────────┐
│  READY   │ ──> Commande prête à être servie
└────┬─────┘
     │
     │ Client servi
     ▼
┌──────────┐
│COMPLETED │ ──> Commande terminée
└──────────┘

     OU

┌──────────┐
│CANCELLED │ ──> Commande annulée
└──────────┘
```

---

## 🎨 Architecture UI

```
MaterialApp
│
├─> MultiProvider
│   ├─> MenuService
│   ├─> OrderService
│   ├─> RestaurantService
│   ├─> StripeService
│   ├─> CartProvider
│   └─> OrderProvider
│
└─> MenuScreen (home)
    │
    ├─> AppBar
    │   ├─> Restaurant name
    │   └─> Cart badge
    │
    ├─> Categories (horizontal scroll)
    │   └─> Category chips
    │
    ├─> Products (grid/list)
    │   └─> ProductCard
    │       ├─> Image
    │       ├─> Name + Price
    │       ├─> Tags (Popular, Épuisé, etc.)
    │       └─> Add to cart button
    │
    └─> FloatingActionButton (Cart)
        │
        └─> CartScreen
            │
            ├─> CartItem list
            │   └─> Dismissible
            │       ├─> Product info
            │       ├─> Quantity controls
            │       └─> Swipe to delete
            │
            ├─> Total + Taxes
            │
            └─> Checkout button
                │
                └─> PaymentScreen
                    │
                    └─> OrderStatusScreen
                        │
                        ├─> Order info
                        ├─> Status indicator
                        ├─> Progress bar
                        └─> Real-time updates
```

---

## ✅ Points Clés de l'Architecture

### 1. Séparation des Responsabilités
- **Screens**: UI uniquement
- **Providers**: État de l'application
- **Services**: Logique métier et API
- **Models**: Structures de données

### 2. Gestion d'État
- **Provider** pour la réactivité
- **ChangeNotifier** pour les mises à jour
- **StreamController** pour le temps réel

### 3. Communication API
- **HTTP** pour les requêtes REST
- **WebSocket** pour le temps réel
- **Cache** pour les performances

### 4. Robustesse
- Gestion des erreurs
- Parsing JSON sécurisé
- Validation des données
- Fallbacks par défaut

---

**Architecture alignée à 90% avec l'API qr-order-api** ✅
