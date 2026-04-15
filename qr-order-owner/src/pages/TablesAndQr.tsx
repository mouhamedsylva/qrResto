import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

type TableRow = {
  id: string;
  number: string;
  shortCode: string;
  isActive: boolean;
};

type RestaurantSettings = {
  primaryColor: string;
  secondaryColor: string;
};

type TableStatus = 'FREE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING';

type QrTemplateKey = 'CLASSIC' | 'MODERN' | 'MINIMAL' | 'LUXURY';

type QrTemplate = {
  key: QrTemplateKey;
  name: string;
  borderRadius: number;
  borderWidth: number;
  frameStyle: string;
};

const qrTemplates: QrTemplate[] = [
  { key: 'CLASSIC', name: 'Classic', borderRadius: 10, borderWidth: 1, frameStyle: '#e2e8f0' },
  { key: 'MODERN', name: 'Modern', borderRadius: 18, borderWidth: 2, frameStyle: 'rgba(14,165,233,0.28)' },
  { key: 'MINIMAL', name: 'Minimal', borderRadius: 6, borderWidth: 1, frameStyle: 'rgba(15,23,42,0.08)' },
  { key: 'LUXURY', name: 'Luxury', borderRadius: 20, borderWidth: 2, frameStyle: 'rgba(217,74,106,0.34)' },
];

const TablesAndQr: React.FC = () => {
  const { user } = useAuth();
  const [tables, setTables] = useState<TableRow[]>([]);
  const [tableStatuses, setTableStatuses] = useState<Record<string, TableStatus>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [tableNumber, setTableNumber] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [settings, setSettings] = useState<RestaurantSettings>({
    primaryColor: '#0EA5E9',
    secondaryColor: '#FFFFFF',
  });
  const [selectedTemplate, setSelectedTemplate] = useState<QrTemplateKey>('MODERN');
  const [isRegeneratingQr, setIsRegeneratingQr] = useState(false);
  const [qrPreview, setQrPreview] = useState<{
    tableId: string;
    tableNumber: string;
    qrCodeUrl: string;
  } | null>(null);

  const restaurantId = user?.restaurant?.id;

  const loadTables = async () => {
    if (!restaurantId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.get<TableRow[]>(
        `/tables/restaurant/${restaurantId}`,
      );
      setTables(response.data);
      setTableStatuses((prev) => {
        const next = { ...prev };
        response.data.forEach((table, index) => {
          if (!next[table.id]) {
            next[table.id] = table.isActive
              ? index % 3 === 0
                ? 'OCCUPIED'
                : 'FREE'
              : 'RESERVED';
          }
        });
        return next;
      });
    } catch (error) {
      console.error('Erreur chargement tables', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadTables();
  }, [restaurantId]);

  useEffect(() => {
    const loadSettings = async () => {
      if (!restaurantId) return;
      try {
        const response = await api.get<RestaurantSettings>(
          `/restaurants/${restaurantId}/settings`,
        );
        setSettings({
          primaryColor: response.data?.primaryColor || '#0EA5E9',
          secondaryColor: response.data?.secondaryColor || '#FFFFFF',
        });
      } catch (error) {
        console.error('Erreur chargement theme QR', error);
      }
    };
    void loadSettings();
  }, [restaurantId]);

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableNumber.trim() || !restaurantId) return;
    try {
      await api.post(`/tables/restaurant/${restaurantId}`, {
        number: tableNumber.trim(),
      });
      setTableNumber('');
      setFeedback(null);
      await loadTables();
    } catch (error) {
      console.error('Erreur creation table', error);
      setFeedback("Impossible d'ajouter la table. Verifiez les donnees et le backend.");
    }
  };

  const handleDeleteTable = async (id: string) => {
    const ok = window.confirm('Supprimer cette table ?');
    if (!ok) return;
    try {
      await api.delete(`/tables/${id}`);
      await loadTables();
    } catch (error) {
      console.error('Erreur suppression table', error);
      setFeedback('Impossible de supprimer la table.');
    }
  };

  const handleDownloadQr = async (id: string, number: string) => {
    try {
      const response = await api.get<{ qrCodeUrl: string }>(`/tables/${id}/qr`);
      setQrPreview({
        tableId: id,
        tableNumber: number,
        qrCodeUrl: response.data.qrCodeUrl,
      });
    } catch (error) {
      console.error('Erreur QR table', error);
      setFeedback('Impossible de recuperer le QR code.');
    }
  };

  const handleRegenerateQr = async () => {
    if (!qrPreview) return;
    setIsRegeneratingQr(true);
    try {
      const response = await api.get<{ qrCodeUrl: string }>(
        `/tables/${qrPreview.tableId}/qr`,
      );
      const refreshedUrl = `${response.data.qrCodeUrl}${
        response.data.qrCodeUrl.includes('?') ? '&' : '?'
      }t=${Date.now()}`;
      setQrPreview((prev) =>
        prev
          ? {
              ...prev,
              qrCodeUrl: refreshedUrl,
            }
          : prev,
      );
      setFeedback('QR regénéré avec succes.');
    } catch (error) {
      console.error('Erreur regeneration QR', error);
      setFeedback('Impossible de regenerer le QR code.');
    } finally {
      setIsRegeneratingQr(false);
    }
  };

  const setQuickStatus = (tableId: string, status: TableStatus) => {
    setTableStatuses((prev) => ({ ...prev, [tableId]: status }));
    setFeedback(
      `Statut table mis a jour: ${
        status === 'FREE'
          ? 'Libre'
          : status === 'OCCUPIED'
            ? 'Occupee'
            : status === 'RESERVED'
              ? 'Reservee'
              : 'Nettoyage'
      }`,
    );
  };

  const openOrderView = (tableNumber: string) => {
    setFeedback(`Ouverture des commandes pour la table ${tableNumber} (frontend mock).`);
  };

  const template = qrTemplates.find((item) => item.key === selectedTemplate) || qrTemplates[0];

  const downloadPreviewQr = () => {
    if (!qrPreview) return;
    const link = document.createElement('a');
    link.href = qrPreview.qrCodeUrl;
    link.target = '_blank';
    link.download = `table-${qrPreview.tableNumber}-qr.png`;
    link.click();
  };

  return (
    <Layout title="Tables & QR" subtitle="Gestion de salle et QR codes.">
      <div className="card" style={{ padding: 20 }}>
        <div className="card-header">
          <span className="card-title">Liste des tables</span>
          <form
            onSubmit={handleCreateTable}
            style={{ display: 'flex', gap: 8, alignItems: 'center' }}
          >
            <input
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="Numero (ex: 12)"
              style={{
                height: 32,
                borderRadius: 8,
                border: '1px solid var(--border)',
                padding: '0 10px',
              }}
            />
            <button className="btn btn-primary btn-sm" type="submit">
              Ajouter une table
            </button>
          </form>
        </div>
        <div className="card-body">
          {feedback && (
            <div style={{ padding: '10px 22px', color: '#b91c1c', fontSize: 13 }}>
              {feedback}
            </div>
          )}
          <table className="data-table">
            <thead>
              <tr>
                <th>Table</th>
                <th>Code</th>
                <th>Statut</th>
                <th>QR Code</th>
                <th>Actions rapides</th>
              </tr>
            </thead>
            <tbody>
              {tables.map((table) => (
                <tr key={table.id}>
                  <td style={{ fontWeight: 600 }}>{table.number}</td>
                  <td>{table.shortCode}</td>
                  <td>
                    {(() => {
                      const status = tableStatuses[table.id] || (table.isActive ? 'FREE' : 'RESERVED');
                      const statusLabel =
                        status === 'FREE'
                          ? 'Libre'
                          : status === 'OCCUPIED'
                            ? 'Occupee'
                            : status === 'RESERVED'
                              ? 'Reservee'
                              : 'Nettoyage';
                      const styleMap: Record<TableStatus, { bg: string; color: string }> = {
                        FREE: { bg: 'rgba(148,163,184,0.14)', color: '#475569' },
                        OCCUPIED: { bg: 'rgba(14,165,233,0.14)', color: '#0369a1' },
                        RESERVED: { bg: 'rgba(217,74,106,0.14)', color: '#9b2c49' },
                        CLEANING: { bg: 'rgba(245,158,11,0.14)', color: '#b45309' },
                      };
                      const style = styleMap[status];
                      return (
                    <span
                      className="status-badge"
                      style={{
                            background: style.bg,
                            color: style.color,
                      }}
                    >
                          {statusLabel}
                    </span>
                      );
                    })()}
                  </td>
                  <td>Table #{table.number}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => openOrderView(table.number)}
                      >
                        Ouvrir commandes
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setQuickStatus(table.id, 'FREE')}
                      >
                        Marquer libre
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setQuickStatus(table.id, 'RESERVED')}
                      >
                        Reserver
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setQuickStatus(table.id, 'CLEANING')}
                      >
                        Nettoyage
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => void handleDownloadQr(table.id, table.number)}
                      >
                        Telecharger QR
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => void handleDeleteTable(table.id)}
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && tables.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-500)' }}>
                    Aucune table pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {qrPreview && (
        <div className="confirm-modal-backdrop">
          <div
            className="confirm-modal"
            style={{
              maxWidth: 420,
              background: settings.secondaryColor,
            }}
          >
            <div
              style={{
                background: settings.primaryColor,
                color: '#fff',
                borderRadius: 10,
                padding: '10px 12px',
                fontWeight: 700,
                marginBottom: 12,
              }}
            >
              Table {qrPreview.tableNumber} - Preview avancee
            </div>
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 12, color: 'var(--text-600)', marginBottom: 6 }}>
                Template QR
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {qrTemplates.map((item) => (
                  <button
                    key={item.key}
                    className="btn btn-ghost btn-sm"
                    style={{
                      borderColor:
                        selectedTemplate === item.key ? 'var(--primary)' : 'var(--border)',
                      color: selectedTemplate === item.key ? 'var(--primary)' : 'var(--text-600)',
                    }}
                    onClick={() => setSelectedTemplate(item.key)}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
            <div
              style={{
                background: '#fff',
                border: `${template.borderWidth}px solid ${template.frameStyle}`,
                borderRadius: template.borderRadius,
                padding: 12,
                marginBottom: 14,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  borderRadius: 8,
                  background: template.frameStyle,
                  color: '#334155',
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  padding: '4px 8px',
                  width: 'fit-content',
                }}
              >
                {template.name}
              </div>
              <img
                src={qrPreview.qrCodeUrl}
                alt={`QR Table ${qrPreview.tableNumber}`}
                style={{ width: 240, height: 240, objectFit: 'contain' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="btn btn-ghost" onClick={() => setQrPreview(null)}>
                Fermer
              </button>
              <button
                className="btn btn-ghost"
                onClick={handleRegenerateQr}
                disabled={isRegeneratingQr}
              >
                {isRegeneratingQr ? 'Regeneration...' : 'Regenerer QR'}
              </button>
              <button className="btn btn-primary" onClick={downloadPreviewQr}>
                Telecharger
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default TablesAndQr;
