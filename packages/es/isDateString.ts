import {isString} from '@nlib/typing';

export const isDateString = (input: unknown): input is string => isString(input)
&& (/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d{3})?(?:Z|[+-]\d\d:\d\d)$/).test(input);
