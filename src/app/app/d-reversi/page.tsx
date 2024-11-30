import type { Metadata } from "next";
import { Article } from "../../../components/Article";
import Readme from "./readme.mdx";

export const metadata: Metadata = {
	title: "分散型リバーシ",
	description: "マス目同士の通信でゲームが進行するリバーシです。",
	keywords: ["リバーシ", "オセロ", "ゲーム"],
};

export default function Page() {
	return (
		<main>
			<Article>
				<Readme />
			</Article>
		</main>
	);
}
