import * as THREE from 'three';
import { scene } from './main.js';
import { latLonAltToVec3 } from './utils.js';

const colors = [0xff0000, 0x00ff00, 0x0000ff];
export const animatedPlanes = [];

let flightIndex = 0;

export function createFlightPath(flightData) {
  const color = colors[flightIndex % colors.length];
  const positions = flightData.map(p => latLonAltToVec3(p.lon, p.lat, p.alt));

  const geometry = new THREE.BufferGeometry().setFromPoints(positions);
  const material = new THREE.LineBasicMaterial({ color });
  const line = new THREE.Line(geometry, material);
  scene.add(line);

  const airplane = new THREE.Mesh(
    new THREE.ConeGeometry(0.01, 0.04, 6),
    new THREE.MeshBasicMaterial({ color })
  );
  scene.add(airplane);

  animatedPlanes.push({ airplane, positions, index: 0 });
  flightIndex++;
}

export function animateFlights() {
  animatedPlanes.forEach(p => {
    p.index = (p.index + 1) % p.positions.length;
    p.airplane.position.copy(p.positions[p.index]);
  });
}
