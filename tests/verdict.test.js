import { describe, it, expect, beforeAll } from "vitest";
import { loadApp } from "./helpers/loadApp.js";

let app;
beforeAll(() => {
  app = loadApp();
});

function fakeAnalysis(overrides) {
  return {
    score: null,
    requiredTotal: 0,
    requiredMatched: 0,
    preferredTotal: 0,
    preferredMatched: 0,
    lowSignal: false,
    ...overrides,
  };
}

describe("getVerdict", () => {
  it("returns 'Not enough information' when score is null", () => {
    const verdict = app.getVerdict(fakeAnalysis({ score: null }));
    expect(verdict.tone).toBe("neutral");
    expect(verdict.label).toBe("Not enough information");
  });

  it("is 'good' at exactly the 75 boundary", () => {
    expect(app.getVerdict(fakeAnalysis({ score: 75 })).tone).toBe("good");
  });

  it("is 'warn' just below the good boundary (74)", () => {
    expect(app.getVerdict(fakeAnalysis({ score: 74 })).tone).toBe("warn");
  });

  it("is 'warn' at exactly the 50 boundary", () => {
    expect(app.getVerdict(fakeAnalysis({ score: 50 })).tone).toBe("warn");
  });

  it("is 'bad' just below the warn boundary (49)", () => {
    expect(app.getVerdict(fakeAnalysis({ score: 49 })).tone).toBe("bad");
  });

  it("is 'bad' at score 0", () => {
    expect(app.getVerdict(fakeAnalysis({ score: 0 })).tone).toBe("bad");
  });

  it("includes a required/preferred breakdown string", () => {
    const verdict = app.getVerdict(
      fakeAnalysis({ score: 80, requiredTotal: 3, requiredMatched: 2, preferredTotal: 1, preferredMatched: 1 })
    );
    expect(verdict.breakdown).toContain("2/3 required skills matched");
    expect(verdict.breakdown).toContain("1/1 preferred skills matched");
  });

  it("appends the low-signal caveat to the breakdown when lowSignal is true", () => {
    const verdict = app.getVerdict(
      fakeAnalysis({ score: 100, requiredTotal: 1, requiredMatched: 1, lowSignal: true })
    );
    expect(verdict.breakdown).toMatch(/rough signal/i);
  });
});
