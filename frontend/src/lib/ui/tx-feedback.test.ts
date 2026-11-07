import { describe, expect, it } from "vitest";

import { txFeedbackFor, type MutationLike } from "./tx-feedback";

type Receipt = { explorerUrl?: string; value: number };

const idle: MutationLike<Receipt> = { isPending: false, isSuccess: false, isError: false, error: null };

const messages = {
  pending: "Firmando…",
  success: (receipt: Receipt) => `Gasto #${receipt.value} propuesto`,
  explorerLabel: "Ver la transacción",
  describe: (error: unknown) => `Falló: ${String(error)}`,
};

describe("transaction feedback", () => {
  it("shows nothing before the transaction starts", () => {
    expect(txFeedbackFor(idle, messages)).toBeNull();
  });

  it("says it is waiting while the transaction runs", () => {
    expect(txFeedbackFor({ ...idle, isPending: true }, messages)).toEqual({ status: "pending", message: "Firmando…" });
  });

  it("explains a failure in words", () => {
    expect(txFeedbackFor({ ...idle, isError: true, error: "OverBudget" }, messages)).toEqual({
      status: "error",
      message: "Falló: OverBudget",
    });
  });

  it("links a success to the explorer", () => {
    const data = { explorerUrl: "https://stellar.expert/explorer/testnet/tx/abc", value: 4 };

    expect(txFeedbackFor({ ...idle, isSuccess: true, data }, messages)).toEqual({
      status: "success",
      message: "Gasto #4 propuesto",
      link: { label: "Ver la transacción", href: data.explorerUrl },
    });
  });

  it("accepts a fixed success message and a receipt without a link", () => {
    const feedback = txFeedbackFor<Receipt>({ ...idle, isSuccess: true, data: { value: 1 } }, { ...messages, success: "Listo" });

    expect(feedback).toEqual({ status: "success", message: "Listo", link: undefined });
  });
});
