import type {FC} from 'react';
import {useEffect, useRef} from 'react';
import styled from 'styled-components';
import {isHTMLElement} from '../../../../packages/dom/isHTMLElement';
import {Number} from '../../../../packages/es/global';
import {onError} from '../../../../packages/es/onError';
import {getTwitterSDK} from '../../../util/getTwitterSDK';

interface EmbedProps {
    type: string,
}

export const Embed: FC<EmbedProps> = ({type, children}) => {
    return <Figure ref={useEmbed(type)} data-type={type}>{children}</Figure>;
};

const Figure = styled.figure`
    align-items: stretch;
    .twitter-tweet {
        margin-top: 0 !important;
        margin-bottom: 0 !important;
    }
    [data-type=youtube]>iframe {
        inline-size: 100%;
    }
`;

const useEmbed = (type: string) => {
    const ref = useRef<HTMLElement>(null);
    useEffect(() => {
        const {current: element} = ref;
        if (element) {
            processElement(type, element);
        }
    }, [type, ref]);
    return ref;
};

const processElement = (type: string, element: HTMLElement) => {
    switch (type) {
    case 'youtube': {
        const iframe = element.querySelector('iframe');
        if (iframe) {
            const width = element.getAttribute('width');
            const height = element.getAttribute('height');
            if (width && height) {
                element.style.blockSize = `calc(var(--baseWidth) * ${(Number(height) / Number(width)).toFixed(3)})`;
                element.removeAttribute('width');
                element.removeAttribute('height');
            }
        }
        break;
    }
    case 'twitter': {
        getTwitterSDK()
        .then((sdk) => {
            sdk.widgets.load(element);
            const {firstChild} = element;
            if (isHTMLElement(firstChild)) {
                firstChild.style.margin = '0';
            }
        })
        .catch(onError);
        break;
    }
    default:
    }
};
