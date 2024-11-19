import { type ExportResult, ExportResultCode } from "@opentelemetry/core";
import type { OtlpHttpConfiguration } from "@opentelemetry/otlp-exporter-base/build/esm/configuration/otlp-http-configuration";
import type {
	LogRecordExporter,
	ReadableLogRecord,
} from "@opentelemetry/sdk-logs";
import { listOtelKeyValues, toOtelValue } from "./toOtelValue";

const getPayload = (scopeLogs: Array<ReadableLogRecord>) => {
	return {
		resourceLogs: [
			{
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
	private readonly endpoint?: URL;

	private readonly commonHeaders?: Headers;

	private readonly promises = new Set<Promise<void>>();

	public constructor({ url, headers }: Partial<OtlpHttpConfiguration>) {
		if (url && headers) {
			this.endpoint = new URL(url);
			const commonHeaders = new Headers(headers);
			commonHeaders.set("content-type", "application/json");
			this.commonHeaders = commonHeaders;
		} else {
			console.warn("missing otel exporter configurations", { url, headers });
		}
	}

	public export(
		logs: Array<ReadableLogRecord>,
		resultCallback: (result: ExportResult) => void,
	): void {
		const { endpoint, commonHeaders } = this;
		if (endpoint && commonHeaders) {
			const promise = Promise.resolve()
				.then(async () => {
					const body = JSON.stringify(getPayload(logs));
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
