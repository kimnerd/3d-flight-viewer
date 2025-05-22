import { createFlightPath, animateFlights } from './flightAnimator.js';
import { flights } from './flightData.js';
import { renderer, scene, camera, controls } from './main.js';

document.getElementById('addBtn').onclick = () => {
  createFlightPath(flights[0]);
};

function animate() {
  requestAnimationFrame(animate);
  animateFlights();
  controls.update();
  renderer.render(scene, camera);
}

animate();
