import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Clock,
  Radio,
  Zap,
} from 'lucide-react';
import { TimelineState } from '../../types/explorer';

interface ExplorerTimelineProps {
  timeline: TimelineState;
  onTogglePlay: () => void;
  onSetOffsetHours: (hours: number) => void;
  onSetSpeed: (speed: number) => void;
  onStep: (deltaHours: number) => void;
  onResetToNow: () => void;
  locationTimezone?: string;
}

export const ExplorerTimeline: React.FC<ExplorerTimelineProps> = ({
  timeline,
  onTogglePlay,
  onSetOffsetHours,
  onSetSpeed,
  onStep,
  onResetToNow,
  locationTimezone,
}) => {
  // Calculate target date based on current offset
  const baseTime = Date.now();
  const activeDate = new Date(baseTime + timeline.currentOffsetHours * 3600 * 1000);

  const formattedTime = activeDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: locationTimezone,
  });

  const formattedDate = activeDate.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: locationTimezone,
  });

  const isNow = timeline.currentOffsetHours === 0;
  const isPast = timeline.currentOffsetHours < 0;
  const isFuture = timeline.currentOffsetHours > 0;

  // Preset forecast timeline tick marks
  const hourTicks = [-12, -6, 0, 6, 12, 24, 36, 48, 72];

  return (
    <div
      id="explorer-timeline-control"
      className="bg-[#090E18]/90 hover:bg-[#090E18]/95 backdrop-blur-xl border border-slate-700/70 rounded-2xl p-2.5 sm:p-3 shadow-2xl transition-all select-none text-white w-full max-w-2xl"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pb-2">
        {/* Left: Play/Pause, Step & Speed Controls */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-1">
            <button
              onClick={onTogglePlay}
              className={`p-2 rounded-xl border flex items-center justify-center transition-all ${
                timeline.isPlaying
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                  : 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 hover:bg-cyan-500/30'
              }`}
              title={timeline.isPlaying ? 'Pause timeline' : 'Play timeline animation'}
            >
              {timeline.isPlaying ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
            </button>

            <button
              onClick={() => onStep(-1)}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-slate-300 border border-slate-700 hover:text-white transition-colors"
              title="Step -1 Hour"
            >
              <ChevronLeft size={14} />
            </button>

            <button
              onClick={() => onStep(1)}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-slate-300 border border-slate-700 hover:text-white transition-colors"
              title="Step +1 Hour"
            >
              <ChevronRight size={14} />
            </button>

            <button
              onClick={onResetToNow}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1 transition-all ${
                isNow
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isNow ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <span>LIVE</span>
            </button>
          </div>

          {/* Playback speed toggle */}
          <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-[10px] font-mono">
            {[1, 2, 4].map((spd) => (
              <button
                key={spd}
                onClick={() => onSetSpeed(spd)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  timeline.playbackSpeed === spd
                    ? 'bg-cyan-500/30 text-cyan-300 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Right: Active Horizon Time Badge */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span
            className={`px-2 py-0.5 rounded-md font-semibold border ${
              isNow
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                : isPast
                ? 'bg-indigo-950/60 text-indigo-300 border-indigo-500/30'
                : 'bg-cyan-950/60 text-cyan-300 border-cyan-500/30'
            }`}
          >
            {isNow ? 'Now' : isPast ? `${timeline.currentOffsetHours}h (Past)` : `+${timeline.currentOffsetHours}h (Forecast)`}
          </span>
          <div className="flex items-center gap-1 text-slate-300">
            <Clock size={12} className="text-cyan-400" />
            <span className="font-bold text-white">{formattedTime}</span>
            <span className="text-slate-400 text-[11px]">{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Scrub Slider Bar */}
      <div className="pt-1.5 px-1 space-y-1.5">
        <div className="relative flex items-center">
          <input
            type="range"
            min="-12"
            max="72"
            step="1"
            value={timeline.currentOffsetHours}
            onChange={(e) => onSetOffsetHours(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-slate-800/90 rounded-lg appearance-none cursor-pointer accent-cyan-400 z-10"
          />
        </div>

        {/* Hour markers row */}
        <div className="flex justify-between text-[9px] font-mono text-slate-400 px-0.5">
          {hourTicks.map((h) => (
            <button
              key={h}
              onClick={() => onSetOffsetHours(h)}
              className={`hover:text-cyan-300 transition-colors ${
                timeline.currentOffsetHours === h
                  ? 'text-cyan-300 font-bold'
                  : h === 0
                  ? 'text-emerald-400 font-semibold'
                  : ''
              }`}
            >
              {h === 0 ? 'NOW' : h > 0 ? `+${h}h` : `${h}h`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
