import { describe, expect, it } from "vitest";

import { identiconFor } from "./identicon";

const A = "GBWMA42DA6PJ6V4PQITB4APQGO5BGBMVV4ZQD245DKAEDVKFQZBD6LAK";
const B = "GAU7DETV5SYD7GVALKSAJZQIQL6CEBUFRRQJO7ZTTYI7UGP4LWJRUYZ2";

describe("identicon", () => {
  it("is the same for the same address", () => {
    expect(identiconFor(A)).toEqual(identiconFor(A));
  });

  it("tells different addresses apart", () => {
    expect(identiconFor(A)).not.toEqual(identiconFor(B));
  });

  it("stays within valid hues and angles", () => {
    for (const address of [A, B, "", "x"]) {
      const { from, to, angle } = identiconFor(address);
      for (const value of [from, to, angle]) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(360);
      }
    }
  });
});
