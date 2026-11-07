"use client";

import { Save } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { FormField } from "@/components/molecules/FormField";
import { TxFeedback } from "@/components/molecules/TxFeedback";
import { appCopy } from "@/copy/app.es";
import { describeAnyError } from "@/copy/errors.es";
import { parseAmount } from "@/lib/format/amount";
import { tokenDecimals, tokenSymbol } from "@/lib/format/token";
import { validateCategory } from "@/lib/treasury/input";

import { useGovernanceActions } from "../hooks/use-governance-actions";
import { announce, governanceFeedback } from "./governance-feedback";

type BudgetLineFormProps = {
  /** Starts the form on an existing category, to change its limit. */
  category?: string;
};

/** Creates a budget line or changes its limit, signed by the assembly. */
export function BudgetLineForm({ category: initialCategory = "" }: BudgetLineFormProps) {
  const { budget: copy } = appCopy;
  const { setBudget } = useGovernanceActions();
  const [category, setCategory] = useState(initialCategory);
  const [limitText, setLimitText] = useState("");
  const [errors, setErrors] = useState<{ category?: string; limit?: string }>({});

  function submit(event: FormEvent) {
    event.preventDefault();
    const found: typeof errors = {};
    let limit = 0n;
    try {
      validateCategory(category);
    } catch (error) {
      found.category = describeAnyError(error);
    }
    try {
      limit = parseAmount(limitText, tokenDecimals());
      if (limit <= 0n) found.limit = appCopy.propose.amountHint;
    } catch {
      found.limit = appCopy.propose.amountHint;
    }
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setBudget.mutate({ category: category.trim(), limit }, { onSuccess: announce(copy.saved) });
  }

  const feedback = governanceFeedback(setBudget, copy.saved);

  return (
    <form onSubmit={submit} noValidate className="grid gap-5">
      <FormField label={copy.category} error={errors.category} hint={copy.categoryHint}>
        {(control) => (
          <Input
            {...control}
            autoComplete="off"
            spellCheck={false}
            placeholder="mantenimiento"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          />
        )}
      </FormField>
      <FormField label={copy.newLimit} error={errors.limit}>
        {(control) => (
          <Input
            {...control}
            inputMode="decimal"
            autoComplete="off"
            placeholder="0"
            suffix={tokenSymbol()}
            value={limitText}
            onChange={(event) => setLimitText(event.target.value)}
          />
        )}
      </FormField>
      {feedback && <TxFeedback state={feedback} />}
      <Button type="submit" disabled={setBudget.isPending}>
        <Save className="size-4" aria-hidden="true" />
        {copy.submit}
      </Button>
    </form>
  );
}
