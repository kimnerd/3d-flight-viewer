import * as THREE from 'three';
import { scene } from './main.js';
import { latLonAltToVec3 } from './utils.js';

const colors = [0xff0000, 0x00ff00, 0x0000ff];
export const animatedPlanes = [];

let flightIndex = 0;

export function createFlightPath(flightData) {
  const color = colors[flightIndex % colors.length];
  const positions = flightData.map(p => latLonAltToVec3(p.lon, p.lat, p.alt));

  // 궤적 라인
  const geometry = new THREE.BufferGeometry().setFromPoints(positions);
  const material = new THREE.LineBasicMaterial({ color });
  const line = new THREE.Line(geometry, material);
  scene.add(line);

  // 비행기 모형
  const airplane = new THREE.Mesh(
    new THREE.ConeGeometry(0.01, 0.04, 6),
    new THREE.MeshBasicMaterial({ color })
  );
  airplane.rotation.x = Math.PI / 2; // 초기 방향 정렬
  scene.add(airplane);

  // 총 프레임 기준 속도 설정 (약 10초 동안 이동)
  const totalFrames = 600;
  const speed = 1 / totalFrames;

  animatedPlanes.push({
    airplane,
    positions,
    progress: 0,
    speed
  });

  flightIndex++;
}

export function animateFlights() {
  animatedPlanes.forEach(p => {
    if (p.progress >= 1) return; // 도착하면 정지

    p.progress += p.speed;
    if (p.progress > 1) p.progress = 1;

    const total = p.positions.length - 1;
    const i = Math.floor(p.progress * total);
    const t = (p.progress * total) - i;

    if (i < total) {
      const from = p.positions[i];
      const to = p.positions[i + 1];

      // 위치 보간
      p.airplane.position.lerpVectors(from, to, t);

      // 방향 보간 후 lookAt으로 정렬
      const dir = new THREE.Vector3().subVectors(to, from).normalize();
      p.airplane.lookAt(p.airplane.position.clone().add(dir));
    }
  });
}
