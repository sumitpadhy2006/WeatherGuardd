import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { WeatherState } from './types';
import { Cloud, Clouds } from '@react-three/drei';

interface WeatherSystemProps {
  weather: WeatherState;
  timeOfDay: number;
  windDeg?: number;
  windSpeed?: number;
}

const PARTICLE_COUNT = 8000;
const METEOR_COUNT = 200;
const GRID_SPACING = 120;
const gridOffsets = [
  [-GRID_SPACING, -GRID_SPACING], [0, -GRID_SPACING], [GRID_SPACING, -GRID_SPACING],
  [-GRID_SPACING, 0],             [0, 0],             [GRID_SPACING, 0],
  [-GRID_SPACING, GRID_SPACING],  [0, GRID_SPACING],  [GRID_SPACING, GRID_SPACING]
];

const AnimatedCloudGroup = ({ cloudOpacityMultiplier, cloudSegmentsMultiplier, cloudColors, cloudGroupRef }: any) => {
  const targetColorBack = useMemo(() => new THREE.Color(), []);
  const targetColorMid = useMemo(() => new THREE.Color(), []);
  const targetColorFront = useMemo(() => new THREE.Color(), []);

  useFrame((state, delta) => {
    // Clamp delta to absolutely ensure no massive time jumps if the browser stutters
    const safeDelta = Math.min(delta, 0.05);

    if (!cloudGroupRef.current) return;

    targetColorBack.set(cloudColors.back);
    targetColorMid.set(cloudColors.mid);
    targetColorFront.set(cloudColors.front);

    let meshIndex = 0;
    cloudGroupRef.current.traverse((child: any) => {
      if (child.isInstancedMesh && child.material) {
        const mat = child.material;
        // Make sure it's transparent so opacity works
        mat.transparent = true;
        
        if (meshIndex === 0) {
          mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0.8 * cloudOpacityMultiplier, safeDelta * 2.5);
          mat.color.lerp(targetColorBack, safeDelta * 2.5);
        } else if (meshIndex === 1) {
          mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0.7 * cloudOpacityMultiplier, safeDelta * 2.5);
          mat.color.lerp(targetColorMid, safeDelta * 2.5);
        } else if (meshIndex === 2) {
          mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0.6 * cloudOpacityMultiplier, safeDelta * 2.5);
          mat.color.lerp(targetColorFront, safeDelta * 2.5);
        }
        meshIndex++;
      }
    });
  });

  return (
    <group ref={cloudGroupRef} position={[0, 25, -30]}>
      {/* Background clouds */}
      <Clouds material={THREE.MeshBasicMaterial} limit={1000} range={1500}>
        {gridOffsets.map(([offsetX, offsetZ], index) => (
          <Cloud key={index} position={[offsetX, 5, offsetZ - 15]} segments={Math.floor(40 * cloudSegmentsMultiplier)} bounds={[80, 5, 30]} volume={35} color="#ffffff" opacity={1} speed={0.15} />
        ))}
      </Clouds>
      {/* Mid-depth clouds */}
      <Clouds material={THREE.MeshBasicMaterial} limit={1000} range={1500}>
        {gridOffsets.map(([offsetX, offsetZ], index) => (
          <Cloud key={index} position={[offsetX - 30, 2, offsetZ]} segments={Math.floor(25 * cloudSegmentsMultiplier)} bounds={[50, 5, 20]} volume={28} color="#ffffff" opacity={1} speed={0.1} />
        ))}
      </Clouds>
      {/* Foreground clouds */}
      <Clouds material={THREE.MeshBasicMaterial} limit={1000} range={1500}>
        {gridOffsets.map(([offsetX, offsetZ], index) => (
          <Cloud key={index} position={[offsetX + 30, 0, offsetZ - 5]} segments={Math.floor(20 * cloudSegmentsMultiplier)} bounds={[40, 5, 15]} volume={25} color="#ffffff" opacity={1} speed={0.12} />
        ))}
      </Clouds>
    </group>
  );
};
export const WeatherSystem: React.FC<WeatherSystemProps> = ({ weather, timeOfDay, windDeg = 90, windSpeed = 5 }) => {
  const rainRef = useRef<THREE.InstancedMesh>(null);
  const snowRef = useRef<THREE.InstancedMesh>(null);
  const hailRef = useRef<THREE.InstancedMesh>(null);
  const meteorRef = useRef<THREE.InstancedMesh>(null);
  const dustRef = useRef<THREE.InstancedMesh>(null);
  const cloudGroupRef = useRef<THREE.Group>(null);
  
  const isRainy = weather === 'light_rain' || weather === 'heavy_rain' || weather === 'thunderstorm' || weather === 'cyclone' || weather === 'tornado';
  const isSnowy = weather === 'snow' || weather === 'heavy_snow' || weather === 'blizzard';
  const isHailing = weather === 'hail';
  const isMeteor = weather === 'meteor_shower';
  const isAurora = weather === 'aurora';
  const isDusty = weather === 'sandstorm' || weather === 'tornado' || weather === 'cyclone';

  const isCloudy = weather === 'cloudy' || weather === 'overcast' || isRainy || isSnowy || isDusty || weather === 'hail';
  const isPartlyCloudy = weather === 'partly_cloudy';

  // Rain initialization
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particlePositions = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 100;
      pos[i * 3 + 1] = (Math.random() * 60) - 5;
      pos[i * 3 + 2] = (Math.random() * 80) - 70;
    }
    return pos;
  }, []);

  const meteorPositions = useMemo(() => {
    const pos = new Float32Array(METEOR_COUNT * 3);
    for (let i = 0; i < METEOR_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 200;
      pos[i * 3 + 1] = Math.random() * 60 + 40; // High in the sky
      pos[i * 3 + 2] = (Math.random() * 100) - 100;
    }
    return pos;
  }, []);

  useEffect(() => {
    const updateInstances = (ref: React.RefObject<THREE.InstancedMesh>, positions: Float32Array, count: number, scaleX: number, scaleY: number, scaleZ: number) => {
      if (!ref.current) return;
      for (let i = 0; i < count; i++) {
        dummy.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
        dummy.scale.set(scaleX, scaleY, scaleZ);
        dummy.updateMatrix();
        ref.current.setMatrixAt(i, dummy.matrix);
      }
      ref.current.count = count;
      ref.current.instanceMatrix.needsUpdate = true;
    };
    
    if (isRainy) updateInstances(rainRef, particlePositions, PARTICLE_COUNT, 0.05, weather === 'heavy_rain' || weather === 'thunderstorm' || weather === 'cyclone' || weather === 'tornado' ? 2.5 : 0.8, 0.05);
    if (isSnowy) {
      const count = weather === 'snow' ? 3000 : weather === 'heavy_snow' ? 6000 : PARTICLE_COUNT;
      updateInstances(snowRef, particlePositions, count, weather === 'blizzard' ? 1.5 : 1.0, weather === 'blizzard' ? 1.5 : 1.0, weather === 'blizzard' ? 1.5 : 1.0);
    }
    if (isHailing) updateInstances(hailRef, particlePositions, PARTICLE_COUNT, 0.2, 0.2, 0.2);
    if (isMeteor) updateInstances(meteorRef, meteorPositions, METEOR_COUNT, 0.1, 8.0, 0.1);
    if (isDusty) updateInstances(dustRef, particlePositions, PARTICLE_COUNT, 0.1, 0.1, 0.1);
  }, [isRainy, isSnowy, isHailing, isMeteor, isDusty, weather, particlePositions, meteorPositions, dummy]);

  useFrame((state, delta) => {
    // Weather Particles Animation
    const animateParticles = (ref: React.RefObject<THREE.InstancedMesh>, fallSpeed: number, windMultiplier: number, wobble: boolean = false) => {
      if (!ref.current) return;
      const radians = (windDeg + 180) * (Math.PI / 180);
      const horizontalSpeed = windSpeed * windMultiplier;
      const dx = Math.sin(radians) * horizontalSpeed * delta;
      const dz = Math.cos(radians) * horizontalSpeed * delta;
      
      const velocityDir = new THREE.Vector3(Math.sin(radians) * horizontalSpeed, -fallSpeed, Math.cos(radians) * horizontalSpeed).normalize();
      const rotation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), velocityDir);

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        // Pseudo-random variation per particle based on its index
        const speedVar = 0.6 + Math.abs(Math.sin(i)) * 0.8; 
        const indFallSpeed = fallSpeed * speedVar;
        const indDx = dx * speedVar;
        const indDz = dz * speedVar;

        particlePositions[i * 3 + 1] -= indFallSpeed * delta;
        particlePositions[i * 3] += indDx + (wobble ? Math.sin(state.clock.elapsedTime * 2 + i) * 0.05 : 0);
        particlePositions[i * 3 + 2] += indDz + (wobble ? Math.cos(state.clock.elapsedTime * 2 + i) * 0.05 : 0);

        // When a particle hits the floor/bounds, wrap it around to a completely NEW random position
        // This permanently shatters any mechanical looping patterns
        if (particlePositions[i * 3 + 1] < -5) {
           particlePositions[i * 3 + 1] = 55 + Math.random() * 10;
           particlePositions[i * 3] = (Math.random() - 0.5) * 100;
           particlePositions[i * 3 + 2] = (Math.random() * 80) - 70;
        }
        if (particlePositions[i * 3] > 50) particlePositions[i * 3] -= 100;
        else if (particlePositions[i * 3] < -50) particlePositions[i * 3] += 100;
        
        if (particlePositions[i * 3 + 2] > 10) particlePositions[i * 3 + 2] -= 80;
        else if (particlePositions[i * 3 + 2] < -70) particlePositions[i * 3 + 2] += 80;

        dummy.position.set(particlePositions[i * 3], particlePositions[i * 3 + 1], particlePositions[i * 3 + 2]);
        if (!wobble) dummy.quaternion.copy(rotation);
        dummy.updateMatrix();
        ref.current.setMatrixAt(i, dummy.matrix);
      }
      ref.current.instanceMatrix.needsUpdate = true;
    };

    if (isRainy) animateParticles(rainRef, weather === 'light_rain' ? 15 : weather === 'cyclone' || weather === 'tornado' ? 65 : 30, weather === 'cyclone' || weather === 'tornado' ? 4.5 : 1.5);
    if (isSnowy) animateParticles(snowRef, weather === 'snow' ? 5 : weather === 'blizzard' ? 25 : 15, weather === 'snow' ? 0.5 : weather === 'blizzard' ? 4.0 : 1.5, false);
    if (isHailing) animateParticles(hailRef, 35, 1.0);
    if (isDusty) animateParticles(dustRef, weather === 'tornado' || weather === 'cyclone' ? 50 : 25, weather === 'tornado' || weather === 'cyclone' ? 5.0 : 2.0);

    // Meteor Animation
    if (isMeteor && meteorRef.current) {
      const meteorDir = new THREE.Vector3(-1, -1, -1).normalize();
      const meteorRot = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), meteorDir);
      for (let i = 0; i < METEOR_COUNT; i++) {
        meteorPositions[i * 3] += meteorDir.x * 60 * delta;
        meteorPositions[i * 3 + 1] += meteorDir.y * 60 * delta;
        meteorPositions[i * 3 + 2] += meteorDir.z * 60 * delta;
        
        if (meteorPositions[i * 3 + 1] < -20) {
           meteorPositions[i * 3] = (Math.random() - 0.5) * 200;
           meteorPositions[i * 3 + 1] = Math.random() * 40 + 60;
           meteorPositions[i * 3 + 2] = (Math.random() * 100) - 100;
        }

        dummy.position.set(meteorPositions[i * 3], meteorPositions[i * 3 + 1], meteorPositions[i * 3 + 2]);
        dummy.quaternion.copy(meteorRot);
        dummy.updateMatrix();
        meteorRef.current.setMatrixAt(i, dummy.matrix);
      }
      meteorRef.current.instanceMatrix.needsUpdate = true;
    }

    // Cloud drift
    if (cloudGroupRef.current) {
      // Wind direction: where wind comes FROM. Add 180 to get direction it moves TO.
      // 0 deg = North. Moving South means +Z in Three.js (camera looks down -Z).
      // 90 deg = East. Moving West means -X.
      const radians = (windDeg + 180) * (Math.PI / 180);
      // Ensure smooth, very slow drift that scales slightly with actual wind speed
      const speedMultiplier = 0.5 + (windSpeed * 0.02); 
      
      const safeDelta = Math.min(delta, 0.05); // Cap to prevent lag-induced speedups
      cloudGroupRef.current.position.x += Math.sin(radians) * speedMultiplier * safeDelta;
      cloudGroupRef.current.position.z += Math.cos(radians) * speedMultiplier * safeDelta;
      
      // Rotational force for extreme cyclonic events
      if (weather === 'tornado' || weather === 'cyclone') {
        cloudGroupRef.current.rotation.y -= delta * 0.15; // Swirl the clouds continuously
      } else {
        cloudGroupRef.current.rotation.y = 0; // Reset
      }

      // Wrap around bounds to keep clouds in view smoothly.
      // Because clouds are tiled every GRID_SPACING, jumping by GRID_SPACING creates a perfect infinite loop!
      if (cloudGroupRef.current.position.x > GRID_SPACING / 2) cloudGroupRef.current.position.x -= GRID_SPACING;
      else if (cloudGroupRef.current.position.x < -GRID_SPACING / 2) cloudGroupRef.current.position.x += GRID_SPACING;

      if (cloudGroupRef.current.position.z > GRID_SPACING / 2) cloudGroupRef.current.position.z -= GRID_SPACING;
      else if (cloudGroupRef.current.position.z < -GRID_SPACING / 2) cloudGroupRef.current.position.z += GRID_SPACING;
    }
  });


  // Cloud configuration based on weather
  let cloudOpacityMultiplier = 1.0;
  let cloudSegmentsMultiplier = 1.0;
  const isNight = timeOfDay > 18 || timeOfDay < 6;
  
  let cloudColors = isNight 
    ? { back: "#64748b", mid: "#94a3b8", front: "#475569" }
    : { back: "#f8fafc", mid: "#ffffff", front: "#e2e8f0" };

  if (weather === 'heavy_rain' || weather === 'thunderstorm') {
    cloudOpacityMultiplier = 1.0;
    cloudSegmentsMultiplier = 1.3;
    cloudColors = isNight
      ? { back: "#1e293b", mid: "#334155", front: "#0f172a" }
      : { back: "#334155", mid: "#475569", front: "#1e293b" };
  } else if (weather === 'snow') {
    cloudColors = isNight 
      ? { back: "#64748b", mid: "#94a3b8", front: "#475569" }
      : { back: "#ffffff", mid: "#f8fafc", front: "#f1f5f9" }; // simple white clouds
    cloudOpacityMultiplier = 1.0;
    cloudSegmentsMultiplier = 1.3; // dense clouds
  } else if (weather === 'heavy_snow' || weather === 'blizzard') {
    cloudColors = isNight
      ? { back: "#0f172a", mid: "#1e293b", front: "#020617" }
      : { back: "#475569", mid: "#64748b", front: "#334155" }; // dark and dense clouds
    cloudOpacityMultiplier = 1.0;
    cloudSegmentsMultiplier = 1.6; // very dense
  } else if (weather === 'sandstorm') {
    cloudColors = { back: "#78350f", mid: "#b45309", front: "#d97706" };
    cloudOpacityMultiplier = 1.0;
    cloudSegmentsMultiplier = 1.2;
  } else if (weather === 'tornado' || weather === 'cyclone') {
    cloudColors = { back: "#020617", mid: "#0f172a", front: "#1e293b" };
    cloudOpacityMultiplier = 1.0;
    cloudSegmentsMultiplier = 1.5;
  } else if (weather === 'light_rain' || weather === 'overcast' || weather === 'aurora') {
    if (weather === 'aurora') {
      cloudOpacityMultiplier = 0.1;
    } else {
      cloudOpacityMultiplier = 1.0;
    }
    cloudSegmentsMultiplier = 1.0;
    cloudColors = isNight
      ? { back: "#334155", mid: "#475569", front: "#1e293b" }
      : { back: "#94a3b8", mid: "#cbd5e1", front: "#64748b" };
  } else if (isPartlyCloudy) {
    cloudOpacityMultiplier = 0.7;
    cloudSegmentsMultiplier = 0.6;
  } else if (!isCloudy) {
    cloudOpacityMultiplier = 0.4;
    cloudSegmentsMultiplier = 0.4;
  }

  return (
    <>
      {/* Weather Particle Systems */}
      {isRainy && (
        <instancedMesh ref={rainRef} args={[undefined, undefined, PARTICLE_COUNT]}>
          <cylinderGeometry args={[0.02, 0.02, 1, 4]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={weather === 'cyclone' || weather === 'tornado' || weather === 'heavy_rain' || weather === 'thunderstorm' ? 0.6 : 0.3} depthWrite={false} />
        </instancedMesh>
      )}
      {isSnowy && (
        <instancedMesh ref={snowRef} args={[undefined, undefined, PARTICLE_COUNT]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={weather === 'blizzard' ? 0.9 : 0.8} depthWrite={false} />
        </instancedMesh>
      )}
      {isHailing && (
        <instancedMesh ref={hailRef} args={[undefined, undefined, PARTICLE_COUNT]}>
          <sphereGeometry args={[0.1, 4, 4]} />
          <meshBasicMaterial color="#e2e8f0" transparent opacity={0.9} depthWrite={false} />
        </instancedMesh>
      )}
      {isDusty && (
        <instancedMesh ref={dustRef} args={[undefined, undefined, PARTICLE_COUNT]}>
          <sphereGeometry args={[0.06, 4, 4]} />
          <meshBasicMaterial color="#78350f" transparent opacity={0.4} depthWrite={false} />
        </instancedMesh>
      )}
      {isMeteor && (
        <instancedMesh ref={meteorRef} args={[undefined, undefined, METEOR_COUNT]}>
          <cylinderGeometry args={[0.05, 0.01, 1, 4]} />
          <meshBasicMaterial color="#c0caf5" transparent opacity={0.9} depthWrite={false} />
        </instancedMesh>
      )}
      {/* Aurora Borealis Overlay Planes */}
      {isAurora && (
        <group position={[0, 40, -50]}>
          <mesh position={[-30, 0, 0]} rotation={[0.2, 0.5, -0.1]}>
            <planeGeometry args={[100, 30]} />
            <meshBasicMaterial color="#10b981" transparent opacity={0.15} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[20, 5, -10]} rotation={[0.1, -0.4, 0.1]}>
            <planeGeometry args={[120, 40]} />
            <meshBasicMaterial color="#8b5cf6" transparent opacity={0.15} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}

      {/* 3D Realistic Drifting Clouds Layer */}
      {/* We raise the Y position to 25 so the massive volume (25-35 radius) doesn't sink into the UI horizon */}
      <AnimatedCloudGroup 
        cloudOpacityMultiplier={cloudOpacityMultiplier} 
        cloudSegmentsMultiplier={cloudSegmentsMultiplier} 
        cloudColors={cloudColors} 
        cloudGroupRef={cloudGroupRef} 
      />
    </>
  );
};
