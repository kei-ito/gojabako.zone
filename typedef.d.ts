declare module "@storybook/react" {
	import type { StoryAnnotations } from "@storybook/csf";
	import type { ComponentType, ReactElement } from "react";

	interface ReactRenderer<P> {
		component: ComponentType<P>;
		storyResult: ReactElement<unknown>;
		canvasElement: HTMLElement;
	}

	export type Story<P = object> = StoryAnnotations<ReactRenderer<P>>;

	export type StoryObj<C = ComponentType> = C extends ComponentType<infer P>
		? Story<P>
		: never;
}
