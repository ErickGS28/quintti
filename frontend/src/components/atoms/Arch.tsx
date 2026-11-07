import { classNames } from "@/lib/ui/class-names";

type ArchProps = {
  /** "light" is a doorway filled with light, "line" its outline only, "beam" the glow on its floor. */
  variant: "light" | "line" | "beam";
  /** Size and position come from the caller, for example "left-1/2 h-[40rem] w-[26rem]". */
  className: string;
};

const VARIANTS = {
  light: "arch arch-light",
  line: "arch arch-line",
  beam: "arch arch-beam",
};

/**
 * One arch of light, the motif taken from the palette's reference image: a tall rounded doorway lit
 * from below. Decorative only; the caller places it inside a positioned parent.
 */
export function Arch({ variant, className }: ArchProps) {
  return <span aria-hidden="true" className={classNames("pointer-events-none", VARIANTS[variant], className)} />;
}
