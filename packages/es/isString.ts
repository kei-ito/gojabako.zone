export const isString = (input: unknown): input is string => typeof input === 'string';
export const isDateString = (input: unknown): input is string => isString(input)
&& (/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d{3})?(?:Z|[+-]\d\d:\d\d)$/).test(input);
export const isUrlString = (input: unknown): input is string => isString(input)
&& (/^https?:\/\/(?:[\w-]+\.)+[\w-]{2,}(?:\/\S*)?$/).test(input);
