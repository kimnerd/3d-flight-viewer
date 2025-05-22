import { createFlightPath, animateFlights, deleteFlight } from './flightAnimator.js';
import { renderer, scene, camera, controls } from './main.js';

function parseCustomFlightData(rawText) {
  const lines = rawText.split('\n').filter(line =>
    /\d+\.\d+/.test(line) && /-?\d+\.\d+/.test(line)
  );

  const parsed = [];

  for (const line of lines) {
    const tokens = line.trim().split(/\s+/);
    const lat = parseFloat(tokens[1]);
    const lon = parseFloat(tokens[2]);
    const altToken = tokens[6]?.replace(/,/g, '');
    const alt = altToken && !isNaN(altToken) ? parseFloat(altToken) / 100000 : 0.01;

    if (!isNaN(lat) && !isNaN(lon)) {
      parsed.push({ lat, lon, alt });
    }
  }

  return parsed;
}

document.getElementById('addBtn').onclick = () => {
  const raw = document.getElementById('manualInput').value;
  try {
    const data = parseCustomFlightData(raw);
    if (data.length < 2) {
      alert("Not enough valid data points.");
    } else {
      const traj = createFlightPath(data);
      addTrajectoryToList(traj);
    }
  } catch (e) {
    alert("Failed to parse input.");
    console.error(e);
  }
};

function addTrajectoryToList(traj) {
  const ul = document.getElementById('trajList');
  const li = document.createElement('li');
  li.textContent = traj.label + ' ';
  const btn = document.createElement('button');
  btn.textContent = '❌';
  btn.onclick = () => {
    deleteFlight(traj.id);
    ul.removeChild(li);
  };
  li.appendChild(btn);
  ul.appendChild(li);
}

function animate() {
  requestAnimationFrame(animate);
  animateFlights();
  controls.update();
  renderer.render(scene, camera);
}

animate();
