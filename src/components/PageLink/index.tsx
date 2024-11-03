import { isString } from "@nlib/typing";
import Link from "next/link";
import type { PropsWithChildren } from "react";
import type { PageData } from "../../util/type.ts";
import * as style from "./style.module.scss";

interface PageLinkProps {
	page: PageData;
	showDescription?: boolean;
}

export const PageLink = ({ page, showDescription }: PageLinkProps) => {
	let { publishedAt } = page;
	if (isString(page.other?.originalPublishedAt)) {
		publishedAt = page.other?.originalPublishedAt;
	}
	const isUpdated =
		getDateString(page.publishedAt) !== getDateString(page.updatedAt);
	return (
		<>
			<Link href={page.path} className={style.container}>
				<span>{page.title}</span>
				<PageDate dateTime={publishedAt}>公開</PageDate>
				{isUpdated && (
					<PageDate dateTime={page.updatedAt} bracket>
						更新
					</PageDate>
				)}
				{showDescription && page.description && (
						<span className={style.description}>{page.description}</span>
				)}
			</Link>
		</>
	);
};

interface PageDateProps {
	dateTime: string;
	bracket?: boolean;
}

const PageDate = ({
	dateTime,
	bracket = false,
	children,
}: PropsWithChildren<PageDateProps>) => {
	const date = new Date(dateTime);
	return (
		<time
			className={style.time}
			dateTime={date.toISOString()}
			title={getJstString(date)}
		>
			{bracket && "("}
			{getDateString(dateTime)}
			{children}
			{bracket && ")"}
		</time>
	);
};

const getDateString = (dateTime: string | Date) => {
	const date = new Date(dateTime);
	return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
};

const getJstString = (date: Date) => {
	return `${date.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })} JST`;
};
