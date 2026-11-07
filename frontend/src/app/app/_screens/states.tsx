"use client";

import { Card } from "@/components/atoms/Card";
import { Skeleton } from "@/components/atoms/Skeleton";
import { ErrorState } from "@/components/molecules/ErrorState";
import { appCopy } from "@/copy/app.es";
import { describeAnyError } from "@/copy/errors.es";

/** The shape of a screen while the contract is read, so nothing jumps when the data arrives. */
export function ScreenSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <div aria-busy="true" className="grid gap-6">
      <div className="grid gap-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-9 w-72 max-w-full" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={index} padding="md" className="grid gap-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-32" />
          </Card>
        ))}
      </div>
      {Array.from({ length: rows }, (_, index) => (
        <Card key={index} padding="lg" className="grid gap-4">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-2/3" />
        </Card>
      ))}
    </div>
  );
}

/** The contract could not be read: say why in plain words and offer to try again. */
export function ReadError({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  return (
    <Card padding="lg">
      <ErrorState
        title={appCopy.states.readError}
        message={describeAnyError(error)}
        retry={{ label: appCopy.states.retry, onRetry }}
      />
    </Card>
  );
}
