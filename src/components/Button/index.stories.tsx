import type { StoryObj } from '@storybook/react';
import { StoryElement } from '../StoryElement';
import { PrimaryButton, SecondaryButton, TextButton } from '.';

const buttons = {
  Primary: PrimaryButton,
  Secondary: SecondaryButton,
  Text: TextButton,
};

export const Default: StoryObj = {
  render: () => (
    <StoryElement.Gallery>
      <StoryElement.Table
        title="state"
        columns={buttons}
        rows={
          {
            default: {},
            hover: { state: 'hover' },
            active: { state: 'active' },
            focus: { state: 'focus' },
            icon1: { icon: 'download' },
            icon2: { icon: 'downloading' },
          } as const
        }
        render={({ column: Button, row }) => <Button {...row}>Button</Button>}
      />
      <StoryElement.Table
        title="children"
        columns={buttons}
        rows={
          {
            Long: 'Lorem ipsum dolor sit amet',
            LongCJK: 'テキストが長いボタンは作らない',
          } as const
        }
        render={({ column: Button, row }) => <Button>{row}</Button>}
      />
    </StoryElement.Gallery>
  ),
};
