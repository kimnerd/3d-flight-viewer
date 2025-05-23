// import { createFlightPath, animateFlights, flights } from './flightAnimator.js';
// import { renderer, scene, camera, controls } from './main.js';
// import { encodeLatLonTrajectory, decodeLatLonCode } from './utils.js';

// function parseCustomFlightData(rawText) {
//   const lines = rawText.split('\n').filter(l => l.includes('.') && l.includes('-'));
//   const result = [];
//   for (const line of lines) {
//     const tokens = line.trim().split(/\s+/);
//     const lat = parseFloat(tokens.find(t => /^\d+\.\d+$/.test(t)));
//     const lon = parseFloat(tokens.find(t => /^-\d+\.\d+$/.test(t)));
//     const altRaw = tokens.find(t => /^\d{3,5}(,\d{3})?$/.test(t));
//     const alt = altRaw ? parseInt(altRaw.replace(/,/g, '')) / 100000 : 0.05;
//     if (!isNaN(lat) && !isNaN(lon)) result.push({ lat, lon, alt });
//   }
//   return result;
// }

// function addTrajectoryToList(traj) {
//   const list = document.getElementById('trajectoryList');
//   const item = document.createElement('div');
//   item.className = 'traj-item';
//   item.textContent = `Trajectory ${flights.length}`;
//   const del = document.createElement('button');
//   del.textContent = '❌';
//   del.onclick = () => {
//     scene.remove(traj.line);
//     item.remove();
//   };
//   item.appendChild(del);
//   list.appendChild(item);
// }

// document.getElementById('addBtn').onclick = () => {
//   const raw = document.getElementById('manualInput').value;
//   try {
//     const data = parseCustomFlightData(raw);
//     if (data.length >= 2) {
//       const traj = createFlightPath(data);
//       addTrajectoryToList(traj);
//     } else {
//       alert("Not enough points.");
//     }
//   } catch (e) {
//     alert("Error parsing data.");
//   }
// };

// document.getElementById('exportCodeBtn').onclick = () => {
//   if (!flights.length) return;
//   const code = encodeLatLonTrajectory(flights[flights.length - 1].rawPoints);
//   prompt("Share this code:", code);
// };

// document.getElementById('importCodeBtn').onclick = () => {
//   const code = prompt("Enter code:");
//   if (code) {
//     const points = decodeLatLonCode(code);
//     const traj = createFlightPath(points);
//     addTrajectoryToList(traj);
//   }
// };

// function animate() {
//   requestAnimationFrame(animate);
//   animateFlights();
//   controls.update();
//   renderer.render(scene, camera);
// }
// animate();
