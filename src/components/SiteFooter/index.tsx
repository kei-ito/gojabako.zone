import Link from "next/link";
import type { FC, HTMLAttributes } from "react";
import IconGitHub from "../../svg/fa-6.6.0/brands/github.svg";
import IconXTwitter from "../../svg/fa-6.6.0/brands/x-twitter.svg";
import IconRss from "../../svg/rss.svg";
import { classnames } from "../../util/classnames.ts";
import { site } from "../../util/site.ts";
import { SiteMap } from "../SiteMap";
import * as style from "./style.module.scss";

const links: Array<{ Icon: FC; href: string; title: string }> = [
	{ Icon: IconRss, href: "/feed.atom", title: "更新情報 (Atom)" },
	{
		Icon: IconGitHub,
		href: "https://github.com/gjbkz",
		title: "GitHub @gjbkz",
	},
	{
		Icon: IconXTwitter,
		href: "https://x.com/gjbkz",
		title: "Twitter/X @gjbkz",
	},
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
					{links.map(({ Icon, href, title }) => (
						<Link key={href} href={href} title={title} target="_blank">
							<Icon />
						</Link>
					))}
				</div>
			</div>
		</section>
	</footer>
);
