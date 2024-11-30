import {
	ATTR_HTTP_REQUEST_METHOD,
	ATTR_SERVER_ADDRESS,
	ATTR_SERVER_PORT,
	ATTR_URL_FULL,
	ATTR_URL_PATH,
	ATTR_URL_QUERY,
	ATTR_URL_SCHEME,
} from "@opentelemetry/semantic-conventions";
import type { NextRequest } from "next/server";
import { site } from "../site";

const NA = "n/a";
const ATTR_APP = (key: string) => `${site.namespace}.${key}`;
const ATTR_APP_REQ = (key: string) => ATTR_APP(`req.${key}`);

export const getOtelAttributesFromNextRequest = (request: NextRequest) => {
	const attributes: Record<string, string> = {
		[ATTR_HTTP_REQUEST_METHOD]: request.method,
		[ATTR_SERVER_ADDRESS]: request.nextUrl.hostname,
		[ATTR_SERVER_PORT]: request.nextUrl.port ?? NA,
		[ATTR_URL_FULL]: request.nextUrl.href,
		[ATTR_URL_PATH]: request.nextUrl.pathname,
		[ATTR_URL_QUERY]: request.nextUrl.search,
		[ATTR_URL_SCHEME]: request.nextUrl.protocol.slice(0, -1),
		[ATTR_APP_REQ("mode")]: request.mode,
		[ATTR_APP_REQ("referer")]: request.referrer ?? NA,
		[ATTR_APP_REQ("user_agent")]: request.headers.get("user-agent") ?? NA,
	};
	return attributes;
};
