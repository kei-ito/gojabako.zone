import type { PropsWithChildren } from "react";
import { CodeLineHandlers } from "../CodeLineHandlers";
import * as css from "./style.module.css";

export const Article = ({ children }: PropsWithChildren) => (
	<article className={css.container}>
		{children}
		<CodeLineHandlers />
	</article>
);
