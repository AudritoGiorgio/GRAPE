// Procedural grape cluster and vineyard scene, rendered as SVG strings.
// Used at build time (hero, problem strip) and in the browser (season morph).
// x = position in the season: 0 = 27 Jun … 5 = 2 Oct.

type Slot = { lobe: 0 | 1; t: number; th: number; u: number; dy: number; p: number; v: number; j: number };
export type Cluster = {
  bend: number; wing: boolean; side: number; wl: number;
  ls: number; ws: number; dn: number; rot: number; sl: Slot[];
};
type RGB = [number, number, number];

export function rnd(seed: number) {
  let s = Math.max(1, Math.floor(seed)) % 2147483647;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const f1 = (n: number) => n.toFixed(1);
const f2 = (n: number) => n.toFixed(2);

/* colour */
const hx = (h: string): RGB => [1, 3, 5].map((i) => parseInt(h.substr(i, 2), 16)) as RGB;
const mixA = (a: RGB, b: RGB, t: number): RGB => {
  t = Math.max(0, Math.min(1, t));
  return a.map((v, i) => v + (b[i] - v) * t) as RGB;
};
const toS = (a: RGB) => '#' + a.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
const G = [hx('#B9CC70'), hx('#9EBB55'), hx('#A7BA5E')];
const RED = hx('#7A3550'), BB = hx('#3D3B5C'), BB2 = hx('#2B2F4A'), SHR = hx('#1E1D2B'), BLK: RGB = [0, 0, 0];

function berryRGB(b: { v: number; j: number }, x: number): RGB {
  if (x < b.v) { const gi = Math.min(2, x); return gi < 1 ? mixA(G[0], G[1], gi) : mixA(G[1], G[2], gi - 1); }
  const u = (x - b.v) / 0.35;
  if (u < 0.5) return mixA(G[2], RED, u * 2);
  if (u < 1) return mixA(RED, BB, (u - 0.5) * 2);
  let c = mixA(BB, BB2, (x - b.v - 0.35) / 2);
  if (x > 4.4 && b.j < 0.14) c = mixA(c, SHR, (x - 4.4) / 0.6);
  return c;
}
export const stageColor = (x: number) => toS(berryRGB({ v: 2.4, j: 0.5 }, x));

/* cluster model: length, width, berry size, looseness and visible count change per session */
const P = {
  L: [168, 196, 216, 228, 238, 246], R: [26, 32, 41, 50, 58, 64], r: [3.4, 5, 6.6, 8, 9.3, 10.4],
  sp: [1.24, 1.14, 1.04, 0.98, 0.95, 0.94], n: [0.55, 0.72, 0.86, 0.95, 1, 1],
};
const at = (a: number[], x: number) => { const i = Math.min(4, Math.floor(x)), f = x - i; return a[i] + (a[i + 1] - a[i]) * f; };

export function makeCluster(seed: number, plain = false): Cluster {
  const r = rnd(seed), sl: Slot[] = [];
  const c: Cluster = { bend: (r() - 0.5) * 0.22, wing: r() < 0.8, side: r() < 0.5 ? -1 : 1, wl: 0.55 + r() * 0.45, ls: 1, ws: 1, dn: 1, rot: 0, sl };
  if (!plain) { c.ls = 0.7 + r() * 0.55; c.ws = 0.78 + r() * 0.5; c.dn = 0.7 + r() * 0.3; c.rot = (r() - 0.5) * 26; c.bend *= 1.8; c.wing = r() < 0.65; c.wl = 0.35 + r() * 0.75; }
  for (let i = 0; i < 150; i++) sl.push({ lobe: 0, t: Math.pow((i + r()) / 150, 0.92), th: i * 2.39996 + (r() - 0.5) * 0.6, u: 0.3 + 0.7 * Math.sqrt(r()), dy: r() - 0.5, p: r(), v: 2.1 + r() * 0.65, j: r() });
  if (c.wing) for (let i = 0; i < 24; i++) sl.push({ lobe: 1, t: r(), th: r() * 6.283, u: 0.3 + 0.7 * Math.sqrt(r()), dy: r() - 0.5, p: r(), v: 2.1 + r() * 0.65, j: r() });
  return c;
}
// young clusters: slim, tapering and curved ("banana"); mature: broad shoulders and a full, rounded cone
const profY = (t: number) => (t < 0.16 ? 0.6 + 2.5 * t : Math.max(0.12, 1 - 0.8 * Math.pow((t - 0.16) / 0.84, 1.15)));
const profM = (t: number) => (t < 0.13 ? 0.6 + 4.2 * t : Math.max(0.16, 1.15 * (1 - 0.86 * Math.pow((t - 0.13) / 0.87, 1.05))));
const mat = (x: number) => { const m = Math.max(0, Math.min(1, (x - 1.4) / 2.8)); return m * m * (3 - 2 * m); };
const prof = (t: number, m: number) => profY(t) + (profM(t) - profY(t)) * m;

function bpos(c: Cluster, b: Slot, x: number) {
  const L = at(P.L, x) * c.ls, R = at(P.R, x) * c.ws, sp = at(P.sp, x), rb = at(P.r, x), m = mat(x);
  const bend = c.bend * (1 - 0.8 * m), wl = c.wl * (0.8 + 0.3 * m);
  let ax: number, ay: number, rad: number;
  if (b.lobe === 0) {
    ax = bend * L * Math.sin(Math.PI * b.t) + c.side * R * 0.12 * m * Math.sin(Math.PI * Math.min(1, b.t * 1.6));
    ay = b.t * L; rad = R * prof(b.t, m);
  } else { ax = c.side * (R * (0.7 - 0.15 * m) + R * (1.05 - 0.35 * m) * b.t * wl); ay = (0.06 + (0.22 + 0.3 * m) * b.t * wl) * L; rad = R * (0.42 + 0.16 * m) * (1 - 0.45 * b.t); }
  const z = Math.cos(b.th), u = b.u + (0.5 + 0.5 * b.u - b.u) * m; // ripe clusters pack berries to the surface
  return { x: ax + rad * u * Math.sin(b.th) * sp, y: ay + b.dy * rb * 1.3 * sp + rad * u * z * 0.22, z, ax, ay };
}

export type ClusterOpts = { simple?: boolean; sparse?: boolean; k?: number };

/** Inner SVG markup for one cluster, origin at the top of the stem. */
export function clusterSVG(c: Cluster, x: number, o: ClusterOpts = {}): string {
  const L = at(P.L, x) * c.ls, R = at(P.R, x) * c.ws, rb = at(P.r, x), nf = at(P.n, x) * c.dn;
  const m = mat(x), bend = c.bend * (1 - 0.8 * m), wl = c.wl * (0.8 + 0.3 * m);
  const detail = !o.simple, k = o.k ?? 1;
  const late = Math.max(0, Math.min(1, (x - 2.4) / 1.2)), stem = x < 2.6 ? '#7E8C48' : '#6E5A3C';
  const out: string[] = [];
  const pts: string[] = [];
  for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push(`${f1(bend * L * Math.sin(Math.PI * t) + c.side * R * 0.12 * m * Math.sin(Math.PI * Math.min(1, t * 1.6)))},${f1(t * L * 0.94)}`); }
  out.push(`<path d="M0,-30 Q3,-14 0,0 L${pts.join(' L')}" fill="none" stroke="${stem}" stroke-width="${f2(3.4 * k)}" stroke-linecap="round" stroke-linejoin="round"/>`);
  if (c.wing) {
    const wx = c.side * R * (0.7 - 0.15 * m + (1.05 - 0.35 * m) * wl);
    out.push(`<path d="M0,${f1(0.04 * L)} Q${f1(wx * 0.5)},${f1(0.03 * L)} ${f1(wx * 0.85)},${f1((0.06 + (0.22 + 0.3 * m) * wl * 0.85) * L)}" fill="none" stroke="${stem}" stroke-width="${f2(2.4 * k)}"/>`);
  }
  const lim = o.sparse ? nf * 0.5 : nf;
  const vis: [Slot, ReturnType<typeof bpos>, number][] = [];
  for (const b of c.sl) { if (b.p > lim) continue; vis.push([b, bpos(c, b, x), lim >= 0.999 ? 1 : Math.min(1, (lim - b.p) / 0.04)]); }
  if (detail) {
    out.push(`<g stroke="${stem}" stroke-width="${f2(0.9 * k)}" fill="none">`);
    for (const [, q, a] of vis) out.push(`<line x1="${f1(q.ax)}" y1="${f1(q.ay)}" x2="${f1(q.x)}" y2="${f1(q.y)}"${a < 1 ? ` opacity="${f2(a)}"` : ''}/>`);
    out.push('</g>');
  }
  vis.sort((a, b) => a[1].z - b[1].z);
  const rm = o.sparse ? 1.35 : 1;
  const strokeA = f2(0.12 + 0.2 * late);
  for (const [b, q, a] of vis) {
    let rr = rb * rm * (0.88 + 0.2 * b.j) * (0.9 + 0.1 * q.z);
    const col = toS(mixA(berryRGB(b, x), BLK, Math.max(0, -q.z) * 0.3));
    const op = a < 1 ? ` opacity="${f2(a)}"` : '';
    out.push(detail
      ? `<circle cx="${f1(q.x)}" cy="${f1(q.y)}" r="${f2(rr)}" fill="${col}" stroke="rgba(0,0,0,${strokeA})" stroke-width="${f2(0.6 * k)}"${op}/>`
      : `<circle cx="${Math.round(q.x)}" cy="${Math.round(q.y)}" r="${f1(rr)}" fill="${col}"${op}/>`);
    if (detail && q.z > -0.2) {
      if (late < 1) out.push(`<circle cx="${f1(q.x - rr * 0.32)}" cy="${f1(q.y - rr * 0.34)}" r="${f2(rr * 0.24)}" fill="#fff" opacity="${f2(0.5 * (1 - late) * a)}"/>`);
      if (late > 0) out.push(`<ellipse cx="${f1(q.x - rr * 0.15)}" cy="${f1(q.y - rr * 0.2)}" rx="${f2(rr * 0.62)}" ry="${f2(rr * 0.5)}" fill="#9AA4C4" opacity="${f2(0.3 * late * a)}"/>`);
    }
  }
  return out.join('');
}

/* ---------- hero: looking down the row, rover driving towards us, ripe fruit on both sides ---------- */
const LEAF = ['#557A35', '#4A6E2E', '#6A8C40', '#3E5F27', '#7E9C4E', '#5F8238'];
const VPx = 1067, VPy = 500, HX = 4;

type RowOpts = { top: number; fruit: number; gr: number; q: number; n: number; leaves: number; cs: number; seed: number; lsz?: number };

function rowSVG(side: 'L' | 'R', o: RowOpts, rr: () => number): string {
  const edge = side === 'L' ? 0 : 1600;
  const band = (x: number) => { const f = side === 'L' ? x / VPx : (1600 - x) / 533; return { t: lerp(o.top, VPy, f), f: lerp(o.fruit, VPy, f), g: lerp(o.gr, VPy, f) }; };
  const e = band(edge), out: string[] = [];
  for (const p of [0.1, 0.42, 0.66]) out.push(`<line x1="${edge}" y1="${f1(lerp(e.t, e.g, p))}" x2="${VPx}" y2="${VPy}" stroke="#1E2220" stroke-opacity=".3" stroke-width="1.2"/>`);
  out.push(`<polygon points="${edge},${f1(e.t + (e.g - e.t) * 0.02)} ${VPx},${VPy} ${edge},${f1(e.f + (e.g - e.f) * 0.06)}" fill="#3E5C2A"/>`);
  const xs = (k: number) => (side === 'L' ? VPx * (1 - Math.pow(o.q, k)) : VPx + 533 * Math.pow(o.q, k));
  const leaf = (x: number, y: number, s: number) =>
    `<use href="#lf" transform="translate(${f1(x)} ${f1(y)}) rotate(${Math.round(rr() * 360)}) scale(${f2(s)})" fill="${LEAF[Math.floor(rr() * LEAF.length)]}"/>`;
  for (let k = o.n - 1; k >= 0; k--) {
    const x = xs(k), b = band(x), h = b.g - b.t, span = xs(k + 1) - x;
    out.push(`<line x1="${f1(x)}" y1="${f1(b.f)}" x2="${f1(x + (rr() - 0.5) * h * 0.03)}" y2="${f1(b.g)}" stroke="#6B5844" stroke-width="${f2(Math.max(0.6, h * 0.012))}"/>`);
    if (k % 6 === 0) out.push(`<line x1="${f1(x)}" y1="${f1(b.t - h * 0.04)}" x2="${f1(x)}" y2="${f1(b.g + h * 0.01)}" stroke="#BDB6A8" stroke-width="${f2(Math.max(1, h * 0.022))}"/>`);
    for (let i = 0; i < o.leaves; i++) {
      const lx = x + span * rr(), bb = band(lx), hh = bb.g - bb.t;
      out.push(leaf(lx, lerp(bb.t - hh * 0.03, bb.f + hh * 0.03, Math.pow(rr(), 0.8)), hh * (0.045 + rr() * 0.03) * (o.lsz ?? 1)));
    }
    const u = rr(), nc = u < 0.12 ? 0 : u < 0.45 ? 1 : u < 0.85 ? 2 : 3;
    for (let c = 0; c < nc; c++) {
      const cx = x + span * ((c + 0.15 + rr() * 0.7) / Math.max(1, nc)), cb = band(cx), sc = (cb.g - cb.t) * o.cs;
      if (sc < 0.025) continue;
      const cl = makeCluster(o.seed + k * 13 + c * 5);
      const cy = lerp(cb.t, cb.f, 0.86 + rr() * 0.12);
      out.push(`<g transform="translate(${f1(cx)} ${f1(cy)}) rotate(${f1(cl.rot)}) scale(${sc.toFixed(3)})">`);
      out.push(clusterSVG(cl, HX + (rr() - 0.5) * 0.6, { simple: sc < 0.3, sparse: sc < 0.14, k: Math.max(1, 0.6 / sc) }));
      out.push('</g>');
    }
    for (let i = 0; i < Math.round(o.leaves * 0.18); i++) {
      const fx = x + span * rr(), fb = band(fx), fh = fb.g - fb.t;
      out.push(leaf(fx, lerp(fb.f - fh * 0.04, fb.f + fh * 0.05, rr()), fh * (0.04 + rr() * 0.025)));
    }
  }
  return out.join('');
}

function roverSVG(): string {
  // front view of the Husky A200 with the GRAPE sensor mast, traced from a photo of the real rover
  // (drawn in photo pixels, ground at y=1130, centre at x=1000, then scaled to the scene)
  const al = '#C9CDD1', blk = '#1E2220', yl = '#E3B51D', o: string[] = [];
  o.push(`<ellipse cx="1000" cy="1128" rx="540" ry="36" fill="#1E2220" opacity=".2"/>`);
  // knobby tyres, nearly as tall as the body
  for (const x of [540, 1275]) {
    o.push(`<rect x="${x}" y="735" width="185" height="395" rx="46" fill="#151618"/>`);
    for (let y = 770; y < 1110; y += 38) o.push(`<path d="M${x + 14},${y} L${x + 92},${y + 18} L${x + 171},${y}" stroke="#34363A" stroke-width="12" fill="none"/>`);
  }
  // yellow chassis, bumper
  o.push(`<rect x="705" y="712" width="590" height="298" fill="${yl}"/><rect x="705" y="975" width="590" height="35" fill="#C49A10"/>`);
  o.push(`<circle cx="790" cy="850" r="16" fill="none" stroke="${blk}" stroke-width="6"/><rect x="820" y="842" width="90" height="14" fill="${blk}" opacity=".75"/>`);
  for (const x of [835, 1140]) o.push(`<rect x="${x}" y="880" width="26" height="60" fill="${blk}"/>`);
  o.push(`<rect x="605" y="922" width="790" height="32" rx="16" fill="${blk}"/>`);
  // black deck plate, wider than the chassis
  o.push(`<polygon points="585,690 612,668 1388,668 1415,690 1415,708 585,708" fill="#26282B"/>`);
  // front lidar puck on the deck
  o.push(`<rect x="935" y="640" width="130" height="58" fill="#B8BCC2"/><path d="M955,640 A45,40 0 0 1 1045,640Z" fill="#2A3F6E"/>`);
  // centre column with the RealSense
  o.push(`<rect x="928" y="360" width="14" height="285" fill="${blk}"/><rect x="1052" y="360" width="14" height="285" fill="${blk}"/><rect x="898" y="345" width="215" height="26" fill="${blk}"/>`);
  o.push(`<rect x="910" y="296" width="170" height="44" fill="#2B2E33"/>`);
  for (const x of [948, 980, 1022]) o.push(`<circle cx="${x}" cy="318" r="9" fill="#6A7A92"/>`);
  // mast: slanted aluminium uprights with black posts, top bar, GNSS outriggers
  o.push(`<polygon points="652,668 692,668 724,212 702,212" fill="${al}"/><polygon points="1308,668 1348,668 1298,212 1276,212" fill="${al}"/>`);
  o.push(`<rect x="702" y="212" width="14" height="440" fill="${blk}"/><rect x="1284" y="212" width="14" height="440" fill="${blk}"/>`);
  o.push(`<rect x="585" y="198" width="830" height="24" fill="${blk}"/>`);
  o.push(`<rect x="540" y="182" width="190" height="16" fill="${al}"/><rect x="1270" y="182" width="190" height="16" fill="${al}"/>`);
  for (const x of [562, 1440]) o.push(`<rect x="${x - 6}" y="150" width="12" height="36" fill="${blk}"/><path d="M${x - 84},140 Q${x},86 ${x + 84},140 Z" fill="#ECEEF0" stroke="#7D838A" stroke-width="5"/><rect x="${x - 70}" y="138" width="140" height="14" fill="#A39C8D"/>`);
  // Velodyne on top
  o.push(`<rect x="945" y="118" width="110" height="80" fill="#2F4F8F"/><rect x="945" y="170" width="110" height="28" fill="#C9CDD1"/><ellipse cx="1000" cy="118" rx="55" ry="10" fill="#26282B"/><ellipse cx="1000" cy="98" rx="32" ry="9" fill="#26282B"/><rect x="994" y="98" width="12" height="20" fill="#26282B"/>`);
  // side cameras in yellow housings, looking out to the rows
  for (const x of [712, 1206]) {
    o.push(`<rect x="${x}" y="285" width="88" height="145" fill="${yl}" stroke="#C49A10" stroke-width="4"/>`);
    for (let y = 305; y < 420; y += 18) o.push(`<rect x="${x + (x < 1000 ? 30 : 10)}" y="${y}" width="48" height="7" fill="#C49A10"/>`);
  }
  // a few cables
  o.push(`<path d="M780,250 C800,400 760,520 820,640 M1180,230 C1220,330 1240,500 1255,640 M880,330 C860,420 900,520 960,600" stroke="#111" stroke-width="5" fill="none"/>`);
  return `<g transform="scale(0.283) translate(-1000 -1130)">${o.join('')}</g>`;
}

/** The rover layer, drawn over the scene image with the same viewBox. */
export function heroRoverSVG(): string {
  return `<g id="hero-rover"><g transform="translate(880 606) scale(0.68)">${roverSVG()}</g></g>`;
}

/** The static scene (everything except the rover), served as its own SVG file. */
export function heroSceneSVG(): string {
  const rr = rnd(11);
  const cx = 880, cy = 606, s = 0.68;
  const parts: string[] = [];
  parts.push(`<defs>
<linearGradient id="hsky" x1="0" y1="0" x2="0" y2="500" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".45" stop-color="#FFFFFF"/><stop offset="1" stop-color="#EEE5CF"/></linearGradient>
<linearGradient id="hgrass" x1="0" y1="500" x2="0" y2="900" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#DCE2CC"/><stop offset="1" stop-color="#C5D0AC"/></linearGradient>
<path id="lf" d="M0,-1 C.35,-.95 .55,-.6 .95,-.55 C.75,-.2 1,.15 .7,.45 C.45,.4 .3,.75 0,1 C-.3,.75 -.45,.4 -.7,.45 C-1,.15 -.75,-.2 -.95,-.55 C-.55,-.6 -.35,-.95 0,-1Z"/>
</defs>`);
  parts.push(`<rect width="1600" height="500" fill="url(#hsky)"/>`);
  parts.push(`<path d="M0,500 L0,474 L80,458 L160,470 L250,446 L330,464 L420,450 L520,472 L610,460 L700,478 L800,468 L900,484 L1067,492 L1600,490 L1600,500Z" fill="#C9D2DB" opacity=".7"/>`);
  parts.push(`<rect y="500" width="1600" height="400" fill="url(#hgrass)"/>`);
  parts.push(`<polygon points="430,900 1270,900 1074,500 1060,500" fill="#E7E1CF" opacity=".9"/>`);
  parts.push(`<line x1="${f1(cx - 62 * s * 1.6)}" y1="${cy}" x2="${VPx - 3}" y2="${VPy}" stroke="#8C8467" stroke-opacity=".45" stroke-width="4"/>`);
  parts.push(`<line x1="${f1(cx + 62 * s * 1.6)}" y1="${cy}" x2="${VPx + 3}" y2="${VPy}" stroke="#8C8467" stroke-opacity=".45" stroke-width="4"/>`);
  // same cluster scale constant on both rows keeps the perspective honest
  parts.push(`<g>${rowSVG('L', { top: 455, fruit: 598, gr: 700, q: 0.86, n: 34, leaves: 30, lsz: 1.3, cs: 0.00085, seed: 800 }, rr)}</g>`);
  parts.push(`<g>${rowSVG('R', { top: 28, fruit: 650, gr: 965, q: 0.8, n: 24, leaves: 16, cs: 0.00085, seed: 100 }, rr)}</g>`);
  parts.push(`<polygon points="1488,-10 1522,-10 1612,910 1574,910" fill="#CBC5B8"/><polygon points="1488,-10 1497,-10 1584,910 1574,910" fill="#A39C8D"/>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">${parts.join('')}</svg>`;
}
