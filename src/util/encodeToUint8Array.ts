export const encodeToUint8Array = (input: Iterable<string>): Uint8Array => {
	const encoder = new TextEncoder();
	const chunks: Array<Uint8Array> = [];
	let byteLength = 0;
	for (const fragment of input) {
		const chunk = encoder.encode(fragment);
		chunks.push(chunk);
		byteLength += chunk.byteLength;
	}
	const concatened = new Uint8Array(byteLength);
	let offset = 0;
	for (const chunk of chunks) {
		concatened.set(chunk, offset);
		offset += chunk.byteLength;
	}
	return concatened;
};
