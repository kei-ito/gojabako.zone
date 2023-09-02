import { transformMdx } from './transformMdx.mjs';
/** @param {string} source */
export default function MDXPage(source) {
  return `
    export default function Page() {
        return (<pre>{${transformMdx(source)}}</pre>);
    }
    `;
}
