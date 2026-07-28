import { describe, it, expect, beforeAll } from "vitest";
import { loadApp } from "./helpers/loadApp.js";

let app;
beforeAll(() => {
  app = loadApp();
});

function missingSkill(name, category) {
  return { skill: { name, category }, weight: 3, tier: "required" };
}

describe("findResumeHeadings", () => {
  it("finds standard section headings by exact match", () => {
    const lines = ["John Doe", "SKILLS", "Python, SQL", "EXPERIENCE", "Did things."];
    const headings = app.findResumeHeadings(lines).map((h) => h.id);
    expect(headings).toEqual(["skills", "experience"]);
  });

  it("requires an exact heading match, not just a heading word appearing in the line", () => {
    const lines = ["Skills Summary For This Role", "Python, SQL"];
    expect(app.findResumeHeadings(lines)).toEqual([]);
  });

  it("is case-insensitive and tolerates a trailing colon", () => {
    const lines = ["skills:", "Python"];
    expect(app.findResumeHeadings(lines).map((h) => h.id)).toEqual(["skills"]);
  });
});

describe("buildTailoredResumeText", () => {
  it("returns the original resume unchanged (trimmed) when nothing is missing", () => {
    const resumeText = "  John Doe\nSKILLS\nPython\n  ";
    const result = app.buildTailoredResumeText({
      resumeText,
      analysis: { missing: [], otherTerms: { missing: [] } },
    });
    expect(result).toBe(resumeText.trim());
  });

  it("appends missing skills at the end of an existing Skills section, before the next heading", () => {
    const resumeText = ["John Doe", "SKILLS", "Python", "", "EXPERIENCE", "Did things."].join("\n");
    const analysis = { missing: [missingSkill("Docker", "Cloud & DevOps")], otherTerms: { missing: [] } };
    const result = app.buildTailoredResumeText({ resumeText, analysis });
    const lines = result.split("\n");

    const experienceIndex = lines.indexOf("EXPERIENCE");
    const additionIndex = lines.indexOf("Cloud & DevOps: Docker");
    expect(additionIndex).toBeGreaterThan(-1);
    expect(additionIndex).toBeLessThan(experienceIndex);
    expect(lines.indexOf("Python")).toBeLessThan(additionIndex);
  });

  it("inserts a new SKILLS block before the first structural heading when there's no existing Skills section", () => {
    const resumeText = ["John Doe", "EXPERIENCE", "Did things.", "EDUCATION", "A school."].join("\n");
    const analysis = { missing: [missingSkill("Docker", "Cloud & DevOps")], otherTerms: { missing: [] } };
    const result = app.buildTailoredResumeText({ resumeText, analysis });
    const lines = result.split("\n");

    const skillsIndex = lines.indexOf("SKILLS");
    const experienceIndex = lines.indexOf("EXPERIENCE");
    expect(skillsIndex).toBeGreaterThan(-1);
    expect(skillsIndex).toBeLessThan(experienceIndex);
  });

  it("appends a SKILLS block at the very end when no section headings can be found at all", () => {
    const resumeText = "Just a paragraph of resume text with no clear headings anywhere in it.";
    const analysis = { missing: [missingSkill("Docker", "Cloud & DevOps")], otherTerms: { missing: [] } };
    const result = app.buildTailoredResumeText({ resumeText, analysis });
    const lines = result.split("\n");

    expect(lines[0]).toBe(resumeText);
    expect(lines).toContain("SKILLS");
    expect(lines.indexOf("SKILLS")).toBeGreaterThan(0);
  });

  it("includes unknown/other terms as an 'Other' line in addition to missing skills", () => {
    const resumeText = "Just a paragraph of resume text with no clear headings anywhere in it.";
    const analysis = { missing: [], otherTerms: { missing: ["Terraform-adjacent-tool"] } };
    const result = app.buildTailoredResumeText({ resumeText, analysis });
    expect(result).toContain("Other: Terraform-adjacent-tool");
  });

  it("groups multiple missing skills from the same category onto one line", () => {
    const resumeText = "SKILLS\nPython\nEXPERIENCE\nDid things.";
    const analysis = {
      missing: [missingSkill("Docker", "Cloud & DevOps"), missingSkill("AWS", "Cloud & DevOps")],
      otherTerms: { missing: [] },
    };
    const result = app.buildTailoredResumeText({ resumeText, analysis });
    expect(result).toContain("Cloud & DevOps: Docker, AWS");
  });
});
