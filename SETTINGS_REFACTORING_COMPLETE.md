# 🔄 REFACTORISATION DE SETTINGS.TSX

**Date**: 18 avril 2026  
**Statut**: ✅ COMPLÉTÉ

---

## 🎯 OBJECTIF

Refactoriser la page Settings.tsx pour remplacer les onglets Paiements, Service et Design par des onglets plus pertinents : Thème, Langue, Devise et Sécurité.

---

## ✅ CHANGEMENTS EFFECTUÉS

### Onglets Supprimés ❌
1. **Service** - Configuration du service (ouvert/fermé, temps de préparation, horaires)
2. **Design** - Personnalisation (couleurs, style des boutons)
3. **Paiements** - Paiements et taxes (TVA, modes de paiement)

### Nouveaux Onglets Ajoutés ✅
1. **Thème** 🌓 - Choix entre mode clair et mode sombre
2. **Langue** 🌍 - Sélection de la langue (Français, English, Español)
3. **Devise** 💰 - Choix de la devise (Franc CFA, Euro, Dollar US)
4. **Sécurité** 🔒 - Changement de mot de passe

### Onglets Conservés ✅
1. **Général** - Informations du restaurant (nom, description, adresse, téléphone, email, logo)
2. **Permissions** - Gestion des permissions de l'équipe (Manager/Staff)

---

## 📊 STRUCTURE DES NOUVEAUX ONGLETS

### 1. Onglet Thème 🌓

**Fonctionnalités:**
- Choix entre mode clair et mode sombre
- Interface visuelle avec icônes Sun/Moon
- Sélection par clic sur les cartes

**État:**
```typescript
const [theme, setTheme] = useState<'light' | 'dark'>('light');
```

**Interface:**
- 2 cartes côte à côte (Clair / Sombre)
- Icône Sun pour le mode clair
- Icône Moon pour le mode sombre
- Bordure colorée pour la sélection active

---

### 2. Onglet Langue 🌍

**Fonctionnalités:**
- Sélection de la langue d'interface
- 3 langues disponibles : Français, English, Español
- Affichage avec drapeaux emoji

**État:**
```typescript
const [language, setLanguage] = useState('fr');
```

**Langues disponibles:**
| Code | Langue | Drapeau |
|------|--------|---------|
| `fr` | Français | 🇫🇷 |
| `en` | English | 🇬🇧 |
| `es` | Español | 🇪🇸 |

**Interface:**
- Select dropdown en haut
- Liste de cartes cliquables avec drapeaux
- Icône Check pour la langue sélectionnée

---

### 3. Onglet Devise 💰

**Fonctionnalités:**
- Sélection de la devise pour les prix
- 3 devises disponibles : Franc CFA, Euro, Dollar US
- Affichage avec symbole et région

**État:**
```typescript
const [currency, setCurrency] = useState('XOF');
```

**Devises disponibles:**
| Code | Devise | Symbole | Région |
|------|--------|---------|--------|
| `XOF` | Franc CFA | CFA | Afrique de l'Ouest |
| `EUR` | Euro | € | Zone Euro |
| `USD` | Dollar US | $ | États-Unis |

**Interface:**
- Select dropdown en haut
- Liste de cartes cliquables avec détails
- Icône Check pour la devise sélectionnée

---

### 4. Onglet Sécurité 🔒

**Fonctionnalités:**
- Changement de mot de passe
- 3 champs : Mot de passe actuel, Nouveau, Confirmation
- Boutons pour afficher/masquer les mots de passe
- Validation côté frontend

**États:**
```typescript
const [currentPassword, setCurrentPassword] = useState('');
const [newPassword, setNewPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
const [showCurrentPassword, setShowCurrentPassword] = useState(false);
const [showNewPassword, setShowNewPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
```

**Validation:**
- Les mots de passe doivent correspondre
- Minimum 8 caractères
- Affichage des conseils de sécurité

**Fonction:**
```typescript
const handlePasswordChange = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!user?.id) return;

  if (newPassword !== confirmPassword) {
    setError('Les mots de passe ne correspondent pas.');
    return;
  }

  if (newPassword.length < 8) {
    setError('Le mot de passe doit contenir au moins 8 caractères.');
    return;
  }

  // Appel API
  await api.put(`/users/${user.id}/password`, {
    currentPassword,
    newPassword,
  });
};
```

---

## 🔌 INTÉGRATION BACKEND

### Endpoints Utilisés

#### 1. Chargement des données
```
GET /restaurants/:id/complete
```

**Réponse:**
```json
{
  "restaurant": {
    "name": "...",
    "description": "...",
    "address": "...",
    "phoneNumber": "...",
    "email": "...",
    "logoUrl": "..."
  },
  "settings": {
    "language": "fr",
    "currency": "XOF",
    "permissions": { ... }
  }
}
```

#### 2. Sauvegarde des paramètres généraux
```
PUT /restaurants/:id
```

**Body:**
```json
{
  "name": "...",
  "description": "...",
  "address": "...",
  "phoneNumber": "...",
  "email": "..."
}
```

#### 3. Sauvegarde des paramètres
```
PUT /restaurants/:id/settings
```

**Body:**
```json
{
  "language": "fr",
  "currency": "XOF",
  "staffCanEditMenu": true,
  "staffCanManageOrders": true,
  "managerCanEditMenu": true,
  "managerCanManageOrders": true,
  "managerCanSeeStats": true,
  "managerCanManageStaff": false
}
```

#### 4. Changement de mot de passe (À implémenter)
```
PUT /users/:id/password
```

**Body:**
```json
{
  "currentPassword": "...",
  "newPassword": "..."
}
```

---

## 📝 FICHIERS MODIFIÉS

### Frontend
- ✅ `qr-order-owner/src/pages/Settings.tsx`
  - Imports mis à jour (ajout Moon, Sun, DollarSign, Lock, Eye, EyeOff)
  - Type `activeTab` modifié
  - États supprimés (isOpen, prepTime, primaryColor, secondaryColor, buttonStyle, taxRate, paymentMethods)
  - États ajoutés (theme, currency, currentPassword, newPassword, confirmPassword, show*Password)
  - Fonction `handlePasswordChange` ajoutée
  - Fonction `togglePaymentMethod` supprimée
  - Onglets service/design/payments remplacés par theme/language/currency/security

---

## 🎨 DESIGN ET UX

### Thème
- **Cartes visuelles** avec icônes Sun/Moon
- **Bordure colorée** pour la sélection
- **Background teinté** pour l'élément actif

### Langue & Devise
- **Select dropdown** pour sélection rapide
- **Cartes cliquables** avec drapeaux/symboles
- **Icône Check** pour indiquer la sélection

### Sécurité
- **Champs password** avec boutons show/hide
- **Icônes Eye/EyeOff** pour la visibilité
- **Encadré informatif** avec conseils de sécurité
- **Validation en temps réel**

---

## ⚠️ BACKEND À ADAPTER

### Endpoint à créer
```typescript
// users.controller.ts
@Put(':id/password')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
async changePassword(
  @Param('id') id: string,
  @Body() changePasswordDto: ChangePasswordDto,
  @Request() req,
) {
  // Vérifier que l'utilisateur modifie son propre mot de passe
  if (req.user.id !== id && req.user.role !== UserRole.SUPER_ADMIN) {
    throw new ForbiddenException();
  }
  
  return this.usersService.changePassword(id, changePasswordDto);
}
```

### DTO à créer
```typescript
// change-password.dto.ts
export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  newPassword: string;
}
```

### Service à implémenter
```typescript
// users.service.ts
async changePassword(userId: string, dto: ChangePasswordDto) {
  const user = await this.findOne(userId);
  
  // Vérifier le mot de passe actuel
  const isValid = await bcrypt.compare(dto.currentPassword, user.password);
  if (!isValid) {
    throw new UnauthorizedException('Mot de passe actuel incorrect');
  }
  
  // Hasher le nouveau mot de passe
  const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
  
  // Mettre à jour
  await this.userRepository.update(userId, { password: hashedPassword });
  
  return { message: 'Mot de passe modifié avec succès' };
}
```

---

## ✅ TESTS À EFFECTUER

### Onglet Thème
- [ ] Sélection du mode clair
- [ ] Sélection du mode sombre
- [ ] Sauvegarde du thème

### Onglet Langue
- [ ] Sélection via dropdown
- [ ] Sélection via cartes
- [ ] Sauvegarde de la langue
- [ ] Vérification de l'affichage des drapeaux

### Onglet Devise
- [ ] Sélection via dropdown
- [ ] Sélection via cartes
- [ ] Sauvegarde de la devise
- [ ] Vérification des symboles

### Onglet Sécurité
- [ ] Affichage/masquage des mots de passe
- [ ] Validation : mots de passe différents
- [ ] Validation : moins de 8 caractères
- [ ] Changement de mot de passe réussi
- [ ] Gestion des erreurs (mot de passe actuel incorrect)

---

## 📊 STATISTIQUES

| Métrique | Avant | Après |
|----------|-------|-------|
| **Nombre d'onglets** | 5 | 6 |
| **Lignes de code** | ~780 | ~650 |
| **États React** | 15 | 13 |
| **Fonctions** | 4 | 4 |
| **Imports lucide-react** | 17 | 19 |

---

## 🎉 RÉSUMÉ

### Supprimé
- ❌ Onglet Service (ouvert/fermé, temps préparation, horaires)
- ❌ Onglet Design (couleurs, style boutons)
- ❌ Onglet Paiements (TVA, modes de paiement)

### Ajouté
- ✅ Onglet Thème (clair/sombre)
- ✅ Onglet Langue (fr/en/es)
- ✅ Onglet Devise (XOF/EUR/USD)
- ✅ Onglet Sécurité (changement mot de passe)

### Conservé
- ✅ Onglet Général (infos restaurant)
- ✅ Onglet Permissions (équipe)

---

**Statut**: ✅ COMPLÉTÉ  
**Frontend**: ✅ Refactorisé  
**Backend**: ⏳ Endpoint password à créer  
**Tests**: ⏳ À effectuer
