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
    hardSoft: buildHardSoftBreakdown(matched, missing),
  };
}

// SKILLS_DB's "Soft Skills" category is the one interpersonal/behavioral
// bucket (Teamwork, Communication, Leadership, ...); every other category is
// a teachable, verifiable "hard" skill (a language, tool, framework,
// methodology, certification). That split maps directly onto the standard
// resume-writing distinction between hard and soft skills.
function isSoftSkill(entry) {
  return entry.skill.category === "Soft Skills";
}

function summarizeSkillGroup(matched, missing) {
  const total = matched.length + missing.length;
  return {
    matched,
    missing,
    total,
    pct: total > 0 ? Math.round((matched.length / total) * 100) : null,
  };
}

function buildHardSoftBreakdown(matched, missing) {
  return {
    hard: summarizeSkillGroup(matched.filter((e) => !isSoftSkill(e)), missing.filter((e) => !isSoftSkill(e))),
    soft: summarizeSkillGroup(matched.filter(isSoftSkill), missing.filter(isSoftSkill)),
  };
}

// --- ATS (Applicant Tracking System) compatibility ------------------------
// A high skill-match score assumes the resume's text was readable in the
// first place. These checks catch the separate, common failure mode where
// an ATS can't even extract/parse the resume correctly -- a scanned PDF
// with no text layer, missing contact info, no standard section headers --
// all things a skill-match score alone would never surface. Only checkable
// from resumeText + how it was extracted, so this is a parseability signal,
// not a formatting/layout audit (tables and columns can't be detected from
// flat extracted text).
const ATS_EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const ATS_PHONE_RE = /(\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/;
const ATS_SECTION_PATTERNS = [
  { id: "experience", label: "Experience", re: /\b(work experience|professional experience|employment history|experience)\b/i },
  { id: "education", label: "Education", re: /\beducation\b/i },
  { id: "skills", label: "Skills", re: /\b(skills|technical skills|core competencies)\b/i },
];
const ATS_MIN_WORDS = 150;
const CONTENT_MIN_WORDS = 250;
const CONTENT_MAX_WORDS = 1200;
const WEAK_PHRASE_RE = /\b(responsible for|duties included|duties include|worked on|helped with|in charge of|tasked with)\b/i;
const PLACEHOLDER_RE = /\[(your name|company name|insert [a-z ]+|job title|address|phone number|email)\]|lorem ipsum|xxxxxxxx|\btodo\b:?/i;
const UNPROFESSIONAL_EMAIL_WORDS = ["sexy", "hot", "cutie", "babe", "stud", "player", "gamer", "xxx", "420", "69", "party", "drunk", "lover", "swag", "thug"];
const FIRST_PERSON_RE = /\b(I|my|me|myself)\b/g;
const DOB_AGE_RE = /\b(date of birth|d\.?o\.?b\.?|born (on|in)\b|\bage\s*[:\-]?\s*\d{1,2}\b)/i;
const MARITAL_RE = /\bmarital status\b|\b(married|divorced|widowed)\b/i;
const SSN_RE = /\b\d{3}-\d{2}-\d{4}\b/;
const SENIOR_TITLE_RE = /\b(senior|sr\.?|staff|principal|lead|director|head of|vp|vice president|chief)\b/i;
const JUNIOR_TITLE_RE = /\b(junior|jr\.?|entry[\s-]level|intern(ship)?|graduate)\b/i;
const YEARS_EXPERIENCE_RE = /(\d{1,2})\+?\s*years?\s*(of\s+)?experience/gi;
const TAILORING_MIN_OVERLAP_PCT = 25;
const TAILORING_STOPWORDS = new Set([
  "about", "across", "after", "again", "against", "also", "among", "being", "below", "between", "both",
  "during", "each", "either", "every", "further", "have", "here", "however", "into", "less", "more", "most",
  "much", "must", "need", "only", "other", "over", "some", "still", "strong", "such", "than", "that", "their",
  "them", "then", "there", "these", "they", "this", "those", "through", "under", "using", "very", "what",
  "when", "where", "which", "while", "who", "whom", "whose", "will", "with", "within", "without", "would",
  "could", "should", "shall", "might", "your", "you", "are", "was", "were", "its", "not", "can", "may", "per",
  "etc", "role", "team", "work", "years", "experience", "ability", "skills", "including", "preferred",
  "required", "requirements", "responsibilities", "looking", "join", "have", "from",
]);

function makeCheck(id, label, pass, detail) {
  return { id, label, pass, detail };
}

function buildContentChecks(resumeText, wordCount) {
  const hasQuant = QUANTIFIED_ACHIEVEMENT_RE.test(resumeText);
  const hasWeakPhrase = WEAK_PHRASE_RE.test(resumeText);
  const tooShort = wordCount > 0 && wordCount < CONTENT_MIN_WORDS;
  const tooLong = wordCount > CONTENT_MAX_WORDS;

  return [
    makeCheck(
      "quantified",
      "Quantified achievements",
      hasQuant,
      hasQuant
        ? "Your resume includes measurable results (numbers, percentages, or dollar amounts) — these read as far more credible than unquantified duties."
        : `No quantified achievements found. Wherever possible, turn responsibilities into measurable outcomes, e.g. "reduced load time by 30%" instead of "improved performance."`
    ),
    makeCheck(
      "actionVerbs",
      "Strong action verbs",
      !hasWeakPhrase,
      !hasWeakPhrase
        ? "Your bullet points lead with action-oriented language rather than passive filler phrases."
        : `Found passive phrases like "responsible for" or "duties included." Rewrite bullets to open with a strong action verb instead (e.g. "Led," "Built," "Reduced").`
    ),
    makeCheck(
      "length",
      "Appropriate content length",
      !tooShort && !tooLong,
      tooShort
        ? `Only ${wordCount} words of content — this reads as thin. Most resumes land between roughly 300-800 words (about 1-2 pages).`
        : tooLong
        ? `${wordCount.toLocaleString()} words is quite long. Unless this is an academic or executive-level resume, tightening to 1-2 pages usually reads better to a time-pressed recruiter.`
        : `${wordCount.toLocaleString()} words — a reasonable length for a recruiter to skim quickly.`
    ),
  ];
}

function buildSectionChecks(resumeText) {
  return ATS_SECTION_PATTERNS.map((s) => {
    const found = s.re.test(resumeText);
    return makeCheck(
      `section-${s.id}`,
      `${s.label} section`,
      found,
      found
        ? `Found a clear "${s.label}" section header — ATS parsers rely on this exact kind of heading to segment your resume correctly.`
        : `No "${s.label}" section header found. Unconventional wording (e.g. "What I've Built" instead of "Experience") can cause an ATS to drop or miscategorize that content.`
    );
  });
}

function buildAtsEssentialChecks({ resumeText, fileExt, usedOcr, wordCount }) {
  const hasEmail = ATS_EMAIL_RE.test(resumeText);
  const hasPhone = ATS_PHONE_RE.test(resumeText);
  const isScannedPdf = fileExt === "pdf" && usedOcr;
  const isTooShortForParsing = wordCount > 0 && wordCount < ATS_MIN_WORDS;

  return [
    makeCheck(
      "email",
      "Contact email detected",
      hasEmail,
      hasEmail
        ? "Found an email address in plain text."
        : "No email address found in the extracted text. If it's inside an image, header/footer, or text box, most ATS parsers will miss it entirely."
    ),
    makeCheck(
      "phone",
      "Phone number detected",
      hasPhone,
      hasPhone
        ? "Found a phone number in plain text."
        : "No phone number found in the extracted text. Double-check it isn't locked inside an image or graphic."
    ),
    makeCheck(
      "format",
      "ATS-friendly file format",
      !isScannedPdf,
      isScannedPdf
        ? "This PDF had no real text layer and needed OCR just to read it here — many real ATS systems can't OCR a scanned resume at all, and will see a blank submission. A text-based PDF or .docx export is much safer."
        : "The file has a real, extractable text layer, which is what ATS parsers need."
    ),
    makeCheck(
      "extractable",
      "Enough extractable content",
      !isTooShortForParsing,
      isTooShortForParsing
        ? `Only ${wordCount} words were extracted. This can happen when a resume relies on multi-column layouts, tables, or text boxes that break apart during parsing.`
        : `Extracted ${wordCount.toLocaleString()} words of text — enough for reliable ATS parsing.`
    ),
  ];
}

function buildHrRedFlagChecks(resumeText) {
  const emailMatch = resumeText.match(ATS_EMAIL_RE);
  const email = emailMatch ? emailMatch[0] : null;
  const localPart = email ? email.split("@")[0].toLowerCase() : null;
  const unprofessional = localPart
    ? UNPROFESSIONAL_EMAIL_WORDS.some((w) => localPart.includes(w)) || /\d{6,}/.test(localPart)
    : false;

  const firstPersonCount = (resumeText.match(FIRST_PERSON_RE) || []).length;
  const hasPlaceholder = PLACEHOLDER_RE.test(resumeText);

  return [
    makeCheck(
      "professionalEmail",
      "Professional email address",
      !unprofessional,
      !email
        ? "No email was found to evaluate — see ATS Essentials."
        : unprofessional
        ? `The email address "${email}" may read as unprofessional to a recruiter. A simple name-based address (e.g. firstname.lastname@email.com) is the safest choice.`
        : "Your email address reads as professional."
    ),
    makeCheck(
      "firstPerson",
      "Avoids first-person language",
      firstPersonCount <= 3,
      firstPersonCount <= 3
        ? `Your resume avoids first-person pronouns ("I", "my"), which is the standard convention — bullets read as implied first-person without stating it.`
        : `Found ${firstPersonCount} instances of "I"/"my"/"me". Convention is to drop these and start bullets directly with an action verb (e.g. "Led a team..." not "I led a team...").`
    ),
    makeCheck(
      "placeholders",
      "No leftover template placeholders",
      !hasPlaceholder,
      !hasPlaceholder
        ? `No leftover template placeholder text (like "[Your Name]" or "Lorem ipsum") was found.`
        : `Found leftover placeholder text (e.g. "[Your Name]" or "Lorem ipsum") — a clear sign a template wasn't fully filled in, which reads very poorly to a recruiter.`
    ),
  ];
}

function buildDiscriminationChecks(resumeText) {
  const hasDob = DOB_AGE_RE.test(resumeText);
  const hasMarital = MARITAL_RE.test(resumeText);
  const hasSsn = SSN_RE.test(resumeText);

  return [
    makeCheck(
      "age",
      "No age or date of birth disclosed",
      !hasDob,
      !hasDob
        ? "No date of birth or age was found."
        : "Found what looks like a date of birth or age. Most modern hiring guidance recommends leaving this off — it adds legal risk for employers and has no bearing on your qualifications."
    ),
    makeCheck(
      "marital",
      "No marital/family status disclosed",
      !hasMarital,
      !hasMarital
        ? "No marital or family status was found."
        : "Found a mention of marital status. This is generally recommended to leave off a resume in most modern hiring markets."
    ),
    makeCheck(
      "ssn",
      "No sensitive ID numbers detected",
      !hasSsn,
      !hasSsn
        ? "No Social Security Number or similar ID pattern was found."
        : "Found what looks like a Social Security Number. This should never appear on a resume — remove it immediately."
    ),
  ];
}

function extractMaxYears(text) {
  let max = null;
  for (const m of text.matchAll(YEARS_EXPERIENCE_RE)) {
    const n = parseInt(m[1], 10);
    if (!isNaN(n) && (max === null || n > max)) max = n;
  }
  return max;
}

function buildSeniorityChecks({ jobDescription, resumeText }) {
  const jdIsSenior = SENIOR_TITLE_RE.test(jobDescription);
  const jdIsJunior = !jdIsSenior && JUNIOR_TITLE_RE.test(jobDescription);
  const resumeIsSenior = SENIOR_TITLE_RE.test(resumeText);
  const jdYears = extractMaxYears(jobDescription);
  const resumeYears = extractMaxYears(resumeText);

  let titlePass = true;
  let titleDetail = `This job description didn't use clear seniority language (e.g. "Senior", "Junior") for us to compare against your resume.`;
  if (jdIsSenior) {
    titlePass = resumeIsSenior || (resumeYears !== null && resumeYears >= 5);
    titleDetail = titlePass
      ? "This reads as a senior-level posting, and your resume shows senior-level language or enough years of experience to match."
      : `This reads as a senior-level posting (mentions "Senior"/"Lead"/similar), but we didn't find senior-level titles or 5+ years of experience mentioned in your resume — worth double-checking this is the right level, or making your seniority signals more explicit.`;
  } else if (jdIsJunior) {
    titleDetail = resumeIsSenior
      ? "This reads as an entry-level/junior posting, but your resume shows senior-level language. That's not wrong, but you may want to address the level difference in your cover letter."
      : "This reads as an entry-level/junior posting, and your resume doesn't suggest an experience mismatch.";
  }

  let yearsPass = true;
  let yearsDetail = "This job description didn't specify a required number of years of experience.";
  if (jdYears !== null) {
    if (resumeYears !== null) {
      yearsPass = resumeYears >= jdYears;
      yearsDetail = yearsPass
        ? `This role asks for ${jdYears}+ years of experience, and your resume mentions ${resumeYears} — that clears the bar.`
        : `This role asks for ${jdYears}+ years of experience, but your resume mentions ${resumeYears} — worth addressing this gap directly if you're applying anyway.`;
    } else {
      yearsDetail = `This role asks for ${jdYears}+ years of experience. Your resume doesn't state a number explicitly, which is fine — just make sure your work history clearly spans enough time to support it.`;
    }
  }

  return [
    makeCheck("titleLevel", "Seniority level matches the role", titlePass, titleDetail),
    makeCheck("yearsRequired", "Meets years-of-experience requirement", yearsPass, yearsDetail),
  ];
}

function extractSignificantWords(text) {
  const words = text.toLowerCase().match(/[a-z][a-z'-]{4,}/g) || [];
  return words.filter((w) => !TAILORING_STOPWORDS.has(w));
}

function keywordOverlap(jdText, resumeText) {
  const jdWords = new Set(extractSignificantWords(jdText));
  if (jdWords.size === 0) return { pct: null, matched: 0, total: 0 };
  const resumeWords = new Set(extractSignificantWords(resumeText));
  let matched = 0;
  jdWords.forEach((w) => {
    if (resumeWords.has(w)) matched++;
  });
  return { pct: Math.round((matched / jdWords.size) * 100), matched, total: jdWords.size };
}

function buildTailoringChecks({ jobRole, jobDescription, resumeText, fitScore }) {
  const roleTrim = (jobRole || "").trim();
  const titleFound = roleTrim ? buildSkillRegex(roleTrim).test(resumeText) : null;
  const overlap = keywordOverlap(jobDescription, resumeText);

  return [
    makeCheck(
      "titleMirrored",
      "Job title mirrored in resume",
      titleFound !== false,
      !roleTrim
        ? "No job title was entered in the Job Role field, so we couldn't check whether it's mirrored in your resume."
        : titleFound
        ? `Your resume mentions "${roleTrim}" — mirroring the exact job title helps with keyword-matching ATS systems and shows you're targeting this specific role.`
        : `Your resume doesn't mention "${roleTrim}" anywhere. Many ATS systems and recruiters look for the exact job title — consider adding it if it genuinely describes your background.`
    ),
    makeCheck(
      "keywordOverlap",
      "Overall keyword overlap with this job description",
      overlap.pct === null ? true : overlap.pct >= TAILORING_MIN_OVERLAP_PCT,
      overlap.pct === null
        ? "Paste a job description to check keyword overlap."
        : `Your resume shares ${overlap.pct}% of this job description's distinctive keywords (${overlap.matched}/${overlap.total}) — a broader signal than the curated skills list above.`
    ),
    makeCheck(
      "requiredSkillsCoverage",
      "Required/preferred skills coverage",
      fitScore === null ? true : fitScore >= 60,
      fitScore === null
        ? "Not enough specific skills were detected in this job description to score coverage."
        : `Your resume matches ${fitScore}% of the specific required/preferred skills this JD asks for — see the Fit Score above for the full breakdown.`
    ),
  ];
}

const ATS_CATEGORY_DEFS = [
  { id: "content", label: "Content" },
  { id: "sections", label: "Sections" },
  { id: "atsEssentials", label: "ATS Essentials" },
  { id: "hrRedFlags", label: "HR Red Flags" },
  { id: "discrimination", label: "Discrimination Risk" },
  { id: "seniority", label: "Seniority Match" },
  { id: "tailoring", label: "Tailoring" },
];

function analyzeAts({ resumeText, fileExt, usedOcr, jobDescription, jobRole, fitScore }) {
  const wordCount = (resumeText.match(/\S+/g) || []).length;
  const jd = jobDescription || "";

  const checksByCategory = {
    content: buildContentChecks(resumeText, wordCount),
    sections: buildSectionChecks(resumeText),
    atsEssentials: buildAtsEssentialChecks({ resumeText, fileExt, usedOcr, wordCount }),
    hrRedFlags: buildHrRedFlagChecks(resumeText),
    discrimination: buildDiscriminationChecks(resumeText),
    seniority: buildSeniorityChecks({ jobDescription: jd, resumeText }),
    tailoring: buildTailoringChecks({ jobRole, jobDescription: jd, resumeText, fitScore }),
  };

  const categories = ATS_CATEGORY_DEFS.map((def) => {
    const checks = checksByCategory[def.id];
    const passed = checks.filter((c) => c.pass).length;
    const score = checks.length > 0 ? Math.round((passed / checks.length) * 100) : null;
    return { ...def, checks, passed, total: checks.length, score };
  });

  const scoredCategories = categories.filter((c) => c.score !== null);
  const overallScore =
    scoredCategories.length > 0
      ? Math.round(scoredCategories.reduce((sum, c) => sum + c.score, 0) / scoredCategories.length)
      : null;
  const passed = categories.reduce((sum, c) => sum + c.passed, 0);
  const total = categories.reduce((sum, c) => sum + c.total, 0);

  return { categories, overallScore, passed, total };
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

function statTone(pct) {
  if (pct === null) return "neutral";
  if (pct >= 75) return "good";
  if (pct >= 50) return "warn";
  return "bad";
}

// Shared ring markup so every score shown in the results panel (fit score,
// ATS score) renders identically -- one visual language, not a one-off per
// section.
function renderScoreRing(pct) {
  const ringRadius = 34;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const clamped = pct === null ? 0 : Math.max(0, Math.min(100, pct));
  const ringOffset = ringCircumference * (1 - clamped / 100);
  const label = pct === null ? "—" : `${pct}%`;
  return `
    <div class="score-ring">
      <svg viewBox="0 0 80 80">
        <circle class="ring-track" cx="40" cy="40" r="${ringRadius}"></circle>
        <circle class="ring-fill" cx="40" cy="40" r="${ringRadius}" stroke-dasharray="${ringCircumference}" stroke-dashoffset="${ringOffset}"></circle>
      </svg>
      <span class="score-ring-label">${label}</span>
    </div>`;
}

function hardSoftAssessment(tone, labelLower) {
  if (tone === "neutral") return `No ${labelLower} detected in this job description.`;
  if (tone === "good") return `Strong coverage — most ${labelLower} this role needs are already on your resume.`;
  if (tone === "warn") return `Partial coverage — you're missing some ${labelLower} this role asks for.`;
  return `Weak coverage — most of the ${labelLower} this role needs aren't on your resume yet.`;
}

function buildHardSoftCard(title, group) {
  const labelLower = title.toLowerCase();
  const tone = group.total === 0 ? "neutral" : statTone(group.pct);
  const scoreDisplay = group.total === 0 ? "—" : `${group.pct}%`;

  const matchedChips = group.matched.length
    ? group.matched.map((e) => chip(e.skill.name, "chip-good")).join("")
    : `<p class="muted">None matched.</p>`;
  const missingChips = group.missing.length
    ? group.missing.map((e) => chip(e.skill.name, "chip-bad")).join("")
    : `<p class="muted">None missing — full coverage.</p>`;

  return `
    <div class="hardsoft-card tone-${tone}">
      <div class="hardsoft-head">
        <h4>${escapeHtml(title)}</h4>
        <span class="hardsoft-score">${scoreDisplay}</span>
      </div>
      ${group.total > 0 ? `<div class="stat-bar"><div class="stat-bar-fill tone-${tone}" style="width:${group.pct}%"></div></div>` : ""}
      <p class="hardsoft-assessment">${escapeHtml(hardSoftAssessment(tone, labelLower))}</p>
      ${
        group.total > 0
          ? `
        <div class="hardsoft-chips">
          <span class="suggestion-label">Matched (${group.matched.length}/${group.total})</span>
          <div class="chip-row">${matchedChips}</div>
        </div>
        <div class="hardsoft-chips">
          <span class="suggestion-label">Missing (${group.missing.length}/${group.total})</span>
          <div class="chip-row">${missingChips}</div>
        </div>`
          : ""
      }
    </div>`;
}

function buildHardSoftBlock(hardSoft) {
  const { hard, soft } = hardSoft;
  if (hard.total === 0 && soft.total === 0) return "";

  return `
    <div class="panel-block">
      <h3>Hard Skills vs. Soft Skills</h3>
      <div class="hardsoft-grid">
        ${buildHardSoftCard("Hard Skills", hard)}
        ${buildHardSoftCard("Soft Skills", soft)}
      </div>
    </div>`;
}

// Turns the pass/fail checklist into a scored, explained verdict -- the
// same shape as getVerdict() for the fit score -- so ATS compatibility gets
// equal visual and explanatory weight instead of reading as an afterthought.
function getAtsVerdict(ats) {
  if (ats.overallScore === null) {
    return { score: null, tone: "neutral", label: "Not enough information", message: "Upload a resume to check ATS compatibility." };
  }
  const score = ats.overallScore;
  if (score >= 90) {
    return {
      score,
      tone: "good",
      label: "Excellent — built to pass ATS screening",
      message: "Your resume passed nearly every check across all categories below. An Applicant Tracking System should be able to read and rank it well.",
    };
  }
  if (score >= 65) {
    return {
      score,
      tone: "warn",
      label: "Good, with some fixable risks",
      message: "Most categories look solid, but a few issues below could weaken how an ATS -- or a recruiter -- reads your resume.",
    };
  }
  return {
    score,
    tone: "bad",
    label: "High risk across multiple categories",
    message: "Several categories below flag real risks that could cause an ATS to misread your resume, or give a recruiter a reason to pass.",
  };
}

function buildAtsCategoryBlock(cat) {
  const tone = cat.score === null ? "neutral" : statTone(cat.score);
  const checksHtml = cat.checks
    .map(
      (c) => `
        <li class="ats-check ${c.pass ? "pass" : "fail"}">
          <span class="ats-check-icon" aria-hidden="true">${c.pass ? "✅" : "⚠️"}</span>
          <div class="ats-check-body">
            <span class="ats-check-label">${escapeHtml(c.label)}</span>
            <p>${escapeHtml(c.detail)}</p>
          </div>
        </li>`
    )
    .join("");

  return `
    <div class="ats-category">
      <div class="ats-category-head">
        <h4>${escapeHtml(cat.label)}</h4>
        <span class="ats-category-score tone-${tone}">${cat.score === null ? "—" : `${cat.score}%`}</span>
      </div>
      <ul class="ats-checklist">${checksHtml}</ul>
    </div>`;
}

function buildAtsBlock(ats) {
  const verdict = getAtsVerdict(ats);
  const categoriesHtml = ats.categories.map(buildAtsCategoryBlock).join("");

  return `
    <div class="panel-block">
      <h3>ATS Compatibility Score</h3>
      <div class="verdict-card tone-${verdict.tone}">
        <div class="score-row">
          ${renderScoreRing(verdict.score)}
          <div class="score-text">
            <h2>${escapeHtml(verdict.label)}</h2>
            <p>${escapeHtml(verdict.message)}</p>
          </div>
        </div>
        <p class="score-breakdown">${ats.passed}/${ats.total} checks passed across ${ats.categories.length} categories</p>
      </div>
      ${categoriesHtml}
    </div>`;
}

function renderResults({ jobRole, analysis, verdict, resumeText, ats, jobDescription }) {
  const { score, matched, missing } = analysis;
  const panel = document.getElementById("resultsPanel");

  const roleLine = jobRole
    ? `<p class="role-line">Analysis for: <strong>${escapeHtml(jobRole)}</strong></p>`
    : "";

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
        ${renderScoreRing(score)}
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

    ${buildHardSoftBlock(analysis.hardSoft)}
    ${buildAtsBlock(ats)}

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

    <div class="panel-block tailor-block">
      <h3>Tailor My Resume with AI ✨</h3>
      <p class="muted">Uses Claude (Anthropic's AI) to rewrite your resume for this specific job — the one feature on this page that sends data off your device. Clicking the button below sends your resume and this job description to Anthropic's API for processing. Nothing else on this page does that.</p>
      <button id="tailorBtn" type="button" class="primary">Tailor My Resume</button>
      <div id="tailorResult"></div>
    </div>
  `;

  const tailorBtn = document.getElementById("tailorBtn");
  if (tailorBtn) {
    tailorBtn.addEventListener("click", () => {
      const missingSkillNames = analysis.missing.map((e) => e.skill.name);
      runTailorResume({ jobRole, jobDescription, resumeText, missingSkills: missingSkillNames });
    });
  }
}

async function runTailorResume({ jobRole, jobDescription, resumeText, missingSkills }) {
  const btn = document.getElementById("tailorBtn");
  const resultEl = document.getElementById("tailorResult");
  btn.disabled = true;
  btn.textContent = "Tailoring...";
  resultEl.innerHTML = `<p class="muted">Sending your resume and this job description to Claude for rewriting — this can take 10-20 seconds...</p>`;

  try {
    const res = await fetch("/.netlify/functions/tailor-resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeText, jobDescription, jobRole, missingSkills }),
    });

    if (!res.ok) {
      let message = "Something went wrong tailoring your resume. Please try again.";
      try {
        const errBody = await res.json();
        if (errBody && errBody.error) message = errBody.error;
      } catch (e) {}
      resultEl.innerHTML = `<p class="error-text">${escapeHtml(message)}</p>`;
      return;
    }

    const data = await res.json();
    const changesHtml =
      Array.isArray(data.changes) && data.changes.length
        ? `<ul class="tailor-changes">${data.changes.map((c) => `<li>${escapeHtml(c)}</li>`).join("")}</ul>`
        : "";

    resultEl.innerHTML = `
      <div class="tailor-output">
        <h4>Suggested changes</h4>
        ${changesHtml}
        <h4>Tailored resume <span class="muted">— edit freely below</span></h4>
        <p class="muted">This is a draft, not a final answer — the text is fully editable. Fix anything that doesn't sound like you before copying or downloading.</p>
        <textarea id="tailoredResumeText" class="tailor-textarea">${escapeHtml(data.tailoredResume)}</textarea>
        <div class="tailor-actions">
          <button type="button" class="primary" id="copyTailoredBtn">Copy</button>
          <button type="button" class="primary" id="downloadTailoredBtn">Download .txt</button>
        </div>
      </div>`;

    const textarea = document.getElementById("tailoredResumeText");

    document.getElementById("copyTailoredBtn").addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(textarea.value);
        const copyBtn = document.getElementById("copyTailoredBtn");
        copyBtn.textContent = "Copied!";
        setTimeout(() => {
          copyBtn.textContent = "Copy";
        }, 1500);
      } catch (e) {}
    });

    document.getElementById("downloadTailoredBtn").addEventListener("click", () => {
      const blob = new Blob([textarea.value], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "tailored-resume.txt";
      a.click();
      URL.revokeObjectURL(url);
    });
  } catch (err) {
    resultEl.innerHTML = `<p class="error-text">Network error while tailoring your resume. Please try again.</p>`;
  } finally {
    btn.disabled = false;
    btn.textContent = "Tailor My Resume";
  }
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
    const ats = analyzeAts({
      resumeText,
      fileExt: currentResumeFileExt,
      usedOcr: currentResumeUsedOcr,
      jobDescription,
      jobRole,
      fitScore: analysis.score,
    });

    renderResults({ jobRole, analysis, verdict, resumeText, ats, jobDescription });
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
  currentResumeFileExt = "txt";
  currentResumeUsedOcr = false;
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
  currentResumeFileExt = null;
  currentResumeUsedOcr = false;
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
let currentResumeFileExt = null;
let currentResumeUsedOcr = false;

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
function applyResumeResult(myGeneration, text, message, tone, meta) {
  if (myGeneration !== uploadGeneration) return;
  currentResumeText = text;
  currentResumeFileExt = meta ? meta.fileExt : null;
  currentResumeUsedOcr = meta ? !!meta.usedOcr : false;
  setUploadStatus(message, tone);
}

async function processResumeFile(file, myGeneration) {
  const name = file.name || "file";
  const ext = name.toLowerCase().split(".").pop();

  if (ext === "txt" || ext === "md") {
    setUploadStatus(`Reading ${name}...`, "");
    try {
      const text = (await file.text()).trim();
      applyResumeResult(myGeneration, text, `✅ Loaded ${name} (${text.length.toLocaleString()} characters)`, "success", { fileExt: ext, usedOcr: false });
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
        "success",
        { fileExt: "pdf", usedOcr: false }
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
        "success",
        { fileExt: "pdf", usedOcr: true }
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
      applyResumeResult(myGeneration, text, `✅ Extracted text from ${name} (${text.length.toLocaleString()} characters)`, "success", { fileExt: "docx", usedOcr: false });
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
  currentResumeFileExt = null;
  currentResumeUsedOcr = false;
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

document.getElementById("themeToggle").addEventListener("click", (e) => {
  const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  const next = current === "dark" ? "light" : "dark";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!document.startViewTransition || reducedMotion) {
    applyTheme(next);
    return;
  }

  // Circular reveal expanding from the click point, via the View
  // Transitions API: startViewTransition snapshots old vs. new state, then
  // we animate a clip-path on the new snapshot ourselves so it "wipes in"
  // instead of the default cross-fade (disabled in CSS for ::view-transition).
  const x = e.clientX;
  const y = e.clientY;
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );

  const transition = document.startViewTransition(() => applyTheme(next));
  transition.ready.then(() => {
    const clipAnimation = document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`] },
      { duration: 550, easing: "ease-in-out", pseudoElement: "::view-transition-new(root)" }
    );
    // Without this, Chromium can leave a stale sliver of the old theme
    // painted in a corner after the clip animation finishes, until some
    // unrelated repaint (resize, scroll) happens to clear it -- the WAAPI
    // animation completing doesn't reliably trigger a fresh compositor
    // frame on its own. Forcing a layout read nudges it to repaint.
    clipAnimation.finished
      .then(() => {
        void document.documentElement.offsetHeight;
      })
      .catch(() => {});
  });
});
