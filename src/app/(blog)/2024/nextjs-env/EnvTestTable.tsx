"use client";
import { useCallback, useState } from "react";
import { classnames } from "../../../../util/classnames";
import { hasWindow } from "../../../../util/env";
import { gridArea } from "../../../../util/gridArea";
import { listEnvTestEntries } from "../../../../util/testEnv";
import { MathRef } from "./MathRef";
import style from "./style.module.css";

interface EnvTestResult {
	refId: string;
	data: Map<string, string | undefined>;
}

interface EnvTestTableProps {
	id: string;
}

export const EnvTestTable = ({ id }: EnvTestTableProps) => {
	const [result, setResult] = useState<Array<EnvTestResult>>([
		{ refId: "Ymiddle", data: new Map() },
		{ refId: "Yserver", data: new Map() },
		{ refId: "Yroute", data: new Map() },
		{ refId: "Yclient", data: new Map() },
	]);
	const getResult = useCallback(() => setResult([...listEnvTestResult()]), []);
	return (
		<>
			<figure id={id} data-type="table">
				<figcaption>
					<span />
					<a href={`#${id}`} className="fragment-ref">
						#{id}
					</a>
				</figcaption>
				<div className={style.wrapper}>
					<div className={style.table}>
						<div className={style.heading} style={gridArea(1, 1, 2, 3)}>
							<span>環境変数</span>
							<button
								type="button"
								onClick={getResult}
								className={style.button}
							>
								更新
							</button>
						</div>
						{result.map(({ refId }, i) => (
							<MathRef
								key={`heading-${refId}`}
								className={style.heading}
								style={gridArea(1, i + 3, 2, i + 4)}
								refId={refId}
							/>
						))}
						{[
							...(function* () {
								const startRow = 2;
								let i = 0;
								for (const [envName] of listEnvTestEntries()) {
									const row = startRow + i;
									yield (
										<div
											key={`no_${envName}`}
											className={classnames(style.heading, style.no)}
											style={gridArea(row, 1, row + 1, 2)}
										>
											{i + 1}
										</div>
									);
									yield (
										<div
											key={`name_${envName}`}
											className={classnames(style.heading, style.name)}
											style={gridArea(row, 2, row + 1, 3)}
										>
											{envName}
										</div>
									);
									let column = 3;
									for (const { refId, data } of result) {
										yield (
											<div
												key={`value_${refId}_${envName}`}
												style={gridArea(row, column, row + 1, column + 1)}
											>
												{data.get(envName) ?? ""}
											</div>
										);
										column += 1;
									}
									i += 1;
								}
							})(),
						]}
					</div>
				</div>
			</figure>
			<details>
				<summary>JSON</summary>
				<pre className={style.md}>
					{JSON.stringify(
						(() => {
							const keys = [...listEnvTestEntries()].map(([key]) => key);
							const output: Record<string, string> = {};
							for (const { refId, data } of result) {
								output[refId] = keys
									.map((key) => data.get(key) ?? "")
									.join(",");
							}
							return output;
						})(),
						null,
						2,
					)}
				</pre>
			</details>
		</>
	);
};

const listEnvTestResult = function* (): Generator<EnvTestResult> {
	if (hasWindow) {
		for (const pre of document.querySelectorAll(`.${style.data}`)) {
			if (pre instanceof HTMLElement) {
				const refId = pre.dataset.refId;
				if (refId) {
					yield { refId, data: new Map(parseData(pre.textContent ?? "")) };
				}
			}
		}
	}
};

const parseData = function* (data: string): Generator<[string, string]> {
	const Delimiter = "=";
	for (const line of data.split("\n")) {
		const delimiterIndex = line.indexOf(Delimiter);
		if (0 < delimiterIndex) {
			const key = line.slice(0, delimiterIndex).trim();
			const value = line.slice(delimiterIndex + Delimiter.length).trim();
			yield [key, value];
		}
	}
};
