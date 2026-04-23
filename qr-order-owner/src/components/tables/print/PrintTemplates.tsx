import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useTables } from '../../../hooks/useTables';
import { tablesService } from '../../../services/tablesService';
import { useToast } from '../../Toast';
import { Printer, Settings, Download, Loader2 } from 'lucide-react';
import TemplateCard from './TemplateCard';

const templates = [
  {
    id: 'table-tent',
    name: 'Chevalet de table',
    description: 'QR code avec numéro de table, format chevalet',
    preview: '/templates/table-tent.png',
    format: 'PDF',
    exportFormat: 'pdf-multi' as const,
  },
  {
    id: 'sticker-round',
    name: 'Sticker rond',
    description: 'QR code circulaire pour autocollants',
    preview: '/templates/sticker-round.png',
    format: 'PDF',
    exportFormat: 'pdf-grid' as const,
  },
  {
    id: 'sticker-square',
    name: 'Sticker carré',
    description: 'QR code carré pour autocollants',
    preview: '/templates/sticker-square.png',
    format: 'PDF',
    exportFormat: 'pdf-grid' as const,
  },
  {
    id: 'poster-a4',
    name: 'Affiche A4',
    description: 'Grande affiche avec QR code et instructions',
    preview: '/templates/poster-a4.png',
    format: 'PDF',
    exportFormat: 'pdf-multi' as const,
  },
  {
    id: 'business-card',
    name: 'Carte de visite',
    description: 'Format carte de visite avec QR code',
    preview: '/templates/business-card.png',
    format: 'PDF',
    exportFormat: 'pdf-grid' as const,
  },
  {
    id: 'menu-insert',
    name: 'Insert menu',
    description: 'Page à insérer dans le menu physique',
    preview: '/templates/menu-insert.png',
    format: 'PDF',
    exportFormat: 'pdf-multi' as const,
  },
];

const PrintTemplates: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toastSuccess, toastError } = useToast();
  const restaurantId = user?.restaurant?.id || '';
  const { tables, loadTables } = useTables(restaurantId);

  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingTemplate, setGeneratingTemplate] = useState<string | null>(null);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  const handleGenerate = async (templateId: string) => {
    if (selectedTables.length === 0) {
      toastError('Veuillez sélectionner au moins une table.');
      return;
    }

    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    setIsGenerating(true);
    setGeneratingTemplate(templateId);

    try {
      const response = await tablesService.bulkExport({
        tableIds: selectedTables,
        format: template.exportFormat,
        size: 'large',
      });

      if (response.data.downloadUrl) {
        const link = document.createElement('a');
        link.href = response.data.downloadUrl;
        link.download = `${template.name.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toastSuccess(`${template.name} généré pour ${selectedTables.length} table(s) !`);
      } else {
        throw new Error('URL de téléchargement non disponible');
      }
    } catch (error: any) {
      console.error('Erreur génération template:', error);
      if (error.response?.status === 401) {
        toastError('Session expirée. Veuillez vous reconnecter.');
      } else if (error.response?.status === 403) {
        toastError('Vous n\'avez pas les permissions nécessaires.');
      } else if (error.response?.status === 404) {
        toastError('Une ou plusieurs tables n\'ont pas été trouvées.');
      } else if (error.response?.data?.message) {
        toastError(`Erreur : ${error.response.data.message}`);
      } else {
        toastError('Erreur lors de la génération du template. Veuillez réessayer.');
      }
    } finally {
      setIsGenerating(false);
      setGeneratingTemplate(null);
    }
  };

  const toggleTableSelection = (tableId: string) => {
    setSelectedTables((prev) =>
      prev.includes(tableId)
        ? prev.filter((id) => id !== tableId)
        : [...prev, tableId]
    );
  };

  const selectAllTables = () => {
    if (selectedTables.length === tables.length) {
      setSelectedTables([]);
    } else {
      setSelectedTables(tables.map(t => t.id));
    }
  };

  return (
    <div className="print-templates-container">
      {/* Header */}
      <div className="print-templates-header">
        <div>
          <h2>{t('tables.print.title')}</h2>
          <p>{t('tables.print.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="qr-btn qr-btn-secondary"
        >
          <Settings className="w-4 h-4" />
          {t('tables.print.configuration')}
        </button>
      </div>

      {/* Panneau de configuration */}
      {showSettings && (
        <div className="print-templates-settings">
          <div className="print-templates-settings-header">
            <h3>{t('tables.print.selectTables')}</h3>
            <button
              onClick={selectAllTables}
              className="print-templates-select-all-btn"
            >
              {selectedTables.length === tables.length ? t('tables.print.deselectAllTables') : t('tables.print.selectAllTables')}
            </button>
          </div>
          
          <div className="print-templates-table-grid">
            {tables.map((table) => (
              <button
                key={table.id}
                onClick={() => toggleTableSelection(table.id)}
                className={`print-templates-table-btn ${
                  selectedTables.includes(table.id) ? 'selected' : ''
                }`}
              >
                {table.number}
              </button>
            ))}
          </div>

          {selectedTables.length > 0 && (
            <div className="print-templates-selection-info">
              <p className="print-templates-selection-text">
                {t('tables.print.tablesSelected')
                  .replace('{count}', selectedTables.length.toString())
                  .replace('{plural}', selectedTables.length > 1 ? 's' : '')}
              </p>
              <button
                onClick={() => setSelectedTables([])}
                className="print-templates-clear-btn"
              >
                {t('tables.print.clearSelection')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Message d'information */}
      {selectedTables.length === 0 && (
        <div className="print-templates-info-box">
          <Printer className="print-templates-info-icon w-4 h-4" />
          <p className="print-templates-info-text">
            {t('tables.print.selectTablesFirst')}
          </p>
        </div>
      )}

      {/* Message de génération en cours */}
      {isGenerating && (
        <div className="print-templates-generating-box">
          <Loader2 className="print-templates-generating-icon w-5 h-5" />
          <div>
            <p className="print-templates-generating-title">
              {t('tables.print.generating')}
            </p>
            <p className="print-templates-generating-text">
              {t('tables.print.generatingMessage')}
            </p>
          </div>
        </div>
      )}

      {/* Grille de templates */}
      <div className="print-templates-grid">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onGenerate={handleGenerate}
            isGenerating={isGenerating && generatingTemplate === template.id}
            disabled={isGenerating || selectedTables.length === 0}
          />
        ))}
      </div>

      {/* Informations */}
      <div className="print-templates-tips">
        <h3>{t('tables.print.printingTips')}</h3>
        <ul>
          <li>
            <span>•</span>
            <span>{t('tables.print.tip1')}</span>
          </li>
          <li>
            <span>•</span>
            <span>{t('tables.print.tip2')}</span>
          </li>
          <li>
            <span>•</span>
            <span>{t('tables.print.tip3')}</span>
          </li>
          <li>
            <span>•</span>
            <span>{t('tables.print.tip4')}</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PrintTemplates;
