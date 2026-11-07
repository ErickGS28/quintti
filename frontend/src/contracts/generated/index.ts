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
    contractId: "CDTFBAOGT7UAN3BNX4BQNJYK2BCV3DYLNJIC2FN6GU6SIIUZAXN44RG7",
  }
} as const


/**
 * Token and roles. The token never changes. The assembly can replace the
 * administrator and the threshold, and the contract keeps the assembly itself
 * fixed.
 */
export interface Config {
  /**
 * Role that proposes expenses. It can never approve them.
 */
administrator: string;
  /**
 * Role that sets the rules. It can never move funds.
 */
assembly: string;
  /**
 * Number of council approvals needed to pay an expense.
 */
threshold: u32;
  /**
 * Token that the treasury holds and pays with.
 */
token: string;
}


/**
 * A proposed payment to an approved vendor.
 */
export interface Expense {
  amount: i128;
  /**
 * Council members that approved, in order. Members removed from the
 * council after approving no longer count.
 */
approvals: Array<string>;
  category: string;
  /**
 * Ledger time when the expense was proposed.
 */
created_at: u64;
  id: u32;
  /**
 * SHA-256 of the invoice file, computed by the client.
 */
invoice_hash: Buffer;
  /**
 * Ledger time when the expense was paid.
 */
paid_at: Option<u64>;
  status: ExpenseStatus;
  vendor: string;
}


/**
 * Annual limit and amount already paid for one category.
 */
export interface BudgetLine {
  limit: i128;
  spent: i128;
}

/**
 * Lifecycle of an expense. `Paid` and `Cancelled` are final.
 */
export type ExpenseStatus = {tag: "Pending", values: void} | {tag: "Paid", values: void} | {tag: "Cancelled", values: void};

/**
 * Errors returned by the treasury contract.
 * 
 * Numeric values are part of the public interface (clients map them to
 * messages), so they must stay stable once deployed.
 */
export const Errors = {
  /**
   * The contract has no configuration yet.
   */
  1: {message:"NotInitialized"},
  /**
   * The council is empty, too large or contains duplicates.
   */
  2: {message:"InvalidCouncil"},
  /**
   * The threshold is zero or larger than the council.
   */
  3: {message:"InvalidThreshold"},
  /**
   * The administrator is also a council member.
   */
  4: {message:"AdministratorInCouncil"},
  /**
   * An amount is zero or negative.
   */
  5: {message:"InvalidAmount"},
  /**
   * The category has no budget line.
   */
  6: {message:"UnknownCategory"},
  /**
   * The maximum number of budget categories was reached.
   */
  7: {message:"TooManyCategories"},
  /**
   * The maximum number of approved vendors was reached.
   */
  8: {message:"TooManyVendors"},
  /**
   * The new limit is below what the category has already spent.
   */
  9: {message:"BudgetBelowSpent"},
  /**
   * The vendor is not on the approved list.
   */
  10: {message:"VendorNotApproved"},
  /**
   * The vendor is the assembly, the administrator or a council member.
   */
  11: {message:"VendorIsInsider"},
  /**
   * The expense would exceed the category's limit.
   */
  12: {message:"OverBudget"},
  /**
   * No expense exists with that id.
   */
  13: {message:"ExpenseNotFound"},
  /**
   * The expense is already paid or cancelled.
   */
  14: {message:"ExpenseNotPending"},
  /**
   * The caller is not a current council member.
   */
  15: {message:"NotCouncilMember"},
  /**
   * The council member already approved this expense.
   */
  16: {message:"AlreadyApproved"},
  /**
   * The caller may not perform this action.
   */
  17: {message:"NotAuthorized"},
  /**
   * The treasury balance does not cover the payment.
   */
  18: {message:"InsufficientBalance"},
  /**
   * A checked arithmetic operation overflowed.
   */
  19: {message:"Overflow"}
}











export interface Client {
  /**
   * Construct and simulate a balance transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Returns the token balance held by the treasury.
   */
  balance: (options?: MethodOptions) => Promise<AssembledTransaction<Result<i128>>>

  /**
   * Construct and simulate a deposit transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Pays tokens into the treasury and records who paid. A plain token
   * transfer to the contract address also works, but leaves no record here.
   * 
   * Auth: the payer. Errors: `InvalidAmount`.
   */
  deposit: ({from, amount}: {from: string, amount: i128}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a is_vendor transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Returns whether a vendor is currently approved.
   */
  is_vendor: ({vendor}: {vendor: string}, options?: MethodOptions) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a get_budget transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Returns the limit and the amount paid for a category, if it exists.
   */
  get_budget: ({category}: {category: string}, options?: MethodOptions) => Promise<AssembledTransaction<Option<BudgetLine>>>

  /**
   * Construct and simulate a get_config transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Returns the fixed configuration: token, roles and threshold.
   */
  get_config: (options?: MethodOptions) => Promise<AssembledTransaction<Result<Config>>>

  /**
   * Construct and simulate a set_budget transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Creates a budget line or changes its limit. The limit cannot drop below
   * what the category has already paid.
   * 
   * Auth: assembly. Errors: `InvalidAmount`, `BudgetBelowSpent`,
   * `TooManyCategories`.
   */
  set_budget: ({category, limit}: {category: string, limit: i128}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a set_vendor transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Approves or removes a vendor. Money can only be paid to approved
   * vendors, and never to the assembly, the administrator or a council
   * member.
   * 
   * Auth: assembly. Errors: `VendorIsInsider`, `TooManyVendors`.
   */
  set_vendor: ({vendor, allowed}: {vendor: string, allowed: boolean}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_council transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Returns the current council members.
   */
  get_council: (options?: MethodOptions) => Promise<AssembledTransaction<Array<string>>>

  /**
   * Construct and simulate a get_expense transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Returns one expense.
   * 
   * Errors: `ExpenseNotFound`.
   */
  get_expense: ({id}: {id: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<Expense>>>

  /**
   * Construct and simulate a get_expenses transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Returns up to `limit` expenses starting at id `from`, in id order. The
   * page size is capped at `MAX_PAGE`.
   */
  get_expenses: ({from, limit}: {from: u32, limit: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Array<Expense>>>

  /**
   * Construct and simulate a list_vendors transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Returns the approved vendors.
   */
  list_vendors: (options?: MethodOptions) => Promise<AssembledTransaction<Array<string>>>

  /**
   * Construct and simulate a expense_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Returns how many expenses have been proposed. Ids go from 0 to this
   * number minus one.
   */
  expense_count: (options?: MethodOptions) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a cancel_expense transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Cancels a pending expense, for example one that can no longer be paid.
   * A cancelled expense is final.
   * 
   * Auth: the administrator or the assembly. Errors: `NotAuthorized`,
   * `ExpenseNotFound`, `ExpenseNotPending`.
   */
  cancel_expense: ({caller, id}: {caller: string, id: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a rotate_council transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Replaces the council and the approval threshold. Approvals already given
   * by members who leave the council stop counting.
   * 
   * Auth: assembly. Errors: `InvalidCouncil`, `InvalidThreshold`,
   * `AdministratorInCouncil`.
   */
  rotate_council: ({council, threshold}: {council: Array<string>, threshold: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a approve_expense transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Records a council member's approval. The approval that brings the number
   * of current council members who approved to the threshold also pays the
   * vendor, in the same transaction. If any rule fails at that moment the
   * whole call reverts, including this approval.
   * 
   * Auth: the approving council member. Errors: `NotCouncilMember`,
   * `ExpenseNotFound`, `ExpenseNotPending`, `AlreadyApproved`, and when
   * paying `VendorNotApproved`, `VendorIsInsider`, `UnknownCategory`,
   * `OverBudget`, `InsufficientBalance`.
   */
  approve_expense: ({approver, id}: {approver: string, id: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a list_categories transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Returns the budget categories, in creation order.
   */
  list_categories: (options?: MethodOptions) => Promise<AssembledTransaction<Array<string>>>

  /**
   * Construct and simulate a propose_expense transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Proposes a payment to an approved vendor, with the SHA-256 fingerprint of
   * its invoice. Nothing is reserved: money moves only when the council
   * approves. The proposal is rejected early if it already breaks a rule.
   * 
   * Auth: administrator. Errors: `InvalidAmount`, `UnknownCategory`,
   * `VendorNotApproved`, `VendorIsInsider`, `OverBudget`, `Overflow`.
   */
  propose_expense: ({category, vendor, amount, invoice_hash}: {category: string, vendor: string, amount: i128, invoice_hash: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Result<u32>>>

  /**
   * Construct and simulate a set_administrator transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Replaces the administrator. Pending expenses stay pending; they can be
   * cancelled by the new administrator or the assembly.
   * 
   * Auth: assembly. Errors: `AdministratorInCouncil`.
   */
  set_administrator: ({administrator}: {administrator: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
        /** Constructor/Initialization Args for the contract's `__constructor` method */
        {token, assembly, administrator, council, threshold}: {token: string, assembly: string, administrator: string, council: Array<string>, threshold: u32},
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
    return ContractClient.deploy({token, assembly, administrator, council, threshold}, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAAAAAC9SZXR1cm5zIHRoZSB0b2tlbiBiYWxhbmNlIGhlbGQgYnkgdGhlIHRyZWFzdXJ5LgAAAAAHYmFsYW5jZQAAAAAAAAAAAQAAA+kAAAALAAAAAw==",
        "AAAAAAAAALRQYXlzIHRva2VucyBpbnRvIHRoZSB0cmVhc3VyeSBhbmQgcmVjb3JkcyB3aG8gcGFpZC4gQSBwbGFpbiB0b2tlbgp0cmFuc2ZlciB0byB0aGUgY29udHJhY3QgYWRkcmVzcyBhbHNvIHdvcmtzLCBidXQgbGVhdmVzIG5vIHJlY29yZCBoZXJlLgoKQXV0aDogdGhlIHBheWVyLiBFcnJvcnM6IGBJbnZhbGlkQW1vdW50YC4AAAAHZGVwb3NpdAAAAAACAAAAAAAAAARmcm9tAAAAEwAAAAAAAAAGYW1vdW50AAAAAAALAAAAAQAAA+kAAAACAAAAAw==",
        "AAAAAAAAAC9SZXR1cm5zIHdoZXRoZXIgYSB2ZW5kb3IgaXMgY3VycmVudGx5IGFwcHJvdmVkLgAAAAAJaXNfdmVuZG9yAAAAAAAAAQAAAAAAAAAGdmVuZG9yAAAAAAATAAAAAQAAAAE=",
        "AAAAAAAAAENSZXR1cm5zIHRoZSBsaW1pdCBhbmQgdGhlIGFtb3VudCBwYWlkIGZvciBhIGNhdGVnb3J5LCBpZiBpdCBleGlzdHMuAAAAAApnZXRfYnVkZ2V0AAAAAAABAAAAAAAAAAhjYXRlZ29yeQAAABEAAAABAAAD6AAAB9AAAAAKQnVkZ2V0TGluZQAA",
        "AAAAAAAAADxSZXR1cm5zIHRoZSBmaXhlZCBjb25maWd1cmF0aW9uOiB0b2tlbiwgcm9sZXMgYW5kIHRocmVzaG9sZC4AAAAKZ2V0X2NvbmZpZwAAAAAAAAAAAAEAAAPpAAAH0AAAAAZDb25maWcAAAAAAAM=",
        "AAAAAAAAAL5DcmVhdGVzIGEgYnVkZ2V0IGxpbmUgb3IgY2hhbmdlcyBpdHMgbGltaXQuIFRoZSBsaW1pdCBjYW5ub3QgZHJvcCBiZWxvdwp3aGF0IHRoZSBjYXRlZ29yeSBoYXMgYWxyZWFkeSBwYWlkLgoKQXV0aDogYXNzZW1ibHkuIEVycm9yczogYEludmFsaWRBbW91bnRgLCBgQnVkZ2V0QmVsb3dTcGVudGAsCmBUb29NYW55Q2F0ZWdvcmllc2AuAAAAAAAKc2V0X2J1ZGdldAAAAAAAAgAAAAAAAAAIY2F0ZWdvcnkAAAARAAAAAAAAAAVsaW1pdAAAAAAAAAsAAAABAAAD6QAAAAIAAAAD",
        "AAAAAAAAAMlBcHByb3ZlcyBvciByZW1vdmVzIGEgdmVuZG9yLiBNb25leSBjYW4gb25seSBiZSBwYWlkIHRvIGFwcHJvdmVkCnZlbmRvcnMsIGFuZCBuZXZlciB0byB0aGUgYXNzZW1ibHksIHRoZSBhZG1pbmlzdHJhdG9yIG9yIGEgY291bmNpbAptZW1iZXIuCgpBdXRoOiBhc3NlbWJseS4gRXJyb3JzOiBgVmVuZG9ySXNJbnNpZGVyYCwgYFRvb01hbnlWZW5kb3JzYC4AAAAAAAAKc2V0X3ZlbmRvcgAAAAAAAgAAAAAAAAAGdmVuZG9yAAAAAAATAAAAAAAAAAdhbGxvd2VkAAAAAAEAAAABAAAD6QAAAAIAAAAD",
        "AAAAAAAAACRSZXR1cm5zIHRoZSBjdXJyZW50IGNvdW5jaWwgbWVtYmVycy4AAAALZ2V0X2NvdW5jaWwAAAAAAAAAAAEAAAPqAAAAEw==",
        "AAAAAAAAADBSZXR1cm5zIG9uZSBleHBlbnNlLgoKRXJyb3JzOiBgRXhwZW5zZU5vdEZvdW5kYC4AAAALZ2V0X2V4cGVuc2UAAAAAAQAAAAAAAAACaWQAAAAAAAQAAAABAAAD6QAAB9AAAAAHRXhwZW5zZQAAAAAD",
        "AAAAAAAAAGlSZXR1cm5zIHVwIHRvIGBsaW1pdGAgZXhwZW5zZXMgc3RhcnRpbmcgYXQgaWQgYGZyb21gLCBpbiBpZCBvcmRlci4gVGhlCnBhZ2Ugc2l6ZSBpcyBjYXBwZWQgYXQgYE1BWF9QQUdFYC4AAAAAAAAMZ2V0X2V4cGVuc2VzAAAAAgAAAAAAAAAEZnJvbQAAAAQAAAAAAAAABWxpbWl0AAAAAAAABAAAAAEAAAPqAAAH0AAAAAdFeHBlbnNlAA==",
        "AAAAAAAAAB1SZXR1cm5zIHRoZSBhcHByb3ZlZCB2ZW5kb3JzLgAAAAAAAAxsaXN0X3ZlbmRvcnMAAAAAAAAAAQAAA+oAAAAT",
        "AAAAAAAAAPFGaXhlcyB0aGUgYnVpbGRpbmcncyBydWxlcyBhdCBkZXBsb3ltZW50LiBJdCBydW5zIG9uY2UsIGF0b21pY2FsbHkgd2l0aAp0aGUgZGVwbG95bWVudCwgc28gdGhlcmUgaXMgbm8gd2luZG93IHRvIGluaXRpYWxpemUgaXQgdHdpY2UuCgpBdXRoOiBub25lLiBFcnJvcnM6IGBJbnZhbGlkQ291bmNpbGAsIGBJbnZhbGlkVGhyZXNob2xkYCwKYEFkbWluaXN0cmF0b3JJbkNvdW5jaWxgICh0aGUgZGVwbG95bWVudCBmYWlscykuAAAAAAAADV9fY29uc3RydWN0b3IAAAAAAAAFAAAAAAAAAAV0b2tlbgAAAAAAABMAAAAAAAAACGFzc2VtYmx5AAAAEwAAAAAAAAANYWRtaW5pc3RyYXRvcgAAAAAAABMAAAAAAAAAB2NvdW5jaWwAAAAD6gAAABMAAAAAAAAACXRocmVzaG9sZAAAAAAAAAQAAAABAAAD6QAAAAIAAAAD",
        "AAAAAAAAAFVSZXR1cm5zIGhvdyBtYW55IGV4cGVuc2VzIGhhdmUgYmVlbiBwcm9wb3NlZC4gSWRzIGdvIGZyb20gMCB0byB0aGlzCm51bWJlciBtaW51cyBvbmUuAAAAAAAADWV4cGVuc2VfY291bnQAAAAAAAAAAAAAAQAAAAQ=",
        "AAAAAAAAAM9DYW5jZWxzIGEgcGVuZGluZyBleHBlbnNlLCBmb3IgZXhhbXBsZSBvbmUgdGhhdCBjYW4gbm8gbG9uZ2VyIGJlIHBhaWQuCkEgY2FuY2VsbGVkIGV4cGVuc2UgaXMgZmluYWwuCgpBdXRoOiB0aGUgYWRtaW5pc3RyYXRvciBvciB0aGUgYXNzZW1ibHkuIEVycm9yczogYE5vdEF1dGhvcml6ZWRgLApgRXhwZW5zZU5vdEZvdW5kYCwgYEV4cGVuc2VOb3RQZW5kaW5nYC4AAAAADmNhbmNlbF9leHBlbnNlAAAAAAACAAAAAAAAAAZjYWxsZXIAAAAAABMAAAAAAAAAAmlkAAAAAAAEAAAAAQAAA+kAAAACAAAAAw==",
        "AAAAAAAAANFSZXBsYWNlcyB0aGUgY291bmNpbCBhbmQgdGhlIGFwcHJvdmFsIHRocmVzaG9sZC4gQXBwcm92YWxzIGFscmVhZHkgZ2l2ZW4KYnkgbWVtYmVycyB3aG8gbGVhdmUgdGhlIGNvdW5jaWwgc3RvcCBjb3VudGluZy4KCkF1dGg6IGFzc2VtYmx5LiBFcnJvcnM6IGBJbnZhbGlkQ291bmNpbGAsIGBJbnZhbGlkVGhyZXNob2xkYCwKYEFkbWluaXN0cmF0b3JJbkNvdW5jaWxgLgAAAAAAAA5yb3RhdGVfY291bmNpbAAAAAAAAgAAAAAAAAAHY291bmNpbAAAAAPqAAAAEwAAAAAAAAAJdGhyZXNob2xkAAAAAAAABAAAAAEAAAPpAAAAAgAAAAM=",
        "AAAAAAAAAe5SZWNvcmRzIGEgY291bmNpbCBtZW1iZXIncyBhcHByb3ZhbC4gVGhlIGFwcHJvdmFsIHRoYXQgYnJpbmdzIHRoZSBudW1iZXIKb2YgY3VycmVudCBjb3VuY2lsIG1lbWJlcnMgd2hvIGFwcHJvdmVkIHRvIHRoZSB0aHJlc2hvbGQgYWxzbyBwYXlzIHRoZQp2ZW5kb3IsIGluIHRoZSBzYW1lIHRyYW5zYWN0aW9uLiBJZiBhbnkgcnVsZSBmYWlscyBhdCB0aGF0IG1vbWVudCB0aGUKd2hvbGUgY2FsbCByZXZlcnRzLCBpbmNsdWRpbmcgdGhpcyBhcHByb3ZhbC4KCkF1dGg6IHRoZSBhcHByb3ZpbmcgY291bmNpbCBtZW1iZXIuIEVycm9yczogYE5vdENvdW5jaWxNZW1iZXJgLApgRXhwZW5zZU5vdEZvdW5kYCwgYEV4cGVuc2VOb3RQZW5kaW5nYCwgYEFscmVhZHlBcHByb3ZlZGAsIGFuZCB3aGVuCnBheWluZyBgVmVuZG9yTm90QXBwcm92ZWRgLCBgVmVuZG9ySXNJbnNpZGVyYCwgYFVua25vd25DYXRlZ29yeWAsCmBPdmVyQnVkZ2V0YCwgYEluc3VmZmljaWVudEJhbGFuY2VgLgAAAAAAD2FwcHJvdmVfZXhwZW5zZQAAAAACAAAAAAAAAAhhcHByb3ZlcgAAABMAAAAAAAAAAmlkAAAAAAAEAAAAAQAAA+kAAAACAAAAAw==",
        "AAAAAAAAADFSZXR1cm5zIHRoZSBidWRnZXQgY2F0ZWdvcmllcywgaW4gY3JlYXRpb24gb3JkZXIuAAAAAAAAD2xpc3RfY2F0ZWdvcmllcwAAAAAAAAAAAQAAA+oAAAAR",
        "AAAAAAAAAVdQcm9wb3NlcyBhIHBheW1lbnQgdG8gYW4gYXBwcm92ZWQgdmVuZG9yLCB3aXRoIHRoZSBTSEEtMjU2IGZpbmdlcnByaW50IG9mCml0cyBpbnZvaWNlLiBOb3RoaW5nIGlzIHJlc2VydmVkOiBtb25leSBtb3ZlcyBvbmx5IHdoZW4gdGhlIGNvdW5jaWwKYXBwcm92ZXMuIFRoZSBwcm9wb3NhbCBpcyByZWplY3RlZCBlYXJseSBpZiBpdCBhbHJlYWR5IGJyZWFrcyBhIHJ1bGUuCgpBdXRoOiBhZG1pbmlzdHJhdG9yLiBFcnJvcnM6IGBJbnZhbGlkQW1vdW50YCwgYFVua25vd25DYXRlZ29yeWAsCmBWZW5kb3JOb3RBcHByb3ZlZGAsIGBWZW5kb3JJc0luc2lkZXJgLCBgT3ZlckJ1ZGdldGAsIGBPdmVyZmxvd2AuAAAAAA9wcm9wb3NlX2V4cGVuc2UAAAAABAAAAAAAAAAIY2F0ZWdvcnkAAAARAAAAAAAAAAZ2ZW5kb3IAAAAAABMAAAAAAAAABmFtb3VudAAAAAAACwAAAAAAAAAMaW52b2ljZV9oYXNoAAAD7gAAACAAAAABAAAD6QAAAAQAAAAD",
        "AAAAAAAAAK1SZXBsYWNlcyB0aGUgYWRtaW5pc3RyYXRvci4gUGVuZGluZyBleHBlbnNlcyBzdGF5IHBlbmRpbmc7IHRoZXkgY2FuIGJlCmNhbmNlbGxlZCBieSB0aGUgbmV3IGFkbWluaXN0cmF0b3Igb3IgdGhlIGFzc2VtYmx5LgoKQXV0aDogYXNzZW1ibHkuIEVycm9yczogYEFkbWluaXN0cmF0b3JJbkNvdW5jaWxgLgAAAAAAABFzZXRfYWRtaW5pc3RyYXRvcgAAAAAAAAEAAAAAAAAADWFkbWluaXN0cmF0b3IAAAAAAAATAAAAAQAAA+kAAAACAAAAAw==",
        "AAAAAQAAAJlUb2tlbiBhbmQgcm9sZXMuIFRoZSB0b2tlbiBuZXZlciBjaGFuZ2VzLiBUaGUgYXNzZW1ibHkgY2FuIHJlcGxhY2UgdGhlCmFkbWluaXN0cmF0b3IgYW5kIHRoZSB0aHJlc2hvbGQsIGFuZCB0aGUgY29udHJhY3Qga2VlcHMgdGhlIGFzc2VtYmx5IGl0c2VsZgpmaXhlZC4AAAAAAAAAAAAABkNvbmZpZwAAAAAABAAAADdSb2xlIHRoYXQgcHJvcG9zZXMgZXhwZW5zZXMuIEl0IGNhbiBuZXZlciBhcHByb3ZlIHRoZW0uAAAAAA1hZG1pbmlzdHJhdG9yAAAAAAAAEwAAADJSb2xlIHRoYXQgc2V0cyB0aGUgcnVsZXMuIEl0IGNhbiBuZXZlciBtb3ZlIGZ1bmRzLgAAAAAACGFzc2VtYmx5AAAAEwAAADVOdW1iZXIgb2YgY291bmNpbCBhcHByb3ZhbHMgbmVlZGVkIHRvIHBheSBhbiBleHBlbnNlLgAAAAAAAAl0aHJlc2hvbGQAAAAAAAAEAAAALFRva2VuIHRoYXQgdGhlIHRyZWFzdXJ5IGhvbGRzIGFuZCBwYXlzIHdpdGguAAAABXRva2VuAAAAAAAAEw==",
        "AAAAAQAAAClBIHByb3Bvc2VkIHBheW1lbnQgdG8gYW4gYXBwcm92ZWQgdmVuZG9yLgAAAAAAAAAAAAAHRXhwZW5zZQAAAAAJAAAAAAAAAAZhbW91bnQAAAAAAAsAAABqQ291bmNpbCBtZW1iZXJzIHRoYXQgYXBwcm92ZWQsIGluIG9yZGVyLiBNZW1iZXJzIHJlbW92ZWQgZnJvbSB0aGUKY291bmNpbCBhZnRlciBhcHByb3Zpbmcgbm8gbG9uZ2VyIGNvdW50LgAAAAAACWFwcHJvdmFscwAAAAAAA+oAAAATAAAAAAAAAAhjYXRlZ29yeQAAABEAAAAqTGVkZ2VyIHRpbWUgd2hlbiB0aGUgZXhwZW5zZSB3YXMgcHJvcG9zZWQuAAAAAAAKY3JlYXRlZF9hdAAAAAAABgAAAAAAAAACaWQAAAAAAAQAAAA0U0hBLTI1NiBvZiB0aGUgaW52b2ljZSBmaWxlLCBjb21wdXRlZCBieSB0aGUgY2xpZW50LgAAAAxpbnZvaWNlX2hhc2gAAAPuAAAAIAAAACZMZWRnZXIgdGltZSB3aGVuIHRoZSBleHBlbnNlIHdhcyBwYWlkLgAAAAAAB3BhaWRfYXQAAAAD6AAAAAYAAAAAAAAABnN0YXR1cwAAAAAH0AAAAA1FeHBlbnNlU3RhdHVzAAAAAAAAAAAAAAZ2ZW5kb3IAAAAAABM=",
        "AAAAAQAAADZBbm51YWwgbGltaXQgYW5kIGFtb3VudCBhbHJlYWR5IHBhaWQgZm9yIG9uZSBjYXRlZ29yeS4AAAAAAAAAAAAKQnVkZ2V0TGluZQAAAAAAAgAAAAAAAAAFbGltaXQAAAAAAAALAAAAAAAAAAVzcGVudAAAAAAAAAs=",
        "AAAAAgAAADpMaWZlY3ljbGUgb2YgYW4gZXhwZW5zZS4gYFBhaWRgIGFuZCBgQ2FuY2VsbGVkYCBhcmUgZmluYWwuAAAAAAAAAAAADUV4cGVuc2VTdGF0dXMAAAAAAAADAAAAAAAAAAAAAAAHUGVuZGluZwAAAAAAAAAAAAAAAARQYWlkAAAAAAAAAAAAAAAJQ2FuY2VsbGVkAAAA",
        "AAAABAAAAKJFcnJvcnMgcmV0dXJuZWQgYnkgdGhlIHRyZWFzdXJ5IGNvbnRyYWN0LgoKTnVtZXJpYyB2YWx1ZXMgYXJlIHBhcnQgb2YgdGhlIHB1YmxpYyBpbnRlcmZhY2UgKGNsaWVudHMgbWFwIHRoZW0gdG8KbWVzc2FnZXMpLCBzbyB0aGV5IG11c3Qgc3RheSBzdGFibGUgb25jZSBkZXBsb3llZC4AAAAAAAAAAAAFRXJyb3IAAAAAAAATAAAAJlRoZSBjb250cmFjdCBoYXMgbm8gY29uZmlndXJhdGlvbiB5ZXQuAAAAAAAOTm90SW5pdGlhbGl6ZWQAAAAAAAEAAAA3VGhlIGNvdW5jaWwgaXMgZW1wdHksIHRvbyBsYXJnZSBvciBjb250YWlucyBkdXBsaWNhdGVzLgAAAAAOSW52YWxpZENvdW5jaWwAAAAAAAIAAAAxVGhlIHRocmVzaG9sZCBpcyB6ZXJvIG9yIGxhcmdlciB0aGFuIHRoZSBjb3VuY2lsLgAAAAAAABBJbnZhbGlkVGhyZXNob2xkAAAAAwAAACtUaGUgYWRtaW5pc3RyYXRvciBpcyBhbHNvIGEgY291bmNpbCBtZW1iZXIuAAAAABZBZG1pbmlzdHJhdG9ySW5Db3VuY2lsAAAAAAAEAAAAHkFuIGFtb3VudCBpcyB6ZXJvIG9yIG5lZ2F0aXZlLgAAAAAADUludmFsaWRBbW91bnQAAAAAAAAFAAAAIFRoZSBjYXRlZ29yeSBoYXMgbm8gYnVkZ2V0IGxpbmUuAAAAD1Vua25vd25DYXRlZ29yeQAAAAAGAAAANFRoZSBtYXhpbXVtIG51bWJlciBvZiBidWRnZXQgY2F0ZWdvcmllcyB3YXMgcmVhY2hlZC4AAAARVG9vTWFueUNhdGVnb3JpZXMAAAAAAAAHAAAAM1RoZSBtYXhpbXVtIG51bWJlciBvZiBhcHByb3ZlZCB2ZW5kb3JzIHdhcyByZWFjaGVkLgAAAAAOVG9vTWFueVZlbmRvcnMAAAAAAAgAAAA7VGhlIG5ldyBsaW1pdCBpcyBiZWxvdyB3aGF0IHRoZSBjYXRlZ29yeSBoYXMgYWxyZWFkeSBzcGVudC4AAAAAEEJ1ZGdldEJlbG93U3BlbnQAAAAJAAAAJ1RoZSB2ZW5kb3IgaXMgbm90IG9uIHRoZSBhcHByb3ZlZCBsaXN0LgAAAAARVmVuZG9yTm90QXBwcm92ZWQAAAAAAAAKAAAAQlRoZSB2ZW5kb3IgaXMgdGhlIGFzc2VtYmx5LCB0aGUgYWRtaW5pc3RyYXRvciBvciBhIGNvdW5jaWwgbWVtYmVyLgAAAAAAD1ZlbmRvcklzSW5zaWRlcgAAAAALAAAALlRoZSBleHBlbnNlIHdvdWxkIGV4Y2VlZCB0aGUgY2F0ZWdvcnkncyBsaW1pdC4AAAAAAApPdmVyQnVkZ2V0AAAAAAAMAAAAH05vIGV4cGVuc2UgZXhpc3RzIHdpdGggdGhhdCBpZC4AAAAAD0V4cGVuc2VOb3RGb3VuZAAAAAANAAAAKVRoZSBleHBlbnNlIGlzIGFscmVhZHkgcGFpZCBvciBjYW5jZWxsZWQuAAAAAAAAEUV4cGVuc2VOb3RQZW5kaW5nAAAAAAAADgAAACtUaGUgY2FsbGVyIGlzIG5vdCBhIGN1cnJlbnQgY291bmNpbCBtZW1iZXIuAAAAABBOb3RDb3VuY2lsTWVtYmVyAAAADwAAADFUaGUgY291bmNpbCBtZW1iZXIgYWxyZWFkeSBhcHByb3ZlZCB0aGlzIGV4cGVuc2UuAAAAAAAAD0FscmVhZHlBcHByb3ZlZAAAAAAQAAAAJ1RoZSBjYWxsZXIgbWF5IG5vdCBwZXJmb3JtIHRoaXMgYWN0aW9uLgAAAAANTm90QXV0aG9yaXplZAAAAAAAABEAAAAwVGhlIHRyZWFzdXJ5IGJhbGFuY2UgZG9lcyBub3QgY292ZXIgdGhlIHBheW1lbnQuAAAAE0luc3VmZmljaWVudEJhbGFuY2UAAAAAEgAAACpBIGNoZWNrZWQgYXJpdGhtZXRpYyBvcGVyYXRpb24gb3ZlcmZsb3dlZC4AAAAAAAhPdmVyZmxvdwAAABM=",
        "AAAABQAAAC9BIGJ1ZGdldCBsaW5lIHdhcyBjcmVhdGVkIG9yIGl0cyBsaW1pdCBjaGFuZ2VkLgAAAAAAAAAACUJ1ZGdldFNldAAAAAAAAAEAAAAKYnVkZ2V0X3NldAAAAAAAAgAAAAAAAAAIY2F0ZWdvcnkAAAARAAAAAQAAAAAAAAAFbGltaXQAAAAAAAALAAAAAAAAAAI=",
        "AAAABQAAADhTb21lb25lIHBhaWQgdG9rZW5zIGludG8gdGhlIHRyZWFzdXJ5IHRocm91Z2ggYGRlcG9zaXRgLgAAAAAAAAAJRGVwb3NpdGVkAAAAAAAAAQAAAAlkZXBvc2l0ZWQAAAAAAAACAAAAAAAAAARmcm9tAAAAEwAAAAEAAAAAAAAABmFtb3VudAAAAAAACwAAAAAAAAAC",
        "AAAABQAAACFBIHZlbmRvciB3YXMgYXBwcm92ZWQgb3IgcmVtb3ZlZC4AAAAAAAAAAAAACVZlbmRvclNldAAAAAAAAAEAAAAKdmVuZG9yX3NldAAAAAAAAgAAAAAAAAAGdmVuZG9yAAAAAAATAAAAAQAAAAAAAAAHYWxsb3dlZAAAAAABAAAAAAAAAAI=",
        "AAAABQAAADlBbiBleHBlbnNlIHJlYWNoZWQgdGhlIHRocmVzaG9sZCBhbmQgdGhlIHZlbmRvciB3YXMgcGFpZC4AAAAAAAAAAAAAC0V4cGVuc2VQYWlkAAAAAAEAAAAMZXhwZW5zZV9wYWlkAAAAAwAAAAAAAAACaWQAAAAAAAQAAAABAAAAAAAAAAZ2ZW5kb3IAAAAAABMAAAAAAAAAAAAAAAZhbW91bnQAAAAAAAsAAAAAAAAAAg==",
        "AAAABQAAAC5QdWJsaXNoZWQgb25jZSwgd2hlbiB0aGUgY29udHJhY3QgaXMgZGVwbG95ZWQuAAAAAAAAAAAAC0luaXRpYWxpemVkAAAAAAEAAAALaW5pdGlhbGl6ZWQAAAAABQAAAAAAAAAIYXNzZW1ibHkAAAATAAAAAQAAAAAAAAAFdG9rZW4AAAAAAAATAAAAAAAAAAAAAAANYWRtaW5pc3RyYXRvcgAAAAAAABMAAAAAAAAAAAAAAAdjb3VuY2lsAAAAA+oAAAATAAAAAAAAAAAAAAAJdGhyZXNob2xkAAAAAAAABAAAAAAAAAAC",
        "AAAABQAAAD1UaGUgYXNzZW1ibHkgcmVwbGFjZWQgdGhlIGNvdW5jaWwgYW5kIHRoZSBhcHByb3ZhbCB0aHJlc2hvbGQuAAAAAAAAAAAAAA5Db3VuY2lsUm90YXRlZAAAAAAAAQAAAA9jb3VuY2lsX3JvdGF0ZWQAAAAAAgAAAAAAAAAHY291bmNpbAAAAAPqAAAAEwAAAAAAAAAAAAAACXRocmVzaG9sZAAAAAAAAAQAAAAAAAAAAg==",
        "AAAABQAAAG5BIGNvdW5jaWwgbWVtYmVyIGFwcHJvdmVkIGFuIGV4cGVuc2UuIGBhcHByb3ZhbHNgIGNvdW50cyB0aGUgY3VycmVudApjb3VuY2lsIG1lbWJlcnMgd2hvIGhhdmUgYXBwcm92ZWQgc28gZmFyLgAAAAAAAAAAAA9FeHBlbnNlQXBwcm92ZWQAAAAAAQAAABBleHBlbnNlX2FwcHJvdmVkAAAAAwAAAAAAAAACaWQAAAAAAAQAAAABAAAAAAAAAAhhcHByb3ZlcgAAABMAAAAAAAAAAAAAAAlhcHByb3ZhbHMAAAAAAAAEAAAAAAAAAAI=",
        "AAAABQAAACZUaGUgYWRtaW5pc3RyYXRvciBwcm9wb3NlZCBhbiBleHBlbnNlLgAAAAAAAAAAAA9FeHBlbnNlUHJvcG9zZWQAAAAAAQAAABBleHBlbnNlX3Byb3Bvc2VkAAAABQAAAAAAAAACaWQAAAAAAAQAAAABAAAAAAAAAAhjYXRlZ29yeQAAABEAAAAAAAAAAAAAAAZ2ZW5kb3IAAAAAABMAAAAAAAAAAAAAAAZhbW91bnQAAAAAAAsAAAAAAAAAAAAAAAxpbnZvaWNlX2hhc2gAAAPuAAAAIAAAAAAAAAAC",
        "AAAABQAAAChUaGUgYXNzZW1ibHkgcmVwbGFjZWQgdGhlIGFkbWluaXN0cmF0b3IuAAAAAAAAABBBZG1pbmlzdHJhdG9yU2V0AAAAAQAAABFhZG1pbmlzdHJhdG9yX3NldAAAAAAAAAEAAAAAAAAADWFkbWluaXN0cmF0b3IAAAAAAAATAAAAAQAAAAI=",
        "AAAABQAAACBBIHBlbmRpbmcgZXhwZW5zZSB3YXMgY2FuY2VsbGVkLgAAAAAAAAAQRXhwZW5zZUNhbmNlbGxlZAAAAAEAAAARZXhwZW5zZV9jYW5jZWxsZWQAAAAAAAACAAAAAAAAAAJpZAAAAAAABAAAAAEAAAAAAAAADGNhbmNlbGxlZF9ieQAAABMAAAAAAAAAAg==" ]),
      options
    )
  }
  public readonly fromJSON = {
    balance: this.txFromJSON<Result<i128>>,
        deposit: this.txFromJSON<Result<void>>,
        is_vendor: this.txFromJSON<boolean>,
        get_budget: this.txFromJSON<Option<BudgetLine>>,
        get_config: this.txFromJSON<Result<Config>>,
        set_budget: this.txFromJSON<Result<void>>,
        set_vendor: this.txFromJSON<Result<void>>,
        get_council: this.txFromJSON<Array<string>>,
        get_expense: this.txFromJSON<Result<Expense>>,
        get_expenses: this.txFromJSON<Array<Expense>>,
        list_vendors: this.txFromJSON<Array<string>>,
        expense_count: this.txFromJSON<u32>,
        cancel_expense: this.txFromJSON<Result<void>>,
        rotate_council: this.txFromJSON<Result<void>>,
        approve_expense: this.txFromJSON<Result<void>>,
        list_categories: this.txFromJSON<Array<string>>,
        propose_expense: this.txFromJSON<Result<u32>>,
        set_administrator: this.txFromJSON<Result<void>>
  }
}