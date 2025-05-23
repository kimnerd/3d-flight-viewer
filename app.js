// ===== File: utils.js =====
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

// ===== File: flightData.js =====
const flights = [];

// ===== File: flightAnimator.js =====
let airplane;

function createFlightPath(points, THREE) {
  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array(points.length * 3);
  points.forEach((point, i) => {
    vertices[i * 3] = point.lat;
    vertices[i * 3 + 1] = point.alt;
    vertices[i * 3 + 2] = point.lon;
  });
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
  const line = new THREE.Line(geometry, material);
  return line;
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

// ===== File: ui.js =====
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

// ===== File: main.js =====
import * as THREE from 'https://esm.sh/three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.z = 100;

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();
setupUI(scene, animateFlight, createFlightPath, THREE);
