import { identiconFor } from "@/lib/format/identicon";
import { classNames } from "@/lib/ui/class-names";

type AvatarProps = {
  /** The Stellar address the avatar stands for. The same address always gets the same colors. */
  address: string;
  /** Size comes from the caller, for example "size-9". */
  className?: string;
};

/** A small gradient disc that tells addresses apart at a glance. Decorative: the address is shown as text too. */
export function Avatar({ address, className = "size-9" }: AvatarProps) {
  const { from, to, angle } = identiconFor(address);
  return (
    <span
      aria-hidden="true"
      className={classNames("inline-block shrink-0 rounded-full ring-2 ring-cloud", className)}
      style={{ background: `linear-gradient(${angle}deg, hsl(${from} 62% 64%), hsl(${to} 70% 52%))` }}
    />
  );
}
