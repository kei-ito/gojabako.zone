export const isServer = typeof window === "undefined";
export const isClient = !isServer;
export const isNode =
	typeof process !== "undefined" && Boolean(process.version);
export const env =
	(typeof process !== "undefined" && process.env) || ({} as NodeJS.ProcessEnv);
export const appHost = (() => {
	if (env.VERCEL) {
		return "vercel" as const;
	}
	if (env.NETLIFY) {
		return "netlify" as const;
	}
	if (env.K_SERVICE) {
		return "gcp" as const;
	}
	if (env.AWS_REGION) {
		return "aws" as const;
	}
	return "local" as const;
})();
