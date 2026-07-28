import { describe, it, expect, beforeAll } from "vitest";
import { loadApp } from "./helpers/loadApp.js";

let app;
beforeAll(() => {
  app = loadApp();
});

function findCheck(checks, id) {
  return checks.find((c) => c.id === id);
}

describe("buildContentChecks", () => {
  it("detects quantified achievements (%, $, x, counts)", () => {
    const checks = app.buildContentChecks("Reduced load time by 30% for 10000 users.", 300);
    expect(findCheck(checks, "quantified").pass).toBe(true);
  });

  it("fails the quantified check when there are no numbers at all", () => {
    const checks = app.buildContentChecks("Helped improve the checkout experience for customers.", 300);
    expect(findCheck(checks, "quantified").pass).toBe(false);
  });

  it("flags weak passive phrases like 'responsible for'", () => {
    const checks = app.buildContentChecks("Responsible for managing a team of 5.", 300);
    expect(findCheck(checks, "actionVerbs").pass).toBe(false);
  });

  it("passes action-verb check when no weak phrases are present", () => {
    const checks = app.buildContentChecks("Led a team of 5 and shipped 3 major features.", 300);
    expect(findCheck(checks, "actionVerbs").pass).toBe(true);
  });

  it("flags content as too short right below the minimum word count", () => {
    const checks = app.buildContentChecks("word ".repeat(249), 249);
    expect(findCheck(checks, "length").pass).toBe(false);
  });

  it("passes the length check right at the minimum word count", () => {
    const checks = app.buildContentChecks("word ".repeat(250), 250);
    expect(findCheck(checks, "length").pass).toBe(true);
  });

  it("flags content as too long above the maximum word count", () => {
    const checks = app.buildContentChecks("word ".repeat(1201), 1201);
    expect(findCheck(checks, "length").pass).toBe(false);
  });
});

describe("buildSectionChecks", () => {
  it("detects standard section headers", () => {
    const checks = app.buildSectionChecks("EXPERIENCE\nDid stuff.\nEDUCATION\nA school.\nSKILLS\nPython");
    expect(checks.every((c) => c.pass)).toBe(true);
  });

  it("fails when a section header is missing entirely", () => {
    const checks = app.buildSectionChecks("Just a wall of text with no headers of any kind.");
    expect(checks.every((c) => !c.pass)).toBe(true);
  });
});

describe("buildAtsEssentialChecks", () => {
  it("detects a plain-text email and phone number", () => {
    const checks = app.buildAtsEssentialChecks({
      resumeText: "Contact: jane.doe@example.com or (555) 123-4567. " + "word ".repeat(150),
      fileExt: "pdf",
      usedOcr: false,
      wordCount: 156,
    });
    expect(findCheck(checks, "email").pass).toBe(true);
    expect(findCheck(checks, "phone").pass).toBe(true);
  });

  it("fails email/phone checks when neither is present", () => {
    const checks = app.buildAtsEssentialChecks({
      resumeText: "word ".repeat(150),
      fileExt: "pdf",
      usedOcr: false,
      wordCount: 150,
    });
    expect(findCheck(checks, "email").pass).toBe(false);
    expect(findCheck(checks, "phone").pass).toBe(false);
  });

  it("fails the format check when OCR was needed to extract the text", () => {
    const checks = app.buildAtsEssentialChecks({ resumeText: "some text", fileExt: "pdf", usedOcr: true, wordCount: 200 });
    expect(findCheck(checks, "format").pass).toBe(false);
  });

  it("fails the extractable-content check below the minimum word threshold", () => {
    const checks = app.buildAtsEssentialChecks({ resumeText: "short", fileExt: "pdf", usedOcr: false, wordCount: 149 });
    expect(findCheck(checks, "extractable").pass).toBe(false);
  });
});

describe("buildHrRedFlagChecks", () => {
  it("flags an unprofessional-looking email local part", () => {
    const checks = app.buildHrRedFlagChecks("Reach me at partyhard420@example.com");
    expect(findCheck(checks, "professionalEmail").pass).toBe(false);
  });

  it("passes a normal name-based email", () => {
    const checks = app.buildHrRedFlagChecks("Reach me at jane.doe@example.com");
    expect(findCheck(checks, "professionalEmail").pass).toBe(true);
  });

  it("flags excessive first-person language (more than 3 instances)", () => {
    const checks = app.buildHrRedFlagChecks("I led the team. I built the tool. I shipped it. I also tested it myself.");
    expect(findCheck(checks, "firstPerson").pass).toBe(false);
  });

  it("allows a small number of first-person pronouns (3 or fewer)", () => {
    const checks = app.buildHrRedFlagChecks("Led a team. I also mentored two juniors and my mentee was promoted.");
    expect(findCheck(checks, "firstPerson").pass).toBe(true);
  });

  it("flags leftover template placeholders", () => {
    const checks = app.buildHrRedFlagChecks("Name: [Your Name]\nExperience at [Company Name]");
    expect(findCheck(checks, "placeholders").pass).toBe(false);
  });
});

describe("buildDiscriminationChecks", () => {
  it("flags a date of birth mention", () => {
    expect(findCheck(app.buildDiscriminationChecks("Date of Birth: 01/01/1990"), "age").pass).toBe(false);
  });

  it("flags a marital status mention", () => {
    expect(findCheck(app.buildDiscriminationChecks("Marital Status: Married"), "marital").pass).toBe(false);
  });

  it("flags what looks like a Social Security Number", () => {
    expect(findCheck(app.buildDiscriminationChecks("SSN: 123-45-6789"), "ssn").pass).toBe(false);
  });

  it("passes all three checks on a clean resume", () => {
    const checks = app.buildDiscriminationChecks("Software engineer with 5 years of experience.");
    expect(checks.every((c) => c.pass)).toBe(true);
  });
});

describe("extractMaxYears", () => {
  it("picks the maximum when multiple 'X years experience' mentions are present", () => {
    expect(
      app.extractMaxYears("3+ years experience preferred, 5 years experience ideal, 2 years experience minimum")
    ).toBe(5);
  });

  it("returns null when no years-of-experience phrase is present", () => {
    expect(app.extractMaxYears("A great place to work.")).toBeNull();
  });
});

describe("buildSeniorityChecks", () => {
  it("passes a senior JD when the resume states 5+ years even without a senior title", () => {
    const checks = app.buildSeniorityChecks({
      jobDescription: "Senior Software Engineer",
      resumeText: "Software Engineer with 7 years of experience.",
    });
    expect(findCheck(checks, "titleLevel").pass).toBe(true);
  });

  it("fails a senior JD when the resume has neither a senior title nor 5+ years", () => {
    const checks = app.buildSeniorityChecks({
      jobDescription: "Senior Software Engineer",
      resumeText: "Software Engineer with 2 years of experience.",
    });
    expect(findCheck(checks, "titleLevel").pass).toBe(false);
  });

  it("passes the years check when resume years meet or exceed the JD requirement", () => {
    const checks = app.buildSeniorityChecks({
      jobDescription: "Requires 3+ years experience",
      resumeText: "5 years of experience building web apps.",
    });
    expect(findCheck(checks, "yearsRequired").pass).toBe(true);
  });

  it("fails the years check when resume years fall short of the JD requirement", () => {
    const checks = app.buildSeniorityChecks({
      jobDescription: "Requires 5+ years experience",
      resumeText: "2 years of experience building web apps.",
    });
    expect(findCheck(checks, "yearsRequired").pass).toBe(false);
  });
});

describe("analyzeAts", () => {
  it("averages per-category scores into an overallScore", () => {
    const result = app.analyzeAts({
      resumeText:
        "EXPERIENCE\nLed a team of 5, reduced costs by 20% for 500 clients.\n" +
        "EDUCATION\nState University.\nSKILLS\nPython, SQL\n" +
        "Contact: jane.doe@example.com, (555) 123-4567. " +
        "word ".repeat(260),
      fileExt: "pdf",
      usedOcr: false,
      jobDescription: "Software Engineer, 3+ years experience",
      jobRole: "Software Engineer",
      fitScore: 80,
    });
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.overallScore).toBeLessThanOrEqual(100);
    expect(result.total).toBeGreaterThan(0);
  });
});
