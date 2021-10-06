import {PageHead} from '../components/PageHead';
import {authorName} from '../util/constants';
import Body from './index.module.md';

const Home = () => <>
    <PageHead
        title={authorName}
        description={`${authorName}について`}
        pathname=""
        author={authorName}
    />
    <main>
        <article>
            <section>
                <Body/>
            </section>
        </article>
    </main>
</>;

export default Home;
