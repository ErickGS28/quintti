"use client";

import { useState } from "react";

import { Button } from "@/components/atoms/Button";
import { Spinner } from "@/components/atoms/Spinner";
import { appCopy } from "@/copy/app.es";
import { describeAnyError } from "@/copy/errors.es";

import { useGovernanceActions } from "../hooks/use-governance-actions";
import { announce } from "./governance-feedback";

/** Removes a vendor from the approved list, after asking once more. Signed by the assembly. */
export function RemoveVendorButton({ vendor }: { vendor: string }) {
  const { vendors: copy } = appCopy;
  const { setVendor } = useGovernanceActions();
  const [confirming, setConfirming] = useState(false);

  if (setVendor.isPending) return <Spinner className="size-5 text-royal" label={appCopy.tx.pending} />;

  if (setVendor.isError) {
    return (
      <p role="alert" className="max-w-56 text-right text-xs text-wine">
        {describeAnyError(setVendor.error)}
      </p>
    );
  }

  if (!confirming) {
    return (
      <Button variant="ghost" onClick={() => setConfirming(true)}>
        {copy.remove}
      </Button>
    );
  }

  return (
    <div className="flex gap-1">
      <Button
        variant="accent"
        onClick={() => setVendor.mutate({ vendor, allowed: false }, { onSuccess: announce(copy.removed) })}
      >
        {copy.removeConfirm}
      </Button>
      <Button variant="ghost" onClick={() => setConfirming(false)}>
        {appCopy.detail.keep}
      </Button>
    </div>
  );
}
