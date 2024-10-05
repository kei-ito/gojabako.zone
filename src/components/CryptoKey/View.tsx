"use client";
import type { PropsWithChildren } from "react";
import { useEffect, useState } from "react";
import { DataViewer } from "../DataViewer";
import { FieldSet } from "../Form";
import * as style from "./style.module.scss";

interface KeyViewProps {
	name: string;
	keyObject: CryptoKey;
}

export const CryptoKeyView = ({
	name,
	keyObject,
	children,
}: PropsWithChildren<KeyViewProps>) => {
	const [jwk, setJwk] = useState<Error | JsonWebKey | null>(null);
	useEffect(() => {
		Promise.resolve()
			.then(async () => {
				setJwk(await crypto.subtle.exportKey("jwk", keyObject));
			})
			.catch(setJwk);
	}, [keyObject]);
	return (
		<FieldSet className={style.container}>
			<legend>{name}</legend>
			<DataViewer value={keyObject} className={style.data} />
			{children}
			{jwk && <DataViewer value={jwk} className={style.data} />}
		</FieldSet>
	);
};
