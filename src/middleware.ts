import { HttpStatusCode } from "@nlib/typing";
import { type NextRequest, NextResponse } from "next/server";
import { appHost } from "./util/env";
import { getOtelAttributesFromNextRequest } from "./util/otel/getOtelAttributesFromNextRequest";
import { otelLogger } from "./util/otel/otelLogger";
import { site } from "./util/site";

const proceed = (): NextResponse => {
	const response = NextResponse.next();
	if (appHost) {
		response.headers.set(site.headers.appHost, appHost);
	}
	return response;
};

interface Handler {
	isResponsibleFor: (request: NextRequest) => boolean;
	handle: (request: NextRequest) => NextResponse;
}

const handlers: Array<Handler> = [
	{
		isResponsibleFor: (request) => request.nextUrl.pathname === "/health",
		handle: () => new NextResponse("OK", { status: HttpStatusCode.OK }),
	},
	{
		isResponsibleFor: ({ nextUrl: { pathname } }) =>
			[".php", ".php7", ".exe", ".sh", ".bat"].some((v) =>
				pathname.endsWith(v),
			) ||
			["/admin", "/wp-admin", "/debug"].some((v) => pathname.startsWith(v)),
		handle: () => new NextResponse(null, { status: HttpStatusCode.Forbidden }),
	},
	{
		isResponsibleFor: ({ nextUrl: { pathname } }) =>
			pathname === "/favicon.ico",
		handle: (req) => NextResponse.redirect(new URL("/icon", req.nextUrl)),
	},
	{
		isResponsibleFor: ({ headers, nextUrl: { pathname } }) =>
			headers.get("sec-fetch-dest") === "empty" ||
			["/icon"].includes(pathname) ||
			["/_next/static", "/_next/image"].some((v) => pathname.startsWith(v)),
		handle: proceed,
	},
	{
		isResponsibleFor: () => true,
		handle: (request) => {
			logRequest(request);
			return proceed();
		},
	},
];

const logRequest = (request: NextRequest) => {
	otelLogger.emit({
		body: `${request.method} ${request.nextUrl.pathname}`,
		attributes: getOtelAttributesFromNextRequest(request),
	});
};

export const middleware = async (request: NextRequest) => {
	for (const handler of handlers) {
		if (handler.isResponsibleFor(request)) {
			return handler.handle(request);
		}
	}
	return NextResponse.rewrite(new URL("/not-found", request.nextUrl));
};
