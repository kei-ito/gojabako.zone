import type { Element } from 'hast';
import { fromHtml } from 'hast-util-from-html';
import { toString as hastToString } from 'hast-util-to-string';
import { EXIT } from 'unist-util-visit';
import { fetchYouTubeVideoData } from '../util/node/fetchYouTubeVideoData.mts';
import { visitHastElement } from './visitHastElement.mts';

export const embedYouTube = async function* (
  node: Element,
): AsyncGenerator<Element> {
  const result: Array<() => Promise<Element>> = [];
  visitHastElement(fromHtml(hastToString(node)), {
    iframe: (e) => {
      const videoId = getYouTubeVideoId(new URL(`${e.properties.src}`));
      if (!videoId) {
        throw new Error(`FailedToGetVideoId: ${e.properties.src}`);
      }
      result.push(async () => {
        const data = await fetchYouTubeVideoData(videoId);
        if (data) {
          delete e.properties.width;
          delete e.properties.height;
          e.properties.style = `aspect-ratio:${data.width}/${data.height};`;
        }
        e.position = node.position;
        return e;
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
