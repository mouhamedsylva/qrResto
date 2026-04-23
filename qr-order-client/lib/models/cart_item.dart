import 'product.dart';

class CartItem {
  final Product product;
  int quantity;
  final String? specialInstructions;

  CartItem({
    required this.product,
    this.quantity = 1,
    this.specialInstructions,
  });

  double get totalPrice => product.price * quantity;

  CartItem copyWith({int? quantity, String? specialInstructions}) {
    return CartItem(
      product: product,
      quantity: quantity ?? this.quantity,
      specialInstructions: specialInstructions ?? this.specialInstructions,
    );
  }
}