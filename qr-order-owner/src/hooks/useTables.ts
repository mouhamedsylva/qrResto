import { useState, useCallback } from 'react';
import { tablesService } from '../services/tablesService';
import type { Table } from '../types/table.types';

export const useTables = (restaurantId: string) => {
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadTables = useCallback(async () => {
    if (!restaurantId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await tablesService.getAll(restaurantId);
      setTables(response.data);
    } catch (err) {
      console.error('Erreur chargement tables', err);
      setError('Impossible de charger les tables');
    } finally {
      setIsLoading(false);
    }
  }, [restaurantId]);

  const createTable = useCallback(async (number: string) => {
    if (!restaurantId || !number.trim()) return;
    
    setError(null);
    
    try {
      await tablesService.create(restaurantId, { number: number.trim() });
      await loadTables();
      return true;
    } catch (err) {
      console.error('Erreur création table', err);
      setError('Impossible de créer la table');
      return false;
    }
  }, [restaurantId, loadTables]);

  const deleteTable = useCallback(async (id: string) => {
    setError(null);
    
    try {
      await tablesService.delete(id);
      await loadTables();
      // Retirer de la sélection si elle était sélectionnée
      setSelectedTables(prev => prev.filter(tableId => tableId !== id));
      return true;
    } catch (err) {
      console.error('Erreur suppression table', err);
      setError('Impossible de supprimer la table');
      return false;
    }
  }, [loadTables]);

  const toggleSelection = useCallback((id: string) => {
    setSelectedTables(prev =>
      prev.includes(id)
        ? prev.filter(tableId => tableId !== id)
        : [...prev, id]
    );
  }, []);

  const selectAll = useCallback(() => {
    if (selectedTables.length === tables.length) {
      setSelectedTables([]);
    } else {
      setSelectedTables(tables.map(t => t.id));
    }
  }, [tables, selectedTables]);

  const clearSelection = useCallback(() => {
    setSelectedTables([]);
  }, []);

  return {
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
  };
};
