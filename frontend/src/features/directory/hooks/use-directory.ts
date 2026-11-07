"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

import { fetchDirectory } from "../services/directory-api";

/**
 * The building's name and a lookup from address to a human name. Both are optional: without
 * off-chain storage, or before the team fills them in, screens show addresses.
 */
export function useDirectory() {
  const query = useQuery({
    queryKey: ["offchain", "directory"],
    queryFn: () => fetchDirectory(),
    staleTime: 5 * 60_000,
    retry: 1,
  });

  const names = useMemo(
    () => new Map((query.data?.people ?? []).map((person) => [person.address, person.name])),
    [query.data],
  );
  const nameFor = useCallback((address: string) => names.get(address) ?? null, [names]);

  return { building: query.data?.building ?? null, nameFor };
}
