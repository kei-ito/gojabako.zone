import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
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
  if (path.length === 0) {
    redirect('/stories/Button');
  }
  return <Storybook path={path} />;
}
