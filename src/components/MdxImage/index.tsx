import type { ImageProps } from "next/image";
import Image from "next/image";

export const MdxImage = (props: ImageProps) => (
	<Image {...props} alt={props.alt} />
);
