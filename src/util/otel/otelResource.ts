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
	const ns = site.namespace;
	yield [ATTR_SERVICE_NAME, site.name];
	yield [ATTR_SERVICE_VERSION, appVersion];
	yield [`${ns}.app_host`, appHost];
	yield [`${ns}.node_env`, env.NODE_ENV || env.VERCEL_ENV];
	yield [`${ns}.node_version`, process.version];
	yield [`${ns}.vercel.env`, env.VERCEL_ENV];
	yield [`${ns}.vercel.edge`, env.VERCEL_EDGE];
	yield [`${ns}.vercel.region`, env.VERCEL_REGION];
	yield [`${ns}.vercel.deployment_id`, env.VERCEL_DEPLOYMENT_ID];
	yield [`${ns}.netlify.build_id`, env.BUILD_ID];
	yield [`${ns}.netlify.context`, env.CONTEXT];
	yield [`${ns}.netlify.deploy_id`, env.DEPLOY_ID];
	yield [`${ns}.gcp.service`, env.K_SERVICE];
	yield [`${ns}.gcp.revision`, env.K_REVISION];
	yield [`${ns}.gcp.configuration`, env.K_CONFIGURATION];
	yield [`${ns}.gcp.cloud_run_job`, env.CLOUD_RUN_JOB];
	yield [`${ns}.gcp.cloud_run_execution`, env.CLOUD_RUN_EXECUTION];
	yield [`${ns}.aws.app_id`, env.AWS_APP_ID];
	yield [`${ns}.aws.region`, env.AWS_REGION];
	yield [`${ns}.aws.execution_env`, env.AWS_EXECUTION_ENV];
};

export const otelResource = new Resource(
	(() => {
		const attributes: Record<string, string> = {};
		for (const [key, value] of listRuntimeAttributes()) {
			if (isString(value)) {
				attributes[key] = value;
			}
		}
		return attributes;
	})(),
);
