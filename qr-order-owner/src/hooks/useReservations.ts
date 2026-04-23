import { useState, useCallback } from 'react';
import { reservationsService } from '../services/reservationsService';
import type {
  Reservation,
  CreateReservationDto,
  ReservationFilters,
} from '../types/reservation.types';

export const useReservations = (restaurantId: string) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReservationFilters>({
    date: '',
    status: '',
  });

  const loadReservations = useCallback(async () => {
    if (!restaurantId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await reservationsService.getAll(
        restaurantId,
        filters.date || undefined
      );
      
      let data = response.data;
      
      // Filtrer par statut si nécessaire
      if (filters.status) {
        data = data.filter(r => r.status === filters.status);
      }
      
      setReservations(data);
    } catch (err) {
      console.error('Erreur chargement réservations', err);
      setError('Impossible de charger les réservations');
    } finally {
      setIsLoading(false);
    }
  }, [restaurantId, filters]);

  const createReservation = useCallback(async (data: Omit<CreateReservationDto, 'restaurantId'>) => {
    if (!restaurantId) return false;
    
    setError(null);
    
    try {
      await reservationsService.create({
        ...data,
        restaurantId,
      });
      await loadReservations();
      return true;
    } catch (err) {
      console.error('Erreur création réservation', err);
      setError('Impossible de créer la réservation');
      return false;
    }
  }, [restaurantId, loadReservations]);

  const confirmReservation = useCallback(async (id: string) => {
    setError(null);
    
    try {
      await reservationsService.confirm(id);
      await loadReservations();
      return true;
    } catch (err) {
      console.error('Erreur confirmation réservation', err);
      setError('Impossible de confirmer la réservation');
      return false;
    }
  }, [loadReservations]);

  const cancelReservation = useCallback(async (id: string) => {
    setError(null);
    
    try {
      await reservationsService.cancel(id);
      await loadReservations();
      return true;
    } catch (err) {
      console.error('Erreur annulation réservation', err);
      setError('Impossible d\'annuler la réservation');
      return false;
    }
  }, [loadReservations]);

  const deleteReservation = useCallback(async (id: string) => {
    setError(null);
    
    try {
      await reservationsService.delete(id);
      await loadReservations();
      return true;
    } catch (err) {
      console.error('Erreur suppression réservation', err);
      setError('Impossible de supprimer la réservation');
      return false;
    }
  }, [loadReservations]);

  const markNoShow = useCallback(async (id: string) => {
    setError(null);
    
    try {
      await reservationsService.markNoShow(id);
      await loadReservations();
      return true;
    } catch (err) {
      console.error('Erreur no-show réservation', err);
      setError('Impossible de marquer comme no-show');
      return false;
    }
  }, [loadReservations]);

  const completeReservation = useCallback(async (id: string) => {
    setError(null);
    
    try {
      await reservationsService.complete(id);
      await loadReservations();
      return true;
    } catch (err) {
      console.error('Erreur complétion réservation', err);
      setError('Impossible de compléter la réservation');
      return false;
    }
  }, [loadReservations]);

  const updateFilters = useCallback((newFilters: Partial<ReservationFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  return {
    reservations,
    isLoading,
    error,
    filters,
    loadReservations,
    createReservation,
    confirmReservation,
    cancelReservation,
    deleteReservation,
    markNoShow,
    completeReservation,
    updateFilters,
  };
};
