import { isString } from "@nlib/typing";
import {
	ATTR_SERVICE_NAME,
	ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";
import { site } from "./site";
import { appVersion } from "./version";

const namespace = "gjbkz";
export type AppHost = "vercel" | "netlify" | "gcp" | "aws" | "local";

const getAppHost = () => {
	if (process.env.VERCEL) {
		return "vercel";
	}
	if (process.env.NETLIFY) {
		return "netlify";
	}
	if (process.env.K_SERVICE) {
		return "gcp";
	}
	if (process.env.AWS_APP_ID) {
		return "aws";
	}
	return "local";
};
const listRuntimeAttributes = function* (
	appHost: AppHost,
): Generator<[string, string | undefined]> {
	yield [ATTR_SERVICE_NAME, site.name];
	yield [ATTR_SERVICE_VERSION, appVersion];
	yield ["app_host", appHost];
	yield ["node_env", process.env.NODE_ENV];
	yield ["node_version", process.version];
	yield ["vercel.env", process.env.VERCEL_ENV];
	yield ["vercel.edge", process.env.VERCEL_EDGE];
	yield ["vercel.region", process.env.VERCEL_REGION];
	yield ["vercel.deployment_id", process.env.VERCEL_DEPLOYMENT_ID];
	yield ["netlify.build_id", process.env.BUILD_ID];
	yield ["netlify.context", process.env.CONTEXT];
	yield ["netlify.deploy_id", process.env.DEPLOY_ID];
	yield ["gcp.service", process.env.K_SERVICE];
	yield ["gcp.revision", process.env.K_REVISION];
	yield ["gcp.configuration", process.env.K_CONFIGURATION];
	yield ["gcp.cloud_run_job", process.env.CLOUD_RUN_JOB];
	yield ["gcp.cloud_run_execution", process.env.CLOUD_RUN_EXECUTION];
	yield ["aws.app_id", process.env.AWS_APP_ID];
	yield ["aws.region", process.env.AWS_REGION];
	yield ["aws.execution_env", process.env.AWS_EXECUTION_ENV];
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
