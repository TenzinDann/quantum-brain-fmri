/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Torus, Cylinder, Stars, Environment, Box } from '@react-three/drei';
import * as THREE from 'three';

const QuantumParticle = ({ position, color, scale = 1 }: { position: [number, number, number]; color: string; scale?: number }) => {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.getElapsedTime();
      ref.current.position.y = position[1] + Math.sin(t * 2 + position[0]) * 0.2;
      ref.current.rotation.x = t * 0.5;
      ref.current.rotation.z = t * 0.3;
    }
  });

  return (
    <Sphere ref={ref} args={[1, 32, 32]} position={position} scale={scale}>
      <MeshDistortMaterial
        color={color}
        envMapIntensity={1}
        clearcoat={1}
        clearcoatRoughness={0}
        metalness={0.5}
        distort={0.4}
        speed={2}
      />
    </Sphere>
  );
};

const QuantumBrain = () => {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  
  const particlesCount = 80000;
  const { positions, colors } = useMemo(() => {
    const nextPositions = new Float32Array(particlesCount * 3);
    const nextColors = new Float32Array(particlesCount * 3);
    let minX = Infinity;
    let minY = Infinity;
    let minZ = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let maxZ = -Infinity;

    for (let i = 0; i < particlesCount; i++) {
      const region = Math.random();

      let x = 0;
      let y = 0;
      let z = 0;

      // Cartoon-style brain silhouette:
      // rounder hemispheres + clear center fissure + compact cerebellum + slim brainstem.
      if (region < 0.86) {
        const side = Math.random() > 0.5 ? 1 : -1;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const shell = 0.6 + Math.pow(Math.random(), 0.38) * 0.4;

        // Rounder, friendlier volume proportions.
        x = 1.38 * Math.sin(phi) * Math.cos(theta);
        y = 1.12 * Math.cos(phi);
        z = 1.28 * Math.sin(phi) * Math.sin(theta);

        x = (Math.abs(x) + 0.24) * side;
        x *= shell;
        y *= shell;
        z *= shell;

        // Cartoon macro shaping.
        if (z > 0.25) { x *= 1.08; y *= 1.06; }
        if (y < -0.08 && z > -0.6) { x *= 1.1; y *= 0.92; }
        // Keep occipital area full (avoid a "caved in" back view).
        if (z < -0.95) { x *= 1.05; y *= 1.02; z *= 1.06; }
        if (z < -0.45) {
          const backBulge = Math.min(1, (-z - 0.45) / 0.85);
          x *= 1 + backBulge * 0.07;
          y *= 1 + backBulge * 0.04;
          z *= 1 + backBulge * 0.05;
        }

        // Flatten base slightly.
        y *= (0.95 + 0.08 * Math.tanh((y + 0.12) * 2.2));

        // Stronger center fissure for a classic "two-lobe" read,
        // but soften it toward the back to keep the posterior shape rounded.
        const backFissureFade = z < -0.35 ? 0.7 : 1.0;
        const fissureStrength =
          Math.exp(-Math.pow(Math.abs(x) - 0.22, 2) / 0.018) * 0.14 * backFissureFade;
        x += side * fissureStrength;

        // Smoother folds than realistic model for a stylized/cartoon look.
        const surfaceWeight = (shell - 0.6) / 0.4;
        const folds =
          Math.sin((x * 1.9 + z * 2.3) * 2.4) *
          Math.cos((y * 2.3 - z * 1.4) * 2.1);
        const microFolds = Math.sin((x - y + z) * 7.8) * Math.cos((x + z) * 6.3);
        const displacement = 1 + (folds * 0.075 + microFolds * 0.018) * Math.max(0, surfaceWeight);

        x *= displacement;
        y *= displacement;
        z *= displacement;
      } else if (region < 0.96) {
        // Cerebellum.
        const side = Math.random() > 0.5 ? 1 : -1;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const shell = 0.6 + Math.pow(Math.random(), 0.5) * 0.4;

        x = (Math.abs(0.58 * Math.sin(phi) * Math.cos(theta)) + 0.18) * side * shell;
        y = (-0.74 + 0.5 * Math.cos(phi)) * shell;
        z = (-1.06 + 0.55 * Math.sin(phi) * Math.sin(theta)) * shell;

        const folds = Math.sin((x * 8.3 + z * 8.1)) * Math.cos(y * 8.9);
        const displacement = 1 + folds * 0.032;
        x *= displacement;
        y *= displacement;
        z *= displacement;
      } else {
        // Brainstem.
        const t = Math.random();
        const angle = Math.random() * Math.PI * 2;
        const radius = (1 - t) * 0.11 + 0.045;
        x = Math.cos(angle) * radius;
        y = -1.02 - t * 0.86;
        z = -0.72 + Math.sin(angle) * radius * 0.5;
      }

      nextPositions[i * 3] = x;
      nextPositions[i * 3 + 1] = y;
      nextPositions[i * 3 + 2] = z;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      minZ = Math.min(minZ, z);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      maxZ = Math.max(maxZ, z);

      // Keep the original soft luminous palette, with slight regional distinction.
      if (region >= 0.96) {
        // Brainstem (cool white)
        nextColors[i * 3] = 0.95;
        nextColors[i * 3 + 1] = 0.97;
        nextColors[i * 3 + 2] = 1.0;
      } else if (region >= 0.86) {
        // Cerebellum (warm tint)
        nextColors[i * 3] = 1.0;
        nextColors[i * 3 + 1] = 0.9;
        nextColors[i * 3 + 2] = 0.84;
      } else {
        // Main cortex: pastel cartoon palette
        const mix = Math.random();
        if (mix > 0.75) {
          nextColors[i * 3] = 1.0;   // pink
          nextColors[i * 3 + 1] = 0.82;
          nextColors[i * 3 + 2] = 0.91;
        } else if (mix > 0.5) {
          nextColors[i * 3] = 0.84;  // lilac
          nextColors[i * 3 + 1] = 0.79;
          nextColors[i * 3 + 2] = 1.0;
        } else if (mix > 0.25) {
          nextColors[i * 3] = 0.81;  // blue
          nextColors[i * 3 + 1] = 0.89;
          nextColors[i * 3 + 2] = 1.0;
        } else {
          nextColors[i * 3] = 1.0;   // peach highlight
          nextColors[i * 3 + 1] = 0.88;
          nextColors[i * 3 + 2] = 0.78;
        }
      }
    }

    // Auto-center to keep model visually level and centered.
    const centerX = (minX + maxX) * 0.5;
    const centerY = (minY + maxY) * 0.5;
    const centerZ = (minZ + maxZ) * 0.5;
    for (let i = 0; i < particlesCount; i++) {
      nextPositions[i * 3] -= centerX;
      // Keep a slight upward placement so brainstem doesn't dominate center.
      nextPositions[i * 3 + 1] -= centerY * 0.7;
      nextPositions[i * 3 + 2] -= centerZ;
    }

    return { positions: nextPositions, colors: nextColors };
  }, [particlesCount]);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      groupRef.current.rotation.y = t * 0.12;
      groupRef.current.rotation.x = Math.sin(t * 0.18) * 0.04;
      groupRef.current.rotation.z = 0;
      groupRef.current.position.x = 0;
      groupRef.current.position.y = Math.sin(t * 0.4) * 0.15;
    }
    if (pointsRef.current) pointsRef.current.rotation.z = 0;
  });

  return (
    <group ref={groupRef} scale={[1.12, 1.12, 1.12]}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particlesCount}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={particlesCount}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.03}
          vertexColors
          transparent
          opacity={0.98}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      
      {/* Soft internal glow */}
      <Sphere args={[1.02, 32, 32]}>
        <meshBasicMaterial color="#f5e9ff" transparent opacity={0.22} />
      </Sphere>
      <pointLight intensity={1.9} distance={4.5} color="#f6f0ff" />
    </group>
  );
};

const NeuralConnection = () => {
  const lineRef = useRef<THREE.Line>(null);
  const points = useRef<THREE.Vector3[]>([]);
  const randomOffset = useRef(Math.random() * Math.PI * 2);
  
  if (points.current.length === 0) {
    for (let i = 0; i < 2; i++) {
      const isLeft = Math.random() > 0.5;
      const side = isLeft ? -1 : 1;
      const u = Math.random() * Math.PI;
      const v = (Math.random() - 0.5) * Math.PI;
      
      let x = 1.3 * Math.sin(u) * Math.cos(v);
      let y = 1.1 * Math.sin(v);
      let z = 1.6 * Math.cos(u);
      
      x = (x * 0.85 + 0.35) * side;
      
      points.current.push(new THREE.Vector3(x * 0.8, y * 0.8, z * 0.8));
    }
  }

  useFrame((state) => {
    if (lineRef.current) {
      const t = state.clock.getElapsedTime();
      const opacity = (Math.sin(t * 2.5 + randomOffset.current) + 1) * 0.1;
      (lineRef.current.material as THREE.LineBasicMaterial).opacity = opacity;
    }
  });

  const geometry = new THREE.BufferGeometry().setFromPoints(points.current);
  const material = new THREE.LineBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.1 });

  return (
    <primitive ref={lineRef} object={new THREE.Line(geometry, material)} />
  );
};

export const HeroScene: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 opacity-100 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        {/* Background color matching the reference image's soft gradient base */}
        <color attach="background" args={['#e8eaff']} />
        
        {/* Atmospheric lighting to match reference image's soft multi-directional glow */}
        <ambientLight intensity={1.05} />
        <pointLight position={[10, 10, 10]} intensity={3.1} color="#fff8f0" /> {/* Warm top-right */}
        <pointLight position={[-10, -5, 5]} intensity={2.6} color="#e0e5ff" /> {/* Cool bottom-left */}
        <pointLight position={[0, 5, -5]} intensity={2.1} color="#ffe0f0" /> {/* Soft pink back */}
        <spotLight position={[0, 10, 0]} intensity={1.25} angle={0.5} penumbra={1} color="#ffffff" />
        
        <Float speed={0.9} rotationIntensity={0} floatIntensity={0.24}>
          <QuantumBrain />
          {/* Very subtle neural connections */}
          {[...Array(12)].map((_, i) => (
            <NeuralConnection key={i} />
          ))}
        </Float>

        <Environment preset="studio" />
      </Canvas>
    </div>
  );
};

export const QuantumComputerScene: React.FC = () => {
  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
        <ambientLight intensity={1} />
        <spotLight position={[5, 5, 5]} angle={0.3} penumbra={1} intensity={2} color="#C5A059" />
        <pointLight position={[-5, -5, -5]} intensity={0.5} />
        <Environment preset="studio" />
        
        <Float rotationIntensity={0.4} floatIntensity={0.2} speed={1}>
          <group rotation={[0, 0, 0]} position={[0, 0.5, 0]}>
            {/* Main Cryostat Structure (Gold Chandelier) */}
            
            {/* Top Plate */}
            <Cylinder args={[1.2, 1.2, 0.1, 64]} position={[0, 1, 0]}>
              <meshStandardMaterial color="#C5A059" metalness={1} roughness={0.15} />
            </Cylinder>
            
            {/* Middle Stage */}
            <Cylinder args={[1, 1, 0.1, 64]} position={[0, 0.2, 0]}>
              <meshStandardMaterial color="#C5A059" metalness={1} roughness={0.15} />
            </Cylinder>
            
            {/* Bottom Stage (Mixing Chamber) */}
            <Cylinder args={[0.6, 0.6, 0.1, 64]} position={[0, -0.6, 0]}>
              <meshStandardMaterial color="#C5A059" metalness={1} roughness={0.15} />
            </Cylinder>

            {/* Connecting Rods */}
            <Cylinder args={[0.04, 0.04, 0.8, 16]} position={[0.5, 0.6, 0]}>
               <meshStandardMaterial color="#D1D5DB" metalness={0.8} roughness={0.2} />
            </Cylinder>
            <Cylinder args={[0.04, 0.04, 0.8, 16]} position={[-0.5, 0.6, 0]}>
               <meshStandardMaterial color="#D1D5DB" metalness={0.8} roughness={0.2} />
            </Cylinder>
             <Cylinder args={[0.04, 0.04, 0.8, 16]} position={[0, 0.6, 0.5]}>
               <meshStandardMaterial color="#D1D5DB" metalness={0.8} roughness={0.2} />
            </Cylinder>
             <Cylinder args={[0.04, 0.04, 0.8, 16]} position={[0, 0.6, -0.5]}>
               <meshStandardMaterial color="#D1D5DB" metalness={0.8} roughness={0.2} />
            </Cylinder>

             {/* Lower Rods */}
             <Cylinder args={[0.03, 0.03, 0.8, 16]} position={[0.2, -0.2, 0]}>
               <meshStandardMaterial color="#D1D5DB" metalness={0.8} roughness={0.2} />
            </Cylinder>
            <Cylinder args={[0.03, 0.03, 0.8, 16]} position={[-0.2, -0.2, 0]}>
               <meshStandardMaterial color="#D1D5DB" metalness={0.8} roughness={0.2} />
            </Cylinder>

            {/* Coils/Wires - Copper colored */}
            <Torus args={[0.7, 0.015, 16, 64]} position={[0, -0.2, 0]} rotation={[Math.PI/2, 0, 0]}>
               <meshStandardMaterial color="#B87333" metalness={0.8} roughness={0.3} />
            </Torus>
             <Torus args={[0.3, 0.015, 16, 64]} position={[0, -1, 0]} rotation={[Math.PI/2, 0, 0]}>
               <meshStandardMaterial color="#B87333" metalness={0.8} roughness={0.3} />
            </Torus>
            
            {/* Central processor chip simulation at bottom */}
            <Box args={[0.2, 0.05, 0.2]} position={[0, -0.7, 0]}>
                <meshStandardMaterial color="#111" metalness={0.9} roughness={0.1} />
            </Box>
          </group>
        </Float>
      </Canvas>
    </div>
  );
}
