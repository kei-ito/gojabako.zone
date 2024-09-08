import type { StoryObj } from "@storybook/react";
import { StoryElement } from "../StoryElement";
import { Toggle } from ".";

export const Default: StoryObj = {
  render: () => (
    <StoryElement.Gallery>
      <StoryElement.Heading>States</StoryElement.Heading>
      <StoryElement.Table
        columns={{ on: true, off: false }}
        rows={{ default: false, disabled: true }}
        render={({ column, row }) => <Toggle state={column} disabled={row} />}
      />
    </StoryElement.Gallery>
  ),
};
