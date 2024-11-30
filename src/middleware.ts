import { type NextRequest, NextResponse } from "next/server";
import { getOtelAttributesFromNextRequest } from "./util/otel/getOtelAttributesFromNextRequest";
import { otelLogger } from "./util/otel/otelLogger";

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
		handle: () => NextResponse.next(),
	},
	{
		isResponsibleFor: () => true,
		handle: (request) => {
			logRequest(request);
			return NextResponse.next();
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
