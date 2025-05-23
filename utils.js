// export function encodeLatLonTrajectory(points) {
//   const scale = 20;
//   const maxPts = 48;
//   const subset = points.length > maxPts
//     ? [...Array(maxPts).keys()].map(i => points[Math.floor(i * points.length / maxPts)])
//     : points;

//   const bytes = subset.map(p => {
//     const lat = Math.round((p.lat + 90) * scale);
//     const lon = Math.round((p.lon + 180) * scale);
//     return [(lat >> 8) & 0xff, lat & 0xff, (lon >> 8) & 0xff, lon & 0xff];
//   }).flat();

//   return btoa(String.fromCharCode(...bytes)).replace(/=/g, '').slice(0, 256);
// }

// export function decodeLatLonCode(code) {
//   const bin = atob(code + '='.repeat((4 - code.length % 4) % 4));
//   const bytes = Array.from(bin).map(c => c.charCodeAt(0));
//   const scale = 20;
//   const result = [];
//   for (let i = 0; i + 3 < bytes.length; i += 4) {
//     const lat = ((bytes[i] << 8) + bytes[i + 1]) / scale - 90;
//     const lon = ((bytes[i + 2] << 8) + bytes[i + 3]) / scale - 180;
//     result.push({ lat: +lat.toFixed(4), lon: +lon.toFixed(4), alt: 0.05 });
//   }
//   return result;
// }
