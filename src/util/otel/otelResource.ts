import { isString } from "@nlib/typing";
import { Resource } from "@opentelemetry/resources";
import {
	ATTR_SERVICE_NAME,
	ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";
import { appHost, env } from "../env";
import { site } from "../site";
import { appVersion } from "../version";

const listRuntimeAttributes = function* (): Generator<
	[string, string | undefined]
> {
	yield [ATTR_SERVICE_NAME, site.name];
	yield [ATTR_SERVICE_VERSION, appVersion];
	yield ["app_host", appHost];
	yield ["node_env", env.NODE_ENV];
	yield ["node_version", process.version];
	yield ["vercel.env", env.VERCEL_ENV];
	yield ["vercel.edge", env.VERCEL_EDGE];
	yield ["vercel.region", env.VERCEL_REGION];
	yield ["vercel.deployment_id", env.VERCEL_DEPLOYMENT_ID];
	yield ["netlify.build_id", env.BUILD_ID];
	yield ["netlify.context", env.CONTEXT];
	yield ["netlify.deploy_id", env.DEPLOY_ID];
	yield ["gcp.service", env.K_SERVICE];
	yield ["gcp.revision", env.K_REVISION];
	yield ["gcp.configuration", env.K_CONFIGURATION];
	yield ["gcp.cloud_run_job", env.CLOUD_RUN_JOB];
	yield ["gcp.cloud_run_execution", env.CLOUD_RUN_EXECUTION];
	yield ["aws.app_id", env.AWS_APP_ID];
	yield ["aws.region", env.AWS_REGION];
	yield ["aws.execution_env", env.AWS_EXECUTION_ENV];
};

export const otelResource = new Resource(
	(() => {
		const attributes: Record<string, string> = {};
		for (const [key, value] of listRuntimeAttributes()) {
			if (isString(value)) {
				attributes[`${site.namespace}.${key}`] = value;
			}
		}
		return attributes;
	})(),
);
