import React from 'react';
import { Calendar, Filter } from 'lucide-react';
import type { ReservationFilters as Filters } from '../../../types/reservation.types';

interface ReservationFiltersProps {
  filters: Filters;
  onUpdateFilters: (filters: Partial<Filters>) => void;
}

const statusOptions = [
  { value: '', label: 'Tous les statuts' },
  { value: 'PENDING', label: 'En attente' },
  { value: 'CONFIRMED', label: 'Confirmées' },
  { value: 'CANCELLED', label: 'Annulées' },
  { value: 'COMPLETED', label: 'Terminées' },
  { value: 'NO_SHOW', label: 'Absents' },
];

const ReservationFilters: React.FC<ReservationFiltersProps> = ({
  filters,
  onUpdateFilters,
}) => {
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="reservations-filters">
      <div className="reservations-filters-title">
        <Filter className="w-5 h-5" />
        <h3>Filtres</h3>
      </div>

      <div className="reservations-filters-grid">
        {/* Filtre par date */}
        <div className="filter-group">
          <label className="filter-label">
            Date
          </label>
          <input
            type="date"
            value={filters.date}
            onChange={(e) => onUpdateFilters({ date: e.target.value })}
            className="filter-input"
          />
          <div className="filter-quick-buttons">
            <button
              onClick={() => onUpdateFilters({ date: today })}
              className="filter-quick-btn filter-quick-btn-primary"
            >
              Aujourd'hui
            </button>
            <button
              onClick={() => onUpdateFilters({ date: '' })}
              className="filter-quick-btn filter-quick-btn-ghost"
            >
              Toutes les dates
            </button>
          </div>
        </div>

        {/* Filtre par statut */}
        <div className="filter-group">
          <label className="filter-label">
            Statut
          </label>
          <select
            value={filters.status}
            onChange={(e) => onUpdateFilters({ status: e.target.value })}
            className="filter-input"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default ReservationFilters;
