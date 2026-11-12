import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useLocation } from '../../context/LocationContext';
import { usePreferences } from '../../context/PreferencesContext';
import { SavedLocationCard } from './SavedLocationCard';
import { GeoLocationItem } from '../../types';
import { Search, MapPin, Trash2, Plus, Bookmark, Navigation, Edit2, Check, Map, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { MapPickerModal } from './MapPickerModal';

interface SavedLocationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'modal' | 'page';
}

export const SavedLocationsModal: React.FC<SavedLocationsModalProps> = ({ isOpen, onClose, mode }) => {
  const { preferences } = usePreferences();
  const { isAuthenticated } = useAuth();
  const {
    currentLocation,
    savedLocations,
    setCurrentLocation,
    addSavedLocation,
    removeSavedLocation,
    updateLocationNickname,
    detectCurrentGPS,
    isLocating,
    customTags,
    addCustomTag,
    removeCustomTag,
  } = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeoLocationItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNickname, setEditNickname] = useState('');
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [activeTagForSave, setActiveTagForSave] = useState<string | null>(null);
  const [customTagPrompt, setCustomTagPrompt] = useState<{
    isOpen: boolean;
    onSave: (val: string) => void;
  }>({ isOpen: false, onSave: () => {} });
  const [customTagInput, setCustomTagInput] = useState('');
  const QUICK_TAGS = ['Home', 'Work', 'College', 'Institution', 'Travel'];

  // Debounced search
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/geocode/search?q=${encodeURIComponent(searchQuery.trim())}&lat=${currentLocation.lat}&lon=${currentLocation.lon}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch {
        // Ignore
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectLocation = (loc: GeoLocationItem) => {
    setCurrentLocation(loc);
    onClose();
  };

  const handleBookmarkLocation = (loc: GeoLocationItem) => {
    addSavedLocation({
      ...loc,
      placeLabel: (activeTagForSave || 'Custom') as any,
      isDefault: activeTagForSave === 'Home'
    }, activeTagForSave as any || 'Custom');
    setCurrentLocation(loc);
    setSearchQuery('');
    setSearchResults([]);
    setActiveTagForSave(null);
  };

  const handleStartEdit = (loc: GeoLocationItem) => {
    setEditingId(loc.id);
    setEditNickname(loc.nickname || loc?.name);
  };

  const handleSaveEdit = (id: string) => {
    if (editNickname.trim()) {
      updateLocationNickname(id, editNickname.trim());
    }
    setEditingId(null);
  };

  const handleMapPick = async (lat: number, lon: number) => {
    try {
      const res = await fetch(`/api/geocode/reverse?lat=${lat}&lon=${lon}`);
      if (res.ok) {
        const data = await res.json();
        const loc = {
          ...data,
          id: data.id || `geo_${lat.toFixed(3)}_${lon.toFixed(3)}`,
          name: data.name || `Location (${lat.toFixed(2)}, ${lon.toFixed(2)})`,
          lat,
          lon,
        };
        setCurrentLocation(loc);
        addSavedLocation({
          ...loc,
          placeLabel: (activeTagForSave || 'Custom') as any,
          isDefault: activeTagForSave === 'Home'
        }, activeTagForSave as any || 'Custom'); // Automatically add to saved places
        setActiveTagForSave(null);
        onClose();
      }
    } catch {
      // Fallback
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Planetary Coordinates & Locations"
      subtitle="Search global cities, manage monitoring hubs, or pinpoint GPS coordinates"
      maxWidth="full"
      mode={mode}
    >
      <div className="space-y-5">
        {/* Search & GPS Locate Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by city, region, or observatory name..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9.5 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
          <Button
            variant="secondary"
            icon={<Map size={15} />}
            onClick={() => setIsMapPickerOpen(true)}
            title="Pick on Map"
          >
            Map
          </Button>
        </div>

        {/* Quick Assignment / Navigation Tags */}
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {QUICK_TAGS.map(tag => {
            const hasLoc = savedLocations.find(l => l.placeLabel === tag);
            const isTarget = activeTagForSave === tag;
            return (
              <button
                key={tag}
                onClick={() => {
                  if (hasLoc) handleSelectLocation(hasLoc);
                  else setActiveTagForSave(isTarget ? null : tag);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  hasLoc 
                    ? 'bg-cyan-900/40 text-cyan-200 border border-cyan-800 hover:bg-cyan-900/60' 
                    : isTarget 
                      ? 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(79,70,229,0.5)]'
                      : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-800'
                }`}
                title={hasLoc ? `Navigate to ${tag}` : `Set next saved location as ${tag}`}
              >
                {hasLoc ? <MapPin size={12} /> : <Plus size={12} />}
                {tag}
              </button>
            );
          })}

          {customTags.map(tag => {
            const hasLoc = savedLocations.find(l => l.placeLabel === tag);
            const isTarget = activeTagForSave === tag;
            return (
              <div key={tag} className="flex items-center gap-0 group">
                <button
                  onClick={() => {
                    if (hasLoc) handleSelectLocation(hasLoc);
                    else setActiveTagForSave(isTarget ? null : tag);
                  }}
                  className={`px-3 py-1.5 rounded-l-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 border-r-0 ${
                    hasLoc 
                      ? 'bg-violet-900/40 text-violet-200 border border-violet-800 hover:bg-violet-900/60' 
                      : isTarget 
                        ? 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(79,70,229,0.5)] border border-indigo-600'
                        : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-800'
                  }`}
                  title={hasLoc ? `Navigate to ${tag}` : `Set next saved location as ${tag}`}
                >
                  {hasLoc ? <MapPin size={12} /> : <Plus size={12} />}
                  {tag}
                </button>
                <button
                  onClick={() => {
                    removeCustomTag(tag);
                    if (activeTagForSave === tag) setActiveTagForSave(null);
                  }}
                  className={`px-1.5 py-1.5 rounded-r-lg border-l transition-colors ${
                    hasLoc
                      ? 'bg-violet-900/40 text-violet-400 border-violet-800 hover:bg-violet-800/60 hover:text-white'
                      : isTarget
                        ? 'bg-indigo-700 text-indigo-300 border-indigo-500 hover:bg-indigo-800 hover:text-white'
                        : 'bg-slate-800/50 text-slate-500 border-slate-700/50 hover:bg-red-900/50 hover:text-red-400'
                  }`}
                  title={`Remove ${tag} tag`}
                >
                  <X size={12} />
                </button>
              </div>
            );
          })}
          
          {/* Custom Tag Button */}
          <button
            onClick={() => {
              if (activeTagForSave && !QUICK_TAGS.includes(activeTagForSave)) {
                setActiveTagForSave(null);
              } else {
                setCustomTagInput('');
                setCustomTagPrompt({
                  isOpen: true,
                  onSave: (val) => {
                    addCustomTag(val);
                    setActiveTagForSave(val);
                  }
                });
              }
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-800`}
          >
            <Plus size={12} />
            Custom...
          </button>
        </div>

        {/* Live Search Results */}
        {searchQuery.trim().length >= 2 && (
          <div className="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider block">
              Search Results {isSearching && '(Searching...)'}
            </span>
            {searchResults.length === 0 && !isSearching ? (
              <p className="text-xs text-slate-400 py-2">No matching planetary coordinates found.</p>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {searchResults.map((loc) => (
                  <div
                    key={loc.id}
                    className="py-2.5 flex items-center justify-between gap-3 text-sm hover:bg-slate-900/60 px-2 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-cyan-400 shrink-0" />
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-100 flex items-center gap-2">
                          {(loc?.name || 'Unknown Location').replace(/\s*\([A-Za-z]*\)/g, '').replace(/\s+(East|West|North|South)$/i, '').split(',')[0]}
                          {loc.placeType && (
                            <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30">
                              {loc.placeType}
                            </span>
                          )}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {[loc.district, loc.state, loc.country].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleBookmarkLocation(loc)}
                        icon={<Bookmark size={14} />}
                      >
                        Save
                      </Button>
                      <Button size="sm" variant="primary" onClick={() => handleSelectLocation(loc)}>
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Saved Locations List */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              Saved Atmospheric Observatories ({savedLocations.length})
              {!isAuthenticated ? (
                <span className="text-[9px] bg-slate-800/80 px-2 py-0.5 rounded-full text-slate-400 normal-case tracking-normal border border-slate-700/50">
                  Local Device Only
                </span>
              ) : (
                <span className="text-[9px] bg-cyan-900/30 px-2 py-0.5 rounded-full text-cyan-400 normal-case tracking-normal border border-cyan-800/50">
                  Account Synced
                </span>
              )}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedLocations.map((loc) => {
              const isActive =
                loc.id === currentLocation.id ||
                (Math.abs(loc.lat - currentLocation.lat) < 0.02 && Math.abs(loc.lon - currentLocation.lon) < 0.02);

              return (
                <SavedLocationCard
                  key={loc.id}
                  location={loc}
                  isActive={isActive}
                  isEditing={editingId === loc.id}
                  editNickname={editNickname}
                  onSelect={handleSelectLocation}
                  onEditStart={(id) => {
                    setEditingId(id);
                    const location = savedLocations.find(l => l.id === id);
                    setEditNickname(location?.nickname || location?.name || '');
                  }}
                  onEditSave={handleSaveEdit}
                  onEditCancel={() => setEditingId(null)}
                  onEditChange={setEditNickname}
                  onAssignLabel={(id, label) => {
                    const locToUpdate = savedLocations.find(l => l.id === id);
                    if (locToUpdate) {
                      addSavedLocation({
                        ...locToUpdate,
                        placeLabel: label as any,
                        isDefault: label === 'Home'
                      }, label as any);
                    }
                  }}
                  onRequestCustomTag={(onSave) => {
                    setCustomTagInput('');
                    setCustomTagPrompt({ isOpen: true, onSave });
                  }}
                  onDelete={(id) => {
                    if (window.confirm('Remove this saved location?')) {
                      removeSavedLocation(id);
                    }
                  }}
                  unit={preferences.tempUnit}
                />
              );
            })}
          </div>
        </div>
      </div>
      
      <MapPickerModal
        isOpen={isMapPickerOpen}
        onClose={() => setIsMapPickerOpen(false)}
        onLocationSelected={handleMapPick}
      />

      <Modal
        isOpen={customTagPrompt.isOpen}
        onClose={() => setCustomTagPrompt({ ...customTagPrompt, isOpen: false })}
        title="Custom Location Tag"
        subtitle="Enter a custom tag name (e.g., Gym, Studio)"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <input
            type="text"
            value={customTagInput}
            onChange={(e) => setCustomTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (customTagInput.trim()) {
                  customTagPrompt.onSave(customTagInput.trim());
                  setCustomTagPrompt({ ...customTagPrompt, isOpen: false });
                  setCustomTagInput('');
                }
              }
            }}
            placeholder="Custom Tag..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            autoFocus
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setCustomTagPrompt({ ...customTagPrompt, isOpen: false })}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => {
              if (customTagInput.trim()) {
                customTagPrompt.onSave(customTagInput.trim());
                setCustomTagPrompt({ ...customTagPrompt, isOpen: false });
                setCustomTagInput('');
              }
            }}>
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </Modal>
  );
};
