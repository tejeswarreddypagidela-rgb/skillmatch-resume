const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..", "..");
const CONTENT_DIR = path.join(ROOT, "templates", "content");
const SCRIPTS_DIR = path.join(ROOT, "templates", "scripts");

function readContent(name) {
  return fs.readFileSync(path.join(CONTENT_DIR, name), "utf8");
}

function readScript(name) {
  return fs.readFileSync(path.join(SCRIPTS_DIR, name), "utf8").trimEnd();
}

const LIB_SCRIPTS = {
  skillsDb: `  <script src="skills-db.js"></script>`,
  fflate: `  <script src="fflate.min.js"></script>`,
  tesseract: `  <script src="tesseract.min.js"></script>`,
  jspdf: `  <script src="jspdf.umd.min.js"></script>`,
  appJs: `  <script src="app.js"></script>`,
};

function loadPages() {
  return [
    {
      file: "index.html",
      title: "SkillMatch — Resume vs Job Fit Checker",
      seo: {
        path: "/",
        description:
          "Free, private resume-vs-job-description fit checker. See your skill matches, gaps, and ATS compatibility score — everything runs locally in your browser, nothing is ever uploaded.",
      },
      activeNav: "index",
      header: `      <h1>SkillMatch</h1>
      <p>Upload your resume and paste a job description to see if your skills are a good fit — free, private, and runs entirely in your browser.</p>`,
      main: readContent("index.html"),
      afterApp: readContent("index.after-app.html").trimEnd(),
      preThemeScripts: [
        LIB_SCRIPTS.skillsDb,
        LIB_SCRIPTS.fflate,
        LIB_SCRIPTS.tesseract,
        LIB_SCRIPTS.jspdf,
        readScript("pdf-loader.html"),
        LIB_SCRIPTS.appJs,
      ],
    },
    {
      file: "about.html",
      title: "About — SkillMatch",
      seo: {
        path: "/about.html",
        description:
          "SkillMatch is a free, private resume-vs-job-description fit checker that runs entirely in your browser. Learn how it works and why nothing you upload ever leaves your device.",
        socialDescription:
          "SkillMatch is a free, private resume-vs-job-description fit checker that runs entirely in your browser.",
      },
      activeNav: "about",
      header: `      <h1>About SkillMatch</h1>
      <p>Why we built a resume checker that never sees your resume.</p>`,
      main: readContent("about.html"),
    },
    {
      file: "pricing.html",
      title: "Pricing — SkillMatch",
      seo: {
        path: "/pricing.html",
        description: "SkillMatch is free, with no account, no paywall, and no limits. See exactly what's included.",
        socialDescription: "SkillMatch is free, with no account, no paywall, and no limits.",
      },
      activeNav: "pricing",
      header: `      <h1>Pricing</h1>
      <p>One plan. It's free.</p>`,
      main: readContent("pricing.html"),
    },
    {
      file: "contact.html",
      title: "Contact — SkillMatch",
      seo: {
        path: "/contact.html",
        description: "Get in touch about SkillMatch — bug reports, feature requests, or general feedback.",
      },
      activeNav: "contact",
      header: `      <h1>Contact</h1>
      <p>Bug reports, feature requests, or general feedback — all welcome.</p>`,
      main: readContent("contact.html"),
      postThemeScripts: [readScript("contact-form.html")],
    },
    {
      file: "privacy.html",
      title: "Privacy Policy — SkillMatch",
      seo: {
        path: "/privacy.html",
        description:
          "SkillMatch's privacy policy: what data is collected (none), where your resume goes (nowhere), and how the app works entirely in your browser.",
        socialDescription: "What data SkillMatch collects (none), and how the app works entirely in your browser.",
      },
      activeNav: null,
      header: `      <h1>Privacy Policy</h1>
      <p>Last updated July 25, 2026.</p>`,
      main: readContent("privacy.html"),
    },
    {
      file: "terms.html",
      title: "Terms of Service — SkillMatch",
      seo: {
        path: "/terms.html",
        description: "Terms of service for using SkillMatch, a free resume-vs-job-description fit checker.",
      },
      activeNav: null,
      header: `      <h1>Terms of Service</h1>
      <p>Last updated July 25, 2026.</p>`,
      main: readContent("terms.html"),
    },
    {
      file: "results.html",
      title: "Analysis — SkillMatch",
      seo: null,
      activeNav: null,
      header: `      <h1>Analysis</h1>
      <p><a class="back-link" href="index.html">&larr; New Analysis</a></p>`,
      main: readContent("results.html"),
      preThemeScripts: [LIB_SCRIPTS.skillsDb, LIB_SCRIPTS.jspdf, LIB_SCRIPTS.appJs],
    },
    {
      file: "404.html",
      title: "Page Not Found — SkillMatch",
      seo: null,
      activeNav: null,
      header: null,
      main: readContent("404.html"),
    },
  ];
}

module.exports = { loadPages };
