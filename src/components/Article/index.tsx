import type { PropsWithChildren } from "react";
import { ArticleHandlers } from "./Handlers";
import * as style from "./style.module.scss";

export const Article = ({ children }: PropsWithChildren) => (
	<article className={style.container}>
		{children}
		<ArticleHandlers />
	</article>
);
