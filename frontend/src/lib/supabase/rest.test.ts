import { describe, expect, it, vi } from "vitest";

import { createSupabaseRest, SupabaseError } from "./rest";

function fakeFetch(response: Response) {
  return vi.fn<typeof fetch>().mockResolvedValue(response);
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

describe("supabase rest client", () => {
  it("selects rows with PostgREST filters and the secret key in apikey only", async () => {
    const fetchImpl = fakeFetch(json([{ expense_id: 0 }]));
    const client = createSupabaseRest({ url: "https://abc.supabase.co/", key: "sb_secret_x" }, fetchImpl);

    const rows = await client.select("expense_details", { contract_id: "eq.CABC", select: "*" });

    expect(rows).toEqual([{ expense_id: 0 }]);
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe("https://abc.supabase.co/rest/v1/expense_details?contract_id=eq.CABC&select=*");
    expect(init?.headers).toMatchObject({ apikey: "sb_secret_x" });
    expect(init?.headers).not.toHaveProperty("Authorization");
  });

  it("sends a legacy JWT key as a bearer token too", async () => {
    const fetchImpl = fakeFetch(json([]));
    const client = createSupabaseRest({ url: "https://abc.supabase.co", key: "eyJhbGciOi" }, fetchImpl);

    await client.select("people", {});

    expect(fetchImpl.mock.calls[0][1]?.headers).toMatchObject({ apikey: "eyJhbGciOi", Authorization: "Bearer eyJhbGciOi" });
  });

  it("inserts a row and returns it as stored", async () => {
    const fetchImpl = fakeFetch(json([{ expense_id: 3, description: "Ascensor" }], 201));
    const client = createSupabaseRest({ url: "https://abc.supabase.co", key: "k" }, fetchImpl);

    const row = await client.insert("expense_details", { expense_id: 3, description: "Ascensor" });

    expect(row).toEqual({ expense_id: 3, description: "Ascensor" });
    const init = fetchImpl.mock.calls[0][1];
    expect(init?.method).toBe("POST");
    expect(init?.headers).toMatchObject({ Prefer: "return=representation" });
  });

  it("reports a duplicate row as a conflict", async () => {
    const fetchImpl = fakeFetch(json({ code: "23505", message: "duplicate key value" }, 409));
    const client = createSupabaseRest({ url: "https://abc.supabase.co", key: "k" }, fetchImpl);

    const error = await client.insert("expense_details", {}).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(SupabaseError);
    expect((error as SupabaseError).isConflict).toBe(true);
    expect((error as SupabaseError).message).toBe("duplicate key value");
  });

  it("uploads a file to a bucket path, escaping each segment", async () => {
    const fetchImpl = fakeFetch(json({ Key: "invoices/x" }));
    const client = createSupabaseRest({ url: "https://abc.supabase.co", key: "k" }, fetchImpl);

    await client.upload("invoices", "CABC/3/factura final.pdf", new Blob(["%PDF"]), "application/pdf");

    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe("https://abc.supabase.co/storage/v1/object/invoices/CABC/3/factura%20final.pdf");
    expect(init?.headers).toMatchObject({ "Content-Type": "application/pdf", "x-upsert": "true" });
  });

  it("fails with the status when storage refuses a download", async () => {
    const fetchImpl = fakeFetch(new Response("not found", { status: 404 }));
    const client = createSupabaseRest({ url: "https://abc.supabase.co", key: "k" }, fetchImpl);

    await expect(client.download("invoices", "missing.pdf")).rejects.toMatchObject({ status: 404 });
  });
});
