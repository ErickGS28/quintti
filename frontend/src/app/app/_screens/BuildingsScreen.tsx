"use client";

import { Building2, Link2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button, buttonStyles } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { IconButton } from "@/components/atoms/IconButton";
import { Input } from "@/components/atoms/Input";
import { FormField } from "@/components/molecules/FormField";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Panel } from "@/components/molecules/Panel";
import { appCopy } from "@/copy/app.es";
import { useBuildingName } from "@/features/public-view";
import { useBuilding } from "@/lib/buildings/building-context";
import { parseBuildingRef, withBuilding } from "@/lib/buildings/building-ref";
import { shortenAddress } from "@/lib/format/address";
import { copyText } from "@/lib/ui/copy-text";
import { toasts } from "@/lib/ui/toast-store";

import { appRoutes } from "../_shell/routes";

type RowProps = {
  contractId: string;
  isCurrent: boolean;
  isMain: boolean;
  /** Only saved buildings can be taken off the list: the main one belongs to the site. */
  onRemove?: () => void;
};

/** One building of the list: its name as the contract says it, a way in and a way to share it. */
function BuildingRow({ contractId, isCurrent, isMain, onRemove }: RowProps) {
  const { shareUrl, defaultId } = useBuilding();
  const { buildings: copy, building } = appCopy;
  const name = useBuildingName(contractId);
  const label = name.data ?? (name.isError ? copy.unreadable : copy.loadingName);
  const openHref = withBuilding(appRoutes.overview, contractId === defaultId ? null : contractId);

  return (
    <li className="flex items-center gap-3 py-4">
      <span
        aria-hidden="true"
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-royal-soft text-royal"
      >
        <Building2 className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.9375rem] font-semibold text-ink">{label}</p>
        <p className="mt-0.5 truncate font-mono text-xs text-ink-faint">
          {shortenAddress(contractId, 6, 6)}
          {isMain && ` · ${copy.main}`}
          {isCurrent && ` · ${copy.current}`}
        </p>
      </div>
      <IconButton
        aria-label={building.share}
        onClick={async () => {
          const copied = await copyText(shareUrl(contractId));
          toasts.show(copied ? { tone: "success", title: building.shared } : { tone: "error", title: building.shareFailed });
        }}
      >
        <Link2 className="size-4" aria-hidden="true" />
      </IconButton>
      {onRemove && (
        <IconButton aria-label={copy.removeLabel(typeof name.data === "string" ? name.data : shortenAddress(contractId))} onClick={onRemove}>
          <Trash2 className="size-4" aria-hidden="true" />
        </IconButton>
      )}
      {!isCurrent && (
        <Link href={openHref} className={buttonStyles({ variant: "soft", shape: "pill" })}>
          {copy.open}
        </Link>
      )}
    </li>
  );
}

/**
 * The buildings this browser knows: the one the site was built with and the ones the person saved. With no
 * server, the list lives in the browser and a building is added by its address or by the link it was shared with.
 */
export function BuildingsScreen() {
  const { buildings: copy } = appCopy;
  const { contractId, defaultId, saved, save, remove } = useBuilding();
  const router = useRouter();

  const [text, setText] = useState("");
  const [candidate, setCandidate] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>();
  const check = useBuildingName(candidate);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(undefined);
    const id = parseBuildingRef(text);
    if (!id) return setError(copy.notABuilding);
    if (id === defaultId || saved.includes(id)) return setError(copy.alreadySaved);

    setCandidate(id);
    const result = await check.refetch();
    // `refetch` answers for the candidate just set, but a stale answer for another address must not count.
    if (result.isError || !result.data) {
      setCandidate(null);
      return setError(copy.notFound);
    }
    save(id);
    setCandidate(null);
    setText("");
    toasts.show({ tone: "success", title: appCopy.building.untrusted.saved });
    router.push(withBuilding(appRoutes.overview, id));
  }

  const extra = saved.filter((id) => id !== defaultId);

  return (
    <div className="grid gap-8">
      <PageHeader title={copy.title} description={copy.description} />

      <Panel title={copy.title}>
        <ul className="divide-y divide-hairline">
          <BuildingRow contractId={defaultId} isCurrent={contractId === defaultId} isMain />
          {extra.map((id) => (
            <BuildingRow
              key={id}
              contractId={id}
              isCurrent={contractId === id}
              isMain={false}
              onRemove={() => {
                remove(id);
                toasts.show({ tone: "info", title: copy.removed });
              }}
            />
          ))}
        </ul>
      </Panel>

      <Card padding="lg">
        <h2 className="text-lg font-semibold tracking-tight text-ink">{copy.addTitle}</h2>
        <p className="mt-1 max-w-xl text-sm leading-relaxed text-pretty text-ink-soft">{copy.addBody}</p>
        <form onSubmit={(event) => void submit(event)} noValidate className="mt-5 grid gap-4 sm:max-w-xl">
          <FormField label={copy.addLabel} error={error}>
            {(control) => (
              <Input
                {...control}
                autoComplete="off"
                inputMode="url"
                placeholder={copy.addPlaceholder}
                value={text}
                onChange={(event) => setText(event.target.value)}
              />
            )}
          </FormField>
          <Button type="submit" size="md" shape="pill" disabled={check.isFetching} className="justify-self-start">
            <Plus className="size-4" aria-hidden="true" />
            {check.isFetching ? copy.adding : copy.addSubmit}
          </Button>
        </form>
        <p className="mt-5 max-w-xl text-xs leading-relaxed text-pretty text-ink-faint">{copy.privacy}</p>
      </Card>
    </div>
  );
}
