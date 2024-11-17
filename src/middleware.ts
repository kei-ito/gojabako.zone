import {
	ATTR_CLIENT_ADDRESS,
	ATTR_HTTP_REQUEST_METHOD,
	ATTR_URL_FULL,
	ATTR_URL_PATH,
	ATTR_URL_QUERY,
	ATTR_URL_SCHEME,
} from "@opentelemetry/semantic-conventions";
import { type NextRequest, NextResponse } from "next/server";
import { logger } from "./util/node/otel";

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

const NA = "n/a";
const ATTR_APP = (key: string) => `gjbkz.${key}`;
const ATTR_APP_REQ = (key: string) => ATTR_APP(`req.${key}`);
const ATTR_APP_REQ_GEO = (key: string) => ATTR_APP_REQ(`geo.${key}`);

export const middleware = async (req: NextRequest) => {
	const attributes: Record<string, string> = {
		[ATTR_CLIENT_ADDRESS]: req.ip ?? NA,
		[ATTR_HTTP_REQUEST_METHOD]: req.method,
		[ATTR_URL_FULL]: req.nextUrl.href,
		[ATTR_URL_PATH]: req.nextUrl.pathname,
		[ATTR_URL_QUERY]: req.nextUrl.search,
		[ATTR_URL_SCHEME]: req.nextUrl.protocol.slice(0, -1),
		[ATTR_APP_REQ("mode")]: req.mode,
		[ATTR_APP_REQ("referer")]: req.referrer ?? NA,
	};
	if (req.geo) {
		for (const [key, value] of Object.entries(req.geo)) {
			attributes[ATTR_APP_REQ_GEO(key)] = value;
		}
	}
	logger.emit({ body: `${req.method} ${req.nextUrl}`, attributes });
	return NextResponse.next();
};
