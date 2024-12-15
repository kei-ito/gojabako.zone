export const gridArea = (
	gridRowStart: number,
	gridColumnStart: number,
	gridRowEnd: number,
	gridColumnEnd: number,
) => ({
	gridArea: [gridRowStart, gridColumnStart, gridRowEnd, gridColumnEnd].join(
		"/",
	),
});
