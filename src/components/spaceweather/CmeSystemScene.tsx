import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { Html, OrbitControls, Line } from '@react-three/drei';
import * as THREE from 'three';
import { CmeItem } from '../../types/spaceweather';

interface CmeSystemSceneProps {
  latestCme: CmeItem | null;
}

const FlareParticle = ({ phi, theta, phase, speed, maxHeight, size }: any) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const baseRadius = 4.45;
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    const height = Math.abs(Math.sin(t * speed + phase)) * maxHeight;
    const r = baseRadius + height;
    
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

const VolcanicFlares = () => {
  const flares = React.useMemo(() => {
    return Array.from({ length: 40 }).map(() => ({
      phi: Math.random() * Math.PI * 2,
      theta: Math.acos((Math.random() * 2) - 1),
      phase: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 1.5,
      maxHeight: 0.1 + Math.random() * 0.4,
      size: 0.02 + Math.random() * 0.06
    }));
  }, []);

  return (
    <group>
      {flares.map((f, i) => (
        <FlareParticle key={i} {...f} />
      ))}
    </group>
  );
};

const AnimatedLoop = ({ points, color, lineWidth, dashed, opacity, dashSize, gapSize }: any) => {
  const lineRef = useRef<any>(null);
  
  useFrame(() => {
    if (lineRef.current && dashed && lineRef.current.material) {
      lineRef.current.material.dashOffset -= 0.02;
    }
  });
  
  return (
    <Line
      ref={lineRef}
      points={points}
      color={color}
      lineWidth={lineWidth}
      transparent
      opacity={opacity}
      blending={THREE.AdditiveBlending}
      depthWrite={false}
      dashed={dashed}
      dashScale={1}
      dashSize={dashSize}
      gapSize={gapSize}
    />
  );
};

const InterplanetaryMagneticField = () => {
  const lines = [];
  const numLines = 36;
  
  // 1. Lines that funnel to the Earth's poles
  for (let i = 0; i < numLines; i++) {
     const theta = (i / numLines) * Math.PI * 2; 
     const spreadFactor = 0.02 + (i % 6) * 0.04; 
     
     const points = [];
     const startX = 4.2; // Start exactly at the solar flare location
     const earthXLocal = 26; 
     const endX = earthXLocal; // Stop EXACTLY at Earth!
     const segments = 100;

     const isNorth = Math.cos(theta) >= 0;
     const targetY = isNorth ? 0.8 : -0.8;
     const targetZ = 0;

     for (let j = 0; j <= segments; j++) {
       const x = startX + (endX - startX) * (j / segments);
       const dx = x - earthXLocal; // dx goes from negative to 0
       
       // Add an initial spread so they don't all start from a single sharp point
       let r0 = 0.5 + (i % 4) * 0.8;
       let r = r0 + (x - startX) * spreadFactor;
       
       // Parker spiral twist, stops near Earth for clean interaction
       let effectiveXForTwist = x;
       if (dx > -10) effectiveXForTwist = earthXLocal - 10;
       const twist = (effectiveXForTwist - startX) * 0.03;
       const currentTheta = theta + twist;
       
       let coneY = r * Math.cos(currentTheta);
       let coneZ = r * Math.sin(currentTheta);
       
       let y = coneY;
       let z = coneZ;
       
       // Funnel smoothly to the correct pole
       if (dx > -12) {
          let t = (dx + 12) / 12; 
          const easeT = t * t * (3 - 2 * t);
          const funnelScale = 1 - easeT;
          
          y = coneY * funnelScale + targetY * easeT;
          z = coneZ * funnelScale + targetZ * easeT;
          
          const bow = Math.sin(t * Math.PI) * 3.5; 
          const currentR = Math.sqrt(y*y + z*z);
          if (currentR > 0.001) {
              y += (y / currentR) * bow;
              z += (z / currentR) * bow;
          }
       }
       
       points.push(new THREE.Vector3(x, y, z));
     }
     lines.push(points);
  }

  // 2. Lines that travel straight into space and miss Earth entirely
  const numMissLines = 24;
  for (let i = 0; i < numMissLines; i++) {
     const theta = (i / numMissLines) * Math.PI * 2; 
     // Wider spread so they visibly miss Earth
     const spreadFactor = 0.15 + (i % 4) * 0.05; 
     
     const points = [];
     const startX = 4.2; 
     const endX = 45; // Go far past Earth into deep space
     const segments = 150;

     for (let j = 0; j <= segments; j++) {
       const x = startX + (endX - startX) * (j / segments);
       
       let r0 = 0.8 + (i % 4) * 1.0;
       let r = r0 + (x - startX) * spreadFactor;
       
       const twist = (x - startX) * 0.03;
       const currentTheta = theta + twist;
       
       let y = r * Math.cos(currentTheta);
       let z = r * Math.sin(currentTheta);
       
       points.push(new THREE.Vector3(x, y, z));
     }
     lines.push(points);
  }

  return (
    <group>
      {lines.map((pts, i) => (
        <group key={i}>
          <Line 
            points={pts}
            color="#ef4444"
            lineWidth={3}
            transparent
            opacity={0.2}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
          <AnimatedLoop 
            points={pts}
            color="#fef08a"
            lineWidth={1}
            opacity={0.8}
            dashed={true}
            dashSize={3}
            gapSize={1.5}
          />
        </group>
      ))}
    </group>
  );
};

const Sun = () => {
  const texture = useLoader(THREE.TextureLoader, '/textures/sun_map.jpg');
  const sunRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (sunRef.current) {
      sunRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group>
      <mesh ref={sunRef}>
        <sphereGeometry args={[4.5, 64, 64]} />
        <meshBasicMaterial map={texture} />
      </mesh>
      
      {/* Sun glow */}
      <mesh>
        <sphereGeometry args={[5, 32, 32]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.15} blending={THREE.AdditiveBlending} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[5.8, 32, 32]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.08} blending={THREE.AdditiveBlending} side={THREE.BackSide} depthWrite={false} />
      </mesh>

      {/* Solar Flare Bright Spot (facing Earth) */}
      <mesh position={[4.2, 0, 0]}>
         <sphereGeometry args={[0.6, 16, 16]} />
         <meshBasicMaterial color="#ffffff" transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh position={[4.2, 0, 0]}>
         <sphereGeometry args={[1.2, 16, 16]} />
         <meshBasicMaterial color="#fef08a" transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      <pointLight color="#ffffff" intensity={600} distance={150} decay={1.5} />
      <VolcanicFlares />
      <InterplanetaryMagneticField />
    </group>
  );
};

// Helper to generate perfectly shaped asymmetric magnetic field lines
const generateDipoleLoop = (L: number, angleOffset: number = 0) => {
  const points = [];
  const segments = 100;
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    // Base radius of Earth is 0.8
    const r = 0.8 + L * Math.pow(Math.sin(t), 2);
    
    let x = r * Math.sin(t);
    let y = r * Math.cos(t);
    
    // Apply solar wind compression (Sun is at -X, pushing towards +X)
    if (x < 0) {
      x *= 0.6; // Compress day side
      // Ensure we don't penetrate the Earth (radius 0.8)
      const currentDist = Math.sqrt(x*x + y*y);
      if (currentDist < 0.85) {
         const scale = 0.85 / currentDist;
         x *= scale;
         y *= scale;
      }
    } else {
      x *= 1 + (x * 0.4); // Stretch magnetotail on night side
    }
    
    // Rotate around Y axis to create a 3D cage
    const finalX = x * Math.cos(angleOffset);
    const finalZ = x * Math.sin(angleOffset);
    
    points.push(new THREE.Vector3(finalX, y, finalZ));
  }
  return points;
};

const Magnetosphere = () => {
  const groupRef = useRef<THREE.Group>(null);

  const fieldLines = React.useMemo(() => {
    const lines = [];
    const Ls = [0.5, 1.2, 2.0, 3.0];
    
    // Generate a 3D cage of dipole loops
    for (const L of Ls) {
      lines.push(generateDipoleLoop(L, 0));
      lines.push(generateDipoleLoop(L, Math.PI / 2)); // 90 deg
      lines.push(generateDipoleLoop(L, Math.PI / 4)); // 45 deg
      lines.push(generateDipoleLoop(L, -Math.PI / 4)); // -45 deg
    }
    return lines;
  }, []);

  return (
    <group>
      <group ref={groupRef}>
        {/* Magnetic Field Lines (Cyan/Blue) - Now a true 3D cage */}
        {fieldLines.map((pts, i) => (
          <Line 
            key={i} 
            points={pts} 
            color="#93c5fd" 
            lineWidth={2} 
            transparent 
            opacity={0.4} 
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        ))}
      </group>

      {/* Bow Shock shield facing Sun (-X). */}
      <mesh position={[-1.2, 0, 0]} scale={[0.5, 1, 1]}>
         <sphereGeometry args={[2.5, 32, 32, 0, Math.PI]} />
         <meshBasicMaterial color="#3b82f6" transparent opacity={0.05} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
};

const EarthSystem = ({ onEarthClick, onMoonClick, onPointerOver, onPointerOut }: any) => {
  const earthTexture = useLoader(THREE.TextureLoader, 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg');
  const moonTexture = useLoader(THREE.TextureLoader, 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg');
  
  const earthRef = useRef<THREE.Mesh>(null);
  const moonOrbitRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (earthRef.current) earthRef.current.rotation.y += 0.01;
    if (moonOrbitRef.current) moonOrbitRef.current.rotation.y += 0.02;
  });

  return (
    <group>
      {/* Earth */}
      <mesh 
        ref={earthRef} 
        onClick={onEarthClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
      >
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial map={earthTexture} roughness={0.8} metalness={0.1} />
      </mesh>

      <Magnetosphere />

      <Html position={[0, -1.2, 0]} center occlude>
        <div 
          className="text-[10px] font-mono font-bold tracking-widest uppercase text-slate-400 whitespace-nowrap cursor-pointer hover:text-slate-200" 
          style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
          onClick={onEarthClick}
        >
          Earth
        </div>
      </Html>

      {/* Moon System */}
      <group ref={moonOrbitRef}>
        <mesh 
          position={[2, 0, 0]}
          onClick={onMoonClick}
          onPointerOver={onPointerOver}
          onPointerOut={onPointerOut}
        >
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial map={moonTexture} roughness={0.9} />
          <Html position={[0, -0.4, 0]} center occlude>
            <div 
              className="text-[8px] font-mono tracking-widest uppercase text-slate-500 whitespace-nowrap cursor-pointer hover:text-slate-300"
              onClick={onMoonClick}
            >
              Moon
            </div>
          </Html>
        </mesh>
      </group>
    </group>
  );
};

const L1Marker = ({ onClick, onPointerOver, onPointerOut }: any) => {
  return (
    <group 
      position={[7, 0, 0]}
      onClick={onClick}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      <mesh>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="#22d3ee" />
      </mesh>
      <Html position={[0, -0.5, 0]} center occlude>
        <div 
          className="text-[9px] font-mono text-cyan-400 whitespace-nowrap bg-slate-900/80 px-1 rounded border border-cyan-900/50 cursor-pointer hover:bg-slate-800"
          onClick={onClick}
        >
          L1 (DSCOVR)
        </div>
      </Html>
    </group>
  );
};

const SolarWind = () => {
  const windLines = React.useMemo(() => {
     const lines = [];
     for(let i = 0; i < 40; i++) {
        // stream from -X to +X, varying Y and Z.
        const y = (Math.random() - 0.5) * 15;
        const z = (Math.random() - 0.5) * 15;
        lines.push({ y, z, speed: Math.random() * 2 + 1, offset: Math.random() * 25 });
     }
     return lines;
  }, []);

  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
     if (groupRef.current) {
        const t = state.clock.getElapsedTime();
        groupRef.current.children.forEach((child: any, i) => {
           const lineData = windLines[i];
           // Sun is at -16. Surface is at -11.5. Start particles at -12.
           const x = -12 + ((t * 8 * lineData.speed + lineData.offset) % 27);
           child.position.set(x, lineData.y, lineData.z);
        });
     }
  });

  return (
    <group ref={groupRef}>
       {windLines.map((_, i) => (
          <mesh key={i}>
             <sphereGeometry args={[0.06, 4, 4]} />
             <meshBasicMaterial color="#fca5a5" transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
       ))}
    </group>
  );
}

const CmeCloud = ({ latestCme }: { latestCme: CmeItem }) => {
  const cloudRef = useRef<THREE.Group>(null);
  const isHalo = latestCme.type === 'Halo' || latestCme.type === 'Partial Halo';
  const mountTime = useRef<number | null>(null);
  
  useFrame((state) => {
    if (cloudRef.current) {
      if (mountTime.current === null) {
         // Record the exact time this component was mounted so the animation ALWAYS starts at 0
         mountTime.current = state.clock.getElapsedTime();
      }
      
      const t = state.clock.getElapsedTime() - mountTime.current;
      const cycle = (t % 10) / 10; 
      
      // Sun center is -16, radius is ~4.5. Surface is at -11.5. 
      const startX = -11.5;
      const endX = 15; 
      const currentX = startX + (endX - startX) * cycle;
      
      cloudRef.current.position.x = currentX;
      
      // Start larger so it's immediately visible bursting from the surface
      const s = 0.5 + cycle * (isHalo ? 6 : 3);
      cloudRef.current.scale.set(s, s, s);
      cloudRef.current.rotation.x = t * 2; // Spin the blast wave
    }
  });

  return (
    <group ref={cloudRef}>
      {/* Primary Blast Wave Shock Front (facing Earth, +X) */}
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <sphereGeometry args={[2, 64, 64, 0, Math.PI]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.15} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      
      {/* Inner hotter blast wave */}
      <mesh rotation={[0, Math.PI / 2, 0]} scale={[0.9, 0.9, 0.9]}>
        <sphereGeometry args={[2, 64, 64, 0, Math.PI]} />
        <meshBasicMaterial color="#818cf8" transparent opacity={0.25} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* Leading Edge Ring (Thin line) */}
      <mesh rotation={[0, Math.PI / 2, 0]}>
         <torusGeometry args={[2, 0.05, 16, 64]} />
         <meshBasicMaterial color="#22d3ee" transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* Trailing thin lines/rings for realistic blast wave effect */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-0.5, 0, 0]}>
         <torusGeometry args={[1.7, 0.03, 16, 64]} />
         <meshBasicMaterial color="#fb923c" transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-1.2, 0, 0]}>
         <torusGeometry args={[1.2, 0.02, 16, 64]} />
         <meshBasicMaterial color="#fcd34d" transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-1.8, 0, 0]}>
         <torusGeometry args={[0.6, 0.015, 16, 64]} />
         <meshBasicMaterial color="#fef08a" transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
};

const CameraController = ({ targetId }: { targetId: string | null }) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  
  const targetPos = useRef(new THREE.Vector3(10, 0, 0)); // Default to Earth
  const cameraTargetPos = useRef(new THREE.Vector3());
  const isAnimating = useRef(false);

  React.useEffect(() => {
    if (controlsRef.current && targetId) {
      let tX = -3;
      let optimalDist = 28;

      if (targetId === 'sun') {
        tX = -16;
        optimalDist = 22;
      } else if (targetId === 'earth') {
        tX = 10;
        optimalDist = 6;
      } else if (targetId === 'moon') {
        tX = 10;
        optimalDist = 4; // Zoom in even closer for the moon
      } else if (targetId === 'l1') {
        tX = 7;
        optimalDist = 5;
      }
      
      targetPos.current.set(tX, 0, 0);
      
      const dir = new THREE.Vector3().subVectors(camera.position, controlsRef.current.target).normalize();
      if (dir.lengthSq() === 0) dir.set(0, 0, 1);

      cameraTargetPos.current.copy(targetPos.current).add(dir.multiplyScalar(optimalDist));
      isAnimating.current = true;
    }
  }, [targetId, camera]);

  useFrame((_, delta) => {
    if (isAnimating.current && controlsRef.current) {
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
      target={[10, 0, 0]} // Default to Earth
      onStart={() => { isAnimating.current = false; }} 
    />
  );
};

export const CmeSystemScene: React.FC<CmeSystemSceneProps> = ({ latestCme }) => {
  const [selectedTarget, setSelectedTarget] = React.useState<string | null>(null);

  const handlePointerOver = () => { document.body.style.cursor = 'pointer'; };
  const handlePointerOut = () => { document.body.style.cursor = 'default'; };

  return (
    <div className="absolute inset-0 z-0 cursor-move" onClick={() => setSelectedTarget(null)}>
      <Canvas camera={{ position: [14, 3, 6], fov: 45 }}>
        <Suspense fallback={<Html center className="text-white font-mono text-xs">Loading 3D CME...</Html>}>
          <ambientLight intensity={0.5} />
          
          <CameraController targetId={selectedTarget} />

          {/* Sun */}
          <group 
            position={[-16, 0, 0]} 
            onClick={(e) => { e.stopPropagation(); setSelectedTarget('sun'); }}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
          >
            <Sun />
          </group>

          {/* Earth System */}
          <group position={[10, 0, 0]}>
            <EarthSystem 
              onEarthClick={(e: any) => { e.stopPropagation(); setSelectedTarget('earth'); }}
              onMoonClick={(e: any) => { e.stopPropagation(); setSelectedTarget('moon'); }}
              onPointerOver={handlePointerOver}
              onPointerOut={handlePointerOut}
            />
          </group>
          
          <L1Marker onClick={(e: any) => { e.stopPropagation(); setSelectedTarget('l1'); }} />
          
          {/* <SolarWind /> */}
          
          {/* <CmeCloud latestCme={latestCme} /> */}
          
          {/* Background Stars */}
          <group>
            {Array.from({ length: 200 }).map((_, i) => (
              <mesh 
                key={i} 
                position={[
                  (Math.random() - 0.5) * 80, 
                  (Math.random() - 0.5) * 80, 
                  -20 - Math.random() * 20
                ]}
              >
                <sphereGeometry args={[0.05, 4, 4]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={Math.random() * 0.8 + 0.2} />
              </mesh>
            ))}
          </group>
        </Suspense>
      </Canvas>
    </div>
  );
};
