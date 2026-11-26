import { describe, expect, it } from "vitest";

import { assertTrusted } from "./assert-trusted";

describe("assertTrusted", () => {
  it("lets a trusted building through", () => {
    expect(() => assertTrusted({ trusted: true })).not.toThrow();
  });

  it("stops a building that was only opened from a link, with an error the screens can describe", () => {
    try {
      assertTrusted({ trusted: false });
    } catch (error) {
      expect(error).toMatchObject({ name: "AppError", kind: "untrusted-building" });
      return;
    }
    throw new Error("expected assertTrusted to throw");
  });
});