import type { Root } from 'hast';
import { insertArticleData } from '../util/rehype/insertArticleData.mts';
import { visitArticleA } from '../util/rehype/visitArticleA.mts';
import { visitArticleDiv } from '../util/rehype/visitArticleDiv.mts';
import { visitArticleHeading } from '../util/rehype/visitArticleHeading.mts';
import { visitArticleImg } from '../util/rehype/visitArticleImg.mts';
import { visitArticleLi } from '../util/rehype/visitArticleLi.mts';
import { visitArticlePre } from '../util/rehype/visitArticlePre.mts';
import { visitArticleSpan } from '../util/rehype/visitArticleSpan.mts';
import { visitArticleSup } from '../util/rehype/visitArticleSup.mts';
import { visitArticleTable } from '../util/rehype/visitArticleTable.mts';
import { visitHastElement } from '../util/rehype/visitHastElement.mts';
import type { VFileLike } from '../util/unified.mts';

export const rehypeArticle = () => async (tree: Root, file: VFileLike) => {
  const tasks: Array<Promise<void>> = [];
  visitHastElement(tree, {
    div: visitArticleDiv(file, tasks),
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
