import * as THREE from 'three';
import { scene } from './main.js';

export const flights = [];

export function createFlightPath(points) {
  const geometry = new THREE.BufferGeometry();
  const positions = [];

  const earthRadius = 1.0;
  const altScale = 1 / 6371; // 지구 반지름 기준 보정
  const scaleFactor = 10000; // 고도 시각적 강조 배율

  points.forEach(p => {
    const phi = (90 - p.lat) * Math.PI / 180;
    const theta = (p.lon + 180) * Math.PI / 180;
    const alt = p.alt ?? 0.05;
    const r = earthRadius + alt * altScale * scaleFactor;

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.cos(phi);
    const z = r * Math.sin(phi) * Math.sin(theta);
    positions.push(x, y, z);
  });

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const color = new THREE.Color(Math.random(), Math.random(), Math.random());
  const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color }));
  scene.add(line);

  const traj = { line, rawPoints: points };
  flights.push(traj);
  return traj;
}

export function animateFlights() {
  // 선택적으로 비행기 애니메이션 가능
}
