import type { ButtonHTMLAttributes } from "react";

import { classNames } from "@/lib/ui/class-names";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Required: an icon alone says nothing to a screen reader. */
  "aria-label": string;
};

/** A round button that holds only an icon. 44 px, so it is easy to hit on a phone. */
export function IconButton({ className, type = "button", ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      className={classNames(
        "inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink-soft transition-colors duration-200 hover:bg-royal-soft hover:text-royal disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...rest}
    />
  );
}
