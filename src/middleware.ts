import { type NextRequest, NextResponse } from "next/server";
import { appHost } from "./util/env";
import { getOtelAttributesFromNextRequest } from "./util/otel/getOtelAttributesFromNextRequest";
import { otelLogger } from "./util/otel/otelLogger";

const proceed = (): NextResponse => {
	const response = NextResponse.next();
	response.headers.set("X-App-Host", appHost);
	return response;
};

interface Handler {
	isResponsibleFor: (request: NextRequest) => boolean;
	handle: (request: NextRequest) => NextResponse;
}

const handlers: Array<Handler> = [
	{
		isResponsibleFor: (request) => request.nextUrl.pathname === "/health",
		handle: () => new NextResponse(null, { status: 200 }),
	},
	{
		isResponsibleFor: ({ nextUrl: { pathname } }) =>
			[".php", ".exe", ".sh", ".bat"].some((v) => pathname.endsWith(v)) ||
			["/admin", "/debug"].some((v) => pathname.startsWith(v)),
		handle: () => new NextResponse(null, { status: 403 }),
	},
	{
		isResponsibleFor: ({ nextUrl: { pathname } }) =>
			pathname === "/favicon.ico",
		handle: (req) => NextResponse.redirect(new URL("/icon", req.nextUrl)),
	},
	{
		isResponsibleFor: ({ nextUrl: { pathname } }) =>
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
