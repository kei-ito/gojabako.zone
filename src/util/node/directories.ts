export const rootDir = new URL("../../..", import.meta.url);
export const srcDir = new URL("src/", rootDir);
export const publicDir = new URL("public/", rootDir);
export const cacheDir = new URL(".cache/", rootDir);
export const appDir = new URL("app/", srcDir);
export const componentsDir = new URL("components/", srcDir);
export const brandIconDir = new URL("public/fa-6.6.0/brands/", rootDir);
