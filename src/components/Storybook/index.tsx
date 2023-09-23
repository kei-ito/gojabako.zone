import { storyGroups } from './all.mts';
import { StorybookNav } from './Nav';
import * as style from './style.module.scss';

interface StorybookProps {
  path: Array<string>;
}

export const Storybook = ({ path }: StorybookProps) => {
  path = path.slice();
  if (path.length === 1) {
    path.push('Default');
  }
  const story = getStory(path);
  return (
    <div className={style.container}>
      <StorybookNav currentPath={path.join('/')} />
      {!story && (
        <main>
          <p>Story not found</p>
        </main>
      )}
      {story?.render && <story.render />}
    </div>
  );
};

const getStory = (path: Array<string>) => {
  const group = storyGroups.get(path.slice(0, -1).join('/'));
  if (!group) {
    return null;
  }
  return group[path[path.length - 1]];
};
