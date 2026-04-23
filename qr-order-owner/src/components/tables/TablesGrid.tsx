import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTables } from '../../hooks/useTables';
import { useQrCustomization } from '../../hooks/useQrCustomization';
import TableCard from './TableCard';
import TableForm from './TableForm';
import BulkActions from './BulkActions';
import SearchBar from './SearchBar';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const TablesGrid: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const restaurantId = user?.restaurant?.id || '';
  
  const {
    tables,
    isLoading,
    selectedTables,
    error,
    loadTables,
    createTable,
    deleteTable,
    toggleSelection,
    selectAll,
    clearSelection,
  } = useTables(restaurantId);

  const { exportBulk } = useQrCustomization();

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  const filteredTables = tables.filter((table) =>
    table.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    table.shortCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = async (tableIds: string[], format: any) => {
    const result = await exportBulk(tableIds, format);
    if (result) {
      // Télécharger le fichier
      const link = document.createElement('a');
      link.href = result.downloadUrl;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      clearSelection();
    }
  };

  if (isLoading && tables.length === 0) {
    return <LoadingSpinner text={t('tables.loadingTables')} />;
  }

  return (
    <div className="tables-grid-container">
      {/* Header */}
      <div className="tables-header">
        <div>
          <h2>{t('tables.headerTitle')}</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-400)', marginTop: '4px' }}>
            {t('tables.headerSubtitle')}
          </p>
        </div>
        <TableForm onSubmit={createTable} />
      </div>

      {/* Erreur */}
      {error && (
        <ErrorMessage message={error} onRetry={loadTables} />
      )}

      {/* Barre de recherche et actions */}
      <div className="tables-actions">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder={t('tables.searchPlaceholder')}
        />

        {tables.length > 0 && (
          <button
            onClick={selectAll}
            className="btn btn-ghost"
          >
            {selectedTables.length === tables.length
              ? t('tables.deselectAll')
              : t('tables.selectAll')}
          </button>
        )}
      </div>

      {/* Grille de tables */}
      {filteredTables.length === 0 ? (
        <div className="empty-state-container">
          <p className="empty-state-text">
            {searchTerm
              ? t('tables.noTableFound')
              : t('tables.noTableCreated')}
          </p>
        </div>
      ) : (
        <div className="tables-grid">
          {filteredTables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              isSelected={selectedTables.includes(table.id)}
              onToggleSelection={toggleSelection}
              onDelete={deleteTable}
            />
          ))}
        </div>
      )}

      {/* Actions en masse */}
      {selectedTables.length > 0 && (
        <BulkActions
          selectedCount={selectedTables.length}
          selectedTables={selectedTables}
          onClearSelection={clearSelection}
          onExport={handleExport}
        />
      )}
    </div>
  );
};

export default TablesGrid;
