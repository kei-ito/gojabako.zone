import { metrics } from "@opentelemetry/api";
import { type ExportResult, ExportResultCode } from "@opentelemetry/core";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { Resource } from "@opentelemetry/resources";
import {
	type LogRecordExporter,
	LoggerProvider,
	type ReadableLogRecord,
	SimpleLogRecordProcessor,
} from "@opentelemetry/sdk-logs";
import {
	MeterProvider,
	PeriodicExportingMetricReader,
} from "@opentelemetry/sdk-metrics";
import { isNode } from "../env";
import { appAttributes } from "./env";
import { listOtelKeyValues, toOtelValue } from "./toOtelValue";

const workers = new Set<{ shutdown: () => Promise<void> }>();
if (isNode) {
	const gracefulShutdown = async () => {
		logger.emit({ body: "shutdown: otel" });
		await Promise.all([...workers].map((worker) => worker.shutdown()));
	};
	process.on("SIGINT", gracefulShutdown);
	process.on("SIGTERM", gracefulShutdown);
}

const getPayload = async (
	resource: Resource,
	scopeLogs: Array<ReadableLogRecord>,
) => {
	if (resource.waitForAsyncAttributes) {
		await resource.waitForAsyncAttributes();
	}
	return {
		resourceLogs: [
			{
				resource: {
					attributes: [...listOtelKeyValues(resource.attributes)],
				},
				scopeLogs: scopeLogs.map((log) => ({
					scope: {},
					logRecords: [
						{
							timeUnixNano: log.hrTime[0] * 1e9 + log.hrTime[1],
							severityNumber: log.severityNumber,
							severityText: log.severityText,
							body: toOtelValue(log.body),
							attributes: [...listOtelKeyValues(log.attributes)],
							droppedAttributesCount: log.droppedAttributesCount,
						},
					],
				})),
			},
		],
	};
};

class LogExporter implements LogRecordExporter {
	private readonly resource: Resource;

	private readonly endpoint?: URL;

	private readonly commonHeaders?: Headers;

	private readonly promises = new Set<Promise<void>>();

	public constructor(resource: Resource) {
		this.resource = resource;
		const { OTEL_EXPORTER_OTLP_LOGS_ENDPOINT, OTEL_EXPORTER_OTLP_HEADERS } =
			process.env;
		if (OTEL_EXPORTER_OTLP_LOGS_ENDPOINT && OTEL_EXPORTER_OTLP_HEADERS) {
			this.endpoint = new URL(OTEL_EXPORTER_OTLP_LOGS_ENDPOINT);
			const headers = new Headers();
			for (const match of OTEL_EXPORTER_OTLP_HEADERS.matchAll(
				/(\S+?)=(\S+?)\s*(?:,|$)/g,
			)) {
				headers.set(match[1], match[2]);
			}
			headers.set("content-type", "application/json");
			this.commonHeaders = headers;
		}
	}

	public export(
		logs: Array<ReadableLogRecord>,
		resultCallback: (result: ExportResult) => void,
	): void {
		const { endpoint, commonHeaders } = this;
		if (endpoint && commonHeaders) {
			const promise = getPayload(this.resource, logs)
				.then(async (payload) => {
					const body = JSON.stringify(payload);
					const headers = new Headers(commonHeaders);
					const res = await fetch(endpoint, { method: "POST", body, headers });
					if (res.ok) {
						resultCallback({ code: ExportResultCode.SUCCESS });
					} else {
						const fallback = "Failed to read response body";
						const message = await res.text().catch(() => fallback);
						resultCallback({
							code: ExportResultCode.FAILED,
							error: new Error(`${res.status} ${res.statusText}: ${message}`),
						});
					}
				})
				.catch((error) =>
					resultCallback({ code: ExportResultCode.FAILED, error }),
				)
				.finally(() => this.promises.delete(promise));
			this.promises.add(promise);
		} else {
			resultCallback({ code: ExportResultCode.SUCCESS });
		}
	}

	public async shutdown(): Promise<void> {
		await Promise.all([...this.promises]);
	}
}

const resource = new Resource(appAttributes);
const logExporter = new LogExporter(resource);
workers.add(logExporter);
const loggerProvider = new LoggerProvider({ resource, logRecordLimits: {} });
workers.add(loggerProvider);
loggerProvider.addLogRecordProcessor(new SimpleLogRecordProcessor(logExporter));
export const logger = loggerProvider.getLogger("app");

if (isNode) {
	const metricExporter = new OTLPMetricExporter();
	workers.add(metricExporter);
	const metricProvider = new MeterProvider({
		resource,
		readers: [
			new PeriodicExportingMetricReader({
				exporter: metricExporter,
				exportIntervalMillis: 60000,
			}),
		],
	});
	workers.add(metricProvider);
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
}

logger.emit({ body: "started: otel" });
