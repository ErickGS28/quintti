/**
 * Puts text on the clipboard. Returns whether it worked: the clipboard can be blocked (an insecure page, a
 * denied permission), and the caller should then tell the person to copy it by hand.
 */
export async function copyText(
  text: string,
  clipboard: Pick<Clipboard, "writeText"> | undefined = typeof navigator === "undefined" ? undefined : navigator.clipboard,
): Promise<boolean> {
  if (!clipboard) return false;
  try {
    await clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}