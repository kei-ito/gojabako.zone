import { config } from "@dotenvx/dotenvx";
import { DiagConsoleLogger, DiagLogLevel, diag } from "@opentelemetry/api";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { NodeSDK } from "@opentelemetry/sdk-node";
import {
	ATTR_SERVICE_NAME,
	ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";

config();
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);
const sdk = new NodeSDK({
	resource: new Resource({
		[ATTR_SERVICE_NAME]: process.env.npm_package_name ?? "",
		[ATTR_SERVICE_VERSION]: process.env.npm_package_version ?? "",
	}),
	traceExporter: new OTLPTraceExporter(),
	metricReader: new PeriodicExportingMetricReader({
		exporter: new OTLPMetricExporter(),
	}),
});
sdk.start();
diag.info("OpenTelemetry SDK started");

const gracefulShutdown = async () => {
	await sdk.shutdown();
	diag.info("OpenTelemetry SDK stopped");
};
process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
