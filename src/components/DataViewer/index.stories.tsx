import { listCodePoints } from "@nlib/typing";
import type { StoryObj } from "@storybook/react";
import { StoryElement } from "../StoryElement";
import { DataViewer } from ".";

type Story = StoryObj<typeof DataViewer>;

const sampleBuffer = new Uint8Array(
	listCodePoints("Lorem ipsum dolor sit amet, consectetur adipiscing elit"),
);

export const Default: Story = {
	render: () => (
		<StoryElement.Gallery>
			<StoryElement.Heading>String</StoryElement.Heading>
			<DataViewer value="Sample String" />
			<StoryElement.Heading>Object</StoryElement.Heading>
			<DataViewer
				value={{
					number: 1,
					string: "2",
					true: true,
					null: null,
					undef: undefined,
					arr: [1, "2", true, null, undefined],
					obj: { a: 1, b: "2", c: true, d: null, e: undefined },
					date: new Date(),
					regexp: /^RegExp$/,
					error: new Error("Sample"),
					map: new Map([
						["a", 1],
						["b", 2],
					]),
					set: new Set([1, 2]),
					weakmap: new WeakMap(),
					weakset: new WeakSet(),
					arraybuffer: sampleBuffer.buffer,
					uint8array: sampleBuffer,
					"+infinity": Number.POSITIVE_INFINITY,
					"-infinity": Number.NEGATIVE_INFINITY,
					nan: Number.NaN,
				}}
			/>
		</StoryElement.Gallery>
	),
};
