import type { StoryObj } from "@storybook/react";
import { Toggle } from ".";
import { StoryView } from "../StoryView";

export const Default: StoryObj = {
	render: () => (
		<StoryView.Gallery>
			<StoryView.Heading>{Toggle.name}</StoryView.Heading>
			<StoryView.Table
				columns={{ on: true, off: false }}
				rows={{ default: false, disabled: true }}
				render={({ column, row }) => <Toggle state={column} disabled={row} />}
			/>
		</StoryView.Gallery>
	),
};
