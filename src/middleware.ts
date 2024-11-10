import { type NextRequest, NextResponse } from "next/server";

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

export const middleware = async (req: NextRequest) => {
	const requestProps = new Map<string, string>();
	requestProps.set("method", req.method);
	requestProps.set("url-scheme", req.nextUrl.protocol.slice(0, -1));
	requestProps.set("url-pathname", req.nextUrl.pathname);
	requestProps.set("url-search", req.nextUrl.search);
	requestProps.set("ip", req.ip ?? "");
	requestProps.set("mode", req.mode);
	if (req.geo) {
		for (const [key, value] of Object.entries(req.geo)) {
			requestProps.set(`geo-${key}`, value);
		}
	}
	const response = NextResponse.next();
	for (const [key, value] of requestProps) {
		response.headers.set(`x-req-${key}`, value);
	}
	return response;
};
