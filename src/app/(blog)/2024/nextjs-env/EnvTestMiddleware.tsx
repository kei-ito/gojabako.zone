import { headers } from "next/headers";
import { DataViewer } from "../../../../components/DataViewer";

export const EnvTestMiddleware = async () => {
	const readonlyHeaders = await headers();
	const prefixList = ["X-EVTEST_", "X-NEXT_PUBLIC_EVTEST_"];
	const list: Array<[string, string]> = [];
	for (const [key, value] of readonlyHeaders) {
		const upperKey = key.toUpperCase();
		if (prefixList.some((prefix) => upperKey.startsWith(prefix))) {
			list.push([upperKey.slice(2), value]);
		}
	}
	list.sort(([a], [b]) => (a.endsWith("2") ? 1 : b.endsWith("2") ? -1 : 0));
	const result: Record<string, string> = {};
	for (const [key, value] of list) {
		result[key] = value;
	}
	return <DataViewer value={result} />;
};
