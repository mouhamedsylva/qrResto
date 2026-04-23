import React from 'react';
import { Calendar, Clock, Users, Phone, Mail, CheckCircle, XCircle, Trash2, AlertCircle } from 'lucide-react';
import { useConfirm } from '../../ConfirmModal';
import type { Reservation, ReservationStatus } from '../../../types/reservation.types';

interface ReservationCardProps {
  reservation: Reservation;
  onConfirm: (id: string) => Promise<boolean>;
  onCancel: (id: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onMarkNoShow: (id: string) => Promise<boolean>;
  onComplete: (id: string) => Promise<boolean>;
}

const statusConfig: Record<ReservationStatus, { label: string; color: string; bgColor: string }> = {
  PENDING: { label: 'En attente', color: 'text-yellow-800', bgColor: 'bg-yellow-100' },
  CONFIRMED: { label: 'Confirmée', color: 'text-green-800', bgColor: 'bg-green-100' },
  CANCELLED: { label: 'Annulée', color: 'text-red-800', bgColor: 'bg-red-100' },
  COMPLETED: { label: 'Terminée', color: 'text-blue-800', bgColor: 'bg-blue-100' },
  NO_SHOW: { label: 'Absent', color: 'text-gray-800', bgColor: 'bg-gray-100' },
};

const ReservationCard: React.FC<ReservationCardProps> = ({
  reservation,
  onConfirm,
  onCancel,
  onDelete,
  onMarkNoShow,
  onComplete,
}) => {
  const { confirm } = useConfirm();
  const status = statusConfig[reservation.status];
  const isPending = reservation.status === 'PENDING';
  const isConfirmed = reservation.status === 'CONFIRMED';

  return (
    <div className="reservation-card">
      {/* Header */}
      <div className="reservation-card-header">
        <div className="reservation-card-customer">
          <h3 className="reservation-card-name">
            {reservation.customerName}
          </h3>
          <span className={`reservation-card-status ${status.bgColor} ${status.color}`}>
            {status.label}
          </span>
        </div>
        
        {reservation.table && (
          <div className="reservation-card-table">
            <p className="reservation-card-table-label">Table</p>
            <p className="reservation-card-table-number">{reservation.table.number}</p>
          </div>
        )}
      </div>

      {/* Informations */}
      <div className="reservation-card-info">
        <div className="reservation-card-info-item">
          <Calendar className="w-4 h-4" />
          <span>{new Date(reservation.reservationDate).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}</span>
        </div>

        <div className="reservation-card-info-item">
          <Clock className="w-4 h-4" />
          <span>{reservation.reservationTime}</span>
        </div>

        <div className="reservation-card-info-item">
          <Users className="w-4 h-4" />
          <span>{reservation.partySize} personne{reservation.partySize > 1 ? 's' : ''}</span>
        </div>

        <div className="reservation-card-info-item">
          <Phone className="w-4 h-4" />
          <span>{reservation.customerPhone}</span>
        </div>

        {reservation.customerEmail && (
          <div className="reservation-card-info-item">
            <Mail className="w-4 h-4" />
            <span>{reservation.customerEmail}</span>
          </div>
        )}
      </div>

      {/* Notes */}
      {reservation.notes && (
        <div className="reservation-card-notes">
          <p className="reservation-card-notes-text">
            <span className="reservation-card-notes-label">Note:</span> {reservation.notes}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="reservation-card-actions">
        {isPending && (
          <>
            <button
              onClick={() => onConfirm(reservation.id)}
              className="reservation-card-btn reservation-card-btn-success"
            >
              <CheckCircle className="w-4 h-4" />
              Confirmer
            </button>
            <button
              onClick={() => onCancel(reservation.id)}
              className="reservation-card-btn reservation-card-btn-danger"
            >
              <XCircle className="w-4 h-4" />
              Annuler
            </button>
          </>
        )}

        {isConfirmed && (
          <>
            <button
              onClick={() => onComplete(reservation.id)}
              className="reservation-card-btn reservation-card-btn-info"
            >
              <CheckCircle className="w-4 h-4" />
              Terminer
            </button>
            <button
              onClick={() => onMarkNoShow(reservation.id)}
              className="reservation-card-btn reservation-card-btn-warning"
            >
              <AlertCircle className="w-4 h-4" />
              Absent
            </button>
          </>
        )}

        <button
          onClick={async () => {
            const ok = await confirm({
              title: 'Supprimer la réservation',
              message: `Supprimer la réservation de ${reservation.customerName} ? Cette action est irréversible.`,
              confirmLabel: 'Supprimer',
              type: 'danger',
            });
            if (ok) onDelete(reservation.id);
          }}
          className="reservation-card-btn reservation-card-btn-delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ReservationCard;
