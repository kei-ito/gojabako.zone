"use client";
import { useEffect, useMemo } from "react";
import { useHash } from "../use/Hash";

export const hashHitClassName = "hash-hit";

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
					behavior: "instant",
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
	const rect = element.getBoundingClientRect();
	return (
		rect.top < 0 ||
		innerHeight < rect.bottom ||
		rect.left < 0 ||
		innerWidth < rect.right
	);
};
