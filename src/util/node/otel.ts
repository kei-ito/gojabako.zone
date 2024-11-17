import { DiagConsoleLogger, DiagLogLevel, diag } from "@opentelemetry/api";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { Resource } from "@opentelemetry/resources";
import {
	BatchLogRecordProcessor,
	LoggerProvider,
} from "@opentelemetry/sdk-logs";
import {
	ATTR_CLIENT_ADDRESS,
	ATTR_HTTP_REQUEST_METHOD,
	ATTR_URL_PATH,
	ATTR_URL_QUERY,
	ATTR_URL_SCHEME,
} from "@opentelemetry/semantic-conventions";
import {
	ATTR_SERVICE_NAME,
	ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";
import { site } from "../site";
import { appHost, appVersion, nodeEnv } from "../version";

const loggerName = "app-logger";
const resource = new Resource({
	[ATTR_SERVICE_NAME]: site.name,
	[ATTR_SERVICE_VERSION]: appVersion,
	"deployment.host": appHost,
	"deployment.environment": nodeEnv,
});
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

const logExporter = new OTLPLogExporter();
const loggerProvider = new LoggerProvider({ resource });
export const logger = loggerProvider.getLogger(loggerName);
loggerProvider.addLogRecordProcessor(new BatchLogRecordProcessor(logExporter));

const gracefulShutdown = async () => {
	await Promise.all([loggerProvider.shutdown(), logExporter.shutdown()]);
	diag.info("OpenTelemetry SDK stopped");
};
process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
diag.info("OpenTelemetry SDK started");

const ATTR_APP = (key: string) => `gjbkz.${key}`;
const ATTR_APP_REQ = (key: string) => ATTR_APP(`req.${key}`);
const ATTR_APP_REQ_MODE = ATTR_APP_REQ("mode");
const ATTR_APP_REQ_GEO = (key: string) => ATTR_APP_REQ(`geo.${key}`);
const ReqPrefix = "x-req-";
const GeoPrefix = "geo-";
const ReqNameMapping: Record<string, string> = {
	method: ATTR_HTTP_REQUEST_METHOD,
	mode: ATTR_APP_REQ_MODE,
	ip: ATTR_CLIENT_ADDRESS,
	"url-scheme": ATTR_URL_SCHEME,
	"url-pathname": ATTR_URL_PATH,
	"url-search": ATTR_URL_QUERY,
};
export const getAttributeKeyFromRequestHeaderName = (
	headerName: string,
): string | null => {
	if (headerName.startsWith(ReqPrefix)) {
		const name = headerName.slice(ReqPrefix.length);
		if (name.startsWith(GeoPrefix)) {
			return ATTR_APP_REQ_GEO(name.slice(GeoPrefix.length));
		}
		return ReqNameMapping[name] ?? null;
	}
	return null;
	// return ATTR_HTTP_REQUEST_HEADER(headerName);
};
