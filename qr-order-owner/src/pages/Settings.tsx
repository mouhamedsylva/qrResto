import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Shield,
  Save,
  Check,
  Settings as SettingsIcon,
  Store,
  MapPin,
  Phone,
  Mail,
  Loader2,
  Globe,
  Upload,
  Moon,
  Sun,
  DollarSign,
  Lock,
  Eye,
  EyeOff,
  Edit2,
  X,
  LogOut,
} from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage, type Language } from '../context/LanguageContext';
import { useCurrency, type Currency } from '../context/CurrencyContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

// --- Helper Components ---

const TabButton: React.FC<{
  id: 'general' | 'team' | 'theme' | 'language' | 'currency' | 'security';
  icon: React.ReactNode;
  label: string;
  activeTab: string;
  setActiveTab: (id: any) => void;
}> = ({ id, icon, label, activeTab, setActiveTab }) => (
  <button
    onClick={() => setActiveTab(id)}
    className={`btn ${activeTab === id ? 'btn-primary' : 'btn-ghost'}`}
    style={{
      padding: '10px 16px',
      justifyContent: 'flex-start',
      flex: 1,
      borderRadius: 12,
      boxShadow: activeTab === id ? 'var(--shadow-primary)' : 'none',
      background: activeTab === id ? 'var(--primary)' : 'transparent',
      color: activeTab === id ? '#fff' : 'var(--text-600)',
    }}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const SectionTitle: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div style={{ marginBottom: 20 }}>
    <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-900)', marginBottom: 4 }}>{title}</h3>
    {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
  </div>
);

const FormGroup: React.FC<{ label: string; icon?: React.ReactNode; children: React.ReactNode }> = ({
  label,
  icon,
  children,
}) => (
  <div className="form-group" style={{ marginBottom: 16 }}>
    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
      {icon}
      {label}
    </label>
    {children}
  </div>
);

const Switch: React.FC<{ checked: boolean; onChange: () => void; label: string; description?: string }> = ({
  checked,
  onChange,
  label,
  description,
}) => (
  <div
    onClick={onChange}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      background: 'var(--surface-1)',
      borderRadius: 12,
      border: `1px solid ${checked ? 'var(--primary-hover)' : 'var(--border)'}`,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }}
  >
    <div>
      <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-900)' }}>{label}</div>
      {description && <div className="text-xs text-muted">{description}</div>}
    </div>
    <div
      style={{
        width: 40,
        height: 22,
        background: checked ? 'var(--primary)' : 'var(--text-400)',
        borderRadius: 11,
        position: 'relative',
        transition: 'background 0.2s ease',
      }}
    >
      <div
        style={{
          width: 18,
          height: 18,
          background: '#fff',
          borderRadius: '50%',
          position: 'absolute',
          top: 2,
          left: checked ? 20 : 2,
          transition: 'left 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}
      />
    </div>
  </div>
);

const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language: currentLanguage, setLanguage, t } = useLanguage();
  const { currency, setCurrency: setCurrencyContext } = useCurrency();
  const navigate = useNavigate();
  const isStaff = user?.role === 'STAFF';
  const isManager = user?.role === 'MANAGER';
  const [activeTab, setActiveTab] = useState<'general' | 'team' | 'theme' | 'language' | 'currency' | 'security'>(isStaff ? 'security' : 'general');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditingGeneral, setIsEditingGeneral] = useState(false);

  // General
  const [restaurantName, setRestaurantName] = useState(user?.restaurant?.name || 'Mon Restaurant');
  const [restaurantDesc, setRestaurantDesc] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Team Permissions
  const [permissions, setPermissions] = useState({
    managerCanSeeStats: true,
    managerCanEditMenu: true,
    managerCanManageOrders: true,
    managerCanManageStaff: false,
    staffCanEditMenu: false,
    staffCanManageOrders: true,
  });

  // Security
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.restaurant?.id) return;
      
      try {
        setIsLoading(true);
        const response = await api.get(`/restaurants/${user.restaurant.id}/complete`);
        const { restaurant, settings } = response.data;

        setRestaurantName(restaurant.name || '');
        setRestaurantDesc(restaurant.description || '');
        setAddress(restaurant.address || '');
        setPhone(restaurant.phoneNumber || '');
        setEmail(restaurant.email || '');
        setLogoUrl(restaurant.logoUrl || null);

        if (settings) {
          setPermissions({
            managerCanSeeStats: settings.permissions?.managerCanSeeStats ?? true,
            managerCanEditMenu: settings.permissions?.managerCanEditMenu ?? true,
            managerCanManageOrders: settings.permissions?.managerCanManageOrders ?? true,
            managerCanManageStaff: settings.permissions?.managerCanManageStaff ?? false,
            staffCanEditMenu: settings.permissions?.staffCanEditMenu ?? false,
            staffCanManageOrders: settings.permissions?.staffCanManageOrders ?? true,
          });
          // Synchroniser la langue du backend avec le contexte
          if (settings.language) {
            setLanguage(settings.language as Language);
          }
          // Synchroniser la devise du backend avec le contexte
          if (settings.currency) {
            setCurrencyContext(settings.currency as Currency);
          }
        }
      } catch (err) {
        console.error('Failed to fetch restaurant data:', err);
        setError(t('settings.general.loadError'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.restaurant?.id, setLanguage, t]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.restaurant?.id) return;

    setIsSaving(true);
    setError(null);
    
    try {
      // 1. Update Restaurant General Info
      await api.put(`/restaurants/${user.restaurant.id}`, {
        name: restaurantName,
        description: restaurantDesc,
        address,
        phoneNumber: phone,
        email,
      });

      // 2. Update Restaurant Settings
      await api.put(`/restaurants/${user.restaurant.id}/settings`, {
        language: currentLanguage,
        currency,
        staffCanEditMenu: permissions.staffCanEditMenu,
        staffCanManageOrders: permissions.staffCanManageOrders,
        managerCanEditMenu: permissions.managerCanEditMenu,
        managerCanManageOrders: permissions.managerCanManageOrders,
        managerCanSeeStats: permissions.managerCanSeeStats,
        managerCanManageStaff: permissions.managerCanManageStaff,
      });

      setShowSuccess(true);
      setIsEditingGeneral(false); // Retour en mode lecture après sauvegarde
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError(t('settings.general.saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  const togglePermission = (key: keyof typeof permissions) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLanguageChange = async (lang: Language) => {
    if (!user?.restaurant?.id) return;
    
    // Mettre à jour immédiatement le contexte (localStorage)
    setLanguage(lang);
    
    // Sauvegarder dans le backend
    try {
      await api.put(`/restaurants/${user.restaurant.id}/settings`, {
        language: lang,
        currency,
        staffCanEditMenu: permissions.staffCanEditMenu,
        staffCanManageOrders: permissions.staffCanManageOrders,
        managerCanEditMenu: permissions.managerCanEditMenu,
        managerCanManageOrders: permissions.managerCanManageOrders,
        managerCanSeeStats: permissions.managerCanSeeStats,
        managerCanManageStaff: permissions.managerCanManageStaff,
      });
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to save language:', err);
      setError(t('settings.general.saveError'));
    }
  };

  const handleCurrencyChange = async (curr: Currency) => {
    if (!user?.restaurant?.id) return;
    
    // Mettre à jour immédiatement le contexte (localStorage)
    setCurrencyContext(curr);
    
    // Sauvegarder dans le backend
    try {
      await api.put(`/restaurants/${user.restaurant.id}/settings`, {
        language: currentLanguage,
        currency: curr,
        staffCanEditMenu: permissions.staffCanEditMenu,
        staffCanManageOrders: permissions.staffCanManageOrders,
        managerCanEditMenu: permissions.managerCanEditMenu,
        managerCanManageOrders: permissions.managerCanManageOrders,
        managerCanSeeStats: permissions.managerCanSeeStats,
        managerCanManageStaff: permissions.managerCanManageStaff,
      });
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to save currency:', err);
      setError(t('settings.general.saveError'));
    }
  };

  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [logoutCountdown, setLogoutCountdown] = useState<number | null>(null);

  const getPasswordStrength = (pwd: string): number => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    setPasswordError(null);
    setPasswordSuccess(false);

    if (!currentPassword.trim()) {
      setPasswordError('Veuillez saisir votre mot de passe actuel.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(t('settings.security.passwordMismatch'));
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError(t('settings.security.passwordTooShort'));
      return;
    }

    setIsSaving(true);

    try {
      await api.post('/users/change-password', {
        currentPassword,
        newPassword,
      });

      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordStrength(0);

      // Compte à rebours de 5s avant déconnexion automatique
      let remaining = 5;
      setLogoutCountdown(remaining);
      const interval = setInterval(() => {
        remaining -= 1;
        setLogoutCountdown(remaining);
        if (remaining <= 0) {
          clearInterval(interval);
          logout();
          navigate('/login');
        }
      }, 1000);
    } catch (err: any) {
      console.error('Failed to change password:', err);
      const msg = err.response?.data?.message;
      if (msg === 'Le mot de passe actuel est incorrect') {
        setPasswordError('Mot de passe actuel incorrect. Veuillez réessayer.');
      } else {
        setPasswordError(msg || t('settings.security.passwordChangeError'));
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.restaurant?.id) return;

    setIsUploadingLogo(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post(`/restaurants/${user.restaurant.id}/logo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setLogoUrl(response.data.logoUrl);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to upload logo:', err);
      setError('Erreur lors de l\'upload du logo.');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  return (
    <Layout title={t('settings.title')} subtitle={t('settings.subtitle')}>
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16 }}>
          <Loader2 size={40} className="spin" style={{ color: 'var(--primary)' }} />
          <p className="text-muted">{t('common.loading')}</p>
        </div>
      ) : (
        <div className="content-grid" style={{ gridTemplateColumns: 'minmax(200px, 240px) 1fr', alignItems: 'start' }}>
        {/* Sidebar Tabs */}
        <div
          className="card"
          style={{
            padding: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            position: 'sticky',
            top: 20,
          }}
        >
          {!isStaff && <TabButton id="general" icon={<Store size={18} />} label={t('settings.tabs.general')} activeTab={activeTab} setActiveTab={setActiveTab} />}
          {!isStaff && <TabButton id="team" icon={<Shield size={18} />} label={t('settings.tabs.team')} activeTab={activeTab} setActiveTab={setActiveTab} />}
          <TabButton id="theme" icon={<Moon size={18} />} label={t('settings.tabs.theme')} activeTab={activeTab} setActiveTab={setActiveTab} />
          <TabButton id="language" icon={<Globe size={18} />} label={t('settings.tabs.language')} activeTab={activeTab} setActiveTab={setActiveTab} />
          <TabButton id="currency" icon={<DollarSign size={18} />} label={t('settings.tabs.currency')} activeTab={activeTab} setActiveTab={setActiveTab} />
          <TabButton id="security" icon={<Lock size={18} />} label={t('settings.tabs.security')} activeTab={activeTab} setActiveTab={setActiveTab} />

          <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            {/* Masquer le bouton Enregistrer pour l'onglet général en mode lecture et l'onglet sécurité (bouton intégré au formulaire) */}
            {!(activeTab === 'general' && !isEditingGeneral) && activeTab !== 'security' && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', height: 44 }}
              >
                {isSaving ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
                {isSaving ? t('common.saving') : t('common.save')}
              </button>
            )}
            {showSuccess && !(activeTab === 'general') && (
              <div
                style={{
                  marginTop: 12,
                  color: 'var(--success)',
                  fontSize: 12,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  justifyContent: 'center',
                }}
              >
                <Check size={14} /> {t('settings.changesSaved')}
              </div>
            )}
            {error && !(activeTab === 'general') && (
              <div
                style={{
                  marginTop: 12,
                  color: 'var(--error)',
                  fontSize: 12,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  justifyContent: 'center',
                  textAlign: 'center'
                }}
              >
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="card" style={{ padding: 32, minHeight: 500 }}>
          {activeTab === 'general' && !isEditingGeneral && (
            <div className="anim-in">
              {/* Header avec bouton Modifier */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                <div>
                  <h3 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-900)', marginBottom: 8 }}>
                    Profil du Restaurant
                  </h3>
                  <p className="text-sm text-muted">
                    Ces informations seront visibles par vos clients sur le menu digital.
                  </p>
                </div>
                <button
                  onClick={() => setIsEditingGeneral(true)}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <Edit2 size={16} />
                  Modifier
                </button>
              </div>

              {/* Fiche de présentation */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(217, 74, 106, 0.05) 0%, rgba(217, 74, 106, 0.02) 100%)',
                border: '2px solid var(--border)',
                borderRadius: 20,
                padding: 32,
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Décoration de fond */}
                <div style={{
                  position: 'absolute',
                  top: -50,
                  right: -50,
                  width: 200,
                  height: 200,
                  background: 'radial-gradient(circle, rgba(217, 74, 106, 0.1) 0%, transparent 70%)',
                  borderRadius: '50%',
                  pointerEvents: 'none',
                }} />

                {/* Logo et nom */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, marginBottom: 32, position: 'relative' }}>
                  {/* Logo */}
                  <div style={{
                    width: 120,
                    height: 120,
                    borderRadius: 20,
                    background: logoUrl ? 'transparent' : 'var(--surface-1)',
                    border: '3px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0,
                    boxShadow: 'var(--shadow-lg)',
                  }}>
                    {logoUrl ? (
                      <img
                        src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}${logoUrl}`}
                        alt="Logo"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <Store size={48} style={{ color: 'var(--text-400)' }} />
                    )}
                  </div>

                  {/* Nom et description */}
                  <div style={{ flex: 1 }}>
                    <h2 style={{
                      fontSize: 32,
                      fontWeight: 800,
                      color: 'var(--text-900)',
                      marginBottom: 12,
                      letterSpacing: '-0.02em',
                    }}>
                      {restaurantName || 'Nom du restaurant'}
                    </h2>
                    {restaurantDesc && (
                      <p style={{
                        fontSize: 15,
                        lineHeight: 1.6,
                        color: 'var(--text-600)',
                        maxWidth: 600,
                      }}>
                        {restaurantDesc}
                      </p>
                    )}
                  </div>
                </div>

                {/* Informations de contact */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: 20,
                  background: 'var(--surface-0)',
                  borderRadius: 16,
                  padding: 24,
                  border: '1px solid var(--border)',
                }}>
                  {/* Adresse */}
                  {address && (
                    <div style={{ display: 'flex', gap: 12 }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: 'rgba(217, 74, 106, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <MapPin size={20} style={{ color: 'var(--primary)' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-400)', marginBottom: 4 }}>
                          Adresse
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-900)' }}>
                          {address}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Téléphone */}
                  {phone && (
                    <div style={{ display: 'flex', gap: 12 }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: 'rgba(217, 74, 106, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Phone size={20} style={{ color: 'var(--primary)' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-400)', marginBottom: 4 }}>
                          Téléphone
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-900)' }}>
                          {phone}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  {email && (
                    <div style={{ display: 'flex', gap: 12 }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: 'rgba(217, 74, 106, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Mail size={20} style={{ color: 'var(--primary)' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-400)', marginBottom: 4 }}>
                          Email
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-900)' }}>
                          {email}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Message si aucune info */}
                {!address && !phone && !email && (
                  <div style={{
                    textAlign: 'center',
                    padding: 32,
                    color: 'var(--text-400)',
                  }}>
                    <p>Aucune information de contact renseignée.</p>
                    <p style={{ fontSize: 13, marginTop: 8 }}>
                      Cliquez sur "Modifier" pour ajouter vos informations.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'general' && isEditingGeneral && (
            <div className="anim-in">
              {/* Header avec boutons Annuler et Enregistrer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                <div>
                  <h3 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-900)', marginBottom: 8 }}>
                    Modifier le Profil
                  </h3>
                  <p className="text-sm text-muted">
                    Modifiez les informations de votre restaurant.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={() => {
                      setIsEditingGeneral(false);
                      setError(null);
                    }}
                    className="btn btn-ghost"
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <X size={16} />
                    Annuler
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    {isSaving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                    {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </div>

              {/* Formulaire d'édition */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <FormGroup label="Nom du restaurant" icon={<Store size={14} />}>
                  <input
                    className="form-input"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    placeholder="Ex: Le Petit Bistro"
                  />
                </FormGroup>
                <FormGroup label="Numéro de téléphone" icon={<Phone size={14} />}>
                  <input
                    className="form-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+221 77 123 45 67"
                  />
                </FormGroup>
              </div>
              <FormGroup label="Description" icon={<SettingsIcon size={14} />}>
                <textarea
                  className="form-input"
                  style={{ height: 100, paddingTop: 12, lineHeight: '1.5' }}
                  value={restaurantDesc}
                  onChange={(e) => setRestaurantDesc(e.target.value)}
                  placeholder="Décrivez votre restaurant..."
                />
              </FormGroup>
              <FormGroup label="Adresse complète" icon={<MapPin size={14} />}>
                <input
                  className="form-input"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 rue de..."
                />
              </FormGroup>
              <FormGroup label="Email public" icon={<Mail size={14} />}>
                <input
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@restaurant.com"
                />
              </FormGroup>
              <div style={{ marginTop: 24 }}>
                <span className="form-label">Logo du restaurant</span>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoChange}
                  hidden
                  accept="image/*"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    height: 120,
                    width: 120,
                    border: '2px dashed var(--border)',
                    borderRadius: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    background: 'var(--surface-1)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  {isUploadingLogo ? (
                    <Loader2 size={24} className="spin text-muted" />
                  ) : logoUrl ? (
                    <>
                      <img
                        src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}${logoUrl}`}
                        alt="Logo"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(0,0,0,0.4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0,
                          transition: 'opacity 0.2s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                      >
                        <Upload size={20} color="white" />
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload size={24} className="text-muted" />
                      <span className="text-sm text-muted">Ajouter</span>
                    </>
                  )}
                </div>
              </div>

              {/* Messages de succès/erreur */}
              {showSuccess && (
                <div style={{
                  marginTop: 20,
                  padding: 16,
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: 12,
                  color: 'var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}>
                  <Check size={20} />
                  <span style={{ fontWeight: 600 }}>Modifications enregistrées avec succès !</span>
                </div>
              )}
              {error && (
                <div style={{
                  marginTop: 20,
                  padding: 16,
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 12,
                  color: 'var(--danger)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}>
                  <X size={20} />
                  <span style={{ fontWeight: 600 }}>{error}</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'team' && (
            <div className="anim-in">
              <SectionTitle
                title="Permissions de l'Équipe"
                subtitle="Contrôlez finement ce que vos managers et votre staff peuvent faire."
              />
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--text-900)' }}>
                  Managers
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Switch
                    label="Voir les statistiques"
                    description="Accès au dashboard financier"
                    checked={permissions.managerCanSeeStats}
                    onChange={() => togglePermission('managerCanSeeStats')}
                  />
                  <Switch
                    label="Modifier le menu"
                    description="Ajout et édition de plats"
                    checked={permissions.managerCanEditMenu}
                    onChange={() => togglePermission('managerCanEditMenu')}
                  />
                  <Switch
                    label="Gérer les commandes"
                    description="Annulation et modification"
                    checked={permissions.managerCanManageOrders}
                    onChange={() => togglePermission('managerCanManageOrders')}
                  />
                  <Switch
                    label="Gérer le personnel"
                    description="Inviter ou supprimer du staff"
                    checked={permissions.managerCanManageStaff}
                    onChange={() => togglePermission('managerCanManageStaff')}
                  />
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--text-900)' }}>Staff</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Switch
                    label="Modifier le menu"
                    description="Utile pour les ruptures de stock"
                    checked={permissions.staffCanEditMenu}
                    onChange={() => togglePermission('staffCanEditMenu')}
                  />
                  <Switch
                    label="Gérer les commandes"
                    description="Valider la préparation des plats"
                    checked={permissions.staffCanManageOrders}
                    onChange={() => togglePermission('staffCanManageOrders')}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'theme' && (
            <div className="anim-in">
              <SectionTitle
                title="Thème de l'interface"
                subtitle="Choisissez entre le mode clair et le mode sombre."
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div
                  onClick={() => setTheme('light')}
                  style={{
                    padding: 24,
                    border: `2px solid ${theme === 'light' ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: 16,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: theme === 'light' ? 'rgba(217, 74, 106, 0.05)' : 'var(--surface-1)',
                  }}
                >
                  <Sun size={32} style={{ color: theme === 'light' ? 'var(--primary)' : 'var(--text-600)', marginBottom: 12 }} />
                  <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Mode Clair</h4>
                  <p className="text-sm text-muted">Interface lumineuse et claire</p>
                </div>
                <div
                  onClick={() => setTheme('dark')}
                  style={{
                    padding: 24,
                    border: `2px solid ${theme === 'dark' ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: 16,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: theme === 'dark' ? 'rgba(217, 74, 106, 0.05)' : 'var(--surface-1)',
                  }}
                >
                  <Moon size={32} style={{ color: theme === 'dark' ? 'var(--primary)' : 'var(--text-600)', marginBottom: 12 }} />
                  <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Mode Sombre</h4>
                  <p className="text-sm text-muted">Interface sombre pour réduire la fatigue oculaire</p>
                </div>
              </div>
              <div style={{ marginTop: 24, padding: 16, background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: 12 }}>
                <p className="text-sm" style={{ color: 'var(--info)' }}>
                  <strong>Note :</strong> Le changement de thème sera appliqué à toute l'application.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'language' && (
            <div className="anim-in">
              <SectionTitle
                title={t('settings.language.title')}
                subtitle={t('settings.language.subtitle')}
              />
              <div style={{ display: 'grid', gap: 12, maxWidth: 600 }}>
                {[
                  { code: 'fr' as Language, name: t('settings.language.french'), flag: '/flags/fr.svg' },
                  { code: 'en' as Language, name: t('settings.language.english'), flag: '/flags/en.svg' },
                  { code: 'nl' as Language, name: t('settings.language.dutch'), flag: '/flags/nl.svg' },
                  { code: 'es' as Language, name: t('settings.language.spanish'), flag: '/flags/es.svg' },
                ].map((lang) => (
                  <div
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    style={{
                      padding: 20,
                      border: `2px solid ${currentLanguage === lang.code ? 'var(--primary)' : 'var(--border)'}`,
                      borderRadius: 12,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      background: currentLanguage === lang.code ? 'rgba(217, 74, 106, 0.05)' : 'var(--surface-1)',
                      transition: 'all 0.2s ease',
                      boxShadow: currentLanguage === lang.code ? 'var(--shadow-primary)' : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (currentLanguage !== lang.code) {
                        e.currentTarget.style.borderColor = 'var(--primary)';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentLanguage !== lang.code) {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }
                    }}
                  >
                    <img 
                      src={lang.flag} 
                      alt={lang.name}
                      style={{ 
                        width: 48, 
                        height: 32, 
                        objectFit: 'cover',
                        borderRadius: 4,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        flexShrink: 0
                      }} 
                    />
                    <span style={{ fontSize: 18, fontWeight: 600, flex: 1, color: 'var(--text-900)' }}>{lang.name}</span>
                    {currentLanguage === lang.code && (
                      <Check size={24} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                    )}
                  </div>
                ))}
              </div>
              <div style={{ 
                marginTop: 24, 
                padding: 16, 
                background: 'rgba(99, 102, 241, 0.05)', 
                border: '1px solid rgba(99, 102, 241, 0.2)', 
                borderRadius: 12 
              }}>
                <p className="text-sm" style={{ color: 'var(--info)' }}>
                  <strong>{t('settings.theme.note')}</strong> {t('settings.theme.noteText')}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'currency' && (
            <div className="anim-in">
              <SectionTitle
                title={t('settings.currency.title')}
                subtitle={t('settings.currency.subtitle')}
              />
              <FormGroup label={t('settings.currency.label')} icon={<DollarSign size={14} />}>
                <select
                  className="form-input"
                  value={currency}
                  onChange={(e) => handleCurrencyChange(e.target.value as Currency)}
                  style={{ background: 'var(--surface-1)', maxWidth: 300 }}
                >
                  <option value="XOF">{t('settings.currency.xof')} (XOF)</option>
                  <option value="EUR">{t('settings.currency.eur')} (EUR)</option>
                  <option value="USD">{t('settings.currency.usd')} (USD)</option>
                </select>
              </FormGroup>
              <div style={{ marginTop: 24 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>{t('settings.currency.available')}</h4>
                <div style={{ display: 'grid', gap: 12 }}>
                  {[
                    { code: 'XOF' as Currency, name: t('settings.currency.xof'), symbol: 'CFA', region: t('settings.currency.xofRegion') },
                    { code: 'EUR' as Currency, name: t('settings.currency.eur'), symbol: '€', region: t('settings.currency.eurRegion') },
                    { code: 'USD' as Currency, name: t('settings.currency.usd'), symbol: '$', region: t('settings.currency.usdRegion') },
                  ].map((curr) => (
                    <div
                      key={curr.code}
                      onClick={() => handleCurrencyChange(curr.code)}
                      style={{
                        padding: 16,
                        border: `2px solid ${currency === curr.code ? 'var(--primary)' : 'var(--border)'}`,
                        borderRadius: 12,
                        cursor: 'pointer',
                        background: currency === curr.code ? 'rgba(217, 74, 106, 0.05)' : 'var(--surface-1)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                            {curr.name} ({curr.symbol})
                          </div>
                          <div className="text-sm text-muted">{curr.region}</div>
                        </div>
                        {currency === curr.code && <Check size={20} style={{ color: 'var(--primary)' }} />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="anim-in">
              <SectionTitle
                title="Sécurité"
                subtitle="Modifiez votre mot de passe pour sécuriser votre compte."
              />
              <form onSubmit={handlePasswordChange}>
                <FormGroup label="Mot de passe actuel" icon={<Lock size={14} />}>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="current-password"
                      type={showCurrentPassword ? 'text' : 'password'}
                      className="form-input"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Entrez votre mot de passe actuel"
                      style={{ paddingRight: 40 }}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      style={{
                        position: 'absolute', right: 12, top: '50%',
                        transform: 'translateY(-50%)', background: 'none',
                        border: 'none', cursor: 'pointer', color: 'var(--text-600)',
                      }}
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </FormGroup>

                <FormGroup label="Nouveau mot de passe" icon={<Lock size={14} />}>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      className="form-input"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setPasswordStrength(getPasswordStrength(e.target.value));
                      }}
                      placeholder="Entrez votre nouveau mot de passe"
                      style={{ paddingRight: 40 }}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{
                        position: 'absolute', right: 12, top: '50%',
                        transform: 'translateY(-50%)', background: 'none',
                        border: 'none', cursor: 'pointer', color: 'var(--text-600)',
                      }}
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {/* Indicateur de force */}
                  {newPassword.length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            style={{
                              flex: 1, height: 4, borderRadius: 2,
                              background: passwordStrength >= level
                                ? passwordStrength <= 1 ? '#ef4444'
                                  : passwordStrength <= 2 ? '#f59e0b'
                                  : passwordStrength <= 3 ? '#eab308'
                                  : passwordStrength <= 4 ? '#22c55e'
                                  : '#16a34a'
                                : 'var(--border)',
                              transition: 'background 0.3s ease',
                            }}
                          />
                        ))}
                      </div>
                      <p style={{
                        fontSize: 11, fontWeight: 600,
                        color: passwordStrength <= 1 ? '#ef4444'
                          : passwordStrength <= 2 ? '#f59e0b'
                          : passwordStrength <= 3 ? '#eab308'
                          : passwordStrength <= 4 ? '#22c55e'
                          : '#16a34a',
                      }}>
                        {passwordStrength <= 1 ? '🔴 Très faible'
                          : passwordStrength === 2 ? '🟠 Faible'
                          : passwordStrength === 3 ? '🟡 Moyen'
                          : passwordStrength === 4 ? '🟢 Fort'
                          : '✅ Très fort'}
                      </p>
                    </div>
                  )}
                </FormGroup>

                <FormGroup label="Confirmer le nouveau mot de passe" icon={<Lock size={14} />}>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="form-input"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirmez votre nouveau mot de passe"
                      style={{
                        paddingRight: 40,
                        borderColor: confirmPassword && confirmPassword !== newPassword
                          ? 'var(--error)' : undefined,
                      }}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        position: 'absolute', right: 12, top: '50%',
                        transform: 'translateY(-50%)', background: 'none',
                        border: 'none', cursor: 'pointer', color: 'var(--text-600)',
                      }}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== newPassword && (
                    <p style={{ fontSize: 11, color: 'var(--error)', marginTop: 4, fontWeight: 600 }}>
                      Les mots de passe ne correspondent pas.
                    </p>
                  )}
                  {confirmPassword && confirmPassword === newPassword && newPassword.length >= 8 && (
                    <p style={{ fontSize: 11, color: 'var(--success)', marginTop: 4, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Check size={12} /> Les mots de passe correspondent.
                    </p>
                  )}
                </FormGroup>

                {/* Conseils de sécurité */}
                <div style={{ marginTop: 8, marginBottom: 20, padding: 16, background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: 12 }}>
                  <p className="text-sm" style={{ color: 'var(--info)', fontWeight: 600, marginBottom: 8 }}>
                    💡 Conseils de sécurité
                  </p>
                  <ul className="text-sm" style={{ color: 'var(--info)', paddingLeft: 20, display: 'grid', gap: 4 }}>
                    <li>Au moins 8 caractères</li>
                    <li>Lettres majuscules et minuscules</li>
                    <li>Chiffres et caractères spéciaux (!@#$...)</li>
                    <li>Ne réutilisez pas un ancien mot de passe</li>
                  </ul>
                </div>

                {/* Message d'erreur */}
                {passwordError && (
                  <div style={{
                    padding: '12px 16px',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: 10,
                    marginBottom: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    fontSize: 13,
                    color: 'var(--error)',
                    fontWeight: 600,
                  }}>
                    <X size={16} style={{ flexShrink: 0 }} />
                    {passwordError}
                  </div>
                )}

                {/* Message de succès avec countdown */}
                {passwordSuccess && logoutCountdown !== null && (
                  <div style={{
                    padding: '16px',
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: 12,
                    marginBottom: 16,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <Check size={18} style={{ flexShrink: 0, color: 'var(--success)' }} />
                      <div>
                        <p style={{ fontSize: 13, color: 'var(--success)', fontWeight: 700, marginBottom: 2 }}>
                          Mot de passe modifié avec succès !
                        </p>
                        <p style={{ fontSize: 12, color: 'var(--text-600)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <LogOut size={12} />
                          Déconnexion automatique dans{' '}
                          <strong style={{ color: 'var(--primary)', fontSize: 13 }}>{logoutCountdown}s</strong>
                        </p>
                      </div>
                    </div>
                    {/* Barre de progression */}
                    <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${(logoutCountdown / 5) * 100}%`,
                        background: 'var(--success)',
                        borderRadius: 2,
                        transition: 'width 1s linear',
                      }} />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSaving || !currentPassword || !newPassword || newPassword !== confirmPassword}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', height: 46, fontSize: 14, fontWeight: 700 }}
                >
                  {isSaving ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
                  {isSaving ? 'Modification en cours...' : 'Changer le mot de passe'}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
      )}

      <style>{`
        .spin { animation: rotate 1s linear infinite; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .anim-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        /* Masquer l'icône œil native des navigateurs (Edge, Chrome, Safari) */
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none;
        }
        input[type="password"]::-webkit-credentials-auto-fill-button {
          visibility: hidden;
        }
      `}</style>
    </Layout>
  );
};

export default Settings;

