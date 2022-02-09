export type Resolved<T> = T extends Promise<infer S> ? S : never;
