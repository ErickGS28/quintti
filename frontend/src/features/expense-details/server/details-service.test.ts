import { describe, expect, it, vi } from "vitest";

import { sha256, toHex } from "@/lib/hash/sha256";

import { DetailsError } from "./details-error";
import { createDetailsService, type DetailsStore, type StoredDetails } from "./details-service";
import type { DetailsInput } from "./validation";

const CONTRACT = "CAQ6YXC6L3G2YVBWW52IPDNVBRCDMUO3S463MQL5HD2KGNDCOT5NCHDA";
const BYTES: Uint8Array<ArrayBuffer> = new TextEncoder().encode("%PDF-1.7 factura del ascensor");

async function hashOf(bytes: Uint8Array<ArrayBuffer>): Promise<string> {
  return toHex(await sha256(bytes));
}

function memoryStore(initial: StoredDetails[] = []): DetailsStore & { rows: StoredDetails[] } {
  const rows = [...initial];
  return {
    rows,
    list: async () => rows,
    find: async (id) => rows.find((row) => row.expenseId === id) ?? null,
    save: vi.fn(async (details: StoredDetails) => {
      rows.push(details);
      return details;
    }),
    openInvoice: async () => new Response(BYTES),
  };
}

function input(bytes: Uint8Array<ArrayBuffer> = BYTES): DetailsInput {
  return {
    description: "Reparación del ascensor",
    vendorLabel: "Técnico de ascensores",
    invoice: new Blob([bytes], { type: "application/pdf" }),
    invoiceName: "factura.pdf",
    invoiceType: "application/pdf",
  };
}

async function codeOf(promise: Promise<unknown>): Promise<string | undefined> {
  const error = await promise.catch((caught: unknown) => caught);
  return error instanceof DetailsError ? error.code : undefined;
}

describe("expense details service", () => {
  it("saves the details when the file is the invoice recorded on-chain", async () => {
    const store = memoryStore();
    const recorded = await hashOf(BYTES);
    const service = createDetailsService({
      store,
      invoiceHashOnChain: async () => recorded,
      contractId: CONTRACT,
      now: () => new Date("2026-11-08T10:00:00Z"),
    });

    const saved = await service.attach(3, input());

    expect(saved).toMatchObject({
      expenseId: 3,
      description: "Reparación del ascensor",
      invoice: { hash: recorded, type: "application/pdf", name: "factura.pdf" },
      createdAt: "2026-11-08T10:00:00.000Z",
    });
    expect(store.rows[0].invoicePath).toBe(`${CONTRACT}/3/${recorded}.pdf`);
  });

  it("refuses a file that is not the recorded invoice", async () => {
    const store = memoryStore();
    const service = createDetailsService({
      store,
      invoiceHashOnChain: async () => "0".repeat(64),
      contractId: CONTRACT,
    });

    expect(await codeOf(service.attach(3, input()))).toBe("mismatch");
    expect(store.save).not.toHaveBeenCalled();
  });

  it("refuses an expense that does not exist on-chain", async () => {
    const service = createDetailsService({ store: memoryStore(), invoiceHashOnChain: async () => null, contractId: CONTRACT });

    expect(await codeOf(service.attach(99, input()))).toBe("not-found");
  });

  it("writes details once: a second attempt is refused before reading the network", async () => {
    const recorded = await hashOf(BYTES);
    const lookup = vi.fn(async () => recorded);
    const service = createDetailsService({ store: memoryStore(), invoiceHashOnChain: lookup, contractId: CONTRACT });

    await service.attach(3, input());
    lookup.mockClear();

    expect(await codeOf(service.attach(3, input()))).toBe("already-attached");
    expect(lookup).not.toHaveBeenCalled();
  });

  it("serves a saved invoice and reports a missing one", async () => {
    const recorded = await hashOf(BYTES);
    const service = createDetailsService({ store: memoryStore(), invoiceHashOnChain: async () => recorded, contractId: CONTRACT });
    await service.attach(1, input());

    const { body, details } = await service.invoice(1);

    expect(details.invoice.name).toBe("factura.pdf");
    expect(new Uint8Array(await new Response(body).arrayBuffer())).toEqual(BYTES);
    expect(await codeOf(service.invoice(2))).toBe("not-found");
  });
});
