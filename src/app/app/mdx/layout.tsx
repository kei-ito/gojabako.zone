import type { PropsWithChildren } from 'react';
import { Article } from '../../../components/Article';
import { ElementInspector } from '../../../components/ElementInspector';

export default function Layout({ children }: PropsWithChildren) {
  return (
    <Article>
      {children}
      <ElementInspector />
    </Article>
  );
}
