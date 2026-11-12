import React, { useState, useRef, useEffect, useMemo, MouseEvent } from 'react';
import { Sparkles, Eye, Layers, Compass, RotateCw, Info, MapPin, Mountain, Maximize, Minimize } from 'lucide-react';
import { useFullscreen } from '../../hooks/useFullscreen';
import { ConstellationItem, PlanetData, MoonData, SunData } from '../../types/astronomy';

interface NightSkyDomeProps {
  constellations: ConstellationItem[];
  planets: PlanetData[];
  moon: MoonData | null;
  sun: SunData | null;
  simulatedHourOffset: number;
  onHourOffsetChange: (offset: number) => void;
  focusTargetId?: string | null;
}

interface CelestialObject {
  id: string;
  name: string;
  type: 'star' | 'planet' | 'constellation' | 'dso' | 'moon';
  mag: number;
  raHours: number; // 0-24
  decDeg: number;  // -90 to +90
  color: string;
  constellation?: string;
  distanceLy?: string;
  distanceAu?: number;
  description?: string;
  radiusKm?: string;
  phase?: string;
  riseTime?: string;
  setTime?: string;
  azimuthDeg?: number;
  altitudeDeg?: number;
}

const formatCoords = (val: number, isHours: boolean, isPos: boolean = false) => {
  const sign = isPos ? (val >= 0 ? '+' : '-') : '';
  const absVal = Math.abs(val);
  const main = Math.floor(absVal);
  const m = Math.floor((absVal - main) * 60);
  const s = (((absVal - main) * 60) - m) * 60;
  
  if (isHours) {
    return `${main.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toFixed(1)}s`;
  } else {
    return `${sign}${main.toString().padStart(2, '0')}° ${m.toString().padStart(2, '0')}' ${s.toFixed(1)}"`;
  }
};

const planetRadii: Record<string, string> = {
  mercury: '2439', venus: '6051', mars: '3389', jupiter: '69911', saturn: '58232', uranus: '25362', neptune: '24622', moon: '1737'
};

export const NightSkyDome: React.FC<NightSkyDomeProps> = ({
  constellations,
  planets,
  moon,
  sun,
  simulatedHourOffset,
  onHourOffsetChange,
  focusTargetId,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fullscreenContainerRef = useRef<HTMLDivElement | null>(null);
  const { isFullscreen, toggleFullscreen } = useFullscreen(fullscreenContainerRef);

  const [showConstellationLines, setShowConstellationLines] = useState(true);
  const [showStarLabels, setShowStarLabels] = useState(true);
  const [showDSO, setShowDSO] = useState(true);
  const [showGround, setShowGround] = useState(true);
  const [selectedObject, setSelectedObject] = useState<CelestialObject | null>(null);
  const [hoveredObject, setHoveredObject] = useState<CelestialObject | null>(null);

  // Camera State for Pan, Drag, and Zoom
  const [camera, setCamera] = useState({ yaw: 180, pitch: 20 }); // Facing South, slightly up
  const [zoom, setZoom] = useState(1.0);
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const majorStars: CelestialObject[] = useMemo(
    () => [
      { id: 'polaris', name: 'Polaris (North Star)', type: 'star', mag: 1.98, raHours: 2.5, decDeg: 89.2, color: '#FEF08A', constellation: 'Ursa Minor', distanceLy: '433 ly', description: 'The North Celestial Pole guide star.' },
      { id: 'sirius', name: 'Sirius (Dog Star)', type: 'star', mag: -1.46, raHours: 6.75, decDeg: -16.7, color: '#93C5FD', constellation: 'Canis Major', distanceLy: '8.6 ly', description: 'The brightest individual star in Earth’s night sky.' },
      { id: 'betelgeuse', name: 'Betelgeuse', type: 'star', mag: 0.42, raHours: 5.9, decDeg: 7.4, color: '#F87171', constellation: 'Orion', distanceLy: '642 ly', description: 'Massive red supergiant.' },
      { id: 'rigel', name: 'Rigel', type: 'star', mag: 0.13, raHours: 5.25, decDeg: -8.2, color: '#60A5FA', constellation: 'Orion', distanceLy: '860 ly', description: 'Luminous blue supergiant.' },
      { id: 'vega', name: 'Vega', type: 'star', mag: 0.03, raHours: 18.6, decDeg: 38.8, color: '#BAE6FD', constellation: 'Lyra', distanceLy: '25 ly', description: 'Anchor of the Summer Triangle.' },
      { id: 'altair', name: 'Altair', type: 'star', mag: 0.77, raHours: 19.8, decDeg: 8.9, color: '#E2E8F0', constellation: 'Aquila', distanceLy: '16.7 ly', description: 'Rapidly rotating oblate star.' },
      { id: 'deneb', name: 'Deneb', type: 'star', mag: 1.25, raHours: 20.7, decDeg: 45.3, color: '#E0F2FE', constellation: 'Cygnus', distanceLy: '2,600 ly', description: 'Extremely distant white supergiant.' },
      { id: 'arcturus', name: 'Arcturus', type: 'star', mag: -0.05, raHours: 14.3, decDeg: 19.2, color: '#FDBA74', constellation: 'Boötes', distanceLy: '36.7 ly', description: 'Brilliant orange giant star.' },
      { id: 'aldebaran', name: 'Aldebaran', type: 'star', mag: 0.85, raHours: 4.6, decDeg: 16.5, color: '#FB923C', constellation: 'Taurus', distanceLy: '65 ly', description: 'The fiery red Eye of Taurus.' },
      { id: 'antares', name: 'Antares', type: 'star', mag: 0.96, raHours: 16.5, decDeg: -26.4, color: '#EF4444', constellation: 'Scorpius', distanceLy: '550 ly', description: 'Heart of the Scorpion.' },
      { id: 'spica', name: 'Spica', type: 'star', mag: 0.98, raHours: 13.4, decDeg: -11.2, color: '#93C5FD', constellation: 'Virgo', distanceLy: '250 ly', description: 'Spectroscopic binary blue giant star.' },
      { id: 'capella', name: 'Capella', type: 'star', mag: 0.08, raHours: 5.3, decDeg: 46.0, color: '#FDE047', constellation: 'Auriga', distanceLy: '42.9 ly', description: 'Golden quadruple star system.' },
      // Ursa Major
      { id: 'dubhe', name: 'Dubhe', type: 'star', mag: 1.79, raHours: 11.0, decDeg: 61.7, color: '#FDBA74', constellation: 'Ursa Major' },
      { id: 'merak', name: 'Merak', type: 'star', mag: 2.34, raHours: 11.0, decDeg: 56.3, color: '#BAE6FD', constellation: 'Ursa Major' },
      { id: 'phecda', name: 'Phecda', type: 'star', mag: 2.41, raHours: 11.9, decDeg: 53.7, color: '#BAE6FD', constellation: 'Ursa Major' },
      { id: 'megrez', name: 'Megrez', type: 'star', mag: 3.32, raHours: 12.2, decDeg: 57.0, color: '#BAE6FD', constellation: 'Ursa Major' },
      { id: 'alioth', name: 'Alioth', type: 'star', mag: 1.76, raHours: 12.9, decDeg: 55.9, color: '#BAE6FD', constellation: 'Ursa Major' },
      { id: 'mizar', name: 'Mizar', type: 'star', mag: 2.23, raHours: 13.4, decDeg: 54.9, color: '#BAE6FD', constellation: 'Ursa Major' },
      { id: 'alkaid', name: 'Alkaid', type: 'star', mag: 1.85, raHours: 13.8, decDeg: 49.3, color: '#BAE6FD', constellation: 'Ursa Major' },
      
      // Orion additions
      { id: 'bellatrix', name: 'Bellatrix', type: 'star', mag: 1.64, raHours: 5.4, decDeg: 6.3, color: '#BAE6FD', constellation: 'Orion' },
      { id: 'alnilam', name: 'Alnilam', type: 'star', mag: 1.69, raHours: 5.6, decDeg: -1.2, color: '#BAE6FD', constellation: 'Orion' },
      { id: 'saiph', name: 'Saiph', type: 'star', mag: 2.07, raHours: 5.8, decDeg: -9.6, color: '#BAE6FD', constellation: 'Orion' },
      { id: 'mintaka', name: 'Mintaka', type: 'star', mag: 2.25, raHours: 5.5, decDeg: -0.3, color: '#BAE6FD', constellation: 'Orion' },
      { id: 'alnitak', name: 'Alnitak', type: 'star', mag: 1.74, raHours: 5.68, decDeg: -1.9, color: '#BAE6FD', constellation: 'Orion' },

      // Cassiopeia
      { id: 'caph', name: 'Caph', type: 'star', mag: 2.28, raHours: 0.15, decDeg: 59.1, color: '#FFFFFF', constellation: 'Cassiopeia' },
      { id: 'schedar', name: 'Schedar', type: 'star', mag: 2.24, raHours: 0.67, decDeg: 56.5, color: '#FDBA74', constellation: 'Cassiopeia' },
      { id: 'gammacas', name: 'Gamma', type: 'star', mag: 2.15, raHours: 0.94, decDeg: 60.7, color: '#BAE6FD', constellation: 'Cassiopeia' },
      { id: 'ruchbah', name: 'Ruchbah', type: 'star', mag: 2.66, raHours: 1.43, decDeg: 60.2, color: '#BAE6FD', constellation: 'Cassiopeia' },
      { id: 'segin', name: 'Segin', type: 'star', mag: 3.35, raHours: 1.9, decDeg: 63.6, color: '#BAE6FD', constellation: 'Cassiopeia' },
    ],
    []
  );

  const deepSkyObjects: CelestialObject[] = useMemo(
    () => [
      { id: 'm31', name: 'Andromeda Galaxy (M31)', type: 'dso', mag: 3.44, raHours: 0.7, decDeg: 41.3, color: '#C084FC', constellation: 'Andromeda', distanceLy: '2.5M ly', description: 'Nearest major spiral galaxy.' },
      { id: 'm42', name: 'Great Orion Nebula (M42)', type: 'dso', mag: 4.0, raHours: 5.6, decDeg: -5.4, color: '#F472B6', constellation: 'Orion', distanceLy: '1,344 ly', description: 'Vast stellar nursery.' },
      { id: 'm45', name: 'The Pleiades (M45)', type: 'dso', mag: 1.6, raHours: 3.8, decDeg: 24.1, color: '#67E8F9', constellation: 'Taurus', distanceLy: '444 ly', description: 'Glowing blue reflection nebula.' },
    ],
    []
  );

  const allObjects = useMemo(() => {
    const list = [...majorStars, ...deepSkyObjects];
    
    // Add Planets
    planets.forEach(p => {
      if (p.status !== 'daytime' && p.status !== 'below_horizon') {
        list.push({
          id: p.id, name: p.name, type: 'planet', mag: p.magnitude, raHours: 0, decDeg: 0,
          color: p.colorHex, description: p.description, radiusKm: planetRadii[p.id],
          azimuthDeg: p.azimuthDeg, altitudeDeg: p.altitudeDeg
        });
      }
    });

    // Add Moon
    if (moon) {
      list.push({
        id: 'moon', name: 'The Moon', type: 'moon', mag: -12.7, raHours: 0, decDeg: 0,
        color: '#E2E8F0', description: moon.phaseName, radiusKm: planetRadii['moon'], phase: moon.phaseName,
        azimuthDeg: moon.azimuthDeg, altitudeDeg: moon.altitudeDeg
      });
    }

    return list;
  }, [majorStars, deepSkyObjects, planets, moon]);

  // Handle focus target
  useEffect(() => {
    if (!focusTargetId) return;

    if (focusTargetId === 'moon' && moon) {
      setCamera({
        yaw: (moon.azimuthDeg + 180) % 360,
        pitch: Math.max(10, moon.altitudeDeg)
      });
      const moonObj = allObjects.find(o => o.id === 'moon');
      if (moonObj) setSelectedObject(moonObj);
      return;
    }

    if (focusTargetId.startsWith('planet-')) {
      const pId = focusTargetId.replace('planet-', '');
      const pObj = allObjects.find(o => o.id === `planet-${pId}`);
      if (pObj) {
        // Find corresponding planet data for alt/az
        const planetData = planets.find(p => p.id === pId);
        if (planetData) {
          setCamera({
            yaw: (planetData.azimuthDeg + 180) % 360,
            pitch: Math.max(10, planetData.altitudeDeg)
          });
        }
        setSelectedObject(pObj);
      }
    }
  }, [focusTargetId, moon, planets, allObjects]);

  const backgroundStars = useMemo(() => {
    return Array.from({ length: 800 }).map(() => ({
      ra: Math.random() * 24,
      dec: Math.random() * 180 - 90,
      mag: Math.random() * 4 + 2,
    }));
  }, []);

  const [dimensions, setDimensions] = useState({ w: 800, h: 500 });
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({ w: entry.contentRect.width, h: entry.contentRect.height });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Azimuthal Equidistant Projection
  const projectAzAlt = (az: number, alt: number, w: number, h: number) => {
    const azRad = az * (Math.PI / 180);
    const altRad = alt * (Math.PI / 180);
    const yawRad = camera.yaw * (Math.PI / 180);
    const pitchRad = camera.pitch * (Math.PI / 180);

    const cosCRaw = Math.sin(pitchRad) * Math.sin(altRad) + Math.cos(pitchRad) * Math.cos(altRad) * Math.cos(azRad - yawRad);
    const cosC = Math.max(-0.999, Math.min(1, cosCRaw)); // Prevent Infinity/NaN
    const c = Math.acos(cosC);
    const k = c === 0 ? 1 : c / Math.sin(c);

    const xRel = k * Math.cos(altRad) * Math.sin(azRad - yawRad);
    const yRel = k * (Math.cos(pitchRad) * Math.sin(altRad) - Math.sin(pitchRad) * Math.cos(altRad) * Math.cos(azRad - yawRad));

    const scale = (h / Math.PI) * 2.2 * zoom;

    return {
      x: w / 2 + xRel * scale,
      y: h / 2 - yRel * scale,
      visible: cosC > -0.2 // Hide items outside the circular viewport
    };
  };

  const project = (raHours: number, decDeg: number, w: number, h: number) => {
    const timeShift = ((new Date().getHours() + simulatedHourOffset) % 24) * 15;
    const az = (raHours * 15 - timeShift + 360) % 360;
    return projectAzAlt(az, decDeg, w, h);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.w === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = dimensions.w;
    const h = dimensions.h;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    // Fill outer space (outside the hemisphere)
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);

    // projectAzAlt and project are now used from the component scope
    const timeShift = ((new Date().getHours() + simulatedHourOffset) % 24) * 15;
    const scale = (h / Math.PI) * 2.2 * zoom;

    // Proper Hemisphere Clipping Mask
    const hemisphereRadius = (Math.PI / 2) * scale;
    ctx.save();
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, hemisphereRadius, 0, Math.PI * 2);
    ctx.clip();

    // Sky gradient inside hemisphere
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#020617');
    bgGrad.addColorStop(0.5, '#0f172a');
    bgGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.beginPath();
    const mwP1 = project(18.6, 38.8, w, h);
    const mwP2 = project(6.75, -16.7, w, h);
    ctx.moveTo(mwP1.x - 200, mwP1.y - 100);
    ctx.lineTo(mwP1.x + 200, mwP1.y + 100);
    ctx.lineTo(mwP2.x + 200, mwP2.y + 100);
    ctx.lineTo(mwP2.x - 200, mwP2.y - 100);
    ctx.closePath();
    
    const mwGrad = ctx.createLinearGradient(mwP1.x, mwP1.y, mwP2.x, mwP2.y);
    mwGrad.addColorStop(0, 'rgba(147, 197, 253, 0.08)');
    mwGrad.addColorStop(0.5, 'rgba(192, 132, 252, 0.05)');
    mwGrad.addColorStop(1, 'rgba(147, 197, 253, 0.08)');
    ctx.fillStyle = mwGrad;
    ctx.filter = 'blur(30px)';
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#FFFFFF';
    backgroundStars.forEach(star => {
      const p = project(star.ra, star.dec, w, h);
      if (p.x < -10 || p.x > w + 10 || p.y < -10 || p.y > h + 10) return;
      const opacity = Math.max(0.1, 1 - star.mag / 6);
      ctx.globalAlpha = opacity;
      ctx.fillRect(p.x, p.y, 1.2, 1.2);
    });
    ctx.globalAlpha = 1.0;

    if (showConstellationLines) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'; // More delicate, mature line color
      ctx.lineWidth = 0.8;
      
      // Helper function to draw a line between two RA/Dec points
      const drawAsterismLine = (ra1: number, dec1: number, ra2: number, dec2: number) => {
        const p1 = project(ra1, dec1, w, h);
        const p2 = project(ra2, dec2, w, h);
        if ((p1.x > -50 && p1.x < w + 50 && p1.y > -50 && p1.y < h + 50) || 
            (p2.x > -50 && p2.x < w + 50 && p2.y > -50 && p2.y < h + 50)) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      };

      // 1. Orion (The Hunter)
      const oriBetelgeuse = [5.9, 7.4];
      const oriBellatrix = [5.4, 6.3];
      const oriAlnilam = [5.6, -1.2]; // Belt center
      const oriRigel = [5.25, -8.2];
      const oriSaiph = [5.8, -9.6];
      const oriMintaka = [5.5, -0.3]; // Belt right
      const oriAlnitak = [5.68, -1.9]; // Belt left
      
      // Orion Hourglass & Belt
      drawAsterismLine(oriBetelgeuse[0], oriBetelgeuse[1], oriBellatrix[0], oriBellatrix[1]);
      drawAsterismLine(oriBetelgeuse[0], oriBetelgeuse[1], oriAlnitak[0], oriAlnitak[1]);
      drawAsterismLine(oriBellatrix[0], oriBellatrix[1], oriMintaka[0], oriMintaka[1]);
      drawAsterismLine(oriRigel[0], oriRigel[1], oriMintaka[0], oriMintaka[1]);
      drawAsterismLine(oriSaiph[0], oriSaiph[1], oriAlnitak[0], oriAlnitak[1]);
      drawAsterismLine(oriRigel[0], oriRigel[1], oriSaiph[0], oriSaiph[1]);
      drawAsterismLine(oriMintaka[0], oriMintaka[1], oriAlnilam[0], oriAlnilam[1]);
      drawAsterismLine(oriAlnilam[0], oriAlnilam[1], oriAlnitak[0], oriAlnitak[1]);

      // 2. Big Dipper (Ursa Major)
      const umaDubhe = [11.0, 61.7];
      const umaMerak = [11.0, 56.3];
      const umaPhecda = [11.9, 53.7];
      const umaMegrez = [12.2, 57.0];
      const umaAlioth = [12.9, 55.9];
      const umaMizar = [13.4, 54.9];
      const umaAlkaid = [13.8, 49.3];
      
      // Bowl
      drawAsterismLine(umaDubhe[0], umaDubhe[1], umaMerak[0], umaMerak[1]);
      drawAsterismLine(umaMerak[0], umaMerak[1], umaPhecda[0], umaPhecda[1]);
      drawAsterismLine(umaPhecda[0], umaPhecda[1], umaMegrez[0], umaMegrez[1]);
      drawAsterismLine(umaMegrez[0], umaMegrez[1], umaDubhe[0], umaDubhe[1]);
      // Handle
      drawAsterismLine(umaMegrez[0], umaMegrez[1], umaAlioth[0], umaAlioth[1]);
      drawAsterismLine(umaAlioth[0], umaAlioth[1], umaMizar[0], umaMizar[1]);
      drawAsterismLine(umaMizar[0], umaMizar[1], umaAlkaid[0], umaAlkaid[1]);

      // 3. Cassiopeia (The W)
      const casCaph = [0.15, 59.1];
      const casSchedar = [0.67, 56.5];
      const casGamma = [0.94, 60.7];
      const casRuchbah = [1.43, 60.2];
      const casSegin = [1.9, 63.6];
      
      drawAsterismLine(casCaph[0], casCaph[1], casSchedar[0], casSchedar[1]);
      drawAsterismLine(casSchedar[0], casSchedar[1], casGamma[0], casGamma[1]);
      drawAsterismLine(casGamma[0], casGamma[1], casRuchbah[0], casRuchbah[1]);
      drawAsterismLine(casRuchbah[0], casRuchbah[1], casSegin[0], casSegin[1]);

      // 4. Summer Triangle
      ctx.strokeStyle = 'rgba(253, 224, 71, 0.1)';
      ctx.setLineDash([4, 4]);
      drawAsterismLine(18.6, 38.8, 19.8, 8.9); // Vega to Altair
      drawAsterismLine(19.8, 8.9, 20.7, 45.3); // Altair to Deneb
      drawAsterismLine(20.7, 45.3, 18.6, 38.8); // Deneb to Vega
      ctx.setLineDash([]);
    }

    majorStars.forEach(star => {
      const pt = project(star.raHours, star.decDeg, w, h);
      if (!pt.visible) return;
      const starRadius = Math.max(1.5, 4 - star.mag * 0.8);
      const glow = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, starRadius * 4);
      glow.addColorStop(0, star.color);
      glow.addColorStop(0.4, `${star.color}88`);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, starRadius * 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      const baseRad = star.mag < 2 ? 2.5 : star.mag < 4 ? 1.5 : 0.8;
      ctx.arc(pt.x, pt.y, baseRad * zoom, 0, Math.PI * 2);
      ctx.fillStyle = star.color || '#fff';
      ctx.fill();
      if (showStarLabels) {
        ctx.font = '11px sans-serif';
        ctx.fillStyle = '#E2E8F0';
        ctx.textAlign = 'left';
        ctx.fillText(star.name.split(' ')[0], pt.x + 8, pt.y + 4);
      }
    });

    if (showDSO) {
      deepSkyObjects.forEach(dso => {
        const pt = project(dso.raHours, dso.decDeg, w, h);
        if (!pt.visible) return;
        ctx.strokeStyle = dso.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(pt.x, pt.y, 8, 5, Math.PI / 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.font = '10px monospace';
        ctx.fillStyle = dso.color;
        ctx.textAlign = 'left';
        ctx.fillText(dso.name.split(' ')[0], pt.x + 12, pt.y + 4);
      });
    }

    planets.forEach(pl => {
      const pt = projectAzAlt(pl.azimuthDeg, pl.altitudeDeg, w, h);
      if (!pt.visible) return;
      ctx.fillStyle = pl.colorHex;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = pl.colorHex;
      ctx.textAlign = 'left';
      ctx.fillText(`${pl.symbol} ${pl.name}`, pt.x + 10, pt.y + 4);
    });

    if (moon) {
      const pt = projectAzAlt(moon.azimuthDeg, moon.altitudeDeg, w, h);
      if (pt.visible) {
        ctx.fillStyle = '#F1F5F9';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 12, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    if (sun) {
      const pt = projectAzAlt(sun.azimuthDeg, sun.elevationDeg, w, h);
      if (pt.visible) {
        ctx.fillStyle = '#FEF08A';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 16, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (showGround) {
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      // Trace horizon from right to left (yaw + 90 to yaw - 90)
      for (let a = camera.yaw + 90; a >= camera.yaw - 90; a -= 3) {
        const pt = projectAzAlt(a, 0, w, h);
        if (a === camera.yaw + 90) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      // Follow the bottom half of the hemisphere circular mask exactly (from left edge at Math.PI to right edge at 0)
      ctx.arc(w / 2, h / 2, hemisphereRadius, Math.PI, 0, true);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let a = camera.yaw - 90; a <= camera.yaw + 90; a += 3) {
        const pt = projectAzAlt(a, 0, w, h);
        if (a === camera.yaw - 90) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
    }

    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = showGround ? 'rgba(255, 100, 100, 0.8)' : 'rgba(56, 189, 248, 0.8)';
    ctx.textAlign = 'center';
    const drawDirection = (dirName: string, az: number) => {
      const pt = projectAzAlt(az, 0, w, h);
      if (pt.visible) ctx.fillText(dirName, pt.x, pt.y - 10);
    };
    drawDirection('N', 0);
    drawDirection('E', 90);
    drawDirection('S', 180);
    drawDirection('W', 270);
    
    ctx.restore(); // Remove hemisphere clipping mask

  }, [majorStars, deepSkyObjects, planets, moon, sun, showConstellationLines, showStarLabels, showDSO, showGround, simulatedHourOffset, camera, dimensions, zoom]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setZoom(prev => Math.max(0.3, Math.min(4.0, prev - e.deltaY * 0.0015)));
    };
    const canvas = canvasRef.current;
    if (canvas) canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      if (canvas) canvas.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging.current) {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      const scale = 90 / dimensions.h;
      setCamera(prev => ({
        yaw: (prev.yaw + dx * scale + 360) % 360,
        pitch: Math.max(-90, Math.min(90, prev.pitch + dy * scale))
      }));
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    } else {
      handleCanvasHitTest(e, false);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging.current) {
      isDragging.current = false;
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
  };

  const handleCanvasHitTest = (e: React.MouseEvent | React.PointerEvent, isClick: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    let minDistance = 30 * zoom;
    let closestObj: CelestialObject | null = null;
    const timeShift = ((new Date().getHours() + simulatedHourOffset) % 24) * 15;

    const findClosest = (objects: any[], getAzAlt: (o:any) => [number, number], mapToCelestial: (o:any) => CelestialObject) => {
      objects.forEach(o => {
        const [az, alt] = getAzAlt(o);
        const pt = projectAzAlt(az, alt, dimensions.w, dimensions.h);
        if (pt.visible) {
          const dist = Math.hypot(pt.x - x, pt.y - y);
          if (dist < minDistance) {
            minDistance = dist;
            closestObj = mapToCelestial(o);
          }
        }
      });
    };

    findClosest(majorStars, s => [(s.raHours * 15 - timeShift + 360) % 360, s.decDeg], s => s);
    if (showDSO) findClosest(deepSkyObjects, d => [(d.raHours * 15 - timeShift + 360) % 360, d.decDeg], d => d);
    findClosest(planets, p => [p.azimuthDeg, p.altitudeDeg], p => ({
      id: p.id, name: p.name, type: 'planet', mag: p.magnitude, 
      raHours: (camera.yaw + (p.azimuthDeg - camera.yaw)) / 15 + timeShift / 15, decDeg: p.altitudeDeg, color: p.colorHex, 
      description: p.description, distanceAu: p.distanceAu,
      riseTime: p.riseTime, setTime: p.setTime,
      azimuthDeg: p.azimuthDeg, altitudeDeg: p.altitudeDeg,
      radiusKm: planetRadii[p.id],
      phase: p.id === 'venus' || p.id === 'mercury' ? '85%' : '100%'
    }));

    if (moon) {
      findClosest([moon], m => [m.azimuthDeg, m.altitudeDeg], m => ({
        id: 'moon', name: 'Moon', type: 'moon', mag: -12.6,
        raHours: (camera.yaw + (m.azimuthDeg - camera.yaw)) / 15 + timeShift / 15, decDeg: m.altitudeDeg, color: '#F1F5F9',
        description: `The Moon is Earth's only natural satellite. Current phase: ${m.phaseName}.`,
        distanceKm: m.distanceKm?.toString(), phase: `${m.illuminationPercent}%`,
        azimuthDeg: m.azimuthDeg, altitudeDeg: m.altitudeDeg, radiusKm: planetRadii['moon']
      } as any));
    }
    
    if (sun) {
      findClosest([sun], s => [s.azimuthDeg, s.elevationDeg], s => ({
        id: 'sun', name: 'Sun', type: 'star', mag: -26.74,
        raHours: 0, decDeg: s.elevationDeg, color: '#FEF08A',
        description: `The Sun is the star at the center of the Solar System.`,
        azimuthDeg: s.azimuthDeg, altitudeDeg: s.elevationDeg, radiusKm: '696340'
      } as any));
    }
    
    if (isClick) {
      setSelectedObject(closestObj);
    } else {
      setHoveredObject(closestObj);
    }
  };

  return (
    <div className="space-y-6" id="night-sky-dome-module">
      <div ref={fullscreenContainerRef} className={`flex flex-col bg-gradient-to-b from-slate-900 via-[#040817] to-[#020617] border border-cyan-500/20 rounded-3xl overflow-hidden shadow-2xl relative ${isFullscreen ? 'fixed inset-0 z-[100] w-screen h-screen rounded-none' : 'min-h-[500px]'}`}>
        <div className="absolute top-0 left-0 right-0 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-b from-slate-950/80 to-transparent z-10 pointer-events-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-800/80 backdrop-blur-md text-cyan-400 flex items-center justify-center font-bold shadow-lg pointer-events-auto">
              <Sparkles size={20} />
            </div>
            <div className="pointer-events-auto">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Stellarium View
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-cyan-500/20 text-cyan-300">Live</span>
              </h3>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs pointer-events-auto">
            <button
              onClick={() => setShowConstellationLines(!showConstellationLines)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all backdrop-blur-md ${showConstellationLines ? 'bg-cyan-500/30 border-cyan-500/50 text-cyan-100' : 'bg-slate-900/60 border-slate-700 text-slate-400'}`}
            >
              <Layers size={13} /> Asterisms
            </button>
            <button
              onClick={() => setShowStarLabels(!showStarLabels)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all backdrop-blur-md ${showStarLabels ? 'bg-cyan-500/30 border-cyan-500/50 text-cyan-100' : 'bg-slate-900/60 border-slate-700 text-slate-400'}`}
            >
              <Eye size={13} /> Labels
            </button>
            <button
              onClick={() => setShowDSO(!showDSO)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all backdrop-blur-md ${showDSO ? 'bg-purple-500/30 border-purple-500/50 text-purple-100' : 'bg-slate-900/60 border-slate-700 text-slate-400'}`}
            >
              <Sparkles size={13} /> Deep Sky
            </button>
            <button
              onClick={() => setShowGround(!showGround)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all backdrop-blur-md ${showGround ? 'bg-emerald-500/30 border-emerald-500/50 text-emerald-100' : 'bg-slate-900/60 border-slate-700 text-slate-400'}`}
            >
              <Mountain size={13} /> Ground
            </button>
            <button
              onClick={toggleFullscreen}
              className="px-2 py-1.5 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-300 transition-all backdrop-blur-md"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
            </button>
          </div>
        </div>
        <div ref={containerRef} className="w-full h-full flex-1 min-h-[500px] relative cursor-grab active:cursor-grabbing">
          <canvas
            ref={canvasRef}
            className="block w-full h-full touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onClick={(e) => handleCanvasHitTest(e, true)}
          />
          <div className="absolute bottom-4 left-4 bg-slate-900/60 backdrop-blur text-slate-400 text-xs px-3 py-1.5 rounded-lg border border-slate-700/50 pointer-events-none flex items-center gap-2">
            <Compass size={14} /> Drag to pan view • Click stars for info
          </div>
          {/* Floating Info Card */}
          {selectedObject && (
            <div className="absolute top-2 left-2 right-2 sm:left-auto sm:right-2 w-auto sm:w-80 bg-[#161a20]/95 border border-slate-700/50 rounded-xl shadow-2xl backdrop-blur-xl z-20 animate-fade-in pointer-events-auto flex flex-col text-slate-200 font-sans">
              
              {/* Header */}
              <div className="flex items-start justify-between p-4 pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-[0_0_15px_rgba(255,255,255,0.1)]" style={{ backgroundColor: selectedObject.type === 'planet' || selectedObject.type === 'moon' ? 'transparent' : selectedObject.color, border: selectedObject.type === 'planet' || selectedObject.type === 'moon' ? `2px solid ${selectedObject.color}` : 'none' }}>
                    {selectedObject.type === 'planet' ? <Layers size={20} color={selectedObject.color} /> : selectedObject.type === 'moon' ? '🌕' : ''}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-50 text-xl tracking-tight leading-tight">{selectedObject.name}</h4>
                    <p className="text-slate-400 text-sm capitalize">{selectedObject.type === 'dso' ? 'Deep Sky Object' : selectedObject.type}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedObject(null)} className="text-slate-400 hover:text-white p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              {/* Data Grid */}
              <div className="px-4 py-3 text-[13px] space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Magnitude</span>
                  <span className="text-slate-100">{selectedObject.mag.toFixed(2)}</span>
                </div>
                {selectedObject.distanceAu && (
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Distance</span>
                    <span className="text-slate-100">{selectedObject.distanceAu.toFixed(2)} AU</span>
                  </div>
                )}
                {selectedObject.distanceLy && (
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Distance</span>
                    <span className="text-slate-100">{selectedObject.distanceLy}</span>
                  </div>
                )}
                {selectedObject.radiusKm && (
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Radius</span>
                    <span className="text-slate-100">{selectedObject.radiusKm} Km</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Ra/Dec</span>
                  <span className="text-slate-100 flex gap-2">
                    <span>{formatCoords(selectedObject.raHours, true)}</span>
                    <span>{formatCoords(selectedObject.decDeg, false, true)}</span>
                  </span>
                </div>
                {selectedObject.azimuthDeg !== undefined && selectedObject.altitudeDeg !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Az/Alt</span>
                    <span className="text-slate-100 flex gap-2 text-[#e2e8f0]">
                      <span>{formatCoords(selectedObject.azimuthDeg, false)}</span>
                      <span>{formatCoords(selectedObject.altitudeDeg, false, true)}</span>
                    </span>
                  </div>
                )}
                {selectedObject.phase && (
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Phase</span>
                    <span className="text-slate-100">{selectedObject.phase}</span>
                  </div>
                )}
                {(selectedObject.riseTime || selectedObject.setTime) && (
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-400 font-sans">Visibility</span>
                    <span className="text-slate-100">
                      Rise: {selectedObject.riseTime || '--:--'} &nbsp; Set: {selectedObject.setTime || '--:--'}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="px-4 py-3 bg-[#1e2329]/50 border-t border-slate-700/50 rounded-b-xl">
                <p className="text-slate-300 text-sm leading-relaxed">
                  <strong className="text-white">{selectedObject.name.split(' ')[0]}</strong> {selectedObject.description?.replace(selectedObject.name.split(' ')[0], '')}
                  <a href={`https://en.wikipedia.org/wiki/${selectedObject.name.split(' ')[0]}`} target="_blank" rel="noreferrer" className="text-cyan-400 italic ml-1 hover:underline">
                    more on wikipedia
                  </a>
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="bg-slate-950/90 border-t border-slate-800/90 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-slate-300 text-xs font-bold whitespace-nowrap">
              <RotateCw size={15} className="text-cyan-400" /> Time Scrubber
            </div>
            <div className="flex-1 flex items-center gap-3 max-w-xl mx-auto w-full">
              <span className="text-[11px] font-mono text-slate-500">-6h</span>
              <input
                type="range"
                min={-6}
                max={6}
                step={0.5}
                value={simulatedHourOffset}
                onChange={(e) => onHourOffsetChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-[11px] font-mono text-slate-500">+6h</span>
            </div>
            <div className="flex items-center gap-3 min-w-[120px] justify-end">
              <span className="text-xs font-mono font-bold text-cyan-300">
                {simulatedHourOffset === 0 ? 'Live Now' : `${simulatedHourOffset > 0 ? '+' : ''}${simulatedHourOffset}h`}
              </span>
              <button
                onClick={() => onHourOffsetChange(0)}
                className="px-2.5 py-1 text-[10px] font-mono uppercase bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
