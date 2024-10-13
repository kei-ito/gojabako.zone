import { isString } from "@nlib/typing";
import type { ImageProps } from "next/image";
import Image from "next/image";

export const MdxImage = (props: ImageProps) => {
	const { src, style = {} } = props;
	if (!isString(src) && "width" in src && "height" in src) {
		style.inlineSize = `${src.width}px`;
		style.aspectRatio = `${src.width} / ${src.height}`;
	}
	return <Image {...props} alt={props.alt} style={style} />;
};
