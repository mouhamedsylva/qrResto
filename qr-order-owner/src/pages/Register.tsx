import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, AlertCircle, Loader2, Check } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    restaurantName: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // 1. Register & Auto-login
      const response = await api.post('/auth/register', formData);
      
      const { access_token, user } = response.data;
      
      // 2. Show Success Modal
      setShowSuccess(true);
      
      // 3. Authenticate & Redirect after delay
      setTimeout(() => {
        login(access_token, user);
        navigate('/');
      }, 2000);
      
    } catch (err: any) {
      console.error('Registration error:', err);
      
      if (!err.response) {
        setError('Le serveur est inaccessible. Vérifiez votre connexion ou la configuration CORS du backend.');
      } else {
        const message = err.response?.data?.message;
        setError(Array.isArray(message) ? message[0] : message || 'Erreur lors de la création du compte.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page auth-page-login">
      <div className="auth-bg-blob blob-1" />
      <div className="auth-bg-blob blob-2" />

      <div className="login-layout">
        <div className="login-side">
          <div className="login-side-slider">
            <h1 className="login-side-title">Créez votre espace restaurant</h1>
            <p className="login-side-desc">
              Lancez votre environnement en quelques secondes et centralisez votre menu via qr-code, vos tables, vos équipes et vos commandes.
            </p>
          </div>
        </div>

        <div className="auth-card login-card" style={{ maxWidth: 460 }}>
          <div className="auth-header">
            <div className="auth-logo">
              <div className="brand-icon" style={{ width: 48, height: 48, borderRadius: 12 }}>
                <Zap size={28} color="#fff" fill="#fff" />
              </div>
            </div>
            <h2 className="auth-title">Créer un compte</h2>
            <p className="auth-subtitle">Devenez propriétaire et digitalisez votre carte</p>
          </div>

          {error && (
            <div className="auth-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
               <div className="form-group">
                  <label className="form-label" htmlFor="name">Nom complet</label>
                  <input
                    id="name"
                    type="text"
                    className="form-input"
                    placeholder="Jean Dupont"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="email">Email pro</label>
                  <input
                    id="email"
                    type="email"
                    className="form-input"
                    placeholder="jean@resto.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

            <div className="form-group">
              <label className="form-label" htmlFor="restaurantName">Nom du restaurant</label>
              <input
                id="restaurantName"
                type="text"
                className="form-input"
                placeholder="Le Gourmet Dakar"
                value={formData.restaurantName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Mot de passe</label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="Min. 6 caractères"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-auth" 
              disabled={isSubmitting}
              style={{ marginTop: 8 }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="anim-spin" style={{ marginRight: 8 }} />
                  Création en cours...
                </>
              ) : (
                'Créer mon établissement'
              )}
            </button>
          </form>

          <div className="auth-footer">
            Déjà un compte ?{' '}
            <Link to="/login" className="auth-link">Se connecter</Link>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="success-overlay">
          <div className="success-modal">
            <div className="success-icon-wrap">
              <Check size={32} />
            </div>
            <h3 className="success-title">Bienvenue !</h3>
            <p className="success-desc">
              Votre établissement <strong>{formData.restaurantName}</strong> a été créé avec succès. 
              Redirection vers votre dashboard...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
