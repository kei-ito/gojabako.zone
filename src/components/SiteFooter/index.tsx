import Link from "next/link";
import type { HTMLAttributes } from "react";
import { classnames } from "../../util/classnames.ts";
import { site } from "../../util/site.ts";
import { SiteMap } from "../SiteMap";
import * as style from "./style.module.scss";

export const SiteFooter = (props: HTMLAttributes<HTMLElement>) => (
	<footer {...props} className={classnames(style.container, props.className)}>
		<section>
			<SiteMap />
		</section>
		<section>
			<div>
				© 2013- <Link href="/author">{site.author.name}</Link>
			</div>
		</section>
	</footer>
);
