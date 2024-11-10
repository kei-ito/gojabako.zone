//@ts-check
await Promise.all([
	import("@nlib/tsm").catch(() => {}),
	(async () => {
		// instrumentation
		const { readFileSync } = await import("node:fs");
		const { config } = await import("@dotenvx/dotenvx");
		const { ensure, isString } = await import("@nlib/typing");
		const { DiagConsoleLogger, DiagLogLevel, diag } = await import(
			"@opentelemetry/api"
		);
		const { OTLPMetricExporter } = await import(
			"@opentelemetry/exporter-metrics-otlp-http"
		);
		const { OTLPTraceExporter } = await import(
			"@opentelemetry/exporter-trace-otlp-http"
		);
		const { HttpInstrumentation } = await import(
			"@opentelemetry/instrumentation-http"
		);
		const { Resource } = await import("@opentelemetry/resources");
		const { PeriodicExportingMetricReader } = await import(
			"@opentelemetry/sdk-metrics"
		);
		const { NodeSDK } = await import("@opentelemetry/sdk-node");
		const { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } = await import(
			"@opentelemetry/semantic-conventions"
		);
		config();
		diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);
		const packageJson = ensure(
			JSON.parse(
				readFileSync(new URL("package.json", import.meta.url), "utf8"),
			),
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
			instrumentations: [new HttpInstrumentation()],
		});
		sdk.start();
	})(),
]);
