import { describe, expect, it } from "vitest";

import { ConfigError, parseConfig, type RawConfig } from "./env";

const CONTRACT_ID = "CAQ6YXC6L3G2YVBWW52IPDNVBRCDMUO3S463MQL5HD2KGNDCOT5NCHDA";

const validRaw: RawConfig = {
  network: "testnet",
  treasuryContractId: CONTRACT_ID,
  tokenSymbol: "XLM",
  tokenDecimals: "7",
};

function issuesOf(raw: RawConfig): string[] {
  try {
    parseConfig(raw);
  } catch (error) {
    if (error instanceof ConfigError) return error.issues;
    throw error;
  }
  return [];
}

describe("parseConfig", () => {
  it("builds the testnet configuration from valid values", () => {
    const config = parseConfig(validRaw);

    expect(config.network).toBe("testnet");
    expect(config.networkPassphrase).toBe("Test SDF Network ; September 2015");
    expect(config.rpcUrl).toBe("https://soroban-testnet.stellar.org");
    expect(config.treasuryContractId).toBe(CONTRACT_ID);
    expect(config.token).toEqual({ symbol: "XLM", decimals: 7 });
    expect(config.explorerBaseUrl).toBe("https://stellar.expert/explorer/testnet");
  });

  it("defaults to testnet and to 7 token decimals", () => {
    const config = parseConfig({ treasuryContractId: CONTRACT_ID, tokenSymbol: "USDC" });

    expect(config.network).toBe("testnet");
    expect(config.token.decimals).toBe(7);
  });

  it("uses a custom RPC URL when one is given", () => {
    const config = parseConfig({ ...validRaw, rpcUrl: "https://rpc.example.org" });

    expect(config.rpcUrl).toBe("https://rpc.example.org");
  });

  it("supports a local network with its own passphrase and RPC", () => {
    const config = parseConfig({ ...validRaw, network: "local" });

    expect(config.networkPassphrase).toBe("Standalone Network ; February 2017");
    expect(config.rpcUrl).toBe("http://localhost:8000/soroban/rpc");
  });

  it("rejects mainnet and unknown networks", () => {
    expect(issuesOf({ ...validRaw, network: "public" })[0]).toMatch(/mainnet is not supported/);
    expect(issuesOf({ ...validRaw, network: "mainnet" })[0]).toMatch(/must be "testnet" or "local"/);
  });

  it("requires a valid treasury contract address", () => {
    expect(issuesOf({ ...validRaw, treasuryContractId: undefined })).toContain(
      "NEXT_PUBLIC_TREASURY_CONTRACT_ID is required",
    );
    expect(issuesOf({ ...validRaw, treasuryContractId: "not-an-address" })).toContain(
      "NEXT_PUBLIC_TREASURY_CONTRACT_ID is not a valid contract address",
    );
    const accountAddress = "GBWMA42DA6PJ6V4PQITB4APQGO5BGBMVV4ZQD245DKAEDVKFQZBD6LAK";
    expect(issuesOf({ ...validRaw, treasuryContractId: accountAddress })).toHaveLength(1);
  });

  it("requires a token symbol", () => {
    expect(issuesOf({ ...validRaw, tokenSymbol: " " })).toContain(
      "NEXT_PUBLIC_TOKEN_SYMBOL is required",
    );
  });

  it("rejects token decimals that are not an integer from 0 to 18", () => {
    for (const decimals of ["-1", "19", "1.5", "seven"]) {
      expect(issuesOf({ ...validRaw, tokenDecimals: decimals })).toContain(
        "NEXT_PUBLIC_TOKEN_DECIMALS must be an integer from 0 to 18",
      );
    }
  });

  it("rejects an RPC URL that is not http or https", () => {
    expect(issuesOf({ ...validRaw, rpcUrl: "ftp://rpc.example.org" })).toContain(
      "NEXT_PUBLIC_SOROBAN_RPC_URL must be an http(s) URL",
    );
    expect(issuesOf({ ...validRaw, rpcUrl: "nonsense" })).toHaveLength(1);
  });

  it("reports every problem at once", () => {
    const issues = issuesOf({ network: "mainnet", tokenDecimals: "x" });

    expect(issues.length).toBeGreaterThanOrEqual(4);
  });
});
