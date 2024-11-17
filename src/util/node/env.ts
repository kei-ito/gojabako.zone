import { isString } from "@nlib/typing";
import {
	ATTR_SERVICE_NAME,
	ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";
import { site } from "../site";
import { appVersion } from "../version";

const namespace = "gjbkz";
export type AppHost = "vercel" | "netlify" | "gcp" | "aws" | "local";

const { env } = process;
const getEnv = (key: string, fallback: string | null = null): string | null =>
	env[key] ?? fallback;
const getAppHost = () => {
	if (env.VERCEL) {
		return "vercel";
	}
	if (env.NETLIFY) {
		return "netlify";
	}
	if (env.K_SERVICE) {
		return "gcp";
	}
	if (env.AWS_APP_ID) {
		return "aws";
	}
	return "local";
};
const listRuntimeAttributes = function* (
	appHost: AppHost,
): Generator<[string, string | null]> {
	yield [ATTR_SERVICE_NAME, site.name];
	yield [ATTR_SERVICE_VERSION, appVersion];
	yield ["app_host", appHost];
	yield ["node_env", getEnv("NODE_ENV", "development")];
	yield ["node_version", process.version];
	yield ["vercel.env", getEnv("VERCEL_ENV")];
	yield ["vercel.edge", getEnv("VERCEL_EDGE")];
	yield ["vercel.region", getEnv("VERCEL_REGION")];
	yield ["vercel.deployment_id", getEnv("VERCEL_DEPLOYMENT_ID")];
	yield ["netlify.build_id", getEnv("BUILD_ID")];
	yield ["netlify.context", getEnv("CONTEXT")];
	yield ["netlify.deploy_id", getEnv("DEPLOY_ID")];
	yield ["gcp.service", getEnv("K_SERVICE")];
	yield ["gcp.revision", getEnv("K_REVISION")];
	yield ["gcp.configuration", getEnv("K_CONFIGURATION")];
	yield ["gcp.cloud_run_job", getEnv("CLOUD_RUN_JOB")];
	yield ["gcp.cloud_run_execution", getEnv("CLOUD_RUN_EXECUTION")];
	yield ["aws.app_id", getEnv("AWS_APP_ID")];
	yield ["aws.region", getEnv("AWS_REGION")];
	yield ["aws.execution_env", getEnv("AWS_EXECUTION_ENV")];
};
export const appAttributes: Record<string, string> = (() => {
	const attributes: Record<string, string> = {};
	for (const [key, value] of listRuntimeAttributes(getAppHost())) {
		if (isString(value)) {
			attributes[`${namespace}.${key}`] = value;
		}
	}
	return attributes;
})();
