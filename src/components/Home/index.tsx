import packageJson from '../../../package.json';
import {pageListByUpdatedAt} from '../../util/pageList';
import {PageHead} from '../PageHead';
import {PageLinkUpdated} from '../PageLink';
import Introduction from './introduction.module.md';
import {className} from './style.module.css';

const {authorName} = packageJson;

export const Home = () => <>
    <PageHead
        title={authorName}
        description={`${authorName}について`}
        pathname=""
        author={authorName}
    />
    <main>
        <section>
            <h1 className={className.title}>{authorName}</h1>
            <Introduction/>
            <h2>最近の更新</h2>
            <ul>{pageListByUpdatedAt.slice(0, 3).map((page) => <PageLinkUpdated {...page} key={page.pathname}/>)}</ul>
        </section>
    </main>
</>;
