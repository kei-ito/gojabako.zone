import type { Root } from "hast";
import { insertArticleData } from "../util/rehype/insertArticleData.ts";
import { visitArticleA } from "../util/rehype/visitArticleA.ts";
import { visitArticleHeading } from "../util/rehype/visitArticleHeading.ts";
import { visitArticleImg } from "../util/rehype/visitArticleImg.ts";
import { visitArticleLi } from "../util/rehype/visitArticleLi.ts";
import { visitArticlePre } from "../util/rehype/visitArticlePre.ts";
import { visitArticleSpan } from "../util/rehype/visitArticleSpan.ts";
import { visitArticleSup } from "../util/rehype/visitArticleSup.ts";
import { visitArticleTable } from "../util/rehype/visitArticleTable.ts";
import { visitHastElement } from "../util/rehype/visitHastElement.ts";
import type { VFileLike } from "../util/unified.ts";

export const rehypeArticle = () => async (tree: Root, file: VFileLike) => {
	const tasks: Array<Promise<void>> = [];
	visitHastElement(tree, {
		span: visitArticleSpan(file, tasks),
		sup: visitArticleSup(file, tasks),
		li: visitArticleLi(file, tasks),
		h1: visitArticleHeading(file, tasks),
		h2: visitArticleHeading(file, tasks),
		h3: visitArticleHeading(file, tasks),
		h4: visitArticleHeading(file, tasks),
		h5: visitArticleHeading(file, tasks),
		h6: visitArticleHeading(file, tasks),
		pre: visitArticlePre(file, tasks),
		table: visitArticleTable(file, tasks),
		img: visitArticleImg(file, tasks),
		a: visitArticleA(file, tasks),
	});
	await Promise.all(tasks);
	insertArticleData(tree, file);
	return tree;
};
