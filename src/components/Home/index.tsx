import Link from 'next/link';
import packageJson from '../../../package.json';
import {DateString} from '../DateString';
import {PageHead} from '../PageHead';
import type {PageData} from '../../util/pageList';
import {pageListByPublishedAt, pageListByUpdatedAt} from '../../util/pageList';
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
            <p>ここは決まったら書きます。</p>
            <ul>
                {pageListByPublishedAt.map((page) => <Published {...page} key={page.pathname}/>)}
            </ul>
        </section>
        <section>
            <h2>最近の更新</h2>
            <ul>
                {pageListByUpdatedAt.slice(0, 5).map((page) => <Updated {...page} key={page.pathname}/>)}
            </ul>
        </section>
    </main>
</>;

const Published = ({pathname, title, publishedAt, updatedAt}: PageData) => <li className={className.post}>
    <Link href={pathname}>
        <a className={className.link}>
            <span className={className.time}>
                <DateString date={publishedAt}/>
                {publishedAt < updatedAt && <>（<DateString date={updatedAt}/>更新）</>}
            </span>
            {title}
        </a>
    </Link>
</li>;

const Updated = ({pathname, title, publishedAt, updatedAt}: PageData) => <li className={className.post}>
    <Link href={pathname}>
        <a className={className.link}>
            <span className={className.time}>
                <DateString date={updatedAt}/>更新
                {publishedAt < updatedAt && <>（<DateString date={publishedAt}/>公開）</>}
            </span>
            {title}
        </a>
    </Link>
</li>;
