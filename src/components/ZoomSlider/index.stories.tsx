import type { StoryObj } from "@storybook/react";
import { StoryElement } from "../StoryElement";
import { ZoomSlider } from ".";

export const Default: StoryObj = {
  render: () => (
    <StoryElement.Gallery>
      <StoryElement.Heading>Value</StoryElement.Heading>
      <StoryElement.Rows
        rows={{ min: 0.01, mid: 1, max: 5 }}
        render={({ row }) => <ZoomSlider min={0.01} max={5} value={row} />}
      />
    </StoryElement.Gallery>
  ),
};
