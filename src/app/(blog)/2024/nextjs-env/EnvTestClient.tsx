"use client";
import { useEffect, useState } from "react";
import { DataViewer } from "../../../../components/DataViewer";
import { getTestEnv } from "../../../../util/getTestEnv";

export const EnvTestClient = () => {
	const [value, setValue] = useState<Record<string, string | undefined>>({});
	useEffect(() => setValue(getTestEnv()), []);
	return <DataViewer value={value} />;
};
