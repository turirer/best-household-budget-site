// Home Ledger hand-in (Node 22, standard library only).
//
// The site itself is the app/ folder beside this file: plain static files a
// browser opens at app/index.html — ES modules and CSS, no build step, and
// nothing it runs, styles or shows comes from the network. This program
// hands the site in: it copies app/ and screenshots/ into the output
// directory and writes dossier.json there, the summary the judge reads,
// using the vendored make.fun library in vendor/makefun-frontend.ts (left
// exactly as the kit ships it, because the scorer rebuilds the dossier with
// its own copy and compares the two byte for byte).
//
// Run it the way the grader does, with MAKEFUN_OUTPUT_DIR standing in for
// /output outside the container:
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// To look at the site itself, serve app/ with `node serve.ts` and open
// http://localhost:8080.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// Where this file lives (the repository root) and where the hand-in goes.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The scorer's caps, from the kit's gate.json. Only text_max_bytes shapes the
// dossier's bytes; the rest make this program refuse exactly what the scorer
// would refuse — more than 4 screenshots or one over 256 KiB, more than 993
// files and directories under app/, or more than 16 MiB of app files.
const CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
};

function copyInto(from, to) {
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
}

mkdirSync(outputDir, { recursive: true });
copyInto(join(repoRoot, 'app'), join(outputDir, 'app'));
const shotsFrom = join(repoRoot, 'screenshots');
if (existsSync(shotsFrom)) {
  copyInto(shotsFrom, join(outputDir, 'screenshots'));
} else {
  mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
}

writeFileSync(join(outputDir, 'dossier.json'), buildDossier(outputDir, CAPS));
console.log(`dossier.json written to ${join(outputDir, 'dossier.json')}`);
