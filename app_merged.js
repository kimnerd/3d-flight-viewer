
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
    const lon = Math.round((p.lon + 180) * scale);
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
    const lon = ((bytes[i + 2] << 8) + bytes[i + 3]) / scale - 180;
    result.push({ lat: +lat.toFixed(4), lon: +lon.toFixed(4), alt: 0.05 });
  }
  return result;
}

// ===== flightData.js =====
const flightDatabase = {
  'BA283_2024-07-01': [
    { lat: 51.47, lon: -0.4543, alt: 0.02 },
    { lat: 60.11, lon: -20.00, alt: 0.04 },
    { lat: 65.00, lon: -50.00, alt: 0.06 },
    { lat: 70.00, lon: -80.00, alt: 0.08 },
    { lat: 33.94, lon: -118.40, alt: 0.02 }
  ],
  'KE902_2024-07-01': [
    { lat: 37.55, lon: 126.80, alt: 0.02 },
    { lat: 45.00, lon: 135.00, alt: 0.03 },
    { lat: 60.00, lon: 160.00, alt: 0.05 },
    { lat: 64.00, lon: -150.00, alt: 0.07 },
    { lat: 40.64, lon: -73.78, alt: 0.02 }
  ]
};

// ===== flightAnimator.js =====
const flights = [];
function createFlightPath(points) {
  const geometry = new THREE.BufferGeometry();
  const positions = [];

  const earthRadius = 1.0;
  const earthRadiusKm = 6371;
  const visualScaleFactor = 10;

  points.forEach(p => {
    const phi = (90 - p.lat) * Math.PI / 180;
    const theta = (p.lon + 180) * Math.PI / 180;
    const altKm = (p.alt ?? 50) / 1000;
    const r = earthRadius + (altKm / earthRadiusKm) * visualScaleFactor;

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.cos(phi);
    const z = r * Math.sin(phi) * Math.sin(theta);

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
  // Placeholder for future flight animation
}

// ===== ui.js =====
function parseCustomFlightData(rawText) {
  const lines = rawText.split('\n').filter(l => l.includes('.') && l.includes('-'));
  const result = [];
  for (const line of lines) {
    const tokens = line.trim().split(/\s+/);
    const lat = parseFloat(tokens.find(t => /^\d+\.\d+$/.test(t)));
    const lon = parseFloat(tokens.find(t => /^-\d+\.\d+$/.test(t)));
    const altRaw = tokens.find(t => /^\d{3,5}(,\d{3})?$/.test(t));
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
  del.textContent = '\u274C'; 
  del.onclick = () => {
    scene.remove(traj.line);
    item.remove();
  };
  item.appendChild(del);
  list.appendChild(item);
}

document.getElementById('addBtn').onclick = () => {
  const raw = document.getElementById('manualInput').value;
  try {
    const data = parseCustomFlightData(raw);
    if (data.length >= 2) {
      const traj = createFlightPath(data);
      addTrajectoryToList(traj);
    } else {
      alert("Not enough points.");
    }
  } catch (e) {
    alert("Error parsing data.");
  }
};

document.getElementById('exportCodeBtn').onclick = () => {
  if (!flights.length) return;
  const code = encodeLatLonTrajectory(flights[flights.length - 1].rawPoints);
  prompt("Share this code:", code);
};

document.getElementById('importCodeBtn').onclick = () => {
  const code = prompt("Enter code:");
  if (code) {
    const points = decodeLatLonCode(code);
    const traj = createFlightPath(points);
    addTrajectoryToList(traj);
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
