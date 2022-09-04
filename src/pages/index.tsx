import Link from 'next/link';
import {HtmlHead} from '../components/site/HtmlHead';
import {PageLinkUpdated} from '../components/site/PageLink';
import {PageTitle} from '../components/site/PageTitle';
import {pageListByUpdatedAt} from '../../generated.pageList.mjs';
import {authorName} from '../../config.site.mjs';

export const Page = () => <>
    <HtmlHead pathname="" description={`${authorName}のWebサイトです。`}/>
    <main>
        <article>
            <PageTitle pathname="" onlyUpdate={true}/>
            <h2>最近の更新</h2>
            <ul>
                {pageListByUpdatedAt.slice(0, 4).map((page) => <li key={page.pathname}>
                    <PageLinkUpdated {...page}/>
                </li>)}
            </ul>
            <h2>管理者</h2>
            <ul>
                <li><Link href="/author"><a>伊藤 慶 - Kei Ito</a></Link></li>
            </ul>
        </article>
    </main>
</>;

export default Page;
