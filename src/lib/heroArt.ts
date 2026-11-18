// Artwork for the hero's second stage: the rover's camera view, in the row scene's light palette.
// Both are 1600×900 and carry no text, so the page's own HTML holds the title and buttons.
import { makeCluster, clusterSVG, rnd } from './grape';

const W = 1600, H = 900;
const f1 = (n: number) => n.toFixed(1);

/** The rover's camera frame: ripe clusters with tight detection boxes and track IDs. */
export function heroCameraSVG(): string {
  const r = rnd(5), out: string[] = [];
  out.push(`<defs><linearGradient id="cs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2F3EF"/><stop offset="1" stop-color="#DCE2CC"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#cs)"/>`);
  const lf = 'M0,-1 C.35,-.95 .55,-.6 .95,-.55 C.75,-.2 1,.15 .7,.45 C.45,.4 .3,.75 0,1 C-.3,.75 -.45,.4 -.7,.45 C-1,.15 -.75,-.2 -.95,-.55 C-.55,-.6 -.35,-.95 0,-1Z';
  for (let i = 0; i < 90; i++) {
    const x = 380 + r() * 1270, y = -40 + r() * 420, s = 40 + r() * 70;
    out.push(`<path d="${lf}" transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) rotate(${(r() * 360).toFixed(0)}) scale(${s.toFixed(0)})" fill="${['#A7BA5E', '#7E9C4E', '#B9CC70', '#6A8C40', '#9EBB55'][i % 5]}" opacity="${(0.55 + r() * 0.35).toFixed(2)}"/>`);
  }
  out.push(`<path d="M300,250 C700,226 1150,262 1640,236" stroke="#6E5A3C" stroke-width="10" fill="none"/>`);
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
    const c = '#4B2D6E', lw = label.length * 10.4 + 20;
    return `<rect x="${f1(b.x)}" y="${f1(b.y)}" width="${f1(b.w)}" height="${f1(b.h)}" fill="none" stroke="${c}" stroke-width="2.5"/><rect x="${f1(b.x - 1.25)}" y="${f1(b.y - 30)}" width="${lw}" height="30" fill="${c}"/><text x="${f1(b.x + 9)}" y="${f1(b.y - 9)}" font-family="Red Hat Mono, ui-monospace, monospace" font-size="16" fill="#FFFFFF">${label}</text>`;
  };
  ['cluster · id 16', 'cluster · id 17', 'cluster · id 18'].forEach((l, i) => out.push(box(cl[i].b, l)));
  const vf = (x: number, y: number, dx: number, dy: number) => `<path d="M${x},${y + dy * 40} L${x},${y} L${x + dx * 40},${y}" stroke="#1E2220" stroke-width="2" fill="none" opacity=".6"/>`;
  out.push(vf(60, 60, 1, 1), vf(1540, 60, -1, 1), vf(60, 840, 1, -1), vf(1540, 840, -1, -1));
  out.push(`<circle cx="1510" cy="96" r="6" fill="#B5402F"/>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">${out.join('')}</svg>`;
}
