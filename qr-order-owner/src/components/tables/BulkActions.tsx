import React, { useState } from 'react';
import { Download, X, FileArchive, FileText } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import type { BulkExportDto } from '../../types/table.types';

interface BulkActionsProps {
  selectedCount: number;
  selectedTables: string[];
  onClearSelection: () => void;
  onExport?: (tableIds: string[], format: BulkExportDto['format']) => Promise<void>;
}

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedCount,
  selectedTables,
  onClearSelection,
  onExport,
}) => {
  const { t } = useLanguage();
  const [isExporting, setIsExporting] = useState(false);
  const [showFormats, setShowFormats] = useState(false);

  const exportFormats: Array<{
    value: BulkExportDto['format'];
    label: string;
    icon: React.ElementType;
  }> = [
    { value: 'zip-png', label: t('tables.exportFormats.zipPng'), icon: FileArchive },
    { value: 'zip-svg', label: t('tables.exportFormats.zipSvg'), icon: FileArchive },
    { value: 'pdf-multi', label: t('tables.exportFormats.pdfMulti'), icon: FileText },
    { value: 'pdf-grid', label: t('tables.exportFormats.pdfGrid'), icon: FileText },
  ];

  const handleExport = async (format: BulkExportDto['format']) => {
    if (!onExport) return;
    
    setIsExporting(true);
    setShowFormats(false);
    
    try {
      await onExport(selectedTables, format);
    } finally {
      setIsExporting(false);
    }
  };

  const plural = selectedCount > 1 ? 's' : '';
  const countText = t('tables.selectedCount')
    .replace('{count}', selectedCount.toString())
    .replace('{plural}', plural);

  return (
    <div className="bulk-actions">
      {/* Compteur */}
      <div className="bulk-actions-count">
        {countText}
      </div>

      {/* Séparateur */}
      <div className="bulk-actions-divider" />

      {/* Actions */}
      <div className="bulk-actions-buttons">
        {onExport && (
          <div className="bulk-actions-export">
            <button
              onClick={() => setShowFormats(!showFormats)}
              disabled={isExporting}
              className="bulk-actions-btn bulk-actions-btn-primary"
            >
              <Download size={16} />
              {isExporting ? t('tables.exporting') : t('tables.exportButton')}
            </button>

            {/* Menu des formats */}
            {showFormats && (
              <div className="bulk-actions-menu">
                {exportFormats.map((format) => {
                  const Icon = format.icon;
                  return (
                    <button
                      key={format.value}
                      onClick={() => handleExport(format.value)}
                      className="bulk-actions-menu-item"
                    >
                      <Icon size={16} />
                      {format.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <button
          onClick={onClearSelection}
          className="bulk-actions-btn bulk-actions-btn-ghost"
        >
          <X size={16} />
          {t('tables.cancelSelection')}
        </button>
      </div>
    </div>
  );
};

export default BulkActions;
