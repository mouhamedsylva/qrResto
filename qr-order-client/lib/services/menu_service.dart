import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/product.dart';
import '../config/api_config.dart';

class MenuService {
  // Un cache en mémoire pour éviter de recharger à chaque fois
  List<Product> _cachedProducts = [];
  Map<String, dynamic>? _cachedRestaurantInfo;
  List<String> _cachedCategories = [];

  Future<void> _fetchData(String restaurantId) async {
    final response = await http.get(Uri.parse('${ApiConfig.baseUrl}/restaurants/$restaurantId'));
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      
      _cachedRestaurantInfo = {
        'id': data['id'],
        'name': data['name'],
        'description': data['description'],
        'tableCount': data['tables']?.length ?? 0,
        'imageUrl': data['logoUrl'] ?? 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
        ...data,
      };

      _cachedProducts.clear();
      _cachedCategories.clear();
      _cachedCategories.add('Tout');

      final categoriesList = data['categories'] as List<dynamic>? ?? [];
      
      for (var category in categoriesList) {
        final categoryName = category['name'] as String;
        _cachedCategories.add(categoryName);
        
        final itemsList = category['items'] as List<dynamic>? ?? [];
        for (var item in itemsList) {
          _cachedProducts.add(Product.fromJson(item, categoryName));
        }
      }
    } else {
      throw Exception('Erreur de chargement du menu');
    }
  }

  /// Récupère les infos du restaurant depuis son ID
  Future<Map<String, dynamic>> getRestaurantInfo(String restaurantId) async {
    if (_cachedRestaurantInfo == null) {
      await _fetchData(restaurantId);
    }
    return _cachedRestaurantInfo!;
  }

  /// Récupère tous les produits du menu
  Future<List<Product>> getMenu(String restaurantId) async {
    if (_cachedProducts.isEmpty) {
      await _fetchData(restaurantId);
    }
    return _cachedProducts;
  }

  /// Récupère les catégories disponibles
  Future<List<String>> getCategories(String restaurantId) async {
    if (_cachedCategories.isEmpty) {
      await _fetchData(restaurantId);
    }
    return _cachedCategories;
  }
}