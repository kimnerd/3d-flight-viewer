// import * as THREE from 'three';
// import { scene } from './main.js';

// export const flights = [];

// export function createFlightPath(points) {
//   const geometry = new THREE.BufferGeometry();
//   const positions = [];

//   const earthRadius = 1.0;
//   const earthRadiusKm = 6371;
//   const visualScaleFactor = 10;  // 시각적 고도 확대 배율 (조정 가능)

//   points.forEach(p => {
//     const phi = (90 - p.lat) * Math.PI / 180;
//     const theta = (p.lon + 180) * Math.PI / 180;

//     // 고도(m) → km 변환, 기본 50m
//     const altKm = (p.alt ?? 50) / 1000;

//     // 지구 반경 + 고도 (스케일 보정)
//     const r = earthRadius + (altKm / earthRadiusKm) * visualScaleFactor;

//     const x = r * Math.sin(phi) * Math.cos(theta);
//     const y = r * Math.cos(phi);
//     const z = r * Math.sin(phi) * Math.sin(theta);

//     positions.push(x, y, z);
//   });

//   geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

//   const color = new THREE.Color(Math.random(), Math.random(), Math.random());
//   const material = new THREE.LineBasicMaterial({ color, linewidth: 2, transparent: false, opacity: 1 });

//   const line = new THREE.Line(geometry, material);
//   scene.add(line);

//   const traj = { line, rawPoints: points };
//   flights.push(traj);
//   return traj;
// }

// export function animateFlights() {
//   // 필요한 경우 애니메이션 로직 추가
// }
