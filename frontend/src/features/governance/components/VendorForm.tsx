"use client";

import { UserPlus } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { FormField } from "@/components/molecules/FormField";
import { TxFeedback } from "@/components/molecules/TxFeedback";
import { appCopy } from "@/copy/app.es";
import { describeAnyError } from "@/copy/errors.es";
import { validateAddress } from "@/lib/treasury/input";

import { useGovernanceActions } from "../hooks/use-governance-actions";
import { announce, governanceFeedback } from "./governance-feedback";

/** Approves a vendor's address, signed by the assembly. */
export function VendorForm() {
  const { vendors: copy } = appCopy;
  const { setVendor } = useGovernanceActions();
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string>();

  function submit(event: FormEvent) {
    event.preventDefault();
    try {
      const vendor = validateAddress(address, "vendor");
      setError(undefined);
      setVendor.mutate(
        { vendor, allowed: true },
        {
          onSuccess: (receipt) => {
            announce(copy.added)(receipt);
            setAddress("");
          },
        },
      );
    } catch (failure) {
      setError(describeAnyError(failure));
    }
  }

  const feedback = governanceFeedback(setVendor, copy.added);

  return (
    <form onSubmit={submit} noValidate className="grid gap-5">
      <FormField label={copy.address} error={error}>
        {(control) => (
          <Input
            {...control}
            autoComplete="off"
            spellCheck={false}
            className="font-mono"
            placeholder={copy.addressPlaceholder}
            value={address}
            onChange={(event) => setAddress(event.target.value)}
          />
        )}
      </FormField>
      {feedback && <TxFeedback state={feedback} />}
      <Button type="submit" disabled={setVendor.isPending}>
        <UserPlus className="size-4" aria-hidden="true" />
        {copy.submit}
      </Button>
    </form>
  );
}
