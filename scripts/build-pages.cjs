// Regenerates the site's HTML pages from templates/ so shared chrome (head
// meta, background decoration, nav, footer, theme scripts) lives in one
// place instead of being hand-copied across every page. Output is the same
// flat HTML files Netlify already serves -- this only changes how they're
// authored, not how the site is built or deployed.
//
// Run with: npm run build

const fs = require("node:fs");
const path = require("node:path");
const { loadPages } = require("./site/pages.cjs");
const { renderPage } = require("./site/partials.cjs");

const ROOT = path.resolve(__dirname, "..");

for (const page of loadPages()) {
  const html = renderPage(page);
  fs.writeFileSync(path.join(ROOT, page.file), html);
  console.log(`wrote ${page.file}`);
}
