import React, { useState } from 'react';
import { QrCode, Trash2, Download, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useConfirm } from '../ConfirmModal';
import type { Table } from '../../types/table.types';

interface TableCardProps {
  table: Table;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  onDelete: (id: string) => Promise<boolean>;
  onGenerateQr?: (id: string) => void;
}

const TableCard: React.FC<TableCardProps> = ({
  table,
  isSelected,
  onToggleSelection,
  onDelete,
  onGenerateQr,
}) => {
  const { t } = useLanguage();
  const { confirm } = useConfirm();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const ok = await confirm({
      title: `Supprimer la table ${table.number}`,
      message: 'Cette action est irréversible. Le QR code associé sera également supprimé.',
      confirmLabel: 'Supprimer',
      type: 'danger',
    });
    if (!ok) return;
    setIsDeleting(true);
    await onDelete(table.id);
    setIsDeleting(false);
  };

  return (
    <div
      className={`table-card ${isSelected ? 'selected' : ''} ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
      style={{ opacity: isDeleting ? 0.5 : 1, pointerEvents: isDeleting ? 'none' : 'auto' }}
    >
      {/* Checkbox de sélection */}
      <div className="table-card-checkbox">
        <button
          onClick={() => onToggleSelection(table.id)}
          style={{ 
            width: '100%', 
            height: '100%', 
            background: 'transparent', 
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          {isSelected && <Check size={14} />}
        </button>
      </div>

      {/* Numéro de table */}
      <div style={{ marginBottom: '16px' }}>
        <h3 className="table-card-number">
          {t('tables.table')} {table.number}
        </h3>
        <p className="table-card-code">
          {t('tables.code')}: {table.shortCode}
        </p>
      </div>

      {/* Statut */}
      <div style={{ marginBottom: '16px' }}>
        <span className={`table-card-status ${table.isActive ? 'active' : 'inactive'}`}>
          {table.isActive ? t('tables.active') : t('tables.inactive')}
        </span>
      </div>

      {/* Actions */}
      <div className="table-card-actions">
        <button
          onClick={() => onGenerateQr?.(table.id)}
          className="table-card-btn table-card-btn-primary"
        >
          <QrCode size={16} />
          {t('tables.qrCodeButton')}
        </button>

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="table-card-btn table-card-btn-danger"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default TableCard;
