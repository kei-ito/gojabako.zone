import type { Element } from 'hast';
import { fromHtml } from 'hast-util-from-html';
import { toString as hastToString } from 'hast-util-to-string';
import { EXIT } from 'unist-util-visit';
import { fetchYouTubeVideoData } from '../util/node/fetchYouTubeVideoData.mts';
import { createHastElement } from './createHastElement.mts';
import { visitHastElement } from './visitHastElement.mts';

export const embedYouTube = async function* (
  node: Element,
): AsyncGenerator<Element> {
  const result: Array<() => Promise<Element>> = [];
  visitHastElement(fromHtml(hastToString(node)), {
    iframe: (iframe) => {
      const videoId = getYouTubeVideoId(new URL(`${iframe.properties.src}`));
      if (!videoId) {
        throw new Error(`FailedToGetVideoId: ${iframe.properties.src}`);
      }
      result.push(async () => {
        const data = await fetchYouTubeVideoData(videoId);
        if (data) {
          delete iframe.properties.width;
          delete iframe.properties.height;
          iframe.properties.style = `aspect-ratio:${data.width}/${data.height};`;
        }
        iframe.position = node.position;
        const id = `youtube-${videoId}`;
        return createHastElement(
          'figure',
          { id, dataType: 'youtube' },
          createHastElement('span', { id, className: ['fragment-target'] }),
          createHastElement('a', {
            href: `#${id}`,
            className: ['fragment-ref'],
          }),
          data &&
            createHastElement(
              'figcaption',
              {},
              createHastElement(
                'a',
                { href: data.watchUrl.href, target: '_blank' },
                data.title,
              ),
            ),
          iframe,
        );
      });
      return EXIT;
    },
  });
  for (const fn of result) {
    yield await fn();
  }
};

const getYouTubeVideoId = (url: URL): string | null => {
  let videoId = url.searchParams.get('v');
  if (!videoId) {
    const matched = /\/(?:embed|v|youtu\.be)\/([^/]*)$/.exec(url.href);
    if (matched) {
      videoId = matched[1];
    }
  }
  return videoId;
};
