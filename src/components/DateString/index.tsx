import {Date} from '../../global';

export const DateString = ({date: dateString}: {date: string}) => {
    const date = new Date(dateString);
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const dateTime = [
        `${y}`.padStart(4, '0'),
        `${m}`.padStart(2, '0'),
        `${d}`.padStart(2, '0'),
    ].join('-');
    return <time dateTime={dateTime}>{y}/{m}/{d}</time>;
};
