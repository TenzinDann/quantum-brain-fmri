/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useMemo, useRef } from 'react';
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
  const visibilityBoost = 1.08;
  
  const particlesCount = 15000;
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
      if (region < 0.88) {
        const side = Math.random() > 0.5 ? 1 : -1;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const shell = 0.7 + Math.pow(Math.random(), 0.32) * 0.3;

        // Compact lobes closer to the reference video.
        x = 1.18 * Math.sin(phi) * Math.cos(theta);
        y = 0.98 * Math.cos(phi);
        z = 1.16 * Math.sin(phi) * Math.sin(theta);

        x = (Math.abs(x) + 0.08) * side;
        x *= shell;
        y *= shell;
        z *= shell;

        // Macro shaping tuned toward a more natural brain silhouette.
        if (z > 0.25) { x *= 1.08; y *= 1.06; }
        if (y < -0.08 && z > -0.6) { x *= 1.1; y *= 0.92; }
        // Fill the posterior (occipital) volume to avoid a concave back.
        const posteriorWeight = Math.min(1, Math.max(0, (-z - 0.3) / 1.0));
        x *= 1 + posteriorWeight * 0.12;
        y *= 1 + posteriorWeight * 0.07;
        z *= 1 + posteriorWeight * 0.12;

        // Add a smooth occipital dome centered on the back-lower region.
        const occipitalDome =
          Math.exp(-Math.pow(z + 1.05, 2) / 0.22) *
          Math.exp(-Math.pow(y + 0.05, 2) / 0.85);
        x *= 1 + occipitalDome * 0.08;
        y *= 1 + occipitalDome * 0.1;
        z -= occipitalDome * 0.09;

        // Flatten base slightly.
        y *= (0.95 + 0.08 * Math.tanh((y + 0.12) * 2.2));

        // Soften the fissure as we move backward, so the rear contour stays full.
        const backFissureFade = 1 - posteriorWeight * 0.65;
        const fissureStrength =
          Math.exp(-Math.pow(Math.abs(x) - 0.1, 2) / 0.018) * 0.08 * backFissureFade;
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
      } else if (region < 0.98) {
        // Cerebellum.
        const side = Math.random() > 0.5 ? 1 : -1;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const shell = 0.72 + Math.pow(Math.random(), 0.48) * 0.28;

        x = (Math.abs(0.5 * Math.sin(phi) * Math.cos(theta)) + 0.08) * side * shell;
        y = (-0.62 + 0.38 * Math.cos(phi)) * shell;
        z = (-0.78 + 0.4 * Math.sin(phi) * Math.sin(theta)) * shell;

        const folds = Math.sin((x * 8.3 + z * 8.1)) * Math.cos(y * 8.9);
        const displacement = 1 + folds * 0.032;
        x *= displacement;
        y *= displacement;
        z *= displacement;
      } else {
        // Brainstem.
        const t = Math.random();
        const angle = Math.random() * Math.PI * 2;
        const radius = (1 - t) * 0.08 + 0.035;
        x = Math.cos(angle) * radius;
        y = -0.88 - t * 0.58;
        z = -0.58 + Math.sin(angle) * radius * 0.45;
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

      // Video-like cyan -> violet -> warm top gradient.
      const xNorm = Math.min(1, Math.max(0, (x + 1.45) / 2.9));
      const yNorm = Math.min(1, Math.max(0, (y + 1.05) / 2.1));
      const cyan: [number, number, number] = [0.57, 0.94, 0.98];
      const violet: [number, number, number] = [0.53, 0.46, 0.97];
      const warm: [number, number, number] = [0.97, 0.86, 0.78];

      let r = cyan[0] + (violet[0] - cyan[0]) * xNorm;
      let g = cyan[1] + (violet[1] - cyan[1]) * xNorm;
      let b = cyan[2] + (violet[2] - cyan[2]) * xNorm;

      const topWarm = Math.pow(yNorm, 1.25) * 0.34;
      r = r + (warm[0] - r) * topWarm;
      g = g + (warm[1] - g) * topWarm;
      b = b + (warm[2] - b) * topWarm;

      // Slight shading near lower-right to match the reference depth.
      const lowerShade = Math.max(0, -y - 0.05) * 0.16 + Math.max(0, x) * 0.06;
      const shadeFactor = Math.max(0.78, 1 - lowerShade);

      nextColors[i * 3] = r * shadeFactor;
      nextColors[i * 3 + 1] = g * shadeFactor;
      nextColors[i * 3 + 2] = b * shadeFactor;

      // Increase particle visibility without changing particle size/glow radius.
      nextColors[i * 3] = Math.min(1, nextColors[i * 3] * visibilityBoost);
      nextColors[i * 3 + 1] = Math.min(1, nextColors[i * 3 + 1] * visibilityBoost);
      nextColors[i * 3 + 2] = Math.min(1, nextColors[i * 3 + 2] * visibilityBoost);
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
      // Clockwise spin on the homepage hero scene.
      groupRef.current.rotation.y = -t * 0.12;
      groupRef.current.rotation.x = Math.sin(t * 0.12) * 0.03;
      groupRef.current.rotation.z = 0;
      groupRef.current.position.x = 0;
      groupRef.current.position.y = Math.sin(t * 0.28) * 0.05;
    }
    if (pointsRef.current) pointsRef.current.rotation.z = 0;
  });

  return (
    <group ref={groupRef} scale={[1.4, 1.4, 1.4]}>
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
          opacity={1}
          toneMapped={false}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      
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

  const { line, geometry, material } = useMemo(() => {
    const nextGeometry = new THREE.BufferGeometry().setFromPoints(points.current);
    const nextMaterial = new THREE.LineBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.1 });
    const nextLine = new THREE.Line(nextGeometry, nextMaterial);
    return { line: nextLine, geometry: nextGeometry, material: nextMaterial };
  }, []);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  return (
    <primitive ref={lineRef} object={line} />
  );
};

export const HeroScene: React.FC = () => {
  // Silver-gray hero backdrop tuned between the original light and dark looks.
  const backgroundColor = '#E8EAFD';
  const ambientIntensity = 0.98;
  const keyLightIntensity = 2.75;
  const fillLightIntensity = 2.25;
  const rimLightIntensity = 1.9;
  const spotIntensity = 1.1;

  return (
    <div className="absolute inset-0 z-0 opacity-100 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        {/* Background color matching the reference image's soft gradient base */}
        <color attach="background" args={[backgroundColor]} />
        
        {/* Atmospheric lighting to match reference image's soft multi-directional glow */}
        <ambientLight intensity={ambientIntensity} />
        <pointLight position={[10, 10, 10]} intensity={keyLightIntensity} color="#f1f3ff" /> {/* Warm/cool key */}
        <pointLight position={[-10, -5, 5]} intensity={fillLightIntensity} color="#c6cee7" /> {/* Fill */}
        <pointLight position={[0, 5, -5]} intensity={rimLightIntensity} color="#eddff6" /> {/* Rim */}
        <spotLight position={[0, 10, 0]} intensity={spotIntensity} angle={0.5} penumbra={1} color="#ffffff" />
        
        <Float speed={0.55} rotationIntensity={0} floatIntensity={0.06}>
          <QuantumBrain />
          {/* Keep only a few lines so the reference-style silhouette stays clean. */}
          {[...Array(4)].map((_, i) => (
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
