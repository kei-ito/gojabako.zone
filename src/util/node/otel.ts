import { Resource } from "@opentelemetry/resources";
import {
	LoggerProvider,
	SimpleLogRecordProcessor,
} from "@opentelemetry/sdk-logs";
import { OtelLogExporter } from "../OtelLogExporter";
import { isNode } from "../env";
import { appAttributes } from "./appAttributes";

const workers = new Set<{ shutdown: () => Promise<void> }>();
if (isNode) {
	const gracefulShutdown = async () => {
		logger.emit({ body: "shutdown: otel" });
		await Promise.all([...workers].map((worker) => worker.shutdown()));
	};
	process.on("SIGINT", gracefulShutdown);
	process.on("SIGTERM", gracefulShutdown);
}

const resource = new Resource(appAttributes);
const logExporter = new OtelLogExporter(resource);
workers.add(logExporter);
const loggerProvider = new LoggerProvider({ resource, logRecordLimits: {} });
workers.add(loggerProvider);
loggerProvider.addLogRecordProcessor(new SimpleLogRecordProcessor(logExporter));
export const logger = loggerProvider.getLogger("app");
logger.emit({ body: "started: otel" });
