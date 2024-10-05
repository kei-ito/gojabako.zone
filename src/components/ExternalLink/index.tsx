import Link from "next/link";
import type { HTMLAttributes, PropsWithChildren } from "react";
import { IconClass } from "../../util/classnames.ts";

interface ExternalLinkProps
	extends Omit<HTMLAttributes<HTMLAnchorElement>, "target"> {
	href: string;
}

export const ExternalLink = ({
	children,
	...props
}: PropsWithChildren<ExternalLinkProps>) => (
	<Link {...props} target="_blank">
		{children}
		<span className={IconClass}>north_east</span>
	</Link>
);
