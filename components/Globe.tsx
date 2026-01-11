'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Suspense, useMemo, useRef, useState } from 'react';
import { CanvasTexture, Mesh, Vector3 } from 'three';
import MarkerLayer from './MarkerLayer';
import type { Footprint } from '../lib/types';

const EARTH_RADIUS = 2;

const toVector = (lat: number, lng: number, radius = EARTH_RADIUS) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new Vector3(x, y, z);
};

type GlobeProps = {
  footprints: Footprint[];
  selectedId: string | null;
  onSelect: (footprint: Footprint) => void;
  scanning: boolean;
};

function createFallbackTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#0e1a2b');
  gradient.addColorStop(0.5, '#1b2f4a');
  gradient.addColorStop(1, '#0b1320');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(99, 245, 255, 0.15)';
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function GlobeSurface() {
  const texture = useMemo(() => createFallbackTexture(), []);

  return (
    <mesh>
      <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
      <meshStandardMaterial map={texture ?? undefined} color="#1b2c44" />
    </mesh>
  );
}

function ScanSweep({ active }: { active: boolean }) {
  const ringRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (!ringRef.current) return;
    if (!active) {
      ringRef.current.visible = false;
      return;
    }
    ringRef.current.visible = true;
    const t = clock.getElapsedTime();
    ringRef.current.rotation.y = t * 0.6;
    ringRef.current.position.y = Math.sin(t * 0.6) * 0.6;
    ringRef.current.scale.setScalar(1 + Math.sin(t) * 0.02);
  });

  return (
    <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[EARTH_RADIUS + 0.08, 0.01, 16, 100]} />
      <meshBasicMaterial color="#63f5ff" transparent opacity={0.35} />
    </mesh>
  );
}

function GlobeScene({ footprints, selectedId, onSelect, scanning }: GlobeProps) {
  const { camera } = useThree();
  const [cameraDistance, setCameraDistance] = useState(camera.position.length());
  const lastDistance = useRef(cameraDistance);

  useFrame(() => {
    const distance = camera.position.length();
    if (Math.abs(distance - lastDistance.current) > 0.1) {
      lastDistance.current = distance;
      setCameraDistance(distance);
    }
  });

  const keyLightPosition = useMemo(() => toVector(20, -45, 6), []);

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={keyLightPosition} intensity={1.6} color="#9ad7ff" />
      <Suspense fallback={null}>
        <GlobeSurface />
      </Suspense>
      <MarkerLayer
        footprints={footprints}
        selectedId={selectedId}
        onSelect={onSelect}
        cameraDistance={cameraDistance}
      />
      <ScanSweep active={scanning} />
      <Stars radius={25} depth={50} count={800} factor={4} fade />
      <OrbitControls enablePan={false} minDistance={3.5} maxDistance={9.5} />
    </>
  );
}

export default function Globe({ footprints, selectedId, onSelect, scanning }: GlobeProps) {
  return (
    <div className="absolute inset-0">
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
        <GlobeScene
          footprints={footprints}
          selectedId={selectedId}
          onSelect={onSelect}
          scanning={scanning}
        />
      </Canvas>
    </div>
  );
}
