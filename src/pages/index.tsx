import Link from 'next/link';
import {authorName, siteName} from '../../packages/site/constants';
import {PageData} from '../components/PageData';
import {PageHead} from '../components/PageHead';
import {PageLinkPublished} from '../components/PageLink';
import {pageListByUpdatedAt} from '../pageList';

export const Page = () => <>
    <PageHead
        title={siteName}
        description={`${authorName}のWebサイトです。`}
        pathname=""
    />
    <main>
        <article>
            <header>
                <h1>{siteName}</h1>
                <PageData pathname="" onlyUpdate={true}/>
            </header>
            <h2>最近の更新</h2>
            <ul>{pageListByUpdatedAt.slice(0, 4).map((page) => <li key={page.pathname}><PageLinkPublished {...page}/></li>)}</ul>
            <h2>管理者</h2>
            <p><Link href="./author"><a>伊藤 慶 - Kei Ito</a></Link></p>
        </article>
    </main>
</>;

export default Page;
