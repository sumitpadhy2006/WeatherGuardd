import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Calendar as CalendarIcon, Clock, Moon, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getMoonPhaseValue, isEclipseSeason, getMajorMeteorShower } from '../../utils/astronomyMath';
import { CalendarDateReport } from './CalendarDateReport';
import { useLocation } from '../../context/LocationContext';

export const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [legendDropdown, setLegendDropdown] = useState<{type: string, dates: Date[]} | null>(null);
  const [blinkToday, setBlinkToday] = useState(false);
  const { currentLocation } = useLocation();
  
  // Extract parts for UI
  const currentMonth = currentDate.getMonth(); // 0-11
  const currentYear = currentDate.getFullYear();
  
  // Real today
  const today = new Date();
  
  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Logic to build the calendar grid
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0-6
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handlePrevYear = () => {
    setCurrentDate(new Date(currentYear - 1, currentMonth, 1));
  };

  const handleNextYear = () => {
    setCurrentDate(new Date(currentYear + 1, currentMonth, 1));
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const y = parseInt(e.target.value, 10);
    if (!isNaN(y) && y >= 1880 && y <= 9999) {
      setCurrentDate(new Date(y, currentMonth, 1));
    }
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const m = parseInt(e.target.value, 10);
    setCurrentDate(new Date(currentYear, m, 1));
  };

  const goToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
    setBlinkToday(true);
    setTimeout(() => setBlinkToday(false), 1500);
  };

  const gridCells = useMemo(() => {
    const cells = [];
    
    const generateCell = (cellDate: Date, isCurrentMonth: boolean) => {
      const isToday =
        cellDate.getDate() === today.getDate() &&
        cellDate.getMonth() === today.getMonth() &&
        cellDate.getFullYear() === today.getFullYear();
      
      const phaseVal = getMoonPhaseValue(cellDate);
      const isNewMoon = phaseVal < 0.03 || phaseVal > 0.97;
      const isFullMoon = phaseVal > 0.47 && phaseVal < 0.53;
      const isSolarEclipse = isEclipseSeason(cellDate) && isNewMoon;
      const isLunarEclipse = isEclipseSeason(cellDate) && isFullMoon;
      const hasMeteor = getMajorMeteorShower(cellDate) !== null;

      const diffDays = Math.round((cellDate.getTime() - today.getTime()) / 86400000);
      let weatherMini = null;
      if (currentLocation.id !== 'loc_placeholder') {
        if (Math.abs(diffDays) <= 7) {
          const seed = cellDate.getDate() + cellDate.getMonth();
          const temps = [22, 24, 25, 28, 19, 21, 26, 30];
          const conditions = ['☀️', '⛅', '🌧️', '⛈️', '☁️', '☀️'];
          weatherMini = {
            temp: temps[seed % temps.length],
            icon: conditions[seed % conditions.length]
          };
        }
      }

      return {
        day: cellDate.getDate(),
        date: cellDate,
        isCurrentMonth,
        isToday,
        isNewMoon,
        isFullMoon,
        isSolarEclipse,
        isLunarEclipse,
        hasMeteor,
        weatherMini
      };
    };

    // Previous month padding
    for (let i = 0; i < firstDayOfMonth; i++) {
      const cellDate = new Date(currentYear, currentMonth, 0 - (firstDayOfMonth - 1 - i));
      cells.push(generateCell(cellDate, false));
    }
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const cellDate = new Date(currentYear, currentMonth, i);
      cells.push(generateCell(cellDate, true));
    }
    // Next month padding (to fill a 6-week grid, 42 cells)
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      const cellDate = new Date(currentYear, currentMonth + 1, i);
      cells.push(generateCell(cellDate, false));
    }
    return cells;
  }, [currentMonth, currentYear, daysInMonth, firstDayOfMonth, today]);

  if (selectedDate) {
    return <CalendarDateReport date={selectedDate} onBack={() => setSelectedDate(null)} />;
  }

  const calculateNextEvents = (type: string) => {
    if (legendDropdown && legendDropdown.type === type) {
      setLegendDropdown(null);
      return;
    }

    const events: Date[] = [];
    let d = new Date();
    d.setHours(0,0,0,0);
    
    let iterations = 0;
    while(events.length < 5 && iterations < 3650) { 
       d = new Date(d.getTime() + 86400000);
       iterations++;
       
       const phaseVal = getMoonPhaseValue(d);
       const isNewMoon = phaseVal < 0.03 || phaseVal > 0.97;
       const isFullMoon = phaseVal > 0.47 && phaseVal < 0.53;
       const eclipse = isEclipseSeason(d);
       const meteor = getMajorMeteorShower(d);

       let match = false;
       if (type === 'Solar Eclipse' && eclipse && isNewMoon) match = true;
       if (type === 'Lunar Eclipse' && eclipse && isFullMoon) match = true;
       if (type === 'New Moon' && isNewMoon) match = true;
       if (type === 'Full Moon' && isFullMoon) match = true;
       if (type === 'Meteor Peak' && meteor) match = true;

       if (match) {
         if (events.length === 0 || (d.getTime() - events[events.length-1].getTime() > 86400000 * 5)) {
           events.push(new Date(d));
         }
       }
    }
    setLegendDropdown({ type, dates: events });
  };

  const renderLegendItem = (label: string, dotNode: React.ReactNode, isClickable: boolean = true) => {
    const isActive = legendDropdown?.type === label;
    return (
      <div className="relative">
        <div 
          className={`flex items-center gap-2 ${isClickable ? 'cursor-pointer' : ''} transition-colors ${isActive ? 'text-cyan-400' : 'hover:text-slate-200'}`}
          onMouseEnter={() => isClickable && calculateNextEvents(label)}
          onMouseLeave={() => setLegendDropdown(null)}
        >
          {dotNode} {label}
        </div>
        <AnimatePresence>
          {isActive && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-2xl z-50 min-w-[160px]"
            >
              <div className="text-white font-bold mb-2 text-center border-b border-slate-700 pb-1">Upcoming {label}s</div>
              <div className="space-y-1">
                {legendDropdown.dates.map((eventDate, i) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <span className="text-slate-200">{eventDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    <span className="text-slate-500 font-mono">{eventDate.getFullYear()}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/60 backdrop-blur-2xl text-slate-100 p-4 sm:p-8 overflow-y-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <CalendarIcon className="text-cyan-400" size={32} />
            Planetary Calendar
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Universal epoch timeline. Supported range: 1880 - 9999.
          </p>
        </div>
        <button
          onClick={goToday}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/40 rounded-xl transition-all font-medium shadow-[0_0_15px_rgba(59,130,246,0.15)] hover:shadow-[0_0_25px_rgba(59,130,246,0.25)]"
        >
          <Clock size={16} />
          Today
        </button>
      </div>

      {/* Calendar Card - Glassy */}
      <div className="w-full max-w-4xl mx-auto bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Controls */}
        <div className="relative flex items-center justify-between mb-6 sm:mb-8 z-10 w-full">
          <div className="flex items-center shrink-0 -ml-2 sm:ml-0">
            <button
              onClick={handlePrevYear}
              className="p-1 sm:p-2.5 rounded-full hover:bg-white/10 text-slate-300 transition-colors"
            >
              <ChevronsLeft size={20} className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={handlePrevMonth}
              className="p-1 sm:p-2.5 rounded-full hover:bg-white/10 text-slate-300 transition-colors"
            >
              <ChevronLeft size={20} className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
          
          <div className="flex items-center justify-center flex-1 text-base sm:text-xl font-bold text-white px-2">
            <select
              value={currentMonth}
              onChange={handleMonthChange}
              className="bg-transparent border-none px-1 py-1 focus:outline-none appearance-none cursor-pointer hover:text-cyan-200 transition-colors text-right"
            >
              {MONTH_NAMES.map((m, idx) => (
                <option key={m} value={idx} className="bg-slate-900 text-white font-sans">
                  {m}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="1880"
              max="9999"
              value={currentYear}
              onChange={handleYearChange}
              className="bg-transparent border-none px-1 py-1 focus:outline-none w-16 sm:w-20 text-left hover:text-cyan-200 transition-colors"
            />
          </div>

          <div className="flex items-center shrink-0 -mr-2 sm:mr-0">
            <button
              onClick={handleNextMonth}
              className="p-1 sm:p-2.5 rounded-full hover:bg-white/10 text-slate-300 transition-colors"
            >
              <ChevronRight size={20} className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={handleNextYear}
              className="p-1 sm:p-2.5 rounded-full hover:bg-white/10 text-slate-300 transition-colors"
            >
              <ChevronsRight size={20} className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Weekdays */}
        <div className="grid grid-cols-7 gap-2 mb-2 relative z-10">
          {WEEKDAYS.map((day) => (
            <div key={day} className="text-center font-mono text-sm font-semibold text-slate-400 uppercase tracking-wider py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-2 relative z-10">
          <AnimatePresence mode="popLayout">
            {gridCells.map((cell, idx) => {
              const isWeekend = idx % 7 === 0 || idx % 7 === 6;
              return (
                <motion.div
                  key={`${currentYear}-${currentMonth}-${idx}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.01, duration: 0.2 }}
                  onClick={() => {
                    if (cell.date) setSelectedDate(cell.date);
                  }}
                  className={`
                    relative flex flex-col items-center justify-start pt-1 sm:pt-2 rounded-xl transition-all aspect-square sm:aspect-auto sm:h-24
                    ${cell.isCurrentMonth ? 'cursor-pointer hover:bg-white/10' : ''}
                    ${cell.isToday 
                      ? `bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.6)] font-bold border border-blue-400 transition-all duration-300 ${blinkToday ? 'animate-pulse scale-105 ring-4 ring-blue-300' : ''}` 
                      : cell.isCurrentMonth
                        ? 'text-slate-200'
                        : 'text-slate-600'
                    }
                    ${cell.isCurrentMonth && isWeekend && !cell.isToday ? 'text-slate-400' : ''}
                    ${cell.isSolarEclipse ? 'ring-2 ring-yellow-500/50 bg-yellow-500/10' : ''}
                    ${cell.isLunarEclipse ? 'ring-2 ring-red-500/50 bg-red-500/10' : ''}
                  `}
                >
                  <span className="text-base sm:text-lg font-medium z-10 leading-none">{cell.day}</span>
                  
                  {cell.weatherMini && (
                    <div className="flex flex-col items-center mt-1 z-10 text-[10px] sm:text-xs text-slate-300 font-medium">
                      <span>{cell.weatherMini.icon}</span>
                      <span>{cell.weatherMini.temp}°</span>
                    </div>
                  )}
                  
                  {/* Event Indicators */}
                  <div className="absolute bottom-1.5 flex gap-1 z-10">
                    {(cell.isFullMoon || cell.isNewMoon) && (
                      <div className={`w-1.5 h-1.5 rounded-full ${cell.isFullMoon ? 'bg-white shadow-[0_0_5px_white]' : 'bg-slate-900 border border-slate-500'}`} />
                    )}
                    {cell.hasMeteor && (
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_5px_rgba(45,212,191,1)]" />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Legend */}
        <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium relative z-10">
          {renderLegendItem('Today', <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />, false)}
          {renderLegendItem('Full Moon', <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_white]" />)}
          {renderLegendItem('New Moon', <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-500" />)}
          {renderLegendItem('Solar Eclipse', <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500" />)}
          {renderLegendItem('Lunar Eclipse', <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500" />)}
          {renderLegendItem('Meteor Peak', <div className="w-2.5 h-2.5 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.8)]" />)}
        </div>
      </div>
    </div>
  );
};
