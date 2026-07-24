// SkillMatch — resume vs job description fit checker.
// 100% client-side: no server, no API keys, no network calls. Runs in any modern browser.

// Three-part guidance per category: why the gap matters, a concrete way to
// close it, and how to phrase it on the resume once you have. Keeping these
// separate (rather than one blended sentence) is what lets renderResults
// show real, scannable detail instead of a single generic line.
const CATEGORY_SUGGESTIONS = {
  "Programming Languages": {
    why: "Required languages are often used as an automatic screening filter — missing them from your resume can get you filtered out before a human looks at your actual experience.",
    how: "Work through a handful of small, finished projects or timed challenges (LeetCode, HackerRank, Advent of Code, or a script that solves a real problem you have) in {skills}, and push the code to a public GitHub repo.",
    show: "List {skills} explicitly in a Skills section, and mention it again inside at least one Experience or Projects bullet — exact wording matters because many applicant tracking systems match keywords literally.",
  },
  "Frontend & Web": {
    why: "This is core to how the product actually gets built day to day, so interviewers expect you to speak to it concretely, not just recognize the term.",
    how: "Build or extend a small, real web app using {skills} — clone a feature from a site you like, then deploy it (Vercel, Netlify, or GitHub Pages) and keep the repo public.",
    show: "Link the live deployed project directly next to the bullet that mentions {skills}, so reviewers can click through instead of taking your word for it.",
  },
  "Backend & Frameworks": {
    why: "Backend frameworks show you can build the part of the system that handles data and business logic, not just the UI layer.",
    how: "Build a small API or service using {skills} — even a CRUD app with a database and a couple of endpoints — and document it with a README explaining the design decisions.",
    show: "Describe it as a Projects bullet with a concrete outcome (e.g. \"built a REST API in {skills} serving X feature\"), and link the repo.",
  },
  "Databases": {
    why: "Almost every real backend role touches a database directly, so employers treat this as a baseline hands-on skill rather than a nice-to-have.",
    how: "Complete a guided project that involves designing a schema from scratch and writing real queries in {skills} — a small inventory or expense tracker is enough to practice joins, indexes, and constraints.",
    show: "Mention {skills} alongside a specific task you used it for (schema design, query optimization, migrations) rather than listing it as a bare keyword.",
  },
  "Cloud & DevOps": {
    why: "Cloud and DevOps skills signal you can ship and operate software, not just write it — a distinction many hiring managers actively screen for.",
    how: "Open a free-tier account and complete a hands-on intro lab in {skills}; if you have time, an associate-level certification is a strong, low-cost signal of real commitment.",
    show: "Note the certification (if earned) under Skills or Certifications, and describe one concrete thing you deployed or automated using {skills}.",
  },
  "Data & Machine Learning": {
    why: "This category is usually evaluated on applied results, not theory — employers want to see you can take {skills} from concept to a working output.",
    how: "Take a structured course covering {skills}, then apply what you learned to a public dataset relevant to the role, and publish the notebook or a short write-up of your findings.",
    show: "Summarize the outcome in one sentence (e.g. \"built a model in {skills} that predicted X with Y% accuracy\") and link the notebook so reviewers can verify the work.",
  },
  "Mobile": {
    why: "Mobile hiring managers typically want proof you've shipped something that runs on a real device, since the platform has quirks that only show up in practice.",
    how: "Build and publish (or at least side-load and demo) a simple app using {skills} — a small utility or a clone of an app you use daily is enough to show the workflow end to end.",
    show: "Link the store listing or a short demo video/GIF next to the bullet mentioning {skills} so reviewers can see it working, not just read about it.",
  },
  "Testing & QA": {
    why: "Testing experience signals discipline and reliability — teams weigh this heavily because it directly affects how much they can trust your other code.",
    how: "Add automated tests using {skills} to an existing personal project, aiming for meaningful coverage of the trickiest logic rather than 100% of everything.",
    show: "Mention a specific detail if it's a good one (e.g. \"added a {skills} suite covering the core checkout flow\") — specifics read as more credible than the bare skill name.",
  },
  "Design & Product": {
    why: "This category is judged almost entirely by portfolio quality — employers want to see your process and decisions, not just a list of tools.",
    how: "Do a small, self-contained project (redesign an existing app screen, or run a mini design sprint end to end) using {skills}, and write a short case study explaining the problem and your reasoning.",
    show: "Add the case study to a portfolio site or shared doc and link it directly next to the {skills} mention — process explanation matters more than the final visual here.",
  },
  "Soft Skills": {
    why: "These are the hardest to prove on paper, so vague claims (\"strong communicator\") tend to be ignored — specific, quantified examples are what actually get noticed.",
    how: "Go back through your work history and pull out a real moment that demonstrates {skills} — a team you led, a conflict you resolved, a stakeholder you convinced.",
    show: "Rewrite it as a specific bullet with a number where possible (e.g. \"led a team of 5 through a product launch\") instead of just naming {skills} in a list.",
  },
  "Marketing & Business": {
    why: "This field moves fast, so employers look for evidence you can apply {skills} to a real campaign or business problem, not just describe it.",
    how: "Many platforms (Google, HubSpot, Meta) offer free certifications in {skills} — pair one with a small case study, even a hypothetical campaign plan for a product you like.",
    show: "Lead with the outcome when you mention {skills} (e.g. \"grew X by Y% using {skills}\") — marketing resumes are read for metrics first.",
  },
  "Security": {
    why: "Security roles are trust-sensitive, so employers weigh hands-on, verifiable practice heavily over self-reported familiarity.",
    how: "Practice {skills} in a lab environment (TryHackMe, HackTheBox, or CTF-style exercises) and consider an entry-level certification once you're comfortable.",
    show: "Reference specific exercises or the certification by name rather than just listing {skills} — verifiable specifics carry far more weight in this field than general claims.",
  },
  "Tools & Productivity": {
    why: "These tools are usually assumed baseline competence for the role, so their absence can read as a gap even when the underlying skill is easy to pick up.",
    how: "Get comfortable with {skills} through a focused tutorial or two — most of these tools have a shallow learning curve for basic proficiency.",
    show: "Instead of just listing {skills}, mention a specific way you've used a similar tool in past work — the transferable context matters more than the exact tool name.",
  },
  "Sales & Customer Service": {
    why: "Sales and support roles are evaluated almost entirely on track record, so unquantified claims about {skills} tend to be skipped over.",
    how: "Pull your actual numbers together — quota attainment, average response time, retention or renewal rate — anywhere you've used {skills} or something comparable.",
    show: "Lead each relevant bullet with the number, not the skill name (e.g. \"achieved 120% of quota\" rather than just \"used {skills}\").",
  },
  "Finance & Accounting": {
    why: "This field rewards precision and hands-on tool familiarity, since day-to-day work depends on it directly.",
    how: "Highlight a concrete process you streamlined or report you owned that involved {skills}, and note any relevant software or certification you hold.",
    show: "Name the specific outcome (time saved, error rate reduced, close cycle shortened) next to {skills} rather than listing it as a bare keyword.",
  },
  "HR & Recruiting": {
    why: "HR roles are judged on measurable people outcomes, so a bare skill listing reads as less credible than a number.",
    how: "Think through what {skills} actually changed for your team — time-to-hire, retention, headcount managed, offer-acceptance rate — and write that number down.",
    show: "Put the outcome first in the bullet (e.g. \"cut time-to-hire by 20%\") instead of stating {skills} as a standalone responsibility.",
  },
  "Operations & Supply Chain": {
    why: "Operations roles are evaluated on efficiency gains you can point to directly, since the discipline is fundamentally about measurable process improvement.",
    how: "Identify one concrete example of {skills} in action — a process you improved, a cost you cut, or a timeline you hit — and write down the before/after numbers if you can.",
    show: "State the measurable result first, then the tool or method (e.g. \"reduced fulfillment time by 15% using {skills}\").",
  },
  "Healthcare": {
    why: "Healthcare hiring is compliance-driven, so missing or unclear certifications can disqualify an otherwise strong resume automatically.",
    how: "Make sure any certifications or hands-on experience with {skills} are current — renew anything that's lapsed before applying, since this is often checked.",
    show: "List certification names and dates explicitly rather than folding {skills} into a general skills list — recruiters in this field scan specifically for exact credential names.",
  },
  "Education & Training": {
    why: "This field values a specific, narrated example of your teaching or training approach over a general list of competencies.",
    how: "Think of one concrete instance of {skills} in practice — a course you designed, a class size you managed, a curriculum you adapted — rather than the general duty.",
    show: "Describe the specific example with a result if possible (engagement, pass rate, feedback score) instead of just naming {skills}.",
  },
  "Legal & Compliance": {
    why: "This field is evaluated on exact scope of experience, since the frameworks and jurisdictions involved vary enormously and don't transfer automatically.",
    how: "Note the specific frameworks, jurisdictions, or regulations you've worked with under {skills} — precision here is what differentiates a real match from a keyword coincidence.",
    show: "Name the frameworks or jurisdictions explicitly next to {skills} rather than using the category name alone — reviewers in this field read closely for exact matches.",
  },
  "Manufacturing & Engineering": {
    why: "This field is judged on measurable physical or process outcomes, so a bare skill name reads as less convincing than a number.",
    how: "Add a project or product where you applied {skills}, ideally one with a measurable outcome — tolerance achieved, throughput improved, defect rate reduced.",
    show: "Lead with the measurable result when you mention {skills} (e.g. \"reduced defect rate by 8% using {skills}\") rather than listing it as a bare keyword.",
  },
  "Other / Role-Specific": {
    why: "This term came directly from the job description, so it's likely a specific, deliberate requirement rather than a generic keyword.",
    how: "If you genuinely have this experience, describe it using wording similar to the job posting — many companies screen resumes with automated exact-keyword matching.",
    show: "If you don't have it yet, treat it as a concrete learning target rather than ignoring it — even basic familiarity you can speak to in an interview beats silence.",
  },
};

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

let LOOKBEHIND_SUPPORTED = true;
try {
  new RegExp("(?<=a)b");
} catch (e) {
  LOOKBEHIND_SUPPORTED = false;
}

function buildSkillRegex(alias) {
  const esc = escapeRegex(alias.toLowerCase().trim());
  if (LOOKBEHIND_SUPPORTED) {
    return new RegExp(`(?<![a-z0-9])${esc}(?![a-z0-9])`, "i");
  }
  return new RegExp(`(^|[^a-z0-9])${esc}([^a-z0-9]|$)`, "i");
}

function findDbSkillsInText(text) {
  if (!text) return [];
  const found = [];
  for (const skill of SKILLS_DB) {
    for (const alias of skill.aliases) {
      if (buildSkillRegex(alias).test(text)) {
        found.push(skill);
        break;
      }
    }
  }
  return found;
}

function splitJdSections(jdText) {
  const markerRe = /(preferred|nice[- ]to[- ]have|bonus points?|good to have|desirable|is a plus|are a plus)/i;
  const match = markerRe.exec(jdText);
  if (!match) return { required: jdText, preferred: "" };
  return { required: jdText.slice(0, match.index), preferred: jdText.slice(match.index) };
}

// --- Detecting requirement terms outside the curated skills dictionary -----
// SKILLS_DB only covers a curated list of common skills. Anything else a JD
// asks for -- a niche framework, an internal tool, a specific certification
// -- is otherwise invisible: not counted, not flagged missing, doesn't move
// the score. This scans for tech/tool-shaped tokens the dictionary missed
// and surfaces them separately. It's shape-based (acronyms, camelCase,
// dotted tokens like "Node.js"), so it's noisier than the curated alias
// list -- kept out of the weighted score entirely and shown as advisory.

const KNOWN_ALIASES = new Set(SKILLS_DB.flatMap((s) => s.aliases.map((a) => a.toLowerCase())));

// Words that show up inside a known multi-word alias (e.g. "rest"/"apis" from
// "rest apis") shouldn't be re-surfaced as their own "unknown" term -- that's
// what produced a redundant "REST" chip next to "REST APIs" during testing.
const KNOWN_ALIAS_WORDS = new Set(
  SKILLS_DB.flatMap((s) => s.aliases.flatMap((a) => a.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)))
);

const UNKNOWN_TERM_STOPWORDS = new Set([
  "us", "uk", "usa", "eu", "eeo", "eoe", "pto", "ceo", "cto", "cfo", "coo",
  "vp", "hr", "id", "faq", "faqs", "asap", "ok", "tbd", "n/a", "pm", "am",
  "llc", "inc", "co", "etc", "aka", "fyi", "gpa", "sat", "act", "est",
  "pst", "cst", "mst", "utc", "gmt", "usd", "cv", "url", "ai", "ui", "ux", "api",
]);

const BULLET_LINE_RE = /^\s*(?:[-*•●▪‣]|\d+[.)])\s+/;

// Requirement bullets carry far less noise than the surrounding prose (About
// Us, benefits, EEO boilerplate), so prefer scanning just those when a JD
// has enough of them; fall back to the full text for prose-only JDs.
function requirementLikeLines(text) {
  const lines = text.split(/\r?\n/).filter((l) => BULLET_LINE_RE.test(l));
  return lines.length >= 2 ? lines.join("\n") : text;
}

const UNKNOWN_TERM_RE = new RegExp(
  [
    "\\b[A-Z]{2,6}\\b", // acronyms: GCP, CRM, ERP
    "\\b[A-Za-z]+[a-z][A-Z][A-Za-z]*\\b", // camelCase: TensorFlow, GitHub, DevOps
    "\\b[A-Za-z][A-Za-z0-9]*[.+#][A-Za-z0-9.+#]*\\b", // dotted/symbol tokens
  ].join("|"),
  "g"
);

function extractUnknownTerms(jdText, resumeText) {
  const scanText = requirementLikeLines(jdText);
  const seen = new Map();

  for (const m of scanText.matchAll(UNKNOWN_TERM_RE)) {
    const raw = m[0];
    const key = raw.toLowerCase();
    if (key.length < 2) continue;
    if (UNKNOWN_TERM_STOPWORDS.has(key)) continue;
    if (KNOWN_ALIASES.has(key)) continue;
    if (KNOWN_ALIAS_WORDS.has(key)) continue;
    if (!seen.has(key)) seen.set(key, raw);
  }

  const terms = Array.from(seen.values()).slice(0, 8);
  const matched = [];
  const missing = [];
  terms.forEach((term) => (buildSkillRegex(term).test(resumeText) ? matched : missing).push(term));
  return { matched, missing };
}

const REQUIRED_WEIGHT = 3;
const PREFERRED_WEIGHT = 1;
const LOW_SIGNAL_THRESHOLD = 4;

function analyzeSkills(jdText, resumeText) {
  const { required, preferred } = splitJdSections(jdText);
  const requiredSkills = findDbSkillsInText(required);
  const preferredSkills = findDbSkillsInText(preferred);

  const weightMap = new Map();
  requiredSkills.forEach((s) => weightMap.set(s.name, { skill: s, weight: REQUIRED_WEIGHT, tier: "required" }));
  preferredSkills.forEach((s) => {
    if (!weightMap.has(s.name)) weightMap.set(s.name, { skill: s, weight: PREFERRED_WEIGHT, tier: "preferred" });
  });

  const allJdSkills = Array.from(weightMap.values());
  const resumeSkillNames = new Set(findDbSkillsInText(resumeText).map((s) => s.name));

  const matched = allJdSkills.filter((e) => resumeSkillNames.has(e.skill.name));
  const missing = allJdSkills.filter((e) => !resumeSkillNames.has(e.skill.name));

  const totalWeight = allJdSkills.reduce((sum, e) => sum + e.weight, 0);
  const matchedWeight = matched.reduce((sum, e) => sum + e.weight, 0);
  const score = totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) : null;

  const requiredTotal = allJdSkills.filter((e) => e.tier === "required").length;
  const requiredMatched = matched.filter((e) => e.tier === "required").length;
  const preferredTotal = allJdSkills.filter((e) => e.tier === "preferred").length;
  const preferredMatched = matched.filter((e) => e.tier === "preferred").length;

  return {
    allJdSkills,
    matched,
    missing,
    score,
    requiredTotal,
    requiredMatched,
    preferredTotal,
    preferredMatched,
    lowSignal: allJdSkills.length > 0 && allJdSkills.length < LOW_SIGNAL_THRESHOLD,
    otherTerms: extractUnknownTerms(jdText, resumeText),
  };
}

function getVerdict(analysis) {
  const { score, requiredTotal, requiredMatched, preferredTotal, preferredMatched, lowSignal } = analysis;

  if (score === null) {
    return {
      label: "Not enough information",
      tone: "neutral",
      message:
        "We couldn't reliably detect specific skills in the job description. Try pasting the full JD, including its requirements/qualifications section.",
      breakdown: "",
    };
  }

  const parts = [];
  if (requiredTotal > 0) parts.push(`${requiredMatched}/${requiredTotal} required skills matched`);
  if (preferredTotal > 0) parts.push(`${preferredMatched}/${preferredTotal} preferred skills matched`);
  let breakdown = parts.join(" · ");
  if (lowSignal) {
    breakdown +=
      (breakdown ? " — " : "") +
      "only a few specific skills were detected in this job description, so treat this score as a rough signal. Paste the full requirements/qualifications section for a more reliable read.";
  }

  if (score >= 75) {
    return {
      label: "Good match — go ahead and apply",
      tone: "good",
      message: "Your resume covers most of what this role is asking for.",
      breakdown,
    };
  }
  if (score >= 50) {
    return {
      label: "Borderline — worth applying",
      tone: "warn",
      message:
        "You meet a solid chunk of the requirements. Applying is reasonable, especially if you address a couple of the gaps below in your resume or cover letter.",
      breakdown,
    };
  }
  return {
    label: "Gap — strengthen before applying",
    tone: "bad",
    message:
      "There's a meaningful gap between your resume and this job's requirements. Consider building up the skills below first, or apply while being upfront about your growth areas.",
    breakdown,
  };
}

function groupByCategory(entries) {
  const map = new Map();
  entries.forEach((e) => {
    const cat = e.skill.category;
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat).push(e.skill.name);
  });
  return map;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}

function chip(text, extraClass) {
  return `<span class="chip ${extraClass || ""}">${escapeHtml(text)}</span>`;
}

const TECHNICAL_CREATIVE_CATEGORIES = new Set([
  "Programming Languages", "Frontend & Web", "Backend & Frameworks", "Databases",
  "Cloud & DevOps", "Data & Machine Learning", "Mobile", "Testing & QA",
  "Design & Product", "Security",
]);

const QUANTIFIED_ACHIEVEMENT_RE =
  /\d+(\.\d+)?\s*%|\$\s?\d|\b\d+x\b|\b\d{2,}\+?\s*(users|customers|clients|requests|records|projects|people|members|hours|days)\b/i;

// Picks 3-5 tips that actually reflect this specific resume/JD pairing,
// rather than a fixed list — driven by real signals in the analysis (missing
// skills, whether the resume already quantifies achievements, whether the
// role is technical, the verdict tone, and required-vs-preferred gaps).
function buildGeneralTips({ analysis, verdict, resumeText, jobRole }) {
  const { matched, missing, requiredTotal, requiredMatched, preferredTotal, preferredMatched } = analysis;
  const tips = [];

  const isTechnicalRole = matched.concat(missing).some((e) => TECHNICAL_CREATIVE_CATEGORIES.has(e.skill.category));
  const hasQuantifiedAchievements = QUANTIFIED_ACHIEVEMENT_RE.test(resumeText || "");

  if (missing.length > 0) {
    tips.push(
      "Mirror the job description's exact wording for skills you genuinely have — many companies screen resumes with automated keyword matching (ATS)."
    );
  }

  if (analysis.otherTerms && analysis.otherTerms.missing.length > 0) {
    const preview = analysis.otherTerms.missing.slice(0, 3).join(", ");
    tips.push(
      `This JD also mentions ${analysis.otherTerms.missing.length === 1 ? "a term" : "terms"} outside our skill dictionary (${preview}${analysis.otherTerms.missing.length > 3 ? ", …" : ""}) — worth a manual check against your resume.`
    );
  }

  tips.push(
    hasQuantifiedAchievements
      ? "Your resume already uses specific numbers — keep that up for the skills you're missing once you gain them; quantified claims read as far more credible than a bare skill name."
      : `Your resume doesn't show many numbers yet — swap general responsibilities for quantified results ("reduced load time by 30%", "managed a $50K budget") wherever you can.`
  );

  if (isTechnicalRole) {
    tips.push(
      "Link a portfolio, GitHub, or live work samples directly on your resume — for technical and creative roles, a clickable example carries more weight than the bullet describing it."
    );
  }

  if (verdict.tone === "warn") {
    tips.push(
      "You're borderline — a short cover letter addressing your top 1-2 gaps directly, and why they're not a dealbreaker, can tip the decision in your favor."
    );
  } else if (verdict.tone === "bad" && missing.length > 3) {
    tips.push(
      "With this many gaps, focus on closing the 2-3 highest-impact ones — the required skills, not preferred — rather than trying to cover everything before applying."
    );
  } else if (verdict.tone === "good") {
    tips.push(
      "This is a strong match — use your cover letter to highlight the 2-3 achievements most relevant to this specific role rather than restating your whole resume."
    );
  }

  if (requiredTotal > 0 && requiredMatched === requiredTotal && preferredTotal > 0 && preferredMatched < preferredTotal) {
    tips.push(
      "You already meet every required skill — the preferred ones you're missing are what would differentiate you from other qualified candidates."
    );
  }

  if (!jobRole) {
    tips.push(
      "Adding the exact job title in the Job Role field helps tailor this analysis, and mirroring that title on your resume can help with keyword screening too."
    );
  }

  if (tips.length < 3) {
    tips.push(
      "Keep bullets specific and results-focused — a reviewer scanning for 10 seconds should immediately see what you did and what changed because of it."
    );
  }

  return tips.slice(0, 5);
}

function renderResults({ jobRole, analysis, verdict, resumeText }) {
  const { score, matched, missing } = analysis;
  const panel = document.getElementById("resultsPanel");

  const roleLine = jobRole
    ? `<p class="role-line">Analysis for: <strong>${escapeHtml(jobRole)}</strong></p>`
    : "";

  const scoreDisplay = score === null ? "—" : `${score}%`;
  const ringRadius = 34;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringPct = score === null ? 0 : Math.max(0, Math.min(100, score));
  const ringOffset = ringCircumference * (1 - ringPct / 100);

  const otherTerms = analysis.otherTerms || { matched: [], missing: [] };

  const matchedChips = matched.length || otherTerms.matched.length
    ? matched.map((e) => chip(e.skill.name, "chip-good")).join("") +
      otherTerms.matched.map((t) => chip(t, "chip-good")).join("")
    : `<p class="muted">No overlapping skills detected.</p>`;

  let missingBlock = "";
  if (missing.length) {
    const grouped = groupByCategory(missing);
    missingBlock = Array.from(grouped.entries())
      .map(([category, skills]) => {
        const guidance = CATEGORY_SUGGESTIONS[category] || CATEGORY_SUGGESTIONS["Tools & Productivity"];
        const skillsList = skills.join(", ");
        const fill = (s) => escapeHtml(s.replace(/\{skills\}/g, skillsList));
        return `
          <div class="gap-block">
            <div class="gap-header">
              <span class="gap-category">${escapeHtml(category)}</span>
              <div class="chip-row">${skills.map((s) => chip(s, "chip-bad")).join("")}</div>
            </div>
            <ul class="suggestion-list">
              <li><span class="suggestion-label">Why it matters</span>${fill(guidance.why)}</li>
              <li><span class="suggestion-label">How to build it</span>${fill(guidance.how)}</li>
              <li><span class="suggestion-label">How to show it</span>${fill(guidance.show)}</li>
            </ul>
          </div>`;
      })
      .join("");
  } else {
    missingBlock = `<p class="muted">No missing skills detected from our dictionary — nice work.</p>`;
  }

  let otherTermsBlock = "";
  if (otherTerms.missing.length) {
    const guidance = CATEGORY_SUGGESTIONS["Other / Role-Specific"];
    const skillsList = otherTerms.missing.join(", ");
    const fill = (s) => escapeHtml(s.replace(/\{skills\}/g, skillsList));
    otherTermsBlock = `
      <div class="panel-block">
        <h3>Other terms in this JD ⚠️</h3>
        <p class="muted">These look like requirement terms outside our skill dictionary — not counted in the score above, but worth checking your resume for.</p>
        <div class="gap-block">
          <div class="gap-header">
            <span class="gap-category">Other / Role-Specific</span>
            <div class="chip-row">${otherTerms.missing.map((s) => chip(s, "chip-bad")).join("")}</div>
          </div>
          <ul class="suggestion-list">
            <li><span class="suggestion-label">Why it matters</span>${fill(guidance.why)}</li>
            <li><span class="suggestion-label">How to build it</span>${fill(guidance.how)}</li>
            <li><span class="suggestion-label">How to show it</span>${fill(guidance.show)}</li>
          </ul>
        </div>
      </div>`;
  }

  panel.innerHTML = `
    <div class="verdict-card tone-${verdict.tone}">
      ${roleLine}
      <div class="score-row">
        <div class="score-ring">
          <svg viewBox="0 0 80 80">
            <circle class="ring-track" cx="40" cy="40" r="${ringRadius}"></circle>
            <circle class="ring-fill" cx="40" cy="40" r="${ringRadius}" stroke-dasharray="${ringCircumference}" stroke-dashoffset="${ringOffset}"></circle>
          </svg>
          <span class="score-ring-label">${scoreDisplay}</span>
        </div>
        <div class="score-text">
          <h2>${escapeHtml(verdict.label)}</h2>
          <p>${escapeHtml(verdict.message)}</p>
        </div>
      </div>
      ${verdict.breakdown ? `<p class="score-breakdown">${escapeHtml(verdict.breakdown)}</p>` : ""}
      ${
        otherTerms.matched.length + otherTerms.missing.length > 0
          ? `<p class="score-breakdown">+ ${otherTerms.matched.length + otherTerms.missing.length} other JD term${otherTerms.matched.length + otherTerms.missing.length === 1 ? "" : "s"} outside our skill dictionary — not included in this score, see below.</p>`
          : ""
      }
    </div>

    <div class="panel-block">
      <h3>Skills that match ✅</h3>
      <div class="chip-row">${matchedChips}</div>
    </div>

    <div class="panel-block">
      <h3>Skills you're missing ⚠️</h3>
      ${missingBlock}
    </div>
    ${otherTermsBlock}
    <div class="panel-block tips-block">
      <h3>General tips</h3>
      <ul>
        ${buildGeneralTips({ analysis, verdict, resumeText, jobRole })
          .map((t) => `<li>${escapeHtml(t)}</li>`)
          .join("")}
      </ul>
    </div>
  `;
}

const ANALYSIS_STAGES = [
  "Reading job description...",
  "Identifying required and preferred skills...",
  "Scanning your resume for matches...",
  "Weighing gaps and calculating fit score...",
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function renderLoading(stageText) {
  document.getElementById("resultsPanel").innerHTML = `
    <div class="loading-state">
      <div class="spinner" aria-hidden="true"></div>
      <p>${escapeHtml(stageText)}</p>
    </div>`;
}

function setFormBusy(busy) {
  document.getElementById("analyzeBtn").disabled = busy;
  document.getElementById("sampleBtn").disabled = busy;
  document.getElementById("clearBtn").disabled = busy;
}

async function runAnalysis() {
  const jobRole = document.getElementById("jobRole").value.trim();
  const jobDescription = document.getElementById("jobDescription").value.trim();
  const resumeText = currentResumeText.trim();
  const errorBox = document.getElementById("formError");

  if (!jobDescription || !resumeText) {
    errorBox.textContent = "Please paste the job description and upload your resume before analyzing.";
    errorBox.hidden = false;
    return;
  }
  errorBox.hidden = true;

  setFormBusy(true);
  try {
    for (const stage of ANALYSIS_STAGES) {
      renderLoading(stage);
      await sleep(500);
    }

    const analysis = analyzeSkills(jobDescription, resumeText);
    const verdict = getVerdict(analysis);

    renderResults({ jobRole, analysis, verdict, resumeText });
  } finally {
    setFormBusy(false);
  }
}

const SAMPLE = {
  role: "Frontend Developer",
  jd: `We're looking for a Frontend Developer to join our product team.

Requirements:
- Strong experience with HTML, CSS, and JavaScript
- Proficiency in React and REST APIs
- Experience with Git and version control workflows
- Familiarity with responsive design
- Good communication and teamwork skills

Preferred:
- Experience with TypeScript
- Familiarity with Next.js
- Knowledge of Jest for testing`,
  resume: `Frontend developer with 2 years of experience building web applications.

- Built and maintained UI components using HTML, CSS, and JavaScript
- Developed features in React, integrating with REST APIs
- Used Git for version control in a team environment
- Collaborated closely with designers and backend engineers, strong communication skills
- Focused on responsive design for mobile and desktop`,
};

function showFileChip(name) {
  document.getElementById("resumeFileName").textContent = name;
  document.getElementById("resumeFileChip").hidden = false;
}

function hideFileChip() {
  document.getElementById("resumeFileChip").hidden = true;
  document.getElementById("resumeFileName").textContent = "";
}

// Marks the current in-flight upload (if any) as superseded, so that if it's
// still processing and finishes later, applyResumeResult() will ignore its
// result instead of silently overwriting what the user is now looking at
// after Remove/Clear/Load Example.
function discardInFlightUpload() {
  uploadGeneration++;
  document.getElementById("analyzeBtn").disabled = false;
}

function loadSample() {
  discardInFlightUpload();
  document.getElementById("jobRole").value = SAMPLE.role;
  document.getElementById("jobDescription").value = SAMPLE.jd;
  currentResumeText = SAMPLE.resume;
  document.getElementById("formError").hidden = true;
  document.getElementById("resumeFile").value = "";
  hideFileChip();
  setUploadStatus(`✅ Example resume loaded (${SAMPLE.resume.length.toLocaleString()} characters)`, "success");
}

function clearForm() {
  discardInFlightUpload();
  document.getElementById("jobRole").value = "";
  document.getElementById("jobDescription").value = "";
  currentResumeText = "";
  document.getElementById("formError").hidden = true;
  document.getElementById("resumeFile").value = "";
  hideFileChip();
  setUploadStatus("No resume uploaded yet.", "");
  document.getElementById("resultsPanel").innerHTML = `
    <div class="empty-state">
      <p>Your analysis will appear here.</p>
    </div>`;
}

let pdfjsReady = typeof window.pdfjsLib !== "undefined";
window.addEventListener("pdfjs-ready", () => {
  pdfjsReady = true;
});

function waitForPdfjs() {
  if (pdfjsReady) return Promise.resolve();
  return new Promise((resolve) => {
    window.addEventListener("pdfjs-ready", () => resolve(), { once: true });
    setTimeout(resolve, 5000);
  });
}

async function extractPdfText(file) {
  await waitForPdfjs();
  if (!window.pdfjsLib) throw new Error("PDF support failed to load.");
  const buf = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: buf }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((it) => it.str).join(" ") + "\n";
  }
  return text.trim();
}

const WORD_XML_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

async function extractDocxText(file) {
  if (!window.fflate) throw new Error("DOCX support failed to load.");
  const buf = await file.arrayBuffer();
  const unzipped = window.fflate.unzipSync(new Uint8Array(buf));
  const docXmlBytes = unzipped["word/document.xml"];
  if (!docXmlBytes) throw new Error("Not a valid .docx file.");

  const xmlText = new TextDecoder("utf-8").decode(docXmlBytes);
  const xmlDoc = new DOMParser().parseFromString(xmlText, "application/xml");
  if (xmlDoc.getElementsByTagName("parsererror").length) {
    throw new Error("Could not parse document.xml.");
  }

  const paragraphs = xmlDoc.getElementsByTagNameNS(WORD_XML_NS, "p");
  const lines = [];
  for (const p of paragraphs) {
    const textNodes = p.getElementsByTagNameNS(WORD_XML_NS, "t");
    let line = "";
    for (const t of textNodes) line += t.textContent;
    lines.push(line);
  }
  return lines.join("\n").trim();
}

// --- OCR fallback for PDFs with no extractable text layer -----------------
// Some PDFs (scanned documents, or ones exported from tools that don't embed
// proper font encoding info) render visible text but expose nothing to
// getTextContent(). This only runs when direct extraction comes back empty.

let tesseractWorkerBlobUrlPromise = null;

function getTesseractWorkerBlobUrl() {
  if (!tesseractWorkerBlobUrlPromise) {
    tesseractWorkerBlobUrlPromise = (async () => {
      const inlineEl = document.getElementById("tesseractWorkerSrc");
      const text = inlineEl
        ? inlineEl.textContent
        : await (await fetch("./tesseract-worker-embedded.js")).text();
      const blob = new Blob([text], { type: "text/javascript" });
      return URL.createObjectURL(blob);
    })();
  }
  return tesseractWorkerBlobUrlPromise;
}

const OCR_TIMEOUT_MS = 45000;

async function ocrImageSource(source, statusPrefix, myGeneration) {
  if (!window.Tesseract) throw new Error("OCR support failed to load.");
  const workerPath = await getTesseractWorkerBlobUrl();
  const worker = await window.Tesseract.createWorker("eng", 1, {
    workerPath,
    corePath: "unused://core",
    langPath: "embedded://",
    gzip: true,
    logger: (m) => {
      if (statusPrefix && m.status === "recognizing text" && myGeneration === uploadGeneration) {
        setUploadStatus(`${statusPrefix} ${Math.round(m.progress * 100)}%`, "");
      }
    },
  });
  try {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("OCR timed out")), OCR_TIMEOUT_MS)
    );
    const { data } = await Promise.race([worker.recognize(source), timeout]);
    return (data.text || "").trim();
  } finally {
    await worker.terminate();
  }
}

async function renderPdfPageToBlob(page, scale) {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d");
  await page.render({ canvasContext: ctx, viewport }).promise;
  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

const OCR_MAX_PDF_PAGES = 5;

async function extractPdfTextViaOcr(file, name, myGeneration) {
  await waitForPdfjs();
  if (!window.pdfjsLib) throw new Error("PDF support failed to load.");
  const buf = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: buf }).promise;
  const pageCount = Math.min(pdf.numPages, OCR_MAX_PDF_PAGES);
  let text = "";
  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const blob = await renderPdfPageToBlob(page, 2);
    const pageText = await ocrImageSource(
      blob,
      `No text layer found — running OCR on ${name} (page ${i} of ${pageCount})...`,
      myGeneration
    );
    text += pageText + "\n";
  }
  return text.trim();
}

let currentResumeText = "";

function setUploadStatus(message, tone) {
  const el = document.getElementById("uploadStatus");
  el.textContent = message;
  el.className = "upload-status" + (tone ? " " + tone : "");
  if (tone === "success") {
    document.getElementById("formError").hidden = true;
  }
}

let uploadGeneration = 0;

async function handleResumeFile(file) {
  if (!file) return;
  document.getElementById("formError").hidden = true;
  showFileChip(file.name || "file");
  const analyzeBtn = document.getElementById("analyzeBtn");
  analyzeBtn.disabled = true;
  const myGeneration = ++uploadGeneration;
  try {
    await processResumeFile(file, myGeneration);
  } finally {
    // If superseded (a newer file, a remove, or a clear happened meanwhile),
    // leave the button alone -- whatever superseded this one already owns it.
    if (myGeneration === uploadGeneration) {
      analyzeBtn.disabled = false;
    }
  }
}

// Only applies a terminal result (extracted text + final status) if no newer
// upload, remove, or clear has started since this one began -- otherwise a
// slow extraction that finishes after being superseded would silently
// resurrect or clobber whatever the user is now looking at.
function applyResumeResult(myGeneration, text, message, tone) {
  if (myGeneration !== uploadGeneration) return;
  currentResumeText = text;
  setUploadStatus(message, tone);
}

async function processResumeFile(file, myGeneration) {
  const name = file.name || "file";
  const ext = name.toLowerCase().split(".").pop();

  if (ext === "txt" || ext === "md") {
    setUploadStatus(`Reading ${name}...`, "");
    try {
      const text = (await file.text()).trim();
      applyResumeResult(myGeneration, text, `✅ Loaded ${name} (${text.length.toLocaleString()} characters)`, "success");
    } catch (err) {
      applyResumeResult(myGeneration, "", `Couldn't read ${name}. Please try a different file.`, "error");
    }
    return;
  }

  if (ext === "pdf") {
    setUploadStatus(`Parsing ${name}...`, "");
    let text = "";
    try {
      text = await extractPdfText(file);
    } catch (err) {
      applyResumeResult(
        myGeneration,
        "",
        `⚠️ Couldn't read ${name}. It may be password-protected or corrupted — try a different file.`,
        "error"
      );
      return;
    }

    if (text) {
      applyResumeResult(
        myGeneration,
        text,
        `✅ Extracted text from ${name} (${text.length.toLocaleString()} characters)`,
        "success"
      );
      return;
    }

    // No extractable text layer -- either a scanned PDF, or one exported
    // without proper font encoding. Fall back to OCR before giving up.
    // OCR's worker-in-worker loading relies on Blob URLs, which browsers
    // restrict under the null origin a file:// page runs in, so it never
    // actually starts there -- fail fast with an accurate message instead
    // of a slow, confusing crash.
    if (location.protocol === "file:") {
      applyResumeResult(
        myGeneration,
        "",
        `⚠️ Couldn't find a text layer in ${name}. OCR fallback isn't available when running this file locally (double-clicked) — try the online version, or paste the resume text into a .txt file instead.`,
        "error"
      );
      return;
    }

    setUploadStatus(`No text layer found in ${name} — running OCR...`, "");
    try {
      const ocrText = await extractPdfTextViaOcr(file, name, myGeneration);
      if (!ocrText) {
        applyResumeResult(
          myGeneration,
          "",
          `⚠️ Couldn't find any readable text in ${name}, even with OCR. Try a clearer scan or a different file.`,
          "error"
        );
        return;
      }
      applyResumeResult(
        myGeneration,
        ocrText,
        `✅ Extracted text from ${name} via OCR (${ocrText.length.toLocaleString()} characters). OCR isn't perfect on scanned documents — worth a quick sanity check of the results below.`,
        "success"
      );
    } catch (err) {
      applyResumeResult(
        myGeneration,
        "",
        `⚠️ Couldn't run OCR on ${name}. Try a clearer scan, or paste the resume text into a .txt file instead.`,
        "error"
      );
    }
    return;
  }

  if (ext === "docx") {
    setUploadStatus(`Parsing ${name}...`, "");
    try {
      const text = await extractDocxText(file);
      if (!text) {
        applyResumeResult(myGeneration, "", `⚠️ Couldn't find text in ${name}. Try a different file.`, "error");
        return;
      }
      applyResumeResult(myGeneration, text, `✅ Extracted text from ${name} (${text.length.toLocaleString()} characters)`, "success");
    } catch (err) {
      applyResumeResult(
        myGeneration,
        "",
        `⚠️ Couldn't read ${name}. It may be corrupted, password-protected, or an older .doc file — try saving it as .docx or .pdf.`,
        "error"
      );
    }
    return;
  }

  applyResumeResult(
    myGeneration,
    "",
    `⚠️ "${name}" isn't a format we can read text from. Try a .pdf, .docx, .txt, or .md file.`,
    "error"
  );
}

document.getElementById("resumeFile").addEventListener("change", (e) => {
  const file = e.target.files[0];
  handleResumeFile(file);
  e.target.value = "";
});

document.getElementById("removeResumeBtn").addEventListener("click", () => {
  discardInFlightUpload();
  currentResumeText = "";
  document.getElementById("resumeFile").value = "";
  hideFileChip();
  setUploadStatus("No resume uploaded yet.", "");
  document.getElementById("formError").hidden = true;
});

document.getElementById("jobDescription").addEventListener("input", () => {
  document.getElementById("formError").hidden = true;
});

document.getElementById("analyzeBtn").addEventListener("click", runAnalysis);
document.getElementById("sampleBtn").addEventListener("click", loadSample);
document.getElementById("clearBtn").addEventListener("click", clearForm);

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document.getElementById("themeToggle").setAttribute(
    "aria-label",
    theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
  );
  try {
    localStorage.setItem("skillmatch-theme", theme);
  } catch (e) {}
}

applyTheme(document.documentElement.getAttribute("data-theme") || "light");

document.getElementById("themeToggle").addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  applyTheme(current === "dark" ? "light" : "dark");
});
