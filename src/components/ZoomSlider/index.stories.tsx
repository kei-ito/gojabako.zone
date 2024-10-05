import type { StoryObj } from "@storybook/react";
import { ZoomSlider } from ".";
import { StoryView } from "../StoryView";

export const Default: StoryObj = {
	render: () => (
		<StoryView.Gallery>
			<StoryView.Heading>Value</StoryView.Heading>
			<StoryView.Rows
				rows={{ min: 0.01, mid: 1, max: 5 }}
				render={({ row }) => <ZoomSlider min={0.01} max={5} value={row} />}
			/>
		</StoryView.Gallery>
	),
};
