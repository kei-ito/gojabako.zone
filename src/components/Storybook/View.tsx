import type { Story } from '@storybook/react';
import * as style from './style.module.scss';

interface StorybookViewProps {
  story: Story;
}

export const StorybookView = ({ story }: StorybookViewProps) => (
  <div className={style.body}>{story.render && <story.render />}</div>
);
