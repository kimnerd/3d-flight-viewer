import { createFlightPath, animateFlights } from './flightAnimator.js';
import { renderer, scene, camera, controls } from './main.js';

function parseCustomFlightData(rawText) {
  const lines = rawText.split('\n').filter(line =>
    /\d+\.\d+/.test(line) && /-?\d+\.\d+/.test(line) && /\d{3,4}/.test(line)
  );

  const parsed = [];

  for (const line of lines) {
    const tokens = line.trim().split(/\s+/);

    const lat = parseFloat(tokens[0]);
    const lon = parseFloat(tokens[1]);

    // Find altitude (assumes it's a number like 1234 or 1,234)
    const altStr = tokens.find(tok => tok.replace(/,/g, '').match(/^\d{3,5}$/));
    const alt = altStr ? parseFloat(altStr.replace(/,/g, '')) / 100000 : 0.01;

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
