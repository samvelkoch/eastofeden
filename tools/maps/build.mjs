// Генератор карт: node build.mjs (из tools/maps). Читает ../../data.json → maps, пишет ../../img/map-*.svg.
// Границы: us-atlas / world-atlas (US Census, Natural Earth — public domain). Стили задаются в style.css (.map-*).
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { geoAlbers, geoMercator, geoPath } from 'd3-geo';
import { feature, mesh } from 'topojson-client';
import { presimplify, simplify, quantile } from 'topojson-simplify';
const require = createRequire(import.meta.url);
const ROOT = new URL('../../', import.meta.url);
const D = JSON.parse(fs.readFileSync(new URL('data.json', ROOT)));
const r1 = n => Math.round(n * 10) / 10;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
// округляем координаты в path, чтобы SVG был лёгким
const slim = d => d.replace(/-?\d+\.\d+/g, m => String(r1(+m)));
let K = 1;
const OFF = { br: [6, 18, 'start'], r: [9, 4, 'start'], l: [-9, 4, 'end'], t: [0, -10, 'middle'], b: [0, 18, 'middle'] };
function label(x, y, text, pos, cls) {
  const [dx, dy, a] = OFF[pos || 'r'].map((v, i) => i < 2 ? v * K : v);
  return `<text class="${cls}" x="${r1(x + dx)}" y="${r1(y + dy)}" text-anchor="${a}">${esc(text)}</text>`;
}
function pin(x, y, n) {
  return `<g class="map-pin" data-n="${n}"><circle cx="${r1(x)}" cy="${r1(y)}" r="${9 * K}"/><text x="${r1(x)}" y="${r1(y + 3.6 * K)}" text-anchor="middle" font-size="${11 * K}">${n}</text></g>`;
}
function write(name, w, h, body, title) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}">${body}</svg>\n`;
  fs.writeFileSync(new URL('img/' + name, ROOT), svg);
  console.log(name, (svg.length / 1024).toFixed(1) + ' KB');
}

// ---- США ----
{
  const M = D.maps.find(m => m.id === 'usa'); const W = 960, H = 600; K = 1.5;
  let us = require('us-atlas/states-10m.json');
  us = simplify(presimplify(us), quantile(presimplify(us), 0.08));
  const skip = new Set(['02', '15', '60', '66', '69', '72', '78']);
  us.objects.states.geometries = us.objects.states.geometries.filter(g => !skip.has(g.id));
  const states = feature(us, us.objects.states);
  const proj = geoAlbers().fitExtent([[12, 12], [W - 12, H - 12]], states);
  const path = geoPath(proj); const P = ll => proj(ll);
  let b = `<path class="map-land" d="${slim(path(states))}"/>`;
  b += `<path class="map-border" d="${slim(path(mesh(us, us.objects.states, (a, c) => a !== c)))}"/>`;
  const line = pts => 'M' + pts.map(p => P(p).map(r1).join(',')).join('L');
  b += `<path class="map-route" d="${line(M.route)}"/>`;
  b += `<path class="map-route home" d="${line(M.home)}"/>`;
  M.stops.forEach(([t, lo, la, pos]) => { const [x, y] = P([lo, la]); b += `<circle class="map-stop" cx="${r1(x)}" cy="${r1(y)}" r="4"/>` + label(x, y, t, pos, 'map-small'); });
  M.points.forEach(p => { const [x, y] = P(p.ll); b += pin(x, y, p.n) + label(x, y + (p.lab === 't' ? -4 : 0), p.name, p.lab, 'map-name'); });
  b += `<text class="map-small" x="${W - 16}" y="${H - 16}" text-anchor="end">→ из Ирландии: Гамильтоны</text>`;
  write('map-usa.svg', W, H, b, M.title);
}
// ---- Долина Салинас ----
{
  const M = D.maps.find(m => m.id === 'valley'); const W = 600, H = 760; K = 1;
  const land = feature(require('world-atlas/land-10m.json'), require('world-atlas/land-10m.json').objects.land);
  const box = { type: 'Feature', geometry: { type: 'MultiPoint', coordinates: [[-122.1, 35.8], [-120.55, 37.0]] } };
  const proj = geoMercator().fitExtent([[0, 0], [W, H]], box); proj.clipExtent([[-2, -2], [W + 2, H + 2]]);
  const path = geoPath(proj); const P = ll => proj(ll);
  let b = `<rect class="map-sea" width="${W}" height="${H}"/><path class="map-land" d="${slim(path(land))}"/>`;
  b += `<path class="map-river" d="M${M.river.map(p => P(p).map(r1).join(',')).join('L')}"/>`;
  const [rx, ry] = P(M.ranch);
  b += `<ellipse class="map-ranch" cx="${r1(rx)}" cy="${r1(ry)}" rx="34" ry="20"/>` + `<text class="map-small" x="${r1(rx)}" y="${r1(ry + 36)}" text-anchor="middle">≈ ранчо Гамильтонов</text>`;
  M.labels.forEach(([t, lo, la, rot, sub]) => {
    const [x, y] = P([lo, la]);
    b += `<g transform="translate(${r1(x)},${r1(y)}) rotate(${rot})"><text class="${sub ? 'map-range' : 'map-water'}" text-anchor="middle">${esc(t)}</text>` + (sub ? `<text class="map-small" y="18" text-anchor="middle">${esc(sub)}</text>` : '') + `</g>`;
  });
  M.points.forEach(p => { const [x, y] = P(p.ll); b += pin(x, y, p.n) + label(x, y, p.name, p.lab, 'map-name'); });
  write('map-valley.svg', W, H, b, M.title);
}
