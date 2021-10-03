import {Array} from '../global';

export type ClassNameEntry = Array<ClassNameEntry> | string | false | null | undefined;

export const listClassNames = function* (entries: Array<ClassNameEntry>): Generator<string> {
    for (const entry of entries) {
        if (Array.isArray(entry)) {
            yield* listClassNames(entry);
        } else if (typeof entry === 'string') {
            for (const className of entry.split(/\s+/)) {
                if (className) {
                    yield className;
                }
            }
        }
    }
};

export const classnames = (...args: Array<ClassNameEntry>) => [
    ...listClassNames(args),
].join(' ');
