import { type ExportResult, ExportResultCode } from "@opentelemetry/core";
import type { Resource } from "@opentelemetry/resources";
import type {
	LogRecordExporter,
	ReadableLogRecord,
} from "@opentelemetry/sdk-logs";
import { listOtelKeyValues, toOtelValue } from "./toOtelValue";

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

export class OtelLogExporter implements LogRecordExporter {
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
				.catch((error) => {
					console.error(error);
					resultCallback({ code: ExportResultCode.FAILED, error });
				})
				.finally(() => this.promises.delete(promise));
			this.promises.add(promise);
		} else {
			for (const log of logs) {
				console.info(log.body, log.attributes);
			}
			resultCallback({ code: ExportResultCode.SUCCESS });
		}
	}

	public async shutdown(): Promise<void> {
		await Promise.all([...this.promises]);
	}
}
