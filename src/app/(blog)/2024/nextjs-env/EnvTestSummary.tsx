import { listEnvTestEntries } from "../../../../util/testEnv";
import { EnvTestEnvName } from "./EnvTestEnvName";
import style from "./style.module.scss";

const allResult: Array<[string, Record<string, string>]> = [
	[
		"Cloud Run",
		{
			Middleware:
				"env,config,cloudrun,config,cloudrun,config,env,config,cloudrun,config,env,config,env,,,env,env,,env,,,env,env,",
			SSR: "env,config,cloudrun,config,cloudrun,config,env,config,cloudrun,config,env,config,env,,,env,env,,env,,,env,env,",
			"API Route":
				"env,config,cloudrun,config,cloudrun,config,env,config,cloudrun,config,env,config,env,,,env,env,,env,,,env,env,",
			Client:
				",config,,config,,config,env,config,,config,env,config,env,,,env,env,,env,,,env,env,",
		},
	],
	[
		"Amplify",
		{
			Middleware:
				"env,config,,config,env,config,env,config,amplify,config,amplify,config,env,,amplify,env,amplify,amplify,env,,amplify,env,amplify,amplify",
			SSR: "env,config,,config,env,config,env,config,amplify,config,amplify,config,env,,amplify,env,amplify,amplify,env,,amplify,env,amplify,amplify",
			"API Route":
				"env,config,,config,env,config,env,config,amplify,config,amplify,config,env,,amplify,env,amplify,amplify,env,,amplify,env,amplify,amplify",
			Client:
				",config,,config,,config,env,config,amplify,config,amplify,config,env,,amplify,env,amplify,amplify,env,,amplify,env,amplify,amplify",
		},
	],
	[
		"Netlify",
		{
			Middleware:
				",config,netlify,config,netlify,config,env,config,netlify,config,netlify,config,env,,netlify,env,netlify,netlify,env,,netlify,env,netlify,netlify",
			SSR: "env,config,netlify,config,netlify,config,env,config,netlify,config,netlify,config,env,,netlify,env,netlify,netlify,env,,netlify,env,netlify,netlify",
			"API Route":
				"env,config,netlify,config,netlify,config,env,config,netlify,config,netlify,config,env,,netlify,env,netlify,netlify,env,,netlify,env,netlify,netlify",
			Client:
				",config,,config,,config,env,config,netlify,config,netlify,config,env,,netlify,env,netlify,netlify,env,,netlify,env,netlify,netlify",
		},
	],
	[
		"Vercel",
		{
			Middleware:
				",config,vercel,config,vercel,config,env,config,vercel,config,vercel,config,env,,vercel,env,vercel,vercel,env,,vercel,env,vercel,vercel",
			SSR: "env,config,vercel,config,vercel,config,env,config,vercel,config,vercel,config,env,,vercel,env,vercel,vercel,env,,vercel,env,vercel,vercel",
			"API Route":
				"env,config,vercel,config,vercel,config,env,config,vercel,config,vercel,config,env,,vercel,env,vercel,vercel,env,,vercel,env,vercel,vercel",
			Client:
				",config,,config,,config,env,config,vercel,config,vercel,config,env,,vercel,env,vercel,vercel,env,,vercel,env,vercel,vercel",
		},
	],
];
const tableData: Array<Array<[number, string]>> = [
	...(function* () {
		const parserList = allResult.flatMap(([, result]) =>
			Object.values(result).map((v) => v.split(",")),
		);
		for (const _ of listEnvTestEntries()) {
			yield parserList.map<[number, string]>((p, i) => [i, p.shift() ?? ""]);
		}
	})(),
];

export const EnvTestSummary = () => {
	const id = "table-summary";
	return (
		<figure id={id} data-type="table">
			<figcaption>
				<span />
				<a href={`#${id}`} className="fragment-ref">
					#{id}
				</a>
			</figcaption>
			<div className={style.wrapper}>
				<table className={style.table}>
					<thead>
						<tr>
							<th rowSpan={2} className={style.firstColumn}>
								環境変数名
							</th>
							{allResult.map(([title, result]) => (
								<th key={title} colSpan={Object.keys(result).length}>
									{title}
								</th>
							))}
						</tr>
						<tr>
							{allResult.flatMap(([title, result]) =>
								Object.keys(result).map((c) => (
									<th key={`${title}-${c}`}>{c}</th>
								)),
							)}
						</tr>
					</thead>
					<tbody>
						{[...listEnvTestEntries()].map(([envName], i) => (
							<tr key={envName}>
								<EnvTestEnvName name={envName} index={i} />
								{tableData[i].map(([key, value]) => (
									<td key={`${envName}-${key}`} className={style.center}>
										{value}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</figure>
	);
};
