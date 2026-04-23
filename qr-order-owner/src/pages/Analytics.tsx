import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import {
  BarChart3,
  CalendarDays,
  Download,
  TrendingDown,
  TrendingUp,
  Users,
  Euro,
  Percent,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

type OrderStatus = 'COMPLETED' | 'CANCELLED' | 'PREPARING' | 'PENDING' | 'READY';
type Period = 'TODAY' | 'LAST_7' | 'LAST_30' | 'CUSTOM';

type AnalyticsData = {
  period: {
    start: string;
    end: string;
  };
  kpis: {
    revenue: { value: number; trend: number };
    orders: { value: number; trend: number };
    avgTicket: { value: number; trend: number };
    uniqueClients: { value: number; trend: number };
  };
  topItems: Array<{ name: string; orders: number; revenue: number }>;
  statusSplit: Record<OrderStatus, number>;
  hourlyData: Array<{ hour: string; orders: number; amount: number }>;
  categoryPerformance: Array<{ category: string; orders: number; revenue: number; margin: number }>;
  tablePerformance: Array<{ table: string; orders: number; revenue: number; rotation: number }>;
  cancellations: {
    total: number;
    rate: number;
    byReason: Record<string, number>;
  };
  forecast: {
    endDayProjection: number;
    endWeekProjection: number;
  };
  cohorts: {
    newCount: number;
    returningCount: number;
  };
  totalOrders: number;
};

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [period, setPeriod] = useState<Period>('LAST_7');
  const [customStart, setCustomStart] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  });
  const [customEnd, setCustomEnd] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [statusFilter, setStatusFilter] = useState<'ALL' | OrderStatus>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [channelFilter, setChannelFilter] = useState<string>('ALL');
  
  const [widgets, setWidgets] = useState({
    statusSplit: true,
    hourlyHeatmap: true,
    categoryPerf: true,
    tablePerf: true,
    cancellations: true,
    forecast: true,
    cohorts: true,
  });

  const loadAnalytics = async () => {
    if (!user?.restaurant?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const params: any = {
        period,
      };
      
      if (period === 'CUSTOM') {
        params.startDate = customStart;
        params.endDate = customEnd;
      }
      
      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }
      
      if (categoryFilter !== 'ALL') {
        params.category = categoryFilter;
      }
      
      if (channelFilter !== 'ALL') {
        params.channel = channelFilter;
      }
      
      const response = await api.get<AnalyticsData>(`/analytics/${user.restaurant.id}`, { params });
      setData(response.data);
    } catch (err: any) {
      console.error('Erreur chargement analytics:', err);
      setError(err.response?.data?.message || 'Impossible de charger les analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadAnalytics();
  }, [period, customStart, customEnd, statusFilter, categoryFilter, channelFilter, user?.restaurant?.id]);

  const toggleWidget = (key: keyof typeof widgets) => {
    setWidgets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const exportCsv = () => {
    if (!data) return;
    
    const headers = ['Métrique', 'Valeur'];
    const rows = [
      ['CA total', data.kpis.revenue.value.toFixed(2)],
      ['Commandes', data.kpis.orders.value.toString()],
      ['Panier moyen', data.kpis.avgTicket.value.toFixed(2)],
      ['Clients uniques', data.kpis.uniqueClients.value.toString()],
    ];
    
    const csv = [headers, ...rows]
      .map((row) => row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const trendBadge = (value: number) => (
    <span
      className="status-badge"
      style={{
        background: value >= 0 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
        color: value >= 0 ? '#047857' : '#b91c1c',
      }}
    >
      {value >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {`${value >= 0 ? '+' : ''}${value.toFixed(1)}%`}
    </span>
  );

  if (isLoading) {
    return (
      <Layout title="Analytiques" subtitle="Chargement des performances...">
        <div className="content-grid">
          <div className="card" style={{ height: 180, background: 'linear-gradient(90deg,#f1f5f9,#f8fafc,#f1f5f9)' }} />
          <div className="card" style={{ height: 180, background: 'linear-gradient(90deg,#f1f5f9,#f8fafc,#f1f5f9)' }} />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Analytiques" subtitle="Erreur de chargement">
        <div className="empty-state">
          <BarChart3 size={28} />
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => void loadAnalytics()}>
            Réessayer
          </button>
        </div>
      </Layout>
    );
  }

  if (!data || data.totalOrders === 0) {
    return (
      <Layout title="Analytiques" subtitle="Aucune donnée pour les filtres sélectionnés.">
        <div className="empty-state">
          <BarChart3 size={28} />
          <p>Essayez une autre période ou retirez certains filtres.</p>
        </div>
      </Layout>
    );
  }

  const maxHourlyAmount = Math.max(...data.hourlyData.map((h) => h.amount), 1);
  const maxCategoryRevenue = Math.max(...data.categoryPerformance.map((c) => c.revenue), 1);
  const totalStatus = Math.max(data.totalOrders, 1);
  const statusPct = {
    COMPLETED: (data.statusSplit.COMPLETED / totalStatus) * 100,
    CANCELLED: (data.statusSplit.CANCELLED / totalStatus) * 100,
    PREPARING: (data.statusSplit.PREPARING / totalStatus) * 100,
    PENDING: (data.statusSplit.PENDING / totalStatus) * 100,
    READY: (data.statusSplit.READY / totalStatus) * 100,
  };

  return (
    <Layout title="Analytiques" subtitle="Pilotage avancé des performances restaurant.">
      <div className="card" style={{ padding: 14, marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(['TODAY', 'LAST_7', 'LAST_30', 'CUSTOM'] as Period[]).map((p) => (
              <button
                key={p}
                className="btn btn-sm"
                style={{
                  background: period === p ? 'var(--primary)' : 'var(--surface-1)',
                  color: period === p ? '#fff' : 'var(--text-600)',
                  border: '1px solid var(--border)',
                }}
                onClick={() => setPeriod(p)}
              >
                <CalendarDays size={14} />
                {p === 'TODAY' ? "Aujourd'hui" : p === 'LAST_7' ? '7 jours' : p === 'LAST_30' ? '30 jours' : 'Custom'}
              </button>
            ))}
            {period === 'CUSTOM' && (
              <>
                <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="form-input" style={{ height: 32, width: 150 }} />
                <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="form-input" style={{ height: 32, width: 150 }} />
              </>
            )}
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'ALL' | OrderStatus)} className="form-input" style={{ height: 32, width: 150 }}>
              <option value="ALL">Tous statuts</option>
              <option value="COMPLETED">Terminées</option>
              <option value="CANCELLED">Annulées</option>
              <option value="PREPARING">En préparation</option>
              <option value="PENDING">En attente</option>
              <option value="READY">Prêtes</option>
            </select>
            <input
              type="text"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              placeholder="Catégorie..."
              className="form-input"
              style={{ height: 32, width: 150 }}
            />
            <select value={channelFilter} onChange={(e) => setChannelFilter(e.target.value)} className="form-input" style={{ height: 32, width: 150 }}>
              <option value="ALL">Tous canaux</option>
              <option value="SUR_PLACE">Sur place</option>
              <option value="A_EMPORTER">A emporter</option>
              <option value="LIVRAISON">Livraison</option>
            </select>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={exportCsv}>
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 16 }}>
        <div className="stat-card">
          <div className="stat-card-header"><span className="stat-label">CA total</span>{trendBadge(data.kpis.revenue.trend)}</div>
          <div className="stat-value"><Euro size={18} style={{ marginRight: 4 }} />{data.kpis.revenue.value.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header"><span className="stat-label">Commandes</span>{trendBadge(data.kpis.orders.trend)}</div>
          <div className="stat-value">{data.kpis.orders.value}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header"><span className="stat-label">Panier moyen</span>{trendBadge(data.kpis.avgTicket.trend)}</div>
          <div className="stat-value">{data.kpis.avgTicket.value.toFixed(2)} EUR</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header"><span className="stat-label">Clients uniques</span>{trendBadge(data.kpis.uniqueClients.trend)}</div>
          <div className="stat-value"><Users size={18} style={{ marginRight: 4 }} />{data.kpis.uniqueClients.value}</div>
        </div>
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 14 }}>
        <div className="card-header">
          <span className="card-title">Visualisations graphiques</span>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 16,
          }}
        >
          <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12 }}>
            <p style={{ fontSize: 12, color: 'var(--text-400)', marginBottom: 10 }}>
              Diagramme en barres (CA par catégorie)
            </p>
            <div style={{ display: 'grid', gap: 8 }}>
              {data.categoryPerformance.map((row) => (
                <div key={row.category}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                    <span>{row.category}</span>
                    <strong>{row.revenue.toFixed(0)} EUR</strong>
                  </div>
                  <div style={{ height: 8, borderRadius: 999, background: '#e2e8f0' }}>
                    <div
                      style={{
                        width: `${(row.revenue / maxCategoryRevenue) * 100}%`,
                        height: '100%',
                        borderRadius: 999,
                        background: 'linear-gradient(90deg, #f9a8d4, var(--primary))',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12 }}>
            <p style={{ fontSize: 12, color: 'var(--text-400)', marginBottom: 10 }}>
              Diagramme en cercle (statuts)
            </p>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: '50%',
                  background: `conic-gradient(
                    #10b981 0 ${statusPct.COMPLETED}%,
                    #ef4444 ${statusPct.COMPLETED}% ${statusPct.COMPLETED + statusPct.CANCELLED}%,
                    #8b5cf6 ${statusPct.COMPLETED + statusPct.CANCELLED}% ${statusPct.COMPLETED + statusPct.CANCELLED + statusPct.PREPARING}%,
                    #f59e0b ${statusPct.COMPLETED + statusPct.CANCELLED + statusPct.PREPARING}% ${statusPct.COMPLETED + statusPct.CANCELLED + statusPct.PREPARING + statusPct.PENDING}%,
                    #0ea5e9 ${statusPct.COMPLETED + statusPct.CANCELLED + statusPct.PREPARING + statusPct.PENDING}% 100%
                  )`,
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 24,
                    borderRadius: '50%',
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    color: '#334155',
                  }}
                >
                  {data.totalOrders}
                </div>
              </div>
              <div style={{ display: 'grid', gap: 5 }}>
                {(Object.keys(data.statusSplit) as OrderStatus[]).map((status) => (
                  <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background:
                          status === 'COMPLETED'
                            ? '#10b981'
                            : status === 'CANCELLED'
                              ? '#ef4444'
                              : status === 'PREPARING'
                                ? '#8b5cf6'
                                : status === 'PENDING'
                                  ? '#f59e0b'
                                  : '#0ea5e9',
                      }}
                    />
                    <span>{status}</span>
                    <strong>{data.statusSplit[status]}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12 }}>
            <p style={{ fontSize: 12, color: 'var(--text-400)', marginBottom: 10 }}>
              Courbe (évolution du CA horaire)
            </p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 140, padding: '6px 0' }}>
              {data.hourlyData.map((point) => (
                <div key={point.hour} style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      height: `${Math.max(8, (point.amount / maxHourlyAmount) * 120)}px`,
                      borderRadius: 6,
                      background: 'linear-gradient(180deg, rgba(217,74,106,0.35), var(--primary))',
                    }}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-400)' }}>
              {data.hourlyData.map((h, i) => (
                <span key={h.hour} style={{ opacity: i % 2 === 0 ? 1 : 0.4 }}>{h.hour}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 12, marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(Object.keys(widgets) as Array<keyof typeof widgets>).map((key) => (
            <button
              key={key}
              className="btn btn-sm"
              onClick={() => toggleWidget(key)}
              style={{
                background: widgets[key] ? 'var(--primary-faint)' : 'var(--surface-1)',
                color: widgets[key] ? 'var(--primary)' : 'var(--text-600)',
                border: '1px solid var(--border)',
              }}
            >
              {widgets[key] ? 'Masquer' : 'Afficher'} {key}
            </button>
          ))}
        </div>
      </div>

      <div className="content-grid">
        <div className="card" style={{ padding: 20 }}>
          <div className="card-header"><span className="card-title">Top articles</span></div>
          <table className="data-table">
            <thead><tr><th>Article</th><th>Commandes</th><th>CA</th></tr></thead>
            <tbody>
              {data.topItems.length > 0 ? (
                data.topItems.map((item) => (
                  <tr key={item.name}>
                    <td style={{ fontWeight: 600 }}>{item.name}</td>
                    <td>{item.orders}</td>
                    <td>{item.revenue.toFixed(2)} EUR</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-500)' }}>
                    Aucun article
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {widgets.statusSplit && (
          <div className="card" style={{ padding: 20 }}>
            <div className="card-header"><span className="card-title">Répartition statuts</span></div>
            <div style={{ display: 'grid', gap: 10 }}>
              {(Object.keys(data.statusSplit) as OrderStatus[]).map((status) => (
                <div key={status}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span>{status}</span>
                    <strong>{data.statusSplit[status]}</strong>
                  </div>
                  <div style={{ width: '100%', height: 8, background: '#e2e8f0', borderRadius: 999 }}>
                    <div
                      style={{
                        width: `${(data.statusSplit[status] / Math.max(data.totalOrders, 1)) * 100}%`,
                        height: '100%',
                        borderRadius: 999,
                        background: 'linear-gradient(90deg, #e87996, var(--primary))',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {widgets.hourlyHeatmap && (
        <div className="card" style={{ padding: 20, marginTop: 14 }}>
          <div className="card-header"><span className="card-title">Heatmap horaire (commandes / CA)</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0,1fr))', gap: 8 }}>
            {data.hourlyData.map((point) => (
              <div key={point.hour} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    height: 70,
                    borderRadius: 10,
                    background: `rgba(217,74,106,${0.1 + (point.amount / maxHourlyAmount) * 0.8})`,
                    border: '1px solid rgba(217,74,106,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#7f2941',
                    fontWeight: 700,
                  }}
                >
                  {point.orders}
                </div>
                <div style={{ fontSize: 11, marginTop: 4 }}>{point.hour}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="content-grid" style={{ marginTop: 14 }}>
        {widgets.categoryPerf && (
          <div className="card" style={{ padding: 20 }}>
            <div className="card-header"><span className="card-title">Performance catégories</span></div>
            <table className="data-table">
              <thead><tr><th>Catégorie</th><th>Commandes</th><th>CA</th><th>Marge estimée</th></tr></thead>
              <tbody>
                {data.categoryPerformance.length > 0 ? (
                  data.categoryPerformance.map((row) => (
                    <tr key={row.category}>
                      <td style={{ fontWeight: 600 }}>{row.category}</td>
                      <td>{row.orders}</td>
                      <td>{row.revenue.toFixed(2)} EUR</td>
                      <td>{row.margin}%</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-500)' }}>
                      Aucune catégorie
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {widgets.tablePerf && (
          <div className="card" style={{ padding: 20 }}>
            <div className="card-header"><span className="card-title">Analyse tables</span></div>
            <table className="data-table">
              <thead><tr><th>Table</th><th>Commandes</th><th>CA</th><th>Rotation</th></tr></thead>
              <tbody>
                {data.tablePerformance.length > 0 ? (
                  data.tablePerformance.map((row) => (
                    <tr key={row.table}>
                      <td style={{ fontWeight: 600 }}>{row.table}</td>
                      <td>{row.orders}</td>
                      <td>{row.revenue.toFixed(2)} EUR</td>
                      <td>{row.rotation}x</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-500)' }}>
                      Aucune table
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="content-grid" style={{ marginTop: 14 }}>
        {widgets.cancellations && (
          <div className="card" style={{ padding: 20 }}>
            <div className="card-header"><span className="card-title">Annulations</span></div>
            <p style={{ marginBottom: 10, color: 'var(--text-600)' }}>
              Taux annulation: <strong>{data.cancellations.rate.toFixed(1)}%</strong> ({data.cancellations.total})
            </p>
            <table className="data-table">
              <tbody>
                {Object.entries(data.cancellations.byReason).map(([reason, count]) => (
                  <tr key={reason}>
                    <td>{reason}</td>
                    <td style={{ fontWeight: 700 }}>{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {widgets.forecast && (
          <div className="card" style={{ padding: 20 }}>
            <div className="card-header"><span className="card-title">Prévisions</span></div>
            <p style={{ marginBottom: 8 }}>
              Fin de journée estimée: <strong>{data.forecast.endDayProjection.toFixed(2)} EUR</strong>
            </p>
            <p>
              Semaine estimée: <strong>{data.forecast.endWeekProjection.toFixed(2)} EUR</strong>
            </p>
          </div>
        )}
      </div>

      {widgets.cohorts && (
        <div className="card" style={{ padding: 20, marginTop: 14 }}>
          <div className="card-header"><span className="card-title">Cohortes clients</span></div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div className="stat-card" style={{ flex: 1 }}>
              <div className="stat-label">Nouveaux</div>
              <div className="stat-value">{data.cohorts.newCount}</div>
            </div>
            <div className="stat-card" style={{ flex: 1 }}>
              <div className="stat-label">Récurrents</div>
              <div className="stat-value">{data.cohorts.returningCount}</div>
            </div>
            <div className="stat-card" style={{ flex: 1 }}>
              <div className="stat-label">Part récurrents</div>
              <div className="stat-value">
                <Percent size={18} style={{ marginRight: 4 }} />
                {(
                  data.cohorts.returningCount /
                  Math.max(data.cohorts.newCount + data.cohorts.returningCount, 1) *
                  100
                ).toFixed(1)}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Analytics;
