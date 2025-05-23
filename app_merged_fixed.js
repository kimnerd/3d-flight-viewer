// ===== Import Three.js and OrbitControls =====
import * as THREE from 'https://esm.sh/three';
import { OrbitControls } from 'https://esm.sh/three/examples/jsm/controls/OrbitControls.js';

// ===== utils.js =====
function encodeLatLonTrajectory(points) {
  const scale = 20;
  const maxPts = 48;
  const subset = points.length > maxPts
    ? [...Array(maxPts).keys()].map(i => points[Math.floor(i * points.length / maxPts)])
    : points;

  const bytes = subset.map(p => {
    const lat = Math.round((p.lat + 90) * scale);
    const lon = Math.round((180 - p.lon) * scale);  // 좌표계 통일을 위해 반전된 것 기준
    return [(lat >> 8) & 0xff, lat & 0xff, (lon >> 8) & 0xff, lon & 0xff];
  }).flat();

  return btoa(String.fromCharCode(...bytes)).replace(/=/g, '').slice(0, 256);
}

function decodeLatLonCode(code) {
  const bin = atob(code + '='.repeat((4 - code.length % 4) % 4));
  const bytes = Array.from(bin).map(c => c.charCodeAt(0));
  const scale = 20;
  const result = [];
  for (let i = 0; i + 3 < bytes.length; i += 4) {
    const lat = ((bytes[i] << 8) + bytes[i + 1]) / scale - 90;
    const lon = 180 - ((bytes[i + 2] << 8) + bytes[i + 3]) / scale; // 반전 복원
    result.push({ lat: +lat.toFixed(4), lon: +lon.toFixed(4), alt: 0.05 });
  }
  return result;
}

// ===== flightAnimator.js =====
const flights = [];
function createFlightPath(points) {
  const geometry = new THREE.BufferGeometry();
  const positions = [];

  const earthRadius = 1.0;
  const earthRadiusKm = 6371;
  const visualScaleFactor = 10;

  points.forEach((p, idx) => {
    const phi = (90 - p.lat) * Math.PI / 180;
    const theta = (180 - p.lon) * Math.PI / 180;

    const altKm = (p.alt ?? 50) / 1000;
    const r = earthRadius + (altKm / earthRadiusKm) * visualScaleFactor;

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.cos(phi);
    const z = r * Math.sin(phi) * Math.sin(theta);

    console.log(`[DEBUG] Point ${idx}: lat=${p.lat}, lon=${p.lon}, alt=${p.alt} → x=${x.toFixed(3)}, y=${y.toFixed(3)}, z=${z.toFixed(3)}`);

    positions.push(x, y, z);
  });

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const color = new THREE.Color(Math.random(), Math.random(), Math.random());
  const material = new THREE.LineBasicMaterial({ color });
  const line = new THREE.Line(geometry, material);
  scene.add(line);

  const traj = { line, rawPoints: points };
  flights.push(traj);
  return traj;
}

function animateFlights() {
  // optional: trajectory animation
}

// ===== ui.js =====
function parseCustomFlightData(rawText) {
  const lines = rawText.split('\\n').filter(l => l.includes('.') && l.includes('-'));
  const result = [];
  for (const line of lines) {
    const tokens = line.trim().split(/\\s+/);
    const lat = parseFloat(tokens.find(t => /^\\d+\\.\\d+$/.test(t)));
    const lon = parseFloat(tokens.find(t => /^-?\\d+\\.\\d+$/.test(t)));
    const altRaw = tokens.find(t => /^\\d{3,5}(,\\d{3})?$/.test(t));
    const alt = altRaw ? parseInt(altRaw.replace(/,/g, '')) / 100000 : 0.05;
    if (!isNaN(lat) && !isNaN(lon)) result.push({ lat, lon, alt });
  }
  return result;
}

function addTrajectoryToList(traj) {
  const list = document.getElementById('trajectoryList');
  const item = document.createElement('div');
  item.className = 'traj-item';
  item.textContent = `Trajectory ${flights.length}`;
  const del = document.createElement('button');
  del.textContent = '\\u274C'; 
  del.onclick = () => {
    scene.remove(traj.line);
    item.remove();
  };
  item.appendChild(del);
  list.appendChild(item);
}

// ===== 이벤트 핸들러 =====
document.getElementById('addBtn').onclick = () => {
  const raw = document.getElementById('manualInput').value;
  try {
    const data = parseCustomFlightData(raw);
    console.log("[DEBUG] Parsed point count:", data.length);
    console.table(data);

    if (data.length >= 2) {
      const traj = createFlightPath(data);
      addTrajectoryToList(traj);
    } else {
      alert("Not enough points.");
    }
  } catch (e) {
    console.error("[DEBUG] Error parsing flight data:", e);
    alert("Error parsing data.");
  }
};

document.getElementById('exportCodeBtn').onclick = () => {
  if (!flights.length) return;
  const full = flights[flights.length - 1].rawPoints;
  const code = encodeLatLonTrajectory(full);
  prompt("Share this code (sampled):", code);
};

document.getElementById('importCodeBtn').onclick = () => {
  const code = prompt("Enter code:");
  if (code) {
    const points = decodeLatLonCode(code);
    const traj = createFlightPath(points);
    addTrajectoryToList(traj);
    alert("Note: this code is sampled, not full-resolution.");
  }
};

// ===== main.js =====
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 3;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);

const texture = new THREE.TextureLoader().load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg');
const earth = new THREE.Mesh(
  new THREE.SphereGeometry(1, 64, 64),
  new THREE.MeshBasicMaterial({ map: texture })
);
scene.add(earth);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  animateFlights();
  controls.update();
  renderer.render(scene, camera);
}
animate();
