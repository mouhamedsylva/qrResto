import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useTables } from '../../../hooks/useTables';
import { useToast } from '../../Toast';
import { useConfirm } from '../../ConfirmModal';
import { Download, Printer } from 'lucide-react';
import { tablesService } from '../../../services/tablesService';

interface Props {
  initialTableId?: string;
}

const SimpleQrGenerator: React.FC<Props> = ({ initialTableId }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toastSuccess, toastError, toastInfo, toastWarning } = useToast();
  const { confirm } = useConfirm();
  const restaurantId = user?.restaurant?.id || '';
  const { tables, isLoading, loadTables } = useTables(restaurantId);
  
  const [selectedTableId, setSelectedTableId] = useState(initialTableId || '');
  const [selectedTemplate, setSelectedTemplate] = useState('burgundy');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [designMode, setDesignMode] = useState<'templates' | 'custom'>('templates');
  const [customTemplates, setCustomTemplates] = useState<any[]>([]);
  const [qrScope, setQrScope] = useState<'table' | 'global'>(initialTableId ? 'table' : 'table');

  // États pour le design personnalisé
  const [customDesign, setCustomDesign] = useState({
    backgroundColor: '#FFFFFF',
    primaryColor: '#d94a6a',
    secondaryColor: '#333333',
    titleText: 'SCANNEZ POUR COMMANDER',
    subtitleText: 'Menu Digital',
    fontSize: 'medium' as 'small' | 'medium' | 'large',
    layout: 'centered' as 'centered' | 'top' | 'bottom',
    borderStyle: 'none' as 'none' | 'solid' | 'rounded',
    showIcon: true,
    icon: '🍽️',
    showTableNumber: true,
  });

  useEffect(() => {
    if (restaurantId) {
      loadTables();
    }
    // Charger les templates personnalisés depuis localStorage
    const savedTemplates = JSON.parse(localStorage.getItem('customQrTemplates') || '[]');
    setCustomTemplates(savedTemplates);
  }, [restaurantId, loadTables]);

  useEffect(() => {
    if (initialTableId && tables.length > 0) {
      setSelectedTableId(initialTableId);
      setQrScope('table');
    }
  }, [initialTableId, tables]);

  const generateQrCode = async () => {
    if (qrScope === 'table' && !selectedTableId) {
      toastWarning('Veuillez sélectionner une table.');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const response = qrScope === 'table'
        ? await tablesService.customQr(selectedTableId, {
            foregroundColor: '#000000',
            backgroundColor: '#FFFFFF',
            text: 'Scannez pour commander',
            size: 'large',
            format: 'png',
          })
        : await tablesService.restaurantCustomQr(restaurantId, {
            foregroundColor: '#000000',
            backgroundColor: '#FFFFFF',
            text: 'Scannez pour commander',
            size: 'large',
            format: 'png',
          });

      setQrCodeUrl(response.data.qrCodeUrl);
    } catch (err: any) {
      console.error('Erreur génération QR:', err);
      setError(err.response?.data?.message || 'Erreur lors de la génération du QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadTemplate = () => {
    if (!qrCodeUrl) return;
    
    const table = tables.find(t => t.id === selectedTableId);
    
    // Créer un canvas temporaire pour le rendu haute résolution
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dimensions A5 en pixels (300 DPI pour haute qualité)
    canvas.width = 1748;  // 148mm à 300 DPI
    canvas.height = 2480; // 210mm à 300 DPI

    // Dessiner le fond
    ctx.fillStyle = designMode === 'custom' ? customDesign.backgroundColor : '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Fonction pour dessiner le contenu du template sur le canvas
    const drawTemplate = () => {
      if (designMode === 'custom') {
        // Rendu du design personnalisé
        const fontSizes = {
          small: { title: 90, subtitle: 55 },
          medium: { title: 110, subtitle: 65 },
          large: { title: 130, subtitle: 75 },
        };

        ctx.save();
        
        // Calculer les positions en fonction du layout
        let currentY = 200;
        const centerX = canvas.width / 2;
        const padding = 100; // Padding pour éviter que le texte touche les bords
        
        // Icône
        if (customDesign.icon) {
          ctx.font = `${220}px Arial`;
          ctx.textAlign = 'center';
          ctx.fillText(customDesign.icon, centerX, currentY + 180);
          currentY += 320; // Augmenté de 280 à 320 pour plus d'espace
        }

        // Titre - Gérer le texte long avec retour à la ligne
        ctx.fillStyle = customDesign.primaryColor;
        ctx.font = `bold ${fontSizes[customDesign.fontSize].title}px Arial`;
        ctx.textAlign = 'center';
        
        const titleText = customDesign.titleText;
        const maxWidth = canvas.width - (padding * 2);
        const titleMetrics = ctx.measureText(titleText);
        
        // Si le texte est trop long, le diviser en plusieurs lignes
        if (titleMetrics.width > maxWidth) {
          const words = titleText.split(' ');
          let line = '';
          const lines: string[] = [];
          
          for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const testMetrics = ctx.measureText(testLine);
            
            if (testMetrics.width > maxWidth && i > 0) {
              lines.push(line.trim());
              line = words[i] + ' ';
            } else {
              line = testLine;
            }
          }
          lines.push(line.trim());
          
          // Dessiner chaque ligne
          lines.forEach((textLine, index) => {
            ctx.fillText(textLine, centerX, currentY + (index * (fontSizes[customDesign.fontSize].title + 20)));
          });
          currentY += lines.length * (fontSizes[customDesign.fontSize].title + 20) + 50; // Augmenté de 40 à 50
        } else {
          ctx.fillText(titleText, centerX, currentY);
          currentY += fontSizes[customDesign.fontSize].title + 70; // Augmenté de 60 à 70
        }

        // Sous-titre
        if (customDesign.subtitleText) {
          ctx.fillStyle = customDesign.secondaryColor;
          ctx.font = `${fontSizes[customDesign.fontSize].subtitle}px Arial`;
          ctx.fillText(customDesign.subtitleText, centerX, currentY);
          currentY += fontSizes[customDesign.fontSize].subtitle + 100; // Augmenté de 80 à 100
        }

        // QR Code
        const qrImg = new Image();
        qrImg.crossOrigin = 'anonymous';
        qrImg.onload = () => {
          const qrSize = 800;
          const qrX = (canvas.width - qrSize) / 2;
          let qrY = currentY;
          
          // Ajuster la position selon le layout
          if (customDesign.layout === 'top') {
            qrY = currentY;
          } else if (customDesign.layout === 'bottom') {
            qrY = canvas.height - qrSize - 400;
          } else { // centered
            const remainingSpace = canvas.height - currentY - 400;
            qrY = currentY + (remainingSpace - qrSize) / 2;
          }
          
          // Fond blanc pour le QR avec ombre
          ctx.shadowColor = `${customDesign.primaryColor}44`;
          ctx.shadowBlur = 35;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 15;
          
          ctx.fillStyle = '#FFFFFF';
          const qrPadding = 87;
          ctx.fillRect(qrX - qrPadding, qrY - qrPadding, qrSize + (qrPadding * 2), qrSize + (qrPadding * 2));
          
          // Réinitialiser l'ombre
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          
          // QR Code
          ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
          
          // Nom du restaurant
          ctx.fillStyle = customDesign.secondaryColor;
          ctx.font = 'bold 100px Arial';
          ctx.textAlign = 'center';
          const restaurantY = qrY + qrSize + qrPadding + 130;
          ctx.fillText(user?.restaurant?.name || 'Restaurant', centerX, restaurantY);

          // Numéro de table - Badge arrondi (seulement si showTableNumber est activé)
          if (qrScope === 'table' && table && customDesign.showTableNumber) {
            const tableY = restaurantY + 80;
            const badgeWidth = 350;
            const badgeHeight = 90;
            const badgeX = centerX - (badgeWidth / 2);
            const badgeRadius = 45;
            
            // Dessiner le badge arrondi
            ctx.fillStyle = customDesign.primaryColor;
            ctx.beginPath();
            ctx.roundRect(badgeX, tableY - badgeHeight + 20, badgeWidth, badgeHeight, badgeRadius);
            ctx.fill();
            
            // Texte du badge
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 55px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`Table ${table.number}`, centerX, tableY + 15);
          }

          // Bordure si nécessaire
          if (customDesign.borderStyle === 'solid') {
            ctx.strokeStyle = customDesign.primaryColor;
            ctx.lineWidth = 17;
            ctx.strokeRect(17, 17, canvas.width - 34, canvas.height - 34);
          } else if (customDesign.borderStyle === 'rounded') {
            ctx.strokeStyle = customDesign.primaryColor;
            ctx.lineWidth = 17;
            ctx.beginPath();
            ctx.roundRect(17, 17, canvas.width - 34, canvas.height - 34, 105);
            ctx.stroke();
          }

          ctx.restore();

          // Télécharger
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `qr-custom-table-${table?.number || 'design'}.png`;
              a.click();
              URL.revokeObjectURL(url);
            }
          }, 'image/png', 1.0);
        };
        qrImg.onerror = () => {
          toastError('Erreur lors du chargement du QR code. Veuillez réessayer.');
        };
        qrImg.src = qrCodeUrl;
      } else {
        // Pour les templates prédéfinis, utiliser l'ancienne méthode ou une capture d'écran
        toastInfo('Téléchargement des templates prédéfinis en cours de développement. Utilisez le bouton Imprimer.');
      }
    };

    drawTemplate();
  };

  const handlePrint = () => {
    if (!qrCodeUrl) {
      toastWarning('Veuillez d\'abord générer un QR code.');
      return;
    }

    const table = tables.find(t => t.id === selectedTableId);
    const restaurantName = user?.restaurant?.name || 'Restaurant';
    const tableNum = table?.number;

    // Créer une nouvelle fenêtre pour l'impression
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Générer le HTML complet avec les styles inline pour le design personnalisé
    let templateHTML = '';

    if (designMode === 'custom') {
      const fontSizes = {
        small: { title: '24px', subtitle: '14px' },
        medium: { title: '32px', subtitle: '16px' },
        large: { title: '40px', subtitle: '20px' },
      };

      const borderStyles = {
        none: '',
        solid: `border: 4px solid ${customDesign.primaryColor};`,
        rounded: `border: 4px solid ${customDesign.primaryColor}; border-radius: 24px;`,
      };

      const layoutStyles = {
        centered: 'justify-content: space-around;',
        top: 'justify-content: flex-start; padding-top: 40px;',
        bottom: 'justify-content: flex-end; padding-bottom: 40px;',
      };

      templateHTML = `
        <div style="
          width: 400px !important;
          min-height: 566px !important;
          height: auto !important;
          margin: 0 auto !important;
          background: ${customDesign.backgroundColor} !important;
          background-color: ${customDesign.backgroundColor} !important;
          position: relative !important;
          overflow: visible !important;
          ${borderStyles[customDesign.borderStyle]}
          padding: 30px !important;
          padding-bottom: 40px !important;
          box-sizing: border-box !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        ">
          <div style="
            height: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            ${layoutStyles[customDesign.layout]}
            color: ${customDesign.primaryColor} !important;
          ">
            ${customDesign.icon ? `
              <div style="font-size: 56px !important; margin-bottom: 20px !important;">
                ${customDesign.icon}
              </div>
            ` : ''}
            
            <div style="text-align: center !important; margin-bottom: 20px !important;">
              <h1 style="
                font-size: ${fontSizes[customDesign.fontSize].title} !important;
                font-weight: bold !important;
                margin: 0 !important;
                margin-bottom: 10px !important;
                color: ${customDesign.primaryColor} !important;
                text-transform: uppercase !important;
                letter-spacing: 2px !important;
              ">
                ${customDesign.titleText}
              </h1>
              ${customDesign.subtitleText ? `
                <p style="
                  font-size: ${fontSizes[customDesign.fontSize].subtitle} !important;
                  margin: 0 !important;
                  color: ${customDesign.secondaryColor} !important;
                  font-weight: 500 !important;
                ">
                  ${customDesign.subtitleText}
                </p>
              ` : ''}
            </div>
            
            <div style="
              background: white !important;
              background-color: white !important;
              padding: 20px !important;
              border-radius: 16px !important;
              box-shadow: 0 8px 32px ${customDesign.primaryColor}33 !important;
              margin-bottom: 20px !important;
            ">
              <img src="${qrCodeUrl}" alt="QR Code" style="width: 200px !important; height: 200px !important; display: block !important;" />
            </div>
            
            <div style="text-align: center !important; margin-bottom: 20px !important;">
              <h2 style="
                font-size: 26px !important;
                font-weight: bold !important;
                margin: 0 !important;
                margin-bottom: 15px !important;
                color: ${customDesign.secondaryColor} !important;
              ">
                ${restaurantName}
              </h2>
              ${qrScope === 'table' && tableNum && customDesign.showTableNumber ? `
                <div style="
                  display: inline-block !important;
                  padding: 8px 20px !important;
                  background: ${customDesign.primaryColor} !important;
                  background-color: ${customDesign.primaryColor} !important;
                  color: white !important;
                  border-radius: 20px !important;
                  font-size: 14px !important;
                  font-weight: bold !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                  margin-bottom: 10px !important;
                ">
                  Table ${tableNum}
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    } else {
      // Pour les templates prédéfinis, utiliser l'élément existant
      const templateElement = document.getElementById('template-to-print');
      if (templateElement) {
        templateHTML = templateElement.outerHTML;
      }
    }

    // Créer le contenu HTML pour l'impression
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Impression QR Code${qrScope === 'table' && tableNum ? ` - Table ${tableNum}` : ' - Global'}</title>
          <meta charset="UTF-8">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            body {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: white;
              font-family: Arial, sans-serif;
            }
            @media print {
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              body {
                margin: 0;
                padding: 0;
              }
              @page {
                margin: 0;
                size: A5 portrait;
              }
            }
            @media screen {
              body {
                padding: 20px;
                background: #f0f0f0;
              }
            }
          </style>
        </head>
        <body>
          ${templateHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    
    // Attendre que les images soient chargées avant d'imprimer
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const selectedTable = tables.find(t => t.id === selectedTableId);

  if (isLoading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>{t('tables.qrGenerator.loading')}</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
        {t('tables.qrGenerator.title')}
      </h2>

      {/* Mode Selector */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        marginBottom: '24px',
        background: '#f5f5f5',
        padding: '4px',
        borderRadius: '12px',
        width: 'fit-content'
      }}>
        <button
          onClick={() => setDesignMode('templates')}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: designMode === 'templates' ? 'white' : '#666',
            background: designMode === 'templates' ? '#d94a6a' : 'transparent',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {t('tables.qrGenerator.templatesMode')}
        </button>
        <button
          onClick={() => setDesignMode('custom')}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: designMode === 'custom' ? 'white' : '#666',
            background: designMode === 'custom' ? '#d94a6a' : 'transparent',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {t('tables.qrGenerator.customMode')}
        </button>
      </div>

      {/* Type de QR Selector */}
      <div style={{ 
        display: 'flex', 
        gap: '24px', 
        marginBottom: '24px',
        alignItems: 'center'
      }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          <input
            type="radio"
            name="qrScope"
            value="table"
            checked={qrScope === 'table'}
            onChange={() => setQrScope('table')}
            style={{ width: '18px', height: '18px', accentColor: '#d94a6a' }}
          />
          Pour une table
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          <input
            type="radio"
            name="qrScope"
            value="global"
            checked={qrScope === 'global'}
            onChange={() => setQrScope('global')}
            style={{ width: '18px', height: '18px', accentColor: '#d94a6a' }}
          />
          Global (Tout le restaurant)
        </label>
      </div>

      {/* Sélection */}
      {(designMode === 'templates' || designMode === 'custom') && (
      <div style={{ 
        background: 'white', 
        padding: '24px', 
        borderRadius: '12px', 
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        {qrScope === 'table' && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
              {t('tables.qrGenerator.selectTable')}
            </label>
            <select
              value={selectedTableId}
              onChange={(e) => setSelectedTableId(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #ddd',
                borderRadius: '8px',
              }}
            >
              <option value="">{t('tables.qrGenerator.chooseTable')}</option>
              {tables.map((table) => (
                <option key={table.id} value={table.id}>
                  Table {table.number}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Templates prédéfinis */}
        {designMode === 'templates' && (
          <div style={{ marginBottom: '20px' }}>
            {/* Templates personnalisés */}
            {customTemplates.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <label style={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>
                    ⭐ Mes Templates Personnalisés ({customTemplates.length})
                  </label>
                  <button
                    onClick={async () => {
                      const ok = await confirm({
                        title: 'Supprimer tous les templates',
                        message: 'Voulez-vous supprimer tous vos templates personnalisés ? Cette action est irréversible.',
                        confirmLabel: 'Tout supprimer',
                        type: 'danger',
                      });
                      if (ok) {
                        localStorage.removeItem('customQrTemplates');
                        setCustomTemplates([]);
                        toastSuccess('Templates supprimés.');
                      }
                    }}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      background: '#fee',
                      color: '#c00',
                      border: '1px solid #fcc',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600',
                    }}
                  >
                    🗑️ Tout supprimer
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                  {customTemplates.map((template) => (
                    <div
                      key={template.id}
                      style={{
                        position: 'relative',
                        padding: '16px',
                        border: selectedTemplate === template.id ? '3px solid #667eea' : '2px solid #ddd',
                        borderRadius: '8px',
                        background: selectedTemplate === template.id ? '#f0f4ff' : 'white',
                        cursor: 'pointer',
                        textAlign: 'left',
                        boxShadow: selectedTemplate === template.id ? '0 4px 12px rgba(102, 126, 234, 0.2)' : 'none',
                      }}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      {/* Bouton supprimer */}
                      <button
                          onClick={async (e) => {
                          e.stopPropagation();
                          const ok = await confirm({
                            title: `Supprimer "${template.name}"`,
                            message: 'Ce template personnalisé sera définitivement supprimé.',
                            confirmLabel: 'Supprimer',
                            type: 'danger',
                          });
                          if (ok) {
                            const updated = customTemplates.filter(t => t.id !== template.id);
                            localStorage.setItem('customQrTemplates', JSON.stringify(updated));
                            setCustomTemplates(updated);
                            if (selectedTemplate === template.id) setSelectedTemplate('burgundy');
                            toastSuccess('Template supprimé.');
                          }
                        }}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          width: '24px',
                          height: '24px',
                          background: '#fee',
                          color: '#c00',
                          border: 'none',
                          borderRadius: '50%',
                          cursor: 'pointer',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 10,
                        }}
                        title="Supprimer ce template"
                      >
                        ×
                      </button>

                      {/* Miniature */}
                      <div style={{ 
                        width: '100%', 
                        height: '120px', 
                        backgroundImage: `url(${template.thumbnail})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderRadius: '4px',
                        marginBottom: '8px',
                        border: '1px solid #e0e0e0',
                      }} />
                      
                      <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
                        {template.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#666' }}>
                        ✨ Créé le {new Date(template.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                      {selectedTemplate === template.id && (
                        <div style={{
                          marginTop: '8px',
                          padding: '4px 8px',
                          background: '#667eea',
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          textAlign: 'center',
                        }}>
                          ✓ Sélectionné
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', fontSize: '16px', color: '#333' }}>
              📋 Templates Prédéfinis
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            {/* Template 1: Diagonal Bordeaux */}
            <button
              onClick={() => setSelectedTemplate('burgundy')}
              style={{
                padding: '16px',
                border: selectedTemplate === 'burgundy' ? '3px solid #d94a6a' : '2px solid #ddd',
                borderRadius: '8px',
                background: selectedTemplate === 'burgundy' ? '#fff5f7' : 'white',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ 
                width: '100%', 
                height: '120px', 
                background: 'linear-gradient(135deg, white 50%, #6B1B3D 50%)',
                borderRadius: '4px',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px'
              }}>
                📋
              </div>
              <div style={{ fontWeight: 'bold' }}>Diagonal Bordeaux</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Élégant et professionnel</div>
            </button>

            {/* Template 2: Géométrique Moderne */}
            <button
              onClick={() => setSelectedTemplate('geometric')}
              style={{
                padding: '16px',
                border: selectedTemplate === 'geometric' ? '3px solid #d94a6a' : '2px solid #ddd',
                borderRadius: '8px',
                background: selectedTemplate === 'geometric' ? '#fff5f7' : 'white',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ 
                width: '100%', 
                height: '120px', 
                background: 'linear-gradient(to bottom, #D32F2F 25%, #2C2C2C 25% 75%, #D32F2F 75%)',
                borderRadius: '4px',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                color: 'white'
              }}>
                🎨
              </div>
              <div style={{ fontWeight: 'bold' }}>Géométrique Moderne</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Design contemporain</div>
            </button>

            {/* Template 3: Minimaliste Vert */}
            <button
              onClick={() => setSelectedTemplate('green')}
              style={{
                padding: '16px',
                border: selectedTemplate === 'green' ? '3px solid #d94a6a' : '2px solid #ddd',
                borderRadius: '8px',
                background: selectedTemplate === 'green' ? '#fff5f7' : 'white',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ 
                width: '100%', 
                height: '120px', 
                background: 'white',
                border: '4px solid #48A868',
                borderRadius: '4px',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px'
              }}>
                🌿
              </div>
              <div style={{ fontWeight: 'bold' }}>Minimaliste Vert</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Frais et naturel</div>
            </button>

            {/* Template 4: Élégant Beige */}
            <button
              onClick={() => setSelectedTemplate('beige')}
              style={{
                padding: '16px',
                border: selectedTemplate === 'beige' ? '3px solid #d94a6a' : '2px solid #ddd',
                borderRadius: '8px',
                background: selectedTemplate === 'beige' ? '#fff5f7' : 'white',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ 
                width: '100%', 
                height: '120px', 
                background: '#F5E6D3',
                borderRadius: '4px',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px'
              }}>
                🎭
              </div>
              <div style={{ fontWeight: 'bold' }}>Élégant Beige</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Vintage raffiné</div>
            </button>

            {/* Template 5: Gradient Rose */}
            <button
              onClick={() => setSelectedTemplate('pink-gradient')}
              style={{
                padding: '16px',
                border: selectedTemplate === 'pink-gradient' ? '3px solid #d94a6a' : '2px solid #ddd',
                borderRadius: '8px',
                background: selectedTemplate === 'pink-gradient' ? '#fff5f7' : 'white',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ 
                width: '100%', 
                height: '120px', 
                background: 'linear-gradient(135deg, #FF6B9D 0%, #FFA06B 100%)',
                borderRadius: '4px',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                color: 'white'
              }}>
                ✨
              </div>
              <div style={{ fontWeight: 'bold' }}>Gradient Rose</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Moderne et vibrant</div>
            </button>

            {/* Template 6: Bleu Marine */}
            <button
              onClick={() => setSelectedTemplate('navy')}
              style={{
                padding: '16px',
                border: selectedTemplate === 'navy' ? '3px solid #d94a6a' : '2px solid #ddd',
                borderRadius: '8px',
                background: selectedTemplate === 'navy' ? '#fff5f7' : 'white',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ 
                width: '100%', 
                height: '120px', 
                background: 'linear-gradient(135deg, #1B3A4B 0%, #4A90A4 100%)',
                borderRadius: '4px',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                color: 'white'
              }}>
                🌊
              </div>
              <div style={{ fontWeight: 'bold' }}>Bleu Marine</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Sophistiqué et calme</div>
            </button>

            {/* Template 7: Noir & Or */}
            <button
              onClick={() => setSelectedTemplate('black-gold')}
              style={{
                padding: '16px',
                border: selectedTemplate === 'black-gold' ? '3px solid #d94a6a' : '2px solid #ddd',
                borderRadius: '8px',
                background: selectedTemplate === 'black-gold' ? '#fff5f7' : 'white',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ 
                width: '100%', 
                height: '120px', 
                background: 'linear-gradient(135deg, #1A1A1A 0%, #2C2C2C 100%)',
                border: '3px solid #D4AF37',
                borderRadius: '4px',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                color: '#D4AF37'
              }}>
                👑
              </div>
              <div style={{ fontWeight: 'bold' }}>Noir & Or</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Luxe et prestige</div>
            </button>

            {/* Template 8: Violet Moderne */}
            <button
              onClick={() => setSelectedTemplate('purple')}
              style={{
                padding: '16px',
                border: selectedTemplate === 'purple' ? '3px solid #d94a6a' : '2px solid #ddd',
                borderRadius: '8px',
                background: selectedTemplate === 'purple' ? '#fff5f7' : 'white',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ 
                width: '100%', 
                height: '120px', 
                background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
                borderRadius: '4px',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                color: 'white'
              }}>
                💜
              </div>
              <div style={{ fontWeight: 'bold' }}>Violet Moderne</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Créatif et tendance</div>
            </button>

            {/* Template 9: Orange Énergique */}
            <button
              onClick={() => setSelectedTemplate('orange')}
              style={{
                padding: '16px',
                border: selectedTemplate === 'orange' ? '3px solid #d94a6a' : '2px solid #ddd',
                borderRadius: '8px',
                background: selectedTemplate === 'orange' ? '#fff5f7' : 'white',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ 
                width: '100%', 
                height: '120px', 
                background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
                borderRadius: '4px',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                color: 'white'
              }}>
                🔥
              </div>
              <div style={{ fontWeight: 'bold' }}>Orange Énergique</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Dynamique et chaleureux</div>
            </button>

            {/* Template 10: Turquoise Tropical */}
            <button
              onClick={() => setSelectedTemplate('turquoise')}
              style={{
                padding: '16px',
                border: selectedTemplate === 'turquoise' ? '3px solid #d94a6a' : '2px solid #ddd',
                borderRadius: '8px',
                background: selectedTemplate === 'turquoise' ? '#fff5f7' : 'white',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ 
                width: '100%', 
                height: '120px', 
                background: 'linear-gradient(135deg, #0D5C63 0%, #44B3C2 100%)',
                borderRadius: '4px',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                color: 'white'
              }}>
                🏝️
              </div>
              <div style={{ fontWeight: 'bold' }}>Turquoise Tropical</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Frais et exotique</div>
            </button>

            {/* Template 11: Marron Rustique */}
            <button
              onClick={() => setSelectedTemplate('brown')}
              style={{
                padding: '16px',
                border: selectedTemplate === 'brown' ? '3px solid #d94a6a' : '2px solid #ddd',
                borderRadius: '8px',
                background: selectedTemplate === 'brown' ? '#fff5f7' : 'white',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ 
                width: '100%', 
                height: '120px', 
                background: 'linear-gradient(135deg, #6B4423 0%, #A0826D 100%)',
                borderRadius: '4px',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                color: 'white'
              }}>
                🌰
              </div>
              <div style={{ fontWeight: 'bold' }}>Marron Rustique</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Chaleureux et authentique</div>
            </button>

            {/* Template 12: Corail Sunset */}
            <button
              onClick={() => setSelectedTemplate('coral')}
              style={{
                padding: '16px',
                border: selectedTemplate === 'coral' ? '3px solid #d94a6a' : '2px solid #ddd',
                borderRadius: '8px',
                background: selectedTemplate === 'coral' ? '#fff5f7' : 'white',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ 
                width: '100%', 
                height: '120px', 
                background: 'linear-gradient(135deg, #FF7E5F 0%, #FEB47B 100%)',
                borderRadius: '4px',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                color: 'white'
              }}>
                🌅
              </div>
              <div style={{ fontWeight: 'bold' }}>Corail Sunset</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Doux et accueillant</div>
            </button>

            {/* Template 13: Vert Forêt */}
            <button
              onClick={() => setSelectedTemplate('forest')}
              style={{
                padding: '16px',
                border: selectedTemplate === 'forest' ? '3px solid #d94a6a' : '2px solid #ddd',
                borderRadius: '8px',
                background: selectedTemplate === 'forest' ? '#fff5f7' : 'white',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ 
                width: '100%', 
                height: '120px', 
                background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)',
                borderRadius: '4px',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                color: 'white'
              }}>
                🌲
              </div>
              <div style={{ fontWeight: 'bold' }}>Vert Forêt</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Nature et bio</div>
            </button>

            {/* Template 14: Rouge Passion */}
            <button
              onClick={() => setSelectedTemplate('red-passion')}
              style={{
                padding: '16px',
                border: selectedTemplate === 'red-passion' ? '3px solid #d94a6a' : '2px solid #ddd',
                borderRadius: '8px',
                background: selectedTemplate === 'red-passion' ? '#fff5f7' : 'white',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ 
                width: '100%', 
                height: '120px', 
                background: 'linear-gradient(135deg, #C9184A 0%, #FF4D6D 100%)',
                borderRadius: '4px',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                color: 'white'
              }}>
                ❤️
              </div>
              <div style={{ fontWeight: 'bold' }}>Rouge Passion</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Intense et gourmand</div>
            </button>

            {/* Template 15: Gris Minimaliste */}
            <button
              onClick={() => setSelectedTemplate('grey-minimal')}
              style={{
                padding: '16px',
                border: selectedTemplate === 'grey-minimal' ? '3px solid #d94a6a' : '2px solid #ddd',
                borderRadius: '8px',
                background: selectedTemplate === 'grey-minimal' ? '#fff5f7' : 'white',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ 
                width: '100%', 
                height: '120px', 
                background: 'linear-gradient(135deg, #E5E5E5 0%, #CCCCCC 100%)',
                border: '2px solid #666',
                borderRadius: '4px',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                color: '#333'
              }}>
                ⚪
              </div>
              <div style={{ fontWeight: 'bold' }}>Gris Minimaliste</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Épuré et moderne</div>
            </button>
          </div>
        </div>
        )}

        {/* Design personnalisé */}
        {designMode === 'custom' && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '16px', fontSize: '18px' }}>
              🎨 Personnalisez votre design
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              {/* Couleur de fond */}
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
                  Couleur de fond
                </label>
                <input
                  type="color"
                  value={customDesign.backgroundColor}
                  onChange={(e) => setCustomDesign({...customDesign, backgroundColor: e.target.value})}
                  style={{ width: '100%', height: '40px', border: '2px solid #ddd', borderRadius: '8px', cursor: 'pointer' }}
                />
              </div>

              {/* Couleur principale */}
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
                  Couleur principale
                </label>
                <input
                  type="color"
                  value={customDesign.primaryColor}
                  onChange={(e) => setCustomDesign({...customDesign, primaryColor: e.target.value})}
                  style={{ width: '100%', height: '40px', border: '2px solid #ddd', borderRadius: '8px', cursor: 'pointer' }}
                />
              </div>

              {/* Couleur secondaire */}
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
                  Couleur secondaire
                </label>
                <input
                  type="color"
                  value={customDesign.secondaryColor}
                  onChange={(e) => setCustomDesign({...customDesign, secondaryColor: e.target.value})}
                  style={{ width: '100%', height: '40px', border: '2px solid #ddd', borderRadius: '8px', cursor: 'pointer' }}
                />
              </div>

              {/* Texte principal */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
                  Texte principal
                </label>
                <input
                  type="text"
                  value={customDesign.titleText}
                  onChange={(e) => setCustomDesign({...customDesign, titleText: e.target.value})}
                  style={{ width: '100%', padding: '10px', fontSize: '14px', border: '2px solid #ddd', borderRadius: '8px' }}
                  placeholder="Ex: SCANNEZ POUR COMMANDER"
                />
              </div>

              {/* Sous-titre */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
                  Sous-titre
                </label>
                <input
                  type="text"
                  value={customDesign.subtitleText}
                  onChange={(e) => setCustomDesign({...customDesign, subtitleText: e.target.value})}
                  style={{ width: '100%', padding: '10px', fontSize: '14px', border: '2px solid #ddd', borderRadius: '8px' }}
                  placeholder="Ex: Menu Digital"
                />
              </div>

              {/* Taille de police */}
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
                  Taille du texte
                </label>
                <select
                  value={customDesign.fontSize}
                  onChange={(e) => setCustomDesign({...customDesign, fontSize: e.target.value as any})}
                  style={{ width: '100%', padding: '10px', fontSize: '14px', border: '2px solid #ddd', borderRadius: '8px' }}
                >
                  <option value="small">Petit</option>
                  <option value="medium">Moyen</option>
                  <option value="large">Grand</option>
                </select>
              </div>

              {/* Layout */}
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
                  Position du QR
                </label>
                <select
                  value={customDesign.layout}
                  onChange={(e) => setCustomDesign({...customDesign, layout: e.target.value as any})}
                  style={{ width: '100%', padding: '10px', fontSize: '14px', border: '2px solid #ddd', borderRadius: '8px' }}
                >
                  <option value="centered">Centré</option>
                  <option value="top">En haut</option>
                  <option value="bottom">En bas</option>
                </select>
              </div>

              {/* Style de bordure */}
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
                  Bordure
                </label>
                <select
                  value={customDesign.borderStyle}
                  onChange={(e) => setCustomDesign({...customDesign, borderStyle: e.target.value as any})}
                  style={{ width: '100%', padding: '10px', fontSize: '14px', border: '2px solid #ddd', borderRadius: '8px' }}
                >
                  <option value="none">Aucune</option>
                  <option value="solid">Simple</option>
                  <option value="rounded">Arrondie</option>
                </select>
              </div>

              {/* Icône */}
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
                  Icône
                </label>
                <select
                  value={customDesign.icon}
                  onChange={(e) => setCustomDesign({...customDesign, icon: e.target.value})}
                  style={{ width: '100%', padding: '10px', fontSize: '14px', border: '2px solid #ddd', borderRadius: '8px' }}
                >
                  <option value="">Aucune</option>
                  <option value="🍽️">🍽️ Couverts</option>
                  <option value="☕">☕ Café</option>
                  <option value="🍷">🍷 Vin</option>
                  <option value="🍕">🍕 Pizza</option>
                  <option value="🍔">🍔 Burger</option>
                  <option value="🍜">🍜 Ramen</option>
                  <option value="🍣">🍣 Sushi</option>
                  <option value="🥗">🥗 Salade</option>
                  <option value="🍰">🍰 Dessert</option>
                  <option value="⭐">⭐ Étoile</option>
                </select>
              </div>

              {/* Toggle pour afficher le numéro de table */}
              <div style={{ gridColumn: 'span 2', marginTop: '8px' }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  cursor: 'pointer',
                  padding: '12px',
                  background: '#f9f9f9',
                  borderRadius: '8px',
                  border: '2px solid #e0e0e0',
                  transition: 'all 0.2s',
                }}>
                  <input
                    type="checkbox"
                    checked={customDesign.showTableNumber}
                    onChange={(e) => setCustomDesign({...customDesign, showTableNumber: e.target.checked})}
                    style={{ 
                      width: '20px', 
                      height: '20px', 
                      cursor: 'pointer',
                      accentColor: '#d94a6a',
                    }}
                  />
                  <span style={{ fontWeight: '600', fontSize: '14px', flex: 1 }}>
                    Afficher le numéro de table
                  </span>
                  <span style={{ 
                    fontSize: '12px', 
                    color: '#666',
                    background: customDesign.showTableNumber ? '#d4edda' : '#f8d7da',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontWeight: '600',
                  }}>
                    {customDesign.showTableNumber ? 'Activé' : 'Désactivé'}
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={generateQrCode}
          disabled={(qrScope === 'table' && !selectedTableId) || isGenerating}
          style={{
            width: '100%',
            padding: '16px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: 'white',
            background: (qrScope === 'global' || selectedTableId) ? '#d94a6a' : '#ccc',
            border: 'none',
            borderRadius: '8px',
            cursor: (qrScope === 'global' || selectedTableId) ? 'pointer' : 'not-allowed',
          }}
        >
          {isGenerating ? 'Génération...' : 'Générer le QR Code'}
        </button>

        {error && (
          <div style={{ 
            marginTop: '16px', 
            padding: '12px', 
            background: '#fee', 
            color: '#c00',
            borderRadius: '8px' 
          }}>
            {error}
          </div>
        )}
      </div>
      )}

      {/* Prévisualisation */}
      {(designMode === 'templates' || designMode === 'custom') && (
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
            Aperçu du Template
          </h3>

          {/* Toujours afficher l'aperçu du template */}
          <div id="template-to-print">
            {renderTemplatePreview()}
          </div>

          {/* Actions - seulement si QR généré */}
          {qrCodeUrl && (
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'center' }}>
              <button
                onClick={downloadTemplate}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: 'white',
                  background: '#d94a6a',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                <Download size={20} />
                Télécharger
              </button>
              <button
                onClick={handlePrint}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#333',
                  background: 'white',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                <Printer size={20} />
                Imprimer
              </button>
            </div>
          )}

          {/* Message si pas encore généré */}
          {!qrCodeUrl && (
            <div style={{
              marginTop: '20px',
              padding: '16px',
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '8px',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: '14px', color: '#0369a1', margin: 0 }}>
                💡 Ceci est un aperçu du design. {qrScope === 'table' ? 'Sélectionnez une table et générez' : 'Générez'} le QR code pour obtenir le template final avec les boutons de téléchargement et d'impression.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Fonction pour rendre l'aperçu du template (avec ou sans QR)
  function renderTemplatePreview() {
    const restaurantName = user?.restaurant?.name || 'Votre Restaurant';
    const tableNum = selectedTable?.number;

    // Si pas de QR code, utiliser un placeholder
    const displayQrUrl = qrCodeUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE2IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+UVIgQ29kZTwvdGV4dD48L3N2Zz4=';

    // Vérifier si c'est un template personnalisé
    const customTemplate = customTemplates.find(t => t.id === selectedTemplate);
    if (customTemplate) {
      return renderCustomSavedTemplate(customTemplate, displayQrUrl, restaurantName, tableNum);
    }

    // Si mode custom, utiliser le design personnalisé
    if (designMode === 'custom') {
      return renderCustomTemplateWithQr(restaurantName, tableNum, displayQrUrl);
    }

    switch (selectedTemplate) {
      case 'burgundy':
        return renderBurgundyTemplateWithQr(restaurantName, tableNum, displayQrUrl);
      case 'geometric':
        return renderGeometricTemplateWithQr(restaurantName, tableNum, displayQrUrl);
      case 'green':
        return renderGreenTemplateWithQr(restaurantName, tableNum, displayQrUrl);
      case 'beige':
        return renderBeigeTemplateWithQr(restaurantName, tableNum, displayQrUrl);
      case 'pink-gradient':
        return renderPinkGradientTemplateWithQr(restaurantName, tableNum, displayQrUrl);
      case 'navy':
        return renderNavyTemplateWithQr(restaurantName, tableNum, displayQrUrl);
      case 'black-gold':
        return renderBlackGoldTemplateWithQr(restaurantName, tableNum, displayQrUrl);
      case 'purple':
        return renderPurpleTemplateWithQr(restaurantName, tableNum, displayQrUrl);
      case 'orange':
        return renderOrangeTemplateWithQr(restaurantName, tableNum, displayQrUrl);
      case 'turquoise':
        return renderTurquoiseTemplateWithQr(restaurantName, tableNum, displayQrUrl);
      case 'brown':
        return renderBrownTemplateWithQr(restaurantName, tableNum, displayQrUrl);
      case 'coral':
        return renderCoralTemplateWithQr(restaurantName, tableNum, displayQrUrl);
      case 'forest':
        return renderForestTemplateWithQr(restaurantName, tableNum, displayQrUrl);
      case 'red-passion':
        return renderRedPassionTemplateWithQr(restaurantName, tableNum, displayQrUrl);
      case 'grey-minimal':
        return renderGreyMinimalTemplateWithQr(restaurantName, tableNum, displayQrUrl);
      default:
        return renderBurgundyTemplateWithQr(restaurantName, tableNum, displayQrUrl);
    }
  }

  // Fonction pour rendre un template personnalisé sauvegardé
  function renderCustomSavedTemplate(template: any, qrUrl: string, restaurantName: string, tableNum?: number) {
    return (
      <div style={{
        width: '500px',
        height: '700px',
        margin: '0 auto',
        background: template.canvasBackground,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      }}>
        {template.elements
          .sort((a: any, b: any) => (a.zIndex || 0) - (b.zIndex || 0))
          .map((element: any) => {
            // Remplacer le QR code placeholder par le vrai QR
            const elementQrUrl = element.type === 'qr' ? qrUrl : element.imageUrl;
            
            return (
              <div
                key={element.id}
                style={{
                  position: 'absolute',
                  left: `${element.x}px`,
                  top: `${element.y}px`,
                  width: `${element.width}px`,
                  height: `${element.height}px`,
                  opacity: element.opacity || 1,
                  transform: `rotate(${element.rotation || 0}deg)`,
                  transformOrigin: 'center',
                  zIndex: element.zIndex || 0,
                  ...(element.type === 'text' && {
                    fontSize: `${element.fontSize}px`,
                    fontWeight: element.fontWeight,
                    fontStyle: element.fontStyle,
                    textDecoration: element.textDecoration,
                    textAlign: element.textAlign,
                    color: element.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: element.textAlign === 'left' ? 'flex-start' : element.textAlign === 'right' ? 'flex-end' : 'center',
                    padding: '8px',
                    wordWrap: 'break-word',
                  }),
                  ...(element.type === 'qr' && {
                    backgroundImage: `url(${elementQrUrl})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                  }),
                  ...(element.type === 'shape' && {
                    backgroundColor: element.backgroundColor,
                    borderRadius: `${element.borderRadius}px`,
                    border: element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor}` : 'none',
                  }),
                }}
              >
                {element.type === 'text' && (element.content || '').replace('Votre Restaurant', restaurantName).replace(/Table \d+/, tableNum ? `Table ${tableNum}` : '')}
              </div>
            );
          })}
      </div>
    );
  }

  // Fonction pour rendre le template sélectionné (ancienne version, gardée pour compatibilité)
  function renderTemplate() {
    return renderTemplatePreview();
  }


  function renderBurgundyTemplateWithQr(restaurantName: string, tableNum: number | undefined, qrUrl: string) {
    return (
      <div style={{
        width: '400px',
        height: '566px',
        margin: '0 auto',
        background: 'white',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '55%',
          background: 'white',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 2,
        }}>
          <div style={{
            border: '4px solid #6B1B3D',
            borderRadius: '8px',
            padding: '15px',
            background: 'white',
          }}>
            <img src={qrUrl} alt="QR Code" style={{ width: '150px', height: '150px' }} />
          </div>
          <div style={{ marginTop: '15px', textAlign: 'right', width: '100%', paddingRight: '20px' }}>
            <p style={{ fontSize: '14px', fontStyle: 'italic', color: '#6B1B3D', margin: 0 }}>
              Flashez-moi
            </p>
            <p style={{ fontSize: '12px', fontStyle: 'italic', color: '#8B3D5D', margin: 0 }}>
              pour découvrir notre menu
            </p>
          </div>
        </div>
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '50%',
          background: 'linear-gradient(135deg, #6B1B3D 0%, #8B3D5D 100%)',
          clipPath: 'polygon(0 15%, 100% 0, 100% 100%, 0 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '30px 20px 20px',
          color: 'white',
          zIndex: 1,
        }}>
          <h1 style={{ fontSize: '24px', margin: 0, marginBottom: '20px', textAlign: 'center' }}>
            {restaurantName}
          </h1>
          {tableNum && (
            <div style={{
              padding: '6px 16px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '16px',
              fontSize: '12px',
              fontWeight: 'bold',
            }}>
              Table {tableNum}
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderGeometricTemplateWithQr(restaurantName: string, tableNum: number | undefined, qrUrl: string) {
    return (
      <div style={{
        width: '350px',
        height: '495px',
        margin: '0 auto',
        background: 'white',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      }}>
        {/* Triangles décoratifs */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 0,
          height: 0,
          borderLeft: '100px solid #D32F2F',
          borderBottom: '70px solid transparent',
          zIndex: 1,
        }} />
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 0,
          height: 0,
          borderRight: '85px solid #E8D5B7',
          borderBottom: '70px solid transparent',
          zIndex: 1,
        }} />
        
        {/* Section centrale noire */}
        <div style={{
          position: 'absolute',
          top: '25%',
          left: 0,
          right: 0,
          height: '50%',
          background: '#2C2C2C',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 2,
        }}>
          <h2 style={{
            color: 'white',
            fontSize: '18px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            margin: 0,
            marginBottom: '15px',
          }}>
            SCAN TO VIEW MENU
          </h2>
          <div style={{
            background: 'white',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '10px',
          }}>
            <img src={qrUrl} alt="QR Code" style={{ width: '130px', height: '130px' }} />
          </div>
        </div>
        
        {/* Bande rouge en bas */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '15%',
          background: '#D32F2F',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
        }}>
          <div style={{ textAlign: 'center', color: 'white' }}>
            <p style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>
              {restaurantName}
            </p>
            {tableNum && (
              <p style={{ fontSize: '11px', margin: 0, opacity: 0.9 }}>
                Table {tableNum}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  function renderGreenTemplateWithQr(restaurantName: string, tableNum: number | undefined, qrUrl: string) {
    return (
      <div style={{
        width: '400px',
        height: '566px',
        margin: '0 auto',
        background: 'white',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        padding: '25px',
        boxSizing: 'border-box',
      }}>
        <div style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <h1 style={{
              fontSize: '36px',
              color: '#48A868',
              margin: 0,
              fontFamily: 'cursive',
            }}>
              Scan to view Menu
            </h1>
          </div>
          
          <div style={{
            border: '6px solid #48A868',
            borderRadius: '12px',
            padding: '18px',
            background: 'white',
          }}>
            <img src={qrUrl} alt="QR Code" style={{ width: '180px', height: '180px' }} />
          </div>
          
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <p style={{
              fontSize: '20px',
              color: '#48A868',
              margin: 0,
              fontFamily: 'cursive',
            }}>
              We care about your safety
            </p>
          </div>
          
          <div style={{
            width: '100%',
            background: '#48A868',
            padding: '12px',
            textAlign: 'center',
            color: 'white',
            marginLeft: '-25px',
            marginRight: '-25px',
            marginBottom: '-25px',
          }}>
            <p style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>
              {restaurantName}
            </p>
            {tableNum && (
              <p style={{ fontSize: '13px', margin: 0, opacity: 0.9 }}>
                Table {tableNum}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  function renderBeigeTemplateWithQr(restaurantName: string, tableNum: number | undefined, qrUrl: string) {
    return (
      <div style={{
        width: '350px',
        height: '495px',
        margin: '0 auto',
        background: '#F5E6D3',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        padding: '20px',
        boxSizing: 'border-box',
      }}>
        <div style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-around',
        }}>
          <div style={{
            background: 'white',
            padding: '15px',
            borderRadius: '8px',
          }}>
            <img src={qrUrl} alt="QR Code" style={{ width: '160px', height: '160px' }} />
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <p style={{
              fontSize: '24px',
              color: '#2C2C2C',
              margin: 0,
              fontStyle: 'italic',
            }}>
              Scan to view our
            </p>
            <h1 style={{
              fontSize: '38px',
              color: '#2C2C2C',
              margin: 0,
              fontFamily: 'cursive',
            }}>
              MENU
            </h1>
          </div>
          
          <div style={{
            width: '80%',
            height: '2px',
            background: '#2C2C2C',
          }} />
          
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '16px', color: '#2C2C2C', margin: 0, fontWeight: 'bold' }}>
              {restaurantName}
            </p>
            {tableNum && (
              <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
                Table {tableNum}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  function renderPinkGradientTemplateWithQr(restaurantName: string, tableNum: number | undefined, qrUrl: string) {
    return (
      <div style={{
        width: '400px',
        height: '566px',
        margin: '0 auto',
        background: 'linear-gradient(135deg, #FF6B9D 0%, #FFA06B 100%)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        padding: '30px',
        boxSizing: 'border-box',
      }}>
        <div style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-around',
          color: 'white',
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '3px',
            margin: 0,
            textAlign: 'center',
            textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
          }}>
            SCANNEZ POUR COMMANDER
          </h1>
          
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}>
            <img src={qrUrl} alt="QR Code" style={{ width: '200px', height: '200px' }} />
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: 'bold',
              margin: 0,
              marginBottom: '10px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
            }}>
              {restaurantName}
            </h2>
            {tableNum && (
              <div style={{
                display: 'inline-block',
                padding: '8px 20px',
                background: 'rgba(255,255,255,0.3)',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 'bold',
              }}>
                Table {tableNum}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  function renderNavyTemplateWithQr(restaurantName: string, tableNum: number | undefined, qrUrl: string) {
    return (
      <div style={{
        width: '400px',
        height: '566px',
        margin: '0 auto',
        background: 'linear-gradient(135deg, #1B3A4B 0%, #4A90A4 100%)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        padding: '30px',
        boxSizing: 'border-box',
      }}>
        <div style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-around',
          color: 'white',
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{
              fontSize: '28px',
              fontWeight: 'normal',
              margin: 0,
              marginBottom: '10px',
              letterSpacing: '2px',
            }}>
              NOTRE SÉLECTION
            </h1>
            <div style={{
              width: '100px',
              height: '2px',
              background: 'white',
              margin: '0 auto',
              opacity: 0.7,
            }} />
          </div>
          
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}>
            <img src={qrUrl} alt="QR Code" style={{ width: '200px', height: '200px' }} />
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <p style={{
              fontSize: '16px',
              margin: 0,
              marginBottom: '15px',
              opacity: 0.9,
              letterSpacing: '1px',
            }}>
              Scannez le QR Code
            </p>
            <h2 style={{
              fontSize: '26px',
              fontWeight: 'bold',
              margin: 0,
              marginBottom: '10px',
            }}>
              {restaurantName}
            </h2>
            {tableNum && (
              <div style={{
                display: 'inline-block',
                padding: '6px 16px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '16px',
                fontSize: '13px',
                fontWeight: 'bold',
              }}>
                Table {tableNum}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  function renderBlackGoldTemplateWithQr(restaurantName: string, tableNum: number | undefined, qrUrl: string) {
    return (
      <div style={{
        width: '400px',
        height: '566px',
        margin: '0 auto',
        background: '#1A1A1A',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        border: '4px solid #D4AF37',
        padding: '30px',
        boxSizing: 'border-box',
      }}>
        <div style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-around',
          color: '#D4AF37',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>👑</div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              margin: 0,
              letterSpacing: '3px',
              textTransform: 'uppercase',
            }}>
              Menu Prestige
            </h1>
          </div>
          
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '3px solid #D4AF37',
          }}>
            <img src={qrUrl} alt="QR Code" style={{ width: '200px', height: '200px' }} />
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: 'bold',
              margin: 0,
              marginBottom: '10px',
              color: 'white',
            }}>
              {restaurantName}
            </h2>
            {tableNum && (
              <div style={{
                display: 'inline-block',
                padding: '8px 20px',
                background: '#D4AF37',
                color: '#1A1A1A',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 'bold',
              }}>
                Table {tableNum}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  function renderPurpleTemplateWithQr(restaurantName: string, tableNum: number | undefined, qrUrl: string) {
    return (
      <div style={{
        width: '400px',
        height: '566px',
        margin: '0 auto',
        background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        padding: '30px',
        boxSizing: 'border-box',
      }}>
        <div style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-around',
          color: 'white',
        }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 'bold',
            margin: 0,
            textAlign: 'center',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          }}>
            DÉCOUVREZ<br/>NOTRE CARTE
          </h1>
          
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}>
            <img src={qrUrl} alt="QR Code" style={{ width: '200px', height: '200px' }} />
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <h2 style={{
              fontSize: '26px',
              fontWeight: 'bold',
              margin: 0,
              marginBottom: '10px',
            }}>
              {restaurantName}
            </h2>
            {tableNum && (
              <div style={{
                display: 'inline-block',
                padding: '6px 16px',
                background: 'rgba(255,255,255,0.3)',
                borderRadius: '16px',
                fontSize: '13px',
                fontWeight: 'bold',
              }}>
                Table {tableNum}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  function renderOrangeTemplateWithQr(restaurantName: string, tableNum: number | undefined, qrUrl: string) {
    return (
      <div style={{
        width: '400px',
        height: '566px',
        margin: '0 auto',
        background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        padding: '30px',
        boxSizing: 'border-box',
      }}>
        <div style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-around',
          color: 'white',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '56px', marginBottom: '10px' }}>🔥</div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              margin: 0,
              textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
            }}>
              MENU CHAUD
            </h1>
          </div>
          
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}>
            <img src={qrUrl} alt="QR Code" style={{ width: '200px', height: '200px' }} />
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: 'bold',
              margin: 0,
              marginBottom: '10px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
            }}>
              {restaurantName}
            </h2>
            {tableNum && (
              <div style={{
                display: 'inline-block',
                padding: '8px 20px',
                background: 'rgba(255,255,255,0.3)',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 'bold',
              }}>
                Table {tableNum}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  function renderTurquoiseTemplateWithQr(restaurantName: string, tableNum: number | undefined, qrUrl: string) {
    return (
      <div style={{
        width: '400px',
        height: '566px',
        margin: '0 auto',
        background: 'linear-gradient(135deg, #0D5C63 0%, #44B3C2 100%)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        padding: '30px',
        boxSizing: 'border-box',
      }}>
        <div style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-around',
          color: 'white',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '56px', marginBottom: '10px' }}>🏝️</div>
            <h1 style={{
              fontSize: '30px',
              fontWeight: 'normal',
              margin: 0,
              fontStyle: 'italic',
            }}>
              Saveurs Tropicales
            </h1>
          </div>
          
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}>
            <img src={qrUrl} alt="QR Code" style={{ width: '200px', height: '200px' }} />
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <h2 style={{
              fontSize: '26px',
              fontWeight: 'bold',
              margin: 0,
              marginBottom: '10px',
            }}>
              {restaurantName}
            </h2>
            {tableNum && (
              <div style={{
                display: 'inline-block',
                padding: '6px 16px',
                background: 'rgba(255,255,255,0.3)',
                borderRadius: '16px',
                fontSize: '13px',
                fontWeight: 'bold',
              }}>
                Table {tableNum}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  function renderBrownTemplateWithQr(restaurantName: string, tableNum: number | undefined, qrUrl: string) {
    return (
      <div style={{
        width: '400px',
        height: '566px',
        margin: '0 auto',
        background: 'linear-gradient(135deg, #6B4423 0%, #A0826D 100%)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        padding: '30px',
        boxSizing: 'border-box',
      }}>
        <div style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-around',
          color: 'white',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '56px', marginBottom: '10px' }}>🌰</div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              margin: 0,
              fontFamily: 'Georgia, serif',
            }}>
              Cuisine Authentique
            </h1>
          </div>
          
          <div style={{
            background: '#F5E6D3',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}>
            <img src={qrUrl} alt="QR Code" style={{ width: '200px', height: '200px' }} />
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <h2 style={{
              fontSize: '26px',
              fontWeight: 'bold',
              margin: 0,
              marginBottom: '10px',
              fontFamily: 'Georgia, serif',
            }}>
              {restaurantName}
            </h2>
            {tableNum && (
              <div style={{
                display: 'inline-block',
                padding: '6px 16px',
                background: 'rgba(255,255,255,0.3)',
                borderRadius: '16px',
                fontSize: '13px',
                fontWeight: 'bold',
              }}>
                Table {tableNum}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  function renderCoralTemplateWithQr(restaurantName: string, tableNum: number | undefined, qrUrl: string) {
    return (
      <div style={{
        width: '400px',
        height: '566px',
        margin: '0 auto',
        background: 'linear-gradient(135deg, #FF7E5F 0%, #FEB47B 100%)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        padding: '30px',
        boxSizing: 'border-box',
      }}>
        <div style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-around',
          color: 'white',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '56px', marginBottom: '10px' }}>🌅</div>
            <h1 style={{
              fontSize: '34px',
              fontWeight: 'normal',
              margin: 0,
              fontStyle: 'italic',
              textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
            }}>
              Sunset Menu
            </h1>
          </div>
          
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}>
            <img src={qrUrl} alt="QR Code" style={{ width: '200px', height: '200px' }} />
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <h2 style={{
              fontSize: '26px',
              fontWeight: 'bold',
              margin: 0,
              marginBottom: '10px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
            }}>
              {restaurantName}
            </h2>
            {tableNum && (
              <div style={{
                display: 'inline-block',
                padding: '6px 16px',
                background: 'rgba(255,255,255,0.3)',
                borderRadius: '16px',
                fontSize: '13px',
                fontWeight: 'bold',
              }}>
                Table {tableNum}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  function renderForestTemplateWithQr(restaurantName: string, tableNum: number | undefined, qrUrl: string) {
    return (
      <div style={{
        width: '400px',
        height: '566px',
        margin: '0 auto',
        background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        padding: '30px',
        boxSizing: 'border-box',
      }}>
        <div style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-around',
          color: 'white',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '56px', marginBottom: '10px' }}>🌲</div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              margin: 0,
              letterSpacing: '2px',
            }}>
              CUISINE BIO
            </h1>
            <p style={{ fontSize: '16px', margin: '10px 0 0 0', opacity: 0.9 }}>
              100% Naturel
            </p>
          </div>
          
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}>
            <img src={qrUrl} alt="QR Code" style={{ width: '200px', height: '200px' }} />
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <h2 style={{
              fontSize: '26px',
              fontWeight: 'bold',
              margin: 0,
              marginBottom: '10px',
            }}>
              {restaurantName}
            </h2>
            {tableNum && (
              <div style={{
                display: 'inline-block',
                padding: '6px 16px',
                background: 'rgba(255,255,255,0.3)',
                borderRadius: '16px',
                fontSize: '13px',
                fontWeight: 'bold',
              }}>
                Table {tableNum}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  function renderRedPassionTemplateWithQr(restaurantName: string, tableNum: number | undefined, qrUrl: string) {
    return (
      <div style={{
        width: '400px',
        height: '566px',
        margin: '0 auto',
        background: 'linear-gradient(135deg, #C9184A 0%, #FF4D6D 100%)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        padding: '30px',
        boxSizing: 'border-box',
      }}>
        <div style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-around',
          color: 'white',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '56px', marginBottom: '10px' }}>❤️</div>
            <h1 style={{
              fontSize: '36px',
              fontWeight: 'bold',
              margin: 0,
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            }}>
              MENU PASSION
            </h1>
          </div>
          
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}>
            <img src={qrUrl} alt="QR Code" style={{ width: '200px', height: '200px' }} />
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: 'bold',
              margin: 0,
              marginBottom: '10px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
            }}>
              {restaurantName}
            </h2>
            {tableNum && (
              <div style={{
                display: 'inline-block',
                padding: '8px 20px',
                background: 'rgba(255,255,255,0.3)',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 'bold',
              }}>
                Table {tableNum}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  function renderGreyMinimalTemplateWithQr(restaurantName: string, tableNum: number | undefined, qrUrl: string) {
    return (
      <div style={{
        width: '400px',
        height: '566px',
        margin: '0 auto',
        background: '#F5F5F5',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        border: '3px solid #666',
        padding: '30px',
        boxSizing: 'border-box',
      }}>
        <div style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-around',
          color: '#333',
        }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'normal',
            margin: 0,
            letterSpacing: '4px',
            textTransform: 'uppercase',
          }}>
            Menu
          </h1>
          
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '2px solid #666',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          }}>
            <img src={qrUrl} alt="QR Code" style={{ width: '200px', height: '200px' }} />
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              margin: 0,
              marginBottom: '10px',
              letterSpacing: '2px',
            }}>
              {restaurantName}
            </h2>
            {tableNum && (
              <div style={{
                display: 'inline-block',
                padding: '6px 16px',
                background: '#333',
                color: 'white',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: 'bold',
              }}>
                Table {tableNum}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  function renderCustomTemplateWithQr(restaurantName: string, tableNum: number | undefined, qrUrl: string) {
    const fontSizes = {
      small: { title: '24px', subtitle: '14px' },
      medium: { title: '32px', subtitle: '16px' },
      large: { title: '40px', subtitle: '20px' },
    };

    const borderStyles = {
      none: {},
      solid: { border: `4px solid ${customDesign.primaryColor}` },
      rounded: { border: `4px solid ${customDesign.primaryColor}`, borderRadius: '24px' },
    };

    const layouts = {
      centered: { justifyContent: 'space-around' },
      top: { justifyContent: 'flex-start', paddingTop: '40px' },
      bottom: { justifyContent: 'flex-end', paddingBottom: '40px' },
    };

    return (
      <div style={{
        width: '400px',
        minHeight: '566px',
        height: 'auto',
        margin: '0 auto',
        background: customDesign.backgroundColor,
        position: 'relative',
        overflow: 'visible',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        ...borderStyles[customDesign.borderStyle],
        padding: '30px',
        paddingBottom: '40px',
        boxSizing: 'border-box',
      }}>
        <div style={{
          minHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          ...layouts[customDesign.layout],
          color: customDesign.primaryColor,
        }}>
          {/* Icône */}
          {customDesign.icon && (
            <div style={{ fontSize: '56px', marginBottom: '20px' }}>
              {customDesign.icon}
            </div>
          )}

          {/* Titre */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h1 style={{
              fontSize: fontSizes[customDesign.fontSize].title,
              fontWeight: 'bold',
              margin: 0,
              marginBottom: '10px',
              color: customDesign.primaryColor,
              textTransform: 'uppercase',
              letterSpacing: '2px',
            }}>
              {customDesign.titleText}
            </h1>
            {customDesign.subtitleText && (
              <p style={{
                fontSize: fontSizes[customDesign.fontSize].subtitle,
                margin: 0,
                color: customDesign.secondaryColor,
                fontWeight: '500',
              }}>
                {customDesign.subtitleText}
              </p>
            )}
          </div>
          
          {/* QR Code */}
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '16px',
            boxShadow: `0 8px 32px ${customDesign.primaryColor}33`,
            marginBottom: '20px',
          }}>
            <img src={qrUrl} alt="QR Code" style={{ width: '200px', height: '200px' }} />
          </div>
          
          {/* Restaurant et table */}
          <div style={{ textAlign: 'center' }}>
            <h2 style={{
              fontSize: '26px',
              fontWeight: 'bold',
              margin: 0,
              marginBottom: '10px',
              color: customDesign.secondaryColor,
            }}>
              {restaurantName}
            </h2>
            {tableNum && customDesign.showTableNumber && (
              <div style={{
                display: 'inline-block',
                padding: '8px 20px',
                background: customDesign.primaryColor,
                color: 'white',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 'bold',
              }}>
                Table {tableNum}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
};

export default SimpleQrGenerator;
