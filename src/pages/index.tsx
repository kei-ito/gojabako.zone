import {PageHead} from '../components/PageHead';
import packageJson from '../../package.json';
import Body from './index.module.md';

const {authorName} = packageJson;

const Home = () => <>
    <PageHead
        title={authorName}
        description={`${authorName}について`}
        pathname=""
        author={authorName}
    />
    <main>
        <article>
            <Body/>
        </article>
    </main>
</>;

export default Home;
