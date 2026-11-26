/**
 * An address that is safe to open from a link, or null.
 *
 * Text that comes from the chain is not trusted: the contract only limits its length, so anyone able
 * to write it could store `javascript:` or `data:` there. Only http and https are ever turned into a link.
 */
export function safeHttpUrl(text: string): string | null {
  const value = text.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}