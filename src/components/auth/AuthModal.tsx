import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, Eye, EyeOff, LogOut, CheckCircle, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
  mode?: 'modal' | 'page';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, message, mode }) => {
  const { user, isAuthenticated, loginWithEmail, registerWithEmail, loginWithGoogle, logout, authError, clearAuthError } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-800' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[a-z]/.test(pass) || /[A-Z]/.test(pass)) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/\d/.test(pass)) score += 1;
    if (/[^a-zA-Z0-9]/.test(pass)) score += 1;

    if (score < 3) return { score: 1, label: 'Weak', color: 'bg-red-500', textClass: 'text-red-500' };
    if (score < 5) return { score: 2, label: 'Medium', color: 'bg-yellow-500', textClass: 'text-yellow-500' };
    return { score: 3, label: 'Strong', color: 'bg-green-500', textClass: 'text-green-500' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');

    if (!email) return;

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    if (authMode === 'register') {
      if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/\d/.test(password) || !/[^a-zA-Z0-9]/.test(password)) {
        setPasswordError('Password must be at least 8 chars, include a letter, number, and special character.');
        return;
      }
    }

    setIsSubmitting(true);
    clearAuthError();
    try {
      localStorage.setItem('weatherguard_remember_me', String(rememberMe));
      if (authMode === 'register') {
        await registerWithEmail(email, name, password);
      } else {
        await loginWithEmail(email, password);
      }
      onClose();
    } catch (err) {
      // Error is handled in AuthContext and exposed via authError
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleSubmitting(true);
    try {
      localStorage.setItem('weatherguard_remember_me', String(rememberMe));
      await loginWithGoogle();
      onClose();
    } catch (err) {
      console.warn('Google sign-in modal error:', err);
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isAuthenticated
          ? 'Meteorological Profile'
          : authMode === 'login'
          ? 'WeatherGuard Sign In'
          : 'Create WeatherGuard Account'
      }
      subtitle={
        isAuthenticated
          ? 'Cloud-synced telemetry profile & alert endpoints'
          : authMode === 'login'
          ? 'Sign in to access your saved places, radar presets, and alerts'
          : 'Create an account to synchronize your custom stations and preferences'
      }
      maxWidth="md"
      mode={mode}
    >
      {isAuthenticated ? (
        <div className="space-y-5">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="p-3 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <User size={24} />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-100">{user.displayName}</h4>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="cyan" size="sm">
                  Role: {user.role.toUpperCase()}
                </Badge>
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                  <CheckCircle size={12} />
                  Cloud Synced
                </span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-400 space-y-1.5">
            <span className="font-semibold text-slate-300 block">Active Capabilities</span>
            <p>• Multi-station spatial telemetry bookmarks</p>
            <p>• Severe convective weather notifications</p>
            <p>• Solar ephemeris & stargazing seeing index cache</p>
          </div>

          <Button
            variant="danger"
            onClick={() => {
              logout();
              onClose();
            }}
            icon={<LogOut size={16} />}
            className="w-full"
          >
            Sign Out
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {authMode === 'register' && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. SumitKumar Padhy"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                  placeholder="name@example.com"
                  className={`w-full bg-slate-950 border ${emailError ? 'border-red-500' : 'border-slate-700/80'} rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors`}
                />
              </div>
              {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
                  placeholder={authMode === 'login' ? '••••••••' : 'Create a secure password'}
                  className={`w-full bg-slate-950 border ${passwordError ? 'border-red-500' : 'border-slate-700/80'} rounded-xl pl-9 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passwordError && <p className="text-xs text-red-500 mt-1">{passwordError}</p>}
              
              <div className="flex items-center mt-3 mb-1">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-cyan-500 bg-slate-900 border-slate-700/80 rounded focus:ring-cyan-500/30 focus:ring-2 cursor-pointer"
                />
                <label htmlFor="rememberMe" className="ml-2 text-xs font-medium text-slate-300 cursor-pointer">
                  Trust this device (Keep me signed in)
                </label>
              </div>

              {authMode === 'register' && password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1 h-1">
                    <div className={`flex-1 rounded-full ${strength.score >= 1 ? strength.color : 'bg-slate-800'}`}></div>
                    <div className={`flex-1 rounded-full ${strength.score >= 2 ? strength.color : 'bg-slate-800'}`}></div>
                    <div className={`flex-1 rounded-full ${strength.score >= 3 ? strength.color : 'bg-slate-800'}`}></div>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className={strength.textClass}>{strength.label} Password</span>
                    <span className="text-slate-500">Min 8 chars, 1 letter, 1 number, 1 special</span>
                  </div>
                </div>
              )}
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 font-medium">
                {authError}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              className="w-full mt-2 font-medium py-2.5"
            >
              {authMode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          {/* Switch between Sign In and Create Account */}
          <div className="text-center pt-1">
            {authMode === 'login' ? (
              <p className="text-xs text-slate-400">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); clearAuthError(); }}
                  className="text-cyan-400 font-semibold hover:text-cyan-300 hover:underline transition-colors"
                >
                  Create new account
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); clearAuthError(); }}
                  className="text-cyan-400 font-semibold hover:text-cyan-300 hover:underline transition-colors"
                >
                  Sign In
                </button>
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider absolute">
              or continue with
            </span>
          </div>

          {/* Sign In with Google */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleSubmitting}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 text-sm font-medium text-slate-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.1-2 .4-2.8L1.9 6.3C.7 8.7 0 10.8 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
              />
            </svg>
            <span>Sign in with Google</span>
          </button>
        </div>
      )}
    </Modal>
  );
};
