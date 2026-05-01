import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, Float } from '@react-three/drei';

function AnimatedShape() {
  const meshRef = useRef();

  // Slow rotation and slight movement
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.x = Math.cos(time / 4) * 0.2;
    meshRef.current.rotation.y = Math.sin(time / 4) * 0.2;
  });

  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
      <Sphere ref={meshRef} args={[1, 100, 100]} scale={1.5}>
        <MeshDistortMaterial
          color="#1e293b" // Slate-800
          attach="material"
          distort={0.4}
          speed={1.5}
          roughness={0.5}
        />
      </Sphere>
    </Float>
  );
}

export default function Scene() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />
        <AnimatedShape />
      </Canvas>
    </div>
  );
}