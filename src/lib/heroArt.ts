// Artwork for the scroll-zoom hero: the vineyard from above (start) and the rover's camera view (end).
// Both are 1600×900 and carry no text, so the page's own HTML holds the title and buttons.
import { makeCluster, clusterSVG, stageColor, rnd } from './grape';

const W = 1600, H = 900;
const f1 = (n: number) => n.toFixed(1);

/** Rows seen from above; the season runs left to right along every row and the rover drives one aisle. */
export const AERIAL = { rows: 12, top: 70, x0: 840, roverX: 1400 };
export function aerialRoverPoint() {
  const gap = (H - 2 * AERIAL.top) / (AERIAL.rows - 1);
  return { x: AERIAL.roverX, y: AERIAL.top + 6.5 * gap };
}
export function heroAerialSVG(): string {
  const r = rnd(9), out: string[] = [];
  const { rows, top, x0 } = AERIAL, gap = (H - 2 * top) / (rows - 1);
  out.push(`<rect width="${W}" height="${H}" fill="#F2F3EF"/>`);
  for (let k = 0; k < rows; k++) {
    const y = top + k * gap;
    out.push(`<line x1="${x0}" y1="${f1(y)}" x2="${W}" y2="${f1(y)}" stroke="#C9C2B3" stroke-width="2"/>`);
    for (let x = x0 + 10; x < W; x += 15 + r() * 8) {
      const t = (x - x0) / (W - x0), st = Math.min(5, t * 5.4);
      out.push(`<circle cx="${x.toFixed(0)}" cy="${f1(y + (r() - 0.5) * 12)}" r="${f1(3.5 + st * 1.7 + r() * 2.5)}" fill="${stageColor(st)}" opacity="${(0.55 + r() * 0.45).toFixed(2)}"/>`);
    }
    for (let x = x0 + 40; x < W; x += 120) out.push(`<rect x="${x - 2}" y="${f1(y - 2)}" width="4" height="4" fill="#8C8467"/>`);
  }
  const p = aerialRoverPoint();
  out.push(`<line x1="${x0}" y1="${f1(p.y)}" x2="${p.x}" y2="${f1(p.y)}" stroke="#4B2D6E" stroke-width="3" stroke-dasharray="2 9" stroke-linecap="round"/>`);
  out.push(`<g transform="translate(${p.x} ${f1(p.y)})"><rect x="-24" y="-17" width="48" height="34" fill="#E3B51D" stroke="#1E2220" stroke-width="2"/><rect x="-30" y="-21" width="16" height="8" fill="#1E2220"/><rect x="14" y="-21" width="16" height="8" fill="#1E2220"/><rect x="-30" y="13" width="16" height="8" fill="#1E2220"/><rect x="14" y="13" width="16" height="8" fill="#1E2220"/><rect x="-4" y="-34" width="8" height="68" fill="#A9AEB4"/></g>`);
  ['Jun', 'Jul', 'Aug', 'Sep', 'Oct'].forEach((m, i) => out.push(`<text x="${(x0 + 30 + i * ((W - x0 - 60) / 4)).toFixed(0)}" y="${H - 22}" font-family="Red Hat Mono, ui-monospace, monospace" font-size="14" fill="#5B615D">${m}</text>`));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">${out.join('')}</svg>`;
}

/** The rover's camera frame: ripe clusters with tight detection boxes and track IDs. */
export function heroCameraSVG(): string {
  const r = rnd(5), out: string[] = [];
  out.push(`<rect width="${W}" height="${H}" fill="#16191A"/>`);
  const lf = 'M0,-1 C.35,-.95 .55,-.6 .95,-.55 C.75,-.2 1,.15 .7,.45 C.45,.4 .3,.75 0,1 C-.3,.75 -.45,.4 -.7,.45 C-1,.15 -.75,-.2 -.95,-.55 C-.55,-.6 -.35,-.95 0,-1Z';
  for (let i = 0; i < 90; i++) {
    const x = 380 + r() * 1270, y = -40 + r() * 420, s = 40 + r() * 70;
    out.push(`<path d="${lf}" transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) rotate(${(r() * 360).toFixed(0)}) scale(${s.toFixed(0)})" fill="${['#24302A', '#1F2924', '#2B3A2F', '#202A23'][i % 4]}"/>`);
  }
  out.push(`<path d="M300,250 C700,226 1150,262 1640,236" stroke="#4A3D2E" stroke-width="10" fill="none"/>`);
  const place = (svg: string, tx: number, ty: number, sc: number, rot: number) => {
    const a = (rot * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const m of svg.matchAll(/<circle cx="([-\d.]+)" cy="([-\d.]+)" r="([\d.]+)"/g)) {
      const cx = +m[1], cy = +m[2], rr = +m[3];
      const X = tx + sc * (cx * ca - cy * sa), Y = ty + sc * (cx * sa + cy * ca), R = sc * rr;
      x0 = Math.min(x0, X - R); x1 = Math.max(x1, X + R); y0 = Math.min(y0, Y - R); y1 = Math.max(y1, Y + R);
    }
    return { g: `<g transform="translate(${tx} ${ty}) scale(${sc}) rotate(${rot})">${svg}</g>`, b: { x: x0 - 5, y: y0 - 5, w: x1 - x0 + 10, h: y1 - y0 + 10 } };
  };
  const cl = [
    place(clusterSVG(makeCluster(33), 4.4, { k: 1 }), 560, 250, 1.15, 4),
    place(clusterSVG(makeCluster(21), 4.4, { k: 0.8 }), 1000, 250, 1.85, 0),
    place(clusterSVG(makeCluster(48), 4.4, { k: 1 }), 1360, 246, 1.05, -6),
  ];
  cl.forEach((c) => out.push(c.g));
  const box = (b: { x: number; y: number; w: number; h: number }, label: string) => {
    const c = '#C9B6E4', lw = label.length * 10.4 + 20;
    return `<rect x="${f1(b.x)}" y="${f1(b.y)}" width="${f1(b.w)}" height="${f1(b.h)}" fill="none" stroke="${c}" stroke-width="2.5"/><rect x="${f1(b.x - 1.25)}" y="${f1(b.y - 30)}" width="${lw}" height="30" fill="${c}"/><text x="${f1(b.x + 9)}" y="${f1(b.y - 9)}" font-family="Red Hat Mono, ui-monospace, monospace" font-size="16" fill="#16191A">${label}</text>`;
  };
  ['cluster · id 16', 'cluster · id 17', 'cluster · id 18'].forEach((l, i) => out.push(box(cl[i].b, l)));
  const vf = (x: number, y: number, dx: number, dy: number) => `<path d="M${x},${y + dy * 40} L${x},${y} L${x + dx * 40},${y}" stroke="#F2F3EF" stroke-width="2" fill="none" opacity=".7"/>`;
  out.push(vf(60, 60, 1, 1), vf(1540, 60, -1, 1), vf(60, 840, 1, -1), vf(1540, 840, -1, -1));
  out.push(`<circle cx="1510" cy="96" r="6" fill="#B5402F"/>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">${out.join('')}</svg>`;
}
