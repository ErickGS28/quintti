import { describe, expect, it } from "vitest";

import { ConfigError } from "./env";
import { DEFAULT_INVOICE_BUCKET, parseServerConfig } from "./server-env";

describe("server configuration", () => {
  it("is off when nothing is set, so the app runs from the contract alone", () => {
    expect(parseServerConfig({})).toBeNull();
    expect(parseServerConfig({ supabaseUrl: "  ", supabaseKey: "" })).toBeNull();
  });

  it("reads the URL and the key, and defaults the bucket", () => {
    expect(parseServerConfig({ supabaseUrl: "https://abc.supabase.co/", supabaseKey: "sb_secret_x" })).toEqual({
      supabaseUrl: "https://abc.supabase.co",
      supabaseKey: "sb_secret_x",
      invoiceBucket: DEFAULT_INVOICE_BUCKET,
    });
  });

  it("fails when only one of the two is set", () => {
    expect(() => parseServerConfig({ supabaseUrl: "https://abc.supabase.co" })).toThrow(ConfigError);
    expect(() => parseServerConfig({ supabaseKey: "sb_secret_x" })).toThrow(ConfigError);
  });

  it("rejects a URL that is not http(s) and a bucket name storage would refuse", () => {
    expect(() => parseServerConfig({ supabaseUrl: "ftp://abc", supabaseKey: "k" })).toThrow(/http/);
    expect(() =>
      parseServerConfig({ supabaseUrl: "https://abc.supabase.co", supabaseKey: "k", invoiceBucket: "Facturas!" }),
    ).toThrow(/BUCKET/);
  });
});
