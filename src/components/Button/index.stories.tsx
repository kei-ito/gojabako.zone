import type { StoryObj } from '@storybook/react';
import { Button } from '.';

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  render: () => <Button>Button</Button>,
};
