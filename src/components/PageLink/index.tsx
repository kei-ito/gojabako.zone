import { isString } from "@nlib/typing";
import Link from "next/link";
import type { PageData } from "../../util/type.mts";
import * as style from "./style.module.scss";

interface PageLinkProps {
  page: PageData;
  showDescription?: boolean;
}

export const PageLink = ({ page, showDescription }: PageLinkProps) => {
  const d = new Date(page.publishedAt);
  const originalPublishedAt = page.other?.originalPublishedAt;
  if (isString(originalPublishedAt)) {
    d.setTime(Date.parse(originalPublishedAt));
  }
  const date = `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
  return (
    <>
      <Link href={page.path} className={style.container}>
        <span>{page.title}</span>{" "}
        <span className={style.time}>
          <time dateTime={d.toISOString()}>{date}</time>
          公開
        </span>
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
