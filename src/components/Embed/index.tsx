import type {PropsWithChildren} from 'react';
import {useEffect, useRef} from 'react';
import {MutationObserver, Number} from '../../global';
import {isHTMLElement} from '../../util/isHTMLElement';
import {className} from './style.module.css';

interface EmbedProps {
    type: string,
}

export const Embed = ({children}: PropsWithChildren<EmbedProps>) => {
    const ref = useRef<HTMLElement>(null);
    const {current: element} = ref;
    useEffect(() => {
        const observer = new MutationObserver((records) => {
            for (const record of records) {
                if (record.target === element) {
                    for (const node of record.addedNodes) {
                        if (isHTMLElement(node)) {
                            observer.observe(node, {
                                attributes: true,
                                attributeFilter: ['style'],
                            });
                        }
                    }
                }
            }
            if (element) {
                processElement(element);
            }
        });
        if (element) {
            observer.observe(element, {childList: true});
            processElement(element);
        }
        return () => {
            observer.disconnect();
        };
    }, [element]);
    return <figure ref={ref} className={className.embed}>{children}</figure>;
};

const processElement = (element: HTMLElement) => {
    const iframe = element.querySelector('iframe');
    if (!iframe) {
        return;
    }
    if (iframe.src.startsWith('https://www.youtube.com/')) {
        const width = iframe.getAttribute('width');
        const height = iframe.getAttribute('height');
        if (width && height) {
            element.style.paddingBlockStart = `calc(var(--baseWidth) * ${(Number(height) / Number(width)).toFixed(3)})`;
            iframe.removeAttribute('width');
            iframe.removeAttribute('height');
        }
    }
    const tweet = element.querySelector('.twitter-tweet');
    if (isHTMLElement(tweet)) {
        tweet.style.margin = '0';
    }
};
