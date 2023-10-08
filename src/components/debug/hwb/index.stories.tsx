import type { StoryObj } from '@storybook/react';
import type { CSSProperties } from 'react';
import { classnames } from '../../../util/classnames.mts';
import { StoryElement } from '../../StoryElement';
import * as style from './style.module.scss';

export const Default: StoryObj = {
  render: () => (
    <StoryElement.Gallery>
      <StoryElement.Heading>Light</StoryElement.Heading>
      <div className={classnames(style.table, style.light)}>
        {[...listColors()]}
      </div>
      <StoryElement.Heading>Dark</StoryElement.Heading>
      <div className={classnames(style.table, style.dark)}>
        {[...listColors()]}
      </div>
    </StoryElement.Gallery>
  ),
};

const listColors = function* () {
  for (const b of [0, 25, 50, 75, 100]) {
    for (const w of [0, 25, 50, 75, 100]) {
      const n = 12;
      for (let i = 0; i < n; i++) {
        const hwb = `${Math.floor((i / n) * 360)} ${w}% ${b}%`;
        const cellStyle = { '--gjColor': `hwb(${hwb})` };
        yield (
          <div key={`${w} ${b} ${i}`} style={cellStyle as CSSProperties}>
            {hwb}
          </div>
        );
      }
    }
  }
};
