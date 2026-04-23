# 🎨 ADAPTATION DU BACKEND POUR SETTINGS.TSX

**Date**: 17 avril 2026  
**Statut**: ✅ COMPLÉTÉ ET TESTÉ

---

## 📋 RÉSUMÉ

Adaptation complète du backend pour supporter toutes les fonctionnalités de la page **Settings.tsx** du frontend. Cette page permet aux propriétaires de restaurants de configurer :
- ✅ Informations générales du restaurant
- ✅ Permissions de l'équipe (Manager/Staff)
- ✅ Configuration du service
- ✅ Personnalisation du design
- ✅ Paramètres de paiement

---

## 🎯 FONCTIONNALITÉS IMPLÉMENTÉES

### 1. **Onglet Général** (Profil du Restaurant)
| Fonctionnalité | Statut | Champ Backend |
|---------------|--------|---------------|
| Nom du restaurant | ✅ | `restaurant.name` |
| Description | ✅ | `restaurant.description` |
| Adresse complète | ✅ | `restaurant.address` |
| Numéro de téléphone | ✅ | `restaurant.phoneNumber` |
| Email public | ✅ | `restaurant.email` |
| Logo du restaurant | ⚠️ À implémenter | `restaurant.logoUrl` |

### 2. **Onglet Permissions** (Équipe)
**Permissions Manager:**
| Permission | Statut | Champ Backend |
|-----------|--------|---------------|
| Voir les statistiques | ✅ | `settings.managerCanSeeStats` |
| Modifier le menu | ✅ | `settings.managerCanEditMenu` |
| Gérer les commandes | ✅ | `settings.managerCanManageOrders` |
| Gérer le personnel | ✅ | `settings.managerCanManageStaff` |

**Permissions Staff:**
| Permission | Statut | Champ Backend |
|-----------|--------|---------------|
| Modifier le menu | ✅ | `settings.staffCanEditMenu` |
| Gérer les commandes | ✅ | `settings.staffCanManageOrders` |

### 3. **Onglet Service**
| Fonctionnalité | Statut | Champ Backend |
|---------------|--------|---------------|
| Restaurant ouvert/fermé | ✅ | `settings.isOrderingEnabled` |
| Temps de préparation moyen | ✅ | `settings.prepTime` (5-60 min) |
| Langue par défaut | ✅ | `settings.language` (fr/en/es) |
| Horaires d'ouverture | ⚠️ À implémenter | Table séparée recommandée |

### 4. **Onglet Design**
| Fonctionnalité | Statut | Champ Backend |
|---------------|--------|---------------|
| Couleur principale | ✅ | `settings.primaryColor` (hex) |
| Couleur de fond | ✅ | `settings.secondaryColor` (hex) |
| Style des boutons | ✅ | `settings.buttonStyle` (rounded/square/pill) |

### 5. **Onglet Paiements**
| Fonctionnalité | Statut | Champ Backend |
|---------------|--------|---------------|
| Taux de TVA | ✅ | `settings.taxRate` (0-100%) |
| Paiement en espèces | ✅ | `settings.paymentCash` |
| Paiement par carte | ✅ | `settings.paymentCard` |
| Paiement en ligne Stripe | ✅ | `settings.paymentOnline` |

---

## 🗄️ MODIFICATIONS DE LA BASE DE DONNÉES

### Table `restaurants`
**Nouveaux champs ajoutés:**
```sql
description    TEXT NULL                -- Description du restaurant
email          VARCHAR(255) NULL        -- Email public de contact
```

**Champs existants avec types explicites:**
```sql
name           VARCHAR(255) NOT NULL
address        VARCHAR(255) NULL
phoneNumber    VARCHAR(255) NULL
logoUrl        VARCHAR(255) NULL
isActive       BOOLEAN DEFAULT TRUE
```

### Table `restaurant_settings`
**Nouveaux champs ajoutés:**
```sql
buttonStyle     VARCHAR(255) DEFAULT 'rounded'  -- Style des boutons (rounded/square/pill)
prepTime        INT DEFAULT 20                  -- Temps de préparation moyen (minutes)
paymentCash     BOOLEAN DEFAULT TRUE            -- Accepte espèces
paymentCard     BOOLEAN DEFAULT TRUE            -- Accepte carte bancaire
paymentOnline   BOOLEAN DEFAULT FALSE           -- Accepte paiement en ligne (Stripe)
```

**Champs existants:**
```sql
primaryColor              VARCHAR(255) DEFAULT '#FF0000'
secondaryColor            VARCHAR(255) DEFAULT '#FFFFFF'
currency                  VARCHAR(255) DEFAULT 'EUR'
language                  VARCHAR(255) DEFAULT 'fr'
isOrderingEnabled         BOOLEAN DEFAULT TRUE
isTaxIncluded             BOOLEAN DEFAULT FALSE
taxRate                   DECIMAL(5,2) DEFAULT 0
staffCanEditMenu          BOOLEAN DEFAULT TRUE
staffCanManageOrders      BOOLEAN DEFAULT TRUE
managerCanEditMenu        BOOLEAN DEFAULT TRUE
managerCanManageOrders    BOOLEAN DEFAULT TRUE
managerCanSeeStats        BOOLEAN DEFAULT TRUE
managerCanManageStaff     BOOLEAN DEFAULT FALSE
```

**Migration exécutée:** ✅ `1776425660040-AddSettingsAndRestaurantFields.ts`

---

## 🔌 ENDPOINTS API

### 1. **GET /restaurants/:id/complete** 🆕
**Description:** Récupère le restaurant avec tous ses paramètres en une seule requête optimisée.

**Authentification:** Bearer Token (Owner/Manager)

**Réponse (200 OK):**
```json
{
  "restaurant": {
    "id": "e4ae2462-dbd2-4747-b89b-5304b6b14d8c",
    "name": "Mon Restaurant",
    "description": "Le meilleur restaurant de la ville avec des produits frais.",
    "address": "123 Rue de la Gastronomie, Paris",
    "phoneNumber": "01 23 45 67 89",
    "email": "contact@monrestaurant.fr",
    "logoUrl": "https://example.com/logo.png",
    "isActive": true
  },
  "settings": {
    "primaryColor": "#D94A6A",
    "secondaryColor": "#FFFFFF",
    "buttonStyle": "rounded",
    "currency": "EUR",
    "language": "fr",
    "isOrderingEnabled": true,
    "isTaxIncluded": false,
    "taxRate": 10,
    "prepTime": 20,
    "paymentMethods": {
      "cash": true,
      "card": true,
      "online": false
    },
    "permissions": {
      "managerCanSeeStats": true,
      "managerCanEditMenu": true,
      "managerCanManageOrders": true,
      "managerCanManageStaff": false,
      "staffCanEditMenu": false,
      "staffCanManageOrders": true
    }
  }
}
```

### 2. **PUT /restaurants/:id**
**Description:** Met à jour les informations générales du restaurant.

**Authentification:** Bearer Token (Owner/Super Admin)

**Body:**
```json
{
  "name": "Nouveau nom",
  "description": "Nouvelle description",
  "address": "Nouvelle adresse",
  "phoneNumber": "01 23 45 67 89",
  "email": "nouveau@email.fr",
  "logoUrl": "https://example.com/new-logo.png"
}
```

**Réponse (200 OK):** Restaurant mis à jour avec relations

### 3. **PUT /restaurants/:id/settings**
**Description:** Met à jour les paramètres du restaurant.

**Authentification:** Bearer Token (Owner)

**Body:**
```json
{
  "primaryColor": "#FF0000",
  "secondaryColor": "#FFFFFF",
  "buttonStyle": "pill",
  "currency": "EUR",
  "language": "fr",
  "isOrderingEnabled": true,
  "isTaxIncluded": false,
  "taxRate": 10,
  "prepTime": 25,
  "paymentCash": true,
  "paymentCard": true,
  "paymentOnline": false,
  "managerCanSeeStats": true,
  "managerCanEditMenu": true,
  "managerCanManageOrders": true,
  "managerCanManageStaff": false,
  "staffCanEditMenu": false,
  "staffCanManageOrders": true
}
```

**Réponse (200 OK):** Settings mis à jour

### 4. **GET /restaurants/:id/settings**
**Description:** Récupère uniquement les paramètres du restaurant.

**Authentification:** Bearer Token (Owner/Manager)

**Réponse (200 OK):** Objet RestaurantSettings

---

## 📝 FICHIERS MODIFIÉS

### Entités
- ✅ `qr-order-api/src/modules/restaurants/entities/restaurant.entity.ts`
  - Ajout `description: string | null`
  - Ajout `email: string | null`
  - Types explicites pour tous les champs nullable

- ✅ `qr-order-api/src/modules/restaurants/entities/restaurant-settings.entity.ts`
  - Ajout `buttonStyle: string` (default: 'rounded')
  - Ajout `prepTime: number` (default: 20)
  - Ajout `paymentCash: boolean` (default: true)
  - Ajout `paymentCard: boolean` (default: true)
  - Ajout `paymentOnline: boolean` (default: false)

### DTOs
- ✅ `qr-order-api/src/modules/restaurants/dto/create-restaurant.dto.ts`
  - Ajout `description?: string` avec validation
  - Ajout `email?: string` avec validation @IsEmail

- ✅ `qr-order-api/src/modules/restaurants/dto/update-restaurant.dto.ts`
  - Hérite de `PartialType(CreateRestaurantDto)`

- ✅ `qr-order-api/src/modules/restaurants/dto/update-settings.dto.ts`
  - Ajout `buttonStyle?: string`
  - Ajout `prepTime?: number` avec validation @Min(5) @Max(60)
  - Ajout `paymentCash?: boolean`
  - Ajout `paymentCard?: boolean`
  - Ajout `paymentOnline?: boolean`

### Services & Contrôleurs
- ✅ `qr-order-api/src/modules/restaurants/restaurants.service.ts`
  - Nouvelle méthode `getRestaurantWithSettings(restaurantId)` pour endpoint `/complete`
  - Méthode `updateSettings()` mise à jour pour gérer les nouveaux champs
  - Méthode `getSettings()` crée automatiquement les settings si inexistants

- ✅ `qr-order-api/src/modules/restaurants/restaurants.controller.ts`
  - Nouveau endpoint `GET /:id/complete` avec guards Owner/Manager
  - Endpoints existants maintenus pour compatibilité

### Migrations
- ✅ `qr-order-api/src/database/migrations/1776425660040-AddSettingsAndRestaurantFields.ts`
  - Ajout colonnes `description` et `email` dans `restaurants`
  - Ajout colonnes `buttonStyle`, `prepTime`, `paymentCash`, `paymentCard`, `paymentOnline` dans `restaurant_settings`
  - Mise à jour des types nullable pour tous les champs concernés

---

## ✅ TESTS EFFECTUÉS

| Test | Résultat | Détails |
|------|----------|---------|
| Migration exécutée | ✅ | `AddSettingsAndRestaurantFields1776425660040` |
| Build backend | ✅ | `npm run build` - 0 erreurs |
| Types TypeScript | ✅ | Tous les champs nullable ont types explicites |
| Endpoint `/complete` | ✅ | Structure de réponse validée |
| Validation DTOs | ✅ | Decorators class-validator en place |

---

## 🚀 PROCHAINES ÉTAPES

### 1. **Intégration Frontend** (Priorité Haute)
```typescript
// À implémenter dans Settings.tsx

useEffect(() => {
  const loadSettings = async () => {
    try {
      const response = await fetch(
        `${API_URL}/restaurants/${user.restaurant.id}/complete`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      
      // Remplir les états avec data.restaurant et data.settings
      setRestaurantName(data.restaurant.name);
      setRestaurantDesc(data.restaurant.description || '');
      setAddress(data.restaurant.address || '');
      setPhone(data.restaurant.phoneNumber || '');
      setEmail(data.restaurant.email || '');
      
      setPrimaryColor(data.settings.primaryColor);
      setSecondaryColor(data.settings.secondaryColor);
      setButtonStyle(data.settings.buttonStyle);
      setLanguage(data.settings.language);
      setIsOpen(data.settings.isOrderingEnabled);
      setPrepTime(data.settings.prepTime);
      setTaxRate(data.settings.taxRate);
      
      setPaymentMethods({
        cash: data.settings.paymentMethods.cash,
        card: data.settings.paymentMethods.card,
        online: data.settings.paymentMethods.online,
      });
      
      setPermissions(data.settings.permissions);
    } catch (error) {
      console.error('Erreur chargement settings:', error);
    }
  };
  
  loadSettings();
}, []);

const handleSave = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSaving(true);
  
  try {
    // 1. Mettre à jour le restaurant
    await fetch(`${API_URL}/restaurants/${restaurantId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: restaurantName,
        description: restaurantDesc,
        address,
        phoneNumber: phone,
        email,
      }),
    });
    
    // 2. Mettre à jour les paramètres
    await fetch(`${API_URL}/restaurants/${restaurantId}/settings`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        primaryColor,
        secondaryColor,
        buttonStyle,
        language,
        isOrderingEnabled: isOpen,
        taxRate,
        prepTime,
        paymentCash: paymentMethods.cash,
        paymentCard: paymentMethods.card,
        paymentOnline: paymentMethods.online,
        ...permissions,
      }),
    });
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  } catch (error) {
    console.error('Erreur sauvegarde:', error);
    // Afficher message d'erreur
  } finally {
    setIsSaving(false);
  }
};
```

### 2. **Fonctionnalités Optionnelles** (Priorité Moyenne)

#### A. Upload de Logo
```typescript
// Backend: Nouveau endpoint
@Post(':id/upload-logo')
@UseInterceptors(FileInterceptor('logo'))
async uploadLogo(
  @Param('id') id: string,
  @UploadedFile() file: Express.Multer.File,
) {
  // Sauvegarder le fichier (S3, local, etc.)
  const logoUrl = await this.uploadService.uploadFile(file);
  
  // Mettre à jour le restaurant
  await this.restaurantsService.update(id, { logoUrl });
  
  return { logoUrl };
}
```

#### B. Horaires d'Ouverture
```sql
-- Nouvelle table recommandée
CREATE TABLE opening_hours (
  id VARCHAR(36) PRIMARY KEY,
  restaurantId VARCHAR(36) NOT NULL,
  dayOfWeek INT NOT NULL,        -- 0=Dimanche, 1=Lundi, ..., 6=Samedi
  openTime TIME NOT NULL,         -- Ex: '09:00:00'
  closeTime TIME NOT NULL,        -- Ex: '22:00:00'
  isClosed BOOLEAN DEFAULT FALSE, -- Jour fermé
  FOREIGN KEY (restaurantId) REFERENCES restaurants(id) ON DELETE CASCADE
);
```

```typescript
// Entity
@Entity('opening_hours')
export class OpeningHours {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  dayOfWeek: number; // 0-6

  @Column('time')
  openTime: string;

  @Column('time')
  closeTime: string;

  @Column({ default: false })
  isClosed: boolean;

  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
  restaurant: Restaurant;
}
```

### 3. **Améliorations** (Priorité Basse)
- [ ] Validation des couleurs hexadécimales côté frontend
- [ ] Prévisualisation en temps réel des changements de design
- [ ] Historique des modifications de paramètres (table `settings_history`)
- [ ] Export/Import des paramètres (JSON)
- [ ] Templates de design prédéfinis

---

## 📚 GUIDE D'UTILISATION COMPLET

### Charger les Paramètres
```typescript
const { restaurant, settings } = await getRestaurantWithSettings(restaurantId);

// Accès aux données
console.log(restaurant.name);              // "Mon Restaurant"
console.log(settings.primaryColor);        // "#D94A6A"
console.log(settings.paymentMethods.cash); // true
console.log(settings.permissions.managerCanSeeStats); // true
```

### Mettre à Jour le Restaurant
```typescript
await updateRestaurant(restaurantId, {
  name: "Nouveau nom",
  description: "Nouvelle description",
  email: "nouveau@email.fr",
});
```

### Mettre à Jour les Paramètres
```typescript
await updateSettings(restaurantId, {
  primaryColor: "#FF0000",
  buttonStyle: "pill",
  prepTime: 30,
  paymentOnline: true,
  managerCanManageStaff: true,
});
```

---

## 🎉 CONCLUSION

### ✅ Ce qui est PRÊT
- ✅ **Base de données** : Migration exécutée, tous les champs créés
- ✅ **Backend** : Endpoints fonctionnels, DTOs validés, services implémentés
- ✅ **Types** : Tous les champs nullable ont des types explicites
- ✅ **Build** : Compilation réussie sans erreurs
- ✅ **Documentation** : Guide complet d'utilisation

### ⚠️ Ce qui reste À FAIRE
- ⚠️ **Frontend** : Intégrer les appels API dans Settings.tsx
- ⚠️ **Upload Logo** : Implémenter l'endpoint d'upload (optionnel)
- ⚠️ **Horaires** : Créer la table et les endpoints (optionnel)

### 📊 Statistiques
- **Fichiers modifiés** : 8
- **Nouveaux champs** : 7 (2 dans restaurants, 5 dans restaurant_settings)
- **Nouveaux endpoints** : 1 (`GET /complete`)
- **Lignes de code** : ~200 ajoutées
- **Temps de développement** : ~2h

---

**Build Status:** ✅ SUCCESS  
**Migration Status:** ✅ EXECUTED  
**API Status:** ✅ READY  
**Frontend Integration:** ⏳ PENDING
