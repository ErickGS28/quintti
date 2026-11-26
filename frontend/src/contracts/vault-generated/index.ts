import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CAFRW3R4IACGOX62V7WGXEYFXHUIVLNHGBXG7CGKDX42LSXNCR4M274H",
  }
} as const


/**
 * What the vault was opened with. None of it changes.
 */
export interface Config {
  /**
 * SHA-256 of the code in lowercase.
 */
code_hash: Buffer;
  /**
 * What each account receives, in the token's base units.
 */
payout: i128;
  /**
 * Token the vault holds and pays with.
 */
token: string;
}

/**
 * Errors returned by the vault contract.
 * 
 * Numeric values are part of the public interface (the web app maps them to
 * messages), so they must stay stable once deployed.
 */
export const Errors = {
  /**
   * The code does not match the one the vault was opened with.
   */
  1: {message:"WrongCode"},
  /**
   * This account already claimed its share.
   */
  2: {message:"AlreadyClaimed"},
  /**
   * The vault holds less than one share.
   */
  3: {message:"VaultEmpty"},
  /**
   * The payout is zero or negative (the deployment fails).
   */
  4: {message:"InvalidPayout"}
}


export interface Client {
  /**
   * Construct and simulate a claim transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Pays `payout` of the token to `claimer` when `code` is right. Each
   * account can claim once. Returns the amount paid.
   * 
   * State is written before the transfer, so the contract is consistent
   * whatever the token does.
   * 
   * Auth: `claimer`. Errors: `WrongCode`, `AlreadyClaimed`, `VaultEmpty`.
   */
  claim: ({claimer, code}: {claimer: string, code: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<i128>>>

  /**
   * Construct and simulate a get_claims transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * How many accounts have claimed.
   */
  get_claims: (options?: MethodOptions) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a get_config transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * The token, the hash of the code and the payout the vault was opened with.
   */
  get_config: (options?: MethodOptions) => Promise<AssembledTransaction<Config>>

  /**
   * Construct and simulate a get_balance transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * What the vault holds now, in the token's base units.
   */
  get_balance: (options?: MethodOptions) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a has_claimed transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Whether `account` already claimed its share.
   */
  has_claimed: ({account}: {account: string}, options?: MethodOptions) => Promise<AssembledTransaction<boolean>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
        /** Constructor/Initialization Args for the contract's `__constructor` method */
        {token, code_hash, payout}: {token: string, code_hash: Buffer, payout: i128},
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy({token, code_hash, payout}, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAAAAARhQYXlzIGBwYXlvdXRgIG9mIHRoZSB0b2tlbiB0byBgY2xhaW1lcmAgd2hlbiBgY29kZWAgaXMgcmlnaHQuIEVhY2gKYWNjb3VudCBjYW4gY2xhaW0gb25jZS4gUmV0dXJucyB0aGUgYW1vdW50IHBhaWQuCgpTdGF0ZSBpcyB3cml0dGVuIGJlZm9yZSB0aGUgdHJhbnNmZXIsIHNvIHRoZSBjb250cmFjdCBpcyBjb25zaXN0ZW50CndoYXRldmVyIHRoZSB0b2tlbiBkb2VzLgoKQXV0aDogYGNsYWltZXJgLiBFcnJvcnM6IGBXcm9uZ0NvZGVgLCBgQWxyZWFkeUNsYWltZWRgLCBgVmF1bHRFbXB0eWAuAAAABWNsYWltAAAAAAAAAgAAAAAAAAAHY2xhaW1lcgAAAAATAAAAAAAAAARjb2RlAAAAEAAAAAEAAAPpAAAACwAAAAM=",
        "AAAAAAAAAB9Ib3cgbWFueSBhY2NvdW50cyBoYXZlIGNsYWltZWQuAAAAAApnZXRfY2xhaW1zAAAAAAAAAAAAAQAAAAQ=",
        "AAAAAAAAAElUaGUgdG9rZW4sIHRoZSBoYXNoIG9mIHRoZSBjb2RlIGFuZCB0aGUgcGF5b3V0IHRoZSB2YXVsdCB3YXMgb3BlbmVkIHdpdGguAAAAAAAACmdldF9jb25maWcAAAAAAAAAAAABAAAH0AAAAAZDb25maWcAAA==",
        "AAAAAAAAADRXaGF0IHRoZSB2YXVsdCBob2xkcyBub3csIGluIHRoZSB0b2tlbidzIGJhc2UgdW5pdHMuAAAAC2dldF9iYWxhbmNlAAAAAAAAAAABAAAACw==",
        "AAAAAAAAACxXaGV0aGVyIGBhY2NvdW50YCBhbHJlYWR5IGNsYWltZWQgaXRzIHNoYXJlLgAAAAtoYXNfY2xhaW1lZAAAAAABAAAAAAAAAAdhY2NvdW50AAAAABMAAAABAAAAAQ==",
        "AAAAAAAAAWZGaXhlcyB0aGUgdmF1bHQncyBydWxlcyBhdCBkZXBsb3ltZW50LiBJdCBydW5zIG9uY2UsIGF0b21pY2FsbHkgd2l0aAp0aGUgZGVwbG95bWVudC4KCmBjb2RlX2hhc2hgIGlzIHRoZSBTSEEtMjU2IG9mIHRoZSBjb2RlIGluIGxvd2VyY2FzZS4gYHBheW91dGAgaXMgd2hhdAplYWNoIGFjY291bnQgcmVjZWl2ZXMsIGluIHRoZSB0b2tlbidzIGJhc2UgdW5pdHMgKHN0cm9vcHMgZm9yIFhMTSkuClRoZSB2YXVsdCBob2xkcyBub3RoaW5nIHVudGlsIHNvbWVvbmUgdHJhbnNmZXJzIHRoZSB0b2tlbiB0byBpdHMKYWRkcmVzcy4KCkF1dGg6IG5vbmUuIEVycm9yczogYEludmFsaWRQYXlvdXRgICh0aGUgZGVwbG95bWVudCBmYWlscykuAAAAAAANX19jb25zdHJ1Y3RvcgAAAAAAAAMAAAAAAAAABXRva2VuAAAAAAAAEwAAAAAAAAAJY29kZV9oYXNoAAAAAAAD7gAAACAAAAAAAAAABnBheW91dAAAAAAACwAAAAEAAAPpAAAAAgAAAAM=",
        "AAAAAQAAADNXaGF0IHRoZSB2YXVsdCB3YXMgb3BlbmVkIHdpdGguIE5vbmUgb2YgaXQgY2hhbmdlcy4AAAAAAAAAAAZDb25maWcAAAAAAAMAAAAhU0hBLTI1NiBvZiB0aGUgY29kZSBpbiBsb3dlcmNhc2UuAAAAAAAACWNvZGVfaGFzaAAAAAAAA+4AAAAgAAAANldoYXQgZWFjaCBhY2NvdW50IHJlY2VpdmVzLCBpbiB0aGUgdG9rZW4ncyBiYXNlIHVuaXRzLgAAAAAABnBheW91dAAAAAAACwAAACRUb2tlbiB0aGUgdmF1bHQgaG9sZHMgYW5kIHBheXMgd2l0aC4AAAAFdG9rZW4AAAAAAAAT",
        "AAAABAAAAKRFcnJvcnMgcmV0dXJuZWQgYnkgdGhlIHZhdWx0IGNvbnRyYWN0LgoKTnVtZXJpYyB2YWx1ZXMgYXJlIHBhcnQgb2YgdGhlIHB1YmxpYyBpbnRlcmZhY2UgKHRoZSB3ZWIgYXBwIG1hcHMgdGhlbSB0bwptZXNzYWdlcyksIHNvIHRoZXkgbXVzdCBzdGF5IHN0YWJsZSBvbmNlIGRlcGxveWVkLgAAAAAAAAAFRXJyb3IAAAAAAAAEAAAAOlRoZSBjb2RlIGRvZXMgbm90IG1hdGNoIHRoZSBvbmUgdGhlIHZhdWx0IHdhcyBvcGVuZWQgd2l0aC4AAAAAAAlXcm9uZ0NvZGUAAAAAAAABAAAAJ1RoaXMgYWNjb3VudCBhbHJlYWR5IGNsYWltZWQgaXRzIHNoYXJlLgAAAAAOQWxyZWFkeUNsYWltZWQAAAAAAAIAAAAkVGhlIHZhdWx0IGhvbGRzIGxlc3MgdGhhbiBvbmUgc2hhcmUuAAAAClZhdWx0RW1wdHkAAAAAAAMAAAA2VGhlIHBheW91dCBpcyB6ZXJvIG9yIG5lZ2F0aXZlICh0aGUgZGVwbG95bWVudCBmYWlscykuAAAAAAANSW52YWxpZFBheW91dAAAAAAAAAQ=",
        "AAAABQAAADtBbiBhY2NvdW50IHByZXNlbnRlZCB0aGUgcmlnaHQgY29kZSBhbmQgcmVjZWl2ZWQgaXRzIHNoYXJlLgAAAAAAAAAAB0NsYWltZWQAAAAAAQAAAAdjbGFpbWVkAAAAAAIAAAAAAAAAB2NsYWltZXIAAAAAEwAAAAEAAAAAAAAABmFtb3VudAAAAAAACwAAAAAAAAAC" ]),
      options
    )
  }
  public readonly fromJSON = {
    claim: this.txFromJSON<Result<i128>>,
        get_claims: this.txFromJSON<u32>,
        get_config: this.txFromJSON<Config>,
        get_balance: this.txFromJSON<i128>,
        has_claimed: this.txFromJSON<boolean>
  }
}