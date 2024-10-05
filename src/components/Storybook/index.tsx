"use client";
import type { Story } from "@storybook/react";
import { StoryView } from "../StoryView";
import { StorybookNav } from "./Nav";
import { storyGroups } from "./all.ts";
import * as style from "./style.module.scss";

interface StorybookProps {
	path: Array<string>;
}

export const Storybook = ({ path }: StorybookProps) => {
	const story = getStory(path);
	return (
		<div className={style.container}>
			<StorybookNav currentPath={path.join("/")} />
			{!story && (
				<StoryView.Gallery>
					<p>メニューからコンポーネントを選択してください。</p>
				</StoryView.Gallery>
			)}
			{story?.render && <story.render />}
		</div>
	);
};

const getStory = (path: Array<string>) => {
	const group = storyGroups.get(path.join("/"));
	if (group) {
		for (const name of [path[path.length - 1], "Default"]) {
			const story = group[name] as Story | undefined;
			if (story) {
				return story;
			}
		}
	}
	return null;
};
