import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StatsCard from '../components/StatsCard';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Clock,
  ArrowRight,
  Filter,
  Download,
  MoreHorizontal,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';

type DashboardResponse = {
  stats: {
    revenue: { value: number; trendPercent: number };
    orders: { value: number; trendPercent: number };
    customers: { value: number; trendPercent: number };
    prepTime: { valueMinutes: number; trendMinutes: number; improved: boolean };
  };
  recentOrders: Array<{
    id: string;
    orderNumber: number | null;
    customerName: string;
    table: string;
    status: string;
    amount: number;
  }>;
  floorPlan: Array<{
    tableId: string;
    tableNumber: string;
    state: 'FREE' | 'OCCUPIED' | 'LONG_OCCUPIED';
    occupiedMinutes: number;
  }>;
};

type TableRow = {
  id: string;
  number: string;
  shortCode: string;
  isActive: boolean;
};

type FloorTile = {
  tableId: string;
  tableNumber: string;
  state: 'FREE' | 'OCCUPIED' | 'LONG_OCCUPIED';
  occupiedMinutes: number;
};

const mockRecentOrders: DashboardResponse['recentOrders'] = [
  {
    id: 'mock-1',
    orderNumber: 1042,
    customerName: 'Awa S.',
    table: '02',
    status: 'PREPARING',
    amount: 28.5,
  },
  {
    id: 'mock-2',
    orderNumber: 1043,
    customerName: 'Moussa K.',
    table: '07',
    status: 'READY',
    amount: 46,
  },
  {
    id: 'mock-3',
    orderNumber: 1044,
    customerName: 'Fatou D.',
    table: '11',
    status: 'PENDING',
    amount: 17.9,
  },
  {
    id: 'mock-4',
    orderNumber: 1040,
    customerName: 'Ibrahima N.',
    table: '05',
    status: 'COMPLETED',
    amount: 62.2,
  },
];

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [tables, setTables] = useState<TableRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const dashboardTablesRestaurantId =
    'e4ae2462-dbd2-4747-b89b-5304b6b14d8c';

  const statusMeta: Record<
    string,
    { label: string; color: string; bg: string }
  > = {
    PENDING: {
      label: t('orders.status.pending'),
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.08)',
    },
    PREPARING: {
      label: t('orders.status.preparing'),
      color: '#6366f1',
      bg: 'rgba(99,102,241,0.08)',
    },
    READY: {
      label: t('orders.status.ready'),
      color: '#0ea5e9',
      bg: 'rgba(14,165,233,0.08)',
    },
    COMPLETED: {
      label: t('orders.status.completed'),
      color: '#10b981',
      bg: 'rgba(16,185,129,0.08)',
    },
    CANCELLED: {
      label: t('orders.status.cancelled'),
      color: '#ef4444',
      bg: 'rgba(239,68,68,0.08)',
    },
  };

  useEffect(() => {
    const restaurantId = user?.restaurant?.id;
    if (!restaurantId) {
      setIsLoading(false);
      return;
    }

    const loadDashboard = async () => {
      setIsLoading(true);
      try {
        const tablesRes = await api.get<TableRow[]>(
          `/tables/restaurant/${dashboardTablesRestaurantId}`,
        );
        setData(null);
        setTables(tablesRes.data || []);
      } catch (error) {
        console.error('Erreur lors du chargement du dashboard', error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboard();
  }, [user?.restaurant?.id]);


  const formatTrend = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(1)} %`;
  const restaurantName = user?.restaurant?.name ?? 'votre restaurant';
  const recentOrders = useMemo(() => {
    const realOrders = data?.recentOrders ?? [];
    return realOrders.length ? realOrders : mockRecentOrders;
  }, [data?.recentOrders]);

  const floorTiles: FloorTile[] = useMemo(() => {
    if (!tables.length) {
      return data?.floorPlan ?? [];
    }

    return tables.map((table, index) => {
      const normalizedNumber = Number.parseInt(table.number, 10);
      const base = Number.isNaN(normalizedNumber) ? index + 1 : normalizedNumber;
      if (!table.isActive) {
        return {
          tableId: table.id,
          tableNumber: table.number,
          state: 'FREE',
          occupiedMinutes: 0,
        };
      }

      const isLongOccupied = base % 5 === 0;
      return {
        tableId: table.id,
        tableNumber: table.number,
        state: isLongOccupied ? 'LONG_OCCUPIED' : 'OCCUPIED',
        occupiedMinutes: isLongOccupied ? 52 : 18,
      };
    });
  }, [tables, data?.floorPlan]);

  return (
    <Layout title={t('dashboard.title')} subtitle={`${t('dashboard.subtitle')} - ${restaurantName}`}>

    {/* ── KPI Row ── */}
    <div className="stats-grid">
      <StatsCard
        label={t('dashboard.revenue')}
        value={formatPrice(data?.stats.revenue.value ?? 0)}
        change={formatTrend(data?.stats.revenue.trendPercent ?? 0)}
        trend={(data?.stats.revenue.trendPercent ?? 0) >= 0 ? 'up' : 'down'}
        icon={<DollarSign size={20} />}
        iconColor="#10b981"
        iconBg="rgba(16,185,129,0.12)"
        animClass="anim-in-1"
      />
      <StatsCard
        label={t('dashboard.orders')}
        value={String(data?.stats.orders.value ?? 0)}
        change={formatTrend(data?.stats.orders.trendPercent ?? 0)}
        trend={(data?.stats.orders.trendPercent ?? 0) >= 0 ? 'up' : 'down'}
        icon={<ShoppingBag size={20} />}
        iconColor="var(--primary)"
        iconBg="var(--primary-faint)"
        animClass="anim-in-2"
      />
      <StatsCard
        label={t('dashboard.customers')}
        value={String(data?.stats.customers.value ?? 0)}
        change={formatTrend(data?.stats.customers.trendPercent ?? 0)}
        trend={(data?.stats.customers.trendPercent ?? 0) >= 0 ? 'up' : 'down'}
        icon={<Users size={20} />}
        iconColor="#6366f1"
        iconBg="rgba(99,102,241,0.12)"
        animClass="anim-in-3"
      />
      <StatsCard
        label={t('dashboard.avgPrepTime')}
        value={`${Math.round(data?.stats.prepTime.valueMinutes ?? 0)} min`}
        change={`${(data?.stats.prepTime.trendMinutes ?? 0) > 0 ? '+' : ''}${Math.round(
          data?.stats.prepTime.trendMinutes ?? 0,
        )} min`}
        trend={data?.stats.prepTime.improved ?? true ? 'up' : 'down'}
        icon={<Clock size={20} />}
        iconColor="#f59e0b"
        iconBg="rgba(245,158,11,0.12)"
        animClass="anim-in-4"
      />
    </div>

    {/* ── Main content columns ── */}
    <div className="content-grid">

      {/* ── Recent Orders ── */}
      <div className="card anim-in anim-in-5">
        <div className="card-header">
          <span className="card-title">
            {t('dashboard.recentOrders')}
            <span className="status-badge" style={{ background: 'var(--primary-faint)', color: 'var(--primary)', fontSize: 11 }}>
              {t('dashboard.live')}
            </span>
          </span>
          <div className="card-actions">
            <button className="btn btn-ghost btn-sm">
              <Filter size={14} /> {t('common.filter')}
            </button>
            <button className="btn btn-ghost btn-sm">
              <Download size={14} /> {t('common.export')}
            </button>
          </div>
        </div>

        <div className="card-body">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('dashboard.customer')}</th>
                <th>{t('dashboard.table')}</th>
                <th>{t('dashboard.status')}</th>
                <th>{t('dashboard.amount')}</th>
                <th style={{ width: 40 }} />
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => {
                const status = statusMeta[o.status] || {
                  label: o.status,
                  color: '#6b7280',
                  bg: 'rgba(107,114,128,0.1)',
                };
                return (
                <tr key={o.id}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-900)', fontSize: 13.5 }}>{o.customerName}</span>
                      <span className="text-xs text-lighter">
                        #{o.orderNumber ?? o.id.slice(0, 8)}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      background: 'var(--surface-1)',
                      border: '1px solid var(--border)',
                      padding: '2px 9px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                    }}>{o.table}</span>
                  </td>
                  <td>
                    <span className="status-badge" style={{ background: status.bg, color: status.color }}>
                      <span className="status-dot-sm" style={{ background: status.color }} />
                      {status.label}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, fontSize: 13.5 }}>{formatPrice(o.amount)}</span>
                  </td>
                  <td>
                    <button className="icon-btn" style={{ width: 30, height: 30, borderRadius: 8 }}>
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
                );
              })}
              {!isLoading && recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-500)' }}>
                    {t('dashboard.noRecentOrders')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/orders')}>
            {t('dashboard.viewAllOrders')} <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* ── Table Occupancy ── */}
      <div className="card anim-in anim-in-6" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="card-header">
          <span className="card-title">{t('dashboard.floorPlan')}</span>
          <div className="legend">
            <span className="legend-item">
              <span className="legend-dot" style={{ background: 'var(--border)' }} />
              {t('dashboard.free')}
            </span>
            <span className="legend-item">
              <span className="legend-dot" style={{ background: 'var(--primary)' }} />
              {t('dashboard.occupied')}
            </span>
            <span className="legend-item">
              <span className="legend-dot" style={{ background: 'var(--warning)' }} />
              {t('dashboard.longOccupied')}
            </span>
          </div>
        </div>

        <div className="table-grid dashboard-table-grid" style={{ flex: 1 }}>
          {floorTiles.map((table, i) => (
            <div
              key={table.tableId}
              className={`table-cell${
                table.state === 'FREE'
                  ? ' free'
                  : table.state === 'OCCUPIED'
                    ? ' occupied'
                    : table.state === 'LONG_OCCUPIED'
                      ? ' occupied-warm'
                      : ''
              } dashboard-table-cell`}
            >
              <span className="table-num">
                {table.tableNumber || (i + 1 < 10 ? `0${i + 1}` : i + 1)}
              </span>
            </div>
          ))}
          {!isLoading && floorTiles.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-500)' }}>
              {t('dashboard.noTables')}
            </div>
          )}
        </div>

        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
          <button
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => navigate('/tables')}
          >
            {t('dashboard.manageFloorPlan')} <ArrowRight size={15} />
          </button>
        </div>
      </div>

    </div>
  </Layout>
  );
};

export default Dashboard;
