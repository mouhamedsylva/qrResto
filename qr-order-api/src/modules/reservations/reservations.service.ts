import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation, ReservationStatus } from './entities/reservation.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
  ) {}

  async create(createReservationDto: CreateReservationDto) {
    const { restaurantId, tableId, ...data } = createReservationDto;

    const reservation = this.reservationRepository.create({
      ...data,
      restaurant: { id: restaurantId } as any,
      table: tableId ? ({ id: tableId } as any) : null,
    });

    return this.reservationRepository.save(reservation);
  }

  async findAll(restaurantId: string, date?: string) {
    const query = this.reservationRepository
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.table', 'table')
      .where('reservation.restaurantId = :restaurantId', { restaurantId })
      .orderBy('reservation.reservationDate', 'ASC')
      .addOrderBy('reservation.reservationTime', 'ASC');

    if (date) {
      query.andWhere('reservation.reservationDate = :date', { date });
    }

    return query.getMany();
  }

  async findOne(id: string) {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['table', 'restaurant'],
    });

    if (!reservation) {
      throw new NotFoundException('Réservation introuvable');
    }

    return reservation;
  }

  async update(id: string, updateReservationDto: UpdateReservationDto) {
    const reservation = await this.findOne(id);

    const { restaurantId, tableId, ...data } = updateReservationDto;

    Object.assign(reservation, data);

    if (tableId !== undefined) {
      reservation.table = tableId ? ({ id: tableId } as any) : null;
    }

    return this.reservationRepository.save(reservation);
  }

  async remove(id: string) {
    const result = await this.reservationRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Réservation introuvable');
    }
    return { success: true };
  }

  async confirm(id: string) {
    return this.update(id, { status: ReservationStatus.CONFIRMED });
  }

  async cancel(id: string) {
    return this.update(id, { status: ReservationStatus.CANCELLED });
  }

  async markAsNoShow(id: string) {
    return this.update(id, { status: ReservationStatus.NO_SHOW });
  }

  async complete(id: string) {
    return this.update(id, { status: ReservationStatus.COMPLETED });
  }
}
