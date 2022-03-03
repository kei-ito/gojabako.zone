import type {FC, SVGProps} from 'react';

export const Logo: FC<Omit<SVGProps<SVGSVGElement>, 'viewBox'>> = (props) => <svg
    {...props}
    viewBox="0 0 8 4"
    aria-hidden="true"
>
    <path d="M0 0h2v1h-1v1h1v2h-2zM3 0h2v4h-2v-2h1v-1h-1zM6 0h2v4h-1v-1h-1z" stroke="none"/>
</svg>;
