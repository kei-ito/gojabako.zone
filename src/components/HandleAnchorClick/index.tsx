"use client";
import { useEffect } from "react";
import { useHash } from "../use/Hash";

/**
 * clickイベントを監視してページ内リンクの場合はブラウザによる自動スクロールを抑制しつつ、
 * ハッシュを更新します。スクロールはHighLightHashが担当します。
 */
export const HandleAnchorClick = () => {
	const [, setHash] = useHash();
	useEffect(() => {
		const abc = new AbortController();
		addEventListener(
			"click",
			(event) => {
				const { target } = event;
				if (target instanceof Element) {
					const a = target.closest("a");
					if (a) {
						const url = new URL(a.href, location.href);
						if (isCurrentPageUrl(url)) {
							event.preventDefault();
							setHash(url.hash);
						}
					}
				}
			},
			{ signal: abc.signal },
		);
		return () => abc.abort();
	}, [setHash]);
	return null;
};

const isCurrentPageUrl = (url: URL): boolean =>
	url.href.startsWith(new URL("#", location.href).href);
