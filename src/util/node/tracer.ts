import {
	DiagConsoleLogger,
	DiagLogLevel,
	diag,
	metrics,
	trace,
} from "@opentelemetry/api";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import {
	MeterProvider,
	PeriodicExportingMetricReader,
} from "@opentelemetry/sdk-metrics";
import {
	BasicTracerProvider,
	BatchSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import {
	ATTR_SERVICE_NAME,
	ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";

const tracerName = "app-tracer";
const meterName = "app-meter";
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

const resource = new Resource({
	[ATTR_SERVICE_NAME]: process.env.npm_package_name ?? "",
	[ATTR_SERVICE_VERSION]: process.env.npm_package_version ?? "",
});
const tracerProvider = new BasicTracerProvider({ resource });
const traceExporter = new OTLPTraceExporter();
tracerProvider.addSpanProcessor(new BatchSpanProcessor(traceExporter));
tracerProvider.register();

const metricExporter = new OTLPMetricExporter();
const metricProvider = new MeterProvider({
	resource,
	readers: [new PeriodicExportingMetricReader({ exporter: metricExporter })],
});

const gracefulShutdown = async () => {
	await Promise.all([
		tracerProvider.shutdown(),
		traceExporter.shutdown(),
		metricProvider.shutdown(),
		metricExporter.shutdown(),
	]);
	diag.info("OpenTelemetry SDK stopped");
};
process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

diag.info("OpenTelemetry SDK started");

export const tracer = trace.getTracer(tracerName);
export const meter = metrics.getMeter(meterName);
