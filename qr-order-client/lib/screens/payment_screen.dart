import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';

import '../models/cart_item.dart';
import '../providers/cart_provider.dart';
import '../providers/order_provider.dart';
import '../services/stripe_service.dart';
import '../theme/app_theme.dart';
import 'order_status_screen.dart';

class PaymentScreen extends StatefulWidget {
  final String restaurantId;
  final String tableNumber;
  final List<CartItem> cartItems;
  final double total;

  const PaymentScreen({
    super.key,
    required this.restaurantId,
    required this.tableNumber,
    required this.cartItems,
    required this.total,
  });

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _successController;
  late Animation<double> _scaleAnim;
  late Animation<double> _checkAnim;
  late Animation<double> _fadeAnim;

  bool _isProcessing = false;
  bool _showSuccess = false;

  final String _cardNumber = '•••• •••• •••• 4242';
  bool _saveCard = false;

  @override
  void initState() {
    super.initState();
    _successController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    );

    _scaleAnim = TweenSequence<double>([
      TweenSequenceItem(
          tween: Tween(begin: 0.0, end: 1.1)
              .chain(CurveTween(curve: Curves.easeOutCubic)),
          weight: 70),
      TweenSequenceItem(
          tween: Tween(begin: 1.1, end: 1.0)
              .chain(CurveTween(curve: Curves.elasticOut)),
          weight: 30),
    ]).animate(_successController);

    _checkAnim = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _successController,
        curve: const Interval(0.5, 1.0, curve: Curves.easeOutCubic),
      ),
    );

    _fadeAnim = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _successController,
        curve: const Interval(0.6, 1.0, curve: Curves.easeOutCubic),
      ),
    );
  }

  @override
  void dispose() {
    _successController.dispose();
    super.dispose();
  }

  Future<void> _processPayment() async {
    if (_isProcessing) return;

    setState(() => _isProcessing = true);
    HapticFeedback.mediumImpact();

    try {
      final orderProvider = context.read<OrderProvider>();
      final order = await orderProvider.submitOrder(
        restaurantId: widget.restaurantId,
        tableNumber: widget.tableNumber,
        cartItems: widget.cartItems,
      );

      if (order == null || !mounted) {
        setState(() => _isProcessing = false);
        return;
      }

      final stripeService = context.read<StripeService>();
      final clientSecret = await stripeService.createPaymentIntent(
        amount: widget.total,
        currency: 'eur',
        restaurantId: widget.restaurantId,
        orderId: order.id,
      );

      final result = await stripeService.confirmPayment(
        clientSecret: clientSecret,
        paymentMethod: const PaymentMethodDetails(type: 'card'),
      );

      if (!mounted) return;

      if (result.success) {
        HapticFeedback.heavyImpact();
        context.read<CartProvider>().clearCart();

        setState(() {
          _isProcessing = false;
          _showSuccess = true;
        });

        await _successController.forward();
        await Future.delayed(const Duration(milliseconds: 1500));

        if (!mounted) return;
        _navigateToOrderStatus(order.id);
      } else {
        setState(() => _isProcessing = false);
        _showError(result.errorMessage ?? 'Le paiement a échoué');
      }
    } catch (e) {
      if (!mounted) return;
      setState(() => _isProcessing = false);
      _showError('Une erreur est survenue. Réessayez.');
    }
  }

  void _navigateToOrderStatus(String orderId) {
    Navigator.pushAndRemoveUntil(
      context,
      PageRouteBuilder(
        pageBuilder: (_, animation, __) => OrderStatusScreen(
          orderId: orderId,
          tableNumber: widget.tableNumber,
          restaurantId: widget.restaurantId,
        ),
        transitionsBuilder: (_, animation, __, child) {
          return FadeTransition(
            opacity: CurvedAnimation(parent: animation, curve: Curves.easeOut),
            child: child,
          );
        },
        transitionDuration: AppTheme.mediumAnim,
      ),
      (route) => false,
    );
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message, style: const TextStyle(fontWeight: FontWeight.w600)),
        backgroundColor: AppTheme.error,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: _showSuccess
          ? null
          : AppBar(
              title: const Text('PAIEMENT'),
              leading: IconButton(
                icon: const Icon(Icons.arrow_back_ios_new, size: 18),
                onPressed: _isProcessing ? null : () => Navigator.pop(context),
              ),
            ),
      body: _showSuccess ? _buildSuccessView() : _buildPaymentView(),
    );
  }

  Widget _buildPaymentView() {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.only(bottom: 40),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildOrderSummary(),
          _buildCardSection(),
          _buildOptions(),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
            child: _buildPayButton(),
          ),
          Center(
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.lock_outline_rounded, size: 14, color: AppTheme.textLight),
                const SizedBox(width: 6),
                Text(
                  'SÉCURITÉ SSL 256-BIT · STRIPE GATEWAY',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: AppTheme.textLight,
                    letterSpacing: 1,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOrderSummary() {
    return Container(
      margin: const EdgeInsets.all(20),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: AppTheme.premiumShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'RÉSUMÉ DE LA COMMANDE',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w900,
              color: AppTheme.textSecondary,
              letterSpacing: 1.2,
            ),
          ),
          const SizedBox(height: 20),
          ...widget.cartItems.map((item) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: Row(
                  children: [
                    Text(
                      '${item.quantity}x',
                      style: const TextStyle(
                        fontWeight: FontWeight.w800,
                        fontSize: 13,
                        color: AppTheme.primary,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        item.product.name,
                        style: const TextStyle(fontSize: 14),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    Text(
                      '${item.totalPrice.toStringAsFixed(2)} €',
                      style: const TextStyle(fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              )),
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 16),
            child: Divider(height: 1),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'TOTAL À RÉGLER',
                style: TextStyle(fontWeight: FontWeight.w800),
              ),
              Text(
                '${widget.total.toStringAsFixed(2)} €',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w900,
                  color: AppTheme.primary,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCardSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(24, 8, 24, 16),
          child: Text(
            'MOYEN DE PAIEMENT',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w900,
              color: AppTheme.textSecondary,
              letterSpacing: 1.2,
            ),
          ),
        ),
        Container(
          margin: const EdgeInsets.symmetric(horizontal: 20),
          height: 200,
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF2D2D2D), Color(0xFF121212)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(24),
            boxShadow: AppTheme.floatingShadow,
          ),
          child: Stack(
            children: [
              Positioned(
                top: -50,
                right: -50,
                child: Container(
                  width: 200,
                  height: 200,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.white.withOpacity(0.03),
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Icon(Icons.credit_card_rounded, color: Colors.white70, size: 32),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Text(
                            'DEBIT',
                            style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w800),
                          ),
                        ),
                      ],
                    ),
                    Text(
                      _cardNumber,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        letterSpacing: 4,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('TITULAIRE',
                                style: TextStyle(color: Colors.white38, fontSize: 8, letterSpacing: 1)),
                            Text('CLIENT PREMIUM',
                                style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700)),
                          ],
                        ),
                        Container(
                          width: 45,
                          height: 30,
                          decoration: BoxDecoration(
                            gradient: AppTheme.goldGradient,
                            borderRadius: BorderRadius.circular(6),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        Center(
          child: Opacity(
            opacity: 0.6,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text('Propulsé par ', style: TextStyle(fontSize: 10)),
                Text(
                  'stripe',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w900,
                    color: const Color(0xFF635BFF),
                    letterSpacing: -0.5,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildOptions() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: AppTheme.premiumShadow,
        ),
        child: SwitchListTile(
          value: _saveCard,
          onChanged: (v) => setState(() => _saveCard = v),
          title: const Text('Mémoriser ma carte', style: TextStyle(fontWeight: FontWeight.w600)),
          subtitle: const Text('Pour un paiement plus rapide la prochaine fois', style: TextStyle(fontSize: 12)),
          activeColor: AppTheme.primary,
        ),
      ),
    );
  }

  Widget _buildPayButton() {
    return Container(
      height: 64,
      decoration: BoxDecoration(
        gradient: _isProcessing ? null : AppTheme.primaryGradient,
        color: _isProcessing ? AppTheme.divider : null,
        borderRadius: BorderRadius.circular(20),
        boxShadow: _isProcessing ? null : AppTheme.floatingShadow,
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: _isProcessing ? null : _processPayment,
          borderRadius: BorderRadius.circular(20),
          child: Center(
            child: _isProcessing
                ? const SizedBox(
                    width: 24,
                    height: 24,
                    child: CircularProgressIndicator(strokeWidth: 3, color: AppTheme.primary),
                  )
                : Text(
                    'PAYER ${widget.total.toStringAsFixed(2)} €',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1.2,
                    ),
                  ),
          ),
        ),
      ),
    );
  }

  Widget _buildSuccessView() {
    return Container(
      width: double.infinity,
      color: Colors.white,
      child: SafeArea(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            AnimatedBuilder(
              animation: _successController,
              builder: (_, __) => Transform.scale(
                scale: _scaleAnim.value,
                child: Container(
                  width: 140,
                  height: 140,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: AppTheme.primaryGradient,
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.primary.withOpacity(0.2),
                        blurRadius: 40,
                        spreadRadius: 10,
                      ),
                    ],
                  ),
                  child: Opacity(
                    opacity: _checkAnim.value,
                    child: const Icon(Icons.check_rounded, color: Colors.white, size: 80),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 48),
            AnimatedBuilder(
              animation: _fadeAnim,
              builder: (_, __) => Opacity(
                opacity: _fadeAnim.value,
                child: Column(
                  children: [
                    Text(
                      'Paiement Réussi',
                      style: Theme.of(context).textTheme.displaySmall?.copyWith(fontWeight: FontWeight.w800),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Votre commande a été envoyée en cuisine',
                      style: TextStyle(color: AppTheme.textSecondary, fontSize: 16),
                    ),
                    const SizedBox(height: 32),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                      decoration: BoxDecoration(
                        color: AppTheme.surfaceVariant,
                        borderRadius: BorderRadius.circular(30),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.table_restaurant_rounded, color: AppTheme.primary, size: 18),
                          const SizedBox(width: 10),
                          Text(
                            'TABLE ${widget.tableNumber}',
                            style: const TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}