import { createFlightPath, animateFlights } from './flightAnimator.js';
import { flightDatabase } from './flightData.js';
import { renderer, scene, camera, controls } from './main.js';

document.getElementById('addBtn').onclick = () => {
  const flightNo = document.getElementById('flightInput').value.trim().toUpperCase();
  const date = document.getElementById('dateInput').value.trim();
  const key = `${flightNo}_${date}`;

  if (flightDatabase[key]) {
    createFlightPath(flightDatabase[key]);
  } else {
    alert(`No flight data found for ${flightNo} on ${date}`);
  }
};

function animate() {
  requestAnimationFrame(animate);
  animateFlights();
  controls.update();
  renderer.render(scene, camera);
}

animate();
