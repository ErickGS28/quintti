import type { DetailsErrorCode } from "../types";

/** Why saving or reading an expense's details failed, in terms the API turns into a status code. */
export class DetailsError extends Error {
  constructor(
    readonly code: DetailsErrorCode,
    message: string,
    readonly field?: string,
  ) {
    super(message);
    this.name = "DetailsError";
  }
}

export const STATUS_BY_CODE: Record<DetailsErrorCode, number> = {
  "invalid-input": 400,
  "not-found": 404,
  "already-attached": 409,
  mismatch: 422,
  upstream: 502,
  "not-configured": 503,
};
