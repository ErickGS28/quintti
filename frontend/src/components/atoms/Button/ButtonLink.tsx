import type { AnchorHTMLAttributes } from "react";

import { buttonStyles, type ButtonShape, type ButtonSize, type ButtonVariant } from "./button-styles";

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  fullWidth?: boolean;
};

/** A link that looks like a button. Use it for navigation; use `Button` for actions. */
export function ButtonLink({ variant, size, shape, fullWidth, className, ...rest }: ButtonLinkProps) {
  return <a className={buttonStyles({ variant, size, shape, fullWidth, className })} {...rest} />;
}
