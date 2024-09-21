import { isFiniteNumber } from "@nlib/typing";
import { fetchWebPageMetaData } from "./fetchWebPageMetaData.mts";

interface VideoData {
  title: string;
  description: string;
  width: number;
  height: number;
  duration: string;
  watchUrl: URL;
}

export const fetchYouTubeVideoData = async (
  videoId: string,
): Promise<VideoData | null> => {
  const watchUrl = new URL("https://www.youtube.com/watch");
  watchUrl.searchParams.set("v", videoId);
  const data = await fetchWebPageMetaData(watchUrl);
  const get = (key: string) => {
    const list = data[key] ?? data[`og:${key}`] ?? data[`twitter:${key}`];
    return list?.[0];
  };
  const title = get("title");
  const description = get("description");
  const width = toNumber(get("width"));
  const height = toNumber(get("height"));
  const duration = get("description");
  if (title && description && width && height && duration) {
    return { title, description, width, height, duration, watchUrl };
  }
  return null;
};

const toNumber = (value: string | undefined): number | undefined => {
  if (value) {
    const n = Number(value);
    if (isFiniteNumber(n)) {
      return n;
    }
  }
  return undefined;
};
