import { HttpStatusCode } from "@nlib/typing";
import { type NextRequest, NextResponse } from "next/server";
import { appHost } from "./util/env";
import { getTestEnv, listTestEnvEntries } from "./util/getTestEnv";
import { getOtelAttributesFromNextRequest } from "./util/otel/getOtelAttributesFromNextRequest";
import { otelLogger } from "./util/otel/otelLogger";
import { site } from "./util/site";

console.info("TestEnv:middleware", getTestEnv());

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
			/\.php\d*$/.test(pathname) ||
			/^\/wp-\w+$/.test(pathname) ||
			[
				".exe",
				".sh",
				".bat",
				".pwd",
				".sql",
				".db",
				".yml",
				".key",
				".pem",
				".zip",
			].some((v) => pathname.endsWith(v)) ||
			[
				"/admin",
				"/debug",
				"/.aws",
				"/.ssh",
				"/.svn",
				"/.env",
				"/.git",
				"/.vscode",
				"/.kube",
				"/config",
				"/_vti_pvt",
			].some((v) => pathname.startsWith(v)),
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
			["/_next/static", "/_next/image", "/.netlify/verification"].some((v) =>
				pathname.startsWith(v),
			),
		handle: proceed,
	},
	{
		isResponsibleFor: ({ nextUrl: { pathname } }) => {
			return pathname === "/2024/nextjs-env";
		},
		handle: (request) => {
			logRequest(request);
			const res = proceed();
			for (const [key, value] of listTestEnvEntries()) {
				if (value) {
					res.headers.set(`X-${key}`, value);
				}
			}
			return res;
		},
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
