import React, { useEffect, useState, useRef } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmModal';
import ReservationsList from '../components/tables/reservations/ReservationsList';
import SimpleQrGenerator from '../components/tables/qr/SimpleQrGenerator';
import '../styles/TablesAndQr.css';
import {
  Plus,
  Download,
  Upload,
  QrCode,
  Calendar,
  Settings,
  Eye,
  Trash2,
  Check,
  X,
  Phone,
  Mail,
  Users,  
  Clock,
  Palette,
  FileText,
  Printer,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
} from 'lucide-react';

// ─── TYPES ────────────────────────────────────────────────────────────────
type TableRow = {
  id: string;
  number: string;
  shortCode: string;
  isActive: boolean;
};

type Reservation = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  partySize: number;
  reservationDate: string;
  reservationTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  notes?: string;
  table?: { id: string; number: string };
};

type QrCustomization = {
  foregroundColor: string;
  backgroundColor: string;
  logoUrl?: string;
  text: string;
  size: 'small' | 'medium' | 'large' | 'xlarge';
  format: 'png' | 'svg' | 'pdf';
};

type PrintTemplate = 'table-tent' | 'sticker' | 'poster' | 'menu-insert';

// ─── COMPONENT ────────────────────────────────────────────────────────────
const TablesAndQrPremium: React.FC = () => {
  const { user } = useAuth();
  const { toastSuccess, toastError, toastWarning } = useToast();
  const { confirm } = useConfirm();
  const restaurantId = user?.restaurant?.id;

  // States
  const [tables, setTables] = useState<TableRow[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tables' | 'reservations' | 'qr-custom' | 'preview' | 'print'>('tables');
  const [initialTableIdForQr, setInitialTableIdForQr] = useState<string>('');
  
  // Table creation
  const [tableNumber, setTableNumber] = useState('');
  
  // Reservation modal
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [reservationForm, setReservationForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    partySize: 2,
    reservationDate: '',
    reservationTime: '',
    tableId: '',
    notes: '',
  });

  // QR Customization
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [qrCustomization, setQrCustomization] = useState<QrCustomization>({
    foregroundColor: '#000000',
    backgroundColor: '#FFFFFF',
    text: 'Scannez pour commander',
    size: 'medium',
    format: 'png',
  });
  const [qrPreview, setQrPreview] = useState<{ tableId: string; tableNumber: string; qrCodeUrl: string } | null>(null);

  // Export
  const [exportFormat, setExportFormat] = useState<'zip-png' | 'zip-svg' | 'pdf-multi' | 'pdf-grid'>('pdf-grid');
  
  // Print
  const [selectedPrintTemplate, setSelectedPrintTemplate] = useState<PrintTemplate>('table-tent');

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const logoInputRef = useRef<HTMLInputElement>(null);

  // ─── LOAD DATA ────────────────────────────────────────────────────────
  const loadTables = async () => {
    if (!restaurantId) return;
    try {
      const response = await api.get<TableRow[]>(`/tables/restaurant/${restaurantId}`);
      setTables(response.data);
    } catch (error) {
      console.error('Erreur chargement tables', error);
    }
  };

  const loadReservations = async () => {
    if (!restaurantId) return;
    try {
      const params = filterDate ? `?restaurantId=${restaurantId}&date=${filterDate}` : `?restaurantId=${restaurantId}`;
      const response = await api.get<Reservation[]>(`/reservations${params}`);
      setReservations(response.data);
    } catch (error) {
      console.error('Erreur chargement réservations', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([loadTables(), loadReservations()]);
      setIsLoading(false);
    };
    void loadData();
  }, [restaurantId, filterDate]);

  // ─── HANDLERS ─────────────────────────────────────────────────────────
  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableNumber.trim() || !restaurantId) return;
    try {
      await api.post(`/tables/restaurant/${restaurantId}`, { number: tableNumber.trim() });
      setTableNumber('');
      await loadTables();
    } catch (error) {
      console.error('Erreur création table', error);
    }
  };

  const handleDeleteTable = async (id: string) => {
    const ok = await confirm({
      title: 'Supprimer la table',
      message: 'Cette action est irréversible. La table et son QR code seront définitivement supprimés.',
      confirmLabel: 'Supprimer',
      type: 'danger',
    });
    if (!ok) return;
    try {
      await api.delete(`/tables/${id}`);
      await loadTables();
      toastSuccess('Table supprimée avec succès.');
    } catch (error) {
      console.error('Erreur suppression table', error);
      toastError('Erreur lors de la suppression de la table.');
    }
  };

  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId) return;
    try {
      await api.post('/reservations', {
        ...reservationForm,
        restaurantId,
        partySize: Number(reservationForm.partySize),
      });
      setShowReservationModal(false);
      setReservationForm({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        partySize: 2,
        reservationDate: '',
        reservationTime: '',
        tableId: '',
        notes: '',
      });
      await loadReservations();
    } catch (error) {
      console.error('Erreur création réservation', error);
    }
  };

  const handleConfirmReservation = async (id: string) => {
    try {
      await api.put(`/reservations/${id}/confirm`, {});
      await loadReservations();
    } catch (error) {
      console.error('Erreur confirmation réservation', error);
    }
  };

  const handleCancelReservation = async (id: string) => {
    try {
      await api.put(`/reservations/${id}/cancel`, {});
      await loadReservations();
    } catch (error) {
      console.error('Erreur annulation réservation', error);
    }
  };

  const handleDeleteReservation = async (id: string) => {
    const ok = await confirm({
      title: 'Supprimer la réservation',
      message: 'Cette réservation sera définitivement supprimée.',
      confirmLabel: 'Supprimer',
      type: 'danger',
    });
    if (!ok) return;
    try {
      await api.delete(`/reservations/${id}`);
      await loadReservations();
      toastSuccess('Réservation supprimée.');
    } catch (error) {
      console.error('Erreur suppression réservation', error);
      toastError('Erreur lors de la suppression de la réservation.');
    }
  };

  const handleGenerateCustomQr = (tableId: string, tableNumber: string) => {
    setInitialTableIdForQr(tableId);
    setActiveTab('qr-custom');
  };

  const handleBulkExport = async () => {
    if (!selectedTables.length) {
      toastWarning('Veuillez sélectionner au moins une table.');
      return;
    }
    try {
      const response = await api.post('/tables/bulk-qr-export', {
        tableIds: selectedTables,
        format: exportFormat,
        size: qrCustomization.size,
        customization: qrCustomization,
      });
      toastSuccess(`${response.data.message}. Téléchargement en cours...`);
      window.open(response.data.downloadUrl, '_blank');
    } catch (error) {
      console.error('Erreur export en masse', error);
      toastError('Erreur lors de l\'export. Veuillez réessayer.');
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Simuler l'upload (à remplacer par un vrai endpoint)
    const reader = new FileReader();
    reader.onload = (event) => {
      setQrCustomization(prev => ({
        ...prev,
        logoUrl: event.target?.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const toggleTableSelection = (tableId: string) => {
    setSelectedTables(prev =>
      prev.includes(tableId)
        ? prev.filter(id => id !== tableId)
        : [...prev, tableId]
    );
  };

  const selectAllTables = () => {
    if (selectedTables.length === tables.length) {
      setSelectedTables([]);
    } else {
      setSelectedTables(tables.map(t => t.id));
    }
  };

  const filteredTables = tables.filter(table =>
    table.number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getReservationStatusBadge = (status: Reservation['status']) => {
    const statusMap = {
      PENDING: { label: 'En attente', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
      CONFIRMED: { label: 'Confirmée', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
      CANCELLED: { label: 'Annulée', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
      COMPLETED: { label: 'Complétée', color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
      NO_SHOW: { label: 'No-show', color: '#64748b', bg: 'rgba(100,116,139,0.12)' },
    };
    return statusMap[status];
  };

  // ─── RENDER ───────────────────────────────────────────────────────────
  return (
    <Layout
      title="Tables & QR Codes"
      subtitle="Gestion complète de votre salle et QR codes personnalisés"
    >
      {/* Navigation Tabs */}
      <div className="premium-tabs">
        <button
          className={`premium-tab ${activeTab === 'tables' ? 'active' : ''}`}
          onClick={() => setActiveTab('tables')}
        >
          <QrCode size={18} />
          Tables & QR
        </button>
        <button
          className={`premium-tab ${activeTab === 'reservations' ? 'active' : ''}`}
          onClick={() => setActiveTab('reservations')}
        >
          <Calendar size={18} />
          Réservations
        </button>
        <button
          className={`premium-tab ${activeTab === 'qr-custom' ? 'active' : ''}`}
          onClick={() => setActiveTab('qr-custom')}
        >
          <Palette size={18} />
          Personnalisation QR
        </button>
      </div>

      {/* Tab Content */}
      <div className="premium-tab-content">
        {/* TABLES TAB */}
        {activeTab === 'tables' && (
          <div className="premium-section">
            <div className="card premium-card">
              <div className="card-header premium-header">
                <div>
                  <h3 className="premium-title">Gestion des tables</h3>
                  <p className="premium-subtitle">{tables.length} table(s) configurée(s)</p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <form onSubmit={handleCreateTable} style={{ display: 'flex', gap: 8 }}>
                    <input
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      placeholder="Numéro (ex: 12)"
                      className="premium-input"
                      style={{ width: 120 }}
                    />
                    <button className="btn btn-primary" type="submit">
                      <Plus size={16} /> Ajouter
                    </button>
                  </form>
                </div>
              </div>

              <div className="card-body">
                {/* Search */}
                <div className="premium-search-bar">
                  <Search size={18} />
                  <input
                    type="text"
                    placeholder="Rechercher une table..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="premium-search-input"
                  />
                </div>

                {/* Tables Grid */}
                <div className="premium-tables-grid">
                  {filteredTables.map((table) => (
                    <div key={table.id} className="premium-table-card">
                      <div className="premium-table-header">
                        <div className="premium-table-number">
                          Table {table.number}
                        </div>
                        <label className="premium-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedTables.includes(table.id)}
                            onChange={() => toggleTableSelection(table.id)}
                          />
                          <span className="checkmark"></span>
                        </label>
                      </div>

                      <div className="premium-table-code">
                        Code: <span>{table.shortCode}</span>
                      </div>

                      <div className="premium-table-actions">
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleGenerateCustomQr(table.id, table.number)}
                        >
                          <QrCode size={14} /> QR Code
                        </button>
                        <button
                          className="btn btn-ghost btn-sm btn-danger"
                          onClick={() => handleDeleteTable(table.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bulk Actions */}
                {selectedTables.length > 0 && (
                  <div className="premium-bulk-actions">
                    <div className="premium-bulk-info">
                      <Check size={16} />
                      {selectedTables.length} table(s) sélectionnée(s)
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <select
                        value={exportFormat}
                        onChange={(e) => setExportFormat(e.target.value as any)}
                        className="premium-select"
                      >
                        <option value="zip-png">ZIP de PNG</option>
                        <option value="zip-svg">ZIP de SVG</option>
                        <option value="pdf-multi">PDF multi-pages</option>
                        <option value="pdf-grid">PDF grille (4x4)</option>
                      </select>
                      <button className="btn btn-primary" onClick={handleBulkExport}>
                        <Download size={14} /> Exporter {selectedTables.length} QR
                      </button>
                      <button className="btn btn-ghost" onClick={() => setSelectedTables([])}>
                        Désélectionner
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* RESERVATIONS TAB */}
        {activeTab === 'reservations' && (
          <ReservationsList />
        )}

        {/* QR CUSTOM TAB */}
        {activeTab === 'qr-custom' && (
          <SimpleQrGenerator initialTableId={initialTableIdForQr} />
        )}
      </div>

      <style>{`
        .premium-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          border-bottom: 2px solid var(--border);
          padding-bottom: 0;
        }

        .premium-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: transparent;
          border: none;
          border-bottom: 3px solid transparent;
          color: var(--text-600);
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: -2px;
        }

        .premium-tab:hover {
          color: var(--primary);
          background: var(--primary-faint);
        }

        .premium-tab.active {
          color: var(--primary);
          border-bottom-color: var(--primary);
        }

        .premium-card {
          border-radius: 16px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .premium-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid var(--border);
        }

        .premium-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--text-900);
          margin: 0;
        }

        .premium-subtitle {
          font-size: 13px;
          color: var(--text-500);
          margin: 4px 0 0 0;
        }

        .premium-input {
          height: 40px;
          padding: 0 14px;
          border: 1.5px solid var(--border);
          border-radius: 10px;
          font-size: 14px;
          transition: all 0.2s;
        }

        .premium-input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--primary-faint);
        }

        .premium-search-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: var(--surface-1);
          border-radius: 12px;
          margin-bottom: 20px;
        }

        .premium-search-input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 14px;
          outline: none;
        }

        .premium-tables-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }

        .premium-table-card {
          background: var(--surface-0);
          border: 1.5px solid var(--border);
          border-radius: 12px;
          padding: 20px;
          transition: all 0.2s;
        }

        .premium-table-card:hover {
          border-color: var(--primary);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transform: translateY(-2px);
        }

        .premium-table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .premium-table-number {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-900);
        }

        .premium-checkbox {
          position: relative;
          display: inline-block;
          width: 20px;
          height: 20px;
          cursor: pointer;
        }

        .premium-checkbox input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .premium-checkbox .checkmark {
          position: absolute;
          top: 0;
          left: 0;
          height: 20px;
          width: 20px;
          background-color: var(--surface-1);
          border: 2px solid var(--border);
          border-radius: 4px;
          transition: all 0.2s;
        }

        .premium-checkbox input:checked ~ .checkmark {
          background-color: var(--primary);
          border-color: var(--primary);
        }

        .premium-checkbox .checkmark:after {
          content: "";
          position: absolute;
          display: none;
          left: 5px;
          top: 2px;
          width: 4px;
          height: 8px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }

        .premium-checkbox input:checked ~ .checkmark:after {
          display: block;
        }

        .premium-table-code {
          font-size: 12px;
          color: var(--text-500);
          margin-bottom: 16px;
          padding: 8px 12px;
          background: var(--surface-1);
          border-radius: 6px;
        }

        .premium-table-code span {
          font-weight: 600;
          color: var(--text-700);
        }

        .premium-table-actions {
          display: flex;
          gap: 8px;
        }

        .premium-bulk-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: linear-gradient(135deg, var(--primary-faint) 0%, rgba(99,102,241,0.08) 100%);
          border-radius: 12px;
          border: 1.5px solid var(--primary);
        }

        .premium-bulk-info {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: var(--primary);
        }

        .premium-select {
          height: 36px;
          padding: 0 12px;
          border: 1.5px solid var(--border);
          border-radius: 8px;
          font-size: 13px;
          background: var(--surface-0);
          cursor: pointer;
        }

        .btn-danger {
          color: #ef4444 !important;
        }

        .btn-danger:hover {
          background: rgba(239, 68, 68, 0.1) !important;
        }
      `}</style>
    </Layout>
  );
};

export default TablesAndQrPremium;
