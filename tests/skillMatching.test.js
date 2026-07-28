import { describe, it, expect, beforeAll } from "vitest";
import { loadApp } from "./helpers/loadApp.js";

let app;
beforeAll(() => {
  app = loadApp();
});

describe("buildSkillRegex / findDbSkillsInText", () => {
  it("does not match 'Java' inside 'JavaScript' (word-boundary regression)", () => {
    const found = app.findDbSkillsInText("I know JavaScript well").map((s) => s.name);
    expect(found).toContain("JavaScript");
    expect(found).not.toContain("Java");
  });

  it("matches 'Java' as a standalone word", () => {
    const found = app.findDbSkillsInText("5 years of Java experience").map((s) => s.name);
    expect(found).toContain("Java");
  });

  it("handles regex-special characters in aliases (C++, C#)", () => {
    const found = app.findDbSkillsInText("Experience with C++ and C#").map((s) => s.name);
    expect(found).toContain("C++");
    expect(found).toContain("C#");
  });

  it("is case-insensitive", () => {
    const found = app.findDbSkillsInText("Strong PYTHON background").map((s) => s.name);
    expect(found).toContain("Python");
  });

  it("counts a skill once even when multiple aliases for it appear", () => {
    const found = app.findDbSkillsInText("We use JS and JavaScript here").filter((s) => s.name === "JavaScript");
    expect(found).toHaveLength(1);
  });

  it("returns an empty array for empty/falsy input", () => {
    expect(app.findDbSkillsInText("")).toEqual([]);
    expect(app.findDbSkillsInText(null)).toEqual([]);
  });
});

describe("escapeRegex", () => {
  it("escapes regex metacharacters so they're matched literally", () => {
    const re = new RegExp(app.escapeRegex("C++"));
    expect(re.test("I love C++")).toBe(true);
    expect(re.test("I love C plus plus")).toBe(false);
  });
});
