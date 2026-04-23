import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, AlertCircle, Loader2, Check } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface FieldErrors {
  email?: string;
  password?: string;
}

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>({
    email: false,
    password: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  const { login } = useAuth();
  const navigate = useNavigate();

  const textSlides = [
    {
      title: 'La meilleure offre pour votre business',
      description:
        'Pilotez vos commandes, vôtre équipe et votre plan de salle depuis un seul espace moderne. Tout est optimisé pour aller vite au quotidien.',
    },
    {
      title: 'Boostez votre performance chaque jour',
      description:
        'Suivez vos KPI en temps réel, visualisez les tendances et prenez de meilleures décisions en quelques secondes.',
    },
    {
      title: 'Une experience fluide pour votre équipe',
      description:
        'Invitez vôtre équipe, gérez les rôles et centralisez toutes les actions sans friction.',
    },
  ];

  useEffect(() => {
    const sliderTimer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % textSlides.length);
    }, 4200);
    return () => clearInterval(sliderTimer);
  }, [textSlides.length]);

  // --- Validation logic ---
  const validateField = (name: 'email' | 'password', value: string): string => {
    if (name === 'email') {
      if (!value.trim()) return 'L\'adresse email est requise.';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return 'Veuillez entrer une adresse email valide.';
    }
    if (name === 'password') {
      if (!value) return 'Le mot de passe est requis.';
      if (value.length < 6) return 'Le mot de passe doit contenir au moins 6 caractères.';
    }
    return '';
  };

  const validateAll = (): boolean => {
    const errors: FieldErrors = {
      email: validateField('email', email),
      password: validateField('password', password),
    };
    setFieldErrors(errors);
    setTouched({ email: true, password: true });
    return !errors.email && !errors.password;
  };

  // --- Handlers ---
  const handleBlur = (name: 'email' | 'password') => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    setFieldErrors((prev) => ({
      ...prev,
      [name]: validateField(name, name === 'email' ? email : password),
    }));
  };

  const handleChange = (name: 'email' | 'password', value: string) => {
    if (name === 'email') setEmail(value);
    else setPassword(value);

    // Clear the error live once the field becomes valid
    if (touched[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateAll()) return; // Stop if client-side validation fails

    setIsSubmitting(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user } = response.data;

      setShowSuccess(true);

      setTimeout(() => {
        login(access_token, user);
        let path = '/';
        if (user?.role === 'STAFF') path = '/orders';
        else if (user?.role === 'MANAGER') path = '/';
        navigate(path);
      }, 1500);
    } catch (err: any) {
      console.error('Login error:', err);
      if (!err.response) {
        setError('Le serveur est inaccessible. Vérifiez votre connexion ou la configuration CORS du backend.');
      } else {
        const message = err.response?.data?.message;
        setError(Array.isArray(message) ? message[0] : message || 'Identifiants invalides ou erreur serveur.');
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
          <div className="login-side-slider" key={slideIndex}>
            <h1 className="login-side-title">{textSlides[slideIndex].title}</h1>
            <p className="login-side-desc">{textSlides[slideIndex].description}</p>
          </div>
        </div>

        <div className="auth-card login-card">
          <div className="auth-header">
            <div className="auth-logo">
              <div className="brand-icon" style={{ width: 48, height: 48, borderRadius: 12 }}>
                <Zap size={28} color="#fff" fill="#fff" />
              </div>
            </div>
            <h2 className="auth-title">Bon retour !</h2>
            <p className="auth-subtitle">Connectez-vous pour gérer votre établissement</p>
          </div>

          {error && (
            <div className="auth-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Adresse Email</label>
              <input
                id="email"
                type="email"
                className={`form-input ${touched.email && fieldErrors.email ? 'form-input--error' : ''}`}
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                required
              />
              {touched.email && fieldErrors.email && (
                <p className="form-field-error">{fieldErrors.email}</p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Mot de passe</label>
              <input
                id="password"
                type="password"
                className={`form-input ${touched.password && fieldErrors.password ? 'form-input--error' : ''}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                required
              />
              {touched.password && fieldErrors.password && (
                <p className="form-field-error">{fieldErrors.password}</p>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-auth"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="anim-spin" style={{ marginRight: 8 }} />
                  Connexion en cours...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          <div className="auth-footer">
            Pas encore de compte ?{' '}
            <Link to="/register" className="auth-link">Créer un compte</Link>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="success-overlay">
          <div className="success-modal">
            <div className="success-icon-wrap">
              <Check size={32} />
            </div>
            <h3 className="success-title">Connexion réussie !</h3>
            <p className="success-desc">
              Heureux de vous revoir. Préparation de votre dashboard...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;