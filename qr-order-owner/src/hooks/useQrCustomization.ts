import { useState, useCallback } from 'react';
import { tablesService } from '../services/tablesService';
import type {
  QrCustomization,
  BulkExportDto,
  QrResponse,
} from '../types/table.types';

export const useQrCustomization = () => {
  const [customization, setCustomization] = useState<QrCustomization>({
    foregroundColor: '#000000',
    backgroundColor: '#FFFFFF',
    text: 'Scannez pour commander',
    size: 'medium',
    format: 'png',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<QrResponse | null>(null);

  const updateColor = useCallback((type: 'foreground' | 'background', color: string) => {
    setCustomization(prev => ({
      ...prev,
      [type === 'foreground' ? 'foregroundColor' : 'backgroundColor']: color,
    }));
  }, []);

  const updateText = useCallback((text: string) => {
    setCustomization(prev => ({ ...prev, text }));
  }, []);

  const updateSize = useCallback((size: QrCustomization['size']) => {
    setCustomization(prev => ({ ...prev, size }));
  }, []);

  const updateFormat = useCallback((format: QrCustomization['format']) => {
    setCustomization(prev => ({ ...prev, format }));
  }, []);

  const uploadLogo = useCallback(async (file: File) => {
    setError(null);
    
    try {
      // Convertir en base64 pour la prévisualisation
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoUrl = e.target?.result as string;
        setCustomization(prev => ({ ...prev, logoUrl }));
      };
      reader.readAsDataURL(file);
      
      // TODO: Upload réel vers le serveur si nécessaire
      // const formData = new FormData();
      // formData.append('logo', file);
      // const response = await api.post('/upload/logo', formData);
      // setCustomization(prev => ({ ...prev, logoUrl: response.data.url }));
      
      return true;
    } catch (err) {
      console.error('Erreur upload logo', err);
      setError('Impossible d\'uploader le logo');
      return false;
    }
  }, []);

  const removeLogo = useCallback(() => {
    setCustomization(prev => ({ ...prev, logoUrl: undefined }));
  }, []);

  const generateQr = useCallback(async (tableId: string) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await tablesService.customQr(tableId, customization);
      setPreview(response.data);
      return response.data;
    } catch (err) {
      console.error('Erreur génération QR', err);
      setError('Impossible de générer le QR code');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [customization]);

  const exportBulk = useCallback(async (
    tableIds: string[],
    format: BulkExportDto['format']
  ) => {
    if (!tableIds.length) {
      setError('Veuillez sélectionner au moins une table');
      return null;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await tablesService.bulkExport({
        tableIds,
        format,
        size: customization.size,
        customization,
      });
      
      return response.data;
    } catch (err) {
      console.error('Erreur export en masse', err);
      setError('Impossible d\'exporter les QR codes');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [customization]);

  const clearPreview = useCallback(() => {
    setPreview(null);
  }, []);

  const resetCustomization = useCallback(() => {
    setCustomization({
      foregroundColor: '#000000',
      backgroundColor: '#FFFFFF',
      text: 'Scannez pour commander',
      size: 'medium',
      format: 'png',
    });
    setPreview(null);
  }, []);

  return {
    customization,
    isGenerating,
    error,
    preview,
    updateColor,
    updateText,
    updateSize,
    updateFormat,
    uploadLogo,
    removeLogo,
    generateQr,
    exportBulk,
    clearPreview,
    resetCustomization,
  };
};
