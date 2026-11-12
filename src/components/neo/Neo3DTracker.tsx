import React, { useMemo, useRef, useState, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { NearEarthObject } from '../../types/neo';

const LD_SCALE = 5; // 1 LD = 5 units
const AU_DISTANCE = 35; // Compressed AU distance for visibility

// --- Sun Component ---
const Sun = ({ onFocus }: { onFocus: () => void }) => {
  const texture = useLoader(THREE.TextureLoader, '/textures/sun_map.jpg');
  const sunRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame(() => {
    if (sunRef.current) sunRef.current.rotation.y += 0.002;
  });

  return (
    <group>
      <mesh 
        ref={sunRef}
        onClick={(e) => { e.stopPropagation(); onFocus(); }}
        onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
      >
        <sphereGeometry args={[4.5, 64, 64]} />
        <meshBasicMaterial map={texture} />
      </mesh>
      
      {/* Sun glow */}
      <mesh>
        <sphereGeometry args={[hovered ? 5.6 : 5.2, 32, 32]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={hovered ? 0.25 : 0.15} blending={THREE.AdditiveBlending} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      
      <pointLight color="#fff4e0" intensity={1200} distance={350} decay={1.0} />
      
      <Html position={[0, -5.5, 0]} center className="pointer-events-none">
        <span className="text-[12px] font-bold text-amber-300 font-mono drop-shadow-md">Sun</span>
      </Html>
    </group>
  );
};

// --- Earth System (Earth, Moon, and NEOs) ---
const EarthSystem = ({ 
  maxDistanceFilterLd, 
  asteroids, 
  onSelectAsteroid,
  focusedAsteroidId,
  focusedBody,
  onAsteroidWorldPos,
  onBodyWorldPos,
  onBodyFocus,
}: { 
  maxDistanceFilterLd: number,
  asteroids: NearEarthObject[],
  onSelectAsteroid: (ast: NearEarthObject) => void,
  focusedAsteroidId?: string,
  focusedBody: 'earth' | 'moon' | null,
  onAsteroidWorldPos: (pos: THREE.Vector3) => void,
  onBodyWorldPos: (pos: THREE.Vector3) => void,
  onBodyFocus: (body: 'earth' | 'moon') => void,
}) => {
  const earthTexture = useLoader(THREE.TextureLoader, 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg');
  const moonTexture = useLoader(THREE.TextureLoader, 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg');
  
  const systemRef = useRef<THREE.Group>(null);
  const earthRef = useRef<THREE.Mesh>(null);
  const moonRef = useRef<THREE.Mesh>(null);
  const [hoveredBody, setHoveredBody] = useState<string | null>(null);
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (earthRef.current) earthRef.current.rotation.y += 0.005;
    if (systemRef.current) {
      const orbitSpeed = 0.02;
      systemRef.current.position.x = AU_DISTANCE * Math.cos(t * orbitSpeed);
      systemRef.current.position.z = AU_DISTANCE * Math.sin(t * orbitSpeed);
    }
    // Report tracked body world position every frame
    if (focusedBody === 'earth' && earthRef.current) {
      const wp = new THREE.Vector3();
      earthRef.current.getWorldPosition(wp);
      onBodyWorldPos(wp);
    } else if (focusedBody === 'moon' && moonRef.current) {
      const wp = new THREE.Vector3();
      moonRef.current.getWorldPosition(wp);
      onBodyWorldPos(wp);
    }
  });

  return (
    <group ref={systemRef} position={[AU_DISTANCE, 0, 0]}>
      {/* Earth */}
      <mesh 
        ref={earthRef}
        onClick={(e) => { e.stopPropagation(); onBodyFocus('earth'); }}
        onPointerOver={(e) => { e.stopPropagation(); setHoveredBody('earth'); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHoveredBody(null); document.body.style.cursor = 'auto'; }}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial map={earthTexture} roughness={0.8} metalness={0.1} />
      </mesh>
      {/* Glow ring when hovered */}
      {hoveredBody === 'earth' && (
        <mesh>
          <sphereGeometry args={[1.15, 32, 32]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.18} side={THREE.BackSide} />
        </mesh>
      )}
      
      {/* Earth Atmosphere Glow */}
      <mesh>
        <sphereGeometry args={[1.05, 32, 32]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.15} side={THREE.BackSide} />
      </mesh>

      <Html position={[0, -1.8, 0]} center className="pointer-events-none">
        <span className="text-[10px] font-bold text-white font-mono drop-shadow-md">Earth</span>
      </Html>

      {/* Lunar Orbit Ring */}
      {maxDistanceFilterLd >= 1 && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[LD_SCALE, LD_SCALE + 0.03, 64]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.15} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Moon */}
      {maxDistanceFilterLd >= 1 && (
        <group position={[LD_SCALE, 0, 0]}>
          <mesh 
            ref={moonRef}
            onClick={(e) => { e.stopPropagation(); onBodyFocus('moon'); }}
            onPointerOver={(e) => { e.stopPropagation(); setHoveredBody('moon'); document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { setHoveredBody(null); document.body.style.cursor = 'auto'; }}
          >
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshStandardMaterial map={moonTexture} roughness={0.9} />
          </mesh>
          {hoveredBody === 'moon' && (
            <mesh>
              <sphereGeometry args={[0.35, 16, 16]} />
              <meshBasicMaterial color="#94a3b8" transparent opacity={0.2} side={THREE.BackSide} />
            </mesh>
          )}
          {maxDistanceFilterLd <= 5 && (
            <Html position={[0, -0.6, 0]} center className="pointer-events-none">
              <span className="text-[8px] font-bold text-slate-300 font-mono drop-shadow-md">Moon</span>
            </Html>
          )}
        </group>
      )}

      {/* Asteroids plotted relative to Earth */}
      {asteroids.map((ast, idx) => (
        <AsteroidMesh 
          key={ast.id} 
          ast={ast} 
          index={idx} 
          onSelect={onSelectAsteroid} 
          isFocused={ast.id === focusedAsteroidId}
          onWorldPos={ast.id === focusedAsteroidId ? onAsteroidWorldPos : undefined}
        />
      ))}
    </group>
  );
};

// --- Asteroid Meshes ---
interface AsteroidMeshProps {
  ast: NearEarthObject;
  index: number;
  onSelect: (ast: NearEarthObject) => void;
  isFocused: boolean;
  onWorldPos?: (pos: THREE.Vector3) => void;
}

// Simple seeded pseudo-random: returns value 0..1
const seededRand = (seed: number) => {
  const s = Math.sin(seed) * 43758.5453123;
  return s - Math.floor(s);
};

const AsteroidMesh: React.FC<AsteroidMeshProps> = ({ ast, index, onSelect, isFocused, onWorldPos }) => {
  const ref = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  const ld = ast.hazardScore.closestMissDistanceLd;
  const isHazardous = ast.is_potentially_hazardous_asteroid;
  const isSubLunar = ld < 1.0;

  const radius = ld * LD_SCALE;
  const phi = (index * 137.5) * (Math.PI / 180); 
  const theta = (index * 57) * (Math.PI / 180);
  
  const orbitSpeed = (1 / Math.max(1, radius)) * 0.2 + 0.05; 
  const randomOffset = index * 10;

  const estimatedMeters = ast.estimated_diameter.meters.estimated_diameter_max;
  const scaledSize = Math.max(0.18, Math.min(0.8, estimatedMeters / 250));

  // Solid sphere base with very gentle surface bumps — no spikes, stays opaque
  const rockGeo = useMemo(() => {
    // Sphere is inherently solid and round — no hollow-crystal look
    const geo = new THREE.SphereGeometry(scaledSize, 12, 10);
    const pos = geo.attributes.position;
    
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const len = Math.sqrt(x * x + y * y + z * z) || 0.001;
      
      // Very conservative displacement: ±10% for surface roughness only
      const s1 = index * 300 + i * 5;
      const s2 = index * 300 + i * 11;
      const bump = (seededRand(s1) - 0.5) * 0.18   // large gentle bumps
                 + (seededRand(s2) - 0.5) * 0.06;   // small micro-roughness

      const disp = 1.0 + bump; // stays between ~0.88 and ~1.12 of radius
      pos.setXYZ(i,
        (x / len) * scaledSize * disp,
        (y / len) * scaledSize * disp,
        (z / len) * scaledSize * disp
      );
    }
    
    geo.computeVertexNormals();
    return geo;
  }, [index, scaledSize]);

  // Non-uniform scale = elongated potato/peanut shapes (not spheres)
  const scale = useMemo(() => {
    const sx = 0.8 + seededRand(index * 31) * 0.9;   // 0.8 → 1.7
    const sy = 0.5 + seededRand(index * 37) * 0.55;  // 0.5 → 1.05 (flattened)
    const sz = 0.7 + seededRand(index * 43) * 0.75;  // 0.7 → 1.45
    return new THREE.Vector3(sx, sy, sz);
  }, [index]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() + randomOffset;
    // Slow tumbling rotation like real asteroids
    ref.current.rotation.x = t * 0.18;
    ref.current.rotation.y = t * 0.12;
    ref.current.rotation.z = t * 0.07;
    
    ref.current.position.x = radius * Math.sin(phi) * Math.cos(theta + t * orbitSpeed);
    ref.current.position.z = radius * Math.sin(phi) * Math.sin(theta + t * orbitSpeed);
    ref.current.position.y = radius * Math.cos(phi);

    if (isFocused && onWorldPos) {
      const worldPos = new THREE.Vector3();
      ref.current.getWorldPosition(worldPos);
      onWorldPos(worldPos);
    }
  });

  let labelBorder = isFocused ? 'border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'border-slate-700/50';
  if (isHazardous && !isFocused) labelBorder = 'border-amber-500/40';
  else if (isSubLunar && !isFocused) labelBorder = 'border-cyan-400/40';

  // Slightly warm grey (real C-type asteroids are dark grey, S-type are lighter)
  const baseColor = isHazardous ? '#a0988a' : '#8a8a8a';

  return (
    <mesh
      ref={ref}
      geometry={rockGeo}
      scale={scale}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(ast);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Opaque rock material: flatShading for visible facets, roughness=1 for matte dusty rock */}
      <meshStandardMaterial 
        color={baseColor}
        roughness={1.0}
        metalness={0.0}
        flatShading={true}
        transparent={false}
        opacity={1}
        side={THREE.FrontSide}
      />
      {/* Always-on label */}
      <Html zIndexRange={[100, 0]} className="pointer-events-none" style={{ transform: 'translate3d(10px, -10px, 0)' }}>
        <div className={`transition-all duration-300 ${hovered || isFocused ? 'opacity-100 scale-110 z-10' : 'opacity-70 scale-100'}`}>
          <div className={`text-[9px] font-bold text-white whitespace-nowrap bg-slate-950/60 px-1.5 py-0.5 rounded border backdrop-blur-md flex items-center gap-1 ${labelBorder}`}>
            {ast.name}
            {isHazardous && <span className="text-[7px] text-amber-400">⚠️</span>}
          </div>
        </div>
      </Html>
    </mesh>
  );
};

// --- Continuous tracking: keeps OrbitControls.target locked on tracked object every frame ---
const ContinuousTracker = ({
  trackedPosRef,
  controlsRef,
  isActive
}: {
  trackedPosRef: React.MutableRefObject<THREE.Vector3 | null>,
  controlsRef: React.MutableRefObject<any>,
  isActive: boolean
}) => {
  useFrame(() => {
    if (!isActive || !trackedPosRef.current || !controlsRef.current) return;
    // Smoothly keep OrbitControls target on the tracked object
    // This lets the user still orbit around the object via mouse
    controlsRef.current.target.lerp(trackedPosRef.current, 0.12);
  });
  return null;
};

// --- Camera capture ---
const CameraCapture = ({ cameraRef }: { cameraRef: React.MutableRefObject<THREE.Camera | null> }) => {
  useFrame(({ camera }) => {
    if (!cameraRef.current) cameraRef.current = camera;
  });
  return null;
};

// --- Main 3D Tracker Component ---
export const Neo3DTracker: React.FC<{
  asteroids: NearEarthObject[];
  onSelectAsteroid: (ast: NearEarthObject) => void;
  maxDistanceFilterLd: number;
  focusedAsteroidId?: string;
}> = ({ asteroids, onSelectAsteroid, maxDistanceFilterLd, focusedAsteroidId }) => {

  const controlsRef = useRef<any>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  // Single unified ref for the tracked world position (asteroid OR body)
  const trackedPosRef = useRef<THREE.Vector3 | null>(null);
  const hasFlewIn = useRef<string>('');
  // focusedBody: 'sun' | 'earth' | 'moon' | null (separate from asteroid)
  const [focusedBody, setFocusedBody] = useState<'sun' | 'earth' | 'moon' | null>(null);

  // One-time smooth fly-in animation (called once per new target)
  const flyTo = (endPos: THREE.Vector3, offsetDist = 5) => {
    if (!controlsRef.current || !cameraRef.current) return;
    const controls = controlsRef.current;
    const camera = cameraRef.current;
    const startCamPos = camera.position.clone();
    const startTarget = controls.target.clone();
    const dir = camera.position.clone().sub(endPos).normalize();
    const endCamPos = endPos.clone().add(dir.multiplyScalar(offsetDist));
    let progress = 0;
    let raf: number;
    const animate = () => {
      progress = Math.min(progress + 0.022, 1);
      const t = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      camera.position.lerpVectors(startCamPos, endCamPos, t);
      controls.target.lerpVectors(startTarget, endPos, t);
      controls.update();
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
  };

  // Called every frame by AsteroidMesh when focused
  const handleAsteroidWorldPos = (pos: THREE.Vector3) => {
    trackedPosRef.current = pos.clone();
    // Fire fly-in once per asteroid selection
    if (hasFlewIn.current !== focusedAsteroidId) {
      hasFlewIn.current = focusedAsteroidId || '';
      flyTo(pos, 4);
    }
  };

  // Called every frame by EarthSystem when earth or moon is focused
  const handleBodyWorldPos = (pos: THREE.Vector3) => {
    trackedPosRef.current = pos.clone();
  };

  // Earth/Moon focus handler — clicking again defocuses
  const handleBodyFocus = (body: 'earth' | 'moon') => {
    if (focusedBody === body) {
      // Toggle off: release focus
      setFocusedBody(null);
      bodyFlyDone.current = '';
      trackedPosRef.current = null;
      return;
    }
    setFocusedBody(body);
    hasFlewIn.current = '';
  };

  // Track if we've flown to a body
  const bodyFlyDone = useRef<string>('');
  const handleBodyWorldPosWithFlyIn = (pos: THREE.Vector3) => {
    trackedPosRef.current = pos.clone();
    if (bodyFlyDone.current !== focusedBody) {
      bodyFlyDone.current = focusedBody || '';
      flyTo(pos, focusedBody === 'moon' ? 1.5 : focusedBody === 'earth' ? 4 : 15);
    }
  };

  // Sun focus handler — clicking again defocuses
  const handleSunFocus = () => {
    if (focusedBody === 'sun') {
      setFocusedBody(null);
      bodyFlyDone.current = '';
      trackedPosRef.current = null;
      return;
    }
    setFocusedBody('sun');
    trackedPosRef.current = new THREE.Vector3(0, 0, 0);
    bodyFlyDone.current = 'sun';
    flyTo(new THREE.Vector3(0, 0, 0), 12);
  };

  // Clear all focus when clicking empty space
  const handleBackgroundClick = () => {
    if (focusedBody) {
      setFocusedBody(null);
      bodyFlyDone.current = '';
      trackedPosRef.current = null;
    }
  };

  // When asteroid deselected and no body focused, fly back to Earth area
  useEffect(() => {
    if (!focusedAsteroidId && focusedBody === null) {
      hasFlewIn.current = '';
      trackedPosRef.current = null;
      const controls = controlsRef.current;
      const camera = cameraRef.current;
      if (controls && camera) {
        const startCamPos = camera.position.clone();
        const startTarget = controls.target.clone();
        const endTarget = new THREE.Vector3(AU_DISTANCE, 0, 0);
        const endCamPos = new THREE.Vector3(AU_DISTANCE, 20, AU_DISTANCE + 30);
        let progress = 0; let raf: number;
        const animate = () => {
          progress = Math.min(progress + 0.02, 1);
          const t = 1 - Math.pow(1 - progress, 3);
          camera.position.lerpVectors(startCamPos, endCamPos, t);
          controls.target.lerpVectors(startTarget, endTarget, t);
          controls.update();
          if (progress < 1) raf = requestAnimationFrame(animate);
        };
        raf = requestAnimationFrame(animate);
      }
    }
  }, [focusedAsteroidId, focusedBody]);

  // When asteroid selected, clear body focus
  useEffect(() => {
    if (focusedAsteroidId) {
      setFocusedBody(null);
      bodyFlyDone.current = '';
    }
  }, [focusedAsteroidId]);

  const isTracking = !!(focusedAsteroidId || focusedBody);

  const displayedAsteroids = useMemo(() => {
    return asteroids
      .filter((a) => a.hazardScore.closestMissDistanceLd <= maxDistanceFilterLd)
      .slice(0, 60);
  }, [asteroids, maxDistanceFilterLd]);

  const earthOrbitPoints = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(angle) * AU_DISTANCE, 0, Math.sin(angle) * AU_DISTANCE));
    }
    return pts;
  }, []);

  return (
    <div className="absolute inset-0 z-0 cursor-move">
      <Canvas 
        camera={{ position: [AU_DISTANCE, maxDistanceFilterLd * LD_SCALE * 0.8, AU_DISTANCE + maxDistanceFilterLd * LD_SCALE * 1.5], fov: 45 }}
        onPointerMissed={handleBackgroundClick}
      >
        <color attach="background" args={['#020617']} />
        
        <Suspense fallback={null}>
          <ambientLight intensity={0.2} />
          <Stars radius={100} depth={50} count={4000} factor={4} saturation={0} fade speed={1} />

          <CameraCapture cameraRef={cameraRef} />
          <ContinuousTracker 
            trackedPosRef={trackedPosRef} 
            controlsRef={controlsRef} 
            isActive={isTracking} 
          />
          
          <OrbitControls 
            ref={controlsRef}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            target={[AU_DISTANCE, 0, 0]}
            maxDistance={80}
            minDistance={0.5}
          />

          <Sun onFocus={handleSunFocus} />
          
          <Line 
            points={earthOrbitPoints}
            color="#38bdf8"
            lineWidth={1}
            transparent
            opacity={0.15}
          />

          <EarthSystem 
            maxDistanceFilterLd={maxDistanceFilterLd} 
            asteroids={displayedAsteroids} 
            onSelectAsteroid={onSelectAsteroid} 
            focusedAsteroidId={focusedAsteroidId}
            focusedBody={focusedBody === 'earth' || focusedBody === 'moon' ? focusedBody : null}
            onAsteroidWorldPos={handleAsteroidWorldPos}
            onBodyWorldPos={handleBodyWorldPosWithFlyIn}
            onBodyFocus={handleBodyFocus}
          />
          
        </Suspense>
      </Canvas>
    </div>
  );
};
