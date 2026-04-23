import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart'; // Pour kDebugMode
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';

import 'providers/cart_provider.dart';
import 'providers/order_provider.dart';
import 'services/menu_service.dart';
import 'services/order_service.dart';
import 'services/stripe_service.dart';
import 'screens/menu_screen.dart'; // Import MenuScreen
import 'theme/app_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Orientation portrait uniquement
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // Style de la barre de statut système
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );

  runApp(const QROrderApp());
}

class QROrderApp extends StatelessWidget {
  const QROrderApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        // Services (singletons)
        Provider<MenuService>(create: (_) => MenuService()),
        Provider<OrderService>(create: (_) => OrderService()),
        Provider<StripeService>(create: (_) => StripeService()),

        // Providers avec état
        ChangeNotifierProvider<CartProvider>(create: (_) => CartProvider()),
        ChangeNotifierProxyProvider<OrderService, OrderProvider>(
          create: (ctx) => OrderProvider(ctx.read<OrderService>()),
          update: (_, orderService, previous) =>
              previous ?? OrderProvider(orderService),
        ),
      ],
      child: MaterialApp(
        title: 'QR Order - Client',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.theme,
        // Bypass de la vérification pour afficher directement les pages
        home: const MenuScreen(
          // Identifiants par défaut pour la visualisation directe
          restaurantId: 'ea5b4f8c-58e0-46a2-982a-78c7321c0d22',
          tableNumber: '33a2819a-f50f-47e0-a406-428b57c7b20c',
        ),
        /* 
        onGenerateRoute: (settings) {
          // ... (code de vérification mis en commentaire)
        },
        */
      ),
    );
  }
}
