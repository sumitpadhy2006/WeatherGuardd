import React, { useState, useRef, useMemo } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Country, State, City } from 'country-state-city';
import { COUNTRY_CODES } from '../../utils/countryCodes';
import { getInitials } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../context/PreferencesContext';
import { useLocation } from '../../context/LocationContext';
import { usePersonalization } from '../../context/PersonalizationContext';
import {
  PrimaryUserType,
  UserInterest,
  SavedPlaceLabel,
  UserRole,
} from '../../types/personalization';
import {
  User,
  Camera,
  Trash2,
  CheckCircle,
  Briefcase,
  Heart,
  MapPin,
  Sliders,
  Bell,
  Sparkles,
  Shield,
  Eye,
  LogOut,
  Clock,
  Calendar,
  Phone,
  Mail,
  AlertTriangle,
  Compass,
  Check,
  Plus,
  Send,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Flame,
  Zap,
  Menu,
} from 'lucide-react';
import { ImageCropper } from './ImageCropper';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'modal' | 'page';
}

type ProfileTab =
  | 'identity'
  | 'profession'
  | 'interests'
  | 'locations'
  | 'weather_pref'
  | 'alerts'
  | 'notifications'
  | 'accessibility';

const ALL_USER_TYPES: { id: PrimaryUserType; label: string; roleMapping: UserRole; group: string }[] = [
  { id: 'General User', label: 'General / Citizen', roleMapping: 'general', group: 'General' },
  { id: 'Weather Enthusiast', label: 'Weather Enthusiast', roleMapping: 'general', group: 'General' },
  { id: 'Student', label: 'Student', roleMapping: 'student', group: 'Academic' },
  { id: 'Teacher / Professor', label: 'Teacher / Professor', roleMapping: 'student', group: 'Academic' },
  { id: 'Researcher', label: 'Researcher / Scientist', roleMapping: 'general', group: 'Academic' },
  { id: 'Farmer', label: 'Farmer / Grower', roleMapping: 'farmer', group: 'Agriculture' },
  { id: 'Agriculture Worker', label: 'Agriculture Worker', roleMapping: 'farmer', group: 'Agriculture' },
  { id: 'Photographer', label: 'Photographer', roleMapping: 'photographer', group: 'Creative' },
  { id: 'Videographer', label: 'Videographer', roleMapping: 'photographer', group: 'Creative' },
  { id: 'Astronomy Enthusiast', label: 'Astronomy Enthusiast', roleMapping: 'astronomy', group: 'Science' },
  { id: 'Traveler', label: 'Traveler / Globetrotter', roleMapping: 'traveler', group: 'Outdoor' },
  { id: 'Tourist Guide', label: 'Tourist Guide', roleMapping: 'traveler', group: 'Outdoor' },
  { id: 'Hiker / Trekker', label: 'Hiker / Mountaineer', roleMapping: 'traveler', group: 'Outdoor' },
  { id: 'Runner', label: 'Runner', roleMapping: 'general', group: 'Sports' },
  { id: 'Cyclist', label: 'Cyclist', roleMapping: 'general', group: 'Sports' },
  { id: 'Outdoor Sports', label: 'Outdoor Sports Athlete', roleMapping: 'general', group: 'Sports' },
  { id: 'Driver', label: 'Driver / Transporter', roleMapping: 'general', group: 'Logistics' },
  { id: 'Delivery Partner', label: 'Delivery Partner', roleMapping: 'general', group: 'Logistics' },
  { id: 'Pilot / Aviation Professional', label: 'Pilot / Aviation', roleMapping: 'photographer', group: 'Aviation' },
  { id: 'Drone Operator', label: 'Drone Operator', roleMapping: 'photographer', group: 'Aviation' },
  { id: 'Fisherman', label: 'Fisherman', roleMapping: 'farmer', group: 'Marine' },
  { id: 'Marine Worker', label: 'Marine / Sailor', roleMapping: 'farmer', group: 'Marine' },
  { id: 'Construction Worker', label: 'Construction Worker', roleMapping: 'farmer', group: 'Field' },
  { id: 'Emergency / Disaster Response', label: 'Emergency / First Responder', roleMapping: 'general', group: 'Safety' },
  { id: 'Other', label: 'Other Profession', roleMapping: 'general', group: 'Other' },
];

const ALL_INTERESTS: UserInterest[] = [
  'Travel',
  'Photography',
  'Stargazing',
  'Astronomy',
  'Running',
  'Cycling',
  'Hiking',
  'Outdoor Activities',
  'Farming',
  'Gardening',
  'Marine',
  'Aviation',
  'Drones',
  'Weather Monitoring',
  'Disaster Awareness',
  'Solar Energy',
  'Environmental Monitoring',
  'Space Science',
];

const PLACE_LABELS: SavedPlaceLabel[] = [
  'Home',
  'College',
  'School',
  'Office',
  'Farm',
  'Village',
  'Family',
  'Travel',
  'Custom',
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, mode }) => {
  const {
    user,
    isAuthenticated,
    logout,
    updateProfileData,
    uploadPhoto,
    removePhoto,
    sendPasswordReset,
  } = useAuth();

  const { preferences, updatePreferences, setTheme, setUnits } = usePreferences();
  const {
    savedLocations,
    removeSavedLocation,
    updateLocationNickname,
    toggleLocationAlert,
    setDefaultLocation,
    detectCurrentGPS,
    isLocating,
  } = useLocation();
  const { settings, updateSettings, requestPushPermission, isSyncingFirestore } = usePersonalization();

  const [activeTab, setActiveTab] = useState<ProfileTab>('identity');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleTabChange = (tab: ProfileTab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const [displayName, setDisplayName] = useState(user.displayName || '');
  const initialPhoneStr = user.phoneNumber || '';
  let initialCountryCode = '+1';
  let initialPhoneNum = initialPhoneStr;
  if (initialPhoneStr.match(/^(\+\d+)\s(.*)$/)) {
    const match = initialPhoneStr.match(/^(\+\d+)\s(.*)$/);
    if (match) {
      initialCountryCode = match[1];
      initialPhoneNum = match[2];
    }
  }
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNum);
  const [phoneCountryCode, setPhoneCountryCode] = useState(initialCountryCode);
  const [gender, setGender] = useState(user.gender || 'prefer_not_to_say');
  const [address, setAddress] = useState(user.address || {
    line1: '',
    line2: '',
    country: '',
    state: '',
    district: '',
    city: '',
    pincode: ''
  });
  const [dateOfBirth, setDateOfBirth] = useState(user.dateOfBirth || '');
  const [primaryUserType, setPrimaryUserType] = useState<PrimaryUserType>(
    (user.primaryUserType as PrimaryUserType) || 'General User'
  );
  const [specificProfession, setSpecificProfession] = useState(user.specificProfession || '');
  const [selectedInterests, setSelectedInterests] = useState<UserInterest[]>(
    (user.interests as UserInterest[]) || ['Weather Monitoring', 'Disaster Awareness']
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pinTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoized country-state-city data
  const countries = useMemo(() => Country.getAllCountries(), []);
  const states = useMemo(() => {
    return address.country ? State.getStatesOfCountry(address.country) : [];
  }, [address.country]);

  const cities = useMemo(() => {
    return address.country && address.state ? City.getCitiesOfState(address.country, address.state) : [];
  }, [address.country, address.state]);

  // Dynamically calculate age from dateOfBirth without storing permanent age field
  const calculatedAge = useMemo(() => {
    if (!dateOfBirth) return null;
    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime())) return null;
    const diffMs = Date.now() - dob.getTime();
    const ageDate = new Date(diffMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    return age >= 0 && age < 130 ? age : null;
  }, [dateOfBirth]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const roleMatch = ALL_USER_TYPES.find((t) => t.id === primaryUserType);
      await updateProfileData({
        displayName: displayName.trim() || user.displayName,
        phoneNumber: phoneNumber.trim() ? `${phoneCountryCode} ${phoneNumber.trim()}` : '',
        dateOfBirth: dateOfBirth.trim(),
        gender,
        primaryUserType,
        specificProfession: specificProfession.trim(),
        interests: selectedInterests,
        address,
        role: roleMatch ? roleMatch.roleMapping : 'general',
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.warn('Error saving profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError(null);
    
    const reader = new FileReader();
    reader.onload = () => {
      setCropImageSrc(reader.result as string);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setCropImageSrc(null);
    setUploadingPhoto(true);
    try {
      const file = new File([croppedBlob], 'profile.jpg', { type: 'image/jpeg' });
      await uploadPhoto(file);
    } catch (err: any) {
      setPhotoError(err?.message || 'Failed to upload cropped photo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePhotoRemove = async () => {
    setPhotoError(null);
    setUploadingPhoto(true);
    try {
      await removePhoto();
    } catch (err: any) {
      setPhotoError(err?.message || 'Failed to remove photo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleToggleInterest = (interest: UserInterest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handlePasswordResetRequest = async () => {
    if (!user.email) return;
    try {
      await sendPasswordReset(user.email);
      setResetSent(true);
      setTimeout(() => setResetSent(false), 5000);
    } catch (err) {
      console.warn('Password reset error:', err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="User Profile & Personalization Hub"
      subtitle="Manage your identity, profession, saved places, and multi-domain alert thresholds"
      maxWidth="full"
      mode={mode}
    >
      <div className="flex flex-row gap-6 h-full relative">
        {/* Mobile Menu Backdrop */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Navigation Sidebar */}
        <div 
          className={`
            fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-slate-900 lg:bg-transparent border-r border-slate-800 p-5 lg:p-0 flex flex-col h-full overflow-y-auto transition-transform duration-300 ease-in-out
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:relative lg:translate-x-0 lg:z-0 lg:w-60 lg:pr-4 lg:shrink-0
          `}
        >
          <div className="flex items-center gap-3 p-2 mb-3 rounded-xl bg-slate-950/80 border border-slate-800">
            {user.profilePhotoUrl ? (
              <img
                src={user.profilePhotoUrl}
                alt={user.displayName}
                className="w-10 h-10 rounded-full object-cover border border-cyan-500/40"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-bold text-sm">
                {getInitials(user.displayName)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-white block truncate">{user.displayName}</span>
              <span className="text-[10px] text-cyan-400 font-mono block truncate uppercase">
                {primaryUserType}
              </span>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => handleTabChange('identity')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                activeTab === 'identity'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <User size={15} />
              <span>Identity & Account</span>
            </button>

            <button
              onClick={() => handleTabChange('profession')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                activeTab === 'profession'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Briefcase size={15} />
              <span>Profession & Type</span>
            </button>

            <button
              onClick={() => handleTabChange('interests')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                activeTab === 'interests'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Heart size={15} />
              <span>Interests & Focus</span>
            </button>

            <button
              onClick={() => handleTabChange('locations')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                activeTab === 'locations'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MapPin size={15} />
                <span>Saved Places</span>
              </div>
              <span className="text-[10px] opacity-80 font-mono">({savedLocations.length})</span>
            </button>

            <button
              onClick={() => handleTabChange('weather_pref')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                activeTab === 'weather_pref'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Sliders size={15} />
              <span>Units & Weather</span>
            </button>

            <button
              onClick={() => handleTabChange('alerts')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                activeTab === 'alerts'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <AlertTriangle size={15} />
              <span>Alert Rules & Radius</span>
            </button>

            <button
              onClick={() => handleTabChange('notifications')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                activeTab === 'notifications'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Bell size={15} />
              <span>FCM & Push Channels</span>
            </button>

            <button
              onClick={() => handleTabChange('accessibility')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                activeTab === 'accessibility'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Eye size={15} />
              <span>Accessibility & Motion</span>
            </button>
          </nav>

          <div className="pt-4 border-t border-slate-800/80 mt-4">
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/30 transition-colors"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Content Panels */}
        <div className="flex-1 space-y-5 min-w-0 h-full overflow-y-auto pr-1">
          {/* Mobile Header to open menu */}
          <div className="lg:hidden flex items-center gap-3 pb-3 mb-2 border-b border-slate-800 sticky top-0 bg-slate-900 z-10 pt-2">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              <Menu size={20} />
            </button>
            <span className="text-sm font-bold text-white capitalize">
              {activeTab.replace('_', ' ')}
            </span>
          </div>

          {/* TAB 1: IDENTITY & ACCOUNT */}
          {activeTab === 'identity' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <User size={16} className="text-cyan-400" />
                  <span>Personal Identity & Authentication</span>
                </h3>
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                  <CheckCircle size={12} />
                  Firestore Synced
                </span>
              </div>

              {/* Profile Photo Management */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="relative group">
                  {user.profilePhotoUrl ? (
                    <img
                      src={user.profilePhotoUrl}
                      alt={user.displayName}
                      className="w-16 h-16 rounded-full object-cover border-2 border-cyan-500/60 shadow-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-bold text-xl">
                      {getInitials(user.displayName)}
                    </div>
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <span className="text-xs font-semibold text-slate-200 block">Avatar / Profile Picture</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="hidden"
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => fileInputRef.current?.click()}
                      isLoading={uploadingPhoto}
                      icon={<Camera size={14} />}
                    >
                      Upload Photo
                    </Button>
                    {user.profilePhotoUrl && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handlePhotoRemove}
                        isLoading={uploadingPhoto}
                        icon={<Trash2 size={14} className="text-red-400" />}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  {photoError && <p className="text-xs text-red-400">{photoError}</p>}
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Full Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Email Address (Read Only)</label>
                  <div className="relative">
                    <input
                      type="email"
                      disabled
                      value={user.email || 'guest@weatherguard.internal'}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-400 cursor-not-allowed"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-emerald-400 font-mono">
                      Verified
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                    <Phone size={12} className="text-cyan-400" />
                    <span>Phone Number (Optional)</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={phoneCountryCode}
                      onChange={(e) => setPhoneCountryCode(e.target.value)}
                      className="w-1/3 bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.dial_code}>
                          {c.code} {c.dial_code}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      maxLength={15}
                      value={phoneNumber.replace(/^\+\d+\s/, '')}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, ''); // only allow digits
                        setPhoneNumber(val);
                      }}
                      placeholder="e.g. 1234567890"
                      className="w-2/3 bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} className="text-cyan-400" />
                        <span>Date of Birth</span>
                      </span>
                      {calculatedAge !== null && (
                        <span className="text-[10px] text-cyan-400 font-mono">
                          Age: {calculatedAge} yrs
                        </span>
                      )}
                    </label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                      <User size={12} className="text-cyan-400" />
                      <span>Gender</span>
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="prefer_not_to_say">Prefer not to say</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-3 mt-4">
                <h4 className="text-xs font-bold text-slate-200 border-b border-slate-800 pb-2">Postal Address</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[11px] font-medium text-slate-400">Flat / Room / Plot No.</label>
                    <input
                      type="text"
                      value={address.line1}
                      onChange={(e) => setAddress({...address, line1: e.target.value})}
                      placeholder="e.g. 101, Blue Skies Apt"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[11px] font-medium text-slate-400">Landmark / Nearby</label>
                    <input
                      type="text"
                      value={address.line2}
                      onChange={(e) => setAddress({...address, line2: e.target.value})}
                      placeholder="e.g. Near City Station"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-400">Country</label>
                    <input
                      list="country-list"
                      placeholder="Select or type Country..."
                      value={address.country}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAddress({...address, country: val, state: '', district: '', city: ''});
                        const codeMatch = COUNTRY_CODES.find(c => c.name.toLowerCase() === val.toLowerCase() || c.code.toLowerCase() === val.toLowerCase());
                        if (codeMatch) setPhoneCountryCode(codeMatch.dial_code);
                      }}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                    <datalist id="country-list">
                      {Country.getAllCountries().map(c => (
                        <option key={c.isoCode} value={c.name} />
                      ))}
                    </datalist>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-400">State / Province</label>
                    <input
                      list="state-list"
                      placeholder="Select or type State..."
                      value={address.state}
                      disabled={!address.country}
                      onChange={(e) => setAddress({...address, state: e.target.value, district: '', city: ''})}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                    />
                    <datalist id="state-list">
                      {(() => {
                        const cCode = Country.getAllCountries().find(c => c.name.toLowerCase() === address.country.toLowerCase() || c.isoCode.toLowerCase() === address.country.toLowerCase())?.isoCode || address.country;
                        return State.getStatesOfCountry(cCode).map(s => (
                          <option key={s.isoCode} value={s.name} />
                        ));
                      })()}
                    </datalist>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-400">District / Region</label>
                    <input
                      list="district-list"
                      placeholder="Select or type District..."
                      value={address.district}
                      disabled={!address.state}
                      onChange={(e) => setAddress({...address, district: e.target.value, city: ''})}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                    />
                    <datalist id="district-list">
                      {(() => {
                        const cCode = Country.getAllCountries().find(c => c.name.toLowerCase() === address.country.toLowerCase() || c.isoCode.toLowerCase() === address.country.toLowerCase())?.isoCode || address.country;
                        const sCode = State.getStatesOfCountry(cCode).find(s => s.name.toLowerCase() === address.state.toLowerCase() || s.isoCode.toLowerCase() === address.state.toLowerCase())?.isoCode || address.state;
                        return City.getCitiesOfState(cCode, sCode).map(c => (
                          <option key={`dist-${c.name}`} value={c.name} />
                        ));
                      })()}
                    </datalist>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-400">City / Town</label>
                    <input
                      list="city-list"
                      placeholder="Select or type City..."
                      value={address.city}
                      disabled={!address.district}
                      onChange={(e) => setAddress({...address, city: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                    />
                    <datalist id="city-list">
                      {(() => {
                        const cCode = Country.getAllCountries().find(c => c.name.toLowerCase() === address.country.toLowerCase() || c.isoCode.toLowerCase() === address.country.toLowerCase())?.isoCode || address.country;
                        const sCode = State.getStatesOfCountry(cCode).find(s => s.name.toLowerCase() === address.state.toLowerCase() || s.isoCode.toLowerCase() === address.state.toLowerCase())?.isoCode || address.state;
                        return City.getCitiesOfState(cCode, sCode).map(c => (
                          <option key={`city-${c.name}`} value={c.name} />
                        ));
                      })()}
                    </datalist>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[11px] font-medium text-slate-400">PIN / ZIP Code</label>
                    <input
                      type="text"
                      value={address.pincode}
                      onChange={(e) => {
                        const pin = e.target.value;
                        setAddress({...address, pincode: pin});
                        
                        if (pinTimeoutRef.current) clearTimeout(pinTimeoutRef.current);
                        
                        pinTimeoutRef.current = setTimeout(async () => {
                          if (pin.length < 4) return;
                          
                          // India specific (fast, district-accurate)
                          if (pin.length === 6 && (!address.country || address.country === 'IN' || address.country.toLowerCase() === 'india')) {
                            try {
                              const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
                              const data = await res.json();
                              if (data[0].Status === 'Success') {
                                const p = data[0].PostOffice[0];
                                const stateObj = State.getStatesOfCountry('IN').find(s => s.name.includes(p.State) || p.State.includes(s.name));
                                setAddress(prev => ({
                                  ...prev,
                                  country: 'India',
                                  state: stateObj ? stateObj.name : p.State,
                                  district: p.District,
                                  city: p.Block !== 'NA' ? p.Block : p.District,
                                  pincode: pin
                                }));
                                setPhoneCountryCode('+91');
                                return;
                              }
                            } catch {}
                          }

                          // Global fallback using Nominatim
                          try {
                            const cCodeFallback = Country.getAllCountries().find(c => c.name.toLowerCase() === address.country.toLowerCase() || c.isoCode.toLowerCase() === address.country.toLowerCase())?.isoCode;
                            const countryParam = cCodeFallback ? `&countrycodes=${cCodeFallback}` : '';
                            const res = await fetch(`https://nominatim.openstreetmap.org/search?postalcode=${pin}${countryParam}&format=json&addressdetails=1`);
                            const data = await res.json();
                            if (data && data.length > 0) {
                              const result = data[0].address;
                              const cCode = result.country_code?.toUpperCase() || '';
                              const cName = result.country || '';
                              const sName = result.state || result.province || '';
                              const dName = result.county || result.district || result.region || '';
                              const city = result.city || result.town || result.village || result.municipality || '';
                              
                              setAddress(prev => ({
                                ...prev,
                                country: cName || prev.country,
                                state: sName || prev.state,
                                district: dName || prev.district,
                                city: city || prev.city,
                                pincode: pin
                              }));

                              const codeMatch = COUNTRY_CODES.find(c => c.code === cCode || c.name.toLowerCase() === cName.toLowerCase());
                              if (codeMatch) setPhoneCountryCode(codeMatch.dial_code);
                            }
                          } catch {}
                        }, 800);
                      }}
                      placeholder="e.g. 400001 or 10036"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* Account Meta & Security */}
              <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-400 space-y-2">
                <div className="flex items-center justify-between">
                  <span>Account Created:</span>
                  <span className="font-mono text-slate-200">
                    {new Date(user.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                {user.email && (
                  <div className="pt-2 border-slate-800 flex items-center justify-between">
                    <span className="text-[11px]">Forgot password or need to reset?</span>
                    <button
                      onClick={handlePasswordResetRequest}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-medium underline"
                    >
                      {resetSent ? `Reset Email Sent to ${user.email}!` : `Send Password Reset to ${user.email}`}
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  variant="primary"
                  onClick={handleSaveProfile}
                  isLoading={isSaving}
                  icon={saveSuccess ? <Check size={16} /> : undefined}
                >
                  {saveSuccess ? 'Profile Saved!' : 'Save Identity Changes'}
                </Button>
              </div>
            </div>
          )}

          {/* TAB 2: PROFESSION & USER TYPE */}
          {activeTab === 'profession' && (
            <div className="space-y-4">
              <div className="pb-2 border-b border-slate-800">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Briefcase size={16} className="text-cyan-400" />
                  <span>Primary User Archetype & Profession</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select your primary focus to calibrate tailored telemetry widgets and hazard triggers
                </p>
              </div>

              {/* Profession Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[360px] overflow-y-auto p-1">
                {ALL_USER_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setPrimaryUserType(type.id)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      primaryUserType === type.id
                        ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200'
                        : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold block">{type.label}</span>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                        Category: {type.group}
                      </span>
                    </div>
                    {primaryUserType === type.id && (
                      <Check size={16} className="text-cyan-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              {/* Free Text Specific Profession */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-medium text-slate-300">
                  Specific Profession / Role Title (Optional)
                </label>
                <input
                  type="text"
                  value={specificProfession}
                  onChange={(e) => setSpecificProfession(e.target.value)}
                  placeholder="e.g. Commercial Drone Pilot, Vineyard Manager, Field Biologist..."
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  variant="primary"
                  onClick={handleSaveProfile}
                  isLoading={isSaving}
                  icon={saveSuccess ? <Check size={16} /> : undefined}
                >
                  {saveSuccess ? 'Saved!' : 'Update Profession'}
                </Button>
              </div>
            </div>
          )}

          {/* TAB 3: INTERESTS & FOCUS */}
          {activeTab === 'interests' && (
            <div className="space-y-4">
              <div className="pb-2 border-b border-slate-800">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Heart size={16} className="text-cyan-400" />
                  <span>Interests & Personalization Focus</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Choose the atmospheric, planetary, and outdoor topics that interest you
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {ALL_INTERESTS.map((interest) => {
                  const isSelected = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      onClick={() => handleToggleInterest(interest)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/20'
                          : 'bg-slate-950/60 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <span>{interest}</span>
                      {isSelected && <Check size={13} className="shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-slate-400 pt-2">
                Selected ({selectedInterests.length} of {ALL_INTERESTS.length}) — These interests fine-tune intelligent hazard suggestions and banner ephemeris summaries.
              </p>

              <div className="flex justify-end pt-2">
                <Button
                  variant="primary"
                  onClick={handleSaveProfile}
                  isLoading={isSaving}
                  icon={saveSuccess ? <Check size={16} /> : undefined}
                >
                  {saveSuccess ? 'Saved!' : 'Save Interests'}
                </Button>
              </div>
            </div>
          )}

          {/* TAB 4: SAVED PLACES */}
          {activeTab === 'locations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <MapPin size={16} className="text-cyan-400" />
                    <span>Saved Atmospheric Observatories</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Multi-station cloud coordinates with custom tags & alert toggles
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => detectCurrentGPS()}
                  isLoading={isLocating}
                  icon={<Compass size={14} />}
                >
                  GPS Pinpoint
                </Button>
              </div>

              <div className="space-y-2.5">
                {savedLocations.map((loc) => (
                  <div
                    key={loc.id}
                    className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-800 text-cyan-400">
                        <MapPin size={16} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-100">
                            {loc.nickname || loc.name}
                          </span>
                          {loc.isDefault && (
                            <Badge variant="cyan" size="sm">
                              Default Landing
                            </Badge>
                          )}
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono">
                            {loc.placeLabel || 'Custom'}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 font-mono block mt-0.5">
                          {loc.country ? `${loc.country} • ` : ''}
                          {loc.lat.toFixed(2)}°, {loc.lon.toFixed(2)}°
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {/* Place Label Selector */}
                      <select
                        value={loc.placeLabel || 'Custom'}
                        onChange={(e) =>
                          updateLocationNickname(
                            loc.id,
                            loc.nickname || loc.name,
                            loc.category,
                            e.target.value as SavedPlaceLabel
                          )
                        }
                        className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1 focus:outline-none"
                      >
                        {PLACE_LABELS.map((lbl) => (
                          <option key={lbl} value={lbl}>
                            {lbl}
                          </option>
                        ))}
                      </select>

                      {/* Alert Toggle */}
                      <button
                        onClick={() => toggleLocationAlert(loc.id)}
                        className={`p-1.5 rounded-lg text-xs font-mono flex items-center gap-1 transition-all ${
                          loc.alertEnabled !== false
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                        title="Toggle Storm & Seismic Alerts"
                      >
                        <Bell size={13} />
                        <span>{loc.alertEnabled !== false ? 'Alerts ON' : 'Muted'}</span>
                      </button>

                      {/* Set Default */}
                      {!loc.isDefault && (
                        <button
                          onClick={() => setDefaultLocation(loc.id)}
                          className="p-1.5 rounded-lg text-xs text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
                          title="Set as Default Landing Location"
                        >
                          Set Default
                        </button>
                      )}

                      {/* Delete */}
                      {savedLocations.length > 1 && (
                        <button
                          onClick={() => removeSavedLocation(loc.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: WEATHER & METEOROLOGICAL PREFERENCES */}
          {activeTab === 'weather_pref' && (
            <div className="space-y-4">
              <div className="pb-2 border-b border-slate-800">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Sliders size={16} className="text-cyan-400" />
                  <span>Meteorological Standards & Measurement Units</span>
                </h3>
              </div>

              {/* Temperature Unit */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Temperature Standard
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => updatePreferences({ tempUnit: 'C', units: 'metric' })}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      preferences.tempUnit === 'C'
                        ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <span className="text-sm font-bold block">Celsius (°C)</span>
                      <span className="text-xs text-slate-400 mt-0.5 block">Metric system standard</span>
                    </div>
                    {preferences.tempUnit === 'C' && <Check size={18} className="text-cyan-400" />}
                  </button>

                  <button
                    onClick={() => updatePreferences({ tempUnit: 'F', units: 'imperial' })}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      preferences.tempUnit === 'F'
                        ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <span className="text-sm font-bold block">Fahrenheit (°F)</span>
                      <span className="text-xs text-slate-400 mt-0.5 block">Imperial system standard</span>
                    </div>
                    {preferences.tempUnit === 'F' && <Check size={18} className="text-cyan-400" />}
                  </button>
                </div>
              </div>

              {/* Wind Speed Units */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Wind Speed Standard
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['km/h', 'mph', 'knots', 'm/s'] as const).map((unit) => (
                    <button
                      key={unit}
                      onClick={() => updatePreferences({ speedUnit: unit })}
                      className={`py-2 px-3 rounded-xl border text-xs font-mono font-bold transition-all ${
                        preferences.speedUnit === unit
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                          : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pressure Units */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Barometric Pressure Standard
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['hPa', 'inHg', 'mmHg'] as const).map((pUnit) => (
                    <button
                      key={pUnit}
                      onClick={() => updatePreferences({ pressureUnit: pUnit })}
                      className={`py-2 px-3 rounded-xl border text-xs font-mono font-bold transition-all ${
                        preferences.pressureUnit === pUnit
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                          : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {pUnit}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visual Theme Mode */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Display Color Profile
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setTheme('dark')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-medium transition-all ${
                      preferences.theme === 'dark'
                        ? 'bg-slate-800 border-cyan-500 text-white'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Moon size={16} className="text-indigo-400" />
                    <span>Deep Obsidian</span>
                  </button>

                  <button
                    onClick={() => setTheme('light')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-medium transition-all ${
                      preferences.theme === 'light'
                        ? 'bg-slate-200 border-cyan-500 text-slate-900 font-bold'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Sun size={16} className="text-amber-500" />
                    <span>Solar Day</span>
                  </button>

                  <button
                    onClick={() => setTheme('astronomer-red')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-medium transition-all ${
                      preferences.theme === 'astronomer-red'
                        ? 'bg-red-950/70 border-red-500 text-red-300'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Eye size={16} className="text-red-400" />
                    <span>Astro Red (650nm)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ALERT RULES & HAZARDS */}
          {activeTab === 'alerts' && (
            <div className="space-y-4">
              <div className="pb-2 border-b border-slate-800">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-cyan-400" />
                  <span>Hazard Trigger Rules & Radius Thresholds</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure real-time monitoring thresholds for convective storms, seismic events, and eclipses
                </p>
              </div>

              {/* Rain Threshold */}
              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">
                      Rain Probability Trigger
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Notify when chance of rain exceeds threshold
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    {settings.rainProbabilityThreshold}%
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="90"
                  step="5"
                  value={settings.rainProbabilityThreshold}
                  onChange={(e) =>
                    updateSettings({ rainProbabilityThreshold: Number(e.target.value) })
                  }
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Earthquake Threshold & Radius */}
              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">
                      Earthquake Minimum Magnitude
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Filter USGS/EMS seismic fault events
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    M{settings.earthquakeMinMagnitude.toFixed(1)}+
                  </span>
                </div>
                <input
                  type="range"
                  min="3.0"
                  max="7.0"
                  step="0.5"
                  value={settings.earthquakeMinMagnitude}
                  onChange={(e) =>
                    updateSettings({ earthquakeMinMagnitude: Number(e.target.value) })
                  }
                  className="w-full accent-amber-400 cursor-pointer"
                />

                <div>
                  <span className="text-[11px] font-semibold text-slate-300 block mb-1.5">
                    Seismic Monitoring Radius
                  </span>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[50, 100, 250, 500, 1000].map((radius) => (
                      <button
                        key={radius}
                        onClick={() => updateSettings({ earthquakeRadiusKm: radius })}
                        className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                          settings.earthquakeRadiusKm === radius
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {radius} km
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* AQI Spike Alert */}
              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">AQI Spike Alert</span>
                    <span className="text-[11px] text-slate-400">
                      Alert when air quality index degrades
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-purple-400">
                    AQI &gt; {settings.aqiThresholdValue}
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="300"
                  step="25"
                  value={settings.aqiThresholdValue}
                  onChange={(e) => updateSettings({ aqiThresholdValue: Number(e.target.value) })}
                  className="w-full accent-purple-400 cursor-pointer"
                />
              </div>

              {/* Astronomy & Meteor Shower ZHR */}
              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">
                      Meteor Shower Min Zenithal Rate (ZHR)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Alert for prominent shooting star peaks
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {settings.meteorMinZhr} meteors/hr
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="10"
                  value={settings.meteorMinZhr}
                  onChange={(e) => updateSettings({ meteorMinZhr: Number(e.target.value) })}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB 7: NOTIFICATIONS & FCM */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="pb-2 border-b border-slate-800">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Bell size={16} className="text-cyan-400" />
                  <span>Push Notifications & Delivery Channels</span>
                </h3>
              </div>

              {/* FCM Push Activation */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-100">FCM Web Push Alerts</span>
                    <Badge
                      variant={settings.channelWebPush ? 'emerald' : 'amber'}
                      size="sm"
                    >
                      {settings.channelWebPush ? 'Active' : 'Disabled'}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Receive instant system alerts when storms or seismic events approach your saved places
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={settings.channelWebPush ? 'secondary' : 'primary'}
                  onClick={requestPushPermission}
                >
                  {settings.channelWebPush ? 'Re-register FCM' : 'Enable Web Push'}
                </Button>
              </div>

              {/* Quiet Hours */}
              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Moon size={16} className="text-cyan-400" />
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">Quiet Hours Mode</span>
                      <span className="text-[11px] text-slate-400">
                        Mute non-critical alerts during rest hours
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      updatePreferences({ quietHoursEnabled: !preferences.quietHoursEnabled })
                    }
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-colors ${
                      preferences.quietHoursEnabled
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {preferences.quietHoursEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>

                {preferences.quietHoursEnabled && (
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/60">
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1">Start Time:</span>
                      <input
                        type="time"
                        value={preferences.quietHoursStart || '22:00'}
                        onChange={(e) => updatePreferences({ quietHoursStart: e.target.value })}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 w-full"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1">End Time:</span>
                      <input
                        type="time"
                        value={preferences.quietHoursEnd || '07:00'}
                        onChange={(e) => updatePreferences({ quietHoursEnd: e.target.value })}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 w-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 8: ACCESSIBILITY & SENSORY */}
          {activeTab === 'accessibility' && (
            <div className="space-y-4">
              <div className="pb-2 border-b border-slate-800">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Eye size={16} className="text-cyan-400" />
                  <span>Accessibility & Sensory Preferences</span>
                </h3>
              </div>

              {/* Reduced Motion Toggle */}
              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">Reduced Motion</span>
                  <span className="text-[11px] text-slate-400">
                    Disable particle physics animations, rapid flashing, and layout springs
                  </span>
                </div>
                <button
                  onClick={() =>
                    updatePreferences({ reducedMotion: !preferences.reducedMotion })
                  }
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    preferences.reducedMotion ? 'bg-cyan-500' : 'bg-slate-800'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      preferences.reducedMotion ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Particle Density */}
              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-200 block">
                  Atmospheric Particle Density
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {(['low', 'medium', 'high', 'ultra'] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => updatePreferences({ particleDensity: d })}
                      className={`py-1.5 rounded-lg text-[10px] uppercase font-mono font-bold transition-all ${
                        (preferences.particleDensity || 'high') === d
                          ? 'bg-cyan-500 text-slate-950'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title="Confirm Sign Out"
        subtitle="Are you sure you want to sign out of WeatherGuard?"
        maxWidth="sm"
      >
        <div className="space-y-6 pt-2">
          <p className="text-sm text-slate-300">
            You will need to sign back in to access your cloud-synced observatories, locations, and personalized emergency contacts.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setShowLogoutConfirm(false);
                logout();
                onClose();
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </Modal>

      {cropImageSrc && (
        <ImageCropper
          isOpen={!!cropImageSrc}
          onClose={() => setCropImageSrc(null)}
          imageSrc={cropImageSrc}
          onCropComplete={handleCropComplete}
        />
      )}
    </Modal>
  );
};
