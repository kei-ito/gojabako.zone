export const isServer = typeof window === "undefined";
export const isClient = !isServer;
export const isNode =
	typeof process !== "undefined" && Boolean(process.version);
export const env =
	(typeof process !== "undefined" && process.env) || ({} as NodeJS.ProcessEnv);
export const appHost = (() => {
	if (env.APP_HOST) {
		return env.APP_HOST;
	}
	if (env.VERCEL) {
		return "Vercel";
	}
	if (env.NETLIFY) {
		return "Netlify";
	}
	if (env.K_SERVICE) {
		return "GCP";
	}
	if (env.AWS_REGION) {
		return "AWS";
	}
	return "Unknown";
})();
