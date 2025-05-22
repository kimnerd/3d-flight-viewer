import { createFlightPath, animateFlights, deleteFlight } from './flightAnimator.js';
import { renderer, scene, camera, controls } from './main.js';

// ✨ 개선된 파서: 숫자 기반 + 위치 fallback
function parseCustomFlightData(rawText) {
  const lines = rawText.split('\n').filter(line =>
    /\d+\.\d+/.test(line) && /-?\d+\.\d+/.test(line)
  );

  const parsed = [];

  for (const line of lines) {
    const tokens = line.trim().split(/\s+/);

    const numbers = tokens
      .map(t => parseFloat(t.replace(/,/g, '')))
      .filter(n => !isNaN(n));

    const lat = numbers[0];
    const lon = numbers[1];

    // 고도: 우선 tokens[6] → fallback = numbers[2]
    const altFromFixed = tokens[6]?.replace(/,/g, '');
    const alt =
      altFromFixed && !isNaN(altFromFixed)
        ? parseFloat(altFromFixed) / 100000
        : numbers.length >= 3
        ? numbers[2] / 100000
        : 0.01;

    if (!isNaN(lat) && !isNaN(lon)) {
      parsed.push({ lat, lon, alt });
    }
  }

  return parsed;
}

// ✈️ 궤적 추가 버튼
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

// 📋 궤적 목록 UI 항목 추가
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
