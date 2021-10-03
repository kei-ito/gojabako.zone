import Link from 'next/link';
import {PageHead} from '../components/PageHead';
import {authorName} from '../util/constants';

const Home = () => <>
    <PageHead
        title={authorName}
        description={`${authorName}について`}
        pathname=""
        author={authorName}
    />
    <main>
        <section>
            <p><Link href="/markdown"><a>markdown</a></Link></p>
        </section>
    </main>
</>;

export default Home;
