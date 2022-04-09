import type {DetailedHTMLProps, PropsWithChildren, TimeHTMLAttributes} from 'react';
import {useMemo} from 'react';
import {Date} from '../../../../packages/es/global';

export interface DateStringProps extends DetailedHTMLProps<TimeHTMLAttributes<HTMLElement>, HTMLElement> {
    dateTime: string,
}

export const DateString = (props: PropsWithChildren<Omit<DateStringProps, 'ref'>>) => {
    const {dateTime} = props;
    const text = useMemo(() => {
        const date = new Date(dateTime);
        const y = date.getFullYear();
        const m = date.getMonth() + 1;
        const d = date.getDate();
        return `${y}/${m}/${d}`;
    }, [dateTime]);
    return <time {...props}>{text}</time>;
};
