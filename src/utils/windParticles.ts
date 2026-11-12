/**
 * High-Performance HTML5 Canvas Wind Particle Overlay Engine
 * Synchronized with MapLibre GL viewport transformations.
 */

export interface WindVector {
  u: number; // West-to-East component (m/s)
  v: number; // South-to-North component (m/s)
  speedKmh: number;
}

export interface Particle {
  x: number;
  y: number;
  age: number;
  maxAge: number;
  speed: number;
}

export class WindParticleLayer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private animationFrameId: number | null = null;
  private particles: Particle[] = [];
  private maxParticles = 1200;
  private map: any = null;
  private isRunning = false;
  private speedFactor = 1.0;
  private colorMode: 'cyan' | 'speed' | 'marine' = 'cyan';

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  public setMap(map: any) {
    this.map = map;
    this.resize();
  }

  public setSpeedFactor(factor: number) {
    this.speedFactor = Math.max(0.2, Math.min(3.0, factor));
  }

  public setColorMode(mode: 'cyan' | 'speed' | 'marine') {
    this.colorMode = mode;
  }

  public resize() {
    if (!this.canvas || !this.map) return;
    const container = this.map.getContainer();
    const width = container.clientWidth;
    const height = container.clientHeight;
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    if (this.ctx) {
      this.ctx.scale(dpr, dpr);
    }

    this.initParticles(width, height);
  }

  private initParticles(width: number, height: number) {
    this.particles = [];
    const count = Math.min(this.maxParticles, Math.round((width * height) / 800));
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        age: Math.floor(Math.random() * 80),
        maxAge: 60 + Math.floor(Math.random() * 60),
        speed: 1.0,
      });
    }
  }

  /**
   * Calculate atmospheric wind vector (u, v) for a given geographic lon/lat
   * Uses realistic planetary atmospheric cells + cyclone eddies
   */
  public getWindVector(lon: number, lat: number, timestampOffsetHours: number = 0): WindVector {
    const latRad = (lat * Math.PI) / 180;
    const lonRad = (lon * Math.PI) / 180;
    const timeT = (Date.now() / 1000 / 3600 + timestampOffsetHours) * 0.15;

    // Atmospheric global circulation bands:
    // Hadley cell (Trade winds): -30 to 30 -> Easterlies (u < 0)
    // Ferrel cell (Westerlies): 30 to 60 -> Westerlies (u > 0)
    // Polar cell: 60 to 90 -> Easterlies (u < 0)
    let baseU = Math.sin(latRad * 2.8) * 12;
    let baseV = Math.cos(latRad * 1.5) * 3;

    // Rossby planetary wave meanders
    const wave1 = Math.sin(lonRad * 3 + timeT + latRad * 2) * 8;
    const wave2 = Math.cos(lonRad * 5 - timeT * 0.8) * 6;

    // Regional cyclonic vortex simulation in mid-latitudes
    const cycloneX = Math.sin(timeT * 0.3) * 60;
    const cycloneY = 45 + Math.cos(timeT * 0.2) * 15;
    const dx = lon - cycloneX;
    const dy = lat - cycloneY;
    const distSq = dx * dx + dy * dy;
    let cycloneU = 0;
    let cycloneV = 0;
    if (distSq < 1600) {
      const angle = Math.atan2(dy, dx);
      const intensity = Math.exp(-distSq / 600) * 18;
      cycloneU = -Math.sin(angle) * intensity;
      cycloneV = Math.cos(angle) * intensity;
    }

    const u = baseU + wave1 + cycloneU;
    const v = baseV + wave2 + cycloneV;
    const speedMs = Math.sqrt(u * u + v * v);
    const speedKmh = Math.round(speedMs * 3.6);

    return { u, v, speedKmh };
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.animate();
  }

  public stop() {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  private animate = () => {
    if (!this.isRunning || !this.ctx || !this.map) return;

    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;

    // Semi-transparent fade effect for smooth streamline persistence
    this.ctx.fillStyle = 'rgba(6, 10, 20, 0.90)';
    this.ctx.globalCompositeOperation = 'destination-in';
    this.ctx.fillRect(0, 0, width, height);
    this.ctx.globalCompositeOperation = 'source-over';

    const bounds = this.map.getBounds();
    if (!bounds) {
      this.animationFrameId = requestAnimationFrame(this.animate);
      return;
    }

    this.ctx.lineWidth = 1.2;
    this.ctx.lineCap = 'round';

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // Convert screen pixel position to Geographic Coordinate
      const lngLat = this.map.unproject([p.x, p.y]);
      const wind = this.getWindVector(lngLat.lng, lngLat.lat);

      // Convert wind velocity (m/s) to screen displacement pixels
      const stepFactor = 0.45 * this.speedFactor;
      const nextX = p.x + wind.u * stepFactor;
      const nextY = p.y - wind.v * stepFactor; // Screen Y is inverted vs latitude

      // Color based on wind speed or theme
      let strokeColor = 'rgba(56, 189, 248, 0.75)'; // Cyan
      if (this.colorMode === 'speed') {
        if (wind.speedKmh > 75) strokeColor = 'rgba(239, 68, 68, 0.9)'; // Red
        else if (wind.speedKmh > 45) strokeColor = 'rgba(245, 158, 11, 0.85)'; // Amber
        else if (wind.speedKmh > 25) strokeColor = 'rgba(34, 197, 94, 0.8)'; // Green
        else strokeColor = 'rgba(56, 189, 248, 0.7)'; // Cyan
      } else if (this.colorMode === 'marine') {
        strokeColor = 'rgba(45, 212, 191, 0.8)'; // Teal
      }

      this.ctx.strokeStyle = strokeColor;
      this.ctx.beginPath();
      this.ctx.moveTo(p.x, p.y);
      this.ctx.lineTo(nextX, nextY);
      this.ctx.stroke();

      p.x = nextX;
      p.y = nextY;
      p.age++;

      // Respawn particle if expired or out of bounds
      if (p.age > p.maxAge || p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
        p.x = Math.random() * width;
        p.y = Math.random() * height;
        p.age = 0;
        p.maxAge = 50 + Math.floor(Math.random() * 60);
      }
    }

    this.animationFrameId = requestAnimationFrame(this.animate);
  };
}
