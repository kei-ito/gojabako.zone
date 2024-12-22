"use client";
import type { PropsWithChildren } from "react";
import { useEffect, useState } from "react";
import { DataViewer } from "../DataViewer";
import { FieldSet } from "../Form";
import * as css from "./style.module.css";

interface KeyViewProps {
	name: string;
	keyObject: CryptoKey;
	noExtract?: boolean;
}

export const CryptoKeyView = ({
	name,
	keyObject,
	children,
	noExtract,
}: PropsWithChildren<KeyViewProps>) => {
	const [jwk, setJwk] = useState<Error | JsonWebKey | null>(null);
	useEffect(() => {
		if (noExtract) {
			return;
		}
		Promise.resolve()
			.then(async () => {
				setJwk(await crypto.subtle.exportKey("jwk", keyObject));
			})
			.catch(setJwk);
	}, [noExtract, keyObject]);
	return (
		<FieldSet className={css.container}>
			<legend>{name}</legend>
			<DataViewer value={keyObject} className={css.data} />
			{children}
			{jwk && <DataViewer value={jwk} className={css.data} />}
		</FieldSet>
	);
};
