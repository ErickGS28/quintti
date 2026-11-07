"use client";

import { UserCog } from "lucide-react";
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

/** Replaces the administrator, signed by the assembly. */
export function AdministratorForm() {
  const { council: copy } = appCopy;
  const { setAdministrator } = useGovernanceActions();
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string>();

  function submit(event: FormEvent) {
    event.preventDefault();
    try {
      const administrator = validateAddress(address, "administrator");
      setError(undefined);
      setAdministrator.mutate(administrator, { onSuccess: announce(copy.adminSaved) });
    } catch (failure) {
      setError(describeAnyError(failure));
    }
  }

  const feedback = governanceFeedback(setAdministrator, copy.adminSaved);

  return (
    <form onSubmit={submit} noValidate className="grid gap-5">
      <FormField label={copy.adminAddress} error={error}>
        {(control) => (
          <Input
            {...control}
            autoComplete="off"
            spellCheck={false}
            className="font-mono"
            placeholder="G…"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
          />
        )}
      </FormField>
      {feedback && <TxFeedback state={feedback} />}
      <Button type="submit" disabled={setAdministrator.isPending}>
        <UserCog className="size-4" aria-hidden="true" />
        {copy.adminSubmit}
      </Button>
    </form>
  );
}
