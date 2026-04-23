export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
}

export type Reservation = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  partySize: number;
  reservationDate: string;
  reservationTime: string;
  status: ReservationStatus;
  notes?: string;
  table?: {
    id: string;
    number: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

export type CreateReservationDto = {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  partySize: number;
  reservationDate: string;
  reservationTime: string;
  tableId?: string;
  notes?: string;
  restaurantId: string;
};

export type UpdateReservationDto = Partial<CreateReservationDto> & {
  status?: ReservationStatus;
};

export type ReservationFilters = {
  date?: string;
  status?: ReservationStatus | '';
};
