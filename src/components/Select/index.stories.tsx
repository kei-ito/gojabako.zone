import type { StoryObj } from "@storybook/react";
import { Select } from ".";
import { StoryView } from "../StoryView";

export const Default: StoryObj = {
	render: () => (
		<StoryView.Gallery>
			<StoryView.Heading>{Select.name}</StoryView.Heading>
			<Select defaultValue="2">
				<option value="1">option1</option>
				<option value="2">option2</option>
				<option value="3">option3</option>
			</Select>
		</StoryView.Gallery>
	),
};
