import type { HTMLAttributes } from "react";

import { classNames } from "@/lib/ui/class-names";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  padding?: "none" | "md" | "lg";
  /**
   * "solid" is the white surface and restores the light text colors, so it works on any chapter.
   * "glass" is frosted glass for dark chapters and keeps the chapter's text colors.
   * "frost" is frosted white for light, colored chapters.
   */
  surface?: "solid" | "glass" | "frost";
};

const PADDING = {
  none: "",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
};

const SURFACES = {
  solid: "card-solid bg-cloud shadow-card",
  glass: "card-glass",
  frost: "card-frost",
};

/** The one surface of the app: soft depth, large corners, no border. */
export function Card({ padding = "md", surface = "solid", className, ...rest }: CardProps) {
  return <div className={classNames("rounded-card", SURFACES[surface], PADDING[padding], className)} {...rest} />;
}
