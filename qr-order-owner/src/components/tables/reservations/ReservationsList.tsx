import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useReservations } from '../../../hooks/useReservations';
import { useTables } from '../../../hooks/useTables';
import ReservationCard from './ReservationCard';
import ReservationForm from './ReservationForm';
import ReservationFilters from './ReservationFilters';
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';

const ReservationsList: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const restaurantId = user?.restaurant?.id || '';
  
  const {
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
  } = useReservations(restaurantId);

  const { tables, loadTables } = useTables(restaurantId);

  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadReservations();
    loadTables();
  }, [loadReservations, loadTables]);

  // Recharger quand les filtres changent
  useEffect(() => {
    loadReservations();
  }, [filters, loadReservations]);

  const handleCreateReservation = async (data: any) => {
    const success = await createReservation(data);
    if (success) {
      setShowForm(false);
    }
    return success;
  };

  if (isLoading && reservations.length === 0) {
    return <LoadingSpinner text={t('tables.reservations.loading')} />;
  }

  return (
    <div className="reservations-container">
      {/* Header */}
      <div className="reservations-header">
        <div>
          <h2>{t('tables.reservations.title')}</h2>
          <p>{t('tables.reservations.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="table-form-btn table-form-btn-submit"
        >
          <Plus className="w-4 h-4" />
          {t('tables.reservations.newReservation')}
        </button>
      </div>

      {/* Erreur */}
      {error && (
        <ErrorMessage message={error} onRetry={loadReservations} />
      )}

      {/* Filtres */}
      <ReservationFilters
        filters={filters}
        onUpdateFilters={updateFilters}
      />

      {/* Liste des réservations */}
      {reservations.length === 0 ? (
        <div className="empty-state-container">
          <p className="empty-state-text">
            {filters.date || filters.status
              ? t('tables.reservations.noReservationsFiltered')
              : t('tables.reservations.noReservations')}
          </p>
        </div>
      ) : (
        <div className="reservations-grid">
          {reservations.map((reservation) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              onConfirm={confirmReservation}
              onCancel={cancelReservation}
              onDelete={deleteReservation}
              onMarkNoShow={markNoShow}
              onComplete={completeReservation}
            />
          ))}
        </div>
      )}

      {/* Formulaire de création */}
      {showForm && (
        <ReservationForm
          tables={tables}
          onSubmit={handleCreateReservation}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default ReservationsList;
