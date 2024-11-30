import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Storybook } from "../../../../components/Storybook";

export const metadata: Metadata = {
	title: "Components",
	description: "このサイトを構成する部品の動作確認ページです。",
};

interface PageProps {
	params: Promise<{
		path?: Array<string>;
	}>;
}

export default async function Page(props: PageProps) {
	const { path = [] } = await props.params;
	if (path.length === 0) {
		redirect("/app/components/Button");
	}
	return <Storybook path={path} />;
}
