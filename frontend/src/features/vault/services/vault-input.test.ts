import { describe, expect, it } from "vitest";

import { CODE_MAX_BYTES, validateCode } from "./vault-input";

describe("validateCode", () => {
  it("returns the code without the spaces around it, and keeps its case", () => {
    expect(validateCode("Ship It")).toBe("Ship It");
    expect(validateCode("  Ship It \n")).toBe("Ship It");
    expect(validateCode("ship it")).toBe("ship it");
  });

  it("keeps the spaces inside the code", () => {
    expect(validateCode("ship  it")).toBe("ship  it");
  });

  it("rejects an empty code", () => {
    for (const text of ["", "   ", "\n\t"]) {
      expect(() => validateCode(text)).toThrowError(expect.objectContaining({ kind: "invalid-input", field: "code" }));
    }
  });

  it("accepts the longest code and rejects one byte more", () => {
    expect(validateCode("a".repeat(CODE_MAX_BYTES))).toHaveLength(CODE_MAX_BYTES);
    expect(() => validateCode("a".repeat(CODE_MAX_BYTES + 1))).toThrowError(
      expect.objectContaining({ kind: "invalid-input", field: "code" }),
    );
  });

  it("counts bytes, not letters: an accented letter takes two", () => {
    expect(() => validateCode("é".repeat(CODE_MAX_BYTES / 2 + 1))).toThrowError(
      expect.objectContaining({ kind: "invalid-input" }),
    );
  });
});
