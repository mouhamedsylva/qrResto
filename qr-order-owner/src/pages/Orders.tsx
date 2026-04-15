import React, { useMemo, useState } from 'react';
import Layout from '../components/Layout';
import {
  ShoppingBag,
  DollarSign,
  CircleDashed,
  CheckCircle2,
  XCircle,
  Download,
} from 'lucide-react';

type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';

type Order = {
  id: string;
  orderNumber: string;
  customer: string;
  table: string;
  itemsCount: number;
  total: number;
  createdAt: string;
  status: OrderStatus;
};

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'CMD-1001',
    customer: 'Fatou D.',
    table: 'T-04',
    itemsCount: 3,
    total: 42.5,
    createdAt: '13:10',
    status: 'PREPARING',
  },
  {
    id: '2',
    orderNumber: 'CMD-1002',
    customer: 'Ibrahima C.',
    table: 'T-02',
    itemsCount: 2,
    total: 21,
    createdAt: '13:12',
    status: 'PENDING',
  },
  {
    id: '3',
    orderNumber: 'CMD-1003',
    customer: 'Amina S.',
    table: 'T-09',
    itemsCount: 5,
    total: 68,
    createdAt: '13:18',
    status: 'READY',
  },
  {
    id: '4',
    orderNumber: 'CMD-0998',
    customer: 'Moussa N.',
    table: 'T-01',
    itemsCount: 4,
    total: 55,
    createdAt: '12:54',
    status: 'COMPLETED',
  },
  {
    id: '5',
    orderNumber: 'CMD-0996',
    customer: 'Seynabou K.',
    table: 'T-11',
    itemsCount: 1,
    total: 12,
    createdAt: '12:41',
    status: 'CANCELLED',
  },
];

const statusConfig: Record<
  OrderStatus,
  { label: string; color: string; bg: string }
> = {
  PENDING: { label: 'En attente', color: '#b45309', bg: 'rgba(245, 158, 11, 0.14)' },
  PREPARING: { label: 'En cours', color: '#6d28d9', bg: 'rgba(109, 40, 217, 0.14)' },
  READY: { label: 'Prête', color: '#0369a1', bg: 'rgba(3, 105, 161, 0.14)' },
  COMPLETED: { label: 'Terminée', color: '#047857', bg: 'rgba(4, 120, 87, 0.14)' },
  CANCELLED: { label: 'Annulée', color: '#b91c1c', bg: 'rgba(185, 28, 28, 0.14)' },
};

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [statusFilter, setStatusFilter] = useState<'ALL' | OrderStatus>('ALL');
  const [isEditing, setIsEditing] = useState(false);
  const [draggedOrderId, setDraggedOrderId] = useState<string | null>(null);

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'ALL') {
      return orders;
    }
    return orders.filter((order) => order.status === statusFilter);
  }, [orders, statusFilter]);

  const metrics = useMemo(() => {
    const ordersOfDay = orders.length;
    const totalAmount = orders.reduce((sum, order) => sum + order.total, 0);
    const activeOrders = orders.filter((order) =>
      ['PENDING', 'PREPARING', 'READY'].includes(order.status),
    ).length;
    const completedOrders = orders.filter(
      (order) => order.status === 'COMPLETED',
    ).length;
    const cancelledOrders = orders.filter(
      (order) => order.status === 'CANCELLED',
    ).length;

    return {
      ordersOfDay,
      totalAmount,
      activeOrders,
      completedOrders,
      cancelledOrders,
    };
  }, [orders]);

  const filters: Array<{ key: 'ALL' | OrderStatus; label: string }> = [
    { key: 'ALL', label: 'Toutes' },
    { key: 'PREPARING', label: 'En cours' },
    { key: 'PENDING', label: 'En attente' },
    { key: 'READY', label: 'Prêtes' },
    { key: 'COMPLETED', label: 'Terminées' },
    { key: 'CANCELLED', label: 'Annulées' },
  ];

  const kanbanStatuses: OrderStatus[] = [
    'PENDING',
    'PREPARING',
    'READY',
    'COMPLETED',
    'CANCELLED',
  ];

  const handleDropToStatus = (nextStatus: OrderStatus) => {
    if (!draggedOrderId) return;
    setOrders((prev) =>
      prev.map((order) =>
        order.id === draggedOrderId ? { ...order, status: nextStatus } : order,
      ),
    );
    setDraggedOrderId(null);
  };

  const exportOrdersCsv = () => {
    if (filteredOrders.length === 0) return;

    const headers = [
      'Numero',
      'Client',
      'Table',
      'Articles',
      'Montant',
      'Heure',
      'Statut',
    ];
    const rows = filteredOrders.map((order) => [
      order.orderNumber,
      order.customer,
      order.table,
      String(order.itemsCount),
      order.total.toFixed(2),
      order.createdAt,
      statusConfig[order.status].label,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','),
      )
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `mes-commandes-${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout
      title="Mes commandes"
      subtitle="Suivez les commandes actives de votre restaurant."
    >
      <div className="orders-metrics-grid">
        <div className="card orders-metric-card">
          <div className="orders-metric-label">
            <ShoppingBag size={14} /> Commandes du jour
          </div>
          <div className="orders-metric-value">
            {metrics.ordersOfDay}
          </div>
        </div>
        <div className="card orders-metric-card">
          <div className="orders-metric-label">
            <DollarSign size={14} /> Montant total
          </div>
          <div className="orders-metric-value">
            {metrics.totalAmount.toFixed(2)} EUR
          </div>
        </div>
        <div className="card orders-metric-card">
          <div className="orders-metric-label">
            <CircleDashed size={14} /> En cours
          </div>
          <div className="orders-metric-value">
            {metrics.activeOrders}
          </div>
        </div>
        <div className="card orders-metric-card">
          <div className="orders-metric-label">
            <CheckCircle2 size={14} /> Terminées
          </div>
          <div className="orders-metric-value">
            {metrics.completedOrders}
          </div>
        </div>
        <div className="card orders-metric-card">
          <div className="orders-metric-label">
            <XCircle size={14} /> Annulées
          </div>
          <div className="orders-metric-value">
            {metrics.cancelledOrders}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <div className="card-header">
          <span className="card-title">Commandes du service</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setIsEditing((prev) => !prev)}
            >
              {isEditing ? 'Terminer' : 'Editer'}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={exportOrdersCsv}>
              <Download size={14} />
              Exporter
            </button>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            alignItems: 'center',
            padding: '12px 0 16px',
          }}
        >
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {filters.map((filter) => (
            <button
              key={filter.key}
              className="btn btn-sm"
              style={{
                background: statusFilter === filter.key ? 'var(--primary)' : 'var(--surface-1)',
                color: statusFilter === filter.key ? '#fff' : 'var(--text-600)',
                border: '1px solid var(--border)',
              }}
              onClick={() => setStatusFilter(filter.key)}
            >
              {filter.label}
            </button>
          ))}
          </div>
        </div>

        {!isEditing ? (
          <div className="card-body">
          <table className="data-table">
            <thead>
              <tr>
                <th>N° commande</th>
                <th>Client</th>
                <th>Table</th>
                <th>Articles</th>
                <th>Montant</th>
                <th>Heure</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 700 }}>{order.orderNumber}</td>
                  <td>{order.customer}</td>
                  <td>{order.table}</td>
                  <td>{order.itemsCount}</td>
                  <td>{order.total.toFixed(2)} EUR</td>
                  <td>{order.createdAt}</td>
                  <td>
                    <span
                      className="status-badge"
                      style={{
                        background: statusConfig[order.status].bg,
                        color: statusConfig[order.status].color,
                      }}
                    >
                      {statusConfig[order.status].label}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-400)' }}>
                    Aucune commande pour ce filtre.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, minmax(180px, 1fr))',
              gap: 10,
              paddingBottom: 6,
            }}
          >
            {kanbanStatuses.map((status) => {
              const statusOrders = orders.filter((order) => order.status === status);
              return (
                <div
                  key={status}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDropToStatus(status)}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    background: 'var(--surface-1)',
                    minHeight: 220,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div
                    style={{
                      padding: '10px 10px 8px',
                      borderBottom: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span
                      className="status-badge"
                      style={{
                        background: statusConfig[status].bg,
                        color: statusConfig[status].color,
                      }}
                    >
                      {statusConfig[status].label}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-400)' }}>
                      {statusOrders.length}
                    </span>
                  </div>

                  <div style={{ padding: 8, display: 'grid', gap: 8 }}>
                    {statusOrders.map((order) => (
                      <div
                        key={order.id}
                        draggable
                        onDragStart={() => setDraggedOrderId(order.id)}
                        onDragEnd={() => setDraggedOrderId(null)}
                        style={{
                          border: '1px solid var(--border)',
                          borderRadius: 10,
                          padding: '10px 10px',
                          background: '#fff',
                          boxShadow: 'var(--shadow-xs)',
                          cursor: 'grab',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <strong style={{ fontSize: 12 }}>{order.orderNumber}</strong>
                          <span style={{ fontSize: 11, color: 'var(--text-400)' }}>
                            {order.createdAt}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-600)' }}>
                          {order.customer} - {order.table}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 700, marginTop: 4 }}>
                          {order.total.toFixed(2)} EUR
                        </div>
                      </div>
                    ))}
                    {statusOrders.length === 0 && (
                      <div style={{ fontSize: 12, color: 'var(--text-400)', textAlign: 'center', padding: '16px 8px' }}>
                        Glissez une commande ici
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Orders;
