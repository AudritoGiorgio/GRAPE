// Renders the leaderboard table. Shared by the server render and the browser.
export type Metric = { label: string; better: 'higher' | 'lower'; aggregate?: 'mean' | 'sum' };
export type Entry = { method: string; by: string; baseline?: boolean; link?: string; overall?: number[]; sessions: number[][] };
export type Task = { label: string; metrics: Metric[]; rankBy: number; note: string; entries: Entry[] };
export type Board = { sessions: string[]; tasks: Record<string, Task> };

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));

function values(e: Entry, t: Task, session: number | null): number[] {
  if (session !== null) return e.sessions[session];
  if (e.overall) return e.overall;
  return t.metrics.map((m, i) => {
    const col = e.sessions.map((r) => r[i]);
    const sum = col.reduce((a, b) => a + b, 0);
    return m.aggregate === 'sum' ? sum : sum / col.length;
  });
}

export function renderTable(board: Board, taskKey: string, session: number | null, submitHref: string): string {
  const t = board.tasks[taskKey];
  const rows = t.entries.map((e) => ({ e, v: values(e, t, session) }));
  const lowerIdx = t.rankBy;
  const sign = t.metrics[lowerIdx].better === 'lower' ? 1 : -1;
  rows.sort((a, b) => sign * (a.v[lowerIdx] - b.v[lowerIdx]));
  const best = t.metrics.map((m, i) => {
    const vs = rows.map((r) => r.v[i]);
    return m.better === 'lower' ? Math.min(...vs) : Math.max(...vs);
  });
  const isCount = (m: Metric) => m.aggregate === 'sum';
  const head = t.metrics.map((m) => {
    const arrow = m.better === 'lower' ? '↓' : '↑';
    const label = isCount(m) && session === null ? `${m.label} total` : m.label;
    return `<th scope="col" class="px-3 py-3 text-right">${esc(label)} <span aria-hidden="true">${arrow}</span></th>`;
  }).join('');
  let h = `<thead><tr class="text-[11px] font-semibold text-muted border-b border-line"><th scope="col" class="px-3 py-3 text-left w-10">#</th><th scope="col" class="px-3 py-3 text-left">Method</th>${head}</tr></thead><tbody>`;
  rows.forEach((r, i) => {
    const cells = r.v.map((v, c) => {
      const m = t.metrics[c];
      const s = isCount(m) ? String(Math.round(v)) : v.toFixed(2);
      const strong = rows.length > 1 && v === best[c];
      return `<td class="px-3 py-3.5 text-right${strong ? ' font-bold' : ''}">${s}</td>`;
    }).join('');
    const name = r.e.link ? `<a class="font-semibold underline decoration-line underline-offset-4 hover:decoration-ink" href="${esc(r.e.link)}">${esc(r.e.method)}</a>` : `<span class="font-semibold">${esc(r.e.method)}</span>`;
    const tag = r.e.baseline ? `<span class="ml-2 font-mono text-[11px] text-muted">baseline</span>` : `<span class="ml-2 font-mono text-[11px] text-muted">${esc(r.e.by)}</span>`;
    h += `<tr class="border-b border-line${i === 0 ? ' bg-accent-soft' : ''}"><td class="px-3 py-3.5 font-mono text-xs text-muted">${i + 1}</td><td class="px-3 py-3.5 text-left whitespace-nowrap">${name}${tag}</td>${cells}</tr>`;
  });
  h += `<tr class="border-b border-dashed border-line text-muted"><td class="px-3 py-3.5 font-mono text-xs">–</td><td class="px-3 py-3.5" colspan="${t.metrics.length + 1}">Your method here · <a class="font-semibold text-accent underline underline-offset-4" href="${esc(submitHref)}">Submit results →</a></td></tr></tbody>`;
  return h;
}
