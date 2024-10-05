import type { PropsWithChildren } from "react";
import { SiteFooter } from "../SiteFooter";
import type { SiteHeaderProps } from "../SiteHeader";
import { SiteHeader } from "../SiteHeader";

interface SiteLayoutProps extends SiteHeaderProps {}

export const SiteLayout = (props: PropsWithChildren<SiteLayoutProps>) => (
	<>
		<SiteHeader fullWidth={props.fullWidth} />
		{props.children}
		<SiteFooter />
	</>
);
