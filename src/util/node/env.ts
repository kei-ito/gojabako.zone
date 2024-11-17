import {
	ATTR_SERVICE_NAME,
	ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";
import { site } from "../site";
import { appVersion } from "../version";

export type AppHost = "vercel" | "netlify" | "gcp" | "aws" | "local";

const { env } = process;
const getEnv = (key: string, fallback = "n/a"): string => env[key] ?? fallback;
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
const listHostAttributes = function* (
	appHost: AppHost,
): Generator<[string, string]> {
	switch (appHost) {
		case "vercel":
			yield ["vercel.env", getEnv("VERCEL_ENV")];
			yield ["vercel.region", getEnv("VERCEL_REGION")];
			yield ["vercel.deployment_id", getEnv("VERCEL_DEPLOYMENT_ID")];
			break;
		case "netlify":
			yield ["build_id", getEnv("BUILD_ID")];
			yield ["context", getEnv("CONTEXT")];
			yield ["deploy_id", getEnv("DEPLOY_ID")];
			break;
		case "gcp":
			yield ["service", getEnv("K_SERVICE")];
			yield ["revision", getEnv("K_REVISION")];
			yield ["configuration", getEnv("K_CONFIGURATION")];
			yield ["cloud_run_job", getEnv("CLOUD_RUN_JOB")];
			yield ["cloud_run_execution", getEnv("CLOUD_RUN_EXECUTION")];
			break;
		case "aws":
			yield ["app_id", getEnv("AWS_APP_ID")];
			yield ["region", getEnv("AWS_REGION")];
			yield ["execution_env", getEnv("AWS_EXECUTION_ENV")];
			break;
		default:
	}
};

const listRuntimeAttributes = function* (
	appHost: AppHost,
): Generator<[string, string]> {
	yield ["app_host", appHost];
	yield ["node_env", getEnv("NODE_ENV", "development")];
	yield ["node_version", process.version];
	yield* listHostAttributes(appHost);
};

export const appAttributes: Record<string, string> = (() => {
	const namespace = "gjbkz";
	const attributes: Record<string, string> = {
		[ATTR_SERVICE_NAME]: site.name,
		[ATTR_SERVICE_VERSION]: appVersion,
	};
	for (const [key, value] of listRuntimeAttributes(getAppHost())) {
		attributes[`${namespace}.${key}`] = value;
	}
	return attributes;
})();
