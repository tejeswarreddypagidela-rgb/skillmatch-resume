import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");

// app.js is a plain browser script (no module system) that reads the global
// SKILLS_DB defined by skills-db.js, exactly like the two <script> tags in
// index.html. Loading both into a fresh jsdom window via eval() reproduces
// that shared global scope without needing to modify either source file.
export function loadApp() {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "https://skillmatch.test/",
    runScripts: "outside-only",
  });

  const skillsDbSrc = fs.readFileSync(path.join(ROOT, "skills-db.js"), "utf8");
  const appSrc = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");

  // Must be evaluated as a single call: separate eval() calls each get their
  // own top-level `const`/`let` scope, so app.js's reference to the
  // skills-db.js-defined SKILLS_DB would otherwise fail to resolve.
  dom.window.eval(`${skillsDbSrc}\n${appSrc}`);

  return dom.window;
}
