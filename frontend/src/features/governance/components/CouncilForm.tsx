"use client";

import { UsersRound } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Textarea } from "@/components/atoms/Textarea";
import { FormField } from "@/components/molecules/FormField";
import { TxFeedback } from "@/components/molecules/TxFeedback";
import { appCopy } from "@/copy/app.es";
import { describeAnyError } from "@/copy/errors.es";
import { validateAddress, validateWholeNumber } from "@/lib/treasury/input";

import { useGovernanceActions } from "../hooks/use-governance-actions";
import { announce, governanceFeedback } from "./governance-feedback";

type CouncilFormProps = {
  council: readonly string[];
  threshold: number;
};

/** Replaces the council and the number of approvals needed, signed by the assembly. */
export function CouncilForm({ council, threshold: currentThreshold }: CouncilFormProps) {
  const { council: copy } = appCopy;
  const { rotateCouncil } = useGovernanceActions();
  const [members, setMembers] = useState(council.join("\n"));
  const [threshold, setThreshold] = useState(String(currentThreshold));
  const [errors, setErrors] = useState<{ members?: string; threshold?: string }>({});

  function submit(event: FormEvent) {
    event.preventDefault();
    const found: typeof errors = {};
    const addresses = members
      .split(/\s+/)
      .map((line) => line.trim())
      .filter(Boolean);
    try {
      addresses.forEach((address) => validateAddress(address, "council"));
    } catch (error) {
      found.members = describeAnyError(error);
    }
    let required = 0;
    try {
      required = validateWholeNumber(Number(threshold), "threshold");
    } catch (error) {
      found.threshold = describeAnyError(error);
    }
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    rotateCouncil.mutate({ council: addresses, threshold: required }, { onSuccess: announce(copy.councilSaved) });
  }

  const feedback = governanceFeedback(rotateCouncil, copy.councilSaved);

  return (
    <form onSubmit={submit} noValidate className="grid gap-5">
      <FormField label={copy.councilMembers} error={errors.members} hint={copy.councilFormBody}>
        {(control) => (
          <Textarea
            {...control}
            rows={4}
            spellCheck={false}
            className="font-mono text-sm"
            value={members}
            onChange={(event) => setMembers(event.target.value)}
          />
        )}
      </FormField>
      <FormField label={copy.threshold} error={errors.threshold}>
        {(control) => (
          <Input
            {...control}
            type="number"
            min={1}
            max={7}
            inputMode="numeric"
            className="max-w-32"
            value={threshold}
            onChange={(event) => setThreshold(event.target.value)}
          />
        )}
      </FormField>
      {feedback && <TxFeedback state={feedback} />}
      <Button type="submit" disabled={rotateCouncil.isPending}>
        <UsersRound className="size-4" aria-hidden="true" />
        {copy.councilSubmit}
      </Button>
    </form>
  );
}
