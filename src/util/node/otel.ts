import {
	DiagConsoleLogger,
	DiagLogLevel,
	diag,
	metrics,
} from "@opentelemetry/api";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { Resource } from "@opentelemetry/resources";
import {
	BatchLogRecordProcessor,
	LoggerProvider,
} from "@opentelemetry/sdk-logs";
import {
	MeterProvider,
	PeriodicExportingMetricReader,
} from "@opentelemetry/sdk-metrics";
import { appAttributes } from "./env";

const resource = new Resource(appAttributes);
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
const logExporter = new OTLPLogExporter();
const loggerProvider = new LoggerProvider({ resource });
loggerProvider.addLogRecordProcessor(new BatchLogRecordProcessor(logExporter));
export const logger = loggerProvider.getLogger("app");

const metricExporter = new OTLPMetricExporter();
const metricProvider = new MeterProvider({
	resource,
	readers: [
		new PeriodicExportingMetricReader({
			exporter: metricExporter,
			exportIntervalMillis: 60000,
		}),
	],
});
metrics.setGlobalMeterProvider(metricProvider);
const meter = metrics.getMeter("runtime");
const cpuUsageGauge = meter.createObservableGauge("process_cpu_usage", {
	description: "CPU usage of the Node.js process",
	unit: "microseconds",
});
cpuUsageGauge.addCallback((observableResult) => {
	const usage = process.cpuUsage();
	console.log(usage);
	type Type = keyof typeof usage;
	for (const type of Object.keys(usage)) {
		observableResult.observe(usage[type as Type], { type });
	}
});
const memoryUsageGauge = meter.createObservableGauge("process_memory_usage", {
	description: "Memory usage of the Node.js process",
	unit: "MiB",
});
memoryUsageGauge.addCallback((observableResult) => {
	const usage = process.memoryUsage();
	type Type = keyof typeof usage;
	const unit = 1024 * 1024;
	for (const type of Object.keys(usage)) {
		observableResult.observe(usage[type as Type] / unit, { type });
	}
});
const uptimeGauge = meter.createObservableGauge("process_uptime", {
	description: "Uptime of the Node.js process",
	unit: "seconds",
});
uptimeGauge.addCallback((observableResult) => {
	observableResult.observe(process.uptime());
});

const gracefulShutdown = async () => {
	logger.emit({ body: "shutdown: otel" });
	await Promise.all([
		loggerProvider.shutdown(),
		logExporter.shutdown(),
		metricProvider.shutdown(),
		metricExporter.shutdown(),
	]);
	diag.info("shutdown: otel");
};
process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

logger.emit({ body: "started: otel" });
diag.info("started: otel", appAttributes);
