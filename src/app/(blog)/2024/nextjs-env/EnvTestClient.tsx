"use client";
import { useEffect, useState } from "react";
import { listEnvTestEntries } from "../../../../util/testEnv";
import { EnvTestData } from "./EnvTestData";
import { RefId } from "./refId";

export const EnvTestClient = () => {
	const [data, setData] = useState<Array<[string, string | undefined]>>([]);
	useEffect(() => setData([...listEnvTestEntries()]), []);
	return <EnvTestData data={data} refId={RefId.client} />;
};
