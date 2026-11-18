// Every external link on the page lives here. Change a value and rebuild.
export const links = {
  github: 'https://github.com/PIC4SeR/grape-bench',
  // Benchmark submissions open an issue from this form in the repo above
  // (copy .github/ISSUE_TEMPLATE/submit-results.yml from this project into that repo).
  submitResults: 'https://github.com/PIC4SeR/grape-bench/issues/new?template=submit-results.yml',
  protocol: 'https://github.com/PIC4SeR/grape-bench#readme',
  contributeGithub: 'https://github.com/PIC4SeR/grape-bench/blob/main/CONTRIBUTING.md',
  // Dataset contributions: a prefilled email for now. Swap in a Google Form URL when it exists.
  contribute: 'mailto:giorgio_audrito@polito.it?subject=GRAPE%20Dataset%20Contribution',
  // Paper preprint (arXiv or PDF). Leave empty to hide the link; set a URL and rebuild to show it.
  preprint: '',
  contactEmail: 'giorgio_audrito@polito.it',
  pic4ser: 'https://pic4ser.polito.it/',
  yanmar: 'https://www.yanmar.com/eu/',
};

export const paper = {
  title: 'GRAPE: A multi-season vineyard image dataset for grape cluster detection and tracking',
  status: 'Dataset paper under review',
  authors: [
    'Giorgio Audrito', 'Marco Ambrosio', 'Alessandro Navone', 'Luigi Mazzara', 'Mauro Martini',
    'Alfredo Argiolas', 'Amir Gamahdrid Iualè', 'George Jose Pollayil', 'Alessandro Innocenti', 'Marcello Chiaberge',
  ],
  bibtex: `@article{audrito2026grape,
  title   = {GRAPE: A multi-season vineyard image dataset
             for grape cluster detection and tracking},
  author  = {Audrito, Giorgio and Ambrosio, Marco and
             Navone, Alessandro and Mazzara, Luigi and
             Martini, Mauro and Argiolas, Alfredo and
             Gamahdrid Iual{\\\`e}, Amir and Pollayil, George Jose and
             Innocenti, Alessandro and Chiaberge, Marcello},
  year    = {2026},
  note    = {Under review}
}`,
};

export const stats = [
  { value: 15000, label: 'annotated frames' },
  { value: 6, label: 'sessions, June to October' },
  { value: 240, suffix: ' m', label: 'of vineyard row' },
  { value: 49, suffix: ' GB', label: 'of robot sensor data' },
  { value: 2400, label: 'segmentation frames' },
];
