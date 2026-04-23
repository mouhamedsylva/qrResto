import api from './api';
import type {
  Reservation,
  CreateReservationDto,
  UpdateReservationDto,
} from '../types/reservation.types';

export const reservationsService = {
  getAll: (restaurantId: string, date?: string) => {
    const params = date
      ? `?restaurantId=${restaurantId}&date=${date}`
      : `?restaurantId=${restaurantId}`;
    return api.get<Reservation[]>(`/reservations${params}`);
  },

  getOne: (id: string) =>
    api.get<Reservation>(`/reservations/${id}`),

  create: (data: CreateReservationDto) =>
    api.post<Reservation>('/reservations', data),

  update: (id: string, data: UpdateReservationDto) =>
    api.put<Reservation>(`/reservations/${id}`, data),

  delete: (id: string) =>
    api.delete(`/reservations/${id}`),

  confirm: (id: string) =>
    api.put<Reservation>(`/reservations/${id}/confirm`, {}),

  cancel: (id: string) =>
    api.put<Reservation>(`/reservations/${id}/cancel`, {}),

  markNoShow: (id: string) =>
    api.put<Reservation>(`/reservations/${id}/no-show`, {}),

  complete: (id: string) =>
    api.put<Reservation>(`/reservations/${id}/complete`, {}),
};
