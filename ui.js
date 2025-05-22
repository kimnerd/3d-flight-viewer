import { createFlightPath, animateFlights, deleteFlight } from './flightAnimator.js';
import { renderer, scene, camera, controls } from './main.js';

// ✅ 구조기반 회복력 높은 파서
function parseCustomFlightData(rawText) {
  const lines = rawText.split('\n').filter(line =>
    line.includes(':') && /\d+\.\d{4,}/.test(line)
  );

  const parsed = [];
  let lastAlt = 0.01;

  for (const line of lines) {
    const tokens = line.replace(/\t/g, ' ').trim().split(/\s+/);
    if (tokens.length < 5) continue;

    const numbers = tokens
      .map(t => parseFloat(t.replace(/,/g, '')))
      .filter(n => !isNaN(n));

    // 위도/경도 추출: 범위 + 소숫점 4자리 이상
    const decimal4 = numbers.filter(n => n.toString().includes('.') && n.toFixed(4) === n.toString().slice(0, n.toString().indexOf('.') + 5));
    const lat = decimal4.find(n => n >= -90 && n <= 90);
    const lon = decimal4.find(n => n >= -180 && n <= 180 && n !== lat);

    // 고도 추출: heading ("°") 기호 기준 +2번째 숫자
    let alt = lastAlt;
    const headingIdx = tokens.findIndex(t => t.includes('°'));
    if (headingIdx >= 0) {
      const altToken = tokens[headingIdx + 2]?.replace(/,/g, '');
      const altNum = parseFloat(altToken);
      if (!isNaN(altNum)) {
        alt = altNum / 100000;
        lastAlt = alt;
      }
    }

    if (!isNaN(lat) && !isNaN(lon)) {
      parsed.push({ lat, lon, alt });
    }
  }

  return parsed;
}

// ✈️ 궤적 추가
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

// 📋 Trajectory UI 목록
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
