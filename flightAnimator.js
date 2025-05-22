import * as THREE from 'three';
import { scene } from './main.js';
import { latLonAltToVec3 } from './utils.js';

const colors = [0xff0000, 0x00ff00, 0x0000ff];
export const animatedPlanes = [];
export const animatedObjects = []; // 지우기용

let flightIndex = 0;

function interpolateGreatCircle(from, to, segments = 32) {
  const points = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const interpolated = new THREE.Vector3().lerpVectors(from, to, t).normalize();
    points.push(interpolated);
  }
  return points;
}

export function createFlightPath(flightData, label = null) {
  const color = colors[flightIndex % colors.length];

  const rawPositions = flightData.map(p => latLonAltToVec3(p.lon, p.lat, p.alt));
  let positions = [];
  for (let i = 0; i < rawPositions.length - 1; i++) {
    const arc = interpolateGreatCircle(rawPositions[i], rawPositions[i + 1], 20);
    positions.push(...arc);
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(positions);
  const material = new THREE.LineBasicMaterial({ color });
  const line = new THREE.Line(geometry, material);
  scene.add(line);

  const airplane = new THREE.Mesh(
    new THREE.ConeGeometry(0.01, 0.04, 6),
    new THREE.MeshBasicMaterial({ color })
  );
  airplane.rotation.x = Math.PI / 2;
  scene.add(airplane);

  const totalFrames = 600;
  const speed = 1 / totalFrames;

  const id = flightIndex + 1;
  const obj = { id, label: label || `Trajectory ${id}`, airplane, line };

  animatedPlanes.push({
    airplane,
    positions,
    progress: 0,
    speed
  });
  animatedObjects.push(obj);
  flightIndex++;

  return obj; // UI로 넘겨줄 수 있음
}

export function animateFlights() {
  animatedPlanes.forEach(p => {
    if (p.progress >= 1) return;

    p.progress += p.speed;
    if (p.progress > 1) p.progress = 1;

    const total = p.positions.length - 1;
    const i = Math.floor(p.progress * total);
    const t = (p.progress * total) - i;

    if (i < total) {
      const from = p.positions[i];
      const to = p.positions[i + 1];

      p.airplane.position.lerpVectors(from, to, t);

      const dir = new THREE.Vector3().subVectors(to, from).normalize();
      const axis = new THREE.Vector3(0, 1, 0); // cone 기준 방향
      const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, dir);
      p.airplane.setRotationFromQuaternion(quaternion);
    }
  });
}

export function deleteFlight(id) {
  const obj = animatedObjects.find(o => o.id === id);
  if (!obj) return;

  scene.remove(obj.airplane);
  scene.remove(obj.line);

  const idx = animatedObjects.findIndex(o => o.id === id);
  if (idx >= 0) animatedObjects.splice(idx, 1);
}
