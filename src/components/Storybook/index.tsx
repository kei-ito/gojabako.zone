import * as all from './all.mts';
import { StorybookNav } from './Nav';
import * as style from './style.module.scss';
import { StorybookView } from './View';

interface StorybookProps {
  path: Array<string>;
}

export const Storybook = ({ path }: StorybookProps) => (
  <div className={style.container}>
    <StorybookNav path={path} />
    <Body path={path} />
  </div>
);

const Body = ({ path }: StorybookProps) => {
  const story = useStory(path);
  return (
    <section className={style.body}>
      {!story && <p>Story not found</p>}
      {story && <StorybookView story={story} />}
    </section>
  );
};

const useStory = (path: Array<string>) => {
  const groupName = path.slice(0, -1).join('_');
  if (isStoryGroupName(groupName)) {
    // eslint-disable-next-line import/namespace
    const group = all[groupName];
    const storyName = path[path.length - 1];
    return group[storyName as keyof typeof group];
  }
  return null;
};

type AllStories = typeof all;
export type StoryGroup = keyof AllStories;

export const isStoryGroupName = (value: string): value is StoryGroup =>
  value in all;
