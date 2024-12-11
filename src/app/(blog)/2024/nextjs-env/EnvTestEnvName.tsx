import style from "./style.module.scss";

interface EnvTestEnvNameProps {
	name: string;
	index: number;
}

const publicPrefix = "NEXT_PUBLIC_";

export const EnvTestEnvName = ({ name, index }: EnvTestEnvNameProps) => {
	const isPublic = name.startsWith(publicPrefix);
	let displayName = name.slice(isPublic ? publicPrefix.length : 0);
	displayName = displayName.replace(/EVTEST_/, "");
	return (
		<th title={name} className={style.firstColumn}>
			{`${index + 1}. `}
			{isPublic && <span className={style.public} />}
			{displayName}
		</th>
	);
};
