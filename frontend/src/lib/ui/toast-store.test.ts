import { describe, expect, it, vi } from "vitest";

import { createToastStore, TOAST_DURATION_MS } from "./toast-store";

describe("toast store", () => {
  it("shows a toast and tells its listeners", () => {
    const store = createToastStore(() => undefined);
    const listener = vi.fn();
    store.subscribe(listener);

    store.show({ tone: "success", title: "Gasto propuesto" });

    expect(store.getToasts()).toHaveLength(1);
    expect(store.getToasts()[0]).toMatchObject({ tone: "success", title: "Gasto propuesto" });
    expect(listener).toHaveBeenCalledOnce();
  });

  it("removes a success toast after its duration, but keeps errors until dismissed", () => {
    const timers: Array<{ run: () => void; ms: number }> = [];
    const store = createToastStore((run, ms) => timers.push({ run, ms }));

    store.show({ tone: "success", title: "Listo" });
    const errorId = store.show({ tone: "error", title: "Falló" });

    expect(timers).toHaveLength(1);
    expect(timers[0].ms).toBe(TOAST_DURATION_MS);
    timers[0].run();
    expect(store.getToasts().map((toast) => toast.title)).toEqual(["Falló"]);

    store.dismiss(errorId);
    expect(store.getToasts()).toEqual([]);
  });

  it("keeps at most three, dropping the oldest", () => {
    const store = createToastStore(() => undefined);
    for (const title of ["1", "2", "3", "4"]) store.show({ tone: "info", title });

    expect(store.getToasts().map((toast) => toast.title)).toEqual(["2", "3", "4"]);
  });

  it("keeps the same list object when nothing changes", () => {
    const store = createToastStore(() => undefined);
    const before = store.getToasts();

    store.dismiss(42);

    expect(store.getToasts()).toBe(before);
  });
});
