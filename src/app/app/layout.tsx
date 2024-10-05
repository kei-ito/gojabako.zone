import type { PropsWithChildren } from "react";
import { SiteLayout } from "../../components/SiteLayout";

export default function Layout({ children }: PropsWithChildren) {
	return <SiteLayout fullWidth>{children}</SiteLayout>;
}
