import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useTables } from '../../../hooks/useTables';
import { useQrCustomization } from '../../../hooks/useQrCustomization';
import { useToast } from '../../Toast';
import QrTemplates from './QrTemplates';
import type { QrTemplate } from './QrTemplates';
import PrintableTemplates from './PrintableTemplates';
import type { PrintableTemplate } from './PrintableTemplates';
import PrintableTemplateRenderer from './PrintableTemplateRenderer';
import ColorPicker from './ColorPicker';
import LogoUploader from './LogoUploader';
import QrPreview from './QrPreview';
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';
import { Palette, Sparkles, Printer } from 'lucide-react';

console.log('✅ QrCustomizer module loaded');

const QrCustomizer: React.FC = () => {
  console.log('🔍 QrCustomizer: Component rendering');
  
  const { user } = useAuth();
  const { toastWarning, toastInfo } = useToast();
  console.log('🔍 QrCustomizer: user =', user);
  
  const restaurantId = user?.restaurant?.id || '';
  console.log('🔍 QrCustomizer: restaurantId =', restaurantId);
  
  const { tables, isLoading: tablesLoading, loadTables } = useTables(restaurantId);
  console.log('🔍 QrCustomizer: tables =', tables?.length, 'loading =', tablesLoading);
  
  const {
    customization,
    isGenerating,
    error,
    preview,
    updateColor,
    updateText,
    updateSize,
    updateFormat,
    uploadLogo,
    removeLogo,
    generateQr,
    clearPreview,
    resetCustomization,
  } = useQrCustomization();

  const [selectedTableId, setSelectedTableId] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedPrintableTemplate, setSelectedPrintableTemplate] = useState<string | null>(null);
  const [designMode, setDesignMode] = useState<'templates' | 'printable' | 'custom'>('printable');

  useEffect(() => {
    console.log('🔍 QrCustomizer: useEffect triggered, restaurantId =', restaurantId);
    if (restaurantId) {
      loadTables();
    }
  }, [restaurantId, loadTables]);

  const handleGenerate = async () => {
    if (!selectedTableId) {
      toastWarning('Veuillez sélectionner une table.');
      return;
    }
    await generateQr(selectedTableId);
  };

  const handleSelectPrintableTemplate = (template: PrintableTemplate) => {
    console.log('🔍 Printable template selected:', template.id);
    setSelectedPrintableTemplate(template.id);
    
    // Si une table est sélectionnée, générer le QR code
    if (selectedTableId) {
      generateQr(selectedTableId);
    }
  };

  const handleDownloadTemplate = (templateId: string) => {
    console.log('📥 Download template:', templateId);
    toastInfo('Téléchargement du template en cours...');
  };

  const handlePrintTemplate = (templateId: string) => {
    console.log('🖨️ Print template:', templateId);
    window.print();
  };

  const handleSelectTemplate = (template: QrTemplate) => {
    console.log('🔍 Template selected:', template.id);
    setSelectedTemplate(template.id);
    // Appliquer les couleurs du template
    updateColor('foreground', template.design.foregroundColor);
    updateColor('background', template.design.backgroundColor);
    updateText(template.design.text);
    
    // Si une table est sélectionnée, générer le QR code immédiatement
    if (selectedTableId) {
      generateQr(selectedTableId);
    }
  };

  console.log('🔍 QrCustomizer: Before render, tablesLoading =', tablesLoading);
  
  if (tablesLoading) {
    console.log('🔍 QrCustomizer: Showing loading spinner');
    return <LoadingSpinner text="Chargement..." />;
  }

  console.log('🔍 QrCustomizer: Rendering main content, designMode =', designMode);
  
  return (
    <div className="qr-customizer-container">
      {/* Header */}
      <div className="qr-customizer-header">
        <h2>Personnalisation QR Codes</h2>
        <p>Créez des QR codes personnalisés avec votre identité visuelle</p>
      </div>

      {/* Erreur */}
      {error && <ErrorMessage message={error} />}

      {/* Mode Selector - IMPORTANT: Doit être visible */}
      <div 
        className="qr-design-mode-selector"
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '32px',
          padding: '4px',
          background: 'var(--surface-1, #f5f5f5)',
          borderRadius: '12px',
          width: 'fit-content',
        }}
      >
        <button
          onClick={() => {
            console.log('🔍 Switching to printable mode');
            setDesignMode('printable');
          }}
          className={`qr-design-mode-btn ${designMode === 'printable' ? 'active' : ''}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '600',
            color: designMode === 'printable' ? 'white' : 'var(--text-600, #666)',
            background: designMode === 'printable' ? 'var(--primary, #d94a6a)' : 'transparent',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Printer style={{ width: '16px', height: '16px' }} />
          Templates Imprimables
        </button>
        <button
          onClick={() => {
            console.log('🔍 Switching to templates mode');
            setDesignMode('templates');
          }}
          className={`qr-design-mode-btn ${designMode === 'templates' ? 'active' : ''}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '600',
            color: designMode === 'templates' ? 'white' : 'var(--text-600, #666)',
            background: designMode === 'templates' ? 'var(--primary, #d94a6a)' : 'transparent',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Sparkles style={{ width: '16px', height: '16px' }} />
          Templates Digitaux
        </button>
        <button
          onClick={() => {
            console.log('🔍 Switching to custom mode');
            setDesignMode('custom');
          }}
          className={`qr-design-mode-btn ${designMode === 'custom' ? 'active' : ''}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '600',
            color: designMode === 'custom' ? 'white' : 'var(--text-600, #666)',
            background: designMode === 'custom' ? 'var(--primary, #d94a6a)' : 'transparent',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Palette style={{ width: '16px', height: '16px' }} />
          Design Personnalisé
        </button>
      </div>

      {/* Printable Templates Section */}
      {designMode === 'printable' && (
        <div>
          {/* Sélecteur de table */}
          <div style={{
            background: 'var(--surface-0)',
            padding: '24px',
            borderRadius: '12px',
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--text-900)',
              marginBottom: '12px',
            }}>
              Sélectionnez une table pour générer le QR Code
            </label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <select
                value={selectedTableId}
                onChange={(e) => {
                  setSelectedTableId(e.target.value);
                  if (e.target.value && selectedPrintableTemplate) {
                    generateQr(e.target.value);
                  }
                }}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  fontSize: '14px',
                  border: '2px solid var(--surface-2)',
                  borderRadius: '8px',
                  background: 'white',
                  color: 'var(--text-900)',
                  cursor: 'pointer',
                }}
              >
                <option value="">Choisir une table...</option>
                {tables.map((table) => (
                  <option key={table.id} value={table.id}>
                    Table {table.number}
                  </option>
                ))}
              </select>
              {selectedTableId && selectedPrintableTemplate && (
                <button
                  onClick={() => generateQr(selectedTableId)}
                  disabled={isGenerating}
                  style={{
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'white',
                    background: 'var(--primary)',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isGenerating ? 'not-allowed' : 'pointer',
                    opacity: isGenerating ? 0.6 : 1,
                  }}
                >
                  {isGenerating ? 'Génération...' : 'Générer QR'}
                </button>
              )}
            </div>
          </div>

          {/* Liste des templates imprimables */}
          <PrintableTemplates
            selectedTemplate={selectedPrintableTemplate}
            onSelectTemplate={handleSelectPrintableTemplate}
            onDownload={handleDownloadTemplate}
            onPrint={handlePrintTemplate}
          />

          {/* Prévisualisation du template avec QR code */}
          {selectedPrintableTemplate && preview?.qrCodeUrl && (
            <div style={{ marginTop: '40px' }}>
              <h4 style={{ 
                fontSize: '18px', 
                fontWeight: 600, 
                color: 'var(--text-900)', 
                marginBottom: '16px' 
              }}>
                📋 Aperçu Prêt à Imprimer
              </h4>
              <PrintableTemplateRenderer
                templateId={selectedPrintableTemplate}
                qrCodeUrl={preview.qrCodeUrl}
                restaurantName={user?.restaurant?.name || 'Votre Restaurant'}
                tableNumber={tables.find(t => t.id === selectedTableId)?.number.toString()}
                phone="04 95 30 30 30"
                email="info@votrerestaurant.com"
                website="www.votrerestaurant.com"
              />
            </div>
          )}
        </div>
      )}

      {/* Templates Section */}
      {designMode === 'templates' && (
        <div>
          {/* Sélecteur de table pour les templates */}
          <div style={{
            background: 'var(--surface-0)',
            padding: '24px',
            borderRadius: '12px',
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--text-900)',
              marginBottom: '12px',
            }}>
              Sélectionnez une table pour générer le QR Code
            </label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <select
                value={selectedTableId}
                onChange={(e) => {
                  setSelectedTableId(e.target.value);
                  if (e.target.value && selectedTemplate) {
                    generateQr(e.target.value);
                  }
                }}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  fontSize: '14px',
                  border: '2px solid var(--surface-2)',
                  borderRadius: '8px',
                  background: 'white',
                  color: 'var(--text-900)',
                  cursor: 'pointer',
                }}
              >
                <option value="">Choisir une table...</option>
                {tables.map((table) => (
                  <option key={table.id} value={table.id}>
                    Table {table.number}
                  </option>
                ))}
              </select>
              {selectedTableId && selectedTemplate && (
                <button
                  onClick={() => generateQr(selectedTableId)}
                  disabled={isGenerating}
                  style={{
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'white',
                    background: 'var(--primary)',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isGenerating ? 'not-allowed' : 'pointer',
                    opacity: isGenerating ? 0.6 : 1,
                  }}
                >
                  {isGenerating ? 'Génération...' : 'Générer QR'}
                </button>
              )}
            </div>
          </div>

          <QrTemplates
            selectedTemplate={selectedTemplate}
            onSelectTemplate={handleSelectTemplate}
            qrCodeUrl={preview?.qrCodeUrl}
            tableNumber={tables.find(t => t.id === selectedTableId)?.number.toString()}
            restaurantName={user?.restaurant?.name}
          />
        </div>
      )}

      {/* Custom Design Section */}
      {designMode === 'custom' && (
        <div className="qr-customizer-grid">
          {/* Panneau de personnalisation */}
          <div className="qr-customizer-panel">
            <h3>Configuration Personnalisée</h3>

            <div className="qr-customizer-form">
              {/* Couleurs */}
              <ColorPicker
                label="Couleur principale"
                color={customization.foregroundColor}
                onChange={(color) => updateColor('foreground', color)}
              />

              <ColorPicker
                label="Couleur de fond"
                color={customization.backgroundColor}
                onChange={(color) => updateColor('background', color)}
              />

              {/* Logo */}
              <LogoUploader
                logoUrl={customization.logoUrl}
                onUpload={uploadLogo}
                onRemove={removeLogo}
              />

              {/* Texte personnalisé */}
              <div className="qr-form-group">
                <label className="qr-form-label">Texte personnalisé</label>
                <input
                  type="text"
                  value={customization.text}
                  onChange={(e) => updateText(e.target.value)}
                  className="qr-form-input"
                  placeholder="Scannez pour commander"
                />
              </div>
            </div>
          </div>

          {/* Panneau de prévisualisation */}
          <div className="qr-customizer-panel qr-preview-panel">
            <h3>Aperçu en direct</h3>
            
            <div
              className="qr-preview-area"
              style={{
                backgroundColor: customization.backgroundColor,
              }}
            >
              <div className="qr-preview-content">
                <div
                  className="qr-preview-qr"
                  style={{
                    backgroundColor: customization.foregroundColor,
                  }}
                >
                  <span style={{ color: customization.backgroundColor }}>
                    QR
                  </span>
                </div>
                <p
                  className="qr-preview-text"
                  style={{ color: customization.foregroundColor }}
                >
                  {customization.text}
                </p>
              </div>
            </div>

            <p className="qr-preview-note">
              Ceci est un aperçu simplifié. Le QR code réel sera généré après avoir cliqué sur "Générer".
            </p>
          </div>
        </div>
      )}

      {/* Configuration commune */}
      <div className="qr-customizer-common-config">
        <div className="qr-customizer-panel">
          <h3>Configuration Finale</h3>
          
          <div className="qr-customizer-form">
            {/* Sélection de table */}
            <div className="qr-form-group">
              <label className="qr-form-label">Table</label>
              <select
                value={selectedTableId}
                onChange={(e) => setSelectedTableId(e.target.value)}
                className="qr-form-select"
              >
                <option value="">Sélectionnez une table</option>
                {tables.map((table) => (
                  <option key={table.id} value={table.id}>
                    Table {table.number}
                  </option>
                ))}
              </select>
            </div>

            {/* Taille */}
            <div className="qr-form-group">
              <label className="qr-form-label">Taille</label>
              <div className="qr-size-buttons">
                {(['small', 'medium', 'large', 'xlarge'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => updateSize(size)}
                    className={`qr-size-btn ${customization.size === size ? 'active' : ''}`}
                  >
                    {size === 'small' && 'S'}
                    {size === 'medium' && 'M'}
                    {size === 'large' && 'L'}
                    {size === 'xlarge' && 'XL'}
                  </button>
                ))}
              </div>
            </div>

            {/* Format */}
            <div className="qr-form-group">
              <label className="qr-form-label">Format</label>
              <div className="qr-format-buttons">
                {(['png', 'svg', 'pdf'] as const).map((format) => (
                  <button
                    key={format}
                    onClick={() => updateFormat(format)}
                    className={`qr-format-btn ${customization.format === format ? 'active' : ''}`}
                  >
                    {format.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="qr-actions">
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !selectedTableId}
                className="qr-btn qr-btn-primary"
              >
                {isGenerating ? 'Génération...' : 'Générer QR Code'}
              </button>
              <button
                onClick={() => {
                  resetCustomization();
                  setSelectedTemplate(null);
                }}
                className="qr-btn qr-btn-secondary"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de prévisualisation */}
      {preview && (
        <QrPreview
          preview={preview}
          onClose={clearPreview}
        />
      )}
    </div>
  );
};

export default QrCustomizer;
