import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { CreateReservationDto } from '../../../types/reservation.types';

interface ReservationFormProps {
  tables: Array<{ id: string; number: string }>;
  onSubmit: (data: Omit<CreateReservationDto, 'restaurantId'>) => Promise<boolean>;
  onClose: () => void;
}

const ReservationForm: React.FC<ReservationFormProps> = ({
  tables,
  onSubmit,
  onClose,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    partySize: 2,
    reservationDate: '',
    reservationTime: '',
    tableId: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    const success = await onSubmit({
      ...formData,
      customerEmail: formData.customerEmail || undefined,
      tableId: formData.tableId || undefined,
      notes: formData.notes || undefined,
    });
    setIsSubmitting(false);
    
    if (success) {
      onClose();
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'partySize' ? parseInt(value) || 0 : value,
    }));
  };

  return (
    <div className="reservation-modal-overlay">
      <div className="reservation-modal">
        {/* Header */}
        <div className="reservation-modal-header">
          <h2 className="reservation-modal-title">
            Nouvelle réservation
          </h2>
          <button
            onClick={onClose}
            className="reservation-modal-close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="reservation-modal-body">
          {/* Informations client */}
          <div className="reservation-form-grid">
            <div className="reservation-form-group">
              <label className="reservation-form-label">
                Nom du client *
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                required
                className="reservation-form-input"
              />
            </div>

            <div className="reservation-form-group">
              <label className="reservation-form-label">
                Téléphone *
              </label>
              <input
                type="tel"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleChange}
                required
                className="reservation-form-input"
              />
            </div>
          </div>

          <div className="reservation-form-group full-width">
            <label className="reservation-form-label">
              Email (optionnel)
            </label>
            <input
              type="email"
              name="customerEmail"
              value={formData.customerEmail}
              onChange={handleChange}
              className="reservation-form-input"
            />
          </div>

          {/* Détails de la réservation */}
          <div className="reservation-form-grid">
            <div className="reservation-form-group">
              <label className="reservation-form-label">
                Date *
              </label>
              <input
                type="date"
                name="reservationDate"
                value={formData.reservationDate}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
                className="reservation-form-input"
              />
            </div>

            <div className="reservation-form-group">
              <label className="reservation-form-label">
                Heure *
              </label>
              <input
                type="time"
                name="reservationTime"
                value={formData.reservationTime}
                onChange={handleChange}
                required
                className="reservation-form-input"
              />
            </div>

            <div className="reservation-form-group">
              <label className="reservation-form-label">
                Nombre de personnes *
              </label>
              <input
                type="number"
                name="partySize"
                value={formData.partySize}
                onChange={handleChange}
                required
                min="1"
                max="20"
                className="reservation-form-input"
              />
            </div>
          </div>

          {/* Table */}
          <div className="reservation-form-group full-width">
            <label className="reservation-form-label">
              Table (optionnel)
            </label>
            <select
              name="tableId"
              value={formData.tableId}
              onChange={handleChange}
              className="reservation-form-select"
            >
              <option value="">Aucune table assignée</option>
              {tables.map((table) => (
                <option key={table.id} value={table.id}>
                  Table {table.number}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="reservation-form-group full-width">
            <label className="reservation-form-label">
              Notes (optionnel)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="reservation-form-textarea"
              placeholder="Allergies, demandes spéciales..."
            />
          </div>
        </form>

        {/* Actions */}
        <div className="reservation-modal-footer">
          <button
            type="button"
            onClick={onClose}
            className="reservation-modal-btn reservation-modal-btn-cancel"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="reservation-modal-btn reservation-modal-btn-submit"
            onClick={handleSubmit}
          >
            {isSubmitting ? 'Création...' : 'Créer la réservation'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationForm;
