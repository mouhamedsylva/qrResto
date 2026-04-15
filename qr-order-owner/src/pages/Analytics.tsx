import React, { useEffect, useMemo, useState } from 'react';
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

type OrderStatus = 'COMPLETED' | 'CANCELLED' | 'PREPARING' | 'PENDING' | 'READY';
type Category = 'Burgers' | 'Pizzas' | 'Salades' | 'Boissons' | 'Desserts';
type Channel = 'SUR_PLACE' | 'A_EMPORTER' | 'LIVRAISON';

type MockOrder = {
  id: string;
  date: string;
  amount: number;
  status: OrderStatus;
  category: Category;
  table: string;
  customerType: 'NEW' | 'RETURNING';
  channel: Channel;
  itemName: string;
  cancellationReason?: 'Client annule' | 'Rupture stock' | 'Delai long';
};

const mockOrders: MockOrder[] = [
  { id: '1', date: '2026-04-13T10:10:00', amount: 28, status: 'COMPLETED', category: 'Burgers', table: 'T-01', customerType: 'NEW', channel: 'SUR_PLACE', itemName: 'Burger Signature' },
  { id: '2', date: '2026-04-13T10:45:00', amount: 17, status: 'COMPLETED', category: 'Desserts', table: 'T-03', customerType: 'RETURNING', channel: 'SUR_PLACE', itemName: 'Tiramisu Maison' },
  { id: '3', date: '2026-04-13T11:20:00', amount: 42, status: 'PREPARING', category: 'Pizzas', table: 'T-06', customerType: 'RETURNING', channel: 'A_EMPORTER', itemName: 'Pizza Truffe' },
  { id: '4', date: '2026-04-13T11:50:00', amount: 12, status: 'CANCELLED', category: 'Boissons', table: 'T-02', customerType: 'NEW', channel: 'SUR_PLACE', itemName: 'Jus Detox', cancellationReason: 'Client annule' },
  { id: '5', date: '2026-04-13T12:15:00', amount: 35, status: 'COMPLETED', category: 'Burgers', table: 'T-08', customerType: 'RETURNING', channel: 'SUR_PLACE', itemName: 'Double Cheese' },
  { id: '6', date: '2026-04-13T12:45:00', amount: 23, status: 'READY', category: 'Salades', table: 'T-04', customerType: 'NEW', channel: 'LIVRAISON', itemName: 'Salade Cesar' },
  { id: '7', date: '2026-04-13T13:05:00', amount: 58, status: 'COMPLETED', category: 'Pizzas', table: 'T-09', customerType: 'RETURNING', channel: 'SUR_PLACE', itemName: 'Pizza Truffe' },
  { id: '8', date: '2026-04-13T13:25:00', amount: 19, status: 'PENDING', category: 'Desserts', table: 'T-10', customerType: 'NEW', channel: 'A_EMPORTER', itemName: 'Fondant Choco' },
  { id: '9', date: '2026-04-12T20:15:00', amount: 31, status: 'COMPLETED', category: 'Burgers', table: 'T-05', customerType: 'RETURNING', channel: 'SUR_PLACE', itemName: 'Burger Signature' },
  { id: '10', date: '2026-04-12T21:05:00', amount: 15, status: 'CANCELLED', category: 'Salades', table: 'T-11', customerType: 'NEW', channel: 'LIVRAISON', itemName: 'Salade Cesar', cancellationReason: 'Rupture stock' },
  { id: '11', date: '2026-04-11T19:30:00', amount: 49, status: 'COMPLETED', category: 'Pizzas', table: 'T-07', customerType: 'RETURNING', channel: 'SUR_PLACE', itemName: 'Pizza Truffe' },
  { id: '12', date: '2026-04-10T18:10:00', amount: 22, status: 'COMPLETED', category: 'Boissons', table: 'T-12', customerType: 'NEW', channel: 'A_EMPORTER', itemName: 'Mocktail Passion' },
];

type Period = 'TODAY' | 'LAST_7' | 'LAST_30' | 'CUSTOM';

const Analytics: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('LAST_7');
  const [customStart, setCustomStart] = useState('2026-04-10');
  const [customEnd, setCustomEnd] = useState('2026-04-13');
  const [statusFilter, setStatusFilter] = useState<'ALL' | OrderStatus>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | Category>('ALL');
  const [channelFilter, setChannelFilter] = useState<'ALL' | Channel>('ALL');
  const [widgets, setWidgets] = useState({
    statusSplit: true,
    hourlyHeatmap: true,
    categoryPerf: true,
    tablePerf: true,
    cancellations: true,
    forecast: true,
    cohorts: true,
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 550);
    return () => clearTimeout(timer);
  }, []);

  const getRange = (p: Period) => {
    const end = new Date('2026-04-13T23:59:59');
    if (p === 'TODAY') return { start: new Date('2026-04-13T00:00:00'), end };
    if (p === 'LAST_7') return { start: new Date('2026-04-07T00:00:00'), end };
    if (p === 'LAST_30') return { start: new Date('2026-03-15T00:00:00'), end };
    return {
      start: new Date(`${customStart}T00:00:00`),
      end: new Date(`${customEnd}T23:59:59`),
    };
  };

  const filteredOrders = useMemo(() => {
    const range = getRange(period);
    return mockOrders.filter((o) => {
      const date = new Date(o.date);
      const inRange = date >= range.start && date <= range.end;
      const statusOk = statusFilter === 'ALL' || o.status === statusFilter;
      const categoryOk = categoryFilter === 'ALL' || o.category === categoryFilter;
      const channelOk = channelFilter === 'ALL' || o.channel === channelFilter;
      return inRange && statusOk && categoryOk && channelOk;
    });
  }, [period, customStart, customEnd, statusFilter, categoryFilter, channelFilter]);

  const previousOrders = useMemo(() => {
    const range = getRange(period);
    const duration = range.end.getTime() - range.start.getTime();
    const prevEnd = new Date(range.start.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - duration);
    return mockOrders.filter((o) => {
      const date = new Date(o.date);
      return date >= prevStart && date <= prevEnd;
    });
  }, [period, customStart, customEnd]);

  const kpis = useMemo(() => {
    const currentRevenue = filteredOrders.reduce((s, o) => s + o.amount, 0);
    const currentOrders = filteredOrders.length;
    const currentAvg = currentOrders ? currentRevenue / currentOrders : 0;
    const currentClients = new Set(filteredOrders.map((o) => `${o.customerType}-${o.id.slice(0, 2)}`)).size;

    const prevRevenue = previousOrders.reduce((s, o) => s + o.amount, 0);
    const prevOrders = previousOrders.length;
    const prevAvg = prevOrders ? prevRevenue / prevOrders : 0;
    const prevClients = new Set(previousOrders.map((o) => `${o.customerType}-${o.id.slice(0, 2)}`)).size;

    const trend = (cur: number, prev: number) =>
      prev <= 0 ? 100 : ((cur - prev) / prev) * 100;

    return {
      revenue: { value: currentRevenue, trend: trend(currentRevenue, prevRevenue) },
      orders: { value: currentOrders, trend: trend(currentOrders, prevOrders) },
      avgTicket: { value: currentAvg, trend: trend(currentAvg, prevAvg) },
      uniqueClients: { value: currentClients, trend: trend(currentClients, prevClients) },
    };
  }, [filteredOrders, previousOrders]);

  const topItems = useMemo(() => {
    const map = new Map<string, { orders: number; revenue: number }>();
    filteredOrders.forEach((o) => {
      const prev = map.get(o.itemName) || { orders: 0, revenue: 0 };
      map.set(o.itemName, { orders: prev.orders + 1, revenue: prev.revenue + o.amount });
    });
    return Array.from(map.entries())
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredOrders]);

  const statusSplit = useMemo(() => {
    const base: Record<OrderStatus, number> = {
      COMPLETED: 0,
      CANCELLED: 0,
      PREPARING: 0,
      PENDING: 0,
      READY: 0,
    };
    filteredOrders.forEach((o) => {
      base[o.status] += 1;
    });
    return base;
  }, [filteredOrders]);

  const hourly = useMemo(() => {
    const hours = ['10h', '11h', '12h', '13h', '14h', '15h', '16h', '17h', '18h', '19h', '20h', '21h'];
    return hours.map((h) => {
      const hourNum = Number(h.replace('h', ''));
      const items = filteredOrders.filter((o) => new Date(o.date).getHours() === hourNum);
      return { hour: h, orders: items.length, amount: items.reduce((s, o) => s + o.amount, 0) };
    });
  }, [filteredOrders]);

  const categoryPerf = useMemo(() => {
    const categories: Category[] = ['Burgers', 'Pizzas', 'Salades', 'Boissons', 'Desserts'];
    return categories.map((c) => {
      const items = filteredOrders.filter((o) => o.category === c);
      return { category: c, orders: items.length, revenue: items.reduce((s, o) => s + o.amount, 0), margin: 62 };
    });
  }, [filteredOrders]);

  const tablePerf = useMemo(() => {
    const map = new Map<string, { orders: number; revenue: number }>();
    filteredOrders.forEach((o) => {
      const prev = map.get(o.table) || { orders: 0, revenue: 0 };
      map.set(o.table, { orders: prev.orders + 1, revenue: prev.revenue + o.amount });
    });
    return Array.from(map.entries())
      .map(([table, stats]) => ({ table, ...stats, rotation: Math.max(1, Math.round(stats.orders / 2)) }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredOrders]);

  const cancellations = useMemo(() => {
    const items = filteredOrders.filter((o) => o.status === 'CANCELLED');
    const byReason = {
      'Client annule': items.filter((o) => o.cancellationReason === 'Client annule').length,
      'Rupture stock': items.filter((o) => o.cancellationReason === 'Rupture stock').length,
      'Delai long': items.filter((o) => o.cancellationReason === 'Delai long').length,
    };
    return { total: items.length, rate: filteredOrders.length ? (items.length / filteredOrders.length) * 100 : 0, byReason };
  }, [filteredOrders]);

  const forecast = useMemo(() => {
    const currentRevenue = filteredOrders.reduce((s, o) => s + o.amount, 0);
    const progress = 0.68;
    const endDayProjection = progress ? currentRevenue / progress : currentRevenue;
    return {
      endDayProjection,
      endWeekProjection: endDayProjection * 7,
    };
  }, [filteredOrders]);

  const cohorts = useMemo(() => {
    const newCount = filteredOrders.filter((o) => o.customerType === 'NEW').length;
    const returningCount = filteredOrders.filter((o) => o.customerType === 'RETURNING').length;
    return { newCount, returningCount };
  }, [filteredOrders]);

  const toggleWidget = (key: keyof typeof widgets) => {
    setWidgets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const exportCsv = () => {
    if (!filteredOrders.length) return;
    const headers = ['ID', 'Date', 'Montant', 'Statut', 'Categorie', 'Table', 'Canal', 'Article'];
    const rows = filteredOrders.map((o) => [o.id, o.date, o.amount.toFixed(2), o.status, o.category, o.table, o.channel, o.itemName]);
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

  if (!filteredOrders.length) {
    return (
      <Layout title="Analytiques" subtitle="Aucune donnée pour les filtres sélectionnés.">
        <div className="empty-state">
          <BarChart3 size={28} />
          <p>Essayez une autre période ou retirez certains filtres.</p>
        </div>
      </Layout>
    );
  }

  const maxHourlyAmount = Math.max(...hourly.map((h) => h.amount), 1);
  const maxCategoryRevenue = Math.max(...categoryPerf.map((c) => c.revenue), 1);
  const totalStatus = Math.max(filteredOrders.length, 1);
  const statusPct = {
    COMPLETED: (statusSplit.COMPLETED / totalStatus) * 100,
    CANCELLED: (statusSplit.CANCELLED / totalStatus) * 100,
    PREPARING: (statusSplit.PREPARING / totalStatus) * 100,
    PENDING: (statusSplit.PENDING / totalStatus) * 100,
    READY: (statusSplit.READY / totalStatus) * 100,
  };

  return (
    <Layout title="Analytiques" subtitle="Pilotage avancé des performances restaurant (mock).">
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
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as 'ALL' | Category)} className="form-input" style={{ height: 32, width: 150 }}>
              <option value="ALL">Toutes catégories</option>
              <option value="Burgers">Burgers</option>
              <option value="Pizzas">Pizzas</option>
              <option value="Salades">Salades</option>
              <option value="Boissons">Boissons</option>
              <option value="Desserts">Desserts</option>
            </select>
            <select value={channelFilter} onChange={(e) => setChannelFilter(e.target.value as 'ALL' | Channel)} className="form-input" style={{ height: 32, width: 150 }}>
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
          <div className="stat-card-header"><span className="stat-label">CA total</span>{trendBadge(kpis.revenue.trend)}</div>
          <div className="stat-value"><Euro size={18} style={{ marginRight: 4 }} />{kpis.revenue.value.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header"><span className="stat-label">Commandes</span>{trendBadge(kpis.orders.trend)}</div>
          <div className="stat-value">{kpis.orders.value}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header"><span className="stat-label">Panier moyen</span>{trendBadge(kpis.avgTicket.trend)}</div>
          <div className="stat-value">{kpis.avgTicket.value.toFixed(2)} EUR</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header"><span className="stat-label">Clients uniques</span>{trendBadge(kpis.uniqueClients.trend)}</div>
          <div className="stat-value"><Users size={18} style={{ marginRight: 4 }} />{kpis.uniqueClients.value}</div>
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
              {categoryPerf.map((row) => (
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
                  {filteredOrders.length}
                </div>
              </div>
              <div style={{ display: 'grid', gap: 5 }}>
                {(Object.keys(statusSplit) as OrderStatus[]).map((status) => (
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
                    <strong>{statusSplit[status]}</strong>
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
              {hourly.map((point) => (
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
              {hourly.map((h, i) => (
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
              {topItems.map((item) => (
                <tr key={item.name}>
                  <td style={{ fontWeight: 600 }}>{item.name}</td>
                  <td>{item.orders}</td>
                  <td>{item.revenue.toFixed(2)} EUR</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {widgets.statusSplit && (
          <div className="card" style={{ padding: 20 }}>
            <div className="card-header"><span className="card-title">Répartition statuts</span></div>
            <div style={{ display: 'grid', gap: 10 }}>
              {(Object.keys(statusSplit) as OrderStatus[]).map((status) => (
                <div key={status}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span>{status}</span>
                    <strong>{statusSplit[status]}</strong>
                  </div>
                  <div style={{ width: '100%', height: 8, background: '#e2e8f0', borderRadius: 999 }}>
                    <div
                      style={{
                        width: `${(statusSplit[status] / Math.max(filteredOrders.length, 1)) * 100}%`,
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
            {hourly.map((point) => (
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
                {categoryPerf.map((row) => (
                  <tr key={row.category}>
                    <td style={{ fontWeight: 600 }}>{row.category}</td>
                    <td>{row.orders}</td>
                    <td>{row.revenue.toFixed(2)} EUR</td>
                    <td>{row.margin}%</td>
                  </tr>
                ))}
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
                {tablePerf.map((row) => (
                  <tr key={row.table}>
                    <td style={{ fontWeight: 600 }}>{row.table}</td>
                    <td>{row.orders}</td>
                    <td>{row.revenue.toFixed(2)} EUR</td>
                    <td>{row.rotation}x</td>
                  </tr>
                ))}
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
              Taux annulation: <strong>{cancellations.rate.toFixed(1)}%</strong> ({cancellations.total})
            </p>
            <table className="data-table">
              <tbody>
                {Object.entries(cancellations.byReason).map(([reason, count]) => (
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
              Fin de journée estimée: <strong>{forecast.endDayProjection.toFixed(2)} EUR</strong>
            </p>
            <p>
              Semaine estimée: <strong>{forecast.endWeekProjection.toFixed(2)} EUR</strong>
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
              <div className="stat-value">{cohorts.newCount}</div>
            </div>
            <div className="stat-card" style={{ flex: 1 }}>
              <div className="stat-label">Récurrents</div>
              <div className="stat-value">{cohorts.returningCount}</div>
            </div>
            <div className="stat-card" style={{ flex: 1 }}>
              <div className="stat-label">Part récurrents</div>
              <div className="stat-value">
                <Percent size={18} style={{ marginRight: 4 }} />
                {(
                  cohorts.returningCount /
                  Math.max(cohorts.newCount + cohorts.returningCount, 1) *
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
