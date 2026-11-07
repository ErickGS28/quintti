import type { ButtonHTMLAttributes } from "react";

import { buttonStyles, type ButtonShape, type ButtonSize, type ButtonVariant } from "./button-styles";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  fullWidth?: boolean;
};

export function Button({ variant, size, shape, fullWidth, className, type = "button", ...rest }: ButtonProps) {
  return <button type={type} className={buttonStyles({ variant, size, shape, fullWidth, className })} {...rest} />;
}
