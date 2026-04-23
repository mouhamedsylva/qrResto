import React from 'react';
import { Download, X } from 'lucide-react';
import type { QrResponse } from '../../../types/table.types';

interface QrPreviewProps {
  preview: QrResponse;
  onClose: () => void;
}

const QrPreview: React.FC<QrPreviewProps> = ({ preview, onClose }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = preview.qrCodeUrl;
    link.download = preview.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="qr-preview-modal-overlay">
      <div className="qr-preview-modal">
        {/* Header */}
        <div className="qr-preview-modal-header">
          <h3 className="qr-preview-modal-title">
            Prévisualisation QR Code
          </h3>
          <button
            onClick={onClose}
            className="qr-preview-modal-close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Preview */}
        <div className="qr-preview-modal-body">
          <div className="qr-preview-modal-content">
            <img
              src={preview.qrCodeUrl}
              alt={`QR Code Table ${preview.tableNumber}`}
              className="qr-preview-modal-image"
            />
            <div className="qr-preview-modal-info">
              <p className="qr-preview-modal-table">
                Table {preview.tableNumber}
              </p>
              <p className="qr-preview-modal-code">
                {preview.shortCode}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="qr-preview-modal-actions">
            <button
              onClick={handleDownload}
              className="qr-btn qr-btn-primary"
            >
              <Download className="w-4 h-4" />
              Télécharger
            </button>
            <button
              onClick={onClose}
              className="qr-btn qr-btn-secondary"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QrPreview;
