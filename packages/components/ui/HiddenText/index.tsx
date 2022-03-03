import type {FC} from 'react';
import styled from 'styled-components';

export const HiddenText: FC = ({children}) => <Span>{children}</Span>;

const Span = styled.span`
    position: absolute;
    block-size: 1em;
    inline-size: 1em;
    overflow: hidden;
    opacity: 0;
`;
