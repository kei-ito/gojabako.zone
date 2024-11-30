import { isNode } from "../env";

export const otelWorkers = new Set<{ shutdown: () => Promise<void> }>();

if (isNode) {
	const gracefulShutdown = () =>
		Promise.all([...otelWorkers].map((w) => w.shutdown()));
	process.on("SIGINT", gracefulShutdown);
	process.on("SIGTERM", gracefulShutdown);
}
