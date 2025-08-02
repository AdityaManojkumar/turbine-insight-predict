import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import { Group } from 'three';
import { useFrame } from '@react-three/fiber';

interface TurbineProps {
  faultStatus: string;
  rotationSpeed: number;
}

function TurbineModel({ faultStatus, rotationSpeed }: TurbineProps) {
  const turbineRef = useRef<Group>(null);
  const bladesRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (bladesRef.current) {
      bladesRef.current.rotation.z += rotationSpeed * delta;
    }
  });

  const getFaultColor = () => {
    switch (faultStatus) {
      case 'fault': return '#ef4444';
      case 'warning': return '#f59e0b';
      default: return '#10b981';
    }
  };

  return (
    <group ref={turbineRef}>
      {/* Tower */}
      <mesh position={[0, -2, 0]}>
        <cylinderGeometry args={[0.3, 0.5, 8, 8]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>

      {/* Nacelle */}
      <mesh position={[0, 2, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[2.5, 1, 1]} />
        <meshStandardMaterial color={getFaultColor()} />
      </mesh>

      {/* Rotor Shaft */}
      <mesh position={[1.25, 2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.15, 0.15, 0.8, 8]} />
        <meshStandardMaterial color="#374151" />
      </mesh>

      {/* Hub */}
      <mesh position={[1.25, 2, 0]}>
        <sphereGeometry args={[0.3, 16, 8]} />
        <meshStandardMaterial color="#374151" />
      </mesh>

      {/* Blades */}
      <group ref={bladesRef} position={[1.25, 2, 0]}>
        {/* Blade 1 - pointing up */}
        <mesh position={[0, 1.5, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.2, 3, 0.05]} />
          <meshStandardMaterial color="#f3f4f6" />
        </mesh>
        
        {/* Blade 2 - 120 degrees clockwise */}
        <mesh position={[-1.299, -0.75, 0]} rotation={[0, 0, (2 * Math.PI) / 3]}>
          <boxGeometry args={[0.2, 3, 0.05]} />
          <meshStandardMaterial color="#f3f4f6" />
        </mesh>
        
        {/* Blade 3 - 240 degrees clockwise */}
        <mesh position={[1.299, -0.75, 0]} rotation={[0, 0, -(2 * Math.PI) / 3]}>
          <boxGeometry args={[0.2, 3, 0.05]} />
          <meshStandardMaterial color="#f3f4f6" />
        </mesh>
      </group>

      {/* Base Platform */}
      <mesh position={[0, -6.2, 0]}>
        <cylinderGeometry args={[2, 2, 0.5, 16]} />
        <meshStandardMaterial color="#6b7280" />
      </mesh>
    </group>
  );
}

function Loading3D() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial wireframe color="#0ea5e9" />
    </mesh>
  );
}

interface WindTurbine3DProps {
  faultStatus: string;
  rotationSpeed: number;
  className?: string;
}

export default function WindTurbine3D({ faultStatus, rotationSpeed, className }: WindTurbine3DProps) {
  return (
    <div className={`relative h-full w-full ${className}`}>
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[8, 4, 8]} fov={60} />
        <Suspense fallback={<Loading3D />}>
          <Environment preset="sunset" />
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <TurbineModel faultStatus={faultStatus} rotationSpeed={rotationSpeed} />
          <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        </Suspense>
      </Canvas>
      
      {/* Status Indicator */}
      <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="flex items-center gap-2">
          <div 
            className={`w-3 h-3 rounded-full ${
              faultStatus === 'fault' ? 'bg-destructive animate-pulse' :
              faultStatus === 'warning' ? 'bg-yellow-500 animate-pulse' :
              'bg-secondary'
            }`}
          />
          <span className="text-sm font-medium capitalize">{faultStatus === 'normal' ? 'Healthy' : faultStatus}</span>
        </div>
      </div>
    </div>
  );
}