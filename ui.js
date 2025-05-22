import { createFlightPath, animateFlights } from './flightAnimator.js';
import { renderer, scene, camera, controls } from './main.js';

function parseCustomFlightData(rawText) {
  const lines = rawText.split('\n').filter(line =>
    /\d+\.\d+/.test(line) && /-?\d+\.\d+/.test(line)
  );

  const parsed = [];

  for (const line of lines) {
    const tokens = line.trim().split(/\s+/);

    // 위도 = 첫 번째 소수
    const latToken = tokens.find(t => /^-?\d+\.\d+$/.test(t));
    const lat = parseFloat(latToken);

    // 경도 = 위도 다음에 나오는 소수
    const lonToken = tokens.find((t, i) =>
      /^-?\d+\.\d+$/.test(t) && tokens.indexOf(t) > tokens.indexOf(latToken)
    );
    const lon = parseFloat(lonToken);

    // 고도 = tokens[6] (미터 열 기준), 예: "296" → 0.00296
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
      alert("Not enough valid data points found.");
    } else {
      createFlightPath(data);
    }
  } catch (e) {
    alert("Failed to parse input flight data.");
    console.error(e);
  }
};

function animate() {
  requestAnimationFrame(animate);
  animateFlights();
  controls.update();
  renderer.render(scene, camera);
}

animate();
