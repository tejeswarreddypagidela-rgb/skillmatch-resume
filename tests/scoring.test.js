import { describe, it, expect, beforeAll } from "vitest";
import { loadApp } from "./helpers/loadApp.js";

let app;
beforeAll(() => {
  app = loadApp();
});

describe("analyzeSkills", () => {
  it("weights required skills higher than preferred skills", () => {
    // 1 required matched (weight 3), 1 required missing (weight 3),
    // 1 preferred matched (weight 1) -> matched=4, total=7 -> round(4/7*100)=57
    const jd = "Must know Python and SQL. Nice to have: Docker.";
    const resume = "I know Python and Docker.";
    const result = app.analyzeSkills(jd, resume);
    expect(result.requiredTotal).toBe(2);
    expect(result.requiredMatched).toBe(1);
    expect(result.preferredTotal).toBe(1);
    expect(result.preferredMatched).toBe(1);
    expect(result.score).toBe(57);
  });

  it("returns score: null (not 0) when no dictionary skills are detected in the JD", () => {
    const result = app.analyzeSkills("We are a fun team looking for a great fit.", "Some resume text.");
    expect(result.score).toBeNull();
  });

  it("scores 100 when every required and preferred skill is matched", () => {
    const jd = "Must know Python. Nice to have: Docker.";
    const resume = "I know Python and Docker.";
    expect(app.analyzeSkills(jd, resume).score).toBe(100);
  });

  it("flags lowSignal when fewer than 4 total skills are detected", () => {
    const result = app.analyzeSkills("Must know Python and SQL.", "I know Python.");
    expect(result.allJdSkills.length).toBeLessThan(4);
    expect(result.lowSignal).toBe(true);
  });

  it("does not flag lowSignal at or above the 4-skill threshold", () => {
    const jd = "Must know Python, SQL, React, and Docker.";
    const result = app.analyzeSkills(jd, "I know Python, SQL, React, and Docker.");
    expect(result.allJdSkills.length).toBeGreaterThanOrEqual(4);
    expect(result.lowSignal).toBe(false);
  });

  it("does not double count a skill that appears in both required and preferred text", () => {
    // Same skill mentioned before and after the "nice to have" marker should
    // keep its required weight/tier, not be duplicated as a second entry.
    const jd = "Must know Python. Nice to have: more Python experience.";
    const result = app.analyzeSkills(jd, "I know Python.");
    const pythonEntries = result.allJdSkills.filter((e) => e.skill.name === "Python");
    expect(pythonEntries).toHaveLength(1);
    expect(pythonEntries[0].tier).toBe("required");
  });
});

describe("hard/soft skill breakdown", () => {
  it("separates Soft Skills category from everything else", () => {
    const jd = "Must know Python. Strong communication and leadership required.";
    const resume = "I know Python and have shown strong leadership and communication skills.";
    const { hardSoft } = app.analyzeSkills(jd, resume);
    expect(hardSoft.hard.matched.map((e) => e.skill.name)).toContain("Python");
    expect(hardSoft.soft.matched.map((e) => e.skill.name)).toEqual(
      expect.arrayContaining(["Communication", "Leadership"])
    );
    expect(hardSoft.hard.matched.map((e) => e.skill.name)).not.toContain("Communication");
  });

  it("reports pct: null for a group with zero total instead of dividing by zero", () => {
    const summary = app.summarizeSkillGroup([], []);
    expect(summary.total).toBe(0);
    expect(summary.pct).toBeNull();
  });
});
