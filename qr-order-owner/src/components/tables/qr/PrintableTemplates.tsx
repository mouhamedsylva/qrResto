import React from 'react';
import { Download, Printer } from 'lucide-react';

export interface PrintableTemplate {
  id: string;
  name: string;
  description: string;
  category: 'tent' | 'card' | 'stand';
  size: 'A5' | 'A6' | 'custom';
  orientation: 'portrait' | 'landscape';
  isPremium?: boolean;
  preview: string;
}

export const printableTemplates: PrintableTemplate[] = [
  // TABLE TENTS (Chevalets)
  {
    id: 'tent-diagonal-burgundy',
    name: 'Diagonal Bordeaux',
    description: 'Design diagonal élégant avec section bordeaux',
    category: 'tent',
    size: 'A5',
    orientation: 'portrait',
    isPremium: true,
    preview: 'diagonal-burgundy',
  },
  {
    id: 'tent-modern-geometric',
    name: 'Géométrique Moderne',
    description: 'Blocs de couleurs rouge, noir et beige',
    category: 'tent',
    size: 'A6',
    orientation: 'portrait',
    isPremium: true,
    preview: 'geometric-modern',
  },
  {
    id: 'tent-minimal-green',
    name: 'Minimaliste Vert',
    description: 'Design épuré avec bordure verte',
    category: 'tent',
    size: 'A5',
    orientation: 'portrait',
    preview: 'minimal-green',
  },
  {
    id: 'tent-elegant-beige',
    name: 'Élégant Beige',
    description: 'Style vintage avec ornements',
    category: 'tent',
    size: 'A6',
    orientation: 'portrait',
    preview: 'elegant-beige',
  },

  // CARDS (Cartes simples)
  {
    id: 'card-classic-white',
    name: 'Classique Blanc',
    description: 'Carte simple et professionnelle',
    category: 'card',
    size: 'A6',
    orientation: 'portrait',
    preview: 'classic-white',
  },
  {
    id: 'card-modern-gradient',
    name: 'Gradient Moderne',
    description: 'Dégradé coloré contemporain',
    category: 'card',
    size: 'A6',
    orientation: 'portrait',
    isPremium: true,
    preview: 'modern-gradient',
  },

  // STANDS (Supports de table)
  {
    id: 'stand-premium-black',
    name: 'Premium Noir',
    description: 'Support noir mat haut de gamme',
    category: 'stand',
    size: 'custom',
    orientation: 'portrait',
    isPremium: true,
    preview: 'premium-black',
  },
  {
    id: 'stand-wood-natural',
    name: 'Bois Naturel',
    description: 'Style naturel avec texture bois',
    category: 'stand',
    size: 'custom',
    orientation: 'portrait',
    isPremium: true,
    preview: 'wood-natural',
  },
];

interface PrintableTemplatesProps {
  selectedTemplate: string | null;
  onSelectTemplate: (template: PrintableTemplate) => void;
  onDownload: (templateId: string) => void;
  onPrint: (templateId: string) => void;
}

const PrintableTemplates: React.FC<PrintableTemplatesProps> = ({
  selectedTemplate,
  onSelectTemplate,
  onDownload,
  onPrint,
}) => {
  const categories = [
    { id: 'tent', name: 'Chevalets de Table', icon: '🏷️', description: 'Format pliable pour poser sur la table' },
    { id: 'card', name: 'Cartes Simples', icon: '📄', description: 'Format carte à insérer dans un support' },
    { id: 'stand', name: 'Supports Premium', icon: '✨', description: 'Designs pour supports acryliques' },
  ];

  return (
    <div className="printable-templates-container">
      <div className="printable-templates-header">
        <h3 className="printable-templates-title">
          <Printer style={{ width: '20px', height: '20px' }} />
          Templates Imprimables
        </h3>
        <p className="printable-templates-subtitle">
          Choisissez un format professionnel prêt à imprimer
        </p>
      </div>

      {categories.map((category) => {
        const categoryTemplates = printableTemplates.filter(
          (t) => t.category === category.id
        );

        if (categoryTemplates.length === 0) return null;

        return (
          <div key={category.id} className="printable-templates-category">
            <div className="printable-templates-category-header">
              <h4 className="printable-templates-category-title">
                <span className="printable-templates-category-icon">{category.icon}</span>
                {category.name}
              </h4>
              <p className="printable-templates-category-description">
                {category.description}
              </p>
            </div>

            <div className="printable-templates-grid">
              {categoryTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`printable-template-card ${
                    selectedTemplate === template.id ? 'selected' : ''
                  }`}
                  onClick={() => onSelectTemplate(template)}
                >
                  {/* Badge Premium */}
                  {template.isPremium && (
                    <div className="printable-template-premium-badge">
                      ✨ Premium
                    </div>
                  )}

                  {/* Preview placeholder */}
                  <div className="printable-template-preview">
                    <div className="printable-template-preview-content">
                      {/* Miniature simplifiée du template */}
                      {template.id === 'tent-diagonal-burgundy' && (
                        <div style={{ 
                          width: '100%', 
                          height: '100%', 
                          background: 'linear-gradient(135deg, white 50%, #6B1B3D 50%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '32px'
                        }}>
                          📋
                        </div>
                      )}
                      {template.id === 'tent-modern-geometric' && (
                        <div style={{ 
                          width: '100%', 
                          height: '100%', 
                          background: 'linear-gradient(to bottom, #D32F2F 20%, #2C2C2C 20% 80%, #D32F2F 80%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '32px',
                          color: 'white'
                        }}>
                          🎨
                        </div>
                      )}
                      {template.id === 'tent-minimal-green' && (
                        <div style={{ 
                          width: '100%', 
                          height: '100%', 
                          background: 'white',
                          border: '4px solid #48A868',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '32px'
                        }}>
                          🌿
                        </div>
                      )}
                      {template.id === 'tent-elegant-beige' && (
                        <div style={{ 
                          width: '100%', 
                          height: '100%', 
                          background: '#F5E6D3',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '32px'
                        }}>
                          🎭
                        </div>
                      )}
                      {!['tent-diagonal-burgundy', 'tent-modern-geometric', 'tent-minimal-green', 'tent-elegant-beige'].includes(template.id) && (
                        <span style={{ fontSize: '48px', opacity: 0.3 }}>📄</span>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="printable-template-info">
                    <h5 className="printable-template-name">{template.name}</h5>
                    <p className="printable-template-description">
                      {template.description}
                    </p>
                    <div className="printable-template-specs">
                      <span className="printable-template-spec">{template.size}</span>
                      <span className="printable-template-spec">
                        {template.orientation === 'portrait' ? '📱 Portrait' : '📺 Paysage'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  {selectedTemplate === template.id && (
                    <div className="printable-template-actions">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownload(template.id);
                        }}
                        className="printable-template-action-btn"
                        title="Télécharger PDF"
                      >
                        <Download style={{ width: '16px', height: '16px' }} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPrint(template.id);
                        }}
                        className="printable-template-action-btn"
                        title="Imprimer"
                      >
                        <Printer style={{ width: '16px', height: '16px' }} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PrintableTemplates;
