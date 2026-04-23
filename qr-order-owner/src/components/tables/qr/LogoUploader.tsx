import React, { useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useToast } from '../../Toast';

interface LogoUploaderProps {
  logoUrl?: string;
  onUpload: (file: File) => Promise<boolean>;
  onRemove: () => void;
}

const LogoUploader: React.FC<LogoUploaderProps> = ({
  logoUrl,
  onUpload,
  onRemove,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toastWarning } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toastWarning('Veuillez sélectionner une image (PNG, JPG, SVG).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toastWarning('L\'image ne doit pas dépasser 2MB.');
      return;
    }

    await onUpload(file);
  };

  return (
    <div className="logo-uploader-container">
      <label className="logo-uploader-label">
        <ImageIcon className="w-4 h-4" />
        Logo (optionnel)
      </label>

      {logoUrl ? (
        <div className="logo-preview">
          <img
            src={logoUrl}
            alt="Logo"
          />
          <button
            onClick={onRemove}
            className="logo-remove-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="logo-upload-area"
        >
          <Upload className="logo-upload-icon" />
          <p className="logo-upload-text">
            Cliquez pour uploader un logo
          </p>
          <p className="logo-upload-hint">
            PNG, JPG, SVG (max 2MB)
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default LogoUploader;
