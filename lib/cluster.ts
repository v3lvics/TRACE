import type { Footprint } from './types';

export type Cluster = {
  id: string;
  lat: number;
  lng: number;
  count: number;
  footprints: Footprint[];
};

export function clusterFootprints(footprints: Footprint[], gridSize: number): Cluster[] {
  const bins = new Map<string, Cluster>();

  for (const footprint of footprints) {
    const latBin = Math.round(footprint.location.lat / gridSize) * gridSize;
    const lngBin = Math.round(footprint.location.lng / gridSize) * gridSize;
    const key = `${latBin.toFixed(2)}:${lngBin.toFixed(2)}`;

    if (!bins.has(key)) {
      bins.set(key, {
        id: key,
        lat: latBin,
        lng: lngBin,
        count: 0,
        footprints: []
      });
    }

    const cluster = bins.get(key);
    if (cluster) {
      cluster.count += 1;
      cluster.footprints.push(footprint);
    }
  }

  return Array.from(bins.values());
}
