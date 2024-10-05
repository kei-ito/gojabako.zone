import type { ValueOf } from "@nlib/typing";
import { listCodePoints } from "@nlib/typing";
import type { AtRule } from "postcss";
import { parse } from "postcss";
import { isInRange, normalizeRanges } from "./range.ts";

const fontStyles = {
  italic: "italic",
  normal: "normal",
} as const;
export type FontStyle = ValueOf<typeof fontStyles>;

const fontWeights = {
  100: 100,
  200: 200,
  300: 300,
  400: 400,
  500: 500,
  600: 600,
  700: 700,
  800: 800,
  900: 900,
} as const;
export type FontWeight = ValueOf<typeof fontWeights>;

const getWoffSrc = (src = "") => {
  for (const item of src.split(/\s*,\s*/)) {
    const format = /format\([\s'"]*(.*?)[\s'"]*\)/.exec(item);
    if (format && format[1] === "woff") {
      const url = /url\([\s'"]*(.*?)[\s'"]*\)/.exec(item);
      if (url) {
        return url[1];
      }
    }
  }
  return null;
};

export const parseFontFaceAtRule = (atRule: AtRule) => {
  const values: Record<string, string> = {};
  atRule.walkDecls((decl) => {
    switch (decl.prop) {
      case "font-style":
        values.fontStyle = decl.value;
        break;
      case "font-weight":
        values.fontWeight = decl.value;
        break;
      case "src":
        values.src = decl.value;
        break;
      case "unicode-range":
        values.unicodeRange = decl.value;
        break;
      default:
        break;
    }
  });
  const style = (fontStyles as Record<string, FontStyle | undefined>)[
    values.fontStyle
  ];
  const weight = (fontWeights as Record<string, FontWeight | undefined>)[
    values.fontWeight
  ];
  const src = getWoffSrc(values.src);
  if (!(style && weight && src)) {
    return null;
  }
  const unicodeRange = [
    ...normalizeRanges(
      (function* () {
        for (const match of (values.unicodeRange || "").matchAll(
          /U\+([0-9a-f]+)(-[0-9a-f]+)?/gi,
        )) {
          const from = Number.parseInt(match[1], 16);
          const to = match[2] ? Number.parseInt(match[2].slice(1), 16) : from;
          yield [from, to];
        }
      })(),
    ),
  ];
  if (!(0 < unicodeRange.length)) {
    return null;
  }
  return { style, weight, src, unicodeRange };
};

export type FontFace = Exclude<ReturnType<typeof parseFontFaceAtRule>, null>;

export const listFontFacesWoff = function* (
  cssString: string,
): Generator<FontFace> {
  for (const node of parse(cssString).nodes) {
    if (node.type === "atrule" && node.name === "font-face") {
      const fontFace = parseFontFaceAtRule(node);
      if (fontFace) {
        yield fontFace;
      }
    }
  }
};

export const listRequiredFontFaces = function* (
  fontFaces: Iterable<FontFace>,
  ...args: Array<string>
) {
  const characters = new Set([...listCodePoints(args.join(""))]);
  const yielded = new WeakSet<FontFace>();
  for (const fontFace of fontFaces) {
    for (const c of characters) {
      if (isInRange(fontFace.unicodeRange, c)) {
        if (!yielded.has(fontFace)) {
          yield fontFace;
          yielded.add(fontFace);
        }
        break;
      }
    }
  }
};
