import * as THREE from 'three';
import { scene } from './main.js';

export const flights = [];

export function createFlightPath(points) {
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  points.forEach(p => {
    const phi = (90 - p.lat) * Math.PI / 180;
    const theta = (p.lon + 180) * Math.PI / 180;
    const r = 1 + p.alt;
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.cos(phi);
    const z = r * Math.sin(phi) * Math.sin(theta);
    positions.push(x, y, z);
  });
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: Math.random() * 0xffffff }));
  scene.add(line);
  const traj = { line, rawPoints: points };
  flights.push(traj);
  return traj;
}

export function animateFlights() {
  // Optional: animate airplane object here
}
