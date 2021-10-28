import {Date} from '../../../packages/es/global';

export const DateString = ({date: dateString}: {date: string}) => {
    const date = new Date(dateString);
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    return <time dateTime={dateString}>{y}/{m}/{d}</time>;
};
