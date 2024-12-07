export const listTestEnvEntries = function* (): Generator<
	[string, string | undefined]
> {
	yield ["EVTEST_ENV", process.env.EVTEST_ENV];
	yield ["EVTEST_CNF", process.env.EVTEST_CNF];
	yield ["EVTEST_HST", process.env.EVTEST_HST];
	yield ["EVTEST_ENV_CNF", process.env.EVTEST_ENV_CNF];
	yield ["EVTEST_ENV_HST", process.env.EVTEST_ENV_HST];
	yield ["EVTEST_CNF_HST", process.env.EVTEST_CNF_HST];

	yield ["NEXT_PUBLIC_EVTEST_ENV", process.env.NEXT_PUBLIC_EVTEST_ENV];
	yield ["NEXT_PUBLIC_EVTEST_CNF", process.env.NEXT_PUBLIC_EVTEST_CNF];
	yield ["NEXT_PUBLIC_EVTEST_HST", process.env.NEXT_PUBLIC_EVTEST_HST];
	yield ["NEXT_PUBLIC_EVTEST_ENV_CNF", process.env.NEXT_PUBLIC_EVTEST_ENV_CNF];
	yield ["NEXT_PUBLIC_EVTEST_ENV_HST", process.env.NEXT_PUBLIC_EVTEST_ENV_HST];
	yield ["NEXT_PUBLIC_EVTEST_CNF_HST", process.env.NEXT_PUBLIC_EVTEST_CNF_HST];

	yield ["EVTEST_ENV2", process.env.EVTEST_ENV2];
	yield ["EVTEST_CNF2", process.env.EVTEST_CNF2];
	yield ["EVTEST_HST2", process.env.EVTEST_HST2];
	yield ["EVTEST_ENV_CNF2", process.env.EVTEST_ENV_CNF2];
	yield ["EVTEST_ENV_HST2", process.env.EVTEST_ENV_HST2];
	yield ["EVTEST_CNF_HST2", process.env.EVTEST_CNF_HST2];

	yield ["NEXT_PUBLIC_EVTEST_ENV2", process.env.NEXT_PUBLIC_EVTEST_ENV2];
	yield ["NEXT_PUBLIC_EVTEST_CNF2", process.env.NEXT_PUBLIC_EVTEST_CNF2];
	yield ["NEXT_PUBLIC_EVTEST_HST2", process.env.NEXT_PUBLIC_EVTEST_HST2];
	yield [
		"NEXT_PUBLIC_EVTEST_ENV_CNF2",
		process.env.NEXT_PUBLIC_EVTEST_ENV_CNF2,
	];
	yield [
		"NEXT_PUBLIC_EVTEST_ENV_HST2",
		process.env.NEXT_PUBLIC_EVTEST_ENV_HST2,
	];
	yield [
		"NEXT_PUBLIC_EVTEST_CNF_HST2",
		process.env.NEXT_PUBLIC_EVTEST_CNF_HST2,
	];
};

export const getTestEnv = (): Record<string, string | undefined> => {
	const result: Record<string, string | undefined> = {};
	for (const [key, value] of listTestEnvEntries()) {
		if (value) {
			result[key] = value;
		}
	}
	return result;
};
