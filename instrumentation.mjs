//@ts-check
import "@nlib/tsm";
import { readFileSync } from "node:fs";
import { ensure, isString } from "@nlib/typing";
import { DiagConsoleLogger, DiagLogLevel, diag } from "@opentelemetry/api";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { NodeSDK } from "@opentelemetry/sdk-node";
import {
	ATTR_SERVICE_NAME,
	ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const packageJson = ensure(
	JSON.parse(readFileSync(new URL("package.json", import.meta.url), "utf8")),
	{ name: isString, version: isString },
);

const sdk = new NodeSDK({
	resource: new Resource({
		[ATTR_SERVICE_NAME]: packageJson.name,
		[ATTR_SERVICE_VERSION]: packageJson.version,
	}),
	traceExporter: new OTLPTraceExporter(),
	metricReader: new PeriodicExportingMetricReader({
		exporter: new OTLPMetricExporter(),
	}),
	instrumentations: [
		getNodeAutoInstrumentations({
			"@opentelemetry/instrumentation-fs": { enabled: false },
		}),
	],
});

sdk.start();
