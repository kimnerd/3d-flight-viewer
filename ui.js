import { createFlightPath, animateFlights, deleteFlight } from './flightAnimator.js';
import { renderer, scene, camera, controls } from './main.js';

// ✅ 위도 = tokens[1], 경도 = tokens[2], 고도 = tokens[6] (미터)
function parseCustomFlightData(rawText) {
  const lines = rawText.split('\n').filter(line =>
    /\d+\.\d{4,}/.test(line) && /-?\d+\.\d{4,}/.test(line)
  );

  const parsed = [];

  for (const line of lines) {
    const tokens = line.trim().split(/\s+/);

    const lat = parseFloat(tokens[1]);
    const lon = parseFloat(tokens[2]);
    const altRaw = tokens[6]?.replace(/,/g, '');
    const alt = altRaw && !isNaN(altRaw) ? parseFloat(altRaw) / 100000 : 0.01;

    if (!isNaN(lat) && !isNaN(lon)) {
      parsed.push({ lat, lon, alt });
    }
  }

  return parsed;
}

// ✈️ 궤적 추가 버튼 동작
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

// 📋 UI에 Trajectory 목록 추가
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

// 🔁 애니메이션 루프
function animate() {
  requestAnimationFrame(animate);
  animateFlights();
  controls.update();
  renderer.render(scene, camera);
}

animate();
