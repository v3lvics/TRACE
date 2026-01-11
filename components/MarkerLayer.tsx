'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import { Color, InstancedMesh, Matrix4, Vector3 } from 'three';
import { Text } from '@react-three/drei';
import { clusterFootprints } from '../lib/cluster';
import type { Footprint } from '../lib/types';

const RADIUS = 2.05;

const toCartesian = (lat: number, lng: number, radius = RADIUS) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new Vector3(x, y, z);
};

type MarkerLayerProps = {
  footprints: Footprint[];
  selectedId: string | null;
  onSelect: (footprint: Footprint) => void;
  cameraDistance: number;
};

type MarkerItem = {
  id: string;
  position: Vector3;
  count?: number;
  footprints: Footprint[];
};

export default function MarkerLayer({ footprints, selectedId, onSelect, cameraDistance }: MarkerLayerProps) {
  const meshRef = useRef<InstancedMesh>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const markerItems = useMemo<MarkerItem[]>(() => {
    if (cameraDistance > 6 && footprints.length > 6) {
      const grid = cameraDistance > 8 ? 10 : 6;
      return clusterFootprints(footprints, grid).map((cluster) => ({
        id: cluster.id,
        position: toCartesian(cluster.lat, cluster.lng),
        count: cluster.count,
        footprints: cluster.footprints
      }));
    }

    return footprints.map((footprint) => ({
      id: footprint.id,
      position: toCartesian(footprint.location.lat, footprint.location.lng),
      footprints: [footprint]
    }));
  }, [cameraDistance, footprints]);

  useEffect(() => {
    if (!meshRef.current) return;
    const tempMatrix = new Matrix4();
    const color = new Color();

    markerItems.forEach((item, index) => {
      const scale = item.count ? 0.14 + Math.min(item.count, 12) * 0.01 : 0.12;
      const position = item.position.clone().multiplyScalar(1.02);
      tempMatrix.setPosition(position);
      tempMatrix.scale(new Vector3(scale, scale, scale));
      meshRef.current?.setMatrixAt(index, tempMatrix);

      const isSelected = item.footprints.some((footprint) => footprint.id === selectedId);
      const isHovered = hoveredId === item.id;
      if (isSelected) {
        color.set('#7c4dff');
      } else if (isHovered) {
        color.set('#63f5ff');
      } else {
        color.set('#8cf6ff');
      }
      meshRef.current?.setColorAt(index, color);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [markerItems, hoveredId, selectedId]);

  return (
    <group>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, markerItems.length]}
        onPointerMove={(event) => {
          event.stopPropagation();
          if (event.instanceId === undefined) return;
          setHoveredId(markerItems[event.instanceId]?.id ?? null);
        }}
        onPointerOut={() => setHoveredId(null)}
        onClick={(event) => {
          event.stopPropagation();
          if (event.instanceId === undefined) return;
          const item = markerItems[event.instanceId];
          if (item?.footprints[0]) {
            onSelect(item.footprints[0]);
          }
        }}
      >
        <boxGeometry args={[0.07, 0.07, 0.07]} />
        <meshStandardMaterial vertexColors transparent opacity={0.85} />
      </instancedMesh>

      {markerItems
        .filter((item) => item.count && item.count > 1)
        .map((item) => (
          <Text
            key={`count-${item.id}`}
            position={item.position.clone().multiplyScalar(1.08)}
            fontSize={0.18}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            {item.count}
          </Text>
        ))}
    </group>
  );
}
