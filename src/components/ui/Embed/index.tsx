import type {PropsWithChildren} from 'react';
import {useEffect, useRef} from 'react';
import {isHTMLElement} from '../../../../packages/dom/isHTMLElement';
import {Number} from '../../../../packages/es/global';
import {onError} from '../../../../packages/es/onError';
import {getTwitterSDK} from '../../../util/getTwitterSDK';
import {className} from './style.module.css';

interface EmbedProps {
    type: string,
}

export const Embed = ({type, children}: PropsWithChildren<EmbedProps>) => {
    return <figure ref={useEmbed(type)} className={className.embed} data-type={type}>
        {children}
    </figure>;
};

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

const processElement = (
    type: string,
    element: HTMLElement,
) => {
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
