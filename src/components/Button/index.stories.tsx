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
            default: undefined,
            hover: 'hover',
            active: 'active',
            focus: 'focus',
          } as const
        }
        render={({ column: Button, row }) => (
          <Button state={row}>Button</Button>
        )}
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
