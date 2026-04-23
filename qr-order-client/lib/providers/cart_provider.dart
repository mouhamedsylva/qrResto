import 'package:flutter/foundation.dart';
import '../models/product.dart';
import '../models/cart_item.dart';

class CartProvider extends ChangeNotifier {
  final Map<String, CartItem> _items = {};

  // ─── Getters ──────────────────────────────────────────────────────────────────

  List<CartItem> get items => List.unmodifiable(_items.values.toList());

  int get itemCount => _items.values.fold(0, (sum, item) => sum + item.quantity);

  bool get isEmpty => _items.isEmpty;

  double get subtotal =>
      _items.values.fold(0.0, (sum, item) => sum + item.totalPrice);

  double get tax => subtotal * 0.10;

  double get total => subtotal + tax;

  int getQuantity(String productId) => _items[productId]?.quantity ?? 0;

  bool contains(String productId) => _items.containsKey(productId);

  // ─── Actions ──────────────────────────────────────────────────────────────────

  /// Ajoute un produit ou incrémente sa quantité
  void addProduct(Product product) {
    if (_items.containsKey(product.id)) {
      _items[product.id]!.quantity++;
    } else {
      _items[product.id] = CartItem(product: product);
    }
    notifyListeners();
  }

  /// Décrémente la quantité ou supprime si elle atteint 0
  void removeProduct(String productId) {
    if (!_items.containsKey(productId)) return;

    if (_items[productId]!.quantity > 1) {
      _items[productId]!.quantity--;
    } else {
      _items.remove(productId);
    }
    notifyListeners();
  }

  /// Supprime complètement un article du panier
  void deleteItem(String productId) {
    _items.remove(productId);
    notifyListeners();
  }

  /// Définit directement la quantité d'un produit
  void setQuantity(Product product, int quantity) {
    if (quantity <= 0) {
      _items.remove(product.id);
    } else {
      if (_items.containsKey(product.id)) {
        _items[product.id]!.quantity = quantity;
      } else {
        _items[product.id] = CartItem(product: product, quantity: quantity);
      }
    }
    notifyListeners();
  }

  /// Vide entièrement le panier
  void clearCart() {
    _items.clear();
    notifyListeners();
  }
}