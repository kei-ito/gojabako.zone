import { getHttpConfigurationFromEnvironment } from "@opentelemetry/otlp-exporter-base/build/esm/configuration/otlp-http-env-configuration";
import {
	LoggerProvider,
	SimpleLogRecordProcessor,
} from "@opentelemetry/sdk-logs";
import { OtelLogExporter } from "./OtelLogExporter";
import { otelResource } from "./otelResource";
import { otelWorkers } from "./otelWorkers";

const logExporter = new OtelLogExporter(
	getHttpConfigurationFromEnvironment("LOGS", "/v1/logs"),
);
otelWorkers.add(logExporter);

const loggerProvider = new LoggerProvider({
	resource: otelResource,
	logRecordLimits: {},
});
otelWorkers.add(loggerProvider);
loggerProvider.addLogRecordProcessor(new SimpleLogRecordProcessor(logExporter));
export const otelLogger = loggerProvider.getLogger("app");
otelLogger.emit({ body: "started: otel" });
