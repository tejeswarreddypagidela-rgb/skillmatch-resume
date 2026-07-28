import { describe, it, expect, beforeAll } from "vitest";
import { loadApp } from "./helpers/loadApp.js";

let app;
beforeAll(() => {
  app = loadApp();
});

describe("splitJdSections", () => {
  it("splits required text from a 'nice to have' section", () => {
    const { required, preferred } = app.splitJdSections(
      "Must know Python and SQL. Nice to have: experience with GraphQL."
    );
    expect(required).toContain("Python");
    expect(preferred).toContain("GraphQL");
    expect(preferred).not.toContain("Python");
  });

  it("recognizes a 'bonus points for X' marker", () => {
    expect(app.splitJdSections("Know Docker. Bonus points for Kubernetes.").preferred).toContain("Kubernetes");
  });

  it("pulls a skill named before an 'X is a plus' marker into preferred, not required", () => {
    const { required, preferred } = app.splitJdSections("Know Docker. AWS experience is a plus.");
    expect(preferred).toContain("AWS");
    expect(required).not.toContain("AWS");
  });

  it("also handles 'X are a plus' phrasing", () => {
    const { required, preferred } = app.splitJdSections("Know Docker. Strong writing skills are a plus.");
    expect(preferred).toMatch(/writing skills/i);
    expect(required).not.toMatch(/writing skills/i);
  });

  it("does not drag later required content into preferred just because an earlier sentence used 'is a plus'", () => {
    const { required, preferred } = app.splitJdSections(
      "Requirements: Python, SQL. AWS experience is a plus. Must also know Java and C++."
    );
    expect(required).toContain("Python");
    expect(required).toContain("Java");
    expect(required).toContain("C++");
    expect(required).not.toContain("AWS");
    expect(preferred).toContain("AWS");
    expect(preferred).not.toContain("Java");
  });

  it("treats everything as required when no marker phrase is present", () => {
    const { required, preferred } = app.splitJdSections("Must know Python and SQL.");
    expect(required).toBe("Must know Python and SQL.");
    expect(preferred).toBe("");
  });
});

describe("extractUnknownTerms", () => {
  it("surfaces tech-shaped terms that aren't in the curated skills dictionary", () => {
    const { matched, missing } = app.extractUnknownTerms(
      "- Experience with AcmeCloud required\n- Familiarity with ZenTrack required\n",
      "I have used AcmeCloud extensively."
    );
    expect(matched).toContain("AcmeCloud");
    expect(missing).toContain("ZenTrack");
  });

  it("does not re-surface a word that's part of a known multi-word alias", () => {
    // "REST APIs" is a known alias; the standalone "REST" acronym shape
    // inside it must not be reported again as its own unknown term.
    const { matched, missing } = app.extractUnknownTerms(
      "- Experience with REST APIs required\n- Experience with GraphQL required\n",
      ""
    );
    expect(matched.concat(missing)).not.toContain("REST");
  });

  it("filters out common non-skill acronyms via the stopword list", () => {
    const { matched, missing } = app.extractUnknownTerms(
      "- Must be eligible to work in the US\n- Offers PTO and EEO compliance\n",
      ""
    );
    expect(matched.concat(missing)).not.toContain("US");
    expect(matched.concat(missing)).not.toContain("PTO");
    expect(matched.concat(missing)).not.toContain("EEO");
  });

  it("caps results at 8 terms", () => {
    const acronyms = ["ZQA", "ZQB", "ZQC", "ZQD", "ZQE", "ZQF", "ZQG", "ZQH", "ZQI", "ZQJ", "ZQK", "ZQL"];
    const jd = acronyms.map((a) => `Requires ${a} experience.`).join(" ");
    const { matched, missing } = app.extractUnknownTerms(jd, "");
    expect(matched.length + missing.length).toBe(8);
  });

  it("prefers scanning bullet lines over full prose when 2+ bullets exist", () => {
    const jd = [
      "About us: we are a fast-growing PandaCorp company that loves ExampleWidget culture.",
      "- Requires ErpSystem experience",
      "- Requires ZenPipeline experience",
    ].join("\n");
    const { matched, missing } = app.extractUnknownTerms(jd, "");
    const all = matched.concat(missing);
    expect(all).toContain("ErpSystem");
    expect(all).not.toContain("PandaCorp");
  });
});
