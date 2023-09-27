import type { StoryObj } from '@storybook/react';
import * as g1 from '../Select/index.stories';
type Stories = Record<string, StoryObj>;
export const storyGroups = new Map<string, Stories>();
storyGroups.set('Select', g1 as Stories);
