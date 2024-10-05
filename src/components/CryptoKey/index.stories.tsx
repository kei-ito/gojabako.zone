import type { StoryObj } from "@storybook/react";
import { StoryView } from "../StoryView";
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
		<StoryView.Gallery>
			<StoryView.Heading>CryptoKeyStore</StoryView.Heading>
			<CryptoKeyStore />
			<StoryView.Heading>CryptoKeyGenerator</StoryView.Heading>
			<CryptoKeyGenerator />
			<StoryView.Heading>CryptoKeyView</StoryView.Heading>
			<CryptoKeyView name="SampleKey" keyObject={sampleKey} />
		</StoryView.Gallery>
	),
};
