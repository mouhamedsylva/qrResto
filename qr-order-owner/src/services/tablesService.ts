import api from './api';
import type {
  Table,
  CreateTableDto,
  BulkExportDto,
  QrCustomization,
  QrResponse,
  BulkExportResponse,
} from '../types/table.types';

export const tablesService = {
  getAll: (restaurantId: string) =>
    api.get<Table[]>(`/tables/restaurant/${restaurantId}`),

  create: (restaurantId: string, data: CreateTableDto) =>
    api.post<Table>(`/tables/restaurant/${restaurantId}`, data),

  delete: (id: string) =>
    api.delete(`/tables/${id}`),

  generateQr: (id: string) =>
    api.get<QrResponse>(`/tables/${id}/qr`),

  customQr: (id: string, customization: QrCustomization) =>
    api.post<QrResponse>(`/tables/${id}/qr-custom`, customization),

  restaurantCustomQr: (restaurantId: string, customization: QrCustomization) =>
    api.post<QrResponse>(`/tables/restaurant/${restaurantId}/qr-custom`, customization),

  bulkExport: (data: BulkExportDto) =>
    api.post<BulkExportResponse>('/tables/bulk-qr-export', data),
};
