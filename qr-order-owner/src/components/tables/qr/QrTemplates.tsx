import React from 'react';
import { Check, Sparkles, Utensils, Coffee, Wine } from 'lucide-react';
import TemplatePreview from './TemplatePreview';

export interface QrTemplate {
  id: string;
  name: string;
  description: string;
  category: 'modern' | 'classic' | 'elegant' | 'fun';
  isPremium?: boolean;
  design: {
    foregroundColor: string;
    backgroundColor: string;
    accentColor?: string;
    gradientStart?: string;
    gradientEnd?: string;
    pattern?: 'solid' | 'gradient' | 'dots' | 'waves' | 'circles';
    text: string;
    subtext?: string;
    style: 'minimal' | 'decorative' | 'bold';
    icon?: 'utensils' | 'coffee' | 'wine' | 'none';
    borderStyle?: 'none' | 'solid' | 'dashed' | 'rounded';
  };
}

export const qrTemplates: QrTemplate[] = [
  // MODERN TEMPLATES
  {
    id: 'modern-gradient-pink',
    name: 'Gradient Rose Moderne',
    description: 'Dégradé rose-orange avec design épuré',
    category: 'modern',
    isPremium: true,
    design: {
      foregroundColor: '#000000',
      backgroundColor: '#FFFFFF',
      gradientStart: '#FF6B9D',
      gradientEnd: '#FFA06B',
      pattern: 'gradient',
      text: 'SCANNEZ POUR COMMANDER',
      subtext: 'Menu Digital',
      style: 'bold',
      icon: 'utensils',
      borderStyle: 'rounded',
    },
  },
  {
    id: 'modern-minimal-black',
    name: 'Minimaliste Noir',
    description: 'Design épuré noir et blanc',
    category: 'modern',
    design: {
      foregroundColor: '#000000',
      backgroundColor: '#FFFFFF',
      pattern: 'solid',
      text: 'SCAN FOR MENU',
      style: 'minimal',
      icon: 'none',
      borderStyle: 'solid',
    },
  },
  {
    id: 'modern-blue-wave',
    name: 'Vague Bleue',
    description: 'Design moderne avec vagues bleues',
    category: 'modern',
    design: {
      foregroundColor: '#1E3A8A',
      backgroundColor: '#DBEAFE',
      accentColor: '#3B82F6',
      pattern: 'waves',
      text: 'DÉCOUVREZ NOTRE MENU',
      style: 'decorative',
      icon: 'coffee',
      borderStyle: 'rounded',
    },
  },

  // CLASSIC TEMPLATES
  {
    id: 'classic-restaurant',
    name: 'Restaurant Classique',
    description: 'Style traditionnel élégant',
    category: 'classic',
    design: {
      foregroundColor: '#FFFFFF',
      backgroundColor: '#2C3E50',
      accentColor: '#E74C3C',
      pattern: 'solid',
      text: 'NOTRE CARTE',
      subtext: 'Scannez le QR Code',
      style: 'decorative',
      icon: 'utensils',
      borderStyle: 'solid',
    },
  },
  {
    id: 'classic-elegant-gold',
    name: 'Élégant Doré',
    description: 'Touches dorées pour un style raffiné',
    category: 'classic',
    isPremium: true,
    design: {
      foregroundColor: '#1A1A1A',
      backgroundColor: '#F5F5DC',
      accentColor: '#D4AF37',
      pattern: 'solid',
      text: 'MENU GASTRONOMIQUE',
      subtext: 'Scan QR Code',
      style: 'decorative',
      icon: 'wine',
      borderStyle: 'solid',
    },
  },

  // ELEGANT TEMPLATES
  {
    id: 'elegant-purple-gradient',
    name: 'Gradient Violet',
    description: 'Dégradé violet sophistiqué',
    category: 'elegant',
    isPremium: true,
    design: {
      foregroundColor: '#FFFFFF',
      backgroundColor: '#1A1A1A',
      gradientStart: '#667EEA',
      gradientEnd: '#764BA2',
      pattern: 'gradient',
      text: 'MENU DIGITAL',
      subtext: 'Scannez-moi',
      style: 'bold',
      icon: 'wine',
      borderStyle: 'rounded',
    },
  },
  {
    id: 'elegant-navy',
    name: 'Marine Élégant',
    description: 'Bleu marine sophistiqué',
    category: 'elegant',
    design: {
      foregroundColor: '#FFFFFF',
      backgroundColor: '#1B3A4B',
      accentColor: '#4A90A4',
      pattern: 'solid',
      text: 'NOTRE SÉLECTION',
      style: 'minimal',
      icon: 'coffee',
      borderStyle: 'none',
    },
  },

  // FUN TEMPLATES
  {
    id: 'fun-colorful-dots',
    name: 'Pois Colorés',
    description: 'Motif à pois joyeux et coloré',
    category: 'fun',
    design: {
      foregroundColor: '#FF6B35',
      backgroundColor: '#FFF8F0',
      accentColor: '#FFD23F',
      pattern: 'dots',
      text: 'SCANNEZ-MOI! 😋',
      subtext: 'Menu Gourmand',
      style: 'bold',
      icon: 'utensils',
      borderStyle: 'dashed',
    },
  },
  {
    id: 'fun-pizza-red',
    name: 'Pizza Party',
    description: 'Parfait pour une pizzeria',
    category: 'fun',
    design: {
      foregroundColor: '#FFFFFF',
      backgroundColor: '#E63946',
      accentColor: '#FFB703',
      pattern: 'circles',
      text: 'COMMANDEZ ICI!',
      subtext: '🍕 Pizza & Pasta',
      style: 'bold',
      icon: 'utensils',
      borderStyle: 'rounded',
    },
  },
];

interface QrTemplatesProps {
  selectedTemplate: string | null;
  onSelectTemplate: (template: QrTemplate) => void;
  qrCodeUrl?: string;
  tableNumber?: string;
  restaurantName?: string;
}

const QrTemplates: React.FC<QrTemplatesProps> = ({
  selectedTemplate,
  onSelectTemplate,
  qrCodeUrl,
  tableNumber,
  restaurantName,
}) => {
  const categories = [
    { id: 'modern', name: 'Moderne', icon: '✨' },
    { id: 'classic', name: 'Classique', icon: '🏛️' },
    { id: 'elegant', name: 'Élégant', icon: '💎' },
    { id: 'fun', name: 'Amusant', icon: '🎉' },
  ];

  return (
    <div className="qr-templates-container">
      <div className="qr-templates-header">
        <h3 className="qr-templates-title">
          <Sparkles style={{ width: '20px', height: '20px' }} />
          Templates de Design
        </h3>
        <p className="qr-templates-subtitle">
          Choisissez un template prédéfini ou créez le vôtre
        </p>
      </div>

      {/* Prévisualisation du template sélectionné */}
      {selectedTemplate && (
        <div style={{ marginBottom: '40px' }}>
          <h4 style={{ 
            fontSize: '18px', 
            fontWeight: 600, 
            color: 'var(--text-900)', 
            marginBottom: '16px' 
          }}>
            📋 Aperçu du Template Sélectionné
          </h4>
          <TemplatePreview
            template={qrTemplates.find(t => t.id === selectedTemplate)!}
            qrCodeUrl={qrCodeUrl}
            tableNumber={tableNumber}
            restaurantName={restaurantName}
          />
        </div>
      )}

      {categories.map((category) => {
        const categoryTemplates = qrTemplates.filter(
          (t) => t.category === category.id
        );

        if (categoryTemplates.length === 0) return null;

        return (
          <div key={category.id} className="qr-templates-category">
            <h4 className="qr-templates-category-title">
              <span className="qr-templates-category-icon">{category.icon}</span>
              {category.name}
            </h4>

            <div className="qr-templates-grid">
              {categoryTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => onSelectTemplate(template)}
                  className={`qr-template-card ${
                    selectedTemplate === template.id ? 'selected' : ''
                  }`}
                >
                  {/* Badge Premium */}
                  {template.isPremium && (
                    <div className="qr-template-premium-badge">
                      <Sparkles style={{ width: '12px', height: '12px' }} />
                      Premium
                    </div>
                  )}

                  {/* Checkmark si sélectionné */}
                  {selectedTemplate === template.id && (
                    <div className="qr-template-selected-badge">
                      <Check style={{ width: '16px', height: '16px' }} />
                    </div>
                  )}

                  {/* Preview du design */}
                  <div
                    className="qr-template-preview"
                    style={{
                      backgroundColor: template.design.backgroundColor,
                    }}
                  >
                    <div
                      className="qr-template-qr-mock"
                      style={{
                        backgroundColor: template.design.foregroundColor,
                      }}
                    >
                      <div className="qr-template-qr-pattern">
                        <div className="qr-template-qr-corner" />
                        <div className="qr-template-qr-corner" />
                        <div className="qr-template-qr-corner" />
                      </div>
                    </div>
                    <div
                      className="qr-template-text"
                      style={{
                        color: template.design.foregroundColor,
                      }}
                    >
                      {template.design.text.substring(0, 15)}...
                    </div>
                  </div>

                  {/* Informations */}
                  <div className="qr-template-info">
                    <h5 className="qr-template-name">{template.name}</h5>
                    <p className="qr-template-description">
                      {template.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default QrTemplates;
