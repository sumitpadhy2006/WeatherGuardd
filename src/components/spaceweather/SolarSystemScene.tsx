import React, { useRef, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { PlanetPropagationData } from '../../utils/solarSystemPropagation';
import { getRealtimePlanetAngle } from '../../utils/realtimeOrbits';

interface SolarSystemSceneProps {
  isActive: boolean;
  planetaryPropagation: PlanetPropagationData[];
  selectedPlanet: PlanetPropagationData | null;
  setSelectedPlanet: (planet: PlanetPropagationData | null) => void;
  isPaused?: boolean;
}

export const PauseContext = React.createContext(false);
export const objectPositions: Record<string, THREE.Vector3> = {};

const FlareParticle = ({ phi, theta, phase, speed, maxHeight, size }: any) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const baseRadius = 4.45; // slightly inside so they erupt from within
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    // Bouncing eruption effect using absolute sine wave
    const height = Math.abs(Math.sin(t * speed + phase)) * maxHeight;
    const r = baseRadius + height;
    
    // Spherical to cartesian
    const x = r * Math.sin(theta) * Math.cos(phi);
    const y = r * Math.sin(theta) * Math.sin(phi);
    const z = r * Math.cos(theta);
    
    meshRef.current.position.set(x, y, z);
    
    const material = meshRef.current.material as THREE.MeshBasicMaterial;
    if (material) {
      material.opacity = 1 - (height / maxHeight) * 0.8;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[size, 8, 8]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={1} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  );
};

const VolcanicFlares = ({ isActive }: { isActive: boolean }) => {
  const flares = useMemo(() => {
    const count = isActive ? 150 : 30; // More flares if active
    return Array.from({ length: count }).map(() => ({
      phi: Math.random() * Math.PI * 2,
      theta: Math.acos((Math.random() * 2) - 1),
      phase: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 1.5,
      maxHeight: isActive ? (0.2 + Math.random() * 1.5) : (0.1 + Math.random() * 0.4),
      size: 0.02 + Math.random() * 0.06
    }));
  }, [isActive]);

  return (
    <group>
      {flares.map((f, i) => (
        <FlareParticle key={i} {...f} />
      ))}
    </group>
  );
};

const Sun = ({ 
  isActive,
  onSunClick
}: { 
  isActive: boolean;
  onSunClick: () => void;
}) => {
  const sunRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const sunTexture = useLoader(THREE.TextureLoader, '/textures/sun_map.jpg');
  
  const worldPos = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (sunRef.current) {
      sunRef.current.rotation.y += 0.002;
      sunRef.current.getWorldPosition(worldPos);
      objectPositions['sun'] = worldPos.clone();
    }
    // Very subtle slow pulsation for emissive intensity, not a heartbeat
    if (materialRef.current) {
      const baseIntensity = isActive ? 2.5 : 1.2;
      materialRef.current.emissiveIntensity = baseIntensity + Math.sin(time * 0.5) * 0.1;
    }
  });

  return (
    <group 
      position={[-16, 0, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSunClick();
      }}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'default'; }}
    >
      {/* The actual Sun sphere */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[4.5, 64, 64]} />
        <meshStandardMaterial 
          ref={materialRef}
          map={sunTexture}
          emissiveMap={sunTexture}
          emissive={new THREE.Color('#ffffff')} 
          emissiveIntensity={isActive ? 2.5 : 1.2}
          color={new THREE.Color('#ffffff')}
          roughness={1}
        />
      </mesh>

      {/* Sun glow / Corona */}
      <mesh>
        <sphereGeometry args={[4.8, 32, 32]} />
        <meshBasicMaterial 
          color={isActive ? "#ffaa00" : "#ff8800"} 
          transparent 
          opacity={isActive ? 0.4 : 0.2} 
          blending={THREE.AdditiveBlending} 
          depthWrite={false}
        />
      </mesh>

      {/* A massive outer glow for atmosphere */}
      <mesh>
        <sphereGeometry args={[6.5, 32, 32]} />
        <meshBasicMaterial 
          color="#ff4400" 
          transparent 
          opacity={0.05} 
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Central light source for the solar system */}
      <pointLight 
        color={isActive ? "#ffffff" : "#ffaa00"} 
        intensity={isActive ? 1000 : 600} 
        distance={150} 
        decay={1.5} 
      />

      {/* Stunning Realistic Solar Flare Eruption */}
      <VolcanicFlares isActive={isActive} />
    </group>
  );
};

const PLANET_SIZES: Record<string, number> = {
  sun: 4.5,
  mercury: 0.1,
  venus: 0.2,
  earth: 0.22,
  moon: 0.05,
  mars: 0.18,
  jupiter: 0.8,
  saturn: 0.7,
  uranus: 0.5,
  neptune: 0.48
};

const PLANET_DISTANCES: Record<string, number> = {
  sun: -16,
  mercury: -9,
  venus: -6.5,
  earth: -3.5,
  mars: -0.5,
  jupiter: 5,
  saturn: 11,
  uranus: 17,
  neptune: 22
};

const CameraController = ({ selectedPlanetId }: { selectedPlanetId: string | null }) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  
  const targetPos = useRef(new THREE.Vector3());
  const cameraTargetPos = useRef(new THREE.Vector3());
  const isAnimating = useRef(false);

  useEffect(() => {
    if (controlsRef.current && selectedPlanetId) {
      let targetId = selectedPlanetId.toLowerCase();
      
      const pSize = PLANET_SIZES[targetId] || 1;
      const isMoon = !PLANET_SIZES[targetId] && targetId !== 'sun';
      const optimalDist = targetId === 'sun' ? 18 : (isMoon ? 0.3 : pSize * 3);
      
      const pos = objectPositions[targetId] || new THREE.Vector3(-16, 0, 0);
      targetPos.current.copy(pos);
      
      const dir = new THREE.Vector3().subVectors(camera.position, controlsRef.current.target).normalize();
      if (dir.lengthSq() === 0) dir.set(0, 0, 1);
      
      cameraTargetPos.current.copy(targetPos.current).add(dir.multiplyScalar(optimalDist));
      isAnimating.current = true;
    }
  }, [selectedPlanetId, camera]);

  useFrame((_, delta) => {
    if (selectedPlanetId) {
      const targetId = selectedPlanetId.toLowerCase();
      if (objectPositions[targetId]) {
        targetPos.current.copy(objectPositions[targetId]);
      }
    }

    if (isAnimating.current && controlsRef.current) {
      // Smooth exponential decay lerp for buttery camera movement
      const speed = 4 * delta;
      
      controlsRef.current.target.lerp(targetPos.current, speed);
      camera.position.lerp(cameraTargetPos.current, speed);
      controlsRef.current.update();
      
      if (
        controlsRef.current.target.distanceTo(targetPos.current) < 0.05 && 
        camera.position.distanceTo(cameraTargetPos.current) < 0.05
      ) {
        isAnimating.current = false;
      }
    } else if (!isAnimating.current && controlsRef.current && selectedPlanetId) {
      // Keep tracking the object if we are focused on it
      controlsRef.current.target.copy(targetPos.current);
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls 
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={0.5}
      maxDistance={150}
      onStart={() => { isAnimating.current = false; }} // Stop animation if user grabs the camera!
    />
  );
};

const AsteroidBelt = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 2500;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    if (!meshRef.current) return;
    for (let i = 0; i < count; i++) {
      // Mars is at radius 15.5, Jupiter is at 21. Asteroid belt between 16.8 and 19.2
      const radius = 16.8 + Math.random() * 2.4;
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      // Slight vertical distribution
      const y = (Math.random() - 0.5) * 1.2;
      
      // Local position relative to the Sun
      dummy.position.set(x, y, z);
      dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      
      const scale = Math.random() * 0.04 + 0.01;
      dummy.scale.set(scale, scale, scale);
      
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [dummy]);

  const isPaused = React.useContext(PauseContext);

  useFrame(() => {
    if (!isPaused && meshRef.current) {
      meshRef.current.rotation.y += 0.0005;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} position={[-16, 0, 0]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#64748b" roughness={0.9} />
    </instancedMesh>
  );
};

interface PlanetaryRingsProps {
  size: number;
  count: number;
  color: string;
  tilt: number; // in radians
  isSaturn?: boolean;
}

const PlanetaryRings = ({ size, count, color, tilt, isSaturn = false }: PlanetaryRingsProps) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    if (!meshRef.current) return;
    for (let i = 0; i < count; i++) {
      let radius;
      if (isSaturn) {
        // Group particles into distinct rings with gaps (like Cassini division)
        const rand = Math.random();
        if (rand < 0.5) {
          // Inner dense ring
          radius = size * 1.6 + Math.random() * (size * 0.4);
        } else if (rand < 0.85) {
          // Outer ring, separated by a gap
          radius = size * 2.1 + Math.random() * (size * 0.3);
        } else {
          // Outermost faint thin ring
          radius = size * 2.5 + Math.random() * (size * 0.15);
        }
      } else {
        // Thin faint ring for Jupiter/Uranus/Neptune
        radius = size * 1.5 + Math.random() * (size * 0.3);
      }
      
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = (Math.random() - 0.5) * 0.05;
      
      dummy.position.set(x, y, z);
      dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      
      const pScale = isSaturn ? (Math.random() * 0.015 + 0.005) : (Math.random() * 0.008 + 0.002);
      dummy.scale.set(pScale, pScale, pScale);
      
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [dummy, size, count, isSaturn]);

  const isPaused = React.useContext(PauseContext);

  useFrame(() => {
    if (!isPaused && meshRef.current) {
      meshRef.current.rotation.y -= 0.002;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} rotation={[tilt, 0, -tilt]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color={color} roughness={0.7} />
    </instancedMesh>
  );
};

const SatelliteSprite = ({ 
  moonId, 
  name,
  radiusKm,
  distanceScale,
  orbitSpeed,
  color,
  ext,
  onMoonClick 
}: {
  moonId: string;
  name: string;
  radiusKm: number;
  distanceScale: number;
  orbitSpeed: number;
  color: string;
  ext?: string;
  onMoonClick?: (moonId?: string) => void;
}) => {
  const orbitRef = useRef<THREE.Group>(null);
  
  // Base scale on Earth's Moon (3474 km) which has a visual size factor of ~0.055.
  // We'll scale up everything by 1.5x so they are easier to see and click on.
  const visualSize = (radiusKm / 3474) * 0.055 * 1.5;
  
  const texture = useLoader(THREE.TextureLoader, `/textures/moons/${moonId}.${ext || 'png'}`);

  const isPaused = React.useContext(PauseContext);
  const spriteRef = useRef<THREE.Sprite>(null);
  const worldPos = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    if (spriteRef.current) {
      spriteRef.current.getWorldPosition(worldPos);
      objectPositions[moonId.toLowerCase()] = worldPos.clone();
    }
    if (!isPaused && orbitRef.current) {
      orbitRef.current.rotation.y += orbitSpeed;
    }
  });

  return (
    <group ref={orbitRef}>
      {/* Orbital ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[distanceScale, distanceScale + 0.02, 64]} />
        <meshBasicMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.1} />
      </mesh>
      
      {/* 2D Moon Sprite facing the camera */}
      <sprite 
        ref={spriteRef}
        position={[distanceScale, 0, 0]}
        scale={[visualSize, visualSize, 1]}
        onClick={(e) => {
          e.stopPropagation();
          if (onMoonClick) onMoonClick(moonId);
        }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'default'; }}
      >
        <spriteMaterial map={texture} transparent opacity={1} />
        <Html position={[0, -visualSize - 0.2, 0]} center>
          <div 
            className="text-[5px] font-mono font-bold tracking-widest uppercase transition-colors whitespace-nowrap text-slate-400 cursor-pointer hover:text-white"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
            onClick={(e) => {
              e.stopPropagation();
              if (onMoonClick) onMoonClick(moonId);
            }}
          >
            {name}
          </div>
        </Html>
      </sprite>
    </group>
  );
};

const Planet = ({ 
  planet, 
  index, 
  isSelected, 
  onClick,
  onMoonClick,
  isActive
}: { 
  planet: PlanetPropagationData; 
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onMoonClick?: (moonId?: string) => void;
  isActive: boolean;
}) => {
  const planetRef = useRef<THREE.Mesh>(null);
  const moonOrbitRef = useRef<THREE.Group>(null);
  const phobosOrbitRef = useRef<THREE.Group>(null);
  const deimosOrbitRef = useRef<THREE.Group>(null);
  
  const xPos = PLANET_DISTANCES[planet.id.toLowerCase()] || 0;
  const size = PLANET_SIZES[planet.id.toLowerCase()] || 0.2;
  
  const r = Math.abs(xPos - (-16));
  
  // Fetch exactly where this planet is right now in real life!
  const angle = useMemo(() => getRealtimePlanetAngle(planet.id as any), [planet.id]);
  
  const finalX = -16 + Math.cos(angle) * r;
  const finalZ = Math.sin(angle) * r;

  const isPaused = React.useContext(PauseContext);
  const worldPos = useMemo(() => new THREE.Vector3(), []);
  const earthMoonRef = useRef<THREE.Mesh>(null);
  const phobosRef = useRef<THREE.Mesh>(null);
  const deimosRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (planetRef.current) {
      planetRef.current.getWorldPosition(worldPos);
      objectPositions[planet.id.toLowerCase()] = worldPos.clone();
    }
    if (earthMoonRef.current) {
      earthMoonRef.current.getWorldPosition(worldPos);
      objectPositions['moon'] = worldPos.clone();
    }
    if (phobosRef.current) {
      phobosRef.current.getWorldPosition(worldPos);
      objectPositions['phobos'] = worldPos.clone();
    }
    if (deimosRef.current) {
      deimosRef.current.getWorldPosition(worldPos);
      objectPositions['deimos'] = worldPos.clone();
    }

    if (isPaused) return;
    if (planetRef.current) {
      planetRef.current.rotation.y += 0.01;
    }
    if (moonOrbitRef.current) {
      moonOrbitRef.current.rotation.y += 0.02;
    }
    if (phobosOrbitRef.current) {
      phobosOrbitRef.current.rotation.y += 0.03;
    }
    if (deimosOrbitRef.current) {
      deimosOrbitRef.current.rotation.y += 0.015;
    }
  });

  const textureUrl = planet.id.toLowerCase() === 'earth'
    ? 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg'
    : `/textures/${planet.id.toLowerCase()}_map.jpg`;
  
  const texture = useLoader(THREE.TextureLoader, textureUrl);
  const moonTexture = useLoader(THREE.TextureLoader, 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg');

  return (
    <group position={[finalX, 0, finalZ]}>
      {/* Orbital Curve visualization */}
      <mesh position={[-finalX - 16, 0, -finalZ]} rotation={[Math.PI / 2, 0, 0]}>
         <ringGeometry args={[r, r + 0.05, 128]} />
         <meshBasicMaterial color="#334155" side={THREE.DoubleSide} transparent opacity={0.3} />
      </mesh>
      
      <mesh 
        ref={planetRef} 
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'default'; }}
        scale={isSelected ? 1.5 : 1}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial 
          map={texture}
          roughness={0.8}
          metalness={0.1}
          emissive={isSelected ? planet.colorHex : '#000000'}
          emissiveIntensity={isSelected ? 0.3 : 0}
        />
        {isSelected && (
          <mesh>
            <sphereGeometry args={[size + 0.05, 32, 32]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.2} side={THREE.BackSide} />
          </mesh>
        )}
      </mesh>
      
      {planet.id.toLowerCase() === 'jupiter' && (
        <group>
          <PlanetaryRings size={size} count={800} color="#78350f" tilt={3 * (Math.PI / 180)} />
          <SatelliteSprite moonId="io" name="Io" radiusKm={3643} distanceScale={size * 1.8} orbitSpeed={0.015} color="#fcd34d" onMoonClick={onMoonClick} />
          <SatelliteSprite moonId="europa" name="Europa" radiusKm={3122} distanceScale={size * 2.2} orbitSpeed={0.012} color="#e2e8f0" onMoonClick={onMoonClick} />
          <SatelliteSprite moonId="ganymede" name="Ganymede" radiusKm={5268} distanceScale={size * 2.8} orbitSpeed={0.008} color="#cbd5e1" onMoonClick={onMoonClick} />
          <SatelliteSprite moonId="callisto" name="Callisto" radiusKm={4821} distanceScale={size * 3.5} orbitSpeed={0.005} color="#94a3b8" onMoonClick={onMoonClick} />
        </group>
      )}
      {planet.id.toLowerCase() === 'saturn' && (
        <group>
          <PlanetaryRings size={size} count={3000} color="#e2d2a9" tilt={28 * (Math.PI / 180)} isSaturn={true} />
          <SatelliteSprite moonId="mimas" name="Mimas" radiusKm={396} distanceScale={size * 2.7} orbitSpeed={0.016} color="#94a3b8" onMoonClick={onMoonClick} />
          <SatelliteSprite moonId="enceladus" name="Enceladus" radiusKm={504} distanceScale={size * 3.2} orbitSpeed={0.014} color="#e2e8f0" onMoonClick={onMoonClick} />
          <SatelliteSprite moonId="rhea" name="Rhea" radiusKm={1528} distanceScale={size * 3.8} orbitSpeed={0.010} color="#cbd5e1" onMoonClick={onMoonClick} />
          <SatelliteSprite moonId="titan" name="Titan" radiusKm={5150} distanceScale={size * 4.5} orbitSpeed={0.006} color="#fb923c" onMoonClick={onMoonClick} />
          <SatelliteSprite moonId="iapetus" name="Iapetus" radiusKm={1436} distanceScale={size * 5.2} orbitSpeed={0.003} color="#f8fafc" onMoonClick={onMoonClick} />
        </group>
      )}
      {planet.id.toLowerCase() === 'uranus' && (
        <group>
          <PlanetaryRings size={size} count={1000} color="#94a3b8" tilt={98 * (Math.PI / 180)} />
          <SatelliteSprite moonId="miranda" name="Miranda" radiusKm={470} distanceScale={size * 1.5} orbitSpeed={0.015} color="#e2e8f0" onMoonClick={onMoonClick} />
          <SatelliteSprite moonId="titania" name="Titania" radiusKm={1578} distanceScale={size * 2.2} orbitSpeed={0.009} color="#cbd5e1" onMoonClick={onMoonClick} />
          <SatelliteSprite moonId="oberon" name="Oberon" radiusKm={1523} distanceScale={size * 2.8} orbitSpeed={0.006} color="#94a3b8" onMoonClick={onMoonClick} />
        </group>
      )}
      {planet.id.toLowerCase() === 'neptune' && (
        <group>
          <PlanetaryRings size={size} count={900} color="#3b82f6" tilt={28 * (Math.PI / 180)} />
          <SatelliteSprite moonId="triton" name="Triton" radiusKm={2706} distanceScale={size * 2.0} orbitSpeed={-0.010} color="#bfdbfe" onMoonClick={onMoonClick} />
        </group>
      )}

      {planet.id.toLowerCase() === 'mars' && (
        <group>
          {/* Phobos */}
          <group ref={phobosOrbitRef}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[size * 1.5, size * 1.52, 32]} />
              <meshBasicMaterial color="#ef4444" side={THREE.DoubleSide} transparent opacity={0.15} />
            </mesh>
            <mesh 
              ref={phobosRef}
              position={[size * 1.5, 0, 0]}
              scale={[1.2, 0.9, 1.0]} // Potato shape
              onClick={(e) => {
                e.stopPropagation();
                if (onMoonClick) onMoonClick('phobos');
              }}
              onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
              onPointerOut={() => { document.body.style.cursor = 'default'; }}
            >
              <dodecahedronGeometry args={[size * 0.18, 0]} />
              <meshStandardMaterial color="#8b5a2b" roughness={0.9} />
              <Html position={[0, -size * 0.18 - 0.2, 0]} center>
                <div 
                  className="text-[6px] font-mono font-bold tracking-widest uppercase transition-colors whitespace-nowrap text-slate-400 hover:text-red-400 cursor-pointer"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onMoonClick) onMoonClick('phobos');
                  }}
                >
                  Phobos
                </div>
              </Html>
            </mesh>
          </group>

          {/* Deimos */}
          <group ref={deimosOrbitRef}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[size * 2.8, size * 2.82, 32]} />
              <meshBasicMaterial color="#fca5a5" side={THREE.DoubleSide} transparent opacity={0.15} />
            </mesh>
            <mesh 
              ref={deimosRef}
              position={[size * 2.2, 0, 0]}
              scale={[1.1, 0.8, 0.9]} // Potato shape
              onClick={(e) => {
                e.stopPropagation();
                if (onMoonClick) onMoonClick('deimos');
              }}
              onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
              onPointerOut={() => { document.body.style.cursor = 'default'; }}
            >
              <dodecahedronGeometry args={[size * 0.12, 0]} />
              <meshStandardMaterial color="#b0a69a" roughness={0.9} />
              <Html position={[0, -size * 0.12 - 0.2, 0]} center>
                <div 
                  className="text-[6px] font-mono font-bold tracking-widest uppercase transition-colors whitespace-nowrap text-slate-400 hover:text-red-300 cursor-pointer"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onMoonClick) onMoonClick('deimos');
                  }}
                >
                  Deimos
                </div>
              </Html>
            </mesh>
          </group>
        </group>
      )}

      {planet.id.toLowerCase() === 'earth' && (
        <group ref={moonOrbitRef}>
          {/* Orbital path of the moon (faint) */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[size * 2.5, size * 2.52, 32]} />
            <meshBasicMaterial color="#94a3b8" side={THREE.DoubleSide} transparent opacity={0.15} />
          </mesh>
          <mesh 
            ref={earthMoonRef}
            position={[size * 2.5, 0, 0]}
            onClick={(e) => {
              e.stopPropagation();
              if (onMoonClick) onMoonClick('moon');
            }}
            onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { document.body.style.cursor = 'default'; }}
          >
            <sphereGeometry args={[size * 0.25, 16, 16]} />
            <meshStandardMaterial map={moonTexture} roughness={0.9} metalness={0.1} />
            <Html position={[0, -size * 0.25 - 0.3, 0]} center>
              <div 
                className="text-[6px] font-mono font-bold tracking-widest uppercase transition-colors whitespace-nowrap text-slate-400 hover:text-slate-200 cursor-pointer"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onMoonClick) onMoonClick('moon');
                }}
              >
                Moon
              </div>
            </Html>
          </mesh>
        </group>
      )}
      
      {/* HTML Label */}
      <Html position={[0, -size - 0.5, 0]} center occlude>
        <div 
          className={`text-[9px] font-mono font-bold tracking-widest uppercase transition-colors whitespace-nowrap ${isSelected ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
          style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
          onClick={(e) => { e.stopPropagation(); onClick(); }}
        >
          {planet.name}
        </div>
      </Html>
    </group>
  );
};

export const SolarSystemScene: React.FC<SolarSystemSceneProps> = ({
  isActive,
  planetaryPropagation,
  selectedPlanet,
  setSelectedPlanet,
  isPaused = false
}) => {
  return (
    <div className="absolute inset-0 z-0 cursor-move">
      <Canvas camera={{ position: [0, 0, 24], fov: 45 }}>
        <PauseContext.Provider value={isPaused}>
        <Suspense fallback={<Html center className="text-white font-mono text-xs">Loading Textures...</Html>}>
          <CameraController selectedPlanetId={selectedPlanet?.id || null} />
          <ambientLight intensity={0.5} />
        <Sun 
          isActive={isActive} 
          onSunClick={() => {
            const sunData = planetaryPropagation.find(p => p.id === 'sun');
            if (sunData) setSelectedPlanet(sunData);
          }}
        />
        <AsteroidBelt />
        
        {planetaryPropagation.filter(p => !['moon', 'sun', 'phobos', 'deimos', 'ganymede', 'callisto', 'io', 'europa', 'titan', 'rhea', 'iapetus', 'enceladus', 'mimas', 'titania', 'oberon', 'miranda', 'triton'].includes(p.id)).map((planet, index) => (
          <Planet 
            key={planet.id} 
            planet={planet} 
            index={index} 
            isSelected={selectedPlanet?.id === planet.id}
            onClick={() => setSelectedPlanet(planet)}
            onMoonClick={(moonId = 'moon') => {
              const moonData = planetaryPropagation.find(p => p.id === moonId);
              if (moonData) setSelectedPlanet(moonData);
            }}
            isActive={isActive}
          />
        ))}
        
        {/* Simple stars background inside canvas for better depth */}
        <group>
          {Array.from({ length: 200 }).map((_, i) => (
            <mesh 
              key={i} 
              position={[
                (Math.random() - 0.5) * 60, 
                (Math.random() - 0.5) * 60, 
                -20 - Math.random() * 20
              ]}
            >
              <sphereGeometry args={[0.05, 4, 4]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={Math.random() * 0.8 + 0.2} />
            </mesh>
          ))}
        </group>
        </Suspense>
        </PauseContext.Provider>
      </Canvas>
    </div>
  );
};
