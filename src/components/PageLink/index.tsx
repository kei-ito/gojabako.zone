import { isString } from "@nlib/typing";
import Link from "next/link";
import type { PropsWithChildren } from "react";
import type { PageData } from "../../util/type.ts";
import * as style from "./style.module.scss";

interface PageLinkProps {
	page: PageData;
	showUpdatedAt?: boolean;
	showDescription?: boolean;
}

export const PageLink = ({
	page,
	showUpdatedAt,
	showDescription,
}: PageLinkProps) => {
	let { publishedAt } = page;
	if (isString(page.other?.originalPublishedAt)) {
		publishedAt = page.other?.originalPublishedAt;
	}
	return (
		<>
			<Link href={page.path} className={style.container}>
				<span>{page.title}</span>{" "}
				{showUpdatedAt && (
					<>
						<PageDate dateTime={page.updatedAt}>更新</PageDate>{" "}
					</>
				)}
				<PageDate dateTime={publishedAt}>公開</PageDate>
				{showDescription && page.description && (
					<>
						<br />
						<span className={style.description}>{page.description}</span>
					</>
				)}
			</Link>
		</>
	);
};

const PageDate = ({
	dateTime,
	children,
}: PropsWithChildren<{ dateTime: string }>) => {
	const date = new Date(dateTime);
	const dateString = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
	return (
		<time className={style.time} dateTime={date.toISOString()}>
			{dateString}
			{children}
		</time>
	);
};
