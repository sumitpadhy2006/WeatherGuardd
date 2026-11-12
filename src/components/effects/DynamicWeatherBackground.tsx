import React, { useEffect, useRef, useMemo, useState } from 'react';
import { CurrentWeatherPayload, AmbientSimulationMode, ParticleDensity } from '../../types';
import {
  computeAtmosphereState,
  getSkyPalette,
  ComputedAtmosphereState,
  SkyPalette,
} from './AtmosphereSkyEngine';
import { WeatherCharacter } from './WeatherCharacter';

interface DynamicWeatherBackgroundProps {
  weather?: CurrentWeatherPayload | null;
  simulationMode?: AmbientSimulationMode;
  enabled?: boolean;
  particleDensity?: ParticleDensity;
  reducedMotion?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color?: string;
  phase?: number;
  speed?: number;
  life?: number;
  maxLife?: number;
  length?: number;
  depth?: number; // 0 = far, 1 = mid, 2 = near
}

interface CloudLayer {
  x: number;
  y: number;
  size: number;
  vx: number;
  alpha: number;
  seed: number;
}

interface LightningFlash {
  active: boolean;
  intensity: number;
  branches: { x1: number; y1: number; x2: number; y2: number }[];
  life: number;
  isSheet: boolean;
}

interface Meteor {
  x: number;
  y: number;
  length: number;
  vx: number;
  vy: number;
  alpha: number;
  life: number;
  color?: string;
  glowColor?: string;
  thickness?: number;
}

interface Fireball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;       // 0 → 1 countdown
  length: number;
  headSize: number;
  color: { r: number; g: number; b: number };
  tailColor: { r: number; g: number; b: number };
  glowRadius: number;
}


export const DynamicWeatherBackground: React.FC<DynamicWeatherBackgroundProps> = ({
  weather,
  simulationMode = 'auto',
  enabled = true,
  particleDensity = 'high',
  reducedMotion = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute atmosphere state & palette
  const atmosphereState = useMemo<ComputedAtmosphereState>(() => {
    return computeAtmosphereState(weather, simulationMode);
  }, [weather, simulationMode]);

  const palette = useMemo<SkyPalette>(() => {
    return getSkyPalette(atmosphereState);
  }, [atmosphereState]);

  // Particle multiplier based on density
  const particleMultiplier = useMemo(() => {
    if (reducedMotion) return 0.2;
    switch (particleDensity) {
      case 'low':
        return 0.35;
      case 'medium':
        return 0.7;
      case 'ultra':
        return 1.4;
      default:
        return 1.0;
    }
  }, [particleDensity, reducedMotion]);

  // Main Canvas Render Engine
  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let isPaused = false;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleVisibilityChange = () => {
      isPaused = document.hidden;
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // ==========================================
    // INITIALIZE PARTICLES & SCENE ENTITIES
    // ==========================================
    const isNight = palette.isNight;
    const isRain =
      atmosphereState === 'light_rain' ||
      atmosphereState === 'heavy_rain' ||
      atmosphereState === 'thunderstorm' ||
      atmosphereState === 'rainy_night';
    const isSnow = atmosphereState === 'snow';
    const isFog = atmosphereState === 'fog';
    const isStorm = atmosphereState === 'thunderstorm';
    const isAurora = atmosphereState === 'aurora';
    const cloudCover = weather?.cloudCoverPercent ?? (isRain || isStorm ? 90 : isSnow ? 80 : isFog ? 85 : 25);

    // Rain / Snow particles
    let particles: Particle[] = [];
    let ripples: { x: number; y: number; r: number; maxR: number; alpha: number }[] = [];
    let lightning: LightningFlash = { active: false, intensity: 0, branches: [], life: 0, isSheet: false };
    let meteors: Meteor[] = [];
    let fireballs: Fireball[] = [];
    let stars: Particle[] = [];
    let clouds: CloudLayer[] = [];
    let fogBanks: Particle[] = [];

    let nextLightningTime = Date.now() + Math.random() * 5000 + 3000;
    let nextMeteorTime = Date.now() + Math.random() * 8000 + 4000;
    let nextFireballTime = Date.now() + Math.random() * 18000 + 12000;

    // 1. Stars (Visible at night / twilight when clouds permit)
    const starCount = Math.floor(180 * particleMultiplier * (1 - Math.min(0.85, cloudCover / 120)));
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * (height * 0.75),
        vx: 0,
        vy: 0,
        size: Math.random() * 1.7 + 0.4,
        alpha: Math.random() * 0.8 + 0.2,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.025 + 0.008,
      });
    }

    // 2. Parallax Multi-layer Clouds
    const cloudCount = Math.max(
      4,
      Math.floor((cloudCover / 100) * 16 * particleMultiplier)
    );
    for (let i = 0; i < cloudCount; i++) {
      const depth = i % 3; // 0 = far, 1 = mid, 2 = near
      clouds.push({
        x: Math.random() * (width + 400) - 200,
        y: Math.random() * (height * 0.45) + (depth * 25),
        size: (Math.random() * 140 + 160) * (depth === 0 ? 0.8 : depth === 1 ? 1.1 : 1.4),
        vx: (depth === 0 ? 0.08 : depth === 1 ? 0.16 : 0.26) * (Math.random() * 0.4 + 0.8),
        alpha: (depth === 0 ? 0.25 : depth === 1 ? 0.35 : 0.45) * Math.min(1, cloudCover / 40 + 0.2),
        seed: Math.random(),
      });
    }

    // 3. Fog Banks (Rolling Gaussian layers)
    if (isFog) {
      const fogCount = Math.floor(14 * particleMultiplier);
      for (let i = 0; i < fogCount; i++) {
        fogBanks.push({
          x: Math.random() * width,
          y: height * 0.35 + Math.random() * (height * 0.55),
          vx: Math.random() * 0.25 + 0.1,
          vy: (Math.random() - 0.5) * 0.02,
          size: Math.random() * 260 + 180,
          alpha: Math.random() * 0.18 + 0.1,
        });
      }
    }

    // 4. Precipitation Particles (Multi-depth rain / snow)
    if (isRain) {
      const rainCount = Math.floor(
        (atmosphereState === 'heavy_rain' || isStorm ? 220 : 130) * particleMultiplier
      );
      // Wind shear
      const windSpeed = weather?.windSpeed || 15;
      const windDeg = weather?.windDeg || 240;
      const windRad = (windDeg * Math.PI) / 180;
      const windXComponent = Math.sin(windRad) * (windSpeed / 12);

      for (let i = 0; i < rainCount; i++) {
        const depth = i % 3; // 0 = far (light mist), 1 = mid, 2 = near (fast drop)
        particles.push({
          x: Math.random() * (width + 200) - 100,
          y: Math.random() * height,
          vx: windXComponent + (Math.random() - 0.5) * 0.5,
          vy: depth === 0 ? Math.random() * 12 + 14 : depth === 1 ? Math.random() * 16 + 20 : Math.random() * 20 + 26,
          size: depth === 0 ? 0.75 : depth === 1 ? 1.2 : 1.6,
          length: depth === 0 ? 12 : depth === 1 ? 22 : 32,
          alpha: depth === 0 ? 0.25 : depth === 1 ? 0.45 : 0.65,
          depth,
        });
      }
    } else if (isSnow) {
      const snowCount = Math.floor(140 * particleMultiplier);
      for (let i = 0; i < snowCount; i++) {
        const depth = i % 3;
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 1.5,
          vy: depth === 0 ? Math.random() * 1.0 + 0.8 : depth === 1 ? Math.random() * 1.6 + 1.2 : Math.random() * 2.4 + 1.8,
          size: depth === 0 ? 1.5 : depth === 1 ? 2.8 : 4.2,
          alpha: depth === 0 ? 0.35 : depth === 1 ? 0.6 : 0.85,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.02 + 0.01,
          depth,
        });
      }
    }

    // Recursive Lightning Bolt Builder
    const createLightningBranches = (startX: number, startY: number) => {
      const branches: { x1: number; y1: number; x2: number; y2: number }[] = [];
      let curX = startX;
      let curY = startY;
      const targetY = height * (0.55 + Math.random() * 0.3);

      while (curY < targetY) {
        const nextX = curX + (Math.random() - 0.5) * 70;
        const nextY = curY + Math.random() * 40 + 15;
        branches.push({ x1: curX, y1: curY, x2: nextX, y2: nextY });

        // Secondary branching
        if (Math.random() < 0.4) {
          let bX = curX;
          let bY = curY;
          for (let j = 0; j < 3; j++) {
            const nbX = bX + (Math.random() - 0.3) * 55;
            const nbY = bY + Math.random() * 25 + 12;
            branches.push({ x1: bX, y1: bY, x2: nbX, y2: nbY });
            bX = nbX;
            bY = nbY;
          }
        }
        curX = nextX;
        curY = nextY;
      }
      return branches;
    };

    let tick = 0;

    // ==========================================
    // MAIN RENDERING LOOP
    // ==========================================
    const render = () => {
      if (isPaused) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      tick++;
      ctx.clearRect(0, 0, width, height);
      const now = Date.now();

      // ----------------------------------------------------
      // 1. SKY GRADIENT (Calculated high-dynamic range blend)
      // ----------------------------------------------------
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, palette.top);
      skyGrad.addColorStop(0.35, palette.mid);
      skyGrad.addColorStop(0.75, palette.bottom);
      skyGrad.addColorStop(1, palette.horizon);

      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // ----------------------------------------------------
      // 2. CELESTIAL BODIES: Sun / Moon
      // ----------------------------------------------------
      if (!isNight && atmosphereState !== 'heavy_rain' && !isStorm) {
        // Sun Positioning
        const sunX = width * 0.8;
        const sunY =
          atmosphereState === 'sunrise' || atmosphereState === 'sunset'
            ? height * 0.38
            : atmosphereState === 'golden_hour'
            ? height * 0.26
            : height * 0.16;

        const sunRadius = Math.min(width * 0.45, 380);

        // Multi-stop Corona Bloom
        const sunGrad = ctx.createRadialGradient(sunX, sunY, 12, sunX, sunY, sunRadius);
        sunGrad.addColorStop(0, palette.sunGlow);
        sunGrad.addColorStop(0.25, palette.sunGlow.replace(/[\d.]+\)$/, '0.15)'));
        sunGrad.addColorStop(0.65, palette.sunGlow.replace(/[\d.]+\)$/, '0.04)'));
        sunGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
        ctx.fill();

        // Direct Sun Disc
        const discGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 32);
        discGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        discGrad.addColorStop(0.5, 'rgba(255, 248, 220, 0.7)');
        discGrad.addColorStop(1, 'rgba(255, 220, 150, 0)');
        ctx.fillStyle = discGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 32, 0, Math.PI * 2);
        ctx.fill();

        // Rotating Crepuscular Rays
        if (!reducedMotion && cloudCover < 70) {
          ctx.save();
          ctx.translate(sunX, sunY);
          ctx.rotate(tick * 0.0006);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.018)';
          for (let r = 0; r < 8; r++) {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, 750, (r * Math.PI) / 4 - 0.07, (r * Math.PI) / 4 + 0.07);
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();
        }
      } else if (isNight && atmosphereState !== 'heavy_rain' && !isStorm) {
        // Moon & Lunar Glow
        const moonX = width * 0.82;
        const moonY = height * 0.18;
        const moonRadius = 24;

        // Lunar Corona
        const moonGlow = ctx.createRadialGradient(moonX, moonY, 15, moonX, moonY, 180);
        moonGlow.addColorStop(0, 'rgba(224, 231, 255, 0.28)');
        moonGlow.addColorStop(0.4, 'rgba(199, 210, 254, 0.08)');
        moonGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = moonGlow;
        ctx.beginPath();
        ctx.arc(moonX, moonY, 180, 0, Math.PI * 2);
        ctx.fill();

        // Moon Disk with Lunar Phase Shading
        ctx.fillStyle = '#f1f5f9';
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
        ctx.fill();

        // Moon Crater Shading
        ctx.fillStyle = 'rgba(148, 163, 184, 0.35)';
        ctx.beginPath();
        ctx.arc(moonX - 5, moonY - 4, 5, 0, Math.PI * 2);
        ctx.arc(moonX + 6, moonY - 6, 4, 0, Math.PI * 2);
        ctx.arc(moonX + 2, moonY + 7, 6, 0, Math.PI * 2);
        ctx.arc(moonX - 7, moonY + 6, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Phase shadow mask (Crescent / Quarter effect based on illumination)
        const moonIllum = weather?.celestial?.moonIlluminationPercent ?? 75;
        if (moonIllum < 90) {
          ctx.fillStyle = 'rgba(11, 19, 43, 0.78)';
          ctx.beginPath();
          ctx.arc(moonX - moonRadius * (1 - moonIllum / 100), moonY, moonRadius * 1.05, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ----------------------------------------------------
      // 3. STARS & METEORS (Clear / Twilight night skies)
      // ----------------------------------------------------
      if ((isNight || palette.isSunriseSunset) && stars.length > 0) {
        stars.forEach((s) => {
          s.phase = (s.phase || 0) + (s.speed || 0.018);
          const currentAlpha = s.alpha * (0.6 + 0.4 * Math.sin(s.phase));
          ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fill();
        });

        // Shooting stars / Meteors in clear night skies
        if (!reducedMotion && now > nextMeteorTime && !isRain && !isStorm) {
          meteors.push({
            x: Math.random() * (width * 0.8) + width * 0.1,
            y: Math.random() * (height * 0.35),
            length: Math.random() * 80 + 50,
            vx: Math.random() * 14 + 16,
            vy: Math.random() * 7 + 8,
            alpha: 1,
            life: 1,
          });
          nextMeteorTime = now + Math.random() * 7000 + 4000;
        }

        for (let m = meteors.length - 1; m >= 0; m--) {
          const meteor = meteors[m];
          meteor.x += meteor.vx;
          meteor.y += meteor.vy;
          meteor.life -= 0.038;

          if (meteor.life <= 0) {
            meteors.splice(m, 1);
            continue;
          }

          const tailX = meteor.x - (meteor.vx / 18) * meteor.length;
          const tailY = meteor.y - (meteor.vy / 18) * meteor.length;

          const grad = ctx.createLinearGradient(meteor.x, meteor.y, tailX, tailY);
          grad.addColorStop(0, `rgba(255, 255, 255, ${meteor.life * 0.95})`);
          grad.addColorStop(0.4, `rgba(186, 230, 253, ${meteor.life * 0.6})`);
          grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

          ctx.strokeStyle = grad;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(meteor.x, meteor.y);
          ctx.lineTo(tailX, tailY);
          ctx.stroke();
        }

        // ── LARGE COLORFUL FIREBALL METEORS ──
        const fireballColors: { r: number; g: number; b: number; tr: number; tg: number; tb: number }[] = [
          { r: 60,  g: 210, b: 255, tr: 30,  tg: 100, tb: 180 }, // electric blue
          { r: 255, g: 180, b: 40,  tr: 200, tg: 80,  tb: 10  }, // orange fireball
          { r: 80,  g: 255, b: 120, tr: 20,  tg: 160, tb: 60  }, // bright green
          { r: 255, g: 240, b: 80,  tr: 200, tg: 140, tb: 20  }, // yellow-white
        ];
        if (!reducedMotion && now > nextFireballTime && !isRain && !isStorm) {
          const pick = fireballColors[Math.floor(Math.random() * fireballColors.length)];
          const angle = (Math.random() * 30 + 20) * (Math.PI / 180); // 20–50° steep diagonal
          const speed = Math.random() * 10 + 14;
          fireballs.push({
            x: Math.random() * width * 0.7 + width * 0.1,
            y: Math.random() * height * 0.25,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1.0,
            length: Math.random() * 200 + 150,
            headSize: Math.random() * 5 + 5,
            color: { r: pick.r, g: pick.g, b: pick.b },
            tailColor: { r: pick.tr, g: pick.tg, b: pick.tb },
            glowRadius: Math.random() * 20 + 18,
          });
          nextFireballTime = now + Math.random() * 22000 + 14000;
        }

        for (let f = fireballs.length - 1; f >= 0; f--) {
          const fb = fireballs[f];
          fb.x += fb.vx;
          fb.y += fb.vy;
          fb.life -= 0.022;

          if (fb.life <= 0) {
            fireballs.splice(f, 1);
            continue;
          }

          const a = fb.life;
          const { r, g, b } = fb.color;
          const { r: tr, g: tg, b: tb } = fb.tailColor;

          // Compute tail start (behind head)
          const speed = Math.sqrt(fb.vx ** 2 + fb.vy ** 2);
          const nx = fb.vx / speed;
          const ny = fb.vy / speed;
          const tailX = fb.x - nx * fb.length * a;
          const tailY = fb.y - ny * fb.length * a;

          // Outer glow halo around head
          const haloGrad = ctx.createRadialGradient(fb.x, fb.y, 0, fb.x, fb.y, fb.glowRadius * 2.5);
          haloGrad.addColorStop(0,   `rgba(${r},${g},${b},${a * 0.55})`);
          haloGrad.addColorStop(0.4, `rgba(${r},${g},${b},${a * 0.18})`);
          haloGrad.addColorStop(1,   `rgba(${r},${g},${b},0)`);
          ctx.fillStyle = haloGrad;
          ctx.beginPath();
          ctx.arc(fb.x, fb.y, fb.glowRadius * 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Tapered tail - wide at head, vanishes at tip
          const tailGrad = ctx.createLinearGradient(fb.x, fb.y, tailX, tailY);
          tailGrad.addColorStop(0,   `rgba(255,255,255,${a * 0.95})`);
          tailGrad.addColorStop(0.1, `rgba(${r},${g},${b},${a * 0.85})`);
          tailGrad.addColorStop(0.45, `rgba(${r},${g},${b},${a * 0.50})`);
          tailGrad.addColorStop(0.75, `rgba(${tr},${tg},${tb},${a * 0.25})`);
          tailGrad.addColorStop(1,   `rgba(${tr},${tg},${tb},0)`);

          // Draw tapered path - thick at head, thin at tail
          ctx.save();
          ctx.strokeStyle = tailGrad;
          ctx.lineWidth = fb.headSize * a;
          ctx.lineCap = 'round';
          ctx.shadowColor = `rgba(${r},${g},${b},${a * 0.8})`;
          ctx.shadowBlur = fb.glowRadius;
          ctx.beginPath();
          ctx.moveTo(fb.x, fb.y);
          ctx.lineTo(tailX, tailY);
          ctx.stroke();
          ctx.restore();

          // Bright white hot core at head
          const headGrad = ctx.createRadialGradient(fb.x, fb.y, 0, fb.x, fb.y, fb.headSize * a);
          headGrad.addColorStop(0, `rgba(255,255,255,${a})`);
          headGrad.addColorStop(0.5, `rgba(${r},${g},${b},${a * 0.8})`);
          headGrad.addColorStop(1, `rgba(${r},${g},${b},0)`);
          ctx.fillStyle = headGrad;
          ctx.beginPath();
          ctx.arc(fb.x, fb.y, fb.headSize * a, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ----------------------------------------------------
      // 4. AURORA BOREALIS (Green & Violet Ion Curtains)
      // ----------------------------------------------------
      if (isAurora && !reducedMotion) {
        for (let r = 0; r < 3; r++) {
          ctx.save();
          const t = tick * 0.007 + r * 1.4;
          const baseHeight = height * (0.14 + r * 0.07);

          ctx.beginPath();
          ctx.moveTo(0, baseHeight);
          for (let x = 0; x <= width; x += 30) {
            const yOffset = Math.sin(x * 0.0035 + t) * 35 + Math.cos(x * 0.007 - t * 0.8) * 20;
            ctx.lineTo(x, baseHeight + yOffset);
          }
          ctx.lineTo(width, height * 0.62);
          ctx.lineTo(0, height * 0.62);
          ctx.closePath();

          const auroraGrad = ctx.createLinearGradient(0, baseHeight - 60, 0, height * 0.62);
          if (r === 0) {
            auroraGrad.addColorStop(0, 'rgba(52, 211, 153, 0)');
            auroraGrad.addColorStop(0.45, 'rgba(16, 185, 129, 0.22)');
            auroraGrad.addColorStop(0.85, 'rgba(6, 182, 212, 0.1)');
            auroraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          } else if (r === 1) {
            auroraGrad.addColorStop(0, 'rgba(6, 182, 212, 0)');
            auroraGrad.addColorStop(0.45, 'rgba(56, 189, 248, 0.18)');
            auroraGrad.addColorStop(0.8, 'rgba(168, 85, 247, 0.12)');
            auroraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          } else {
            auroraGrad.addColorStop(0, 'rgba(192, 132, 252, 0)');
            auroraGrad.addColorStop(0.5, 'rgba(217, 70, 239, 0.15)');
            auroraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          }

          ctx.fillStyle = auroraGrad;
          ctx.fill();
          ctx.restore();
        }
      }

      // ----------------------------------------------------
      // 5. PARALLAX DRIFTING CLOUDS
      // ----------------------------------------------------
      if (clouds.length > 0) {
        clouds.forEach((c) => {
          c.x += c.vx;
          if (c.x - c.size > width) c.x = -c.size * 1.5;

          const cGrad = ctx.createRadialGradient(c.x, c.y, 10, c.x, c.y, c.size);
          cGrad.addColorStop(0, palette.cloudColor);
          cGrad.addColorStop(0.6, palette.cloudColor.replace(/[\d.]+\)$/, '0.25)'));
          cGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.fillStyle = cGrad;
          ctx.beginPath();
          ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
          ctx.fill();

          // Cloud top highlight if day / sunset
          if (!isNight) {
            const hGrad = ctx.createRadialGradient(c.x, c.y - c.size * 0.25, 5, c.x, c.y, c.size * 0.7);
            hGrad.addColorStop(0, palette.cloudHighlight);
            hGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = hGrad;
            ctx.beginPath();
            ctx.arc(c.x, c.y - c.size * 0.25, c.size * 0.6, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }

      // ----------------------------------------------------
      // 6. FOG & MIST DRIFTING LAYERS
      // ----------------------------------------------------
      if (isFog && fogBanks.length > 0) {
        fogBanks.forEach((f) => {
          f.x += f.vx;
          if (f.x - f.size > width) f.x = -f.size;

          const fogGrad = ctx.createRadialGradient(f.x, f.y, 20, f.x, f.y, f.size);
          fogGrad.addColorStop(0, `rgba(203, 213, 225, ${f.alpha})`);
          fogGrad.addColorStop(0.6, `rgba(148, 163, 184, ${f.alpha * 0.4})`);
          fogGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.fillStyle = fogGrad;
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // ----------------------------------------------------
      // 7. THUNDERSTORM & LIGHTNING FLASHES
      // ----------------------------------------------------
      if (isStorm && !reducedMotion) {
        if (now > nextLightningTime && !lightning.active) {
          const isSheetFlash = Math.random() < 0.65; // Sheet vs Bolt
          lightning = {
            active: true,
            intensity: Math.random() * 0.7 + 0.3,
            branches: isSheetFlash ? [] : createLightningBranches(Math.random() * (width * 0.7) + width * 0.15, 0),
            life: 1,
            isSheet: isSheetFlash,
          };
          nextLightningTime = now + Math.random() * 6000 + 3500;
        }

        if (lightning.active) {
          // Dynamic sky ambient illumination
          const flashAlpha = lightning.intensity * 0.26 * lightning.life;
          ctx.fillStyle = `rgba(224, 231, 255, ${flashAlpha})`;
          ctx.fillRect(0, 0, width, height);

          // Draw bolt if branching
          if (!lightning.isSheet && lightning.branches.length > 0) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${lightning.life * 0.95})`;
            ctx.lineWidth = 2.4;
            ctx.shadowColor = 'rgba(168, 85, 247, 0.85)';
            ctx.shadowBlur = 14;

            ctx.beginPath();
            lightning.branches.forEach((b) => {
              ctx.moveTo(b.x1, b.y1);
              ctx.lineTo(b.x2, b.y2);
            });
            ctx.stroke();
            ctx.shadowBlur = 0;
          }

          lightning.life -= 0.095;
          if (lightning.life <= 0) {
            lightning.active = false;
          }
        }
      }

      // ----------------------------------------------------
      // 8. PRECIPITATION PARTICLES: RAIN & SNOW
      // ----------------------------------------------------
      if (isRain) {
        // Draw Raindrops
        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;

          if (p.y > height) {
            // Ground impact ripple
            if (Math.random() < 0.2) {
              ripples.push({
                x: p.x,
                y: height - Math.random() * 25,
                r: 1,
                maxR: Math.random() * 12 + 6,
                alpha: 0.5,
              });
            }
            p.y = -20;
            p.x = Math.random() * width;
          }

          const tailX = p.x - p.vx * 0.7;
          const tailY = p.y - (p.length || 20);

          ctx.strokeStyle = `rgba(186, 230, 253, ${p.alpha})`;
          ctx.lineWidth = p.size;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(tailX, tailY);
          ctx.stroke();
        });

        // Draw Ground Splash Ripples
        for (let rip = ripples.length - 1; rip >= 0; rip--) {
          const r = ripples[rip];
          r.r += 0.55;
          r.alpha -= 0.032;

          if (r.alpha <= 0 || r.r >= r.maxR) {
            ripples.splice(rip, 1);
            continue;
          }

          ctx.strokeStyle = `rgba(186, 230, 253, ${r.alpha * 0.45})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.ellipse(r.x, r.y, r.r * 2.2, r.r * 0.6, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (isSnow) {
        // Draw Snowflakes with soft 3D drift
        particles.forEach((p) => {
          p.phase = (p.phase || 0) + (p.speed || 0.015);
          p.x += p.vx + Math.sin(p.phase) * 0.9;
          p.y += p.vy;

          if (p.y > height + 10) {
            p.y = -10;
            p.x = Math.random() * width;
          }

          const snowGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          snowGrad.addColorStop(0, `rgba(255, 255, 255, ${p.alpha})`);
          snowGrad.addColorStop(0.6, `rgba(224, 242, 254, ${p.alpha * 0.7})`);
          snowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

          ctx.fillStyle = snowGrad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, [enabled, atmosphereState, palette, particleMultiplier, reducedMotion, weather]);

  if (!enabled) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transition-colors duration-1000">
      {/* Canvas Layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Atmospheric Horizon Light & Depth Blur */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/40 via-black/15 to-transparent pointer-events-none" />

      {/* Subtle Scenic Horizon Weather Companion Observer */}
      <div className="absolute bottom-4 right-8 sm:right-16 hidden md:block opacity-60 hover:opacity-100 transition-opacity pointer-events-auto">
        <WeatherCharacter weather={weather} state={atmosphereState} size="sm" />
      </div>
    </div>
  );
};
