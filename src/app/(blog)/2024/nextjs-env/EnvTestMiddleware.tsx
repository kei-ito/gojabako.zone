import { headers } from "next/headers";
import { EnvTestCsvHeader, parseEnvTestCsv } from "../../../../util/testEnv";
import { EnvTestData } from "./EnvTestData";

export const EnvTestMiddleware = async () => (
	<EnvTestData
		data={[...parseEnvTestCsv((await headers()).get(EnvTestCsvHeader) ?? "")]}
		columnName="Middleware"
	/>
);
