import type { StoryObj } from "@storybook/react";
import { StoryElement } from "../StoryElement";
import { CryptoKeyGenerator } from "./Generator";
import { CryptoKeyStore } from "./Store";
import { CryptoKeyView } from "./View";

const sampleKey: CryptoKey = {
	type: "secret",
	algorithm: { name: "ECDSA" },
	extractable: true,
	usages: ["encrypt", "decrypt"],
};

export const Default: StoryObj = {
	render: () => (
		<StoryElement.Gallery>
			<StoryElement.Heading>CryptoKeyStore</StoryElement.Heading>
			<CryptoKeyStore />
			<StoryElement.Heading>CryptoKeyGenerator</StoryElement.Heading>
			<CryptoKeyGenerator />
			<StoryElement.Heading>CryptoKeyView</StoryElement.Heading>
			<CryptoKeyView name="SampleKey" keyObject={sampleKey} />
		</StoryElement.Gallery>
	),
};
