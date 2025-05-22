import { createFlightPath, animateFlights, deleteFlight } from './flightAnimator.js';
import { renderer, scene, camera, controls } from './main.js';

// ✅ 유연하고 안전한 궤적 파서
function parseCustomFlightData(rawText) {
  const lines = rawText.split('\n').filter(line =>
    /\d+\.\d{4,}/.test(line) && /-?\d+\.\d{4,}/.test(line)
  );

  const parsed = [];

  for (const line of lines) {
    const tokens = line.replace(/\t/g, ' ').trim().split(/\s+/);
    const nums = tokens
      .map(t => parseFloat(t.replace(/,/g, '')))
      .filter(n => !isNaN(n));

    // 위도 = [-90, 90], 경도 = [-180, 180]
    const lat = nums.find(n => n >= -90 && n <= 90);
    const lon = nums.find(n => n >= -180 && n <= 180 && n !== lat);

    // 고도 (미터): 보통 100~20000 정도 → 정규화
    const altRaw = nums.find(n => n > 100 && n < 20000);
    const alt = altRaw ? altRaw / 100000 : 0.01;

    if (!isNaN(lat) && !isNaN(lon)) {
      parsed.push({ lat, lon, alt });
    }
  }

  return parsed;
}

// ✈️ Trajectory 추가 버튼
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

// 📋 Trajectory 목록 UI 추가
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
