import style from "./style.module.scss";

interface EnvTestDataProps {
	data: Array<[string, string | undefined]>;
	refId: string;
}

export const EnvTestData = ({ data, refId }: EnvTestDataProps) => (
	<pre className={style.data} data-ref-id={refId}>
		{[
			...(function* () {
				for (const [k, v] of data) {
					yield `${k}=${v || ""}`;
				}
			})(),
		].join("\n")}
	</pre>
);
