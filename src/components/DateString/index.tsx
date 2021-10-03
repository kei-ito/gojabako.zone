export const DateString = ({date}: {date: Date}) => {
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const dateString = [
        `${y}`.padStart(4, '0'),
        `${m}`.padStart(2, '0'),
        `${d}`.padStart(2, '0'),
    ].join('-');
    return <time dateTime={dateString}>{y}/{m}/{d}</time>;
};
