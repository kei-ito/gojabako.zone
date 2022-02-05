import * as process from 'process';
import {Promise} from '../es/global';
import {onError} from '../es/onError';

export const runScript = (fn: () => Promise<void> | void) => {
    Promise.resolve()
    .then(fn)
    .catch((error: unknown) => {
        onError(`argv: ${process.argv.slice(2)}`);
        onError(error);
        process.exit(1);
    });
};
