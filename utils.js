import * as THREE from 'three';

export function latLonAltToVec3(lon, lat, alt) {
  const phi = (90 - lat) * Math.PI / 180;
  const theta = (-lon) * Math.PI / 180;
  const radius = 1 + alt * 3; // 고도 확대 계수 3배

  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}
