import type { PropsWithChildren } from "react";
import { CodeLineHandlers } from "../CodeLineHandlers";
import * as style from "./style.module.scss";

export const Article = ({ children }: PropsWithChildren) => (
	<article className={style.container}>
		{children}
		<CodeLineHandlers />
	</article>
);
