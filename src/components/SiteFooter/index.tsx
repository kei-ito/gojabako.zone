import Link from "next/link";
import type { FC, HTMLAttributes } from "react";
import IconGitHub from "../../svg/fa-6.6.0/brands/github.svg";
import IconXTwitter from "../../svg/fa-6.6.0/brands/x-twitter.svg";
import IconRss from "../../svg/rss.svg";
import { classnames } from "../../util/classnames.ts";
import { site } from "../../util/site.ts";
import { SiteMap } from "../SiteMap";
import * as style from "./style.module.scss";

const links: Array<[FC, string]> = [
	[IconRss, "/feed.atom"],
	[IconGitHub, "https://github.com/gjbkz"],
	[IconXTwitter, "https://x.com/gjbkz"],
];

export const SiteFooter = (props: HTMLAttributes<HTMLElement>) => (
	<footer {...props} className={classnames(style.container, props.className)}>
		<section>
			<SiteMap />
		</section>
		<section className={style.author}>
			<div>
				© 2013- <Link href="/author">{site.author.name}</Link>
				<div className={style.links}>
					{links.map(([Icon, href]) => (
						<Link key={href} href={href} target="_blank">
							<Icon />
						</Link>
					))}
				</div>
			</div>
		</section>
	</footer>
);
