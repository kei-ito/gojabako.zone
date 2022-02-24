import type {DetailedHTMLProps, TimeHTMLAttributes} from 'react';
import {Date} from '../../../../packages/es/global';

export interface DateStringProps extends DetailedHTMLProps<TimeHTMLAttributes<HTMLElement>, HTMLElement> {
    dateTime: string,
}

export const DateString = (props: DateStringProps) => {
    const date = new Date(props.dateTime);
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    return <time {...props}>{y}/{m}/{d}</time>;
};
