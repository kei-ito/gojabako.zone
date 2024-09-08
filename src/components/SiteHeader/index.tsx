import Link from "next/link";
import type { HTMLAttributes } from "react";
import { classnames } from "../../util/classnames.mts";
import { site } from "../../util/site.mts";
import { Logo } from "../Logo";
import * as style from "./style.module.scss";

export interface SiteHeaderProps extends HTMLAttributes<HTMLElement> {
  fullWidth?: boolean;
}

export const SiteHeader = ({ fullWidth, ...props }: SiteHeaderProps) => (
  <header
    {...props}
    className={classnames(
      style.container,
      fullWidth && style.full,
      props.className,
    )}
  >
    <Link href="/">
      <Logo className={style.logo} />
      <span>{site.name}</span>
    </Link>
    <Link href="/author">
      <span>Kei Ito</span>
    </Link>
  </header>
);
