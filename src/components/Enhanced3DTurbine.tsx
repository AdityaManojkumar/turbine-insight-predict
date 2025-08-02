import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Text, Html } from '@react-three/drei';
import { Suspense, useRef, useState } from 'react';
import { Group, Vector3 } from 'three';
import { useFrame } from '@react-three/fiber';

interface Enhanced3DTurbineProps {
  faultStatus: string;
  rotationSpeed: number;
  affectedComponents: string[];
  shapValues?: { [key: string]: number };
  className?: string;
}

interface FaultLocation {
  position: Vector3;
  component: string;
  severity: number;
}

function ComponentMarker({ position, component, severity }: { position: Vector3; component: string; severity: number }) {
  const markerRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (markerRef.current) {
      markerRef.current.rotation.y = state.clock.elapsedTime * 2;
    }
  });

  const getMarkerColor = () => {
    if (severity > 0.7) return '#ef4444'; // Red for high severity
    if (severity > 0.4) return '#f59e0b'; // Yellow for medium severity
    return '#10b981'; // Green for low severity
  };

  return (
    <group
      ref={markerRef}
      position={position}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <mesh>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color={getMarkerColor()} transparent opacity={0.8} />
      </mesh>
      
      {hovered && (
        <Html distanceFactor={10}>
          <div className="bg-black/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
            <div className="font-semibold">{component}</div>
            <div>Severity: {(severity * 100).toFixed(0)}%</div>
          </div>
        </Html>
      )}
      
      {/* Pulsing ring effect for high severity */}
      {severity > 0.5 && (
        <mesh>
          <ringGeometry args={[0.15, 0.2, 16]} />
          <meshBasicMaterial color={getMarkerColor()} transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
}

function EnhancedTurbineModel({ 
  faultStatus, 
  rotationSpeed, 
  affectedComponents, 
  shapValues 
}: {
  faultStatus: string;
  rotationSpeed: number;
  affectedComponents: string[];
  shapValues?: { [key: string]: number };
}) {
  const turbineRef = useRef<Group>(null);
  const bladesRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (bladesRef.current) {
      bladesRef.current.rotation.z += rotationSpeed * delta;
    }
    
    // Add slight swaying motion based on wind
    if (turbineRef.current) {
      turbineRef.current.rotation.z = Math.sin(Date.now() * 0.001) * 0.02;
    }
  });

  const getFaultColor = () => {
    switch (faultStatus) {
      case 'fault': return '#ef4444';
      case 'warning': return '#f59e0b';
      default: return '#10b981';
    }
  };

  const getComponentColor = (componentName: string) => {
    if (affectedComponents.includes(componentName)) {
      return faultStatus === 'fault' ? '#ef4444' : '#f59e0b';
    }
    return '#e5e7eb';
  };

  // Define fault locations based on components
  const getFaultLocations = (): FaultLocation[] => {
    const locations: FaultLocation[] = [];
    
    if (affectedComponents.includes('Gearbox')) {
      locations.push({
        position: new Vector3(0, 1.5, 0),
        component: 'Gearbox',
        severity: shapValues?.vibrationLevels || 0.5
      });
    }
    
    if (affectedComponents.includes('Generator')) {
      locations.push({
        position: new Vector3(-0.5, 2, 0),
        component: 'Generator',
        severity: shapValues?.componentTemperatures || 0.5
      });
    }
    
    if (affectedComponents.includes('Bearings')) {
      locations.push({
        position: new Vector3(1.25, 2, 0),
        component: 'Bearings',
        severity: shapValues?.vibrationLevels || 0.4
      });
    }
    
    if (affectedComponents.includes('Power Electronics')) {
      locations.push({
        position: new Vector3(0, -4, 0),
        component: 'Power Electronics',
        severity: shapValues?.powerFactor || 0.3
      });
    }

    if (affectedComponents.includes('Rotor')) {
      locations.push({
        position: new Vector3(2, 2, 0),
        component: 'Rotor',
        severity: shapValues?.windSpeed || 0.4
      });
    }
    
    return locations;
  };

  const faultLocations = getFaultLocations();

  return (
    <group ref={turbineRef}>
      {/* Base Platform */}
      <mesh position={[0, -6.2, 0]}>
        <cylinderGeometry args={[2, 2, 0.5, 16]} />
        <meshStandardMaterial color={getComponentColor('Foundation')} />
      </mesh>

      {/* Tower with segments for detailed fault visualization */}
      <group>
        {Array.from({ length: 4 }).map((_, i) => (
          <mesh key={i} position={[0, -4 + i * 2, 0]}>
            <cylinderGeometry args={[0.3 + i * 0.05, 0.35 + i * 0.05, 2, 8]} />
            <meshStandardMaterial 
              color={getComponentColor('Tower')}
              transparent
              opacity={affectedComponents.includes('Tower') ? 0.7 : 1}
            />
          </mesh>
        ))}
      </group>

      {/* Nacelle */}
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[2.5, 1, 1]} />
        <meshStandardMaterial 
          color={getComponentColor('Nacelle')} 
          transparent
          opacity={affectedComponents.includes('Nacelle') ? 0.8 : 1}
        />
      </mesh>

      {/* Gearbox (inside nacelle, visible as a smaller box) */}
      <mesh position={[0, 1.8, 0]}>
        <boxGeometry args={[1, 0.6, 0.6]} />
        <meshStandardMaterial 
          color={getComponentColor('Gearbox')}
          wireframe={affectedComponents.includes('Gearbox')}
        />
      </mesh>

      {/* Generator */}
      <mesh position={[-0.5, 2, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.8, 8]} />
        <meshStandardMaterial 
          color={getComponentColor('Generator')}
          transparent
          opacity={affectedComponents.includes('Generator') ? 0.7 : 1}
        />
      </mesh>

      {/* Rotor Shaft */}
      <mesh position={[0.625, 2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 1.25, 8]} />
        <meshStandardMaterial color="#374151" />
      </mesh>

      {/* Hub */}
      <mesh position={[1.25, 2, 0]}>
        <sphereGeometry args={[0.3, 16, 8]} />
        <meshStandardMaterial 
          color={getComponentColor('Bearings')}
          wireframe={affectedComponents.includes('Bearings')}
        />
      </mesh>

      {/* Blades with enhanced visualization */}
      <group ref={bladesRef} position={[1.25, 2, 0]}>
        {/* Blade 1 - pointing up */}
        <mesh position={[0, 1.5, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.2, 3, 0.05]} />
          <meshStandardMaterial 
            color={getComponentColor('Rotor')}
            transparent
            opacity={affectedComponents.includes('Rotor') ? 0.8 : 1}
          />
        </mesh>
        
        {/* Blade 2 - 120 degrees */}
        <mesh position={[-1.299, -0.75, 0]} rotation={[0, 0, (2 * Math.PI) / 3]}>
          <boxGeometry args={[0.2, 3, 0.05]} />
          <meshStandardMaterial 
            color={getComponentColor('Rotor')}
            transparent
            opacity={affectedComponents.includes('Rotor') ? 0.8 : 1}
          />
        </mesh>
        
        {/* Blade 3 - 240 degrees */}
        <mesh position={[1.299, -0.75, 0]} rotation={[0, 0, -(2 * Math.PI) / 3]}>
          <boxGeometry args={[0.2, 3, 0.05]} />
          <meshStandardMaterial 
            color={getComponentColor('Rotor')}
            transparent
            opacity={affectedComponents.includes('Rotor') ? 0.8 : 1}
          />
        </mesh>
      </group>

      {/* Fault Location Markers */}
      {faultLocations.map((location, index) => (
        <ComponentMarker
          key={index}
          position={location.position}
          component={location.component}
          severity={location.severity}
        />
      ))}

      {/* Status Label */}
      <Text
        position={[0, 4, 0]}
        fontSize={0.5}
        color={getFaultColor()}
        anchorX="center"
        anchorY="middle"
      >
        {faultStatus.toUpperCase()}
      </Text>
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

export default function Enhanced3DTurbine({ 
  faultStatus, 
  rotationSpeed, 
  affectedComponents, 
  shapValues,
  className 
}: Enhanced3DTurbineProps) {
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
          <EnhancedTurbineModel 
            faultStatus={faultStatus} 
            rotationSpeed={rotationSpeed}
            affectedComponents={affectedComponents}
            shapValues={shapValues}
          />
          <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        </Suspense>
      </Canvas>
      
      {/* Enhanced Status Panel */}
      <div className="absolute top-4 right-4 bg-card/95 backdrop-blur-sm rounded-lg p-4 shadow-lg border min-w-48">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div 
              className={`w-3 h-3 rounded-full ${
                faultStatus === 'fault' ? 'bg-destructive animate-pulse' :
                faultStatus === 'warning' ? 'bg-yellow-500 animate-pulse' :
                'bg-secondary'
              }`}
            />
            <span className="text-sm font-medium capitalize">
              {faultStatus === 'normal' ? 'Healthy' : faultStatus}
            </span>
          </div>
          
          {affectedComponents.length > 0 && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">Affected Components:</div>
              <div className="space-y-1">
                {affectedComponents.slice(0, 3).map((component, index) => (
                  <div key={index} className="text-xs bg-muted px-2 py-1 rounded">
                    {component}
                  </div>
                ))}
                {affectedComponents.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{affectedComponents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="text-xs text-muted-foreground">
            Click and drag to rotate • Scroll to zoom
          </div>
        </div>
      </div>
    </div>
  );
}