import { StrKey, nativeToScVal, xdr } from "@stellar/stellar-sdk";
import { describe, expect, it } from "vitest";

import { failingContract, type DiagnosticEventLike } from "./error-origin";

const TOKEN = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";
const TREASURY = "CCHMX7JMZ7XVKURSR55FSM5MT5SOZOPNTFYQ6SSL5YIIRXKNN5FA5QDP";

const symbol = (text: string) => nativeToScVal(text, { type: "symbol" });
const contractError = (code: number) => xdr.ScVal.scvError(xdr.ScError.sceContract(code));

function event(contract: string | null, ...topics: xdr.ScVal[]): DiagnosticEventLike {
  return {
    event: {
      contractId: contract ? { toBytes: () => StrKey.decodeContract(contract) } : null,
      body: { v0: { topics } },
    },
  };
}

/** The events the network returned for a deposit that failed in the token, in the order it sent them. */
const DEPOSIT_WITHOUT_BALANCE = [
  event(null, symbol("fn_call"), symbol("deposit")),
  event(TREASURY, symbol("fn_call"), symbol("transfer")),
  event(TOKEN, symbol("error"), contractError(10)),
  event(TREASURY, symbol("error"), contractError(10)),
  event(TREASURY, symbol("error"), contractError(10)),
  event(TREASURY, symbol("log")),
];

describe("failingContract", () => {
  it("names the contract that raised the error first, not the ones that passed it up", () => {
    expect(failingContract(DEPOSIT_WITHOUT_BALANCE)).toBe(TOKEN);
  });

  it("names the treasury when the treasury itself rejected the call", () => {
    const events = [
      event(null, symbol("fn_call"), symbol("propose_expense")),
      event(TREASURY, symbol("error"), contractError(12)),
      event(TREASURY, symbol("error"), contractError(12)),
    ];

    expect(failingContract(events)).toBe(TREASURY);
  });

  it("ignores events that are not errors, even when they come first", () => {
    expect(failingContract([event(TOKEN, symbol("log")), event(TREASURY, symbol("error"), contractError(5))])).toBe(
      TREASURY,
    );
  });

  it("says nothing when there are no events or none is an error", () => {
    expect(failingContract(undefined)).toBeUndefined();
    expect(failingContract([])).toBeUndefined();
    expect(failingContract([event(TREASURY, symbol("log"))])).toBeUndefined();
  });

  it("says nothing when the error event has no contract", () => {
    expect(failingContract([event(null, symbol("error"), contractError(1))])).toBeUndefined();
  });

  it("never throws on events it cannot read", () => {
    const broken = { event: { contractId: null, body: { v0: { topics: [{}] } } } } as unknown as DiagnosticEventLike;
    expect(failingContract([broken])).toBeUndefined();
    expect(failingContract([{} as DiagnosticEventLike])).toBeUndefined();
  });
});