// Renders the leaderboard table. Shared by the server render and the browser.
import { sessions as SES } from '../data/sessions';
import { stageColor } from './grape';

export type Metric = { label: string; better: 'higher' | 'lower'; aggregate?: 'mean' | 'sum' };
export type Entry = { method: string; by: string; baseline?: boolean; link?: string; overall?: number[]; sessions: number[][] };
export type Task = { label: string; metrics: Metric[]; rankBy: number; note: string; entries: Entry[] };
export type Board = { sessions: string[]; tasks: Record<string, Task> };

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
const isCount = (m: Metric) => m.aggregate === 'sum';
const fmt = (m: Metric, v: number) => (isCount(m) ? String(Math.round(v)) : v.toFixed(2));

function overall(e: Entry, t: Task): number[] {
  if (e.overall) return e.overall;
  return t.metrics.map((m, i) => {
    const col = e.sessions.map((r) => r[i]);
    const sum = col.reduce((a, b) => a + b, 0);
    return m.aggregate === 'sum' ? sum : sum / col.length;
  });
}

/** Inline sparkline of one metric over the six sessions, dots coloured by grape stage. */
function spark(vals: number[], m: Metric): string {
  const W = 132, H = 34, px = 5, py = 6;
  const lo = Math.min(...vals), hi = Math.max(...vals), span = hi - lo || 1;
  const pts = vals.map((v, i) => {
    const x = px + (i * (W - 2 * px)) / (vals.length - 1);
    const n = (v - lo) / span;
    const y = py + (m.better === 'lower' ? n : 1 - n) * (H - 2 * py); // up is always better
    return [x, y] as const;
  });
  const line = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const dots = pts.map(([x, y], i) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.2" fill="${stageColor(i)}"/>`).join('');
  const label = `${m.label} by session: ${vals.map((v) => fmt(m, v)).join(', ')}`;
  return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(label)}"><polyline points="${line}" fill="none" stroke="#5B615D" stroke-width="1.4"/>${dots}</svg>`;
}

/** open: indices of entries whose session rows are expanded (rank order). null = all open. */
export function renderTable(board: Board, taskKey: string, submitHref: string, open: Set<number> | null = null): string {
  const t = board.tasks[taskKey];
  const rows = t.entries.map((e) => ({ e, v: overall(e, t) }));
  const k = t.rankBy, rm = t.metrics[k];
  const sign = rm.better === 'lower' ? 1 : -1;
  rows.sort((a, b) => sign * (a.v[k] - b.v[k]));
  const best = t.metrics.map((m, i) => {
    const vs = rows.map((r) => r.v[i]);
    return m.better === 'lower' ? Math.min(...vs) : Math.max(...vs);
  });
  const ncol = t.metrics.length + 3;
  const head = t.metrics.map((m) => {
    const arrow = m.better === 'lower' ? '↓' : '↑';
    const label = isCount(m) ? `${m.label} total` : m.label;
    return `<th scope="col" class="px-3 py-3 text-right">${esc(label)} <span aria-hidden="true">${arrow}</span></th>`;
  }).join('');
  let h = `<thead><tr class="text-[11px] font-semibold text-muted border-b border-line"><th scope="col" class="px-3 py-3 text-left w-10">#</th><th scope="col" class="px-3 py-3 text-left">Method</th>${head}<th scope="col" class="px-3 py-3 text-left">${esc(rm.label)}, Jun → Oct</th></tr></thead>`;
  rows.forEach((r, i) => {
    const on = open === null || open.has(i);
    const cells = r.v.map((v, c) => {
      const strong = rows.length > 1 && v === best[c];
      return `<td class="px-3 py-3.5 text-right${strong ? ' font-bold' : ''}">${fmt(t.metrics[c], v)}</td>`;
    }).join('');
    const name = r.e.link ? `<a class="font-semibold underline decoration-line underline-offset-4 hover:decoration-ink" href="${esc(r.e.link)}">${esc(r.e.method)}</a>` : `<span class="font-semibold">${esc(r.e.method)}</span>`;
    const tag = `<span class="ml-2 font-mono text-[11px] text-muted">${r.e.baseline ? 'baseline' : esc(r.e.by)}</span>`;
    const tog = `<button type="button" class="lb-tog ml-3 font-mono text-[11px] text-accent underline underline-offset-2" data-i="${i}" aria-expanded="${on}">${on ? 'hide sessions' : 'show sessions'}</button>`;
    h += `<tbody class="lb-entry"><tr class="lb-method border-t-2 border-ink text-[16px]${i === 0 ? ' bg-accent-soft' : ''}"><td class="px-3 py-3.5 font-mono text-xs text-muted">${i + 1}</td><td class="px-3 py-3.5 text-left whitespace-nowrap">${name}${tag}${tog}</td>${cells}<td class="px-3 py-1.5">${spark(r.e.sessions.map((s) => s[k]), rm)}</td></tr>`;
    if (on) {
      const sb = t.metrics.map((m, c) => {
        const vs = r.e.sessions.map((s) => s[c]);
        return m.better === 'lower' ? Math.min(...vs) : Math.max(...vs);
      });
      const kv = r.e.sessions.map((s) => s[k]);
      const lo = Math.min(...kv), hi = Math.max(...kv), base = lo - (hi - lo || 1) * 0.5;
      r.e.sessions.forEach((sv, si) => {
        const s = SES[si], last = si === r.e.sessions.length - 1;
        const sc = sv.map((v, c) => `<td class="px-3 py-2 text-right${v === sb[c] ? ' font-semibold text-ink' : ''}">${fmt(t.metrics[c], v)}</td>`).join('');
        const w = ((kv[si] - base) / (hi - base)) * 100;
        const top = kv[si] === sb[k];
        const bar = `<td class="py-2 pl-3 pr-3"><span class="flex items-center gap-2"><span class="relative block h-[10px] w-[96px] bg-alt"><span class="absolute inset-y-0 left-0 block" style="width:${w.toFixed(1)}%;background:${stageColor(si)}"></span></span><span class="font-mono text-[11px]${top ? ' font-semibold text-ink' : ''}">${fmt(rm, kv[si])}</span></span></td>`;
        h += `<tr class="lb-ses text-[13px] text-muted${last ? ' border-b border-line' : ''}"><td></td><td class="border-l-2 border-line py-2 pl-5 pr-3 text-left whitespace-nowrap"><span class="inline-block h-2 w-2 align-middle" style="background:${stageColor(si)}"></span><span class="ml-2 font-mono text-[12px] text-ink">${esc(s ? s.short : board.sessions[si])}</span><span class="ml-2">${esc(s ? s.stage : '')}</span></td>${sc}${bar}</tr>`;
      });
    }
    h += '</tbody>';
  });
  h += `<tbody><tr class="border-b border-dashed border-line text-muted"><td class="px-3 py-3.5 font-mono text-xs">–</td><td class="px-3 py-3.5" colspan="${ncol - 1}">Your method here · <a class="font-semibold text-accent underline underline-offset-4" href="${esc(submitHref)}">Submit results →</a></td></tr></tbody>`;
  return h;
}
