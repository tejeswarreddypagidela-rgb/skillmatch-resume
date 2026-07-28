import { describe, it, expect, beforeAll } from "vitest";
import { loadApp } from "./helpers/loadApp.js";

let app;
beforeAll(() => {
  app = loadApp();
});

describe("keywordOverlap / extractSignificantWords", () => {
  it("ignores stopwords when computing overlap", () => {
    // Only "python" and "backend" are significant (5+ letter, non-stopword)
    // words shared between the two texts.
    const jd = "We need someone who can work with python in a backend role.";
    const resume = "I have worked with python building backend services.";
    const overlap = app.keywordOverlap(jd, resume);
    expect(overlap.matched).toBeGreaterThan(0);
    expect(overlap.pct).toBeGreaterThan(0);
  });

  it("returns pct: null for an empty JD instead of dividing by zero", () => {
    expect(app.keywordOverlap("", "some resume text here")).toEqual({ pct: null, matched: 0, total: 0 });
  });

  it("filters out short words and stopwords via extractSignificantWords", () => {
    const words = app.extractSignificantWords("The team will work with your data and other things");
    expect(words).not.toContain("team"); // stopword
    expect(words).not.toContain("will"); // stopword
    expect(words).not.toContain("data"); // 4 letters, below the 5+ threshold
    expect(words).not.toContain("other"); // stopword, despite being 5+ letters
    expect(words).toContain("things"); // 6 letters, not a stopword
  });
});

describe("buildTailoringChecks", () => {
  it("passes titleMirrored when the resume literally contains the job title", () => {
    const checks = app.buildTailoringChecks({
      jobRole: "Software Engineer",
      jobDescription: "",
      resumeText: "Software Engineer with 5 years of experience.",
      fitScore: null,
    });
    expect(checks.find((c) => c.id === "titleMirrored").pass).toBe(true);
  });

  it("fails titleMirrored when the resume never mentions the job title", () => {
    const checks = app.buildTailoringChecks({
      jobRole: "Data Scientist",
      jobDescription: "",
      resumeText: "Backend Developer with 5 years of experience.",
      fitScore: null,
    });
    expect(checks.find((c) => c.id === "titleMirrored").pass).toBe(false);
  });

  it("passes titleMirrored (vacuously) when no job role was entered", () => {
    const checks = app.buildTailoringChecks({ jobRole: "", jobDescription: "", resumeText: "anything", fitScore: null });
    expect(checks.find((c) => c.id === "titleMirrored").pass).toBe(true);
  });

  it("fails requiredSkillsCoverage below the 60% fit-score threshold", () => {
    const checks = app.buildTailoringChecks({ jobRole: "", jobDescription: "", resumeText: "", fitScore: 59 });
    expect(checks.find((c) => c.id === "requiredSkillsCoverage").pass).toBe(false);
  });

  it("passes requiredSkillsCoverage at exactly the 60% threshold", () => {
    const checks = app.buildTailoringChecks({ jobRole: "", jobDescription: "", resumeText: "", fitScore: 60 });
    expect(checks.find((c) => c.id === "requiredSkillsCoverage").pass).toBe(true);
  });
});
