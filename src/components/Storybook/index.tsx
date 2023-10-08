import type { Story } from '@storybook/react';
import { StoryElement } from '../StoryElement';
import { storyGroups } from './all.mts';
import { StorybookNav } from './Nav';
import * as style from './style.module.scss';

interface StorybookProps {
  path: Array<string>;
}

export const Storybook = ({ path }: StorybookProps) => {
  const story = getStory(path);
  return (
    <div className={style.container}>
      <StorybookNav currentPath={path.join('/')} />
      {!story && (
        <StoryElement.Gallery>
          <p>Select a component from the menu.</p>
        </StoryElement.Gallery>
      )}
      {story?.render && <story.render />}
    </div>
  );
};

const getStory = (path: Array<string>) => {
  const group = storyGroups.get(path.join('/'));
  if (group) {
    for (const name of [path[path.length - 1], 'Default']) {
      const story = group[name] as Story | undefined;
      if (story) {
        return story;
      }
    }
  }
  return null;
};
