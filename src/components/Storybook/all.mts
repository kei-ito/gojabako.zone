import type { StoryObj } from '@storybook/react';
import * as g1 from '../Button/index.stories';
import * as g2 from '../DataView/index.stories';
import * as g3 from '../StoryElement/index.stories';
type Stories = Record<string, StoryObj>;
export const storyGroups = new Map<string, Stories>();
storyGroups.set('Button', g1 as Stories);
storyGroups.set('DataView', g2 as Stories);
storyGroups.set('StoryElement', g3 as Stories);
