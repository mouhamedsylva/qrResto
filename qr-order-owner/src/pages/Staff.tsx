import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Check, Send } from 'lucide-react';

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: 'OWNER' | 'MANAGER' | 'STAFF' | string;
  restaurantId?: string | null;
  archivedAt?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
};

type TeamMemberDetails = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  hasPassword: boolean;
  restaurant?: { id: string; name: string } | null;
};

const Staff: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [archivedTeam, setArchivedTeam] = useState<TeamMember[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<'MANAGER' | 'STAFF'>('STAFF');
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<'ACTIVE' | 'INACTIVE' | 'ON_LEAVE'>('ACTIVE');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    action: () => Promise<void>;
  } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [detailsModal, setDetailsModal] = useState<TeamMemberDetails | null>(null);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);
  const [invite, setInvite] = useState({
    name: '',
    email: '',
    role: 'STAFF',
  });
  const restaurantId = user?.restaurant?.id;

  const loadTeam = async () => {
    if (!restaurantId) return;
    setIsLoading(true);
    try {
      const response = await api.get<TeamMember[]>(`/users/team/${restaurantId}`);
      const payload = response.data;
      const members = Array.isArray(payload)
        ? payload
        : Array.isArray((payload as any)?.data)
          ? (payload as any).data
          : [];

      setTeam(
        members.filter(
          (member: TeamMember) =>
            !member.restaurantId || member.restaurantId === restaurantId,
        ),
      );
      setSelectedIds([]);
    } catch (error) {
      console.error('Erreur chargement equipe', error);
      setFeedback(t('staff.cannotLoadTeam'));
    } finally {
      setIsLoading(false);
    }
  };

  const loadArchivedTeam = async () => {
    if (!restaurantId) return;
    try {
      const response = await api.get<TeamMember[]>(`/users/team/${restaurantId}/archived`);
      const payload = response.data;
      const members = Array.isArray(payload)
        ? payload
        : Array.isArray((payload as any)?.data)
          ? (payload as any).data
          : [];

      setArchivedTeam(members);
    } catch (error) {
      console.error('Erreur chargement membres archives', error);
      setFeedback(t('staff.cannotLoadTeam'));
    }
  };

  useEffect(() => {
    void loadTeam();
    void loadArchivedTeam();
  }, [restaurantId]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId) return;
    try {
      const response = await api.post(`/users/team/${restaurantId}`, invite);
      const generatedPassword = response.data?.generatedPassword;
      const message =
        generatedPassword
          ? t('staff.memberInvitedWithPassword').replace('{password}', generatedPassword)
          : t('staff.memberInvited');
      setFeedback(message);
      setSuccessMessage(message);
      setInvite({ name: '', email: '', role: 'STAFF' });
      setShowInvite(false);
      await loadTeam();
    } catch (error) {
      console.error("Erreur invitation membre d'equipe", error);
      setFeedback(t('staff.cannotInvite'));
    }
  };

  const handleArchive = async (id: string) => {
    if (!restaurantId) return;
    try {
      await api.post(`/users/team/${restaurantId}/archive-bulk`, { ids: [id] });
      setFeedback(t('staff.memberArchived'));
      setSuccessMessage(t('staff.memberArchived'));
      await loadTeam();
      await loadArchivedTeam();
    } catch (error) {
      console.error('Erreur archivage membre', error);
      setFeedback(t('staff.cannotArchive'));
    }
  };

  const handleEditRole = (member: TeamMember) => {
    setEditingMemberId(member.id);
    setEditingRole(member.role === 'MANAGER' ? 'MANAGER' : 'STAFF');
  };

  const handleEditStatus = (member: TeamMember) => {
    setEditingStatusId(member.id);
    setEditingStatus(member.status || 'ACTIVE');
  };

  const handleSaveRole = async (memberId: string) => {
    if (!restaurantId) return;
    try {
      await api.put(`/users/team/${restaurantId}/${memberId}/role`, {
        role: editingRole,
      });
      setFeedback(t('staff.roleUpdated'));
      setSuccessMessage(t('staff.roleUpdated'));
      setEditingMemberId(null);
      await loadTeam();
    } catch (error) {
      console.error('Erreur modification role', error);
      setFeedback(t('staff.cannotModifyRole'));
    }
  };

  const handleSaveStatus = async (memberId: string) => {
    if (!restaurantId) return;
    try {
      await api.put(`/users/team/${restaurantId}/${memberId}/status`, {
        status: editingStatus,
      });
      setFeedback(t('staff.statusUpdated'));
      setSuccessMessage(t('staff.statusUpdated'));
      setEditingStatusId(null);
      await loadTeam();
    } catch (error) {
      console.error('Erreur modification statut', error);
      setFeedback(t('staff.cannotModifyStatus'));
    }
  };

  const handleViewDetails = async (memberId: string) => {
    if (!restaurantId) return;
    try {
      const response = await api.get<TeamMemberDetails>(
        `/users/team/${restaurantId}/${memberId}`,
      );
      setDetailsModal(response.data);
      setTemporaryPassword(null);
    } catch (error) {
      console.error('Erreur details membre', error);
      setFeedback(t('staff.cannotGetDetails'));
    }
  };

  const handleGenerateTemporaryPassword = async () => {
    if (!restaurantId || !detailsModal) return;
    try {
      const response = await api.post<{ temporaryPassword: string }>(
        `/users/team/${restaurantId}/${detailsModal.id}/reset-password`,
      );
      setTemporaryPassword(response.data.temporaryPassword);
      setSuccessMessage('Mot de passe temporaire genere avec succes.');
    } catch (error) {
      console.error('Erreur generation mot de passe temporaire', error);
      setFeedback('Impossible de generer un mot de passe temporaire.');
    }
  };

  const handleSendPasswordByGmail = () => {
    if (!detailsModal?.email || !temporaryPassword) {
      setFeedback(
        "Generez d'abord un mot de passe temporaire avant l'envoi Gmail.",
      );
      return;
    }

    const subject = encodeURIComponent(
      'Votre mot de passe temporaire - QR Order',
    );
    const body = encodeURIComponent(
      `Bonjour ${detailsModal.name},\n\nVotre mot de passe temporaire est: ${temporaryPassword}\n\nMerci de vous connecter puis de le changer immediatement.\n\nCordialement,\nL'equipe ${user?.restaurant?.name || 'QR Order'}`,
    );

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      detailsModal.email,
    )}&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === paginatedList.length) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(paginatedList.map((member) => member.id));
  };

  const normalizeRole = (raw: string): 'MANAGER' | 'STAFF' => {
    const role = raw.trim().toUpperCase();
    return role === 'MANAGER' ? 'MANAGER' : 'STAFF';
  };

  const importMembers = async (
    rows: Array<{ name?: string; email?: string; role?: string }>,
  ) => {
    if (!restaurantId) return;
    const validRows = rows.filter(
      (row) => row.name?.trim() && row.email?.trim(),
    );

    if (validRows.length === 0) {
      setFeedback(t('staff.csvEmpty'));
      return;
    }

    setIsBulkProcessing(true);
    try {
      const payload = {
        members: validRows.map((row) => ({
          name: row.name?.trim(),
          email: row.email?.trim(),
          role: normalizeRole(row.role || 'STAFF'),
        })),
      };

      const response = await api.post(
        `/users/team/${restaurantId}/import`,
        payload,
      );
      const successCount = response.data?.successCount || 0;
      const failCount = response.data?.failCount || 0;

      setFeedback(
        t('staff.importComplete')
          .replace('{success}', String(successCount))
          .replace('{fail}', String(failCount))
      );
      await loadTeam();
    } catch (error) {
      console.error('Erreur import equipe', error);
      setFeedback(t('staff.cannotInvite'));
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleImportCsv = async (file: File) => {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((line) => line.trim());
    if (lines.length < 2) {
      setFeedback(t('staff.csvEmpty'));
      return;
    }
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const rows = lines.slice(1).map((line) => {
      const cols = line.split(',').map((c) => c.trim());
      return {
        name: cols[headers.indexOf('name')] || cols[0],
        email: cols[headers.indexOf('email')] || cols[1],
        role: cols[headers.indexOf('role')] || cols[2] || 'STAFF',
      };
    });
    await importMembers(rows);
  };

  const handleImportExcel = async (file: File) => {
    if (!file) return;
    setFeedback(t('staff.excelUnavailable'));
  };

  const handleArchiveSelected = async () => {
    if (selectedIds.length === 0) {
      setFeedback(t('staff.selectAtLeastOne'));
      return;
    }

    setIsBulkProcessing(true);
    try {
      const response = await api.post(
        `/users/team/${restaurantId}/archive-bulk`,
        { ids: selectedIds },
      );
      const successCount = response.data?.archivedCount || 0;
      const failCount = Math.max(0, selectedIds.length - successCount);
      setFeedback(
        t('staff.archiveComplete')
          .replace('{success}', String(successCount))
          .replace('{fail}', String(failCount))
      );
      setSuccessMessage(
        t('staff.archiveComplete')
          .replace('{success}', String(successCount))
          .replace('{fail}', String(failCount))
      );
      await loadTeam();
      await loadArchivedTeam();
    } catch (error) {
      console.error('Erreur archivage multiple', error);
      setFeedback(t('staff.cannotArchive'));
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleUnarchive = async (id: string) => {
    if (!restaurantId) return;
    try {
      await api.post(`/users/team/${restaurantId}/${id}/unarchive`);
      setFeedback(t('staff.memberUnarchived'));
      setSuccessMessage(t('staff.memberUnarchived'));
      await loadTeam();
      await loadArchivedTeam();
    } catch (error) {
      console.error('Erreur desarchivage membre', error);
      setFeedback(t('staff.cannotArchive'));
    }
  };

  const handleUnarchiveSelected = async () => {
    if (selectedIds.length === 0) {
      setFeedback(t('staff.selectAtLeastOne'));
      return;
    }

    setIsBulkProcessing(true);
    try {
      const response = await api.post(
        `/users/team/${restaurantId}/unarchive-bulk`,
        { ids: selectedIds },
      );
      const successCount = response.data?.unarchivedCount || 0;
      const failCount = Math.max(0, selectedIds.length - successCount);
      setFeedback(
        t('staff.unarchiveComplete')
          .replace('{success}', String(successCount))
          .replace('{fail}', String(failCount))
      );
      setSuccessMessage(
        t('staff.unarchiveComplete')
          .replace('{success}', String(successCount))
          .replace('{fail}', String(failCount))
      );
      await loadTeam();
      await loadArchivedTeam();
    } catch (error) {
      console.error('Erreur desarchivage multiple', error);
      setFeedback(t('staff.cannotArchive'));
    } finally {
      setIsBulkProcessing(false);
    }
  };

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(null), 1800);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const roleLabel = (role: string) => {
    if (role === 'OWNER') return t('staff.owner');
    if (role === 'MANAGER') return t('staff.manager');
    return t('staff.staffMember');
  };

  const statusLabel = (status?: string) => {
    if (status === 'INACTIVE') return t('staff.inactive');
    if (status === 'ON_LEAVE') return t('staff.onLeave');
    return t('staff.active');
  };

  const statusColor = (status?: string) => {
    if (status === 'INACTIVE') return { background: 'rgba(239,68,68,0.10)', color: '#dc2626' };
    if (status === 'ON_LEAVE') return { background: 'rgba(251,191,36,0.10)', color: '#f59e0b' };
    return { background: 'rgba(16,185,129,0.10)', color: '#059669' };
  };

  // Pagination
  const currentList = showArchived ? archivedTeam : team;
  const totalPages = Math.ceil(currentList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedList = currentList.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    setSelectedIds([]);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      setSelectedIds([]);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setSelectedIds([]);
    }
  };

  // Réinitialiser la page lors du changement de vue
  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [showArchived]);

  return (
    <Layout title={t('staff.team')} subtitle={t('staff.teamManagement')}>
      <div className="card" style={{ padding: 20 }}>
        <div className="card-header">
          <span className="card-title">
            {showArchived ? t('staff.archivedMembers') : t('staff.activeMembers')}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setShowArchived(!showArchived);
                setSelectedIds([]);
              }}
            >
              {showArchived ? t('staff.viewActive') : `${t('staff.viewArchived')} (${archivedTeam.length})`}
            </button>
            {!showArchived && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowInvite((prev) => !prev)}
              >
                {t('staff.inviteMember')}
              </button>
            )}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            padding: '10px 0 14px',
            alignItems: 'center',
          }}
        >
          <span className="text-xs text-lighter">
            {t('staff.multipleActions')}{selectedIds.length ? ` (${selectedIds.length} ${t('staff.selected')})` : ''}
          </span>
          {!showArchived && (
            <>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => document.getElementById('staff-import-csv-input')?.click()}
                disabled={isBulkProcessing}
              >
                {t('staff.importCsv')}
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => document.getElementById('staff-import-excel-input')?.click()}
                disabled={isBulkProcessing}
              >
                {t('staff.importExcel')}
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() =>
                  setConfirmAction({
                    title: t('staff.archiveSelectionConfirm'),
                    message: t('staff.archiveSelectionMessage').replace('{count}', String(selectedIds.length)),
                    action: async () => handleArchiveSelected(),
                  })
                }
                disabled={isBulkProcessing}
              >
                {t('staff.archiveSelection')}
              </button>
            </>
          )}
          {showArchived && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() =>
                setConfirmAction({
                  title: t('staff.unarchiveSelectionConfirm'),
                  message: t('staff.unarchiveSelectionMessage').replace('{count}', String(selectedIds.length)),
                  action: async () => handleUnarchiveSelected(),
                })
              }
              disabled={isBulkProcessing}
            >
              {t('staff.unarchiveSelection')}
            </button>
          )}
          <input
            id="staff-import-csv-input"
            type="file"
            accept=".csv,text/csv"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                void handleImportCsv(file);
              }
              e.currentTarget.value = '';
            }}
          />
          <input
            id="staff-import-excel-input"
            type="file"
            accept=".xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                void handleImportExcel(file);
              }
              e.currentTarget.value = '';
            }}
          />
        </div>
        {showInvite && (
          <form
            onSubmit={handleInvite}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 160px auto',
              gap: 8,
              padding: '8px 0 14px',
            }}
          >
            <input
              value={invite.name}
              onChange={(e) => setInvite((prev) => ({ ...prev, name: e.target.value }))}
              placeholder={t('staff.name')}
              style={{ height: 34, borderRadius: 8, border: '1px solid var(--border)', padding: '0 10px' }}
            />
            <input
              type="email"
              value={invite.email}
              onChange={(e) => setInvite((prev) => ({ ...prev, email: e.target.value }))}
              placeholder={t('staff.email')}
              style={{ height: 34, borderRadius: 8, border: '1px solid var(--border)', padding: '0 10px' }}
            />
            <select
              value={invite.role}
              onChange={(e) => setInvite((prev) => ({ ...prev, role: e.target.value }))}
              style={{ height: 34, borderRadius: 8, border: '1px solid var(--border)', padding: '0 10px' }}
            >
              <option value="STAFF">{t('staff.staffMember')}</option>
              <option value="MANAGER">{t('staff.manager')}</option>
            </select>
            <button className="btn btn-primary btn-sm" type="submit">
              {t('staff.send')}
            </button>
          </form>
        )}
        {feedback && (
          <div style={{ padding: '0 0 12px', color: 'var(--text-600)', fontSize: 13 }}>
            {feedback}
          </div>
        )}
        <div className="card-body">
          <table className="data-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={paginatedList.length > 0 && selectedIds.length === paginatedList.length}
                    onChange={toggleAll}
                  />
                </th>
                <th>{t('staff.nameColumn')}</th>
                <th>{t('staff.roleColumn')}</th>
                <th>{t('staff.emailColumn')}</th>
                <th>{t('staff.statusColumn')}</th>
                {showArchived && <th>{t('staff.archivedOn')}</th>}
                <th>{t('staff.action')}</th>
              </tr>
            </thead>
            <tbody>
              {!showArchived && paginatedList.map((member) => (
                <tr key={member.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(member.id)}
                      onChange={() => toggleSelected(member.id)}
                    />
                  </td>
                  <td style={{ fontWeight: 600 }}>{member.name}</td>
                  <td>{roleLabel(member.role)}</td>
                  <td>{member.email}</td>
                  <td>
                    {editingStatusId === member.id ? (
                      <select
                        value={editingStatus}
                        onChange={(e) =>
                          setEditingStatus(e.target.value as 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE')
                        }
                        style={{
                          height: 30,
                          borderRadius: 8,
                          border: '1px solid var(--border)',
                          padding: '0 8px',
                        }}
                      >
                        <option value="ACTIVE">{t('staff.active')}</option>
                        <option value="INACTIVE">{t('staff.inactive')}</option>
                        <option value="ON_LEAVE">{t('staff.onLeave')}</option>
                      </select>
                    ) : (
                      <span className="status-badge" style={statusColor(member.status)}>
                        {statusLabel(member.status)}
                      </span>
                    )}
                  </td>
                  <td>
                    {member.role !== 'OWNER' ? (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        {editingMemberId === member.id ? (
                          <>
                            <select
                              value={editingRole}
                              onChange={(e) =>
                                setEditingRole(e.target.value as 'MANAGER' | 'STAFF')
                              }
                              style={{
                                height: 30,
                                borderRadius: 8,
                                border: '1px solid var(--border)',
                                padding: '0 8px',
                              }}
                            >
                              <option value="STAFF">{t('staff.staffMember')}</option>
                              <option value="MANAGER">{t('staff.manager')}</option>
                            </select>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => void handleSaveRole(member.id)}
                            >
                              {t('staff.save')}
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => setEditingMemberId(null)}
                            >
                              {t('common.cancel')}
                            </button>
                          </>
                        ) : editingStatusId === member.id ? (
                          <>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => void handleSaveStatus(member.id)}
                            >
                              {t('staff.save')}
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => setEditingStatusId(null)}
                            >
                              {t('common.cancel')}
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => handleEditRole(member)}
                            >
                              {t('staff.modifyRole')}
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => handleEditStatus(member)}
                            >
                              {t('staff.modifyStatus')}
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => void handleViewDetails(member.id)}
                            >
                              {t('staff.details')}
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() =>
                                setConfirmAction({
                                  title: t('staff.archiveMember'),
                                  message: t('staff.archiveMemberMessage'),
                                  action: async () => handleArchive(member.id),
                                })
                              }
                            >
                              {t('staff.archive')}
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-lighter">-</span>
                    )}
                  </td>
                </tr>
              ))}
              {showArchived && paginatedList.map((member) => (
                <tr key={member.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(member.id)}
                      onChange={() => toggleSelected(member.id)}
                    />
                  </td>
                  <td style={{ fontWeight: 600 }}>{member.name}</td>
                  <td>{roleLabel(member.role)}</td>
                  <td>{member.email}</td>
                  <td>
                    <span className="status-badge" style={{ background: 'rgba(156,163,175,0.10)', color: '#6b7280' }}>
                      {t('staff.archived')}
                    </span>
                  </td>
                  <td>
                    {member.archivedAt ? new Date(member.archivedAt).toLocaleDateString('fr-FR') : '-'}
                  </td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() =>
                        setConfirmAction({
                          title: t('staff.unarchiveMember'),
                          message: t('staff.unarchiveMemberMessage'),
                          action: async () => handleUnarchive(member.id),
                        })
                      }
                    >
                      {t('staff.unarchive')}
                    </button>
                  </td>
                </tr>
              ))}
              {!isLoading && !showArchived && paginatedList.length === 0 && currentList.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-500)' }}>
                    {t('staff.noMembers')}
                  </td>
                </tr>
              )}
              {!isLoading && showArchived && paginatedList.length === 0 && currentList.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-500)' }}>
                    {t('staff.noArchivedMembers')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {currentList.length > itemsPerPage && (
          <div className="pagination-container" style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '16px 20px',
            borderTop: '1px solid var(--border)'
          }}>
            <div style={{ fontSize: 14, color: 'var(--text-600)' }}>
              {t('staff.showing')
                .replace('{start}', String(startIndex + 1))
                .replace('{end}', String(Math.min(endIndex, currentList.length)))
                .replace('{total}', String(currentList.length))}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
              >
                {t('staff.previous')}
              </button>
              <div style={{ display: 'flex', gap: 4 }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`btn btn-sm ${page === currentPage ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => goToPage(page)}
                    style={{ minWidth: 36 }}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}
              >
                {t('staff.next')}
              </button>
            </div>
          </div>
        )}
      </div>
      {confirmAction && (
        <div className="confirm-modal-backdrop">
          <div className="confirm-modal">
            <h3>{confirmAction.title}</h3>
            <p>{confirmAction.message}</p>
            <div className="confirm-actions">
              <button className="btn btn-ghost" onClick={() => setConfirmAction(null)}>
                Annuler
              </button>
              <button
                className="btn btn-primary confirm-danger"
                onClick={async () => {
                  await confirmAction.action();
                  setConfirmAction(null);
                }}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
      {successMessage && (
        <div className="swal-success-backdrop">
          <div className="swal-success-card">
            <div className="swal-success-circle">
              <Check size={28} />
            </div>
            <h4>Succes</h4>
            <p>{successMessage}</p>
          </div>
        </div>
      )}
      {detailsModal && (
        <div className="confirm-modal-backdrop">
          <div className="confirm-modal staff-details-modal" style={{ maxWidth: 620 }}>
            <h3>Dossier membre</h3>
            <div className="staff-details-grid">
              <div><strong>Nom</strong><span>{detailsModal.name}</span></div>
              <div><strong>Email</strong><span>{detailsModal.email}</span></div>
              <div><strong>Role</strong><span>{roleLabel(detailsModal.role)}</span></div>
              <div><strong>Restaurant</strong><span>{detailsModal.restaurant?.name || '-'}</span></div>
              <div><strong>Cree le</strong><span>{new Date(detailsModal.createdAt).toLocaleString('fr-FR')}</span></div>
              <div><strong>Mis a jour le</strong><span>{new Date(detailsModal.updatedAt).toLocaleString('fr-FR')}</span></div>
            </div>
            <div className="staff-password-block">
              <p className="staff-password-label">Mot de passe temporaire</p>
              <p className="staff-password-value">
                {temporaryPassword || 'Cliquez sur "Generer" pour obtenir un mot de passe lisible.'}
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => void handleGenerateTemporaryPassword()}
                >
                  Generer
                </button>
                {!!temporaryPassword && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => navigator.clipboard.writeText(temporaryPassword)}
                  >
                    Copier
                  </button>
                )}
                {!!temporaryPassword && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleSendPasswordByGmail}
                  >
                    <Send size={14} />
                    Envoyer
                  </button>
                )}
              </div>
            </div>
            <div className="confirm-actions">
              <button className="btn btn-primary" onClick={() => setDetailsModal(null)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Staff;
