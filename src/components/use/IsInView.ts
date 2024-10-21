import { useEffect, useState } from "react";
import { noop } from "../../util/noop";

export const useIsInView = (element: Element | null | undefined): boolean => {
	const [isIntersecting, setIsIntersecting] = useState<boolean>(false);
	useEffect(() => {
		if (!element) {
			return noop;
		}
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					setIsIntersecting(entry.isIntersecting);
				}
			},
			{ root: null },
		);
		observer.observe(element);
		return () => {
			observer.disconnect();
		};
	}, [element]);
	return isIntersecting;
};
