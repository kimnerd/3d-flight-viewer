import * as THREE from 'three';
import { OrbitControls } from 'https://unpkg.com/three@0.158.0/examples/jsm/controls/OrbitControls.js';

export const scene = new THREE.Scene();

export const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 3;

export const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

export const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 1.2; // 지구보다 약간 더 멀게
controls.maxDistance = 10;

// 🌍 텍스처 입힌 지구
const texture = new THREE.TextureLoader().load(
  'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg'
);
const earthMaterial = new THREE.MeshBasicMaterial({ map: texture });
const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);

// 반응형 처리
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
