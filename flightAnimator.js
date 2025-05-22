import * as THREE from 'three';
import { scene } from './main.js';
import { latLonAltToVec3 } from './utils.js';

let flightIdCounter = 1;
const flights = [];

export function createFlightPath(points) {
  const id = flightIdCounter++;
  const color = new THREE.Color().setHSL(Math.random(), 1, 0.5);

  // 위치 배열
  const path = points.map(p => latLonAltToVec3(p.lon, p.lat, p.alt));
  const geometry = new THREE.BufferGeometry().setFromPoints(path);
  const material = new THREE.LineBasicMaterial({ color });
  const line = new THREE.Line(geometry, material);
  scene.add(line);

  // 비행기 객체
  const airplane = new THREE.Mesh(
    new THREE.ConeGeometry(0.01, 0.04, 8),
    new THREE.MeshBasicMaterial({ color })
  );
  airplane.rotateX(Math.PI / 2); // 앞 방향으로 정렬
  scene.add(airplane);

  const flight = {
    id,
    label: `Traj ${id}`,
    path,
    mesh: airplane,
    startTime: null,
    duration: 10000, // 10초 애니메이션
    finished: false
  };

  flights.push(flight);
  return flight;
}

export function deleteFlight(id) {
  const idx = flights.findIndex(f => f.id === id);
  if (idx >= 0) {
    const f = flights[idx];
    scene.remove(f.mesh);
    f.mesh.geometry.dispose();
    f.mesh.material.dispose();
    flights.splice(idx, 1);
  }
}

export function animateFlights() {
  const now = performance.now();
  for (const flight of flights) {
    if (flight.finished) continue;

    if (!flight.startTime) {
      flight.startTime = now;
    }

    const elapsed = now - flight.startTime;
    const t = Math.min(elapsed / flight.duration, 1); // 한 번만 실행

    const path = flight.path;
    const i = Math.floor(t * (path.length - 1));
    const next = path[i + 1];

    if (i >= path.length - 1 || !next) {
      flight.mesh.position.copy(path[path.length - 1]);
      flight.finished = true;
      continue;
    }

    // 선형 보간
    const p1 = path[i];
    const p2 = path[i + 1];
    const localT = (t * (path.length - 1)) % 1;
    flight.mesh.position.lerpVectors(p1, p2, localT);

    // 방향 보정
    const dir = new THREE.Vector3().subVectors(p2, p1);
    if (dir.lengthSq() > 0.00001) {
      flight.mesh.lookAt(p2);
    }
  }
}
