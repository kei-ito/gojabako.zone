import { entries, keys } from '@nlib/typing';
import Link from 'next/link';
import { classnames } from '../../util/classnames.mts';
import * as all from './all.mts';
import * as style from './style.module.scss';

interface StorybookNavProps {
  path: Array<string>;
}

export const StorybookNav = ({ path }: StorybookNavProps) => {
  const currentGroup = path.slice(0, -1).join('_');
  const currentStory = path[path.length - 1];
  return (
    <nav>
      <ul className={style.list}>
        {entries(all).map(([group, stories]) => {
          const groupPath = group.split('_').join('/');
          return (
            <li
              key={group}
              className={classnames(group === currentGroup && style.active)}
            >
              <span>{groupPath}</span>
              <ul>
                {keys(stories).map((name) => {
                  const href = `/stories/${groupPath}/${name}`;
                  return (
                    <li
                      key={name}
                      className={classnames(
                        name === currentStory && style.active,
                      )}
                    >
                      <Link href={href}>{name}</Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
