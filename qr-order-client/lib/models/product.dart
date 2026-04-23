class Product {
  final String id;
  final String name;
  final String description;
  final double price;
  final String imageUrl;
  final String category;
  final double rating;
  final int reviewCount;
  final bool isPopular;
  final List<String> tags;
  final bool isActive;
  final List<String> allergens;
  final int? preparationTime;

  const Product({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.imageUrl,
    required this.category,
    this.rating = 4.5,
    this.reviewCount = 0,
    this.isPopular = false,
    this.tags = const [],
    this.isActive = true,
    this.allergens = const [],
    this.preparationTime,
  });

  factory Product.fromJson(Map<String, dynamic> json, String categoryName) {
    // Parser le prix (souvent renvoyé comme string ou num en SQL/TypeORM)
    final double parsedPrice = json['price'] != null
        ? double.tryParse(json['price'].toString()) ?? 0.0
        : 0.0;

    // Constuire les tags à partir des bagdes/allergens
    List<String> parsedTags = [];
    if (json['badgeLabel'] != null && json['badgeLabel'].toString().isNotEmpty) {
      parsedTags.add(json['badgeLabel']);
    }
    if (json['isDishOfDay'] == true) {
      parsedTags.add('Plat du jour');
    }
    if (json['dietaryLabels'] != null && json['dietaryLabels'] is List) {
      parsedTags.addAll(List<String>.from(json['dietaryLabels']));
    }

    // Parser les allergènes
    List<String> parsedAllergens = [];
    if (json['allergens'] != null && json['allergens'] is List) {
      parsedAllergens = List<String>.from(json['allergens']);
    }

    // Parser l'imageUrl avec fallback
    String imageUrl = json['imageUrl'] ?? '';
    
    // Si l'imageUrl est vide ou null, utiliser une image par défaut basée sur la catégorie
    if (imageUrl.isEmpty) {
      // Images par défaut selon la catégorie
      switch (categoryName.toLowerCase()) {
        case 'entrées':
        case 'entrees':
          imageUrl = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80';
          break;
        case 'plats':
        case 'plat':
          imageUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80';
          break;
        case 'desserts':
        case 'dessert':
          imageUrl = 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80';
          break;
        case 'boissons':
        case 'boisson':
          imageUrl = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80';
          break;
        default:
          imageUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80';
      }
      print('⚠️  Produit "${json['name']}" sans image, utilisation de l\'image par défaut pour $categoryName');
    } else {
      print('✅ Produit "${json['name']}" avec image: $imageUrl');
    }

    return Product(
      id: json['id'],
      name: json['name'] ?? 'Inconnu',
      description: json['description'] ?? '',
      price: parsedPrice,
      imageUrl: imageUrl,
      category: categoryName,
      isPopular: (json['ordersCount'] ?? 0) > 10,
      tags: parsedTags,
      isActive: json['isActive'] ?? true,
      allergens: parsedAllergens,
      preparationTime: json['preparationTime'],
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) || other is Product && other.id == id;

  @override
  int get hashCode => id.hashCode;
}