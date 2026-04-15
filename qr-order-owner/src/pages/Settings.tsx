import React, { useState } from 'react';
import {
  User,
  Shield,
  Clock,
  Palette,
  CreditCard,
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
} from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'general' | 'team' | 'service' | 'design' | 'payments'>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // --- Mock States ---
  // General
  const [restaurantName, setRestaurantName] = useState(user?.restaurant?.name || 'Mon Restaurant');
  const [restaurantDesc, setRestaurantDesc] = useState('Le meilleur restaurant de la ville avec des produits frais.');
  const [address, setAddress] = useState('123 Rue de la Gastronomie, Paris');
  const [phone, setPhone] = useState('01 23 45 67 89');
  const [email, setEmail] = useState('contact@monrestaurant.fr');

  // Team Permissions
  const [permissions, setPermissions] = useState({
    managerCanSeeStats: true,
    managerCanEditMenu: true,
    managerCanManageOrders: true,
    managerCanManageStaff: false,
    staffCanEditMenu: false,
    staffCanManageOrders: true,
  });

  // Service
  const [isOpen, setIsOpen] = useState(true);
  const [prepTime, setPrepTime] = useState(20);
  const [language, setLanguage] = useState('fr');

  // Design
  const [primaryColor, setPrimaryColor] = useState('#D94A6A');
  const [secondaryColor, setSecondaryColor] = useState('#FFFFFF');
  const [buttonStyle, setButtonStyle] = useState<'rounded' | 'square' | 'pill'>('rounded');

  // Payments
  const [taxRate, setTaxRate] = useState(10);
  const [paymentMethods, setPaymentMethods] = useState({
    cash: true,
    card: true,
    online: false,
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const togglePermission = (key: keyof typeof permissions) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const togglePaymentMethod = (key: keyof typeof paymentMethods) => {
    setPaymentMethods((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Helper Components
  const TabButton: React.FC<{ id: typeof activeTab; icon: React.ReactNode; label: string }> = ({
    id,
    icon,
    label,
  }) => (
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

  return (
    <Layout title="Paramètres" subtitle="Gérez votre restaurant, votre équipe et votre image de marque.">
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
          <TabButton id="general" icon={<Store size={18} />} label="Général" />
          <TabButton id="team" icon={<Shield size={18} />} label="Permissions" />
          <TabButton id="service" icon={<Clock size={18} />} label="Service" />
          <TabButton id="design" icon={<Palette size={18} />} label="Design" />
          <TabButton id="payments" icon={<CreditCard size={18} />} label="Paiements" />

          <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', height: 44 }}
            >
              {isSaving ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
              {isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            {showSuccess && (
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
                <Check size={14} /> Changements enregistrés !
              </div>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="card" style={{ padding: 32, minHeight: 500 }}>
          {activeTab === 'general' && (
            <div className="anim-in">
              <SectionTitle
                title="Profil du Restaurant"
                subtitle="Ces informations seront visibles par vos clients sur le menu digital."
              />
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
                    placeholder="01 02 03 04 05"
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
                <div
                  style={{
                    height: 120,
                    border: '2px dashed var(--border)',
                    borderRadius: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    background: 'var(--surface-1)',
                    cursor: 'pointer',
                  }}
                >
                  <Upload size={24} className="text-muted" />
                  <span className="text-sm text-muted">Cliquez pour remplacer le logo</span>
                </div>
              </div>
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

          {activeTab === 'service' && (
            <div className="anim-in">
              <SectionTitle
                title="Configuration du Service"
                subtitle="Gérez l'état opérationnel de votre établissement."
              />
              <div style={{ marginBottom: 32 }}>
                <Switch
                  label="Restaurant ouvert aux commandes"
                  description="Si désactivé, les clients ne pourront plus passer commande via QR Code."
                  checked={isOpen}
                  onChange={() => setIsOpen(!isOpen)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <FormGroup label="Temps de préparation moyen (min)" icon={<Clock size={14} />}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <input
                      type="range"
                      min="5"
                      max="60"
                      step="5"
                      value={prepTime}
                      onChange={(e) => setPrepTime(Number(e.target.value))}
                      style={{ flex: 1, accentColor: 'var(--primary)' }}
                    />
                    <span style={{ fontWeight: 700, fontSize: 16, minWidth: 60 }}>{prepTime} min</span>
                  </div>
                </FormGroup>

                <FormGroup label="Langue par défaut" icon={<Globe size={14} />}>
                  <select
                    className="form-input"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    style={{ background: 'var(--surface-1)' }}
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                  </select>
                </FormGroup>
              </div>

              <div style={{ marginTop: 24 }}>
                <span className="form-label" style={{ marginBottom: 12 }}>Horaires d'ouverture par défaut</span>
                <div style={{ background: 'var(--surface-1)', borderRadius: 16, padding: '16px 20px' }}>
                  {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map((day) => (
                    <div
                      key={day}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 0',
                        borderBottom: day === 'Dimanche' ? 'none' : '1px solid var(--border)',
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{day}</span>
                      <div className="text-sm text-muted">09:00 - 22:00</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'design' && (
            <div className="anim-in">
              <SectionTitle
                title="Personnalisation Client"
                subtitle="Adaptez l'interface de commande à l'identité visuelle de votre restaurant."
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                <FormGroup label="Couleur principale">
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      style={{ width: 44, height: 44, padding: 0, border: 'none', background: 'transparent' }}
                    />
                    <input
                      className="form-input"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                    />
                  </div>
                </FormGroup>
                <FormGroup label="Couleur de fond">
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      style={{ width: 44, height: 44, padding: 0, border: 'none', background: 'transparent' }}
                    />
                    <input
                      className="form-input"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                    />
                  </div>
                </FormGroup>
              </div>

              <FormGroup label="Style des boutons">
                <div style={{ display: 'flex', gap: 12 }}>
                  {(['rounded', 'square', 'pill'] as const).map((style) => (
                    <button
                      key={style}
                      onClick={() => setButtonStyle(style)}
                      className={`btn ${buttonStyle === style ? 'btn-primary' : 'btn-ghost'}`}
                      style={{
                        flex: 1,
                        textTransform: 'capitalize',
                        borderRadius: style === 'rounded' ? 8 : style === 'pill' ? 99 : 0,
                      }}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </FormGroup>

              <div style={{ marginTop: 32 }}>
                <SectionTitle title="Aperçu du bouton client" />
                <div
                  style={{
                    padding: 40,
                    background: secondaryColor,
                    border: '1px solid var(--border)',
                    borderRadius: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <button
                    style={{
                      background: primaryColor,
                      color: '#fff',
                      padding: '14px 28px',
                      fontSize: 16,
                      fontWeight: 700,
                      border: 'none',
                      borderRadius: buttonStyle === 'rounded' ? 8 : buttonStyle === 'pill' ? 99 : 0,
                      boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                      cursor: 'default',
                    }}
                  >
                    Voir le Menu
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="anim-in">
              <SectionTitle
                title="Paiements & Taxes"
                subtitle="Configurez les conditions financières de votre établissement."
              />
              <FormGroup label="Taux de TVA par défaut (%)" icon={<CreditCard size={14} />}>
                <input
                  type="number"
                  className="form-input"
                  style={{ maxWidth: 200 }}
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                />
              </FormGroup>

              <div style={{ marginTop: 24 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--text-900)' }}>
                  Modes de paiement acceptés
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                  <Switch
                    label="Paiement en espèces"
                    description="Le client paie directement au comptoir ou au serveur."
                    checked={paymentMethods.cash}
                    onChange={() => togglePaymentMethod('cash')}
                  />
                  <Switch
                    label="Paiement par Carte Bleue"
                    description="Utilisation d'un terminal de paiement physique."
                    checked={paymentMethods.card}
                    onChange={() => togglePaymentMethod('card')}
                  />
                  <Switch
                    label="Paiement en ligne (Stripe)"
                    description="Le client paie directement via son smartphone lors de la commande."
                    checked={paymentMethods.online}
                    onChange={() => togglePaymentMethod('online')}
                  />
                </div>
              </div>

              <div
                style={{
                  marginTop: 32,
                  padding: 20,
                  background: 'rgba(99, 102, 241, 0.05)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  borderRadius: 16,
                  color: 'var(--info)',
                  display: 'flex',
                  gap: 12,
                }}
              >
                <Shield size={20} style={{ flexShrink: 0 }} />
                <div className="text-sm">
                  <strong>Note sur Stripe :</strong> Pour activer le paiement en ligne, vous devez d'abord connecter votre compte Stripe Connect dans l'onglet "Intégrations" (bientôt disponible).
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .spin { animation: rotate 1s linear infinite; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .anim-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </Layout>
  );
};

export default Settings;

