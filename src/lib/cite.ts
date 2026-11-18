// All citation formats are generated from one record, so they stay consistent.
// When the paper is published, add journal / volume / pages / doi to `paper` in src/data/site.ts.
export type Person = { given: string; family: string };
export type Ref = { title: string; year: number; note: string; key: string; authors: Person[]; journal?: string; doi?: string };

const ini = (g: string) => g.split(/\s+/).map((p) => p[0] + '.').join(' ');
const listJoin = (xs: string[], last: string) => (xs.length < 2 ? xs.join('') : xs.slice(0, -1).join(', ') + last + xs[xs.length - 1]);
const tex = (s: string) => s.replace(/è/g, '{\\`e}').replace(/é/g, "{\\'e}").replace(/à/g, '{\\`a}').replace(/ò/g, '{\\`o}').replace(/ù/g, '{\\`u}').replace(/ì/g, '{\\`i}');
const doiTail = (r: Ref) => (r.doi ? ` https://doi.org/${r.doi}` : '');
const venue = (r: Ref) => r.journal ?? r.note;

export function citations(r: Ref): { id: string; label: string; text: string }[] {
  const A = r.authors, first = A[0];
  const apaNames = A.map((a) => `${a.family}, ${ini(a.given)}`);
  const apa = `${listJoin(apaNames, ', & ')} (${r.year}). ${r.title}${r.journal ? `. ${r.journal}` : ' [Manuscript under review]'}.${doiTail(r)}`;
  const ieeeNames = A.length > 6 ? `${ini(first.given)} ${first.family} et al.` : listJoin(A.map((a) => `${ini(a.given)} ${a.family}`), ', and ');
  const ieee = `${ieeeNames}, "${r.title}," ${r.journal ? `${r.journal}, ` : `${r.note.toLowerCase()}, `}${r.year}.${r.doi ? ` doi: ${r.doi}.` : ''}`;
  const mla = `${first.family}, ${first.given}${A.length > 2 ? ', et al' : A.length === 2 ? `, and ${A[1].given} ${A[1].family}` : ''}. "${r.title}." ${venue(r)}, ${r.year}.${doiTail(r)}`;
  const chiNames = [`${first.family}, ${first.given}`, ...A.slice(1).map((a) => `${a.given} ${a.family}`)];
  const chicago = `${A.length > 10 ? `${chiNames.slice(0, 7).join(', ')}, et al.` : listJoin(chiNames, ', and ')}. ${r.year}. "${r.title}." ${r.journal ?? `Unpublished manuscript, ${r.note.toLowerCase()}`}.${doiTail(r)}`;
  const harvard = `${listJoin(apaNames, ' and ')} (${r.year}) '${r.title}', ${r.journal ?? r.note.toLowerCase()}.${r.doi ? ` doi:${r.doi}.` : ''}`;
  const bib = [
    `@${r.journal ? 'article' : 'unpublished'}{${r.key},`,
    `  title   = {${r.title}},`,
    `  author  = {${A.map((a) => `${tex(a.family)}, ${tex(a.given)}`).join(' and\n             ')}},`,
    ...(r.journal ? [`  journal = {${r.journal}},`] : []),
    `  year    = {${r.year}},`,
    ...(r.doi ? [`  doi     = {${r.doi}},`] : []),
    `  note    = {${r.note}}`,
    '}',
  ].join('\n');
  const ris = [
    `TY  - ${r.journal ? 'JOUR' : 'UNPB'}`,
    `TI  - ${r.title}`,
    ...A.map((a) => `AU  - ${a.family}, ${a.given}`),
    `PY  - ${r.year}`,
    ...(r.journal ? [`JO  - ${r.journal}`] : []),
    ...(r.doi ? [`DO  - ${r.doi}`] : []),
    `N1  - ${r.note}`,
    'ER  - ',
  ].join('\n');
  return [
    { id: 'bibtex', label: 'BibTeX', text: bib },
    { id: 'apa', label: 'APA', text: apa },
    { id: 'ieee', label: 'IEEE', text: ieee },
    { id: 'mla', label: 'MLA', text: mla },
    { id: 'chicago', label: 'Chicago', text: chicago },
    { id: 'harvard', label: 'Harvard', text: harvard },
    { id: 'ris', label: 'RIS', text: ris },
  ];
}
