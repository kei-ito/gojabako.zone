/* eslint-disable no-undef, @nlib/no-globals */
import {useEffect, useState} from 'react';
import {clearInterval, globalThis, setInterval} from '../../../../packages/es/global';
import {PageTitle} from '../../../components/site/PageTitle';

const DeviceInspector = () => {
    const [, setCount] = useState(0);
    useEffect(() => {
        const timers = [setInterval(() => setCount((c) => c + 1), 500)];
        return () => {
            for (const timer of timers) {
                clearInterval(timer);
            }
        };
    }, []);
    return <main>
        <article>
            <PageTitle pathname="/app/device"/>
            <table>
                <tbody>
                    <tr><th>screen.width</th><td>{globalThis.screen.width}</td></tr>
                    <tr><th>screen.height</th><td>{globalThis.screen.height}</td></tr>
                    <tr><th>screen.availWidth</th><td>{globalThis.screen.availWidth}</td></tr>
                    <tr><th>screen.availHeight</th><td>{globalThis.screen.availHeight}</td></tr>
                    <tr><th>screenX</th><td>{globalThis.screenX}</td></tr>
                    <tr><th>screenY</th><td>{globalThis.screenY}</td></tr>
                    <tr><th>screenLeft</th><td>{globalThis.screenLeft}</td></tr>
                    <tr><th>screenTop</th><td>{globalThis.screenTop}</td></tr>
                    <tr><th>screen.colorDepth</th><td>{globalThis.screen.colorDepth}</td></tr>
                    <tr><th>screen.pixelDepth</th><td>{globalThis.screen.pixelDepth}</td></tr>
                    <tr><th>screen.orientation.type</th><td>{`${globalThis.screen.orientation.type}`}</td></tr>
                    <tr><th>screen.orientation.angle</th><td>{`${globalThis.screen.orientation.angle}`}</td></tr>
                    <tr><th>innerWidth</th><td>{globalThis.innerWidth}</td></tr>
                    <tr><th>innerHeight</th><td>{globalThis.innerHeight}</td></tr>
                    <tr><th>outerWidth</th><td>{globalThis.outerWidth}</td></tr>
                    <tr><th>outerHeight</th><td>{globalThis.outerHeight}</td></tr>
                </tbody>
            </table>
        </article>
    </main>;
};

export default DeviceInspector;
