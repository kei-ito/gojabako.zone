import type { PropsWithChildren } from 'react';
import { Article } from '../../components/Article';

export default function Template({ children }: PropsWithChildren) {
  return <Article>{children}</Article>;
}
