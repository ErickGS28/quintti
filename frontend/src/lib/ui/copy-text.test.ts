import { describe, expect, it, vi } from "vitest";

import { copyText } from "./copy-text";

describe("copyText", () => {
  it("writes the text and says it worked", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    await expect(copyText("hola", { writeText })).resolves.toBe(true);

    expect(writeText).toHaveBeenCalledWith("hola");
  });

  it("says it did not work when the clipboard refuses", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));

    await expect(copyText("hola", { writeText })).resolves.toBe(false);
  });

  it("says it did not work when there is no clipboard", async () => {
    await expect(copyText("hola", undefined)).resolves.toBe(false);
  });
});