// Shared HTML blocks used on every page. Kept as plain string constants
// (not a templating library) to match the rest of the project's
// no-build-dependency philosophy -- build-pages.js just concatenates these
// around each page's own content.

const SITE_URL = "https://skillmatch-fit.netlify.app";

const ICONS_AND_MANIFEST = `  <link rel="stylesheet" href="style.css" />

  <link rel="manifest" href="manifest.json" />
  <meta name="theme-color" content="#4f46e5" />
  <link rel="icon" href="favicon.ico" sizes="any" />
  <link rel="icon" href="icons/icon-32.png" type="image/png" />
  <link rel="apple-touch-icon" href="icons/apple-touch-icon.png" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content="SkillMatch" />
  <meta name="mobile-web-app-capable" content="yes" />`;

// Runs before paint so there's no flash of the wrong theme -- reads the
// same "skillmatch-theme" key theme.js writes to.
const THEME_INIT_SCRIPT = `  <script>
    (function () {
      var saved = null;
      try {
        saved = localStorage.getItem("skillmatch-theme");
      } catch (e) {}
      var theme = saved === "light" || saved === "dark"
        ? saved
        : (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      document.documentElement.setAttribute("data-theme", theme);
    })();
  </script>`;

const BG_SCENE = `  <div class="bg-photo" aria-hidden="true"></div>

  <div class="bg-scene" aria-hidden="true">
    <div class="bg-orb bg-orb-1"></div>
    <div class="bg-orb bg-orb-2"></div>
    <div class="bg-orb bg-orb-3"></div>
    <div class="bg-orb bg-orb-4"></div>

    <div class="bg-icon bg-icon-1">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="7" width="18" height="13" rx="2"/>
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        <path d="M3 12h18"/>
        <path d="M10 12v2h4v-2"/>
      </svg>
    </div>
    <div class="bg-icon bg-icon-2">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/>
        <path d="M14 2v6h6"/>
        <path d="M8 13h8M8 17h5M8 9h2"/>
      </svg>
    </div>
    <div class="bg-icon bg-icon-3">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M2 9l10-5 10 5-10 5-10-5z"/>
        <path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"/>
        <path d="M22 9v6"/>
      </svg>
    </div>
    <div class="bg-icon bg-icon-4">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 3v18h18"/>
        <path d="M7 15l4-5 3 3 5-7"/>
        <path d="M16 6h3v3"/>
      </svg>
    </div>
    <div class="bg-icon bg-icon-5">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3.2"/>
        <path d="M12 2.5v2.4M12 19.1v2.4M21.5 12h-2.4M4.9 12H2.5M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7M18.5 18.5l-1.7-1.7M7.2 7.2 5.5 5.5"/>
      </svg>
    </div>
    <div class="bg-icon bg-icon-6">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 3h9l4 4v5"/>
        <path d="M14 3v4h4"/>
        <path d="M8 11h4M8 15h3"/>
        <circle cx="16" cy="17" r="3.2"/>
        <path d="M18.4 19.4L21 22"/>
      </svg>
    </div>
    <div class="bg-icon bg-icon-7">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="7" width="18" height="13" rx="2"/>
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        <path d="M3 12h18"/>
        <path d="M10 12v2h4v-2"/>
      </svg>
    </div>
    <div class="bg-icon bg-icon-8">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/>
        <path d="M14 2v6h6"/>
        <path d="M8 13h8M8 17h5M8 9h2"/>
      </svg>
    </div>
    <div class="bg-icon bg-icon-9">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3.2"/>
        <path d="M12 2.5v2.4M12 19.1v2.4M21.5 12h-2.4M4.9 12H2.5M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7M18.5 18.5l-1.7-1.7M7.2 7.2 5.5 5.5"/>
      </svg>
    </div>
  </div>`;

const THEME_TOGGLE_BUTTON = `  <button id="themeToggle" type="button" class="theme-toggle" aria-label="Switch to dark mode">
    <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="4.5"/>
      <path d="M12 2.5v2.4M12 19.1v2.4M21.5 12h-2.4M4.9 12H2.5M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7M18.5 18.5l-1.7-1.7M7.2 7.2 5.5 5.5"/>
    </svg>
    <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5z"/>
    </svg>
  </button>`;

const NAV_LINKS = [
  ["index.html", "Home", "index"],
  ["about.html", "About", "about"],
  ["pricing.html", "Pricing", "pricing"],
  ["contact.html", "Contact", "contact"],
];

function nav(active) {
  const links = NAV_LINKS.map(
    ([href, label, id]) => `      <a href="${href}"${id === active ? ' aria-current="page"' : ""}>${label}</a>`
  ).join("\n");
  return `    <nav class="sitenav" aria-label="Main">\n${links}\n    </nav>`;
}

const FOOTER = `    <footer>
      <div class="footer-links">
        <a href="about.html">About</a>
        <a href="pricing.html">Pricing</a>
        <a href="contact.html">Contact</a>
        <a href="privacy.html">Privacy</a>
        <a href="terms.html">Terms</a>
      </div>
      <p>Rule-based skill matching, not a guarantee of hiring outcome. Always use your own judgment.</p>
      <p>&copy; 2026 SkillMatch</p>
    </footer>`;

const SW_REGISTER_SCRIPT = `  <script>
    if ("serviceWorker" in navigator && location.protocol !== "file:") {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("service-worker.js").catch(() => {});
      });
    }
  </script>`;

function buildHead({ title, seo }) {
  const base = `  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>`;

  if (!seo) {
    return `${base}
  <meta name="robots" content="noindex" />
${ICONS_AND_MANIFEST}`;
  }

  const url = `${SITE_URL}${seo.path}`;
  const socialDescription = seo.socialDescription || seo.description;
  return `${base}
  <meta name="description" content="${seo.description}" />
  <link rel="canonical" href="${url}" />

  <meta property="og:type" content="website" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${socialDescription}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${SITE_URL}/icons/social-preview.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${socialDescription}" />
  <meta name="twitter:image" content="${SITE_URL}/icons/social-preview.png" />

${ICONS_AND_MANIFEST}`;
}

function buildApp({ activeNav, header, main }) {
  const blocks = [nav(activeNav)];
  if (header) blocks.push(`    <header class="topbar">\n${header}\n    </header>`);
  blocks.push(`    <main class="layout layout-single">\n${main}    </main>`);
  blocks.push(FOOTER);
  return `  <div class="app">\n${blocks.join("\n\n")}\n  </div>`;
}

function renderPage(page) {
  const scriptLines = [
    ...(page.preThemeScripts || []),
    `  <script src="theme.js"></script>`,
    ...(page.postThemeScripts || []),
    SW_REGISTER_SCRIPT,
  ];

  return `<!doctype html>
<html lang="en">
<head>
${buildHead(page)}
</head>
<body>
${THEME_INIT_SCRIPT}

${BG_SCENE}

${THEME_TOGGLE_BUTTON}

${[buildApp(page), page.afterApp, scriptLines.join("\n")].filter(Boolean).join("\n\n")}
</body>
</html>
`;
}

module.exports = { renderPage };
