// ===== THREE.js 모듈 불러오기 =====
import * as THREE from 'https://esm.sh/three';

// ===== utils.js =====
function encodeFlightData(data) {
  return btoa(JSON.stringify(data));
}

function decodeFlightData(encoded) {
  try {
    return JSON.parse(atob(encoded));
  } catch (e) {
    console.error('Failed to decode flight data:', e);
    return null;
  }
}

// ===== flightData.js =====
const flights = [];

// ===== flightAnimator.js =====
let airplane;

function createFlightPath(points, THREE) {
  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array(points.length * 3);
  points.forEach((point, i) => {
    vertices[i * 3] = point.lon;
    vertices[i * 3 + 1] = point.alt;
    vertices[i * 3 + 2] = point.lat;
  });
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
  return new THREE.Line(geometry, material);
}

function animateFlight(path, scene, THREE, onFinish) {
  const positions = path.geometry.attributes.position.array;
  const pointCount = positions.length / 3;

  if (!airplane) {
    const geometry = new THREE.BoxGeometry(1, 1, 2);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    airplane = new THREE.Mesh(geometry, material);
    scene.add(airplane);
  }

  let frame = 0;

  function animate() {
    if (frame < pointCount) {
      const i = frame * 3;
      airplane.position.set(positions[i], positions[i + 1], positions[i + 2]);
      frame++;
      requestAnimationFrame(animate);
    } else {
      onFinish && onFinish();
    }
  }

  animate();
}

// ===== ui.js =====
function setupUI(scene, animateFlight, createFlightPath, THREE) {
  document.getElementById('startBtn').onclick = () => {
    const input = document.getElementById('flightInput').value;
    const flightData = decodeFlightData(input);
    if (!flightData) return;

    const path = createFlightPath(flightData, THREE);
    scene.add(path);
    animateFlight(path, scene, THREE);
  };
}

// ===== main.js =====
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 카메라 위치 설정
camera.position.set(0, 50, 100);
camera.lookAt(0, 0, 0);

// 지구 와이어프레임 (기본 배경)
const earthGeometry = new THREE.SphereGeometry(30, 32, 32);
const earthMaterial = new THREE.MeshBasicMaterial({ color: 0x2244ff, wireframe: true });
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);

// 좌표축
const axesHelper = new THREE.AxesHelper(50);
scene.add(axesHelper);

// 애니메이션 루프
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// UI 설정
setupUI(scene, animateFlight, createFlightPath, THREE);
