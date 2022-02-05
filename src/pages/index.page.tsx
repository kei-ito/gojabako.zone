import {authorName} from '../../packages/site/constants';
import {PageDate} from '../components/PageDate';
import {PageHead} from '../components/PageHead';
import {PageLinkUpdated} from '../components/PageLink';
import {pageListByUpdatedAt} from '../pageList';
import Introduction from './introduction.module.md';

export const Page = () => <>
    <PageHead
        title={authorName}
        description={`${authorName}について`}
        pathname=""
        author={authorName}
    />
    <main>
        <article>
            <header>
                <h1>{authorName}</h1>
                <PageDate pathname="/" onlyUpdate={true}/>
            </header>
            <h2>最近の更新</h2>
            <ul>{pageListByUpdatedAt.slice(0, 3).map((page) => <PageLinkUpdated {...page} key={page.pathname}/>)}</ul>
            <Introduction/>
        </article>
    </main>
</>;

export default Page;
