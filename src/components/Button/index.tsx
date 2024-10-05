import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  PropsWithChildren,
} from "react";
import { IconClass, classnames } from "../../util/classnames.ts";
import * as style from "./style.module.scss";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  state?: "active" | "focus" | "hover";
  icon?: string;
}

const Button = ({
  state,
  icon,
  children,
  ...props
}: PropsWithChildren<ButtonProps>) => (
  <button
    {...props}
    className={classnames(
      style.button,
      icon && style.icon,
      state && style[state],
      props.className,
    )}
  >
    {icon && <span className={classnames(IconClass, style.icon)}>{icon}</span>}
    <span>{children}</span>
  </button>
);

export const PrimaryButton = (props: PropsWithChildren<ButtonProps>) => (
  <Button {...props} className={classnames(style.primary, props.className)} />
);

export const SecondaryButton = (props: PropsWithChildren<ButtonProps>) => (
  <Button {...props} className={classnames(style.secondary, props.className)} />
);

export const TextButton = (props: PropsWithChildren<ButtonProps>) => (
  <Button {...props} className={classnames(style.text, props.className)} />
);

export const Buttons = (
  props: PropsWithChildren<HTMLAttributes<HTMLDivElement>>,
) => <div {...props} className={classnames(style.buttons, props.className)} />;
