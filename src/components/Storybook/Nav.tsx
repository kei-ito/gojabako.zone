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
    let active = currentPath.startsWith(groupPath);
    const storyNames = new Set<string>(keys(stories));
    storyNames.delete('Default');
    yield (
      <Link
        href={`/app/components/${groupPath}`}
        className={classnames(active && style.active)}
      >
        {groupPath}
      </Link>
    );
    if (active) {
      for (const name of storyNames) {
        const storyPath = `${groupPath}/${name}`;
        active = currentPath === storyPath;
        yield (
          <Link
            href={`/app/components/${groupPath}/${name}`}
            className={classnames(active && style.active)}
          >
            {name}
          </Link>
        );
      }
    }
  }
};
