import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, useTexture, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { MoonData } from '../../types/astronomy';
import { Lock, Unlock, Eye, Maximize, Minimize } from 'lucide-react';
import { useFullscreen } from '../../hooks/useFullscreen';

interface EarthMoonSystem3DProps {
  moon: MoonData;
}

const EarthMoonScene: React.FC<{ 
  moon: MoonData, 
  lockMoon: boolean, 
  focusedBody: 'earth' | 'moon' | 'sun' | null,
  setFocusedBody: (b: 'earth' | 'moon' | 'sun' | null) => void 
}> = ({ moon, lockMoon, focusedBody, setFocusedBody }) => {
  const moonRef = useRef<THREE.Group>(null);
  const controlsRef = useRef<any>(null);
  
  const earthTextureUrl = 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg';
  const earthBumpUrl = 'https://unpkg.com/three-globe/example/img/earth-topology.png';
  const moonTextureUrl = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg';
  const sunTextureUrl = '/textures/sun_map.jpg';
  
  const [earthMap, earthBump, moonMap, sunMap] = useTexture([earthTextureUrl, earthBumpUrl, moonTextureUrl, sunTextureUrl]);

  // Sun is far away on the +X axis
  const sunPosition = new THREE.Vector3(200, 0, 0);
  
  const moonAngle = useMemo(() => {
    let fraction = moon.illuminationPercent / 100;
    const isWaning = moon.phaseName.includes('Waning') || moon.phaseName === 'Third Quarter';
    const isNew = moon.phaseName === 'New Moon';
    const isFull = moon.phaseName === 'Full Moon';
    
    let angleRad = Math.acos(1 - 2 * fraction);
    if (isWaning) angleRad = 2 * Math.PI - angleRad;
    if (isNew) angleRad = 0;
    if (isFull) angleRad = Math.PI;
    
    return angleRad;
  }, [moon]);

  const earthRadius = 3;
  const moonRadius = 0.8;
  const distance = 15;

  const moonX = Math.cos(moonAngle) * distance;
  const moonZ = -Math.sin(moonAngle) * distance;

  const earthRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    // Live Real-Time Earth Rotation
    if (earthRef.current) {
      const now = new Date();
      const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600 + now.getUTCMilliseconds() / 3600000;
      earthRef.current.rotation.y = (utcHours / 24) * Math.PI * 2 + Math.PI;
    }

    if (controlsRef.current) {
      const targetPos = new THREE.Vector3();
      
      if (lockMoon) {
        targetPos.set(moonX, 0, moonZ);
      } else {
        if (focusedBody === 'moon') targetPos.set(moonX, 0, moonZ);
        else if (focusedBody === 'sun') targetPos.set(sunPosition.x, sunPosition.y, sunPosition.z);
        else targetPos.set(0, 0, 0); // Earth default
      }

      // Smoothly move the camera target
      controlsRef.current.target.lerp(targetPos, 0.08);

      // Smoothly zoom in if a specific body is focused
      if (!lockMoon && focusedBody) {
        const targetDist = focusedBody === 'sun' ? 40 : (focusedBody === 'earth' ? 10 : 5);
        const dir = state.camera.position.clone().sub(controlsRef.current.target).normalize();
        if (dir.lengthSq() === 0) dir.set(0, 0, 1);
        
        const idealPos = controlsRef.current.target.clone().add(dir.multiplyScalar(targetDist));
        state.camera.position.lerp(idealPos, 0.05);
        controlsRef.current.update(); // CRITICAL: Update OrbitControls so it doesn't revert the camera position
      }
    }
  });

  return (
    <group>
      <ambientLight intensity={0.02} />
      <directionalLight position={[sunPosition.x, sunPosition.y, sunPosition.z]} intensity={3.5} color="#fffcf5" />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      {/* Earth */}
      <Sphere 
        ref={earthRef}
        args={[earthRadius, 64, 64]} 
        position={[0, 0, 0]} 
        onClick={(e) => { e.stopPropagation(); if(!lockMoon) setFocusedBody(focusedBody === 'earth' ? null : 'earth'); }}
        onPointerOver={(e) => { e.stopPropagation(); if(!lockMoon) document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
      >
        <meshStandardMaterial map={earthMap} bumpMap={earthBump} bumpScale={0.05} roughness={0.6} />
      </Sphere>

      {/* Moon */}
      <group ref={moonRef} position={[moonX, 0, moonZ]}>
        <Sphere 
          args={[moonRadius, 64, 64]}
          onClick={(e) => { e.stopPropagation(); if(!lockMoon) setFocusedBody(focusedBody === 'moon' ? null : 'moon'); }}
          onPointerOver={(e) => { e.stopPropagation(); if(!lockMoon) document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { document.body.style.cursor = 'auto'; }}
        >
          <meshStandardMaterial map={moonMap} roughness={1} metalness={0.1} />
        </Sphere>
      </group>

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[distance - 0.05, distance + 0.05, 128]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>

      <OrbitControls 
        ref={controlsRef}
        enablePan={false}
        minDistance={2}
        maxDistance={250}
        makeDefault
      />
      
      {/* The Sun */}
      <group 
        position={[sunPosition.x, sunPosition.y, sunPosition.z]}
        onClick={(e) => { e.stopPropagation(); if(!lockMoon) setFocusedBody(focusedBody === 'sun' ? null : 'sun'); }}
        onPointerOver={(e) => { e.stopPropagation(); if(!lockMoon) document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
      >
        <mesh>
          <sphereGeometry args={[12, 64, 64]} />
          <meshStandardMaterial 
            map={sunMap}
            emissiveMap={sunMap}
            emissive={new THREE.Color('#ffffff')} 
            emissiveIntensity={1.5}
            color={new THREE.Color('#ffffff')}
            roughness={1}
          />
        </mesh>
        
        {/* Sun glow / Corona */}
        <mesh>
          <sphereGeometry args={[12.8, 32, 32]} />
          <meshBasicMaterial 
            color="#ffaa00" 
            transparent 
            opacity={0.3} 
            blending={THREE.AdditiveBlending} 
            depthWrite={false}
          />
        </mesh>

        {/* Outer atmosphere glow */}
        <mesh>
          <sphereGeometry args={[17.3, 32, 32]} />
          <meshBasicMaterial 
            color="#ff4400" 
            transparent 
            opacity={0.08} 
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        <pointLight intensity={2} color="#ffaa00" distance={400} decay={1.5} />
      </group>
    </group>
  );
};

export const EarthMoonSystem3D: React.FC<EarthMoonSystem3DProps> = ({ moon }) => {
  const [lockMoon, setLockMoon] = useState(true);
  const [focusedBody, setFocusedBody] = useState<'earth' | 'moon' | 'sun' | null>('moon');

  const containerRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef);

  return (
    <div ref={containerRef} className={`w-full h-full min-h-[400px] sm:min-h-[500px] relative rounded-3xl overflow-hidden border border-slate-800 ${isFullscreen ? 'bg-black' : ''}`}>
      <Canvas camera={{ position: [0, 5, 20], fov: 45 }}>
        <React.Suspense fallback={null}>
          <EarthMoonScene 
            moon={moon} 
            lockMoon={lockMoon} 
            focusedBody={focusedBody} 
            setFocusedBody={setFocusedBody} 
          />
        </React.Suspense>
      </Canvas>
      
      {/* Top Left Status */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
        <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 px-3 py-1.5 rounded-full text-[10px] font-mono text-slate-300 uppercase tracking-widest">
          {lockMoon ? 'Luna-centric Perspective' : 'Free Exploration Mode'}
        </div>
        {!lockMoon && focusedBody && (
          <div className="bg-indigo-900/40 backdrop-blur-sm border border-indigo-500/30 px-3 py-1 rounded-full text-[10px] font-mono text-indigo-300 uppercase tracking-widest flex items-center gap-1.5 w-fit">
            <Eye size={12} />
            Tracking: {focusedBody}
          </div>
        )}
      </div>

      {/* Top Right Controls */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={() => {
             setLockMoon(!lockMoon);
             if (!lockMoon) setFocusedBody('moon'); // Reset to moon when locking
          }}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-lg border backdrop-blur-md ${
            lockMoon 
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 hover:bg-amber-500/30' 
              : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
          }`}
        >
          {lockMoon ? <Lock size={14} /> : <Unlock size={14} />}
          {lockMoon ? 'Moon Locked' : 'Free Mode'}
        </button>
        <button
          onClick={toggleFullscreen}
          className="flex items-center justify-center p-2 rounded-xl text-slate-300 bg-slate-800/80 border border-slate-700 hover:bg-slate-700 hover:text-white transition-all backdrop-blur-md shadow-lg"
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
        </button>
      </div>

      {/* Bottom instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-none">
         {!lockMoon && (
           <span className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 px-2.5 py-1 rounded-md text-[10px] font-mono text-slate-300 font-bold shadow-lg">
             Click Earth, Moon, or Sun to focus
           </span>
         )}
      </div>
    </div>
  );
};
