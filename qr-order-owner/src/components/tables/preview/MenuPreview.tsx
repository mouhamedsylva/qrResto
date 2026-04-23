import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useCurrency } from '../../../context/CurrencyContext';
import PhoneMockup from './PhoneMockup';
import { Smartphone, ExternalLink, Utensils, Coffee, IceCream, Plus, ShoppingCart, Flame, Leaf, Star } from 'lucide-react';

const MenuPreview: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const restaurantId = user?.restaurant?.id || '';
  const restaurantName = user?.restaurant?.name || 'Le coin du Paradis';
  
  const [selectedTable, setSelectedTable] = useState('1');

  // URL de prévisualisation (à adapter selon votre configuration)
  const previewUrl = `${window.location.origin}/menu/${restaurantId}?table=${selectedTable}`;

  // Données de démonstration
  const menuData = {
    entrees: [
      {
        id: 1,
        name: 'Salade César',
        description: 'Laitue romaine, poulet grillé, parmesan, croûtons maison',
        price: 12.50,
        tags: ['popular', 'vegetarian']
      },
      {
        id: 2,
        name: 'Soupe à l\'oignon',
        description: 'Gratinée au fromage, servie avec croûtons',
        price: 9.00,
        tags: []
      },
      {
        id: 3,
        name: 'Carpaccio de bœuf',
        description: 'Fines tranches de bœuf, roquette, parmesan, huile de truffe',
        price: 14.00,
        tags: ['popular']
      }
    ],
    plats: [
      {
        id: 4,
        name: 'Burger du Chef',
        description: 'Steak haché 180g, cheddar, bacon, oignons caramélisés, frites maison',
        price: 18.50,
        tags: ['popular']
      },
      {
        id: 5,
        name: 'Risotto aux champignons',
        description: 'Riz arborio, champignons de saison, parmesan, truffe',
        price: 16.00,
        tags: ['vegetarian']
      },
      {
        id: 6,
        name: 'Poulet tikka masala',
        description: 'Poulet mariné, sauce crémeuse épicée, riz basmati',
        price: 17.50,
        tags: ['spicy']
      }
    ],
    desserts: [
      {
        id: 7,
        name: 'Tiramisu maison',
        description: 'Mascarpone, café, cacao, biscuits à la cuillère',
        price: 7.50,
        tags: ['popular']
      },
      {
        id: 8,
        name: 'Fondant au chocolat',
        description: 'Cœur coulant, glace vanille, coulis de fruits rouges',
        price: 8.00,
        tags: []
      }
    ]
  };

  return (
    <div className="menu-preview-container">
      {/* Header */}
      <div className="menu-preview-header">
        <h2>{t('tables.preview.title')}</h2>
        <p>{t('tables.preview.subtitle')}</p>
      </div>

      <div className="menu-preview-grid">
        {/* Panneau de contrôle */}
        <div className="menu-preview-controls">
          <h3>{t('tables.preview.configuration')}</h3>

          {/* Sélection de table */}
          <div className="menu-preview-controls-group">
            <label className="menu-preview-controls-label">
              {t('tables.preview.simulateTable')}
            </label>
            <input
              type="text"
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="qr-form-input"
              placeholder={t('tables.preview.tableNumberPlaceholder')}
            />
          </div>

          {/* Lien direct */}
          <div className="menu-preview-controls-group">
            <label className="menu-preview-controls-label">
              {t('tables.preview.previewLink')}
            </label>
            <div className="menu-preview-link-group">
              <input
                type="text"
                value={previewUrl}
                readOnly
                className="menu-preview-link-input"
              />
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="menu-preview-link-btn"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Informations */}
          <div className="menu-preview-info">
            <h4>{t('tables.preview.information')}</h4>
            <ul>
              <li>
                <span>•</span>
                <span>{t('tables.preview.info1')}</span>
              </li>
              <li>
                <span>•</span>
                <span>{t('tables.preview.info2')}</span>
              </li>
              <li>
                <span>•</span>
                <span>{t('tables.preview.info3')}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Prévisualisation */}
        <div className="menu-preview-display">
          <PhoneMockup>
            <div className="menu-preview-phone-content">
              {/* Header du restaurant */}
              <div className="menu-preview-restaurant-header">
                <h1 className="menu-preview-restaurant-name">
                  {restaurantName}
                </h1>
                <div className="menu-preview-table-badge">
                  <Utensils className="w-3 h-3" />
                  Table {selectedTable}
                </div>
              </div>

              {/* Message de démonstration */}
              <div className="menu-preview-demo-banner">
                <Smartphone className="menu-preview-demo-icon" />
                <div className="menu-preview-demo-content">
                  <h3>{t('tables.preview.previewTitle')}</h3>
                  <p>
                    {t('tables.preview.previewMessage')}
                  </p>
                </div>
              </div>

              {/* Catégorie Entrées */}
              <div className="menu-preview-category-section">
                <div className="menu-preview-category-header">
                  <div className="menu-preview-category-icon">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <h2 className="menu-preview-category-title">Entrées</h2>
                  <span className="menu-preview-category-count">
                    {menuData.entrees.length} plats
                  </span>
                </div>

                {menuData.entrees.map((item) => (
                  <div key={item.id} className="menu-preview-item-card">
                    <div className="menu-preview-item-header">
                      <div className="menu-preview-item-info">
                        <h3 className="menu-preview-item-name">{item.name}</h3>
                        <p className="menu-preview-item-description">
                          {item.description}
                        </p>
                        {item.tags.length > 0 && (
                          <div className="menu-preview-item-tags">
                            {item.tags.includes('popular') && (
                              <span className="menu-preview-item-tag popular">
                                <Star className="w-3 h-3" />
                                Populaire
                              </span>
                            )}
                            {item.tags.includes('vegetarian') && (
                              <span className="menu-preview-item-tag vegetarian">
                                <Leaf className="w-3 h-3" />
                                Végétarien
                              </span>
                            )}
                            {item.tags.includes('spicy') && (
                              <span className="menu-preview-item-tag spicy">
                                <Flame className="w-3 h-3" />
                                Épicé
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="menu-preview-item-price-section">
                        <span className="menu-preview-item-price">
                          {formatPrice(item.price)}
                        </span>
                        <button className="menu-preview-item-add-btn">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="menu-preview-divider" />

              {/* Catégorie Plats principaux */}
              <div className="menu-preview-category-section">
                <div className="menu-preview-category-header">
                  <div className="menu-preview-category-icon">
                    <Coffee className="w-4 h-4" />
                  </div>
                  <h2 className="menu-preview-category-title">Plats principaux</h2>
                  <span className="menu-preview-category-count">
                    {menuData.plats.length} plats
                  </span>
                </div>

                {menuData.plats.map((item) => (
                  <div key={item.id} className="menu-preview-item-card">
                    <div className="menu-preview-item-header">
                      <div className="menu-preview-item-info">
                        <h3 className="menu-preview-item-name">{item.name}</h3>
                        <p className="menu-preview-item-description">
                          {item.description}
                        </p>
                        {item.tags.length > 0 && (
                          <div className="menu-preview-item-tags">
                            {item.tags.includes('popular') && (
                              <span className="menu-preview-item-tag popular">
                                <Star className="w-3 h-3" />
                                Populaire
                              </span>
                            )}
                            {item.tags.includes('vegetarian') && (
                              <span className="menu-preview-item-tag vegetarian">
                                <Leaf className="w-3 h-3" />
                                Végétarien
                              </span>
                            )}
                            {item.tags.includes('spicy') && (
                              <span className="menu-preview-item-tag spicy">
                                <Flame className="w-3 h-3" />
                                Épicé
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="menu-preview-item-price-section">
                        <span className="menu-preview-item-price">
                          {formatPrice(item.price)}
                        </span>
                        <button className="menu-preview-item-add-btn">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="menu-preview-divider" />

              {/* Catégorie Desserts */}
              <div className="menu-preview-category-section">
                <div className="menu-preview-category-header">
                  <div className="menu-preview-category-icon">
                    <IceCream className="w-4 h-4" />
                  </div>
                  <h2 className="menu-preview-category-title">Desserts</h2>
                  <span className="menu-preview-category-count">
                    {menuData.desserts.length} plats
                  </span>
                </div>

                {menuData.desserts.map((item) => (
                  <div key={item.id} className="menu-preview-item-card">
                    <div className="menu-preview-item-header">
                      <div className="menu-preview-item-info">
                        <h3 className="menu-preview-item-name">{item.name}</h3>
                        <p className="menu-preview-item-description">
                          {item.description}
                        </p>
                        {item.tags.length > 0 && (
                          <div className="menu-preview-item-tags">
                            {item.tags.includes('popular') && (
                              <span className="menu-preview-item-tag popular">
                                <Star className="w-3 h-3" />
                                Populaire
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="menu-preview-item-price-section">
                        <span className="menu-preview-item-price">
                          {formatPrice(item.price)}
                        </span>
                        <button className="menu-preview-item-add-btn">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </PhoneMockup>
        </div>
      </div>
    </div>
  );
};

export default MenuPreview;
