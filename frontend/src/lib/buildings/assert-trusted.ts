import { AppError } from "@/lib/errors/app-error";

/**
 * Stops a write on a building the person has not saved. The screens already hide the buttons that sign, so
 * this is the second lock: whatever reaches a write, it does not reach the wallet.
 *
 * Errors: `AppError` of kind `untrusted-building`.
 */
export function assertTrusted(building: { trusted: boolean }): void {
  if (!building.trusted) {
    throw new AppError("untrusted-building", "The building was opened from a link and has not been saved");
  }
}