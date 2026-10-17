import { describe, expect, it } from "vitest";
import { backTarget } from "./nav.ts";

describe("backTarget", () => {
  it("returns a course path that is not the current page", () => {
    expect(backTarget("/lessons/0-3/", "/glossary/")).toBe("/lessons/0-3/");
    expect(backTarget("/#stage-2", "/glossary/")).toBe("/#stage-2");
  });
  it("returns nothing for no history, the same page, or anything that is not a course path", () => {
    expect(backTarget(null, "/glossary/")).toBeNull();
    expect(backTarget("/glossary/", "/glossary/")).toBeNull();
    expect(backTarget("https://evil.example/", "/glossary/")).toBeNull();
    expect(backTarget("//evil.example/", "/glossary/")).toBeNull();
    expect(backTarget("/login/", "/glossary/")).toBeNull();
    expect(backTarget("/auth/logout", "/glossary/")).toBeNull();
  });
});
