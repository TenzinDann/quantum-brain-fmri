/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef } from 'react';
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
  
  // Create brain-like point cloud
  const particlesCount = 12000;
  const positions = new Float32Array(particlesCount * 3);
  const colors = new Float32Array(particlesCount * 3);
  
  for (let i = 0; i < particlesCount; i++) {
    // Brain shape logic
    const isLeft = Math.random() > 0.5;
    const side = isLeft ? -1 : 1;
    
    // Base coordinates
    const u = Math.random() * Math.PI; // front to back
    const v = (Math.random() - 0.5) * Math.PI; // bottom to top
    
    let x = 1.3 * Math.sin(u) * Math.cos(v);
    let y = 1.1 * Math.sin(v);
    let z = 1.6 * Math.cos(u);
    
    // Hemisphere separation
    x = (x * 0.85 + 0.35) * side;
    
    // Lobe scaling
    if (z > 0.5) { x *= 1.1; y *= 1.1; }
    if (z > -0.5 && z < 0.5 && y < 0) { x *= 1.2; }
    if (z < -0.8 && y < -0.2) { x *= 0.7; y *= 0.8; z -= 0.1; }
    
    // Brainstem logic
    const isBrainstem = Math.random() > 0.92;
    if (isBrainstem) {
      const stemU = Math.random();
      x = (Math.random() - 0.5) * 0.3;
      y = -1.0 - stemU * 0.8;
      z = -0.4 - stemU * 0.2;
    }
    
    // Gyri and Sulci
    const foldFreq = 7.0;
    const foldAmp = 0.18;
    const folds = Math.sin(x * foldFreq) * Math.cos(y * foldFreq) * Math.sin(z * foldFreq);
    const microFolds = Math.sin(x * 15) * Math.cos(y * 15) * 0.04;
    
    const displacement = isBrainstem ? 1.0 : (1.0 + (folds * foldAmp) + microFolds);
    
    positions[i * 3] = x * displacement;
    positions[i * 3 + 1] = y * displacement;
    positions[i * 3 + 2] = z * displacement;
    
    // Colors: Very soft pastel palette (Purple, Blue, Pink, Cream)
    const mix = Math.random();
    if (isBrainstem) {
      colors[i * 3] = 0.98; // Off-white/Cream
      colors[i * 3 + 1] = 0.98;
      colors[i * 3 + 2] = 0.99;
    } else if (mix > 0.75) {
      colors[i * 3] = 1.0; // Very Soft Pink
      colors[i * 3 + 1] = 0.92;
      colors[i * 3 + 2] = 0.96;
    } else if (mix > 0.5) {
      colors[i * 3] = 0.94; // Very Soft Purple
      colors[i * 3 + 1] = 0.92;
      colors[i * 3 + 2] = 1.0;
    } else if (mix > 0.25) {
      colors[i * 3] = 0.92; // Very Soft Blue
      colors[i * 3 + 1] = 0.96;
      colors[i * 3 + 2] = 1.0;
    } else {
      colors[i * 3] = 1.0; // Pure White/Cream
      colors[i * 3 + 1] = 0.99;
      colors[i * 3 + 2] = 0.97;
    }
  }

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      groupRef.current.rotation.y = t * 0.12;
      groupRef.current.rotation.x = Math.sin(t * 0.2) * 0.1;
      groupRef.current.position.y = Math.sin(t * 0.4) * 0.15;
    }
    if (pointsRef.current) {
      pointsRef.current.rotation.z = state.clock.getElapsedTime() * 0.03;
    }
  });

  return (
    <group ref={groupRef}>
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
          opacity={0.85}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
      
      {/* Soft internal glow */}
      <Sphere args={[0.8, 32, 32]}>
        <meshBasicMaterial color="#ffffff" transparent opacity={0.1} />
      </Sphere>
      <pointLight intensity={1.5} distance={3} color="#ffffff" />
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
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={2.5} color="#fff8f0" /> {/* Warm top-right */}
        <pointLight position={[-10, -5, 5]} intensity={2} color="#e0e5ff" /> {/* Cool bottom-left */}
        <pointLight position={[0, 5, -5]} intensity={1.5} color="#ffe0f0" /> {/* Soft pink back */}
        <spotLight position={[0, 10, 0]} intensity={1} angle={0.5} penumbra={1} color="#ffffff" />
        
        <Float speed={1.0} rotationIntensity={0.1} floatIntensity={0.3}>
          <QuantumBrain />
          {/* Very subtle neural connections */}
          {[...Array(20)].map((_, i) => (
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