import type { Root } from 'hast';
import type { VFileLike } from '../util/unified.mts';
import { insertArticleData } from './insertArticleData.mts';
import { visitArticleA } from './visitArticleA.mts';
import { visitArticleDiv } from './visitArticleDiv.mts';
import { visitArticleHeading } from './visitArticleHeading.mts';
import { visitArticleImg } from './visitArticleImg.mts';
import { visitArticleLi } from './visitArticleLi.mts';
import { visitArticlePre } from './visitArticlePre.mts';
import { visitArticleSpan } from './visitArticleSpan.mts';
import { visitArticleSup } from './visitArticleSup.mts';
import { visitArticleTable } from './visitArticleTable.mts';
import { visitHastElement } from './visitHastElement.mts';

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
