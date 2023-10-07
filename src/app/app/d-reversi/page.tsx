import type { Metadata } from 'next';
import { Article } from '../../../components/Article';
import { DistributedReversi } from '../../../components/DistributedReversi';
import Readme from './readme.mdx';
import * as style from './style.module.scss';

export const metadata: Metadata = {
  title: '分散型リバーシ',
  description: 'マス目同士の通信でゲームが進行するリバーシです。',
  keywords: ['リバーシ', 'オセロ', 'ゲーム'],
};

export default function Page() {
  return (
    <main>
      <DistributedReversi className={style.game} />
      <Article>
        <Readme />
      </Article>
    </main>
  );
}
