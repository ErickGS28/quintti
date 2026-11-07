import { classNames } from "@/lib/ui/class-names";

export type ButtonVariant = "primary" | "soft" | "accent" | "ghost";
export type ButtonSize = "md" | "lg";
/** "pill" is for buttons that sit inside a rounded navigation bar or the hero. */
export type ButtonShape = "control" | "pill";

const BASE =
  "inline-flex cursor-pointer items-center justify-center gap-2 font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-royal text-on-royal hover:bg-royal-strong",
  soft: "bg-royal-soft text-royal hover:bg-periwinkle-soft",
  accent: "bg-coral text-on-coral hover:bg-coral/85",
  ghost: "text-ink-soft hover:bg-hairline hover:text-ink",
};

const SIZES: Record<ButtonSize, string> = {
  md: "min-h-11 px-5 text-[0.9375rem]",
  lg: "min-h-13 px-7 text-base",
};

const SHAPES: Record<ButtonShape, string> = {
  control: "rounded-control",
  pill: "rounded-full",
};

type StyleOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  fullWidth?: boolean;
  className?: string;
};

export function buttonStyles({
  variant = "primary",
  size = "md",
  shape = "control",
  fullWidth,
  className,
}: StyleOptions): string {
  return classNames(BASE, VARIANTS[variant], SIZES[size], SHAPES[shape], fullWidth && "w-full", className);
}
