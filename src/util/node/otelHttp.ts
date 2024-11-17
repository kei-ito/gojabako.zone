import {
	ATTR_CLIENT_ADDRESS,
	ATTR_HTTP_REQUEST_METHOD,
	ATTR_URL_FULL,
	ATTR_URL_PATH,
	ATTR_URL_QUERY,
	ATTR_URL_SCHEME,
} from "@opentelemetry/semantic-conventions";

const ATTR_APP = (key: string) => `gjbkz.${key}`;
const ATTR_APP_REQ = (key: string) => ATTR_APP(`req.${key}`);
const ATTR_APP_REQ_MODE = ATTR_APP_REQ("mode");
const ATTR_APP_REQ_GEO = (key: string) => ATTR_APP_REQ(`geo.${key}`);
const ReqPrefix = "x-req-";
const GeoPrefix = "geo-";
const ReqNameMapping: Record<string, string> = {
	method: ATTR_HTTP_REQUEST_METHOD,
	mode: ATTR_APP_REQ_MODE,
	ip: ATTR_CLIENT_ADDRESS,
	"url-full": ATTR_URL_FULL,
	"url-scheme": ATTR_URL_SCHEME,
	"url-pathname": ATTR_URL_PATH,
	"url-search": ATTR_URL_QUERY,
};
const getAttributeKeyFromRequestHeaderName = (
	headerName: string,
): string | null => {
	if (headerName.startsWith(ReqPrefix)) {
		const name = headerName.slice(ReqPrefix.length);
		if (name.startsWith(GeoPrefix)) {
			return ATTR_APP_REQ_GEO(name.slice(GeoPrefix.length));
		}
		return ReqNameMapping[name] ?? null;
	}
	return null;
	// return ATTR_HTTP_REQUEST_HEADER(headerName);
};
export const getAttributesFromHeaders = (
	headers: Iterable<[string, string]>,
) => {
	const attributes: Record<string, string> = {};
	for (const [headerName, value] of headers) {
		const key = getAttributeKeyFromRequestHeaderName(headerName);
		if (key) {
			attributes[key] = value;
		}
	}
	return attributes;
};
