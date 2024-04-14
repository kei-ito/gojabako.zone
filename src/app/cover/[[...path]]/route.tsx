/* eslint-disable max-lines-per-function */
import { notFound } from 'next/navigation';
import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';
import type { FontStyle, FontWeight } from '../../../util/fontFace.mts';
import {
  listLines,
  measureTextWidth,
} from '../../../util/measureTextWidth.mts';
import { pageList } from '../../../util/pageList.mts';
import { site } from '../../../util/site.mts';
import type { PageData } from '../../../util/type.mts';

interface FontOptions {
  data: ArrayBuffer;
  name: string;
  weight: FontWeight;
  style: FontStyle;
  lang?: string;
}

export const runtime = 'edge';
const size = { width: 1200, height: 630 };
const loadFont = async (
  url: URL,
  options: Omit<FontOptions, 'data'>,
): Promise<FontOptions> => {
  const res = await fetch(url);
  return { ...options, data: await res.arrayBuffer() };
};

export const GET = async (req: NextRequest) => {
  const pagePath = req.nextUrl.pathname.slice(6);
  const page = pageList.find((p) => p.path === pagePath);
  if (!page) {
    notFound();
  }
  return new ImageResponse(<ImageComponent page={page} />, {
    ...size,
    fonts: await Promise.all([
      loadFont(
        new URL('/fonts/noto-sans-jp/japanese-500-normal.woff', req.nextUrl),
        { name: 'Noto Sans JP', style: 'normal', weight: 500 },
      ),
    ]),
    // debug: true,
  });
};

const ImageComponent = ({ page }: { page: PageData }) => {
  const color = '#1e293b';
  const outerPadding = 36;
  const innerPadding = 24;
  const lineHeight = 1.4;
  const h1LineHeight = 1.2;
  const logoHeight = outerPadding * 2;
  const logoWidth = logoHeight * 2;
  const innerWidth = size.width - outerPadding * 2;
  const textWidth = innerWidth - innerPadding * 2;
  const titleLength = measureTextWidth(page.title.join(''));
  const baseFontSize = 32;
  const h1FontSize0 = Math.min((16 * textWidth) / titleLength, 60);
  let lineCount = 1;
  let h1AvailableHeight = size.height - outerPadding * 2;
  h1AvailableHeight -= logoHeight;
  h1AvailableHeight -= innerPadding + baseFontSize * lineHeight * 1.25 * 2;
  let h1FontSize = h1FontSize0;
  while (
    h1FontSize0 * lineCount < baseFontSize * 1.1 &&
    (lineCount + 1) * h1FontSize * h1LineHeight < h1AvailableHeight
  ) {
    lineCount += 1;
    h1FontSize = h1FontSize0 * lineCount;
  }
  h1FontSize *= 0.9;
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: outerPadding,
        color,
        backgroundColor: '#f1f5f9',
        fontFamily: 'Noto Sans JP',
        fontSize: baseFontSize,
        lineHeight,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: outerPadding,
          right: outerPadding,
          top: outerPadding,
          bottom: outerPadding + logoHeight,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: innerPadding,
          backgroundColor: '#ffffff',
          borderRadius: 8,
          boxShadow: '0 0 8px rgba(0, 0, 0, 0.25)',
        }}
      >
        <h1
          style={{
            alignSelf: 'stretch',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: h1FontSize,
            lineHeight: h1LineHeight,
          }}
        >
          {[...listLines(page.title, textWidth, h1FontSize / 16)].map(
            (line, index) => (
              <span key={index} style={{ whiteSpace: 'nowrap' }}>
                {line}
              </span>
            ),
          )}
        </h1>
        <div style={{ display: 'flex' }}>
          <span>
            <DateJP date={page.publishedAt} />
            に公開
          </span>
          {page.updatedAt !== page.publishedAt && (
            <span>
              （
              <DateJP date={page.updatedAt} />
              に更新）
            </span>
          )}
        </div>
        <div>{new URL(page.path, site.baseUrl).href}</div>
      </div>
      <svg
        viewBox={site.logo.viewBox.join(' ')}
        width={logoWidth}
        height={logoHeight}
        style={{ position: 'absolute', bottom: outerPadding / 2 }}
      >
        <path d={site.logo.d} fill={color} />
      </svg>
    </div>
  );
};

const DateJP = ({ date }: { date: string }) => {
  const d = new Date(date);
  let dateString = `${d.getFullYear()}年`;
  dateString += `${d.getMonth() + 1}月`;
  dateString += `${d.getDate()}日`;
  return <time dateTime={d.toISOString()}>{dateString}</time>;
};
