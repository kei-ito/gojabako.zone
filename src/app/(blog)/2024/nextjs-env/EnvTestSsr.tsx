import { DataViewer } from "../../../../components/DataViewer";
import { getTestEnv } from "../../../../util/getTestEnv";

export const EnvTestSsr = () => {
	return <DataViewer value={getTestEnv()} />;
};
