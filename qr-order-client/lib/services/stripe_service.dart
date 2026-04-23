import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';

class StripeService {
  bool _isInitialized = false;

  /// Initialise Stripe (en fait le vrai SDK le fait, ici on prépare juste)
  Future<void> initialize({required String publishableKey}) async {
    // Si flutter_stripe était utilisé, on ferait Stripe.publishableKey = publishableKey;
    _isInitialized = true;
  }

  /// Appelle l'API backend pour créer le PaymentIntent
  Future<String> createPaymentIntent({
    required double amount,
    required String currency,
    required String restaurantId,
    required String orderId,
  }) async {
    if (!_isInitialized) {
      await initialize(publishableKey: ApiConfig.stripePublishableKey);
    }

    final response = await http.post(
      Uri.parse('${ApiConfig.baseUrl}/payments/intent'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'amount': amount,
        'currency': currency,
        'restaurantId': restaurantId,
        'orderId': orderId,
      }),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      final data = jsonDecode(response.body);
      return data['clientSecret'] ?? '';
    } else {
      throw Exception('Erreur de création du PaymentIntent: ${response.body}');
    }
  }

  /// Simule la confirmation du paiement (car on n'a pas flutter_stripe configuré coté natif)
  Future<PaymentResult> confirmPayment({
    required String clientSecret,
    required PaymentMethodDetails paymentMethod,
  }) async {
    await Future.delayed(const Duration(milliseconds: 1800));

    // Simulation: Normalement avec flutter_stripe on appelle `Stripe.instance.confirmPayment`
    // Puis on utilise le webhook coté backend pour marquer l'order PENDING -> PAID
    // Ici, pour la démo sans SDK Stripe réel, on va juste valider. Coté serveur le webhook est nécessaire,
    // ou bien on expose un endpoint (mock) pour passer en POST /payments/confirm.
    
    // Pour simuler la confirmation on fait un check simple :
    return PaymentResult(
      success: true,
      paymentIntentId: clientSecret.split('_secret_').first,
      status: 'succeeded',
    );
  }

  String _randomId(int length) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    final buffer = StringBuffer();
    for (int i = 0; i < length; i++) {
      buffer.write(chars[DateTime.now().microsecond % chars.length]);
    }
    return buffer.toString();
  }
}

class PaymentMethodDetails {
  final String type; // 'card'
  final CardDetails? card;

  const PaymentMethodDetails({
    required this.type,
    this.card,
  });
}

class CardDetails {
  final String number;
  final String expiryDate;
  final String cvc;

  const CardDetails({
    required this.number,
    required this.expiryDate,
    required this.cvc,
  });
}

class PaymentResult {
  final bool success;
  final String paymentIntentId;
  final String status;
  final String? errorMessage;

  const PaymentResult({
    required this.success,
    required this.paymentIntentId,
    required this.status,
    this.errorMessage,
  });
}