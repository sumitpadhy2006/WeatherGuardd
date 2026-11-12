import React, { useState } from 'react';
import {
  Sparkles,
  Bell,
  Sliders,
  Tractor,
  GraduationCap,
  Plane,
  Camera,
  Telescope,
  ShieldCheck,
  Zap,
  Lock,
  User,
  CheckCircle,
} from 'lucide-react';
import { usePersonalization } from '../../context/PersonalizationContext';
import { useAuth } from '../../context/AuthContext';
import { RoleSelector } from './RoleSelector';
import { FarmerDashboard } from './FarmerDashboard';
import { StudentDashboard } from './StudentDashboard';
import { TravelerDashboard } from './TravelerDashboard';
import { PhotographerDashboard } from './PhotographerDashboard';
import { AstronomyDashboard } from './AstronomyDashboard';
import { SmartAlertsConfig } from './SmartAlertsConfig';
import { NotificationCenterModal } from './NotificationCenterModal';
import { AuthModal } from '../auth/AuthModal';
import { Button } from '../common/Button';

interface PersonalizationPageProps {
  onNavigateTab?: (tab: string) => void;
}

export const PersonalizationPage: React.FC<PersonalizationPageProps> = ({ onNavigateTab }) => {
  const { isAuthenticated } = useAuth();
  const { role, unreadAlertsCount } = usePersonalization();
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'alerts_config'>('dashboard');
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mx-auto shadow-xl">
          <Lock size={28} />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Personalization & Smart Alerts
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Sign in to unlock personalized telemetry profiles, custom profession dashboards (Farmer, Student, Traveler, Photographer, Astronomer), and cloud-synchronized hazard alert triggers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-lg mx-auto p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <CheckCircle size={15} className="text-cyan-400 shrink-0" />
            <span>Multi-channel FCM push alerts</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle size={15} className="text-cyan-400 shrink-0" />
            <span>Saved places & coordinate tags</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle size={15} className="text-cyan-400 shrink-0" />
            <span>Custom convective & seismic thresholds</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle size={15} className="text-cyan-400 shrink-0" />
            <span>Dark-sky & optics forecasting</span>
          </div>
        </div>

        <div className="pt-2">
          <Button
            variant="primary"
            size="lg"
            onClick={() => setIsAuthModalOpen(true)}
            icon={<User size={18} />}
          >
            Sign In / Create Account
          </Button>
        </div>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-12">
      {/* Top Banner & Sub-tab navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Smart Alerts & Persona Intelligence
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Tailored environmental telemetry & real-time hazard notification engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sub-tab switcher */}
          <div className="p-1 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-1 text-xs font-mono">
            <button
              onClick={() => setActiveSubTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeSubTab === 'dashboard'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Role Dashboard
            </button>
            <button
              onClick={() => setActiveSubTab('alerts_config')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeSubTab === 'alerts_config'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Alert Engine Rules
            </button>
          </div>

          {/* Quick Notification Bell button */}
          <button
            onClick={() => setIsNotificationModalOpen(true)}
            className="relative p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer border border-slate-700"
            title="Open Notification Center"
          >
            <Bell size={18} />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-bold font-mono flex items-center justify-center animate-bounce">
                {unreadAlertsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Role Picker (Always Visible for logged in users) */}
      <RoleSelector />

      {/* Main Content Area based on sub-tab */}
      {activeSubTab === 'dashboard' ? (
        <div className="space-y-4">
          {role === 'farmer' && <FarmerDashboard />}
          {role === 'student' && <StudentDashboard />}
          {role === 'traveler' && <TravelerDashboard />}
          {role === 'photographer' && <PhotographerDashboard />}
          {role === 'astronomy' && <AstronomyDashboard />}
          {role === 'general' && <FarmerDashboard />}
        </div>
      ) : (
        <SmartAlertsConfig />
      )}

      {/* Notification Center Modal */}
      <NotificationCenterModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        onNavigateTab={onNavigateTab}
      />
    </div>
  );
};
