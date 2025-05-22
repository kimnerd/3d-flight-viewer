import { createFlightPath, animateFlights, deleteFlight } from './flightAnimator.js';
import { renderer, scene, camera, controls } from './main.js';

// ✅ 구조 기반 + 회복력 있는 파서
function parseCustomFlightData(rawText) {
  const lines = rawText.split('\n').filter(line =>
    line.includes(':') && /\d+\.\d{4,}/.test(line)
  );

  const parsed = [];

  for (const line of lines) {
    const tokens = line.replace(/\t/g, ' ').trim().split(/\s+/);
    if (tokens.length < 5) continue; // 빈 줄 또는 불완전 줄 무시

    const numbers = tokens
      .map(t => parseFloat(t.replace(/,/g, '')))
      .filter(n => !isNaN(n));

    // 위도 = [-90, 90], 경도 = [-180, 180]에서 추출
    const lat = numbers.find(n => n >= -90 && n <= 90);
    const lon = numbers.find(n => n >= -180 && n <= 180 && n !== lat);

    // 고도 추정: heading("°") 다음 두 번째 숫자
    let alt = 0.01;
    const headingIdx = tokens.findIndex(t => t.includes('°'));
    if (headingIdx >= 0) {
      const altToken = tokens[headingIdx + 2]?.replace(/,/g, '');
      if (altToken && !isNaN(altToken)) {
        alt = parseFloat(altToken) / 100000;
      }
    }

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

// 📋 UI 목록 추가
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

// 🔁 렌더링 루프
function animate() {
  requestAnimationFrame(animate);
  animateFlights();
  controls.update();
  renderer.render(scene, camera);
}

animate();
