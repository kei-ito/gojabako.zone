"use client";
import { useEffect, useMemo } from "react";
import { useHash } from "../use/Hash";

export const hashHitClassName = "hash-hit";

/**
 * 表示中のURLを監視し、ハッシュが変更された場合に該当する要素に対してhashHitClassNameを
 * 付与します。また、該当する要素が画面外にある場合はスクロールします。
 */
export const HighlightHash = () => {
	const [hash] = useHash();
	const targetElement = useMemo<HTMLElement | null>(() => {
		const id = decodeURIComponent(hash.replace(/^#/, ""));
		const target = id ? document.getElementById(id) : null;
		if (target?.classList.contains("fragment-target")) {
			return target.parentElement;
		}
		return target;
	}, [hash]);
	useEffect(() => {
		if (targetElement) {
			targetElement.classList.add(hashHitClassName);
			if (isNotInViewport(targetElement)) {
				targetElement.scrollIntoView({
					behavior: "smooth",
					block: "center",
					inline: "center",
				});
			}
		}
		return () => targetElement?.classList.remove(hashHitClassName);
	}, [targetElement]);
	return null;
};

const isNotInViewport = (element: HTMLElement) => {
	const { top, left, bottom, right } = element.getBoundingClientRect();
	return top < 0 || innerHeight < bottom || left < 0 || innerWidth < right;
};
