import type { PropsWithChildren } from 'react';
import { Article } from '../../components/Article';

export default function Layout({ children }: PropsWithChildren) {
  return (
    <main>
      <Article>{children}</Article>
    </main>
  );
}
