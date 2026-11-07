import type { HTMLAttributes } from "react";

import { classNames } from "@/lib/ui/class-names";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  padding?: "none" | "md" | "lg";
};

const PADDING = {
  none: "",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
};

/** The one surface of the app: soft shadow, large corners, no border. */
export function Card({ padding = "md", className, ...rest }: CardProps) {
  return <div className={classNames("rounded-card bg-cloud shadow-card", PADDING[padding], className)} {...rest} />;
}
