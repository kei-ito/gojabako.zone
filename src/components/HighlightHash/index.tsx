"use client";
import { useEffect, useMemo } from "react";
import { useHash } from "../use/Hash";

export const hashHitClassName = "hash-hit";

/**
 * 表示中のURLを監視し、ハッシュが変更された場合に該当する要素に対してhashHitClassNameを
 * 付与します。
 */
export const HighlightHash = () => {
	const [hash] = useHash();
	const targetElement = useMemo<HTMLElement | null>(() => {
		const id = decodeURIComponent(hash.replace(/^#/, ""));
		const target = id ? document.getElementById(id) : null;
		return target;
	}, [hash]);
	useEffect(() => {
		if (targetElement) {
			targetElement.classList.add(hashHitClassName);
		}
		return () => targetElement?.classList.remove(hashHitClassName);
	}, [targetElement]);
	return null;
};
