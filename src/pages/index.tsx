import {authorName} from '../../packages/site/constants';
import {PageDate} from '../components/PageDate';
import {PageHead} from '../components/PageHead';
import Introduction from './introduction.module.md';

export const Page = () => <>
    <PageHead
        title={authorName}
        description={`${authorName}について`}
        pathname=""
    />
    <main>
        <article>
            <header>
                <h1>{authorName}</h1>
                <PageDate pathname="/" onlyUpdate={true}/>
            </header>
            <Introduction/>
        </article>
    </main>
</>;

export default Page;
