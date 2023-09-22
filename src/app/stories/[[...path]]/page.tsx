import type { Metadata } from 'next';
import { Storybook } from '../../../components/Storybook';

export const metadata: Metadata = {
  title: 'Components',
};

interface PageProps {
  params: {
    path?: Array<string>;
  };
  searchParams: object;
}

export default function Page({ params: { path = [] } }: PageProps) {
  return <Storybook path={path} />;
}
