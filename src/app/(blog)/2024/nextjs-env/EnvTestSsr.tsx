import { listEnvTestEntries } from "../../../../util/testEnv";
import { EnvTestData } from "./EnvTestData";
import { RefId } from "./refId";

export const EnvTestSsr = () => (
	<EnvTestData data={[...listEnvTestEntries()]} refId={RefId.server} />
);
