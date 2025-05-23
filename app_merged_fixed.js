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
    const lon = Math.round((p.lon + 180) * scale); // fixed
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

// ===== flightAnimator.js =====
const flights = [];
function createFlightPath(points) {
  // Altitude smoothing
  for (let i = 0; i < points.length; i++) {
    if (!points[i].alt || points[i].alt < 0.0001) {
      const prev = points[i - 1]?.alt ?? 0.01;
      const next = points[i + 1]?.alt ?? prev;
      points[i].alt = (prev + next) / 2;
    }
  }
  for (let i = 1; i < points.length; i++) {
    const delta = Math.abs(points[i].alt - points[i - 1].alt);
    if (delta > 0.01) {
      points[i].alt = points[i - 1].alt;
    }
  }

  const geometry = new THREE.BufferGeometry();
  const positions = [];
  const earthRadius = 1.0;
  const maxAltMeters = 12000;

  let sumX = 0, sumY = 0, sumZ = 0;

  points.forEach((p, idx) => {
    const phi = (90 - p.lat) * Math.PI / 180;
    const theta = (p.lon + 180) * Math.PI / 180;

    const altMeters = (p.alt ?? 1000) * 100000;
    const scale = (altMeters / maxAltMeters) * 0.2;
    const r = 1.0 + scale;

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.cos(phi);
    const z = r * Math.sin(phi) * Math.sin(theta);

    console.log(`[DEBUG] Point ${idx}: lat=${p.lat}, lon=${p.lon}, alt=${p.alt} → x=${x.toFixed(3)}, y=${y.toFixed(3)}, z=${z.toFixed(3)}`);

    sumX += x; sumY += y; sumZ += z;
    positions.push(x, y, z);
  });

  const cx = sumX / points.length;
  const cy = sumY / points.length;
  const cz = sumZ / points.length;
  console.log(`[DEBUG] Center: x=${cx}, y=${cy}, z=${cz}`);
  controls.target.set(cx, cy, cz);
  camera.lookAt(cx, cy, cz);

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const color = new THREE.Color(Math.random(), Math.random(), Math.random());
  const material = new THREE.LineBasicMaterial({ color });
  const line = new THREE.Line(geometry, material);
  scene.add(line);

  const traj = { line, rawPoints: points };
  flights.push(traj);
  return traj;
}

// ===== ui.js =====
function parseCustomFlightData(rawText) {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const result = [];

  for (const line of lines) {
    const latlonMatches = line.match(/-?\d+\.\d{4,}/g);
    if (!latlonMatches || latlonMatches.length < 2) continue;

    const lat = parseFloat(latlonMatches[0]);
    const lon = parseFloat(latlonMatches[1]);

    const tokens = line.split(/\s+/);
    const arrowIdx = tokens.findIndex(t => /^\u2192|\u2198|\u2197|\u2191|\u2193/.test(t));
    let alt = 0.05;

    if (arrowIdx !== -1 && tokens.length > arrowIdx + 3) {
      const altRaw = tokens[arrowIdx + 3].replace(/,/g, '');
      const altNum = parseInt(altRaw, 10);
      if (!isNaN(altNum)) {
        alt = altNum / 100000;
      }
    }

    if (!isNaN(lat) && !isNaN(lon)) {
      result.push({ lat, lon, alt });
    }
  }

  return result;
}

function addTrajectoryToList(traj) {
  const list = document.getElementById('trajectoryList');
  const item = document.createElement('div');
  item.className = 'traj-item';
  item.textContent = `Trajectory ${flights.length}`;
  const del = document.createElement('button');
  del.textContent = '❌';
  del.style.marginLeft = '6px';
  del.style.cursor = 'pointer';
  del.title = 'Remove trajectory';
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

function animateFlights() {}

function animate() {
  requestAnimationFrame(animate);
  animateFlights();
  controls.update();
  renderer.render(scene, camera);
}
animate();
