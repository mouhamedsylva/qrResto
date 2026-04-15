import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Check, Send } from 'lucide-react';

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: 'OWNER' | 'MANAGER' | 'STAFF' | string;
  restaurantId?: string | null;
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
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<'MANAGER' | 'STAFF'>('STAFF');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
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
      setFeedback("Impossible de charger l'equipe.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadTeam();
  }, [restaurantId]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId) return;
    try {
      const response = await api.post(`/users/team/${restaurantId}`, invite);
      const generatedPassword = response.data?.generatedPassword;
      const message =
        generatedPassword
          ? `Membre invite. Mot de passe temporaire: ${generatedPassword}`
          : 'Membre invite avec succes.';
      setFeedback(message);
      setSuccessMessage(message);
      setInvite({ name: '', email: '', role: 'STAFF' });
      setShowInvite(false);
      await loadTeam();
    } catch (error) {
      console.error("Erreur invitation membre d'equipe", error);
      setFeedback("Impossible d'inviter ce membre.");
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await api.delete(`/staff/${id}`);
      setFeedback('Membre archive avec succes.');
      setSuccessMessage('Membre archive avec succes.');
      await loadTeam();
    } catch (error) {
      console.error('Erreur suppression membre', error);
      setFeedback("Impossible d'archiver ce membre.");
    }
  };

  const handleEditRole = (member: TeamMember) => {
    setEditingMemberId(member.id);
    setEditingRole(member.role === 'MANAGER' ? 'MANAGER' : 'STAFF');
  };

  const handleSaveRole = async (memberId: string) => {
    if (!restaurantId) return;
    try {
      await api.put(`/users/team/${restaurantId}/${memberId}/role`, {
        role: editingRole,
      });
      setFeedback('Role mis a jour avec succes.');
      setSuccessMessage('Role mis a jour avec succes.');
      setEditingMemberId(null);
      await loadTeam();
    } catch (error) {
      console.error('Erreur modification role', error);
      setFeedback('Impossible de modifier le role.');
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
      setFeedback("Impossible de recuperer les details du membre.");
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
    if (selectedIds.length === team.length) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(team.map((member) => member.id));
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
      setFeedback('Aucune ligne valide a importer (name, email requis).');
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
        `Import termine. ${successCount} membre(s) ajoutes, ${failCount} echec(s).`,
      );
      await loadTeam();
    } catch (error) {
      console.error('Erreur import equipe', error);
      setFeedback("Impossible d'importer le fichier.");
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleImportCsv = async (file: File) => {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((line) => line.trim());
    if (lines.length < 2) {
      setFeedback('Fichier CSV vide ou invalide.');
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
    setFeedback(
      "Import Excel temporairement indisponible sur cet environnement. Utilisez l'import CSV pour l'instant.",
    );
  };

  const handleArchiveSelected = async () => {
    if (selectedIds.length === 0) {
      setFeedback('Selectionnez au moins un membre a archiver.');
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
        `Archivage termine. ${successCount} membre(s) archives, ${failCount} echec(s).`,
      );
      setSuccessMessage(
        `Archivage termine. ${successCount} membre(s) archives.`,
      );
      await loadTeam();
    } catch (error) {
      console.error('Erreur archivage multiple', error);
      setFeedback("Impossible d'archiver la selection.");
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
    if (role === 'OWNER') return 'Proprietaire';
    if (role === 'MANAGER') return 'Manager';
    return 'Staff';
  };

  return (
    <Layout title="Equipe" subtitle="Gestion des membres et des invitations.">
      <div className="card" style={{ padding: 20 }}>
        <div className="card-header">
          <span className="card-title">Membres de l'equipe</span>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowInvite((prev) => !prev)}
          >
            Inviter un membre
          </button>
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
            Actions multiples{selectedIds.length ? ` (${selectedIds.length} selectionnes)` : ''}
          </span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => document.getElementById('staff-import-csv-input')?.click()}
            disabled={isBulkProcessing}
          >
            Import CSV
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => document.getElementById('staff-import-excel-input')?.click()}
            disabled={isBulkProcessing}
          >
            Import Excel
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() =>
              setConfirmAction({
                title: 'Archiver la selection ?',
                message: `Vous allez archiver ${selectedIds.length} membre(s).`,
                action: async () => handleArchiveSelected(),
              })
            }
            disabled={isBulkProcessing}
          >
            Archiver selection
          </button>
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
              placeholder="Nom"
              style={{ height: 34, borderRadius: 8, border: '1px solid var(--border)', padding: '0 10px' }}
            />
            <input
              type="email"
              value={invite.email}
              onChange={(e) => setInvite((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="Email"
              style={{ height: 34, borderRadius: 8, border: '1px solid var(--border)', padding: '0 10px' }}
            />
            <select
              value={invite.role}
              onChange={(e) => setInvite((prev) => ({ ...prev, role: e.target.value }))}
              style={{ height: 34, borderRadius: 8, border: '1px solid var(--border)', padding: '0 10px' }}
            >
              <option value="STAFF">Staff</option>
              <option value="MANAGER">Manager</option>
            </select>
            <button className="btn btn-primary btn-sm" type="submit">
              Envoyer
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
                    checked={team.length > 0 && selectedIds.length === team.length}
                    onChange={toggleAll}
                  />
                </th>
                <th>Nom</th>
                <th>Role</th>
                <th>Email</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {team.map((member) => (
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
                    <span className="status-badge" style={{ background: 'rgba(16,185,129,0.10)', color: '#059669' }}>
                      Actif
                    </span>
                  </td>
                  <td>
                    {member.role !== 'OWNER' ? (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
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
                              <option value="STAFF">Staff</option>
                              <option value="MANAGER">Manager</option>
                            </select>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => void handleSaveRole(member.id)}
                            >
                              Sauver
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => setEditingMemberId(null)}
                            >
                              Annuler
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => handleEditRole(member)}
                            >
                              Modifier
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => void handleViewDetails(member.id)}
                            >
                              Details
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() =>
                                setConfirmAction({
                                  title: 'Archiver ce membre ?',
                                  message:
                                    'Ce membre sera retire de la liste active.',
                                  action: async () => handleArchive(member.id),
                                })
                              }
                            >
                              Archiver
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
              {!isLoading && team.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-500)' }}>
                    Aucun membre dans l'equipe.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
