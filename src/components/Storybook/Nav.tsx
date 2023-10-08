import { keys } from '@nlib/typing';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { classnames } from '../../util/classnames.mts';
import { storyGroups } from './all.mts';
import * as style from './style.module.scss';

interface StorybookNavProps {
  currentPath?: string;
}

export const StorybookNav = ({ currentPath = '' }: StorybookNavProps) => (
  <nav className={style.list}>{[...listItems(currentPath)]}</nav>
);

const listItems = function* (currentPath: string): Generator<ReactNode> {
  for (const [group, stories] of storyGroups) {
    const groupPath = group.split('_').join('/');
    for (const name of keys(stories)) {
      let storyPath = groupPath;
      if (name !== 'Default') {
        storyPath += `/${name}`;
      }
      const active = currentPath === storyPath;
      yield (
        <Link
          href={`/app/components/${storyPath}`}
          className={classnames(active && style.active)}
        >
          {storyPath}
        </Link>
      );
    }
  }
};
