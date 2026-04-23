export type Table = {
  id: string;
  number: string;
  shortCode: string;
  isActive: boolean;
};

export type CreateTableDto = {
  number: string;
};

export type QrCustomization = {
  foregroundColor: string;
  backgroundColor: string;
  logoUrl?: string;
  text: string;
  size: 'small' | 'medium' | 'large' | 'xlarge';
  format: 'png' | 'svg' | 'pdf';
};

export type BulkExportDto = {
  tableIds: string[];
  format: 'zip-png' | 'zip-svg' | 'pdf-multi' | 'pdf-grid';
  size: 'small' | 'medium' | 'large' | 'xlarge';
  customization?: QrCustomization;
};

export type QrResponse = {
  tableId: string;
  tableNumber: string;
  qrCodeUrl: string;
  format?: string;
  customization?: QrCustomization;
};

export type BulkExportResponse = {
  format: string;
  qrCodes: Array<{
    tableId: string;
    tableNumber: string;
    qrCodeUrl: string;
  }>;
  downloadUrl: string;
  message: string;
};
