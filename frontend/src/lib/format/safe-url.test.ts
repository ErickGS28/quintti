import { describe, expect, it } from "vitest";

import { safeHttpUrl } from "./safe-url";

describe("safeHttpUrl", () => {
  it("returns http and https addresses", () => {
    expect(safeHttpUrl("https://example.org/facturas/0042.pdf")).toBe("https://example.org/facturas/0042.pdf");
    expect(safeHttpUrl("  http://example.org/a  ")).toBe("http://example.org/a");
  });

  it("returns null for nothing, for text that is not an address and for other protocols", () => {
    for (const text of [
      "",
      "   ",
      "not a link",
      "example.org/a.pdf",
      "javascript:alert(1)",
      "JaVaScRiPt:alert(1)",
      "data:text/html,<script>alert(1)</script>",
      "file:///c:/a.pdf",
      "ftp://example.org/a.pdf",
      "vbscript:msgbox(1)",
    ]) {
      expect(safeHttpUrl(text), text).toBeNull();
    }
  });
});